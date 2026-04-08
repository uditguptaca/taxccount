import { calculateComplianceDate } from './src/lib/compliance-date-calculator';

function runTests() {
  console.log("=== RUNNING EXCEL DATE CALCULATION VERIFICATION ===");

  // 1: Corp Tax Return (Dec 31 + 6 months) -> Jun 30
  const t1 = calculateComplianceDate({
    dependencyType: 'financial_year_corporate_tax',
    userProvidedDate: '2025-12-31',
    periodType: 'yearly', periodValue: 1,
    graceValue: 6, graceUnit: 'months'
  });
  console.log('1. Corp Tax (Exp: YYYY-06-30):', t1.nextDueDate.endsWith('-06-30') ? '✅ PASS' : '❌ FAIL ' + t1.nextDueDate);

  // 2: Federal Annual Return (May 5 + 1 year + 60 days) -> Jul 4
  const t2 = calculateComplianceDate({
    dependencyType: 'incorporation_date_federal',
    userProvidedDate: '2022-05-05',
    periodType: 'yearly', periodValue: 1,
    graceValue: 60, graceUnit: 'days'
  });
  console.log('2. Federal Annual (Exp: 2023-07-04):', t2.nextDueDate === '2023-07-04' ? '✅ PASS' : '❌ FAIL ' + t2.nextDueDate);

  // 3: Ontario Annual Return (Fixed Mar 31) -> Mar 31
  const t3 = calculateComplianceDate({
    dependencyType: 'calendar_year_fixed',
    userProvidedDate: '', // Should ignore, fixed to 03-31 in logic
    periodType: 'yearly', periodValue: 1,
    graceValue: 0, graceUnit: 'days'
  });
  console.log('3. Ontario Annual (Exp: YYYY-03-31):', t3.nextDueDate.endsWith('-03-31') ? '✅ PASS' : '❌ FAIL ' + t3.nextDueDate);

  // 4: BC Annual Return (Jan 20, 2023 + 1 year + 30 days) -> Feb 19, 2024
  const t4 = calculateComplianceDate({
    dependencyType: 'incorporation_date_provincial',
    userProvidedDate: '2023-01-20',
    periodType: 'yearly', periodValue: 1,
    graceValue: 30, graceUnit: 'days'
  });
  console.log('4. BC Annual (Exp: 2024-02-19):', t4.nextDueDate === '2024-02-19' ? '✅ PASS' : '❌ FAIL ' + t4.nextDueDate);

  // 5: GST/HST Return (Nov 30 + 1 qtr + 1 month) -> Mar 31
  const t5 = calculateComplianceDate({
    dependencyType: 'financial_year_gst',
    userProvidedDate: '2025-11-30',
    periodType: 'quarterly', periodValue: 1, // quarterly logic hardcodes 3 months added
    graceValue: 1, graceUnit: 'months'
  });
  console.log('5. GST/HST (Exp: YYYY-03-31):', t5.nextDueDate.endsWith('-03-31') ? '✅ PASS' : '❌ FAIL ' + t5.nextDueDate);

  // 6: Payroll (May 31 + 1 month + 15 days) -> Jul 15
  const t6 = calculateComplianceDate({
    dependencyType: 'financial_year_payroll',
    userProvidedDate: '2025-05-31',
    periodType: 'monthly', periodValue: 1,
    graceValue: 15, graceUnit: 'days'
  });
  console.log('6. Payroll (Exp: YYYY-07-15):', t6.nextDueDate.endsWith('-07-15') ? '✅ PASS' : '❌ FAIL ' + t6.nextDueDate);
}

runTests();
