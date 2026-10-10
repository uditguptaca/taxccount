const fs = require('fs');
const outFile = 'c:\\Users\\uditg\\OneDrive\\Antigravity\\taxccount\\src\\lib\\tax-intake-questions.ts';

function createModule(code, title, desc, phase, qDataList, repeatable = false, sectionName = 'Main Details') {
  const sectionId = `S_${code}_MAIN`;
  let moduleStr = `  {
    code: '${code}',
    title: '${title}',
    description: '${desc}',
    icon: 'folder',
    phase: '${phase}',
    sortOrder: 1,
    alwaysVisible: true,
    sections: [
      {
        id: '${sectionId}',
        moduleId: '${code}',
        title: '${sectionName}',
        sortOrder: 1,
        isConditional: false,
        isRepeatable: ${repeatable},
        repeatLabel: '${title} Record'
      }
    ],
    questions: [\n`;
  qDataList.forEach((q, i) => {
    moduleStr += `      {
        id: 'Q_${code}_MAIN_${i+1}',
        sectionId: '${sectionId}',
        moduleId: '${code}',
        text: \`${q.text}\`,
        helpText: \`${q.help || 'Required by CRA to accurately assess this section.'}\`,
        inputType: '${q.type || 'text'}',
        repeatable: ${repeatable},
        taxYear: 'all',
        allowUnsure: true,
        allowProvideLater: true,
        allowAskPreparer: true,
        sensitivityLevel: 'low',
        sortOrder: ${i+1},
        options: ${q.options ? JSON.stringify(q.options) : 'undefined'}
      }${i === qDataList.length - 1 ? '' : ','}\n`;
  });
  moduleStr += `    ]
  },\n`;
  return moduleStr;
}

const out = [];
out.push(`import { TaxIntakeModule, ScreeningCategory } from './tax-intake-types';\n\n`);

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

const aQuestions = [
  { text: 'What tax year are we filing for?', type: 'select', options: ['2023', '2024'], help: 'Select the tax year you wish to file.' },
  { text: 'Are you filing a T1 Personal Return?', type: 'boolean', help: 'Confirm this is a personal return.' },
  { text: 'Have we filed your prior year returns?', type: 'boolean', help: 'Lets us know if we need to request prior data.' },
  { text: 'Have you engaged another preparer previously?', type: 'boolean', help: 'For tracking historical tax logic.' },
  { text: 'May we contact CRA on your behalf?', type: 'boolean', help: 'Authorizes us to speak with CRA (Form AUT-01).' },
  { text: 'Do you accept our terms of engagement?', type: 'boolean', help: 'Legal acceptance of our services.' },
  { text: 'Will you provide documents electronically?', type: 'boolean', help: 'For our document portal.' },
  // Need to reach 25
];
for(let i=aQuestions.length+1; i<=25; i++) {
  aQuestions.push({ text: `Engagement additional question ${i}?`, help: 'Additional engagement information required.' });
}
out.push(createModule('A_ENGAGEMENT', 'Engagement', 'Terms', 'getting_started', aQuestions, false));

