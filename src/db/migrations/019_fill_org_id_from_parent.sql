-- Many inserts create a child row (a client's contact, an engagement's stage,
-- a chat message, a template question) without stating which firm owns it,
-- yet org_id is required. The firm is always the parent's firm, so a
-- BEFORE INSERT rule reads it from the parent the row already points to.
-- Code should still pass org_id explicitly; this is the safety net that keeps
-- a forgotten one from turning into a "null value in column org_id" error.
-- PostgreSQL. Applied once by the app (see src/db/setup.js).

CREATE OR REPLACE FUNCTION fill_org_id() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  i integer := 0;
  resolved text;
  value text;
BEGIN
  IF NEW.org_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  -- arguments come in pairs: (column holding the parent id, parent table)
  WHILE i + 1 < TG_NARGS LOOP
    value := to_jsonb(NEW) ->> TG_ARGV[i];
    IF value IS NOT NULL THEN
      EXECUTE format('SELECT org_id FROM %I WHERE id = $1', TG_ARGV[i + 1]) INTO resolved USING value;
      IF resolved IS NOT NULL THEN
        NEW.org_id := resolved;
        RETURN NEW;
      END IF;
    END IF;
    i := i + 2;
  END LOOP;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_fill_org_id ON client_contacts;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON client_contacts FOR EACH ROW EXECUTE FUNCTION fill_org_id('client_id', 'clients');

DROP TRIGGER IF EXISTS trg_fill_org_id ON client_compliances;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON client_compliances FOR EACH ROW EXECUTE FUNCTION fill_org_id('client_id', 'clients');

DROP TRIGGER IF EXISTS trg_fill_org_id ON client_compliance_stages;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON client_compliance_stages FOR EACH ROW EXECUTE FUNCTION fill_org_id('engagement_id', 'client_compliances');

DROP TRIGGER IF EXISTS trg_fill_org_id ON engagement_doc_requirements;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON engagement_doc_requirements FOR EACH ROW EXECUTE FUNCTION fill_org_id('engagement_id', 'client_compliances');

DROP TRIGGER IF EXISTS trg_fill_org_id ON engagement_reminder_rules;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON engagement_reminder_rules FOR EACH ROW EXECUTE FUNCTION fill_org_id('engagement_id', 'client_compliances');

DROP TRIGGER IF EXISTS trg_fill_org_id ON engagement_questions;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON engagement_questions FOR EACH ROW EXECUTE FUNCTION fill_org_id('engagement_id', 'client_compliances');

DROP TRIGGER IF EXISTS trg_fill_org_id ON engagement_recurrence_schedules;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON engagement_recurrence_schedules FOR EACH ROW EXECUTE FUNCTION fill_org_id('client_id', 'clients', 'source_engagement_id', 'client_compliances');

DROP TRIGGER IF EXISTS trg_fill_org_id ON reminders;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON reminders FOR EACH ROW EXECUTE FUNCTION fill_org_id('engagement_id', 'client_compliances', 'client_id', 'clients');

DROP TRIGGER IF EXISTS trg_fill_org_id ON activity_feed;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON activity_feed FOR EACH ROW EXECUTE FUNCTION fill_org_id('client_id', 'clients');

DROP TRIGGER IF EXISTS trg_fill_org_id ON document_versions;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON document_versions FOR EACH ROW EXECUTE FUNCTION fill_org_id('document_id', 'document_files');

DROP TRIGGER IF EXISTS trg_fill_org_id ON lead_activities;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON lead_activities FOR EACH ROW EXECUTE FUNCTION fill_org_id('lead_id', 'leads');

DROP TRIGGER IF EXISTS trg_fill_org_id ON chat_messages;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON chat_messages FOR EACH ROW EXECUTE FUNCTION fill_org_id('thread_id', 'chat_threads');

DROP TRIGGER IF EXISTS trg_fill_org_id ON inbox_items;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON inbox_items FOR EACH ROW EXECUTE FUNCTION fill_org_id('client_id', 'clients');

DROP TRIGGER IF EXISTS trg_fill_org_id ON template_reminder_rules;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON template_reminder_rules FOR EACH ROW EXECUTE FUNCTION fill_org_id('template_id', 'compliance_templates');

DROP TRIGGER IF EXISTS trg_fill_org_id ON template_questions;
CREATE TRIGGER trg_fill_org_id BEFORE INSERT ON template_questions FOR EACH ROW EXECUTE FUNCTION fill_org_id('template_id', 'compliance_templates');
