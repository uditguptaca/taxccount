/* ===========================================================================
 *  CANADIAN PAYROLL CALCULATION ENGINE
 *  Implements the CRA "Option 1" tax formula (Guide T4127) plus CPP/CPP2/EI.
 * ======================================================================== */

export type ProvinceCode =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS'
  | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export type PayFrequency =
  | 'weekly'        // P = 52
  | 'biweekly'      // P = 26
  | 'semimonthly'   // P = 24
  | 'monthly'       // P = 12
  | 'quarterly'     // P = 4
  | 'annual';       // P = 1

export const PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, quarterly: 4, annual: 1,
};

export interface TaxBracket {
  upTo: number | null; 
  rate: number;        
  constantK: number;   
}

export interface Surtax {
  threshold1: number; rate1: number; 
  threshold2: number; rate2: number; 
}

export interface JurisdictionTable {
  brackets: TaxBracket[];
  lowestRate: number;          
  basicPersonalAmount: number; 
  canadaEmploymentAmount?: number; 
  surtax?: Surtax;             
  healthPremium?: (taxableIncome: number) => number; 
}

export interface RateTable {
  year: number;
  effectiveDate: string; 

  cpp: {
    ympe: number;            
    basicExemption: number;  
    rate: number;            
    maxContribution: number; 
    yampe: number;           
    rate2: number;
    maxContribution2: number;
  };

  ei: {
    mie: number;             
    employeeRate: number;    
    employerMultiplier: number; 
    maxEmployee: number;
    quebecEmployeeRate: number; 
    quebecMaxEmployee: number;
  };

  federal: JurisdictionTable;
  provincial: Partial<Record<ProvinceCode, JurisdictionTable>>;
}

interface RawJurisdiction {
  lowestRate: number;
  basicPersonalAmount: number;
  canadaEmploymentAmount?: number;
  rawBrackets: { upTo: number | null; rate: number }[];
  surtax?: Surtax;
  healthPremium?: (ti: number) => number;
}

function buildJurisdiction(j: RawJurisdiction): JurisdictionTable {
  const brackets: TaxBracket[] = [];
  let prevCeiling = 0;
  let cumulativeK = 0;
  let prevRate = 0;

  for (const b of j.rawBrackets) {
    if (brackets.length > 0) {
      cumulativeK += (b.rate - prevRate) * prevCeiling;
    }
    brackets.push({ upTo: b.upTo, rate: b.rate, constantK: cumulativeK });
    prevRate = b.rate;
    if (b.upTo !== null) prevCeiling = b.upTo;
  }

  return {
    brackets,
    lowestRate: j.lowestRate,
    basicPersonalAmount: j.basicPersonalAmount,
    canadaEmploymentAmount: j.canadaEmploymentAmount,
    surtax: j.surtax,
    healthPremium: j.healthPremium,
  };
}

function ontarioHealthPremium(taxableIncome: number): number {
  const ti = taxableIncome;
  if (ti <= 20_000) return 0;
  if (ti <= 36_000) return Math.min(300, (ti - 20_000) * 0.06);
  if (ti <= 48_000) return Math.min(450, 300 + (ti - 36_000) * 0.06);
  if (ti <= 72_000) return Math.min(600, 450 + (ti - 48_000) * 0.25);
  if (ti <= 200_000) return Math.min(750, 600 + (ti - 72_000) * 0.25);
  return Math.min(900, 750 + (ti - 200_000) * 0.25);
}

export const RATES_2026: RateTable = {
  year: 2026,
  effectiveDate: '2026-01-01',

  cpp: {
    ympe: 74_600,
    basicExemption: 3_500,
    rate: 0.0595,
    maxContribution: 4_230.45,
    yampe: 85_000,
    rate2: 0.04,
    maxContribution2: 416.0,
  },

  ei: {
    mie: 68_900,
    employeeRate: 0.0163,
    employerMultiplier: 1.4,
    maxEmployee: 1_123.07,
    quebecEmployeeRate: 0.013,
    quebecMaxEmployee: 895.7,
  },

  federal: buildJurisdiction({
    lowestRate: 0.14,
    basicPersonalAmount: 16_452, 
    canadaEmploymentAmount: 1_501, 
    rawBrackets: [
      { upTo: 58_523, rate: 0.14 },
      { upTo: 117_045, rate: 0.205 },
      { upTo: 181_440, rate: 0.26 },
      { upTo: 258_482, rate: 0.29 },
      { upTo: null, rate: 0.33 },
    ],
  }),

  provincial: {
    ON: buildJurisdiction({
      lowestRate: 0.0505,
      basicPersonalAmount: 12_747, 
      rawBrackets: [
        { upTo: 52_886, rate: 0.0505 },
        { upTo: 105_775, rate: 0.0915 },
        { upTo: 150_000, rate: 0.1116 },
        { upTo: 220_000, rate: 0.1216 },
        { upTo: null, rate: 0.1316 },
      ],
      surtax: { threshold1: 5_710, rate1: 0.2, threshold2: 7_307, rate2: 0.36 },
      healthPremium: ontarioHealthPremium,
    }),
  },
};

