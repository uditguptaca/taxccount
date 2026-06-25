const fs = require('fs');
const path = require('path');

const routePath = path.join(__dirname, 'src', 'app', 'api', 'clients', '[id]', 'engagements', 'route.ts');
let code = fs.readFileSync(routePath, 'utf8');

// 1. Add session import and get orgId
if (!code.includes("import { getSessionContext }")) {
  code = code.replace("import { v4 as uuidv4 } from 'uuid';", "import { v4 as uuidv4 } from 'uuid';\nimport { getSessionContext } from '@/lib/auth-context';");
}

if (!code.includes("const session = getSessionContext();")) {
  code = code.replace("const db = getDb();", "const session = getSessionContext();\n    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });\n    const { orgId } = session;\n    const db = getDb();");
}

// 2. Patch INSERT INTO client_compliances
code = code.replace(
`      INSERT INTO client_compliances (
        id, engagement_code, client_id, template_id, financial_year, period_label,
        due_date, price, status, client_facing_status, priority,
        assigned_team_id, assignee_type, assignee_id,
        template_version_at_creation,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', 'future', ?, ?, ?, ?, ?, ?, ?, ?)
    \`).run(
      engagementId, engCode, clientId, template_id,`,
`      INSERT INTO client_compliances (
        id, org_id, engagement_code, client_id, template_id, financial_year, period_label,
        due_date, price, status, client_facing_status, priority,
        assigned_team_id, assignee_type, assignee_id,
        template_version_at_creation,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'future', ?, ?, ?, ?, ?, ?, ?, ?)
    \`).run(
      engagementId, orgId, engCode, clientId, template_id,`
);

// 3. Patch client_compliance_stages
code = code.replace(
`      INSERT INTO client_compliance_stages (
        id, engagement_id, template_stage_id, stage_name, stage_code, sequence_order,
        status, assigned_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    \`);`,
`      INSERT INTO client_compliance_stages (
        id, org_id, engagement_id, template_stage_id, stage_name, stage_code, sequence_order,
        status, assigned_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    \`);`
);

code = code.replace(
`      await insertStage.run(
        uuidv4(), engagementId, stage.id,`,
`      await insertStage.run(
        uuidv4(), orgId, engagementId, stage.id,`
);

// 4. Patch engagement_doc_requirements
code = code.replace(
`      INSERT INTO engagement_doc_requirements (
        id, engagement_id, document_name, document_category, is_mandatory, upload_by, linked_stage_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`);`,
`      INSERT INTO engagement_doc_requirements (
        id, org_id, engagement_id, document_name, document_category, is_mandatory, upload_by, linked_stage_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`);`
);

code = code.replace(
`      await insertDocReq.run(
        uuidv4(), engagementId, doc.document_name`,
`      await insertDocReq.run(
        uuidv4(), orgId, engagementId, doc.document_name`
);

// 5. Patch engagement_reminder_rules
code = code.replace(
`      INSERT INTO engagement_reminder_rules (id, engagement_id, offset_value, offset_unit, channel, recipient_scope, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    \`);`,
`      INSERT INTO engagement_reminder_rules (id, org_id, engagement_id, offset_value, offset_unit, channel, recipient_scope, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`);`
);

code = code.replace(
`      await insertReminderRule.run(
        uuidv4(), engagementId,`,
`      await insertReminderRule.run(
        uuidv4(), orgId, engagementId,`
);

// 6. Patch reminders
code = code.replace(
`      INSERT INTO reminders (id, reminder_type, engagement_id, client_id, user_id, title, message, trigger_date, channel, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    \`);`,
`      INSERT INTO reminders (id, org_id, reminder_type, engagement_id, client_id, user_id, title, message, trigger_date, channel, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    \`);`
);

code = code.replace(
`        await insertReminder.run(
          uuidv4(), 'deadline', engagementId`,
`        await insertReminder.run(
          uuidv4(), orgId, 'deadline', engagementId`
);

// 7. Patch engagement_questions
code = code.replace(
`        INSERT INTO engagement_questions (id, engagement_id, question_text, question_type, is_required, sequence_order, options, answer_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`);`,
`        INSERT INTO engagement_questions (id, org_id, engagement_id, question_text, question_type, is_required, sequence_order, options, answer_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`);`
);

code = code.replace(
`        await insertAnswer.run(
          uuidv4(), engagementId,`,
`        await insertAnswer.run(
          uuidv4(), orgId, engagementId,`
);

// 8. Patch engagement_recurrence_schedules
code = code.replace(
`        INSERT INTO engagement_recurrence_schedules (
          id, source_engagement_id, client_id, template_id,
          rrule, dtstart, until_date, occurrence_count,
          next_occurrence_date, assignee_type, assignee_id, price,
          is_active, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      \`).run(
        scheduleId, engagementId, clientId, template_id,`,
`        INSERT INTO engagement_recurrence_schedules (
          id, org_id, source_engagement_id, client_id, template_id,
          rrule, dtstart, until_date, occurrence_count,
          next_occurrence_date, assignee_type, assignee_id, price,
          is_active, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      \`).run(
        scheduleId, orgId, engagementId, clientId, template_id,`
);

// 9. Patch activity_feed
code = code.replace(
`      INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
      VALUES (?, ?, 'created_engagement', 'engagement', ?, ?, ?, ?, ?)
    \`).run(
      uuidv4(), createdBy, engagementId, engCode, clientId,`,
`      INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
      VALUES (?, ?, ?, 'created_engagement', 'engagement', ?, ?, ?, ?, ?)
    \`).run(
      uuidv4(), orgId, createdBy, engagementId, engCode, clientId,`
);


fs.writeFileSync(routePath, code, 'utf8');
console.log("Patched engagements route.ts successfully!");
