import { getDb } from '@/lib/db';

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
    client_id: string;
    engagement_id?: string;
    pipeline_template_id?: string;
    entity_id?: string; // id of the organizer, invoice, etc.
  }
) {
  try {
    const db = getDb();

    // 1. Find active rules matching this event and optionally specific to a pipeline template
    let query = `SELECT * FROM workflow_rules WHERE trigger_event = ? AND is_active = 1`;
    const queryParams: any[] = [eventType];

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
            evalContext.client = db.prepare('SELECT * FROM clients WHERE id = ?').get(payload.client_id);
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
      const actions = db.prepare(`SELECT * FROM workflow_actions WHERE rule_id = ? ORDER BY sequence_order ASC`).all(rule.id) as any[];

      // 4. Execute Actions
      for (const action of actions) {
        await executeAction(action, payload, db);
      }
    }
  } catch (error) {
    console.error("Workflow Engine Error:", error);
    // Ideally log this to an internal system_logs table
  }
}

async function executeAction(action: any, context: any, db: any) {
  const { action_type, action_payload } = action;
  const parsedPayload = typeof action_payload === 'string' ? JSON.parse(action_payload) : action_payload;

  switch (action_type as ActionType) {
    case 'MOVE_STAGE':
      // Example payload: { target_stage_code: "in_progress" }
      if (context.engagement_id && parsedPayload.target_stage_code) {
        // Find the stage_id for this engagement based on code
        const stage = db.prepare(`
          SELECT id FROM client_compliance_stages 
          WHERE engagement_id = ? AND stage_code = ?
        `).get(context.engagement_id, parsedPayload.target_stage_code);

        if (stage) {
          const now = new Date().toISOString();
          // Update the engagement current stage
          db.prepare(`UPDATE client_compliances SET current_stage_id = ?, updated_at = ? WHERE id = ?`)
            .run(stage.id, now, context.engagement_id);
          
          // Log Activity
          db.prepare(`
            INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, client_id, details)
            VALUES (hex(randomblob(16)), 'SYSTEM', 'stage_advanced_via_automation', 'engagement', ?, ?, ?)
          `).run(context.engagement_id, context.client_id, `Moved to ${parsedPayload.target_stage_code}`);
        }
      }
      break;

    case 'CREATE_TASK':
      // Example payload: { task_name: "Follow up on missing data", assignee_role: "manager" }
      break;

    case 'SEND_MESSAGE':
      // Example payload: { template_id: "xyz" } -> Send chat message or email
      break;

    case 'AUTO_TAG':
      // Example payload: { tag_name: "High Priority" }
      break;

    default:
      console.warn("Unknown workflow action type:", action_type);
  }
}