function bracketFor(table: JurisdictionTable, annualTaxable: number): TaxBracket {
  for (const b of table.brackets) {
    if (b.upTo === null || annualTaxable <= b.upTo) return b;
  }
  return table.brackets[table.brackets.length - 1];
}

const cents = (n: number) => Math.round(n * 100) / 100;
const clamp0 = (n: number) => (n < 0 ? 0 : n);

export interface PayInput {
  province: ProvinceCode;
  frequency: PayFrequency;
  grossThisPeriod: number;
  pensionableThisPeriod: number;
  insurableThisPeriod: number;
  federalClaim?: number;
  provincialClaim?: number;
  pretaxDeductionsThisPeriod?: number;
  annualAuthorizedDeductions?: number;
  additionalTaxThisPeriod?: number;
  northernDeductionAnnual?: number;
  ytdCppContribution?: number;
  ytdCpp2Contribution?: number;
  ytdEiPremium?: number;
  ytdPensionableEarnings?: number;
  ytdInsurableEarnings?: number;
  cppExempt?: boolean; 
  eiExempt?: boolean;  
}

export interface PayResult {
  federalTax: number;
  provincialTax: number;
  incomeTaxTotal: number;
  cpp: number;
  cpp2: number;
  ei: number;
  totalEmployeeDeductions: number;
  netPay: number;
  employerCpp: number;
  employerCpp2: number;
  employerEi: number;
  totalEmployerContributions: number;
  remittanceToCRA: number; 
  annualTaxableIncome: number;
  notes: string[];
}

function calcCPP(input: PayInput, t: RateTable) {
  const notes: string[] = [];
  if (input.cppExempt) return { cpp: 0, cpp2: 0, notes: ['CPP exempt'] };

  const P = PERIODS_PER_YEAR[input.frequency];
  const exemptionPerPeriod = t.cpp.basicExemption / P;

  const ytdCpp = input.ytdCppContribution ?? 0;
  const remainingBase = clamp0(t.cpp.maxContribution - ytdCpp);
  const pensionableOverExemption = clamp0(input.pensionableThisPeriod - exemptionPerPeriod);
  let cpp = cents(Math.min(remainingBase, t.cpp.rate * pensionableOverExemption));
  if (remainingBase <= 0) notes.push('Base CPP max reached');

  let cpp2 = 0;
  const ytdPensionable = input.ytdPensionableEarnings ?? 0;
  const newYtdPensionable = ytdPensionable + input.pensionableThisPeriod;
  if (newYtdPensionable > t.cpp.ympe) {
    const earningsInCpp2Band = Math.min(newYtdPensionable, t.cpp.yampe) - Math.max(ytdPensionable, t.cpp.ympe);
    const earningsThisPeriodInBand = clamp0(Math.min(input.pensionableThisPeriod, earningsInCpp2Band));
    const ytdCpp2 = input.ytdCpp2Contribution ?? 0;
    const remaining2 = clamp0(t.cpp.maxContribution2 - ytdCpp2);
    cpp2 = cents(Math.min(remaining2, t.cpp.rate2 * earningsThisPeriodInBand));
    if (remaining2 <= 0) notes.push('CPP2 max reached');
  }

  return { cpp, cpp2, notes };
}

