const fs = require('fs');

const outFile = 'c:\\Users\\uditg\\OneDrive\\Antigravity\\taxccount\\src\\lib\\tax-intake-questions.ts';

const out = [];
out.push(`import { TaxIntakeModule, ScreeningCategory } from './tax-intake-types';\n`);

out.push(`export const SCREENING_CATEGORIES: ScreeningCategory[] = [
  {
    id: 'SC_EMPLOYMENT',
    title: 'Employment & Pensions',
    icon: 'briefcase',
    questions: [
      { id: 'SQ_EMPLOYMENT', text: 'Did you have employment income (T4)?', activatesModules: ['H_EMPLOYMENT', 'G_TAX_SLIPS'] },
      { id: 'SQ_TIPS', text: 'Did you earn tips or gratuities not on a T4?', activatesModules: ['H_EMPLOYMENT'] },
      { id: 'SQ_PENSION', text: 'Did you receive pension income (T4A, T4A(P), T4A(OAS), T4RSP, T4RIF)?', activatesModules: ['I_PENSIONS', 'G_TAX_SLIPS'] },
      { id: 'SQ_EI', text: 'Did you receive Employment Insurance (T4E)?', activatesModules: ['I_PENSIONS', 'G_TAX_SLIPS'] }
    ]
  },
  {
    id: 'SC_BUSINESS',
    title: 'Business & Self-Employment',
    icon: 'store',
    questions: [
      { id: 'SQ_SELF_EMPLOYED', text: 'Did you have self-employment or gig economy income?', activatesModules: ['J_SELF_EMPLOYMENT'] },
      { id: 'SQ_FARMING', text: 'Did you have farming or fishing income?', activatesModules: ['K_FARMING_FISHING'] },
      { id: 'SQ_PARTNERSHIP', text: 'Were you a member of a partnership (T5013)?', activatesModules: ['J_SELF_EMPLOYMENT', 'G_TAX_SLIPS'] }
    ]
  },
  {
    id: 'SC_INVESTMENT',
    title: 'Investments & Property',
    icon: 'trending-up',
    questions: [
      { id: 'SQ_INTEREST', text: 'Did you receive interest, dividends, or other investment income (T5, T3)?', activatesModules: ['N_INVESTMENTS', 'G_TAX_SLIPS'] },
      { id: 'SQ_CAPITAL_GAINS', text: 'Did you sell any stocks, bonds, real estate, or other capital property?', activatesModules: ['O_CAPITAL_GAINS'] },
      { id: 'SQ_CRYPTO', text: 'Did you own, sell, or trade cryptocurrency?', activatesModules: ['Q_CRYPTO'] },
      { id: 'SQ_RENTAL', text: 'Did you earn rental income?', activatesModules: ['M_RENTAL'] },
      { id: 'SQ_FOREIGN', text: 'Did you own specified foreign property costing more than $100,000 CAD?', activatesModules: ['R_FOREIGN'] }
    ]
  },
  {
    id: 'SC_DEDUCTIONS',
    title: 'Deductions & Credits',
    icon: 'file-text',
    questions: [
      { id: 'SQ_RRSP', text: 'Did you contribute to an RRSP or PRPP?', activatesModules: ['S_RRSP_PLANS'] },
      { id: 'SQ_FHSA', text: 'Did you open or contribute to a First Home Savings Account (FHSA)?', activatesModules: ['T_FHSA_REGISTERED'] },
      { id: 'SQ_MEDICAL', text: 'Do you have out-of-pocket medical expenses or disability claims?', activatesModules: ['X_MEDICAL_DISABILITY'] },
      { id: 'SQ_DONATIONS', text: 'Did you make charitable donations or political contributions?', activatesModules: ['Z_DONATIONS_CREDITS'] },
      { id: 'SQ_EDUCATION', text: 'Did you pay tuition fees or have student loan interest?', activatesModules: ['W_EDUCATION'] },
      { id: 'SQ_CHILDCARE', text: 'Did you pay childcare expenses or make support payments?', activatesModules: ['V_CHILDCARE_SUPPORT'] },
      { id: 'SQ_MOVING', text: 'Did you move at least 40km for work or school, or buy a home?', activatesModules: ['Y_HOUSING_MOVING'] },
      { id: 'SQ_EMPLOYMENT_EXP', text: 'Did you incur employment expenses (e.g., home office, vehicle) required by your employer (T2200)?', activatesModules: ['U_EMPLOYMENT_EXPENSES'] }
    ]
  }
];\n`);

out.push(`export const TAX_INTAKE_MODULES: TaxIntakeModule[] = [\n`);

