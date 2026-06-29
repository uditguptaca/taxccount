-- ═══════════════════════════════════════════════════════════════════════════
-- 013_payroll_module.sql
-- Complete Canadian Payroll Module schema
-- Uses CREATE TABLE IF NOT EXISTS so it's safe to re-run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Existing Tables (may already exist from scripts/migrate_payroll.js) ──

CREATE TABLE IF NOT EXISTS payroll_company (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    legal_name TEXT NOT NULL,
    business_number TEXT,
    payroll_program_account TEXT,
    default_province TEXT,
    remitter_type TEXT,
    bank_account_tokenized TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_id, client_id)
);

CREATE TABLE IF NOT EXISTS pay_group (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL,
    auto_run BOOLEAN DEFAULT false,
    cutoff_time TEXT,
    cutoff_timezone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pay_schedule (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    pay_group_id TEXT NOT NULL REFERENCES pay_group(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    processing_cutoff TIMESTAMP,
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_person (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    pay_group_id TEXT REFERENCES pay_group(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    department TEXT,
    province_of_employment TEXT,
    hire_date DATE,
    pay_type TEXT,
    pay_rate NUMERIC,
    standard_hours NUMERIC,
    federal_claim NUMERIC,
    provincial_claim NUMERIC,
    additional_tax NUMERIC,
    cpp_exempt BOOLEAN DEFAULT false,
    ei_exempt BOOLEAN DEFAULT false,
    northern_deduction NUMERIC,
    vacation_rate NUMERIC,
    vacation_pay_method TEXT,
    sin_tokenized TEXT,
    bank_account_tokenized TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS person_pay_item (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    person_id TEXT NOT NULL REFERENCES payroll_person(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    is_taxable BOOLEAN DEFAULT true,
    is_pensionable BOOLEAN DEFAULT true,
    is_insurable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ytd_balance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    person_id TEXT NOT NULL REFERENCES payroll_person(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,
    gross_pay NUMERIC DEFAULT 0,
    pensionable_earnings NUMERIC DEFAULT 0,
    insurable_earnings NUMERIC DEFAULT 0,
    federal_tax NUMERIC DEFAULT 0,
    provincial_tax NUMERIC DEFAULT 0,
    cpp_contribution NUMERIC DEFAULT 0,
    cpp2_contribution NUMERIC DEFAULT 0,
    ei_premium NUMERIC DEFAULT 0,
    employer_cpp NUMERIC DEFAULT 0,
    employer_cpp2 NUMERIC DEFAULT 0,
    employer_ei NUMERIC DEFAULT 0,
    vacation_accrued NUMERIC DEFAULT 0,
    vacation_paid NUMERIC DEFAULT 0,
    UNIQUE(person_id, tax_year)
);

CREATE TABLE IF NOT EXISTS stat_holiday (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    province TEXT NOT NULL,
    year INTEGER NOT NULL,
    date DATE NOT NULL,
    name TEXT NOT NULL
);

-- ─── NEW Tables ──────────────────────────────────────────────────────────

-- pay_run: Pay run header
CREATE TABLE IF NOT EXISTS pay_run (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    pay_group_id TEXT NOT NULL REFERENCES pay_group(id),
    run_type TEXT NOT NULL DEFAULT 'REGULAR',          -- REGULAR, OFF_CYCLE, BONUS, CORRECTION
    status TEXT NOT NULL DEFAULT 'DRAFT',               -- DRAFT, HOURS_ENTERED, CALCULATED, APPROVED, PAID, REVERSED
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    processing_cutoff TIMESTAMP,
    direct_deposit BOOLEAN DEFAULT true,
    remit_taxes BOOLEAN DEFAULT true,
    rate_table_year INTEGER DEFAULT 2026,
    total_gross NUMERIC(15,2) DEFAULT 0,
    total_deductions NUMERIC(15,2) DEFAULT 0,
    total_net NUMERIC(15,2) DEFAULT 0,
    total_employer_cost NUMERIC(15,2) DEFAULT 0,
    employee_count INTEGER DEFAULT 0,
    contractor_count INTEGER DEFAULT 0,
    approved_by TEXT,
    approved_at TIMESTAMP,
    reversed_at TIMESTAMP,
    reversed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- payslip: Per-person results for a pay run
CREATE TABLE IF NOT EXISTS payslip (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    pay_run_id TEXT NOT NULL REFERENCES pay_run(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES payroll_person(id),
    included BOOLEAN DEFAULT true,
    regular_hours NUMERIC(8,2) DEFAULT 0,
    overtime_hours NUMERIC(8,2) DEFAULT 0,
    regular_pay NUMERIC(15,2) DEFAULT 0,
    overtime_pay NUMERIC(15,2) DEFAULT 0,
    other_income NUMERIC(15,2) DEFAULT 0,
    gross_pay NUMERIC(15,2) DEFAULT 0,
    vacation_pay NUMERIC(15,2) DEFAULT 0,
    federal_tax NUMERIC(15,2) DEFAULT 0,
    provincial_tax NUMERIC(15,2) DEFAULT 0,
    cpp NUMERIC(15,2) DEFAULT 0,
    cpp2 NUMERIC(15,2) DEFAULT 0,
    ei NUMERIC(15,2) DEFAULT 0,
    other_deductions NUMERIC(15,2) DEFAULT 0,
    total_deductions NUMERIC(15,2) DEFAULT 0,
    net_pay NUMERIC(15,2) DEFAULT 0,
    employer_cpp NUMERIC(15,2) DEFAULT 0,
    employer_cpp2 NUMERIC(15,2) DEFAULT 0,
    employer_ei NUMERIC(15,2) DEFAULT 0,
    total_employer_cost NUMERIC(15,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'direct_deposit',       -- direct_deposit, cheque
    engine_output JSONB,                                -- full PayResult from the engine
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- remittance: CRA/RQ source deduction tracking
CREATE TABLE IF NOT EXISTS remittance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    pay_run_id TEXT REFERENCES pay_run(id),
    authority TEXT NOT NULL DEFAULT 'CRA',               -- CRA, REVENU_QUEBEC, WCB, EHT
    period_start DATE,
    period_end DATE,
    due_date DATE,
    total_cpp NUMERIC(15,2) DEFAULT 0,
    total_ei NUMERIC(15,2) DEFAULT 0,
    total_tax NUMERIC(15,2) DEFAULT 0,
    total_employer_cpp NUMERIC(15,2) DEFAULT 0,
    total_employer_ei NUMERIC(15,2) DEFAULT 0,
    total_amount NUMERIC(15,2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING',                       -- PENDING, FILED, PAID, LATE
    filed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- record_of_employment
CREATE TABLE IF NOT EXISTS record_of_employment (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES payroll_person(id),
    reason_code TEXT NOT NULL,                           -- A, D, E, K, etc.
    first_day_worked DATE,
    last_day_paid DATE,
    final_pay_period_end DATE,
    total_insurable_hours NUMERIC(10,2) DEFAULT 0,
    total_insurable_earnings NUMERIC(15,2) DEFAULT 0,
    insurable_earnings_by_period JSONB,                  -- array of period amounts
    status TEXT DEFAULT 'DRAFT',                         -- DRAFT, ISSUED, SUBMITTED
    issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tax_slip: T4/T4A/RL-1 year-end slips
CREATE TABLE IF NOT EXISTS tax_slip (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES payroll_person(id),
    tax_year INTEGER NOT NULL,
    slip_type TEXT NOT NULL,                             -- T4, T4A, RL1
    boxes JSONB NOT NULL DEFAULT '{}',                   -- box number -> amount mapping
    status TEXT DEFAULT 'DRAFT',                         -- DRAFT, ISSUED, AMENDED
    issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(person_id, tax_year, slip_type)
);

-- payroll_audit_log
CREATE TABLE IF NOT EXISTS payroll_audit_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,                           -- pay_run, payslip, person, company, etc.
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,                                -- CREATE, UPDATE, APPROVE, REVERSE, etc.
    actor_id TEXT,
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Indexes for performance ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pay_run_client ON pay_run(client_id);
CREATE INDEX IF NOT EXISTS idx_pay_run_status ON pay_run(status);
CREATE INDEX IF NOT EXISTS idx_pay_run_pay_date ON pay_run(pay_date);
CREATE INDEX IF NOT EXISTS idx_payslip_pay_run ON payslip(pay_run_id);
CREATE INDEX IF NOT EXISTS idx_payslip_person ON payslip(person_id);
CREATE INDEX IF NOT EXISTS idx_remittance_client ON remittance(client_id);
CREATE INDEX IF NOT EXISTS idx_remittance_due_date ON remittance(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON payroll_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_client ON payroll_audit_log(client_id);
CREATE INDEX IF NOT EXISTS idx_ytd_balance_person_year ON ytd_balance(person_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_payroll_person_client ON payroll_person(client_id);
CREATE INDEX IF NOT EXISTS idx_pay_schedule_group ON pay_schedule(pay_group_id);
