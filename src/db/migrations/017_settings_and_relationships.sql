-- Tables the app already queries but no earlier schema file created. They were
-- made by hand in a previous database (by one-off scripts
-- and ad-hoc edits), so a new database did not have them.
-- PostgreSQL. Applied once by the app (see src/db/setup.js).

-- Provincial GST/PST rates, per firm (Settings > Tax rates).
CREATE TABLE IF NOT EXISTS tax_rates (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  province TEXT NOT NULL,
  gst TEXT NOT NULL,
  pst TEXT NOT NULL,
  pst_label TEXT,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_rates_org ON tax_rates(org_id);

-- Links between clients, e.g. a person and their company (client page and portal dashboard).
CREATE TABLE IF NOT EXISTS client_relationships (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  linked_client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, linked_client_id, role)
);

CREATE INDEX IF NOT EXISTS idx_client_relationships_client ON client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_linked ON client_relationships(linked_client_id);

-- Per-user notification settings (Settings > Notifications).
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id TEXT PRIMARY KEY,
  preferences_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT NOW()
);
