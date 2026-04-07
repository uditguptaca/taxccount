import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export type TriggerEvent = 
  | 'ORGANIZER_COMPLETED' 
  | 'SIGNATURE_COLLECTED' 
  | 'INVOICE_PAID' 
  | 'DOCUMENT_UPLOADED' 
  | 'STAGE_COMPLETED';

export type ActionType = 'MOVE_STAGE' | 'CREATE_TASK' | 'SEND_MESSAGE' | 'AUTO_TAG';

export async function triggerWorkflowEvent(
  eventType: TriggerEvent,
  payload: {
    org_id: string;
    client_id: string;
    engagement_id?: string;
    pipeline_template_id?: string;
    entity_id?: string; // id of the organizer, invoice, etc.
    actor_id?: string;  // user who triggered the event
  }
) {
  try {
    const db = getDb();

    // 1. Find active rules matching this event, scoped to the org
    let query = `SELECT * FROM workflow_rules WHERE trigger_event = ? AND is_active = 1 AND org_id = ?`;
    const queryParams: any[] = [eventType, payload.org_id];

    if (payload.pipeline_template_id) {
      query += ` AND (pipeline_template_id = ? OR pipeline_template_id IS NULL)`;
      queryParams.push(payload.pipeline_template_id);
    } else {
      query += ` AND pipeline_template_id IS NULL`;
    }

    const matchingRules = db.prepare(query).all(...queryParams) as any[];

    if (!matchingRules.length) return; // No automations matched

    // 2. Process each rule
    for (const rule of matchingRules) {
      // Evaluate rule.conditions (JSON) against payload to see if it should run
      if (rule.conditions) {
        try {
          const conditions = JSON.parse(rule.conditions);
          let conditionPassed = true;

          // Hydrate context for evaluation if needed
          const evalContext: any = { ...payload };
          if (payload.client_id) {
            evalContext.client = db.prepare('SELECT * FROM clients WHERE id = ? AND org_id = ?').get(payload.client_id, payload.org_id);
          }

          for (const cond of conditions) {
            const { field, operator, value } = cond;
            // Support simple dot notation like client.client_type
            const fieldParts = field.split('.');
            let actualValue = evalContext;
            for (const part of fieldParts) {
              if (actualValue) actualValue = actualValue[part];
            }

            switch (operator) {
              case 'equals':
                if (actualValue !== value) conditionPassed = false;
                break;
              case 'not_equals':
                if (actualValue === value) conditionPassed = false;
                break;
              case 'contains':
                if (!String(actualValue).includes(String(value))) conditionPassed = false;
                break;
              default:
                break;
            }
          }
          if (!conditionPassed) continue; // Skip to next rule
        } catch (e) {
          console.error("Error parsing rule conditions", e);
          continue;
        }
      }

      // 3. Fetch Actions for this rule
      const actions = db.prepare(`SELECT * FROM workflow_actions WHERE rule_id = ? AND org_id = ? ORDER BY sequence_order ASC`).all(rule.id, payload.org_id) as any[];

      // 4. Execute Actions
      for (const action of actions) {
        await executeAction(action, payload, db);
      }
    }
  } catch (error) {
    console.error("Workflow Engine Error:", error);
  }
}

