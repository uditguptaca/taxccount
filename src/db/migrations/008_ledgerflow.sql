CREATE TABLE IF NOT EXISTS ledgers (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  currency TEXT DEFAULT 'CAD',
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_accounts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  account_code TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
  subtype TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  is_system INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_transactions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  type TEXT, -- deposit, withdrawal, manual_journal
  status TEXT DEFAULT 'pending', -- pending, categorized, reconciled
  amount DECIMAL(15,2),
  reference TEXT,
  payee TEXT,
  uploaded_statement_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_journal_entries (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_statement_uploads (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  file_name TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'processing',
  parsed_count INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_categories (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  default_account_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_rules (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  search_text TEXT NOT NULL,
  condition TEXT DEFAULT 'contains',
  assign_account_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_reconciliations (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  period_start DATE,
  period_end DATE NOT NULL,
  statement_balance DECIMAL(15,2),
  cleared_balance DECIMAL(15,2),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_reports (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  report_type TEXT NOT NULL,
  date_start DATE,
  date_end DATE,
  data_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_assets (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  name TEXT NOT NULL,
  purchase_date DATE,
  purchase_price DECIMAL(15,2),
  salvage_value DECIMAL(15,2),
  life_years INTEGER,
  asset_account_id TEXT,
  accum_dep_account_id TEXT,
  exp_dep_account_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_loans (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  name TEXT NOT NULL,
  principal_amount DECIMAL(15,2),
  interest_rate DECIMAL(5,4),
  liability_account_id TEXT,
  interest_exp_account_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_payroll (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  run_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  total_gross DECIMAL(15,2),
  total_net DECIMAL(15,2),
  deductions_json TEXT,
  liabilities_json TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_gst (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales DECIMAL(15,2),
  gst_collected DECIMAL(15,2),
  gst_paid DECIMAL(15,2),
  net_due DECIMAL(15,2),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_balances (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  period_year INTEGER,
  period_month INTEGER,
  balance DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
