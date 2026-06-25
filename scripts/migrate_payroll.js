const postgres = require('postgres');

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  const sql = postgres(DATABASE_URL, { max: 1 });
  console.log('Connected to DB. Applying Payroll Schema Migrations...');

  try {
    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pay_group (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          org_id TEXT NOT NULL,
          client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          frequency TEXT NOT NULL,
          auto_run BOOLEAN DEFAULT false,
          cutoff_time TEXT,
          cutoff_timezone TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pay_schedule (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          org_id TEXT NOT NULL,
          client_id TEXT NOT NULL,
          pay_group_id TEXT NOT NULL REFERENCES pay_group(id) ON DELETE CASCADE,
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          pay_date DATE NOT NULL,
          processing_cutoff TIMESTAMP NOT NULL,
          status TEXT DEFAULT 'OPEN',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
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
          status TEXT DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS stat_holiday (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          org_id TEXT NOT NULL,
          client_id TEXT NOT NULL,
          province TEXT NOT NULL,
          year INTEGER NOT NULL,
          date DATE NOT NULL,
          name TEXT NOT NULL
      );
    `;

    console.log('✅ Successfully applied payroll schema tables.');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await sql.end();
  }
}

main();
