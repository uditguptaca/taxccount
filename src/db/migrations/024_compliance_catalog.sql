-- Service Master: the compliance checker's rules, kept in the database so the platform admin can see and
-- change them. One row per item. `kind` is what the item is (country, state, entity, department, step,
-- question, compliance, source); `data` is the item itself as JSON, in the shape of src/lib/compliance/types.ts.
-- Rows are first filled from the built-in rule files (origin 'builtin'). A row the admin has changed is
-- marked edited and is never overwritten when the built-in rules are updated.

CREATE TABLE IF NOT EXISTS compliance_catalog (
  country TEXT NOT NULL,
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  edited INTEGER NOT NULL DEFAULT 0,
  origin TEXT NOT NULL DEFAULT 'builtin',
  updated_at TEXT NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  PRIMARY KEY (country, kind, id)
);
CREATE INDEX IF NOT EXISTS idx_compliance_catalog_kind ON compliance_catalog(country, kind, sort_order);

-- Every change made in Service Master, with the item before and after, so a change can be undone.
CREATE TABLE IF NOT EXISTS compliance_catalog_history (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  kind TEXT NOT NULL,
  item_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  user_id TEXT,
  user_name TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_compliance_catalog_history_at ON compliance_catalog_history(created_at);
