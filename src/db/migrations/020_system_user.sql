-- Automated work (the recurring-engagement scheduler, the billing webhook,
-- document processing) records "system" as the person who acted, and many
-- columns (created_by, actor_id, uploaded_by, ...) must point at a real user.
-- This is that user. It cannot sign in: it is inactive and its password hash
-- matches nothing. PostgreSQL. Applied once by the app (see src/db/setup.js).
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_platform_admin, created_at, updated_at)
VALUES ('system', 'system@abidebylaw.invalid', '!', 'System', 'Automation', 'platform_admin', 0, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