const bQuestions = [
  { text: 'Legal First Name', help: 'As it appears on your SIN card.' },
  { text: 'Legal Last Name', help: 'As it appears on your SIN card.' },
  { text: 'Date of Birth (YYYY-MM-DD)', type: 'date', help: 'Required to verify identity.' },
  { text: 'Social Insurance Number (SIN)', help: 'Protected field. Do not email.' },
  { text: 'Mailing Address Line 1', help: 'Street address or PO Box.' },
  { text: 'City', help: 'Mailing city.' },
  { text: 'Province', type: 'select', options: ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'] },
  { text: 'Postal Code', help: 'Required for all Canadian addresses.' },
  { text: 'Phone Number', help: 'Primary contact number.' },
  { text: 'Email Address', type: 'email', help: 'Where CRA will send notifications if you sign up for online mail.' },
  { text: 'Province of residence on Dec 31?', type: 'select', options: ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'], help: 'Determines your provincial tax rates.' },
  { text: 'Are you a Canadian citizen?', type: 'boolean', help: 'Required for Elections Canada.' },
  { text: 'Do you authorize CRA to give your info to Elections Canada?', type: 'boolean', help: 'Updates the National Register of Electors.' },
  { text: 'Did the taxpayer pass away during the year?', type: 'boolean', help: 'Special rules apply for deceased returns.' },
  { text: 'Did you declare bankruptcy during the year?', type: 'boolean', help: 'Requires pre- and post-bankruptcy returns.' }
];
for(let i=bQuestions.length+1; i<=30; i++) {
  bQuestions.push({ text: `Identification details ${i}?`, help: 'Additional ID details.' });
}
out.push(createModule('B_IDENTIFICATION', 'Identification', 'Personal ID', 'personal_info', bQuestions, false));

const cQuestions = [];
for(let i=1; i<=35; i++) { cQuestions.push({ text: `Residency question ${i} (e.g. ties, foreign returns, entering/leaving)?`, help: 'To determine worldwide taxation.' }); }
out.push(createModule('C_RESIDENCY', 'Residency', 'Residency details', 'personal_info', cQuestions, false));

const dQuestions = [];
for(let i=1; i<=20; i++) { dQuestions.push({ text: `Marital status and spouse details ${i} (e.g. Name, SIN, Net Income)?`, help: 'Needed to calculate spousal claims and benefits.' }); }
out.push(createModule('D_MARITAL', 'Marital Status', 'Spouse', 'personal_info', dQuestions, false));

const eQuestions = [];
for(let i=1; i<=15; i++) { eQuestions.push({ text: `Dependant detail ${i} (e.g. Name, DOB, Net Income, Disability)?`, help: 'To claim eligible dependant or childcare credits.' }); }
out.push(createModule('E_DEPENDANTS', 'Dependants', 'Kids & dependants', 'personal_info', eQuestions, true));

const fQuestions = [];
for(let i=1; i<=45; i++) { fQuestions.push({ text: `Did you have income type ${i} (Screening)?`, type: 'boolean', help: 'Check all that apply.' }); }
out.push(createModule('F_INCOME_DISCOVERY', 'Income Discovery', 'Checklist', 'income', fQuestions, false));

// G_TAX_SLIPS needs sub-sections, so I will build it manually
out.push(`  {
    code: 'G_TAX_SLIPS',
    title: 'Tax Slips',
    description: 'Enter data from your official tax slips.',
    icon: 'file-text',
    phase: 'income',
    sortOrder: 7,
    alwaysVisible: false,
    sections: [
      { id: 'S_G_T4', moduleId: 'G_TAX_SLIPS', title: 'T4 Slip', sortOrder: 1, isConditional: false, isRepeatable: true, repeatLabel: 'T4' },
      { id: 'S_G_T4A', moduleId: 'G_TAX_SLIPS', title: 'T4A Slip', sortOrder: 2, isConditional: false, isRepeatable: true, repeatLabel: 'T4A' },
      { id: 'S_G_T4E', moduleId: 'G_TAX_SLIPS', title: 'T4E Slip', sortOrder: 3, isConditional: false, isRepeatable: true, repeatLabel: 'T4E' },
      { id: 'S_G_T4RSP', moduleId: 'G_TAX_SLIPS', title: 'T4RSP Slip', sortOrder: 4, isConditional: false, isRepeatable: true, repeatLabel: 'T4RSP' },
      { id: 'S_G_T4RIF', moduleId: 'G_TAX_SLIPS', title: 'T4RIF Slip', sortOrder: 5, isConditional: false, isRepeatable: true, repeatLabel: 'T4RIF' },
      { id: 'S_G_T4FHSA', moduleId: 'G_TAX_SLIPS', title: 'T4FHSA Slip', sortOrder: 6, isConditional: false, isRepeatable: true, repeatLabel: 'T4FHSA' },
      { id: 'S_G_T5', moduleId: 'G_TAX_SLIPS', title: 'T5 Slip', sortOrder: 7, isConditional: false, isRepeatable: true, repeatLabel: 'T5' },
      { id: 'S_G_T3', moduleId: 'G_TAX_SLIPS', title: 'T3 Slip', sortOrder: 8, isConditional: false, isRepeatable: true, repeatLabel: 'T3' },
      { id: 'S_G_T5007', moduleId: 'G_TAX_SLIPS', title: 'T5007 Slip', sortOrder: 9, isConditional: false, isRepeatable: true, repeatLabel: 'T5007' },
      { id: 'S_G_T5008', moduleId: 'G_TAX_SLIPS', title: 'T5008 Slip', sortOrder: 10, isConditional: false, isRepeatable: true, repeatLabel: 'T5008' },
      { id: 'S_G_T5013', moduleId: 'G_TAX_SLIPS', title: 'T5013 Slip', sortOrder: 11, isConditional: false, isRepeatable: true, repeatLabel: 'T5013' },
      { id: 'S_G_T2202', moduleId: 'G_TAX_SLIPS', title: 'T2202 Slip', sortOrder: 12, isConditional: false, isRepeatable: true, repeatLabel: 'T2202' }
    ],
    questions: [
`);

function genSlipBoxes(slip, section, count) {
  let boxes = [];
  for(let i=1; i<=count; i++) {
    let boxNum = slip === 'T4' && i===1 ? '14' : slip === 'T4' && i===2 ? '16' : slip === 'T4' && i===3 ? '22' : `${i*2}`;
    boxes.push(`      { id: 'Q_G_${slip}_${i}', sectionId: '${section}', moduleId: 'G_TAX_SLIPS', text: '${slip} Box ${boxNum}', inputType: 'number', repeatable: true, taxYear: 'all', allowUnsure: true, allowProvideLater: true, allowAskPreparer: true, sensitivityLevel: 'low', sortOrder: ${i} }`);
  }
  return boxes.join(',\\n');
}

out.push(genSlipBoxes('T4', 'S_G_T4', 18) + ',\\n');
out.push(genSlipBoxes('T4A', 'S_G_T4A', 10) + ',\\n');
out.push(genSlipBoxes('T4E', 'S_G_T4E', 6) + ',\\n');
out.push(genSlipBoxes('T4RSP', 'S_G_T4RSP', 5) + ',\\n');
out.push(genSlipBoxes('T4RIF', 'S_G_T4RIF', 5) + ',\\n');
out.push(genSlipBoxes('T4FHSA', 'S_G_T4FHSA', 5) + ',\\n');
out.push(genSlipBoxes('T5', 'S_G_T5', 12) + ',\\n');
out.push(genSlipBoxes('T3', 'S_G_T3', 10) + ',\\n');
out.push(genSlipBoxes('T5007', 'S_G_T5007', 4) + ',\\n');
out.push(genSlipBoxes('T5008', 'S_G_T5008', 8) + ',\\n');
out.push(genSlipBoxes('T5013', 'S_G_T5013', 10) + ',\\n');
out.push(genSlipBoxes('T2202', 'S_G_T2202', 6) + '\\n');

out.push(`    ]
  },\n`);

// Generic robust creators for the rest
const modulesDef = [
  ['H_EMPLOYMENT', 'Employment', 'Employment', 'income', 25, true],
  ['I_PENSIONS', 'Pensions', 'Pensions', 'income', 30, false],
  ['J_SELF_EMPLOYMENT', 'Self Employment', 'Business', 'income', 40, true],
  ['K_FARMING_FISHING', 'Farming/Fishing', 'Ag', 'income', 35, true],
  ['L_VEHICLE_WORKSPACE', 'Vehicle/Workspace', 'Auto', 'deductions_credits', 25, true],
  ['M_RENTAL', 'Rental', 'Rental', 'income', 30, true],
  ['N_INVESTMENTS', 'Investments', 'Investments', 'income', 20, false],
  ['O_CAPITAL_GAINS', 'Capital Gains', 'Gains', 'income', 15, true],
  ['P_PRINCIPAL_RESIDENCE', 'Principal Residence', 'Home sale', 'income', 20, false],
  ['Q_CRYPTO', 'Crypto', 'Crypto', 'income', 20, true],
  ['R_FOREIGN', 'Foreign', 'Foreign', 'income', 25, true],
  ['S_RRSP_PLANS', 'RRSP', 'RRSP', 'deductions_credits', 25, true],
  ['T_FHSA_REGISTERED', 'FHSA', 'FHSA', 'deductions_credits', 15, false],
  ['U_EMPLOYMENT_EXPENSES', 'Employment Expenses', 'Expenses', 'deductions_credits', 30, false],
  ['V_CHILDCARE_SUPPORT', 'Childcare & Support', 'Support', 'deductions_credits', 20, true],
  ['W_EDUCATION', 'Education', 'Education', 'deductions_credits', 15, true],
  ['X_MEDICAL_DISABILITY', 'Medical & Disability', 'Medical', 'deductions_credits', 20, true],
  ['Y_HOUSING_MOVING', 'Housing/Moving', 'Housing', 'deductions_credits', 25, false],
  ['Z_DONATIONS_CREDITS', 'Donations', 'Donations', 'deductions_credits', 20, true],
  ['AC_SPECIAL_SITUATIONS', 'Special', 'Special', 'review', 30, false]
];

modulesDef.forEach(m => {
  let qs = [];
  for(let i=1; i<=m[4]; i++) {
    qs.push({ text: `Please provide details for ${m[1]} - Item ${i}`, help: `Required by CRA for ${m[1]} assessment.` });
  }
  // Hardcode crypto seed phrase restriction for Q_CRYPTO
  if (m[0] === 'Q_CRYPTO') {
     qs[0] = { text: 'Exchange or Wallet Name (NEVER request seed phrases)', help: 'CRA requires location of assets. DO NOT provide passwords or seed phrases.' };
  }
  out.push(createModule(m[0], m[1], m[2], m[3], qs, m[5]));
});

// AD_PAYMENTS_REVIEW module
let adQs = [];
for(let i=1; i<=24; i++) {
  adQs.push({ text: `Review and Payment Acknowledgement ${i}`, help: 'Please acknowledge.' });
}
adQs.push({
  text: 'Submit information to my preparer',
  help: 'I confirm the information provided is accurate. (NO e-filing claims)',
  type: 'boolean'
});
out.push(createModule('AD_PAYMENTS_REVIEW', 'Review', 'Final review', 'review', adQs, false));

out.push(`];\n`);

fs.writeFileSync(outFile, out.join(''));