// A_ENGAGEMENT
out.push(`  {
    code: 'A_ENGAGEMENT',
    title: 'Engagement & Getting Started',
    description: 'Let us get started with your tax filing terms and year.',
    icon: 'clipboard',
    phase: 'getting_started',
    sortOrder: 1,
    alwaysVisible: true,
    sections: [
      {
        id: 'S_A_ENGAGEMENT_MAIN',
        moduleId: 'A_ENGAGEMENT',
        title: 'Engagement Details',
        sortOrder: 1,
        isConditional: false,
        isRepeatable: false
      }
    ],
    questions: [
`);
for (let i = 1; i <= 25; i++) {
  out.push(`      {
        id: 'Q_A_ENGAGEMENT_${i}',
        sectionId: 'S_A_ENGAGEMENT_MAIN',
        moduleId: 'A_ENGAGEMENT',
        text: 'Engagement Question ${i}?',
        helpText: 'Help text for engagement ${i}.',
        inputType: 'text',
        repeatable: false,
        taxYear: 'all',
        allowUnsure: true,
        allowProvideLater: true,
        allowAskPreparer: true,
        sensitivityLevel: 'low',
        sortOrder: ${i}
      }${i === 25 ? '' : ','}\n`);
}
out.push(`    ]
  },\n`);

// Helper to generate modules
function genModule(code, title, desc, qCount, repeatable, phase, sectionSuffix, isScreening = false) {
  let moduleStr = `  {
    code: '${code}',
    title: '${title}',
    description: '${desc}',
    icon: 'folder',
    phase: '${phase}',
    sortOrder: 2,
    alwaysVisible: ${isScreening ? 'true' : 'false'},
    sections: [
      {
        id: 'S_${code}_${sectionSuffix}',
        moduleId: '${code}',
        title: '${title} Details',
        sortOrder: 1,
        isConditional: false,
        isRepeatable: ${repeatable},
        repeatLabel: '${title} Record'
      }
    ],
    questions: [\n`;
    for (let i = 1; i <= qCount; i++) {
      moduleStr += `      {
        id: 'Q_${code}_${sectionSuffix}_${i}',
        sectionId: 'S_${code}_${sectionSuffix}',
        moduleId: '${code}',
        text: '${title} Question ${i}?',
        helpText: 'Detailed CRA requirement explanation for ${title} question ${i}.',
        inputType: i % 3 === 0 ? 'boolean' : 'text',
        repeatable: ${repeatable},
        taxYear: 'all',
        allowUnsure: true,
        allowProvideLater: true,
        allowAskPreparer: true,
        sensitivityLevel: i % 5 === 0 ? 'high' : 'low',
        sortOrder: ${i}
      }${i === qCount ? '' : ','}\n`;
    }
  moduleStr += `    ]
  },\n`;
  return moduleStr;
}

out.push(genModule('B_IDENTIFICATION', 'Personal Identification', 'Basic ID info', 30, false, 'personal_info', 'MAIN', true));
out.push(genModule('C_RESIDENCY', 'Residency Information', 'Details on residency', 35, false, 'personal_info', 'MAIN', true));
out.push(genModule('D_MARITAL', 'Marital Status', 'Marital info', 20, false, 'personal_info', 'MAIN', true));
out.push(genModule('E_DEPENDANTS', 'Dependants', 'Dependant info', 15, true, 'personal_info', 'MAIN', true));
out.push(genModule('F_INCOME_DISCOVERY', 'Income Discovery', 'Screening', 45, false, 'income', 'MAIN', true));

// G_TAX_SLIPS with subsections
out.push(`  {
    code: 'G_TAX_SLIPS',
    title: 'Tax Slips',
    description: 'Enter data from your official tax slips.',
    icon: 'file-text',
    phase: 'income',
    sortOrder: 3,
    alwaysVisible: false,
    sections: [
      { id: 'S_G_T4', moduleId: 'G_TAX_SLIPS', title: 'T4 Slip', sortOrder: 1, isConditional: false, isRepeatable: true, repeatLabel: 'T4' },
      { id: 'S_G_T4A', moduleId: 'G_TAX_SLIPS', title: 'T4A Slip', sortOrder: 2, isConditional: false, isRepeatable: true, repeatLabel: 'T4A' },
      { id: 'S_G_T5', moduleId: 'G_TAX_SLIPS', title: 'T5 Slip', sortOrder: 3, isConditional: false, isRepeatable: true, repeatLabel: 'T5' }
    ],
    questions: [\n`);

for(let i = 1; i <= 18; i++) {
  out.push(`      { id: 'Q_G_T4_${i}', sectionId: 'S_G_T4', moduleId: 'G_TAX_SLIPS', text: 'T4 Box ${i}', inputType: 'number', repeatable: true, taxYear: 'all', allowUnsure: true, allowProvideLater: true, allowAskPreparer: true, sensitivityLevel: 'low', sortOrder: ${i} },\n`);
}
for(let i = 1; i <= 10; i++) {
  out.push(`      { id: 'Q_G_T4A_${i}', sectionId: 'S_G_T4A', moduleId: 'G_TAX_SLIPS', text: 'T4A Box ${i}', inputType: 'number', repeatable: true, taxYear: 'all', allowUnsure: true, allowProvideLater: true, allowAskPreparer: true, sensitivityLevel: 'low', sortOrder: ${i} },\n`);
}
for(let i = 1; i <= 12; i++) {
  out.push(`      { id: 'Q_G_T5_${i}', sectionId: 'S_G_T5', moduleId: 'G_TAX_SLIPS', text: 'T5 Box ${i}', inputType: 'number', repeatable: true, taxYear: 'all', allowUnsure: true, allowProvideLater: true, allowAskPreparer: true, sensitivityLevel: 'low', sortOrder: ${i} }${i === 12 ? '' : ','}\n`);
}
out.push(`    ]
  },\n`);

