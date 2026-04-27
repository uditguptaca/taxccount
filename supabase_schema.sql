
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      org_type TEXT NOT NULL CHECK(org_type IN ('consulting_firm','individual')),
      email TEXT NOT NULL,
      phone TEXT,
      address_line_1 TEXT,
      city TEXT,
      state_province TEXT,
      postal_code TEXT,
      country TEXT,
      jurisdiction TEXT,
      area_of_practice TEXT,
      currency_code TEXT DEFAULT 'USD',
      website TEXT,
      logo_url TEXT,
      tax_id TEXT,
      fiscal_year_end TEXT,
      plan TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free','starter','professional','enterprise')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','cancelled','pending')),
      max_users INTEGER DEFAULT 5,
      max_clients INTEGER DEFAULT 50,
      google_drive_connected INTEGER DEFAULT 0,
      google_drive_token TEXT,
      onboarded_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('platform_admin','firm_admin','admin','team_manager','team_member','client','individual')),
      avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_platform_admin INTEGER NOT NULL DEFAULT 0,
      personal_org_id TEXT REFERENCES organizations(id),
      mfa_secret TEXT,
      mfa_enabled INTEGER NOT NULL DEFAULT 0,
      mfa_recovery_codes TEXT,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organization_memberships (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL CHECK(role IN ('firm_admin','admin','team_manager','team_member','client')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','invited','suspended')),
      joined_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS firm_client_relationships (
      id TEXT PRIMARY KEY,
      firm_org_id TEXT NOT NULL REFERENCES organizations(id),
      client_user_id TEXT NOT NULL REFERENCES users(id),
      client_record_id TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending','terminated')),
      onboarded_by TEXT NOT NULL CHECK(onboarded_by IN ('firm','client_self')),
      invited_at TEXT,
      accepted_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(firm_org_id, client_user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_org_memberships_org ON organization_memberships(org_id);
    CREATE INDEX IF NOT EXISTS idx_org_memberships_user ON organization_memberships(user_id);
    CREATE INDEX IF NOT EXISTS idx_firm_client_firm ON firm_client_relationships(firm_org_id);
    CREATE INDEX IF NOT EXISTS idx_firm_client_user ON firm_client_relationships(client_user_id);
  


    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      description TEXT,
      manager_id TEXT REFERENCES users(id),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, name)
    );

    CREATE TABLE IF NOT EXISTS team_memberships (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      team_id TEXT NOT NULL REFERENCES teams(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      role_in_team TEXT NOT NULL CHECK(role_in_team IN ('manager','senior','member')),
      joined_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      UNIQUE(team_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS client_types_config (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, name)
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      client_code TEXT NOT NULL,
      display_name TEXT NOT NULL,
      client_type TEXT NOT NULL CHECK(client_type IN ('individual','business','trust','sole_proprietor')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','archived','pending')),
      primary_email TEXT,
      tax_id TEXT,
      primary_phone TEXT,
      address_line_1 TEXT,
      address_line_2 TEXT,
      city TEXT,
      state_province TEXT,
      postal_code TEXT,
      country TEXT,
      notes TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      client_type_id TEXT REFERENCES client_types_config(id),
      portal_user_id TEXT REFERENCES users(id),
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, client_code)
    );

    CREATE TABLE IF NOT EXISTS client_tags (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6b7280',
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, name)
    );

    CREATE TABLE IF NOT EXISTS client_tag_assignments (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      tag_id TEXT NOT NULL REFERENCES client_tags(id),
      UNIQUE(client_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS client_contacts (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      contact_name TEXT NOT NULL,
      relationship TEXT,
      email TEXT,
      phone TEXT,
      is_primary INTEGER NOT NULL DEFAULT 0,
      can_login INTEGER NOT NULL DEFAULT 0,
      notify INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS client_personal_info (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      info_key TEXT NOT NULL,
      info_value TEXT NOT NULL,
      is_sensitive INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, info_key)
    );
  


    CREATE TABLE IF NOT EXISTS template_categories (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, name)
    );

    CREATE TABLE IF NOT EXISTS compliance_templates (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      category TEXT,
      default_price DOUBLE PRECISION,
      due_date_rule TEXT,
      reminder_defaults TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      version INTEGER NOT NULL DEFAULT 1,
      assignee_type TEXT NOT NULL DEFAULT 'unassigned',
      default_assignee_id TEXT,
      is_recurring_default INTEGER NOT NULL DEFAULT 0,
      default_recurrence_rule TEXT,
      default_due_rule TEXT NOT NULL DEFAULT 'manual',
      default_due_offset_days INTEGER,
      color_code TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, code)
    );

    CREATE TABLE IF NOT EXISTS compliance_template_stages (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      stage_name TEXT NOT NULL,
      stage_code TEXT NOT NULL,
      stage_group TEXT NOT NULL CHECK(stage_group IN ('onboarding','work_in_progress','invoicing','completed')),
      sequence_order INTEGER NOT NULL,
      description TEXT,
      default_assignee_role TEXT,
      requires_approval INTEGER NOT NULL DEFAULT 0,
      estimated_days INTEGER,
      is_client_visible INTEGER NOT NULL DEFAULT 1,
      auto_advance INTEGER NOT NULL DEFAULT 0,
      UNIQUE(template_id, sequence_order),
      UNIQUE(template_id, stage_code)
    );

    CREATE TABLE IF NOT EXISTS compliance_template_documents (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      document_name TEXT NOT NULL,
      document_category TEXT NOT NULL CHECK(document_category IN ('onboarding','client_supporting','client_signed','final_document')),
      is_mandatory INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      upload_by TEXT NOT NULL DEFAULT 'either' CHECK(upload_by IN ('client','staff','either')),
      linked_stage_code TEXT
    );

    CREATE TABLE IF NOT EXISTS compliance_template_client_types (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      client_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(template_id, client_type)
    );

    CREATE TABLE IF NOT EXISTS client_compliances (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      engagement_code TEXT NOT NULL,
      client_id TEXT NOT NULL REFERENCES clients(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      financial_year TEXT NOT NULL,
      assessment_year TEXT,
      period TEXT,
      due_date TEXT,
      price DOUBLE PRECISION,
      status TEXT NOT NULL DEFAULT 'new',
      client_facing_status TEXT NOT NULL DEFAULT 'future',
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
      current_stage_id TEXT,
      assigned_team_id TEXT REFERENCES teams(id),
      assignee_type TEXT NOT NULL DEFAULT 'unassigned',
      assignee_id TEXT,
      period_label TEXT,
      template_version_at_creation INTEGER NOT NULL DEFAULT 1,
      recurrence_schedule_id TEXT,
      occurrence_key TEXT,
      notes TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, engagement_code)
    );

    CREATE TABLE IF NOT EXISTS client_compliance_stages (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      engagement_id TEXT NOT NULL REFERENCES client_compliances(id),
      template_stage_id TEXT REFERENCES compliance_template_stages(id),
      stage_name TEXT NOT NULL,
      stage_code TEXT NOT NULL,
      sequence_order INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','skipped','blocked')),
      assigned_user_id TEXT REFERENCES users(id),
      started_at TEXT,
      completed_at TEXT,
      completed_by TEXT REFERENCES users(id),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );
  


    CREATE TABLE IF NOT EXISTS document_files (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      engagement_id TEXT REFERENCES client_compliances(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      template_doc_id TEXT REFERENCES compliance_template_documents(id),
      file_name TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      document_category TEXT NOT NULL,
      financial_year TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      is_client_visible INTEGER NOT NULL DEFAULT 1,
      is_internal_only INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','viewed','signed','archived')),
      approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(approval_status IN ('PENDING','APPROVED','REJECTED','AWAITING_SIGNATURE')),
      uploaded_by TEXT NOT NULL REFERENCES users(id),
      linked_stage_code TEXT,
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      invoice_number TEXT NOT NULL,
      engagement_id TEXT REFERENCES client_compliances(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      amount DOUBLE PRECISION NOT NULL,
      tax_amount DOUBLE PRECISION DEFAULT 0,
      total_amount DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','paid','partially_paid','overdue','cancelled')),
      issued_date TEXT,
      due_date TEXT,
      paid_date TEXT,
      paid_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      payment_method TEXT,
      notes TEXT,
      description TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, invoice_number)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      amount DOUBLE PRECISION NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT,
      reference_number TEXT,
      notes TEXT,
      recorded_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      client_id TEXT REFERENCES clients(id),
      engagement_id TEXT REFERENCES client_compliances(id),
      description TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      hourly_rate DOUBLE PRECISION,
      is_billable INTEGER NOT NULL DEFAULT 1,
      entry_date TEXT NOT NULL,
      started_at TEXT,
      ended_at TEXT,
      status TEXT NOT NULL DEFAULT 'logged' CHECK(status IN ('logged','invoiced','written_off')),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      proposal_number TEXT NOT NULL,
      client_id TEXT NOT NULL REFERENCES clients(id),
      title TEXT NOT NULL,
      description TEXT,
      services TEXT,
      total_amount DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','accepted','declined','expired')),
      sent_date TEXT,
      accepted_date TEXT,
      expiry_date TEXT,
      payment_terms TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, proposal_number)
    );
  


    CREATE TABLE IF NOT EXISTS chat_threads (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      thread_type TEXT NOT NULL CHECK(thread_type IN ('client_facing','internal')),
      client_id TEXT REFERENCES clients(id),
      engagement_id TEXT REFERENCES client_compliances(id),
      subject TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_message_at TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      thread_id TEXT NOT NULL REFERENCES chat_threads(id),
      sender_id TEXT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      is_internal INTEGER NOT NULL DEFAULT 0,
      has_attachment INTEGER NOT NULL DEFAULT 0,
      attachment_file_id TEXT REFERENCES document_files(id),
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS client_tasks (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      thread_id TEXT NOT NULL REFERENCES chat_threads(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      task_name TEXT NOT NULL,
      task_type TEXT NOT NULL DEFAULT 'custom',
      priority TEXT NOT NULL DEFAULT 'normal',
      due_date TEXT,
      description TEXT,
      engagement_id TEXT,
      completion_evidence_id TEXT,
      completion_notes TEXT,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW()
    );
  


    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      reminder_type TEXT NOT NULL,
      engagement_id TEXT REFERENCES client_compliances(id),
      client_id TEXT REFERENCES clients(id),
      user_id TEXT REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT,
      trigger_date TEXT NOT NULL,
      trigger_time TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurrence_rule TEXT,
      channel TEXT NOT NULL DEFAULT 'both' CHECK(channel IN ('email','in_app','both')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','dismissed','cancelled')),
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inbox_items (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      item_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      client_id TEXT REFERENCES clients(id),
      link_type TEXT,
      link_id TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activity_feed (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      actor_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      entity_name TEXT,
      client_id TEXT REFERENCES clients(id),
      details TEXT,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT,
      link_type TEXT,
      link_id TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      org_id TEXT REFERENCES organizations(id),
      actor_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT NOW()
    );
  


    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      lead_code TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT,
      company_name TEXT,
      email TEXT,
      phone TEXT,
      lead_type TEXT NOT NULL DEFAULT 'individual' CHECK(lead_type IN ('individual','corporation','trust','partnership','sole_proprietor')),
      source TEXT NOT NULL DEFAULT 'website' CHECK(source IN ('website','referral','call','walk_in','email','social_media','other')),
      pipeline_stage TEXT NOT NULL DEFAULT 'new_inquiry' CHECK(pipeline_stage IN ('new_inquiry','contacted','meeting_scheduled','proposal_sent','negotiation','qualified','converted','lost')),
      lead_score TEXT NOT NULL DEFAULT 'warm' CHECK(lead_score IN ('hot','warm','cold')),
      expected_value DOUBLE PRECISION DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','converted','lost','archived')),
      assigned_to TEXT REFERENCES users(id),
      converted_client_id TEXT REFERENCES clients(id),
      tags TEXT,
      notes TEXT,
      address_line_1 TEXT,
      city TEXT,
      state_province TEXT,
      postal_code TEXT,
      next_followup_date TEXT,
      last_contact_date TEXT,
      lost_reason TEXT,
      referral_source TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, lead_code)
    );

    CREATE TABLE IF NOT EXISTS lead_activities (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL CHECK(activity_type IN ('call','email','meeting','whatsapp','note','status_change','stage_change')),
      summary TEXT NOT NULL,
      outcome TEXT,
      next_action TEXT,
      contact_date TEXT NOT NULL DEFAULT NOW(),
      duration_minutes INTEGER,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_tasks (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT REFERENCES users(id),
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
      completed_at TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_documents (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL DEFAULT 0,
      mime_type TEXT NOT NULL DEFAULT 'application/pdf',
      category TEXT NOT NULL DEFAULT 'general' CHECK(category IN ('general','quote','agreement','id_document','financial','other')),
      uploaded_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_proposals (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      service_name TEXT NOT NULL,
      description TEXT,
      price DOUBLE PRECISION NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(org_id);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline_stage);
  


    CREATE TABLE IF NOT EXISTS template_reminder_rules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      offset_value INTEGER NOT NULL,
      offset_unit TEXT NOT NULL CHECK(offset_unit IN ('days','weeks')),
      channel TEXT NOT NULL DEFAULT 'both' CHECK(channel IN ('email','in_app','both')),
      recipient_scope TEXT NOT NULL DEFAULT 'client' CHECK(recipient_scope IN ('client','staff','both')),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS template_questions (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('text','date','select','file_upload','number')),
      is_required INTEGER NOT NULL DEFAULT 0,
      sequence_order INTEGER NOT NULL,
      options TEXT,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS engagement_reminder_rules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      engagement_id TEXT NOT NULL REFERENCES client_compliances(id),
      offset_value INTEGER NOT NULL,
      offset_unit TEXT NOT NULL CHECK(offset_unit IN ('days','weeks')),
      channel TEXT NOT NULL DEFAULT 'both' CHECK(channel IN ('email','in_app','both')),
      recipient_scope TEXT NOT NULL DEFAULT 'client' CHECK(recipient_scope IN ('client','staff','both')),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS engagement_questions (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      engagement_id TEXT NOT NULL REFERENCES client_compliances(id),
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('text','date','select','file_upload','number')),
      is_required INTEGER NOT NULL DEFAULT 0,
      sequence_order INTEGER NOT NULL,
      options TEXT,
      answer_text TEXT,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS engagement_doc_requirements (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      engagement_id TEXT NOT NULL REFERENCES client_compliances(id),
      document_name TEXT NOT NULL,
      document_category TEXT NOT NULL,
      is_mandatory INTEGER NOT NULL DEFAULT 0,
      upload_by TEXT NOT NULL DEFAULT 'either',
      linked_stage_code TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','uploaded','verified')),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS engagement_recurrence_schedules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      source_engagement_id TEXT NOT NULL REFERENCES client_compliances(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      rrule TEXT NOT NULL,
      dtstart TEXT NOT NULL,
      until_date TEXT,
      occurrence_count INTEGER,
      next_occurrence_date TEXT NOT NULL,
      last_generated_date TEXT,
      timezone TEXT NOT NULL DEFAULT 'America/Toronto',
      assignee_type TEXT NOT NULL DEFAULT 'unassigned',
      assignee_id TEXT,
      price DOUBLE PRECISION,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS engagement_letters (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      proposal_id TEXT REFERENCES proposals(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      engagement_id TEXT REFERENCES client_compliances(id),
      legal_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','signed','voided')),
      signed_at TEXT,
      signed_by_ip TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS e_signatures (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      entity_type TEXT NOT NULL CHECK(entity_type IN ('engagement_letter','document')),
      entity_id TEXT NOT NULL,
      signer_id TEXT NOT NULL REFERENCES users(id),
      signature_image_url TEXT,
      ip_address TEXT,
      signed_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_account_roles (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      contact_id TEXT NOT NULL REFERENCES client_contacts(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      role TEXT NOT NULL CHECK(role IN ('owner','authorized','billing','signer')),
      can_view_compliance INTEGER NOT NULL DEFAULT 1,
      can_upload_documents INTEGER NOT NULL DEFAULT 1,
      can_delete_own_uploads INTEGER NOT NULL DEFAULT 0,
      can_approve_documents INTEGER NOT NULL DEFAULT 0,
      can_esign INTEGER NOT NULL DEFAULT 0,
      can_chat INTEGER NOT NULL DEFAULT 1,
      can_create_reminders INTEGER NOT NULL DEFAULT 1,
      can_view_invoices INTEGER NOT NULL DEFAULT 0,
      can_pay_invoices INTEGER NOT NULL DEFAULT 0,
      can_add_contacts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(contact_id, client_id)
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      document_id TEXT NOT NULL REFERENCES document_files(id),
      version_number INTEGER NOT NULL DEFAULT 1,
      file_name TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      uploaded_by TEXT NOT NULL REFERENCES users(id),
      is_locked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(document_id, version_number)
    );

    CREATE TABLE IF NOT EXISTS portal_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      device_info TEXT,
      ip_address TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT NOW(),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recurring_schedules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      template_id TEXT NOT NULL REFERENCES compliance_templates(id),
      frequency TEXT NOT NULL CHECK(frequency IN ('monthly','quarterly','annual')),
      start_date TEXT NOT NULL,
      next_run_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reminder_templates (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      cascade_config_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wiki_pages (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      title TEXT NOT NULL,
      content TEXT,
      author_id TEXT NOT NULL REFERENCES users(id),
      connection_type TEXT,
      connection_id TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organizer_templates (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organizer_template_sections (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES organizer_templates(id),
      title TEXT NOT NULL,
      sequence_order INTEGER NOT NULL,
      UNIQUE(template_id, sequence_order)
    );

    CREATE TABLE IF NOT EXISTS organizer_template_questions (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL REFERENCES organizer_template_sections(id),
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('text','yes_no','date','document','multiple_choice')),
      is_required INTEGER NOT NULL DEFAULT 0,
      sequence_order INTEGER NOT NULL,
      options TEXT,
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organizer_instances (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      template_id TEXT NOT NULL REFERENCES organizer_templates(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      engagement_id TEXT REFERENCES client_compliances(id),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed')),
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organizer_answers (
      id TEXT PRIMARY KEY,
      instance_id TEXT NOT NULL REFERENCES organizer_instances(id),
      question_id TEXT NOT NULL REFERENCES organizer_template_questions(id),
      answer_text TEXT,
      document_file_id TEXT REFERENCES document_files(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(instance_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS workflow_rules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      pipeline_template_id TEXT REFERENCES compliance_templates(id),
      trigger_event TEXT NOT NULL CHECK(trigger_event IN ('ORGANIZER_COMPLETED','SIGNATURE_COLLECTED','INVOICE_PAID','DOCUMENT_UPLOADED','STAGE_COMPLETED')),
      conditions TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workflow_actions (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      rule_id TEXT NOT NULL REFERENCES workflow_rules(id),
      action_type TEXT NOT NULL CHECK(action_type IN ('MOVE_STAGE','CREATE_TASK','SEND_MESSAGE','AUTO_TAG')),
      action_payload TEXT NOT NULL,
      sequence_order INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT NOW()
    );
  


    CREATE TABLE IF NOT EXISTS staff_tasks (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT NOT NULL REFERENCES users(id),
      assigned_by TEXT NOT NULL REFERENCES users(id),
      client_id TEXT REFERENCES clients(id),
      engagement_id TEXT REFERENCES client_compliances(id),
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
      notes TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS staff_reminders (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT,
      related_task_type TEXT CHECK(related_task_type IN ('stage','staff_task')),
      related_task_id TEXT,
      trigger_date TEXT NOT NULL,
      days_before_due INTEGER DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','dismissed','snoozed')),
      created_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_staff_tasks_org ON staff_tasks(org_id);
    CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned ON staff_tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_staff_reminders_org ON staff_reminders(org_id);
  


    CREATE TABLE IF NOT EXISTS personal_compliance_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      org_id TEXT REFERENCES organizations(id),
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'custom' CHECK(category IN ('tax_filing','documents_ids','insurance','property','education','medical','financial','custom')),
      description TEXT,
      due_date TEXT,
      recurrence_rule TEXT,
      recurrence_label TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','overdue')),
      urgency TEXT NOT NULL DEFAULT 'green' CHECK(urgency IN ('red','yellow','green','gray')),
      assigned_consultant_id TEXT,
      notes TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personal_family_members (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      org_id TEXT REFERENCES organizations(id),
      name TEXT NOT NULL,
      relationship TEXT NOT NULL CHECK(relationship IN ('spouse','child','parent','grandparent','sibling','other')),
      date_of_birth TEXT,
      email TEXT,
      phone TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personal_family_compliance (
      id TEXT PRIMARY KEY,
      family_member_id TEXT NOT NULL REFERENCES personal_family_members(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      org_id TEXT REFERENCES organizations(id),
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'custom',
      description TEXT,
      due_date TEXT,
      recurrence_rule TEXT,
      recurrence_label TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','overdue')),
      urgency TEXT NOT NULL DEFAULT 'green' CHECK(urgency IN ('red','yellow','green','gray')),
      notes TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personal_entities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      org_id TEXT REFERENCES organizations(id),
      name TEXT NOT NULL,
      entity_type TEXT NOT NULL CHECK(entity_type IN ('business','partnership','trust','sole_proprietorship','other')),
      registration_number TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personal_entity_compliance (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL REFERENCES personal_entities(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      org_id TEXT REFERENCES organizations(id),
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'custom',
      description TEXT,
      due_date TEXT,
      recurrence_rule TEXT,
      recurrence_label TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','overdue')),
      urgency TEXT NOT NULL DEFAULT 'green' CHECK(urgency IN ('red','yellow','green','gray')),
      notes TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personal_consultants (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      org_id TEXT REFERENCES organizations(id),
      name TEXT NOT NULL,
      specialty TEXT NOT NULL DEFAULT 'general' CHECK(specialty IN ('tax_advisor','legal_expert','immigration_lawyer','financial_planner','insurance_agent','general','other')),
      email TEXT,
      phone TEXT,
      company TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personal_consultant_assignments (
      id TEXT PRIMARY KEY,
      consultant_id TEXT NOT NULL REFERENCES personal_consultants(id) ON DELETE CASCADE,
      compliance_item_id TEXT NOT NULL,
      compliance_type TEXT NOT NULL CHECK(compliance_type IN ('personal','family','entity')),
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(consultant_id, compliance_item_id)
    );

    CREATE INDEX IF NOT EXISTS idx_pci_user ON personal_compliance_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_pfm_user ON personal_family_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_pe_user ON personal_entities(user_id);
    CREATE INDEX IF NOT EXISTS idx_pc_user ON personal_consultants(user_id);
  


    CREATE TABLE IF NOT EXISTS firm_consultant_onboarding_rules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id),
      consultant_id TEXT NOT NULL REFERENCES users(id),
      assigned_clients TEXT, -- JSON array of client_ids
      assigned_entities TEXT, -- JSON array of entity_ids
      visibility_scopes TEXT, -- JSON object mapping module: boolean
      onboarding_status TEXT NOT NULL DEFAULT 'draft' CHECK(onboarding_status IN ('draft','invited','pending_setup','active','in_review','suspended','archived')),
      role_type TEXT NOT NULL DEFAULT 'external_consultant' CHECK(role_type IN ('internal_team','shared_accountant','external_consultant')),
      internal_notes TEXT,
      priority_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW(),
      updated_at TEXT NOT NULL DEFAULT NOW(),
      UNIQUE(org_id, consultant_id)
    );
  


    CREATE TABLE IF NOT EXISTS user_reporting_preferences (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      default_date_range TEXT NOT NULL DEFAULT '30d' CHECK(default_date_range IN ('7d','30d','90d','this_month','last_month','year')),
      target_billable_hours_weekly INTEGER NOT NULL DEFAULT 35,
      target_utilization_pct INTEGER NOT NULL DEFAULT 80,
      visible_kpis TEXT, -- JSON array
      updated_at TEXT NOT NULL DEFAULT NOW()
    );
  


    CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(org_id);
    CREATE INDEX IF NOT EXISTS idx_engagements_org ON client_compliances(org_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(org_id);
    CREATE INDEX IF NOT EXISTS idx_documents_org ON document_files(org_id);
    CREATE INDEX IF NOT EXISTS idx_threads_org ON chat_threads(org_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_org ON reminders(org_id);
    CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_feed(org_id);
    CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(org_id);
  
-- ══════════════════════════════════════════════════════════════════
-- SERVICE MASTER MODULE — Migration 002
-- Platform-level compliance catalog + user selection tables
-- ══════════════════════════════════════════════════════════════════

-- ── Reference Tables (Steps 1-4) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS sm_countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  iso_code TEXT UNIQUE,
  financial_year_end_default TEXT,
  fy_is_fixed INTEGER NOT NULL DEFAULT 0,
  calendar_year_end TEXT DEFAULT '12-31',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sm_states (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES sm_countries(id),
  name TEXT NOT NULL,
  code TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT NOW(),
  UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS sm_entity_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sm_departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT NOW()
);

-- ── Service Master Core Tables (Steps 5-9) ──────────────────────

CREATE TABLE IF NOT EXISTS sm_compliance_heads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  icon TEXT,
  color_code TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT NOW(),
  updated_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sm_sub_compliances (
  id TEXT PRIMARY KEY,
  compliance_head_id TEXT NOT NULL REFERENCES sm_compliance_heads(id),
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  brief TEXT,
  has_compliance_date INTEGER NOT NULL DEFAULT 1,
  dependency_type TEXT,
  dependency_label TEXT,
  period_type TEXT,
  period_value INTEGER DEFAULT 1,
  grace_value INTEGER DEFAULT 0,
  grace_unit TEXT,
  is_compulsory INTEGER NOT NULL DEFAULT 0,
  undertaking_required INTEGER NOT NULL DEFAULT 0,
  undertaking_text TEXT,
  quick_create_enabled INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT NOW(),
  updated_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sm_service_rules (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  country_id TEXT REFERENCES sm_countries(id),
  state_id TEXT REFERENCES sm_states(id),
  entity_type_id TEXT REFERENCES sm_entity_types(id),
  department_id TEXT REFERENCES sm_departments(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT NOW()
);

-- ── Step 12: Applicability Questions ─────────────────────────────

CREATE TABLE IF NOT EXISTS sm_questions (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'yes_no' CHECK(question_type IN ('yes_no','text','number','select','date')),
  description TEXT,
  is_compulsory_trigger INTEGER NOT NULL DEFAULT 0,
  trigger_value TEXT,
  triggers_sub_compliance_id TEXT REFERENCES sm_sub_compliances(id),
  threshold_context TEXT,
  parent_question_id TEXT REFERENCES sm_questions(id),
  options TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT NOW()
);

-- ── Step 10: Information Requisition Form Fields ─────────────────

CREATE TABLE IF NOT EXISTS sm_info_fields (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text' CHECK(field_type IN ('text','number','date','date_month','attachment','checkbox','textarea','select','undertaking')),
  is_required INTEGER NOT NULL DEFAULT 0,
  placeholder TEXT,
  help_text TEXT,
  options TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT NOW()
);

-- ── Step 13: Penalties ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sm_penalties (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  description TEXT NOT NULL,
  penalty_type TEXT NOT NULL DEFAULT 'fixed' CHECK(penalty_type IN ('fixed','percentage','per_day','progressive','custom')),
  amount DOUBLE PRECISION,
  rate DOUBLE PRECISION,
  max_amount DOUBLE PRECISION,
  details TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT NOW()
);

-- ── User-Facing Tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_compliance_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  country_id TEXT REFERENCES sm_countries(id),
  state_id TEXT REFERENCES sm_states(id),
  entity_type_id TEXT REFERENCES sm_entity_types(id),
  company_name TEXT,
  business_number TEXT,
  gst_number TEXT,
  payroll_number TEXT,
  directors TEXT,
  contact_person TEXT,
  address TEXT,
  financial_year_end_income_tax TEXT,
  incorporation_date_federal TEXT,
  incorporation_date_provincial TEXT,
  financial_year_end_gst TEXT,
  financial_year_end_payroll TEXT,
  additional_dates TEXT,
  discovery_method TEXT CHECK(discovery_method IN ('auto_discovery','manual_selection')),
  undertaking_accepted INTEGER NOT NULL DEFAULT 0,
  undertaking_accepted_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),
  created_at TEXT NOT NULL DEFAULT NOW(),
  updated_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_selected_compliances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_id TEXT NOT NULL REFERENCES user_compliance_profiles(id),
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  service_rule_id TEXT REFERENCES sm_service_rules(id),
  selection_method TEXT NOT NULL DEFAULT 'manual' CHECK(selection_method IN ('compulsory','auto_suggested','manual')),
  base_date TEXT,
  calculated_due_date TEXT,
  confirmed_due_date TEXT,
  recurrence_type TEXT,
  calculation_formula TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','completed')),
  personal_compliance_item_id TEXT REFERENCES personal_compliance_items(id),
  undertaking_accepted INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT NOW(),
  updated_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_question_answers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_id TEXT NOT NULL REFERENCES user_compliance_profiles(id),
  question_id TEXT NOT NULL REFERENCES sm_questions(id),
  answer_text TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_info_responses (
  id TEXT PRIMARY KEY,
  selected_compliance_id TEXT NOT NULL REFERENCES user_selected_compliances(id),
  info_field_id TEXT NOT NULL REFERENCES sm_info_fields(id),
  response_text TEXT,
  response_file_path TEXT,
  created_at TEXT NOT NULL DEFAULT NOW(),
  updated_at TEXT NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sm_states_country ON sm_states(country_id);
CREATE INDEX IF NOT EXISTS idx_sm_sub_comp_head ON sm_sub_compliances(compliance_head_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_sub ON sm_service_rules(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_country ON sm_service_rules(country_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_state ON sm_service_rules(state_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_entity ON sm_service_rules(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_dept ON sm_service_rules(department_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_sub ON sm_questions(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_parent ON sm_questions(parent_question_id);
CREATE INDEX IF NOT EXISTS idx_sm_info_fields_sub ON sm_info_fields(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_sm_penalties_sub ON sm_penalties(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_user_comp_profiles_user ON user_compliance_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sel_comp_user ON user_selected_compliances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sel_comp_sub ON user_selected_compliances(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_user_sel_comp_profile ON user_selected_compliances(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_q_answers_profile ON user_question_answers(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_info_resp_sel ON user_info_responses(selected_compliance_id);


-- Migration 003: Updated sm_questions with additional dependency columns
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS country_id TEXT REFERENCES sm_countries(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS state_id TEXT REFERENCES sm_states(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS entity_type_id TEXT REFERENCES sm_entity_types(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS department_id TEXT REFERENCES sm_departments(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS compliance_head_id TEXT REFERENCES sm_compliance_heads(id);

CREATE INDEX IF NOT EXISTS idx_sm_questions_country ON sm_questions(country_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_state ON sm_questions(state_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_entity ON sm_questions(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_dept ON sm_questions(department_id);
