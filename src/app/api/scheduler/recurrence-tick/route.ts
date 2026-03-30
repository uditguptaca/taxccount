import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getNextOccurrence, makeOccurrenceKey } from '@/lib/recurrence';

/**
 * POST /api/scheduler/recurrence-tick
 * Internal scheduler endpoint that generates next occurrences for active recurrence schedules.
 * Must be idempotent — re-running will not create duplicate engagements.
 */
export async function POST() {
  try {
    const db = getDb();
    const now = new Date();
    const nowStr = now.toISOString();
    const horizonDate = new Date(now.getTime() + 90 * 86400000); // 90-day horizon

    // Get all active schedules where next_occurrence_date is within the horizon
    const schedules = db.prepare(`
      SELECT ers.*, ct.name as template_name, ct.version as template_version,
        c.display_name as client_name,
        cc.financial_year, cc.price, cc.priority
      FROM engagement_recurrence_schedules ers
      JOIN compliance_templates ct ON ers.template_id = ct.id
      JOIN clients c ON ers.client_id = c.id
      JOIN client_compliances cc ON ers.source_engagement_id = cc.id
      WHERE ers.is_active = 1 AND ers.next_occurrence_date <= ?
    `).all(horizonDate.toISOString()) as any[];

    const results: any[] = [];

    for (const schedule of schedules) {
      const nextDate = new Date(schedule.next_occurrence_date);
      
      // Only generate for future dates
      if (nextDate <= now) {
        // This date has already passed, advance to next
        const futureDate = getNextOccurrence(schedule.rrule, schedule.dtstart, nowStr);
        if (futureDate) {
          db.prepare(`UPDATE engagement_recurrence_schedules SET next_occurrence_date = ?, updated_at = ? WHERE id = ?`)
            .run(futureDate.toISOString().split('T')[0], nowStr, schedule.id);
        }
        continue;
      }

      // Check for until_date / occurrence_count
      if (schedule.until_date && nextDate > new Date(schedule.until_date)) {
        db.prepare(`UPDATE engagement_recurrence_schedules SET is_active = 0, updated_at = ? WHERE id = ?`)
          .run(nowStr, schedule.id);
        continue;
      }

      // Idempotency check
      const occurrenceKey = makeOccurrenceKey(schedule.id, nextDate);
      const existing = db.prepare(`SELECT id FROM client_compliances WHERE occurrence_key = ?`).get(occurrenceKey);
      if (existing) {
        // Already generated, advance schedule
        const next = getNextOccurrence(schedule.rrule, schedule.dtstart, nextDate.toISOString());
        if (next) {
          db.prepare(`UPDATE engagement_recurrence_schedules SET next_occurrence_date = ?, last_generated_date = ?, updated_at = ? WHERE id = ?`)
            .run(next.toISOString().split('T')[0], nowStr, nowStr, schedule.id);
        }
        continue;
      }

      // === GENERATE NEW ENGAGEMENT ===
      const engId = uuidv4();
      const year = nextDate.getFullYear().toString();
      const lastEng = db.prepare(`SELECT COUNT(*) as count FROM client_compliances`).get() as any;
      const engCode = `ENG-${year}-${String((lastEng?.count || 0) + 1).padStart(4, '0')}`;
      const dueDate = nextDate.toISOString().split('T')[0];

      // Check assignee is still active
      let effectiveAssigneeId = schedule.assignee_id;
      const effectiveAssigneeType = schedule.assignee_type;
      if (effectiveAssigneeType === 'member' && effectiveAssigneeId) {
        const user = db.prepare(`SELECT is_active FROM users WHERE id = ?`).get(effectiveAssigneeId) as any;
        if (!user?.is_active) {
          // Fallback to firm owner (super_admin)
          const owner = db.prepare(`SELECT id FROM users WHERE role = 'super_admin' AND is_active = 1 LIMIT 1`).get() as any;
          effectiveAssigneeId = owner?.id || effectiveAssigneeId;
          // Create alert
          db.prepare(`INSERT INTO inbox_items (id, user_id, item_type, title, message, created_at) VALUES (?,?,?,?,?,?)`)
            .run(uuidv4(), effectiveAssigneeId, 'alert',
              'Recurring engagement reassigned',
              `The recurring engagement ${engCode} was reassigned because the original assignee is inactive.`,
              nowStr);
        }
      }

      const admin = db.prepare(`SELECT id FROM users WHERE role IN ('super_admin','admin') LIMIT 1`).get() as any;
      const createdBy = admin?.id || 'system';

      db.prepare(`
        INSERT INTO client_compliances (
          id, engagement_code, client_id, template_id, financial_year, period_label,
          due_date, price, status, client_facing_status, priority,
          assigned_team_id, assignee_type, assignee_id,
          template_version_at_creation, recurrence_schedule_id, occurrence_key,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', 'future', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        engId, engCode, schedule.client_id, schedule.template_id,
        year, `FY ${year}`, dueDate, schedule.price || 0, schedule.priority || 'medium',
        effectiveAssigneeType === 'team' ? effectiveAssigneeId : null,
        effectiveAssigneeType, effectiveAssigneeId,
        schedule.template_version, schedule.id, occurrenceKey,
        createdBy, nowStr, nowStr
      );

      // Copy stages from template
      const stages = db.prepare(`
        SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order
      `).all(schedule.template_id) as any[];

      for (const stage of stages) {
        db.prepare(`
          INSERT INTO client_compliance_stages (id, engagement_id, template_stage_id, stage_name, stage_code, sequence_order, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
        `).run(uuidv4(), engId, stage.id, stage.stage_name, stage.stage_code, stage.sequence_order, nowStr, nowStr);
      }

      // Copy engagement reminder rules from source engagement
      const sourceRules = db.prepare(`
        SELECT * FROM engagement_reminder_rules WHERE engagement_id = ?
      `).all(schedule.source_engagement_id) as any[];

      for (const rule of sourceRules) {
        db.prepare(`
          INSERT INTO engagement_reminder_rules (id, engagement_id, offset_value, offset_unit, channel, recipient_scope, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), engId, rule.offset_value, rule.offset_unit, rule.channel, rule.recipient_scope, nowStr);

        // Generate reminder instances
        const offsetMs = rule.offset_unit === 'weeks' ? rule.offset_value * 7 * 86400000 : rule.offset_value * 86400000;
        const triggerDate = new Date(nextDate.getTime() - offsetMs);
        if (triggerDate > now) {
          db.prepare(`
            INSERT INTO reminders (id, reminder_type, engagement_id, client_id, user_id, title, message, trigger_date, channel, status, created_by, created_at)
            VALUES (?, 'deadline', ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
          `).run(
            uuidv4(), engId, schedule.client_id, createdBy,
            `${schedule.template_name} due in ${rule.offset_value} ${rule.offset_unit} — ${schedule.client_name}`,
            `Recurring deadline for ${schedule.template_name} (${engCode})`,
            triggerDate.toISOString().split('T')[0], rule.channel, createdBy, nowStr
          );
        }
      }

      // Advance schedule to next occurrence
      const nextOccurrence = getNextOccurrence(schedule.rrule, schedule.dtstart, nextDate.toISOString());
      if (nextOccurrence) {
        db.prepare(`UPDATE engagement_recurrence_schedules SET next_occurrence_date = ?, last_generated_date = ?, updated_at = ? WHERE id = ?`)
          .run(nextOccurrence.toISOString().split('T')[0], nowStr, nowStr, schedule.id);
      } else {
        // No more occurrences, deactivate schedule
        db.prepare(`UPDATE engagement_recurrence_schedules SET is_active = 0, last_generated_date = ?, updated_at = ? WHERE id = ?`)
          .run(nowStr, nowStr, schedule.id);
      }

      // Log activity
      db.prepare(`
        INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
        VALUES (?, ?, 'recurring_engagement_created', 'engagement', ?, ?, ?, ?, ?)
      `).run(uuidv4(), createdBy, engId, engCode, schedule.client_id,
        `Auto-generated recurring ${schedule.template_name} for ${schedule.client_name}`, nowStr);

      results.push({ engagement_id: engId, engagement_code: engCode, due_date: dueDate, client: schedule.client_name });
    }

    return NextResponse.json({
      generated: results.length,
      engagements: results,
      checked_schedules: schedules.length,
    });
  } catch (error: any) {
    console.error('Recurrence tick error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
