import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { sendSmsReminder } from './sms';

export async function runDailyCron() {
  const db = getDb();
  let eventsTriggered = 0;
  let smsSent = 0;
  
  // 1. Identify Engagements due in < 7 days that haven't been completed
  const upcomingDue = db.prepare(`
    SELECT * FROM client_compliances 
    WHERE status != 'completed' 
    AND due_date IS NOT NULL 
    AND due_date <= date('now', '+7 days')
  `).all() as any[];

  for (const engagement of upcomingDue) {
    // Check if we've already created an inbox_item warning for this engagement in the last 7 days
    const existingWarning = db.prepare(`
        SELECT id FROM inbox_items 
        WHERE source_id = ? AND type = 'system_alert' AND created_at >= date('now', '-7 days')
    `).get(engagement.id);

    if (!existingWarning) {
        // Find assigned user or team manager to alert
        let assignedId = 'system';
        const currentStage = db.prepare(`SELECT assigned_user_id FROM client_compliance_stages WHERE engagement_id = ? AND status = 'in_progress' LIMIT 1`).get(engagement.id) as any;
        if (currentStage && currentStage.assigned_user_id) {
            assignedId = currentStage.assigned_user_id;
        }

        db.prepare(`
            INSERT INTO inbox_items (id, user_id, title, content, type, source, source_id, is_read, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'system_alert', 'project_deadline', ?, 0, datetime('now'), datetime('now'))
        `).run(
            uuidv4(), 
            assignedId,
            'Project Due Soon', 
            `Engagement for client ID ${engagement.client_id} is due within 7 days!`, 
            engagement.id
        );

        // Fetch client email and phone to dispatch the 7-day warning
        const clientRow = db.prepare('SELECT display_name, primary_email, primary_phone FROM clients WHERE id = ?').get(engagement.client_id) as any;
        if (clientRow && clientRow.primary_email) {
            console.log(`[EMAIL DISPATCH] Dispatching 7-day warning email to client: ${clientRow.primary_email} for Engagement ${engagement.id}`);
        }

        // SMS Channel: Send deadline warning via SMS if client has phone
        if (clientRow && clientRow.primary_phone) {
            try {
                const result = await sendSmsReminder(
                    clientRow.primary_phone,
                    clientRow.display_name || 'Client',
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
    SELECT ccs.*, cc.client_id 
    FROM client_compliance_stages ccs
    JOIN client_compliances cc ON ccs.engagement_id = cc.id
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
              WHERE client_id = ? AND type = 'missing_info' AND created_at >= date('now', '-1 day')
          `).get(stage.client_id);

          if (!reminderSent) {
              // Create an automated reminder
              db.prepare(`
                  INSERT INTO reminders (id, client_id, engagement_id, title, description, status, due_date, type, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, 'pending', date('now', '+2 days'), 'missing_info', datetime('now'), datetime('now'))
              `).run(
                  uuidv4(), 
                  stage.client_id, 
                  stage.engagement_id, 
                  'Missing Documents Reminder', 
                  'Please upload the remaining required documents so we can proceed with your file.'
              );
              eventsTriggered++;
          }
      }
  }

  return { success: true, eventsTriggered, smsSent };
}

export async function runRecurringJobs() {
  const db = getDb();
  let jobsCreated = 0;

  // Find active recurring schedules that are due today or in the past
  const dueSchedules = db.prepare(`
    SELECT * FROM recurring_schedules
    WHERE is_active = 1 AND date(next_run_date) <= date('now')
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
      (id, engagement_code, client_id, template_id, financial_year, status, client_facing_status, priority, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, strftime('%Y', 'now'), 'new', 'future', 'medium', ?, ?, ?)
    `).run(engagementId, engagementCode, schedule.client_id, schedule.template_id, schedule.created_by, now, now);

    // Copy template stages
    const templateStages = db.prepare('SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order ASC').all(schedule.template_id) as any[];
    for (const ts of templateStages) {
      db.prepare(`
        INSERT INTO client_compliance_stages
        (id, engagement_id, template_stage_id, stage_name, stage_code, sequence_order, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `).run(uuidv4(), engagementId, ts.id, ts.stage_name, ts.stage_code, ts.sequence_order, now, now);
    }

    // Set stage to in_progress if auto advance? For now just create it.
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

    jobsCreated++;
  }

  return { success: true, jobsCreated };
}