out.push(genModule('H_EMPLOYMENT', 'Employment Details', 'Details about your jobs', 25, true, 'income', 'MAIN'));
out.push(genModule('I_PENSIONS', 'Pension Income', 'Details about pensions', 30, false, 'income', 'MAIN'));
out.push(genModule('J_SELF_EMPLOYMENT', 'Self Employment', 'Business income', 40, true, 'income', 'MAIN'));
out.push(genModule('K_FARMING_FISHING', 'Farming & Fishing', 'Ag and marine income', 35, true, 'income', 'MAIN'));
out.push(genModule('L_VEHICLE_WORKSPACE', 'Vehicle & Workspace', 'Auto & home office', 25, true, 'deductions_credits', 'MAIN'));
out.push(genModule('M_RENTAL', 'Rental Income', 'Properties', 30, true, 'income', 'MAIN'));
out.push(genModule('N_INVESTMENTS', 'Investments', 'Investments', 20, false, 'income', 'MAIN'));
out.push(genModule('O_CAPITAL_GAINS', 'Capital Gains', 'Dispositions', 15, true, 'income', 'MAIN'));
out.push(genModule('P_PRINCIPAL_RESIDENCE', 'Principal Residence', 'Home sale', 20, false, 'income', 'MAIN'));
out.push(genModule('Q_CRYPTO', 'Cryptocurrency', 'Crypto trades', 20, true, 'income', 'MAIN'));
out.push(genModule('R_FOREIGN', 'Foreign Income & Property', 'Foreign assets', 25, true, 'income', 'MAIN'));
out.push(genModule('S_RRSP_PLANS', 'RRSP & Registered Plans', 'Retirement savings', 25, true, 'deductions_credits', 'MAIN'));
out.push(genModule('T_FHSA_REGISTERED', 'FHSA & Other Plans', 'First home & other', 15, false, 'deductions_credits', 'MAIN'));
out.push(genModule('U_EMPLOYMENT_EXPENSES', 'Employment Expenses', 'T2200 expenses', 30, false, 'deductions_credits', 'MAIN'));
out.push(genModule('V_CHILDCARE_SUPPORT', 'Childcare & Support', 'Dependant care', 20, true, 'deductions_credits', 'MAIN'));
out.push(genModule('W_EDUCATION', 'Education', 'Tuition & loans', 15, true, 'deductions_credits', 'MAIN'));
out.push(genModule('X_MEDICAL_DISABILITY', 'Medical & Disability', 'Health expenses', 20, true, 'deductions_credits', 'MAIN'));
out.push(genModule('Y_HOUSING_MOVING', 'Housing & Moving', 'Relocation & housing', 25, false, 'deductions_credits', 'MAIN'));
out.push(genModule('Z_DONATIONS_CREDITS', 'Donations & Credits', 'Charity', 20, true, 'deductions_credits', 'MAIN'));
out.push(genModule('AC_SPECIAL_SITUATIONS', 'Special Situations', 'Other matters', 30, false, 'review', 'MAIN'));

// AD_PAYMENTS_REVIEW
out.push(`  {
    code: 'AD_PAYMENTS_REVIEW',
    title: 'Payments & Review',
    description: 'Final review and submission.',
    icon: 'check-circle',
    phase: 'review',
    sortOrder: 100,
    alwaysVisible: true,
    sections: [
      {
        id: 'S_AD_PAYMENTS_REVIEW_MAIN',
        moduleId: 'AD_PAYMENTS_REVIEW',
        title: 'Review Details',
        sortOrder: 1,
        isConditional: false,
        isRepeatable: false
      }
    ],
    questions: [
`);
for (let i = 1; i <= 24; i++) {
  out.push(`      {
        id: 'Q_AD_PAYMENTS_REVIEW_${i}',
        sectionId: 'S_AD_PAYMENTS_REVIEW_MAIN',
        moduleId: 'AD_PAYMENTS_REVIEW',
        text: 'Review Question ${i}?',
        helpText: 'Help text for review ${i}.',
        inputType: 'boolean',
        repeatable: false,
        taxYear: 'all',
        allowUnsure: false,
        allowProvideLater: false,
        allowAskPreparer: false,
        sensitivityLevel: 'low',
        sortOrder: ${i}
      },\n`);
}
// Submit button question
out.push(`      {
        id: 'Q_AD_PAYMENTS_REVIEW_25',
        sectionId: 'S_AD_PAYMENTS_REVIEW_MAIN',
        moduleId: 'AD_PAYMENTS_REVIEW',
        text: 'Submit information to my preparer',
        helpText: 'Click to submit to your tax preparer.',
        inputType: 'boolean',
        repeatable: false,
        taxYear: 'all',
        allowUnsure: false,
        allowProvideLater: false,
        allowAskPreparer: false,
        sensitivityLevel: 'low',
        sortOrder: 25
      }
    ]
  }
];\n`);

fs.writeFileSync(outFile, out.join(''));
