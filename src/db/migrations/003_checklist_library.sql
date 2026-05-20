-- Migration 003: Document Checklist Library

CREATE TABLE IF NOT EXISTS checklist_library (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_library_items (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  checklist_id TEXT NOT NULL REFERENCES checklist_library(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_code TEXT,
  description TEXT,
  document_category TEXT DEFAULT 'client_supporting',
  is_mandatory INTEGER DEFAULT 0,
  upload_required INTEGER DEFAULT 0,
  upload_by TEXT DEFAULT 'either',
  suggested_stage TEXT,
  client_visible INTEGER DEFAULT 1,
  staff_only INTEGER DEFAULT 0,
  accepted_file_types TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_library_org ON checklist_library(org_id);
CREATE INDEX IF NOT EXISTS idx_checklist_library_items_checklist ON checklist_library_items(checklist_id);
