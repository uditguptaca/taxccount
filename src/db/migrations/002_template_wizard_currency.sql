-- Migration 002: Template Wizard + Multi-Currency System
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS)

-- ═══════════════════════════════════════════════════════════════
-- 1. EXTEND compliance_templates
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Canada';
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'CAD';
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'fixed';
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS due_date_offset_unit TEXT DEFAULT 'days';
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS due_date_offset_direction TEXT DEFAULT 'after';
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS due_date_base_date TEXT DEFAULT 'start_date';
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS due_date_fixed_date TEXT;
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS due_date_notes TEXT;
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS recurrence_interval_value INTEGER;
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS recurrence_interval_unit TEXT DEFAULT 'months';
ALTER TABLE compliance_templates ADD COLUMN IF NOT EXISTS auto_create_next INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- 2. EXTEND template_categories
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS category_code TEXT;
ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS colour TEXT DEFAULT '#6366f1';
ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- ═══════════════════════════════════════════════════════════════
-- 3. EXTEND compliance_template_stages
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE compliance_template_stages ADD COLUMN IF NOT EXISTS assigned_team_id TEXT;
ALTER TABLE compliance_template_stages ADD COLUMN IF NOT EXISTS assigned_user_id TEXT;
ALTER TABLE compliance_template_stages ADD COLUMN IF NOT EXISTS is_required INTEGER DEFAULT 1;
ALTER TABLE compliance_template_stages ADD COLUMN IF NOT EXISTS completion_rule TEXT;
ALTER TABLE compliance_template_stages ADD COLUMN IF NOT EXISTS phase TEXT;

-- ═══════════════════════════════════════════════════════════════
-- 4. EXTEND compliance_template_documents
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE compliance_template_documents ADD COLUMN IF NOT EXISTS document_code TEXT;
ALTER TABLE compliance_template_documents ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE compliance_template_documents ADD COLUMN IF NOT EXISTS accepted_file_types TEXT;
ALTER TABLE compliance_template_documents ADD COLUMN IF NOT EXISTS client_visible INTEGER DEFAULT 1;
ALTER TABLE compliance_template_documents ADD COLUMN IF NOT EXISTS staff_only INTEGER DEFAULT 0;
ALTER TABLE compliance_template_documents ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE compliance_template_documents ADD COLUMN IF NOT EXISTS upload_required INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- 5. EXTEND engagement_doc_requirements (project documents)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS uploaded_file_url TEXT;
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS uploaded_by TEXT;
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS reviewed_at TEXT;
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- 6. NEW TABLE: firm_settings
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS firm_settings (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  base_currency TEXT NOT NULL DEFAULT 'CAD',
  currency_display_style TEXT DEFAULT 'code',
  default_template_currency TEXT DEFAULT 'CAD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id)
);

-- ═══════════════════════════════════════════════════════════════
-- 7. NEW TABLE: currency_exchange_rates
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS currency_exchange_rates (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  exchange_rate REAL NOT NULL,
  effective_date TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. EXTEND invoices with currency tracking
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS original_currency TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_amount REAL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_currency TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS conversion_rate REAL;

-- ═══════════════════════════════════════════════════════════════
-- 9. EXTEND client_compliances with currency tracking
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE client_compliances ADD COLUMN IF NOT EXISTS original_currency TEXT;
ALTER TABLE client_compliances ADD COLUMN IF NOT EXISTS converted_amount REAL;
ALTER TABLE client_compliances ADD COLUMN IF NOT EXISTS converted_currency TEXT;
ALTER TABLE client_compliances ADD COLUMN IF NOT EXISTS conversion_rate REAL;
