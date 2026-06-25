CREATE TABLE IF NOT EXISTS ledger_customers (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  billing_address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_invoices (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_invoice_lines (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  account_id TEXT NOT NULL, -- The revenue account
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) DEFAULT 0,
  amount DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_vendors (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  billing_address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_bills (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  bill_number TEXT,
  issue_date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'draft', -- draft, open, paid
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_bill_lines (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  bill_id TEXT NOT NULL,
  account_id TEXT NOT NULL, -- The expense account
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) DEFAULT 0,
  amount DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
