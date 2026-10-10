# Queries that do not limit themselves to the caller's firm

Generated 2026-10-10 by scanning every API route for a query on a firm-owned table (one with an `org_id`) whose text
never mentions `org_id`. **This list is a starting point, not a verdict**: a query is safe when the id it uses was already
checked in the same route (for example `requireClientAccess`) or comes from the signed-in user. A query that takes an id from
the URL or the request body and does not check it is not safe: another firm's user who learns the id can read or change that row.

Already fixed (2026-10-10): payroll (all routes), client detail / contacts / relationships, project detail and documents,
document download and versions, lead activities, T1 intake (all routes, per client), portal smart forms, the revenue and
missing-documents reports, the service-centre project list, and the signature check on every request.

Remaining: **315 queries in 75 files.** Fix a route, then run the firm-isolation checks in `tests/verify`.

| Route file | Queries | Tables |
|---|---|---|
| `projects/[id]/route.ts` | 31 (lines 17, 29, 37, 45, 51, 80…) | client_compliance_stages, client_compliances, clients, compliance_template_docum |
| `portal/dashboard/route.ts` | 22 (lines 20, 55, 59, 70, 79, 99…) | activity_feed, chat_messages, chat_threads, client_compliance_stages, client_com |
| `payroll/[clientId]/runs/[runId]/reverse/route.ts` | 13 (lines 15, 26, 43, 50, 87, 90…) | ledger_journal_entries, ledger_payroll, ledger_payslips, ledger_transactions, le |
| `payroll/seed/route.ts` | 12 (lines 30, 31, 32, 33, 34, 35…) | pay_group, pay_run, pay_schedule, payroll_company, payroll_person, payslip, remi |
| `portal/vault/route.ts` | 11 (lines 32, 41, 43, 47, 49, 53…) | personal_compliance_items, personal_consultants, personal_entities, personal_ent |
| `documents/route.ts` | 9 (lines 25, 187, 194, 204, 214, 226…) | client_compliance_stages, client_compliances, clients, compliance_template_docum |
| `payroll/[clientId]/runs/[runId]/approve/route.ts` | 9 (lines 16, 32, 51, 62, 144, 210…) | ledger_accounts, ledgers, pay_group, pay_run, payroll_person, payslip, ytd_balan |
| `scheduler/recurrence-tick/route.ts` | 9 (lines 22, 43, 51, 58, 63, 115…) | client_compliances, clients, compliance_template_stages, compliance_templates, e |
| `templates/[id]/route.ts` | 9 (lines 18, 21, 22, 23, 24, 171…) | compliance_template_documents, compliance_template_stages, compliance_templates, |
| `clients/[id]/engagements/route.ts` | 8 (lines 48, 85, 95, 117, 142, 160…) | client_compliance_stages, client_compliances, clients, compliance_template_docum |
| `portal/compliance/[id]/route.ts` | 8 (lines 16, 20, 29, 38, 45, 54…) | chat_messages, chat_threads, client_compliance_stages, client_compliances, clien |
| `corpsec/[companyId]/[...slug]/route.ts` | 7 (lines 332, 355, 409, 415, 421, 460…) | cs_directors, cs_officers, cs_option_grants, cs_option_plans, cs_share_issuances |
| `portal/smart-forms/[id]/route.ts` | 7 (lines 20, 29, 30, 31, 58, 65…) | smart_form_assignments, smart_form_questions, smart_form_responses, smart_form_s |
| `templates/route.ts` | 7 (lines 19, 20, 21, 22, 23, 98…) | client_compliances, compliance_template_documents, compliance_template_stages, c |
| `payroll/[clientId]/runs/[runId]/calculate/route.ts` | 6 (lines 16, 37, 56, 84, 119, 149) | pay_group, pay_run, payroll_person, payslip, ytd_balance |
| `portal/vault/entities/route.ts` | 6 (lines 28, 30, 85, 91, 112, 114) | personal_entities, personal_entity_compliance |
| `portal/vault/family/route.ts` | 6 (lines 16, 18, 73, 79, 100, 102) | personal_family_compliance, personal_family_members |
| `smart-forms/templates/route.ts` | 6 (lines 176, 271, 294, 324, 337, 375) | smart_form_questions, smart_form_sections, smart_forms |
| `payroll/[clientId]/runs/[runId]/step2/route.ts` | 5 (lines 21, 47, 58, 93, 121) | pay_group, pay_run, payroll_person, payslip |
| `portal/chats/messages/route.ts` | 5 (lines 15, 23, 26, 35, 38) | chat_messages, chat_threads, client_tasks, clients |
| `portal/consultants/[id]/route.ts` | 5 (lines 21, 26, 32, 51, 58) | personal_consultants |
| `portal/tasks/route.ts` | 5 (lines 24, 30, 61, 64, 67) | chat_threads, client_compliances, client_tasks, clients, compliance_templates |
| `portal/vault/calendar/route.ts` | 5 (lines 18, 42, 66, 91, 93) | client_compliances, clients, compliance_templates, personal_compliance_items, pe |
| `clients/route.ts` | 4 (lines 175, 266, 267, 268) | client_contacts, client_personal_info, client_tag_assignments, clients |
| `organizers/instances/[id]/route.ts` | 4 (lines 19, 84, 86, 89) | organizer_instances, organizer_templates |
| `platform/super-forms/[id]/route.ts` | 4 (lines 18, 25, 26, 50) | smart_form_questions, smart_form_sections, smart_forms |
| `portal/profile/route.ts` | 4 (lines 19, 36, 41, 73) | client_contacts, client_personal_info, clients |
| `portal/vault/consultants/route.ts` | 4 (lines 16, 18, 54, 89) | personal_compliance_items, personal_consultants, personal_entity_compliance, per |
| `smart-forms/responses/[id]/route.ts` | 4 (lines 25, 26, 54, 59) | smart_form_assignments, smart_form_questions, smart_form_responses |
| `teams/route.ts` | 4 (lines 104, 105, 120, 139) | teams |
| `clients/[id]/route.ts` | 3 (lines 38, 39, 53) | client_contacts, client_personal_info, client_tag_assignments, client_tags |
| `messages/[threadId]/route.ts` | 3 (lines 25, 34, 71) | chat_messages, chat_threads, client_tasks |
| `payroll/[clientId]/company/route.ts` | 3 (lines 12, 34, 42) | payroll_company |
| `payroll/[clientId]/runs/[runId]/route.ts` | 3 (lines 15, 28, 62) | pay_group, pay_run, payroll_person, payslip, ytd_balance |
| `payroll/[clientId]/runs/route.ts` | 3 (lines 11, 40, 46) | pay_group, pay_run, payroll_person |
| `portal/chats/route.ts` | 3 (lines 25, 30, 60) | chat_messages, chat_threads, clients |
| `portal/documents/route.ts` | 3 (lines 15, 18, 30) | client_compliances, clients, compliance_template_documents, compliance_templates |
| `portal/fulfillment/route.ts` | 3 (lines 26, 155, 213) | personal_compliance_items |
| `portal/reminders/route.ts` | 3 (lines 25, 30, 61) | clients, reminders |
| `smart-forms/templates/[id]/route.ts` | 3 (lines 18, 25, 26) | smart_form_questions, smart_form_sections, smart_forms |
| `staff/clients/[id]/route.ts` | 3 (lines 27, 41, 56) | client_compliance_stages, client_compliances, compliance_templates, team_members |
| `cron/penalty-monitor/route.ts` | 2 (lines 27, 44) | personal_compliance_items |
| `documents/[id]/versions/route.ts` | 2 (lines 22, 37) | clients, document_files, document_versions |
| `documents/search/route.ts` | 2 (lines 42, 62) | client_compliances, clients, compliance_templates, document_files |
| `leads/[id]/activities/route.ts` | 2 (lines 15, 43) | lead_activities, leads |
| `payroll/[clientId]/pay-groups/[groupId]/generate-schedule/route.ts` | 2 (lines 15, 76) | pay_group, pay_schedule |
| `platform/super-forms/route.ts` | 2 (lines 179, 274) | smart_forms |
| `portal/consultants/route.ts` | 2 (lines 15, 42) | personal_consultants |
| `portal/smart-forms/route.ts` | 2 (lines 24, 29) | clients, smart_form_assignments, smart_forms |
| `teams/assignables/route.ts` | 2 (lines 23, 30) | team_memberships, teams |
| `billing/webhook/route.ts` | 1 (lines 25) | invoices |
| `calendar/client/route.ts` | 1 (lines 28) | client_compliances, clients, compliance_templates |
| `clients/[id]/contacts/route.ts` | 1 (lines 18) | clients |
| `clients/[id]/ledger/purchases/route.ts` | 1 (lines 158) | ledger_bills |
| `clients/[id]/ledger/sales/route.ts` | 1 (lines 159) | ledger_invoices |
| `clients/[id]/payroll/employees/route.ts` | 1 (lines 22) | ledger_employees |
| `clients/[id]/payroll/run/route.ts` | 1 (lines 20) | ledger_employees |
| `clients/[id]/payroll/runs/route.ts` | 1 (lines 19) | ledger_payroll |
| `clients/[id]/relationships/route.ts` | 1 (lines 15) | client_types_config, clients |
| `documents/[id]/download/route.ts` | 1 (lines 27) | document_files |
| `employee/dashboard/route.ts` | 1 (lines 24) | team_memberships, teams |
| `leads/route.ts` | 1 (lines 39) | lead_activities, lead_tasks, leads |
| `payroll/[clientId]/pay-groups/[groupId]/schedule/route.ts` | 1 (lines 13) | pay_schedule |
| `payroll/[clientId]/pay-groups/route.ts` | 1 (lines 10) | pay_group |
| `payroll/[clientId]/people/route.ts` | 1 (lines 12) | pay_group, payroll_person |
| `payroll/[clientId]/remittances/route.ts` | 1 (lines 10) | pay_run, remittance |
| `payroll/[clientId]/stat-holidays/route.ts` | 1 (lines 15) | stat_holiday |
| `projects/reassign/route.ts` | 1 (lines 19) | client_compliance_stages |
| `projects/route.ts` | 1 (lines 23) | client_compliance_stages, team_memberships |
| `reminders/route.ts` | 1 (lines 75) | reminders |
| `staff/clients/route.ts` | 1 (lines 24) | client_compliance_stages, client_compliances, clients |
| `staff/dashboard/route.ts` | 1 (lines 40) | team_memberships, teams |
| `tax-intake/[engagementId]/responses/route.ts` | 1 (lines 93) | tax_intake_engagements |
| `tax-intake/[engagementId]/submit/route.ts` | 1 (lines 77) | tax_intake_engagements |
| `users/[id]/stages/route.ts` | 1 (lines 19) | client_compliance_stages, client_compliances, clients, compliance_templates |