function calcEI(input: PayInput, t: RateTable) {
  const notes: string[] = [];
  if (input.eiExempt) return { ei: 0, employerEi: 0, notes: ['EI exempt'] };

  const ytdEi = input.ytdEiPremium ?? 0;
  const isQuebec = input.province === 'QC';
  const employeeRate = isQuebec ? t.ei.quebecEmployeeRate : t.ei.employeeRate;
  const maxEmployee = isQuebec ? t.ei.quebecMaxEmployee : t.ei.maxEmployee;
  
  const remainingEi = clamp0(maxEmployee - ytdEi);
  const ei = cents(Math.min(remainingEi, employeeRate * input.insurableThisPeriod));
  
  if (remainingEi <= 0) notes.push('EI max reached');
  
  const employerEi = cents(ei * t.ei.employerMultiplier);
  return { ei, employerEi, notes };
}

function calcTax(input: PayInput, cpp: number, cpp2: number, ei: number, t: RateTable) {
  const P = PERIODS_PER_YEAR[input.frequency];
  
  // A (annual taxable income)
  const taxablePeriod = input.grossThisPeriod - (input.pretaxDeductionsThisPeriod ?? 0);
  const A = clamp0(
    (P * taxablePeriod) 
    - (input.annualAuthorizedDeductions ?? 0) 
    - (input.northernDeductionAnnual ?? 0)
  );

  // Federal Tax
  const fedTable = t.federal;
  const fedBracket = bracketFor(fedTable, A);
  
  const K1 = fedTable.lowestRate * (input.federalClaim ?? fedTable.basicPersonalAmount);
  
  // Annualized CPP + EI
  const annualCpp = cpp * P;
  const annualEi = ei * P;
  const K2 = fedTable.lowestRate * (annualCpp + annualEi);
  const K4 = fedTable.lowestRate * (fedTable.canadaEmploymentAmount ?? 0);
  
  const fedAnnual = clamp0((fedBracket.rate * A) - fedBracket.constantK - K1 - K2 - K4);
  const fedPeriod = cents(fedAnnual / P);

  // Provincial Tax
  const provTable = t.provincial[input.province];
  let provPeriod = 0;
  
  if (provTable && input.province !== 'QC') {
    const provBracket = bracketFor(provTable, A);
    const K1P = provTable.lowestRate * (input.provincialClaim ?? provTable.basicPersonalAmount);
    const K2P = provTable.lowestRate * (annualCpp + annualEi);
    
    let provAnnual = clamp0((provBracket.rate * A) - provBracket.constantK - K1P - K2P);
    
    if (provTable.surtax) {
      const s = provTable.surtax;
      const surtax1 = clamp0(provAnnual - s.threshold1) * s.rate1;
      const surtax2 = clamp0(provAnnual - s.threshold2) * s.rate2;
      provAnnual += surtax1 + surtax2;
    }
    
    provPeriod = cents(provAnnual / P);
    
    if (provTable.healthPremium) {
      provPeriod += cents(provTable.healthPremium(A) / P);
    }
  }

  return {
    federalTax: fedPeriod + (input.additionalTaxThisPeriod ?? 0),
    provincialTax: provPeriod,
    annualTaxableIncome: A
  };
}

export function calculatePayPeriodDeductions(input: PayInput, rateTable: RateTable = RATES_2026): PayResult {
  const { cpp, cpp2, notes: cppNotes } = calcCPP(input, rateTable);
  const { ei, employerEi, notes: eiNotes } = calcEI(input, rateTable);
  const tax = calcTax(input, cpp, cpp2, ei, rateTable);
  
  const employerCpp = cpp;
  const employerCpp2 = cpp2;
  
  const totalEmployeeDeductions = cents(
    cpp + cpp2 + ei + tax.federalTax + tax.provincialTax + (input.pretaxDeductionsThisPeriod ?? 0)
  );
  
  const netPay = cents(input.grossThisPeriod - totalEmployeeDeductions);
  const totalEmployerContributions = cents(employerCpp + employerCpp2 + employerEi);
  const remittanceToCRA = cents(cpp + cpp2 + ei + employerCpp + employerCpp2 + employerEi + tax.federalTax + tax.provincialTax);
  
  return {
    federalTax: tax.federalTax,
    provincialTax: tax.provincialTax,
    incomeTaxTotal: cents(tax.federalTax + tax.provincialTax),
    cpp,
    cpp2,
    ei,
    totalEmployeeDeductions,
    netPay,
    employerCpp,
    employerCpp2,
    employerEi,
    totalEmployerContributions,
    remittanceToCRA,
    annualTaxableIncome: tax.annualTaxableIncome,
    notes: [...cppNotes, ...eiNotes]
  };
}
