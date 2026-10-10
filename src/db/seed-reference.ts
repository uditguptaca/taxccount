// Reference data every firm needs and the schema cannot carry: content, not tables.
// It loads only into an EMPTY table, so it never overwrites or duplicates anything,
// and it is the one place to add more (put the data in src/db/reference/*.json).
//
// Before this, the corporate secretary document templates were inserted by a
// one-off script run by hand against the old Supabase database, so a new database
// had an empty template list.
import templates from './reference/cs-document-templates.json';

export async function seedReference(sql: any): Promise<string[]> {
  const log: string[] = [];

  const [{ n }] = await sql.unsafe('SELECT COUNT(*)::int AS n FROM cs_document_templates');
  if (n === 0) {
    for (const t of templates as any[]) {
      await sql.unsafe(
        'INSERT INTO cs_document_templates (id, category, name, jurisdiction_scope, body_en, body_fr, merge_fields_json) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [t.id, t.category, t.name, t.jurisdiction_scope, t.body_en, t.body_fr, t.merge_fields_json],
      );
    }
    log.push(`cs_document_templates: loaded ${(templates as any[]).length} templates`);
  }

  return log;
}
