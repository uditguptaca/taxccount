import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { sendSmsReminder } from './sms';

export async function runDailyCron() {
  const db = getDb();
  let eventsTriggered = 0;
  let smsSent = 0;
  
  // 1. Identify Engagements due in < 7 days that haven't been completed
  const upcomingDue = db.prepare(`
    SELECT cc.*, c.display_name, c.primary_email, c.primary_phone, c.org_id
    FROM client_compliances cc
    JOIN clients c ON cc.client_id = c.id
    WHERE cc.status != 'completed' 
    AND cc.due_date IS NOT NULL 
    AND cc.due_date <= date('now', '+7 days')
  `).all() as any[];

  for (const engagement of upcomingDue) {
    // Check if we've already created an inbox_item warning for this engagement in the last 7 days
    const existingWarning = db.prepare(`
        SELECT id FROM inbox_items 
        WHERE link_id = ? AND item_type = 'deadline_approaching' AND created_at >= date('now', '-7 days')
    `).get(engagement.id);

    if (!existingWarning) {
        // Find assigned user or fall back to any active staff in the org
        let assignedId: string | null = null;
        const currentStage = db.prepare(`SELECT assigned_user_id FROM client_compliance_stages WHERE engagement_id = ? AND status = 'in_progress' LIMIT 1`).get(engagement.id) as any;
        if (currentStage && currentStage.assigned_user_id) {
            assignedId = currentStage.assigned_user_id;
        } else {
            // Fall back to org admin
            const orgAdmin = db.prepare(`SELECT user_id FROM organization_memberships WHERE org_id = ? AND role = 'firm_admin' LIMIT 1`).get(engagement.org_id) as any;
            if (orgAdmin) assignedId = orgAdmin.user_id;
        }

        if (assignedId) {
            db.prepare(`
                INSERT INTO inbox_items (id, org_id, user_id, item_type, title, message, client_id, link_type, link_id, is_read, created_at)
                VALUES (?, ?, ?, 'deadline_approaching', ?, ?, ?, 'engagement', ?, 0, datetime('now'))
            `).run(
                uuidv4(),
                engagement.org_id,
                assignedId,
                `Project Due Soon — ${engagement.display_name}`,
                `Engagement ${engagement.engagement_code} for ${engagement.display_name} is due within 7 days (${engagement.due_date}).`,
                engagement.client_id,
                engagement.id
            );
        }

        // SMS Channel: Send deadline warning via SMS if client has phone
        if (engagement.primary_phone) {
            try {
                const result = await sendSmsReminder(
                    engagement.primary_phone,
                    engagement.display_name || 'Client',
                    'Upcoming deadline',
                    `Due: ${engagement.due_date}`
                );
                if (result.success) smsSent++;
            } catch (e) { console.error('[SMS] Reminder send error:', e); }
        }

        eventsTriggered++;
    }
  }

  // 2. Identify engagements stuck in 'Data Collection' stage for > 3 days
  const stuckDataCollection = db.prepare(`
    SELECT ccs.*, cc.client_id, cc.org_id, cc.engagement_code, c.display_name
    FROM client_compliance_stages ccs
    JOIN client_compliances cc ON ccs.engagement_id = cc.id
    JOIN clients c ON cc.client_id = c.id
    WHERE ccs.status = 'in_progress' 
    AND ccs.stage_name LIKE '%Data Collection%'
    AND ccs.started_at <= date('now', '-3 days')
  `).all() as any[];

  for (const stage of stuckDataCollection) {
      // Check if any document was uploaded in the last 3 days by the client
      const recentDocs = db.prepare(`
          SELECT id FROM document_files 
          WHERE client_id = ? AND created_at >= date('now', '-3 days')
          LIMIT 1
      `).get(stage.client_id);

      if (!recentDocs) {
          // See if we sent a reminder already today to avoid spamming
          const reminderSent = db.prepare(`
              SELECT id FROM reminders 
              WHERE client_id = ? AND reminder_type = 'document_request' AND created_at >= date('now', '-1 day')
          `).get(stage.client_id);

          if (!reminderSent) {
              // Find the org admin as the creator
              const orgAdmin = db.prepare(`SELECT user_id FROM organization_memberships WHERE org_id = ? AND role = 'firm_admin' LIMIT 1`).get(stage.org_id) as any;
              const createdBy = orgAdmin?.user_id || stage.assigned_user_id || 'SYSTEM';

              db.prepare(`
                  INSERT INTO reminders (id, org_id, reminder_type, engagement_id, client_id, user_id, title, message, trigger_date, channel, status, is_recurring, created_by, created_at)
                  VALUES (?, ?, 'document_request', ?, ?, ?, ?, ?, date('now', '+2 days'), 'both', 'pending', 0, ?, datetime('now'))
              `).run(
                  uuidv4(),
                  stage.org_id,
                  stage.engagement_id,
                  stage.client_id,
                  stage.assigned_user_id,
                  'Missing Documents Reminder',
                  `Please upload the remaining required documents for ${stage.display_name} so we can proceed with engagement ${stage.engagement_code}.`,
                  createdBy
              );
              eventsTriggered++;
          }
      }
  }

  // 3. Auto-mark overdue engagements
  const overdueEngagements = db.prepare(`
    SELECT id, org_id FROM client_compliances
    WHERE status NOT IN ('completed', 'overdue')
    AND due_date IS NOT NULL
    AND due_date < date('now')
  `).all() as any[];

  for (const eng of overdueEngagements) {
    db.prepare(`UPDATE client_compliances SET status = 'overdue', updated_at = datetime('now') WHERE id = ?`).run(eng.id);
    eventsTriggered++;
  }

  return { success: true, eventsTriggered, smsSent };
}