async function executeAction(action: any, context: any, db: any) {
  const { action_type, action_payload } = action;
  const parsedPayload = typeof action_payload === 'string' ? JSON.parse(action_payload) : action_payload;
  const now = new Date().toISOString();

  switch (action_type as ActionType) {
    case 'MOVE_STAGE': {
      // Example payload: { target_stage_code: "in_progress" }
      if (context.engagement_id && parsedPayload.target_stage_code) {
        const stage = db.prepare(`
          SELECT id FROM client_compliance_stages 
          WHERE engagement_id = ? AND stage_code = ?
        `).get(context.engagement_id, parsedPayload.target_stage_code);

        if (stage) {
          db.prepare(`UPDATE client_compliances SET current_stage_id = ?, updated_at = ? WHERE id = ?`)
            .run(stage.id, now, context.engagement_id);
          
          // Mark the stage as in_progress
          db.prepare(`UPDATE client_compliance_stages SET status = 'in_progress', started_at = ?, updated_at = ? WHERE id = ?`)
            .run(now, now, stage.id);
          
          db.prepare(`
            INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, client_id, details, created_at)
            VALUES (?, ?, ?, 'stage_advanced_via_automation', 'engagement', ?, ?, ?, ?)
          `).run(uuidv4(), context.org_id, context.actor_id || 'SYSTEM', context.engagement_id, context.client_id, `Moved to ${parsedPayload.target_stage_code}`, now);
        }
      }
      break;
    }

    case 'CREATE_TASK': {
      // Example payload: { task_name: "Follow up on missing data", priority: "high", due_offset_days: 3, assign_to: "manager" }
      const taskName = parsedPayload.task_name || 'Automated Task';
      const priority = parsedPayload.priority || 'medium';
      const dueOffsetDays = parsedPayload.due_offset_days || 7;
      const dueDate = new Date(Date.now() + dueOffsetDays * 86400000).toISOString().split('T')[0];

      // Determine assignee
      let assigneeId = context.actor_id || null;
      if (parsedPayload.assign_to === 'manager') {
        // Find team manager for the engagement's assigned team
        const engagement = db.prepare('SELECT assigned_team_id FROM client_compliances WHERE id = ?').get(context.engagement_id) as any;
        if (engagement?.assigned_team_id) {
          const manager = db.prepare('SELECT manager_id FROM teams WHERE id = ?').get(engagement.assigned_team_id) as any;
          if (manager?.manager_id) assigneeId = manager.manager_id;
        }
      } else if (parsedPayload.assign_to === 'current_assignee') {
        const currentStage = db.prepare(`SELECT assigned_user_id FROM client_compliance_stages WHERE engagement_id = ? AND status = 'in_progress' LIMIT 1`).get(context.engagement_id) as any;
        if (currentStage?.assigned_user_id) assigneeId = currentStage.assigned_user_id;
      }

      // Fallback: assign to org admin
      if (!assigneeId) {
        const admin = db.prepare(`SELECT user_id FROM organization_memberships WHERE org_id = ? AND role = 'firm_admin' LIMIT 1`).get(context.org_id) as any;
        assigneeId = admin?.user_id || 'SYSTEM';
      }

      // Create a staff task
      db.prepare(`
        INSERT INTO staff_tasks (id, org_id, title, description, assigned_to, assigned_by, client_id, engagement_id, due_date, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'SYSTEM', ?, ?, ?, ?, 'pending', ?, ?)
      `).run(
        uuidv4(), context.org_id, taskName,
        parsedPayload.description || `Auto-created by workflow automation for ${context.client_id}`,
        assigneeId, context.client_id, context.engagement_id || null,
        dueDate, priority, now, now
      );

      // Also create an inbox notification for the assignee
      db.prepare(`
        INSERT INTO inbox_items (id, org_id, user_id, item_type, title, message, client_id, link_type, link_id, is_read, created_at)
        VALUES (?, ?, ?, 'task_assigned', ?, ?, ?, 'staff_task', ?, 0, datetime('now'))
      `).run(
        uuidv4(), context.org_id, assigneeId,
        `New Task: ${taskName}`,
        parsedPayload.description || `An automated task has been assigned to you.`,
        context.client_id, context.engagement_id || ''
      );

      db.prepare(`
        INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, client_id, details, created_at)
        VALUES (?, ?, 'SYSTEM', 'task_created_via_automation', 'staff_task', ?, ?, ?, ?)
      `).run(uuidv4(), context.org_id, context.engagement_id || '', context.client_id, `Auto-task: ${taskName}`, now);

      break;
    }

    case 'SEND_MESSAGE': {
      // Example payload: { message_text: "All documents received, starting preparation.", thread_type: "client_facing" }
      const messageText = parsedPayload.message_text || 'Automated notification from your compliance team.';
      const threadType = parsedPayload.thread_type || 'client_facing';

      // Find or create a chat thread for this client + engagement
      let thread = db.prepare(`
        SELECT id FROM chat_threads 
        WHERE org_id = ? AND client_id = ? AND engagement_id = ? AND thread_type = ? AND is_active = 1
        LIMIT 1
      `).get(context.org_id, context.client_id, context.engagement_id || null, threadType) as any;

      if (!thread) {
        // Find the sender (org admin)
        const admin = db.prepare(`SELECT user_id FROM organization_memberships WHERE org_id = ? AND role = 'firm_admin' LIMIT 1`).get(context.org_id) as any;
        const creatorId = admin?.user_id || context.actor_id || 'SYSTEM';

        const threadId = uuidv4();
        const client = db.prepare('SELECT display_name FROM clients WHERE id = ?').get(context.client_id) as any;
        const subject = context.engagement_id
          ? `Communication — ${client?.display_name || 'Client'}`
          : `General — ${client?.display_name || 'Client'}`;

        db.prepare(`
          INSERT INTO chat_threads (id, org_id, thread_type, client_id, engagement_id, subject, is_active, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `).run(threadId, context.org_id, threadType, context.client_id, context.engagement_id || null, subject, creatorId, now, now);

        thread = { id: threadId };
      }

      // Find sender (org admin or actor)
      const senderId = context.actor_id || (() => {
        const admin = db.prepare(`SELECT user_id FROM organization_memberships WHERE org_id = ? AND role = 'firm_admin' LIMIT 1`).get(context.org_id) as any;
        return admin?.user_id || 'SYSTEM';
      })();

      // Insert the message
      db.prepare(`
        INSERT INTO chat_messages (id, org_id, thread_id, sender_id, content, is_internal, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `).run(
        uuidv4(), context.org_id, thread.id, senderId, messageText,
        threadType === 'internal' ? 1 : 0, now
      );

      // Update thread's last_message_at
      db.prepare(`UPDATE chat_threads SET last_message_at = ?, updated_at = ? WHERE id = ?`)
        .run(now, now, thread.id);

      db.prepare(`
        INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, client_id, details, created_at)
        VALUES (?, ?, 'SYSTEM', 'message_sent_via_automation', 'chat_thread', ?, ?, ?, ?)
      `).run(uuidv4(), context.org_id, thread.id, context.client_id, `Auto-message: ${messageText.slice(0, 80)}...`, now);

      break;
    }

    case 'AUTO_TAG': {
      // Example payload: { tag_name: "High Priority", tag_color: "#ef4444" }
      const tagName = parsedPayload.tag_name;
      if (!tagName || !context.client_id) break;

      const tagColor = parsedPayload.tag_color || '#6b7280';

      // Find or create the tag
      let tag = db.prepare(`SELECT id FROM client_tags WHERE org_id = ? AND name = ?`).get(context.org_id, tagName) as any;

      if (!tag) {
        const tagId = uuidv4();
        db.prepare(`
          INSERT INTO client_tags (id, org_id, name, color, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `).run(tagId, context.org_id, tagName, tagColor);
        tag = { id: tagId };
      }

      // Check if assignment already exists
      const existingAssignment = db.prepare(`
        SELECT id FROM client_tag_assignments WHERE client_id = ? AND tag_id = ?
      `).get(context.client_id, tag.id);

      if (!existingAssignment) {
        db.prepare(`
          INSERT INTO client_tag_assignments (id, org_id, client_id, tag_id)
          VALUES (?, ?, ?, ?)
        `).run(uuidv4(), context.org_id, context.client_id, tag.id);

        db.prepare(`
          INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, client_id, details, created_at)
          VALUES (?, ?, 'SYSTEM', 'tag_applied_via_automation', 'client', ?, ?, ?, ?)
        `).run(uuidv4(), context.org_id, context.client_id, context.client_id, `Auto-tagged: ${tagName}`, now);
      }

      break;
    }

    default:
      console.warn("Unknown workflow action type:", action_type);
  }
}
