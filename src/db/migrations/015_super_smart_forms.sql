-- Migration: 015_super_smart_forms.sql
-- Description: Adds is_super_template, service_line, service_type, and parent_template_id columns to smart_forms table.

ALTER TABLE smart_forms ADD COLUMN IF NOT EXISTS is_super_template INTEGER DEFAULT 0;
ALTER TABLE smart_forms ADD COLUMN IF NOT EXISTS service_line TEXT;
ALTER TABLE smart_forms ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE smart_forms ADD COLUMN IF NOT EXISTS parent_template_id TEXT;