export async function runRecurringJobs() {
  const db = getDb();
  let jobsCreated = 0;

  // Find active recurring schedules that are due today or in the past
  const dueSchedules = db.prepare(`
    SELECT rs.*, c.org_id FROM recurring_schedules rs
    JOIN clients c ON rs.client_id = c.id
    WHERE rs.is_active = 1 AND date(rs.next_run_date) <= date('now')
  `).all() as any[];

  for (const schedule of dueSchedules) {
    const template = db.prepare('SELECT * FROM compliance_templates WHERE id = ?').get(schedule.template_id) as any;
    if (!template) continue;

    // Generate unique engagement code
    const code = db.prepare("SELECT hex(randomblob(4)) as c").get() as any;
    const engagementCode = template.code + '-' + code.c;
    const engagementId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO client_compliances 
      (id, org_id, engagement_code, client_id, template_id, financial_year, status, client_facing_status, priority, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, strftime('%Y', 'now'), 'new', 'future', 'medium', ?, ?, ?)
    `).run(engagementId, schedule.org_id, engagementCode, schedule.client_id, schedule.template_id, schedule.created_by, now, now);

    // Copy template stages
    const templateStages = db.prepare('SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order ASC').all(schedule.template_id) as any[];
    for (const ts of templateStages) {
      db.prepare(`
        INSERT INTO client_compliance_stages
        (id, org_id, engagement_id, template_stage_id, stage_name, stage_code, sequence_order, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `).run(uuidv4(), schedule.org_id, engagementId, ts.id, ts.stage_name, ts.stage_code, ts.sequence_order, now, now);
    }

    // Set first stage as current
    const firstStage = db.prepare('SELECT id FROM client_compliance_stages WHERE engagement_id = ? ORDER BY sequence_order ASC LIMIT 1').get(engagementId) as any;
    if (firstStage) {
      db.prepare('UPDATE client_compliances SET current_stage_id = ? WHERE id = ?').run(firstStage.id, engagementId);
    }

    // Update the schedule's next_run_date
    const nextDateObj = new Date(schedule.next_run_date);
    if (schedule.frequency === 'monthly') {
      nextDateObj.setMonth(nextDateObj.getMonth() + 1);
    } else if (schedule.frequency === 'quarterly') {
      nextDateObj.setMonth(nextDateObj.getMonth() + 3);
    } else if (schedule.frequency === 'annual') {
      nextDateObj.setFullYear(nextDateObj.getFullYear() + 1);
    }
    const newNextDateStr = nextDateObj.toISOString().split('T')[0];

    db.prepare('UPDATE recurring_schedules SET next_run_date = ? WHERE id = ?').run(newNextDateStr, schedule.id);

    // Log activity
    db.prepare(`
      INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
      VALUES (?, ?, 'SYSTEM', 'recurring_engagement_created', 'engagement', ?, ?, ?, ?, datetime('now'))
    `).run(uuidv4(), schedule.org_id, engagementId, engagementCode, schedule.client_id, `Auto-created from recurring schedule (${schedule.frequency})`);

    jobsCreated++;
  }

  return { success: true, jobsCreated };
}
