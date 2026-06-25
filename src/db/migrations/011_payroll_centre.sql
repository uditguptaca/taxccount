CREATE TABLE IF NOT EXISTS ledger_employees (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  sin TEXT NOT NULL,
  email TEXT,
  hire_date DATE,
  employment_type TEXT DEFAULT 'salary', -- salary or hourly
  pay_rate DECIMAL(15,2) DEFAULT 0, -- annual salary or hourly rate
  pay_frequency TEXT DEFAULT 'monthly', -- biweekly, semi_monthly, monthly
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_payslips (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  payroll_id TEXT NOT NULL, -- references ledger_payroll
  employee_id TEXT NOT NULL, -- references ledger_employees
  gross_pay DECIMAL(15,2) DEFAULT 0,
  tax_deduction DECIMAL(15,2) DEFAULT 0,
  cpp_deduction DECIMAL(15,2) DEFAULT 0,
  ei_deduction DECIMAL(15,2) DEFAULT 0,
  net_pay DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
