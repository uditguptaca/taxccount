import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { calculatePayPeriodDeductions, RATES_2026 } from '@/lib/canadian-payroll-engine';

export async function POST() {
  try {
    const db = getDb();
    // 1. Get first client
    const client = await db.prepare('SELECT id, display_name, org_id FROM clients LIMIT 1').get();
    if (!client) {
      return NextResponse.json({ error: 'No clients found in database to seed payroll for' }, { status: 400 });
    }
    const clientId = client.id;
    const orgId = client.org_id;

    // Clean up existing payroll data for this client first to allow clean re-runs
    await db.prepare('DELETE FROM remittance WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM payslip WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM pay_run WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM ytd_balance WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM payroll_person WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM pay_schedule WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM pay_group WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM payroll_company WHERE client_id = ?').run(clientId);
    await db.prepare('DELETE FROM stat_holiday WHERE client_id = ?').run(clientId);

    // 2. Seed payroll_company
    const companySql = `
      INSERT INTO payroll_company (org_id, client_id, legal_name, business_number, payroll_program_account, default_province, remitter_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;
    const company = await db.prepare(companySql).get(
      orgId, clientId, `${client.display_name} Inc.`, '123456789', '123456789RP0001', 'ON', 'Regular'
    );

    // 3. Seed 3 pay_groups
    const groupSql = `
      INSERT INTO pay_group (org_id, client_id, name, frequency, auto_run, cutoff_time, cutoff_timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;
    const gHourly = await db.prepare(groupSql).get(orgId, clientId, 'Hourly Staff', 'Weekly', false, '12:00', 'ET');
    const gSalaried = await db.prepare(groupSql).get(orgId, clientId, 'Salaried Team', 'Bi-weekly', true, '12:00', 'ET');
    const gMgmt = await db.prepare(groupSql).get(orgId, clientId, 'Management', 'Monthly', false, '12:00', 'ET');

    // 4. Seed pay_schedules for 2026
    const scheduleSql = `
      INSERT INTO pay_schedule (org_id, client_id, pay_group_id, period_start, period_end, pay_date, processing_cutoff, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Weekly Schedule (Weekly starts Thursday, paid next Friday)
    let dStart = new Date('2026-01-01T00:00:00');
    for (let i = 1; i <= 52; i++) {
      const startStr = dStart.toISOString().split('T')[0];
      const dEnd = new Date(dStart.getTime() + 6 * 24 * 3600 * 1000);
      const endStr = dEnd.toISOString().split('T')[0];
      const dPay = new Date(dEnd.getTime() + 5 * 24 * 3600 * 1000);
      const payStr = dPay.toISOString().split('T')[0];
      const cutoff = new Date(dPay.getTime() - 2 * 24 * 3600 * 1000);
      cutoff.setHours(12, 0, 0, 0);

      // We make the first 25 periods CLOSED, 26th OPEN, rest OPEN
      const status = i < 25 ? 'CLOSED' : (i === 25 ? 'OPEN' : 'OPEN');
      await db.prepare(scheduleSql).run(orgId, clientId, gHourly.id, startStr, endStr, payStr, cutoff.toISOString(), status);
      dStart = new Date(dStart.getTime() + 7 * 24 * 3600 * 1000);
    }

    // Bi-weekly Schedule (Bi-weekly starts Monday, paid Friday of next week)
    dStart = new Date('2026-01-05T00:00:00');
    for (let i = 1; i <= 26; i++) {
      const startStr = dStart.toISOString().split('T')[0];
      const dEnd = new Date(dStart.getTime() + 13 * 24 * 3600 * 1000);
      const endStr = dEnd.toISOString().split('T')[0];
      const dPay = new Date(dEnd.getTime() + 4 * 24 * 3600 * 1000); // paid Friday
      const payStr = dPay.toISOString().split('T')[0];
      const cutoff = new Date(dPay.getTime() - 2 * 24 * 3600 * 1000);
      cutoff.setHours(12, 0, 0, 0);

      const status = i < 12 ? 'CLOSED' : (i === 12 ? 'OPEN' : 'OPEN');
      await db.prepare(scheduleSql).run(orgId, clientId, gSalaried.id, startStr, endStr, payStr, cutoff.toISOString(), status);
      dStart = new Date(dStart.getTime() + 14 * 24 * 3600 * 1000);
    }

    // Monthly Schedule (Calendar month, paid 5th of next month)
    for (let i = 1; i <= 12; i++) {
      const startStr = `2026-${String(i).padStart(2, '0')}-01`;
      // Last day of month
      const dEnd = new Date(2026, i, 0);
      const endStr = dEnd.toISOString().split('T')[0];
      // Pay date 5th of next month
      const payMonth = i === 12 ? 1 : i + 1;
      const payYear = i === 12 ? 2027 : 2026;
      const payStr = `${payYear}-${String(payMonth).padStart(2, '0')}-05`;
      const cutoff = new Date(`${payYear}-${String(payMonth).padStart(2, '0')}-03T12:00:00`);

      const status = i < 5 ? 'CLOSED' : (i === 5 ? 'OPEN' : 'OPEN');
      await db.prepare(scheduleSql).run(orgId, clientId, gMgmt.id, startStr, endStr, payStr, cutoff.toISOString(), status);
    }

    // 5. Seed 5 payroll_persons
    const personSql = `
      INSERT INTO payroll_person (
        org_id, client_id, pay_group_id, first_name, last_name, type, title, department,
        province_of_employment, hire_date, pay_type, pay_rate, standard_hours,
        federal_claim, provincial_claim, additional_tax, cpp_exempt, ei_exempt,
        northern_deduction, vacation_rate, vacation_pay_method, sin_tokenized, bank_account_tokenized, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;

    const p1 = await db.prepare(personSql).get(
      orgId, clientId, gSalaried.id, 'Sarah', 'Chen', 'Employee', 'Senior Developer', 'Engineering',
      'ON', '2022-03-15', 'Salary', 85000, 40, 16452, 12747, 0, false, false, 0, 4, 'accrue', 'sin-sarah-last4-5678', 'bank-sarah-last4-1234', 'ACTIVE'
    );
    const p2 = await db.prepare(personSql).get(
      orgId, clientId, gHourly.id, 'James', 'Wilson', 'Employee', 'Support Lead', 'Operations',
      'ON', '2024-05-10', 'Hourly', 28.50, 40, 16452, 12747, 0, false, false, 0, 4, 'accrue', 'sin-james-last4-4321', 'bank-james-last4-8765', 'ACTIVE'
    );
    const p3 = await db.prepare(personSql).get(
      orgId, clientId, gSalaried.id, 'Maria', 'Garcia', 'Employee', 'Designer', 'Product',
      'BC', '2023-09-01', 'Salary', 72000, 40, 16452, 12580, 0, false, false, 0, 4, 'accrue', 'sin-maria-last4-9999', 'bank-maria-last4-8888', 'ACTIVE'
    );
    const p4 = await db.prepare(personSql).get(
      orgId, clientId, gHourly.id, 'Kevin', 'O\'Brien', 'Employee', 'Warehouse Coordinator', 'Logistics',
      'ON', '2025-01-10', 'Hourly', 32.00, 37.5, 16452, 12747, 0, false, false, 0, 4, 'accrue', 'sin-kevin-last4-1111', 'bank-kevin-last4-2222', 'ACTIVE'
    );
    const p5 = await db.prepare(personSql).get(
      orgId, clientId, gMgmt.id, 'Priya', 'Sharma', 'Employee', 'VP Operations', 'Management',
      'ON', '2020-01-15', 'Salary', 120000, 40, 16452, 12747, 100, false, false, 0, 6, 'accrue', 'sin-priya-last4-0000', 'bank-priya-last4-9999', 'ACTIVE'
    );

    // 6. Seed YTD Balances for 2026
    const ytdSql = `
      INSERT INTO ytd_balance (org_id, client_id, person_id, tax_year, gross_pay, pensionable_earnings, insurable_earnings, federal_tax, provincial_tax, cpp_contribution, cpp2_contribution, ei_premium, employer_cpp, employer_cpp2, employer_ei, vacation_accrued, vacation_paid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const people = [p1, p2, p3, p4, p5];
    for (const p of people) {
      await db.prepare(ytdSql).run(orgId, clientId, p.id, 2026, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    // 7. Seed stat_holidays
    const holidaySql = `
      INSERT INTO stat_holiday (org_id, client_id, province, year, date, name)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const holidays = [
      { prov: 'ON', date: '2026-01-01', name: 'New Year\'s Day' },
      { prov: 'ON', date: '2026-02-16', name: 'Family Day' },
      { prov: 'ON', date: '2026-04-03', name: 'Good Friday' },
      { prov: 'ON', date: '2026-05-18', name: 'Victoria Day' },
      { prov: 'ON', date: '2026-07-01', name: 'Canada Day' },
      { prov: 'ON', date: '2026-09-07', name: 'Labour Day' },
      { prov: 'ON', date: '2026-10-12', name: 'Thanksgiving' },
      { prov: 'ON', date: '2026-12-25', name: 'Christmas Day' },
      { prov: 'ON', date: '2026-12-26', name: 'Boxing Day' },
      { prov: 'BC', date: '2026-01-01', name: 'New Year\'s Day' },
      { prov: 'BC', date: '2026-02-16', name: 'Family Day' },
      { prov: 'BC', date: '2026-04-03', name: 'Good Friday' },
      { prov: 'BC', date: '2026-05-18', name: 'Victoria Day' },
      { prov: 'BC', date: '2026-07-01', name: 'Canada Day' },
      { prov: 'BC', date: '2026-08-03', name: 'British Columbia Day' },
      { prov: 'BC', date: '2026-09-07', name: 'Labour Day' },
      { prov: 'BC', date: '2026-10-12', name: 'Thanksgiving' },
      { prov: 'BC', date: '2026-11-11', name: 'Remembrance Day' },
      { prov: 'BC', date: '2026-12-25', name: 'Christmas Day' },
    ];
    for (const h of holidays) {
      await db.prepare(holidaySql).run(orgId, clientId, h.prov, 2026, h.date, h.name);
    }

    // 8. Seed one completed pay_run for Salaried Team
    // Let's run a completed payroll for the 12th period (paid May 29, 2026, start May 11, end May 24)
    const runId = uuidv4();
    const runSql = `
      INSERT INTO pay_run (
        id, org_id, client_id, pay_group_id, run_type, status, period_start, period_end, pay_date,
        direct_deposit, remit_taxes, rate_table_year, approved_by, approved_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.prepare(runSql).run(
      runId, orgId, clientId, gSalaried.id, 'REGULAR', 'PAID', '2026-05-11', '2026-05-24', '2026-05-29',
      true, true, 2026, 'firm-admin-uuid', '2026-05-27 10:00:00'
    );

    // Salaried team members are Sarah and Maria. Let's calculate deductions for them
    const teamMembers = [p1, p3];
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;
    let totalEmployerCost = 0;

    for (const member of teamMembers) {
      const payFrequency = 'biweekly';
      const grossThisPeriod = member.pay_rate / 26; // biweekly salary

      const calcResult = calculatePayPeriodDeductions({
        province: member.province_of_employment as any,
        frequency: payFrequency,
        grossThisPeriod,
        pensionableThisPeriod: grossThisPeriod,
        insurableThisPeriod: grossThisPeriod,
        federalClaim: member.federal_claim,
        provincialClaim: member.provincial_claim,
        additionalTaxThisPeriod: member.additional_tax || 0,
        cppExempt: member.cpp_exempt,
        ei_exempt: member.ei_exempt,
        ytdCppContribution: 0,
        ytdEiPremium: 0,
        ytdPensionableEarnings: 0,
        ytdInsurableEarnings: 0,
      }, RATES_2026);

      totalGross += grossThisPeriod;
      totalNet += calcResult.netPay;
      totalDeductions += calcResult.totalEmployeeDeductions;
      totalEmployerCost += calcResult.totalEmployerContributions;

      const payslipSql = `
        INSERT INTO payslip (
          id, org_id, client_id, pay_run_id, person_id, included, regular_hours, overtime_hours,
          regular_pay, overtime_pay, other_income, gross_pay, federal_tax, provincial_tax,
          cpp, cpp2, ei, total_deductions, net_pay, employer_cpp, employer_cpp2, employer_ei,
          total_employer_cost, payment_method, engine_output
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb)
      `;
      await db.prepare(payslipSql).run(
        uuidv4(), orgId, clientId, runId, member.id, true, member.standard_hours, 0,
        grossThisPeriod, 0, 0, grossThisPeriod, calcResult.federalTax, calcResult.provincialTax,
        calcResult.cpp, calcResult.cpp2, calcResult.ei, calcResult.totalEmployeeDeductions, calcResult.netPay,
        calcResult.employerCpp, calcResult.employerCpp2, calcResult.employerEi,
        calcResult.totalEmployerContributions, 'direct_deposit', JSON.stringify(calcResult)
      );

      // Add to member's YTD balances
      const updateYtdSql = `
        UPDATE ytd_balance
        SET gross_pay = gross_pay + ?,
            pensionable_earnings = pensionable_earnings + ?,
            insurable_earnings = insurable_earnings + ?,
            federal_tax = federal_tax + ?,
            provincial_tax = provincial_tax + ?,
            cpp_contribution = cpp_contribution + ?,
            cpp2_contribution = cpp2_contribution + ?,
            ei_premium = ei_premium + ?,
            employer_cpp = employer_cpp + ?,
            employer_cpp2 = employer_cpp2 + ?,
            employer_ei = employer_ei + ?,
            vacation_accrued = vacation_accrued + ?
        WHERE person_id = ? AND tax_year = 2026
      `;
      const vacationAccrued = (grossThisPeriod * (member.vacation_rate || 4)) / 100;
      await db.prepare(updateYtdSql).run(
        grossThisPeriod, grossThisPeriod, grossThisPeriod,
        calcResult.federalTax, calcResult.provincialTax, calcResult.cpp, calcResult.cpp2, calcResult.ei,
        calcResult.employerCpp, calcResult.employerCpp2, calcResult.employerEi,
        vacationAccrued, member.id
      );
    }

    // Update run totals
    await db.prepare(`
      UPDATE pay_run
      SET total_gross = ?, total_net = ?, total_deductions = ?, total_employer_cost = ?, employee_count = 2
      WHERE id = ?
    `).run(totalGross, totalNet, totalDeductions, totalEmployerCost, runId);

    // Create a remittance record for this run
    const remittanceSql = `
      INSERT INTO remittance (
        org_id, client_id, pay_run_id, authority, period_start, period_end, due_date,
        total_cpp, total_ei, total_tax, total_employer_cpp, total_employer_ei, total_amount, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const craCpp = 203.40;
    const craEi = 55.80;
    const craTax = 430.00;
    const totalRemit = (craCpp * 2) + (craEi * 2.4) + craTax;

    await db.prepare(remittanceSql).run(
      orgId, clientId, runId, 'CRA', '2026-05-01', '2026-05-31', '2026-06-15',
      craCpp, craEi, craTax, craCpp, craEi * 1.4, totalRemit, 'PAID'
    );

    // 6. Create a draft pay run for testing the wizard (Weekly group, period June 1 to 7, paid June 12)
    const draftRunId = uuidv4();
    const draftRunSql = `
      INSERT INTO pay_run (
        id, org_id, client_id, pay_group_id, period_start, period_end, pay_date, status,
        total_gross, total_net, total_deductions, total_employer_cost, employee_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0)
    `;
    await db.prepare(draftRunSql).run(
      draftRunId, orgId, clientId, gHourly.id, '2026-06-01', '2026-06-07', '2026-06-12', 'DRAFT'
    );

    // Also populate payslips for this draft run so the employee list is already there
    const hourlyEmployees = await db.prepare("SELECT * FROM payroll_person WHERE client_id = ? AND status = 'ACTIVE'").all(clientId);
    for (const member of hourlyEmployees) {
      const payslipSql = `
        INSERT INTO payslip (
          id, org_id, client_id, pay_run_id, person_id, included, regular_hours, overtime_hours,
          regular_pay, overtime_pay, other_income, gross_pay, federal_tax, provincial_tax,
          cpp, cpp2, ei, total_deductions, net_pay, employer_cpp, employer_cpp2, employer_ei,
          total_employer_cost, payment_method
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?)
      `;
      await db.prepare(payslipSql).run(
        uuidv4(), orgId, clientId, draftRunId, member.id, true, member.standard_hours, 0, 'direct_deposit'
      );
    }

    // 7. Create a pending remittance (due July 15, 2026)
    const pendingRemitSql = `
      INSERT INTO remittance (
        org_id, client_id, pay_run_id, authority, period_start, period_end, due_date,
        total_cpp, total_ei, total_tax, total_employer_cpp, total_employer_ei, total_amount, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const pendingCpp = 150.00;
    const pendingEi = 45.00;
    const pendingTax = 320.00;
    const pendingTotal = (pendingCpp * 2) + (pendingEi * 1.4 * 2) + pendingTax;

    await db.prepare(pendingRemitSql).run(
      orgId, clientId, runId, 'CRA', '2026-06-01', '2026-06-30', '2026-07-15',
      pendingCpp, pendingEi, pendingTax, pendingCpp, pendingEi * 1.4, pendingTotal, 'PENDING'
    );

    return NextResponse.json({
      success: true,
      message: 'Payroll seeding completed successfully',
      seeded: {
        company: `${client.display_name} Inc.`,
        payGroups: 3,
        employees: 5,
        completedPayRuns: 1,
        draftPayRuns: 1,
        pendingRemittances: 1
      }
    });

  } catch (error: any) {
    console.error('Error seeding payroll:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
