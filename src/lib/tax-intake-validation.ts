// ═══════════════════════════════════════════════════════════════════════════
// TAX INTAKE SYSTEM — Validation Engine
// Comprehensive validation for Canadian T1 Tax Intake responses
// ═══════════════════════════════════════════════════════════════════════════

import type { TaxIntakeResponse, TaxIntakeQuestion, TaxIntakeEngagement, ValidationRule } from './tax-intake-types';

export interface ValidationResult {
  questionId: string;
  recordIndex: number;
  severity: 'error' | 'warning';
  message: string;
  category: string;
}

// ─── Core Validation Functions ───────────────────────────────────────────

export function validateSIN(value: string): boolean {
  const cleaned = value.replace(/[\s-]/g, '');
  if (!/^\d{9}$/.test(cleaned)) return false;
  // Luhn algorithm for SIN validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let d = parseInt(cleaned[i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

export function validatePostalCode(value: string): boolean {
  return /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(value.trim());
}

export function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePhone(value: string): boolean {
  const cleaned = value.replace(/[\s()-]/g, '');
  return /^\+?1?\d{10,11}$/.test(cleaned);
}

export function validateDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function validateCurrency(value: string): boolean {
  const cleaned = value.replace(/[$,\s]/g, '');
  return /^-?\d+(\.\d{0,2})?$/.test(cleaned);
}

export function validatePercentage(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

// ─── Question-Level Validation ───────────────────────────────────────────

export function validateResponse(
  question: TaxIntakeQuestion,
  value: string | null,
  flag?: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Skip validation if flagged
  if (flag === 'unsure' || flag === 'provide_later' || flag === 'ask_preparer') {
    return results;
  }

  // Required check
  if (question.validationRules?.some(r => r.type === 'required')) {
    if (!value || value.trim() === '') {
      results.push({
        questionId: question.id,
        recordIndex: 0,
        severity: 'error',
        message: 'This field is required.',
        category: 'missing_required',
      });
      return results; // Skip other validations if empty
    }
  }

  if (!value || value.trim() === '') return results;

  // Type-specific validation
  switch (question.inputType) {
    case 'sin':
      if (!validateSIN(value)) {
        results.push({
          questionId: question.id, recordIndex: 0, severity: 'error',
          message: 'Please enter a valid 9-digit Social Insurance Number.',
          category: 'format_error',
        });
      }
      break;

    case 'email':
      if (!validateEmail(value)) {
        results.push({
          questionId: question.id, recordIndex: 0, severity: 'error',
          message: 'Please enter a valid email address.',
          category: 'format_error',
        });
      }
      break;

    case 'phone':
      if (!validatePhone(value)) {
        results.push({
          questionId: question.id, recordIndex: 0, severity: 'error',
          message: 'Please enter a valid phone number.',
          category: 'format_error',
        });
      }
      break;

    case 'date':
      if (!validateDate(value)) {
        results.push({
          questionId: question.id, recordIndex: 0, severity: 'error',
          message: 'Please enter a valid date.',
          category: 'format_error',
        });
      }
      break;

    case 'currency':
      if (!validateCurrency(value)) {
        results.push({
          questionId: question.id, recordIndex: 0, severity: 'error',
          message: 'Please enter a valid dollar amount.',
          category: 'format_error',
        });
      }
      break;

    case 'percentage':
      if (!validatePercentage(value)) {
        results.push({
          questionId: question.id, recordIndex: 0, severity: 'error',
          message: 'Please enter a percentage between 0 and 100.',
          category: 'format_error',
        });
      }
      break;
  }

  // Custom validation rules
  if (question.validationRules) {
    for (const rule of question.validationRules) {
      const result = applyValidationRule(question.id, value, rule);
      if (result) results.push(result);
    }
  }

  return results;
}

function applyValidationRule(
  questionId: string,
  value: string,
  rule: ValidationRule
): ValidationResult | null {
  switch (rule.type) {
    case 'min_length':
      if (value.length < (rule.value as number)) {
        return { questionId, recordIndex: 0, severity: rule.severity, message: rule.message, category: 'validation' };
      }
      break;
    case 'max_length':
      if (value.length > (rule.value as number)) {
        return { questionId, recordIndex: 0, severity: rule.severity, message: rule.message, category: 'validation' };
      }
      break;
    case 'min_value': {
      const num = parseFloat(value.replace(/[$,]/g, ''));
      if (!isNaN(num) && num < (rule.value as number)) {
        return { questionId, recordIndex: 0, severity: rule.severity, message: rule.message, category: 'validation' };
      }
      break;
    }
    case 'max_value': {
      const num = parseFloat(value.replace(/[$,]/g, ''));
      if (!isNaN(num) && num > (rule.value as number)) {
        return { questionId, recordIndex: 0, severity: rule.severity, message: rule.message, category: 'validation' };
      }
      break;
    }
    case 'pattern':
      if (!new RegExp(rule.value as string).test(value)) {
        return { questionId, recordIndex: 0, severity: rule.severity, message: rule.message, category: 'validation' };
      }
      break;
    case 'postal_code':
      if (!validatePostalCode(value)) {
        return { questionId, recordIndex: 0, severity: rule.severity, message: rule.message, category: 'format_error' };
      }
      break;
    case 'sin_format':
      if (!validateSIN(value)) {
        return { questionId, recordIndex: 0, severity: rule.severity, message: rule.message, category: 'format_error' };
      }
      break;
  }
  return null;
}

// ─── Cross-Field Validation ──────────────────────────────────────────────

export function validateCrossField(
  responses: Record<string, TaxIntakeResponse>,
  engagement: TaxIntakeEngagement
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const getVal = (qId: string, ri: number = 0) => responses[`${qId}:${ri}`]?.value;

  // ── Date Consistency ──
  const taxYear = parseInt(engagement.taxYear);
  const yearStart = `${taxYear}-01-01`;
  const yearEnd = `${taxYear}-12-31`;

  // Check date of birth is before tax year
  const dob = getVal('Q_ID_DOB');
  if (dob && new Date(dob) > new Date(yearEnd)) {
    results.push({
      questionId: 'Q_ID_DOB', recordIndex: 0, severity: 'error',
      message: `Date of birth cannot be after December 31, ${taxYear}.`,
      category: 'date_consistency',
    });
  }

  // Check marital status change date is within tax year
  const maritalChangeDate = getVal('Q_MARITAL_CHANGE_DATE');
  if (maritalChangeDate) {
    const d = new Date(maritalChangeDate);
    if (d < new Date(yearStart) || d > new Date(yearEnd)) {
      results.push({
        questionId: 'Q_MARITAL_CHANGE_DATE', recordIndex: 0, severity: 'warning',
        message: `Marital status change date should be within the ${taxYear} tax year.`,
        category: 'date_consistency',
      });
    }
  }

  // ── SIN Confirmation Match ──
  const sin1 = getVal('Q_ID_SIN');
  const sin2 = getVal('Q_ID_SIN_CONFIRM');
  if (sin1 && sin2 && sin1.replace(/[\s-]/g, '') !== sin2.replace(/[\s-]/g, '')) {
    results.push({
      questionId: 'Q_ID_SIN_CONFIRM', recordIndex: 0, severity: 'error',
      message: 'SIN confirmation does not match. Please re-enter.',
      category: 'field_mismatch',
    });
  }

  // ── RRSP Contributions vs Deduction Limit ──
  const rrspLimit = parseFloat((getVal('Q_RRSP_DEDUCTION_LIMIT') || '0').replace(/[$,]/g, ''));
  const rrspContrib = parseFloat((getVal('Q_RRSP_CONTRIB_OWN') || '0').replace(/[$,]/g, ''));
  const rrspSpousal = parseFloat((getVal('Q_RRSP_CONTRIB_SPOUSAL') || '0').replace(/[$,]/g, ''));
  if (rrspLimit > 0 && (rrspContrib + rrspSpousal) > rrspLimit * 1.02) {
    results.push({
      questionId: 'Q_RRSP_CONTRIB_OWN', recordIndex: 0, severity: 'warning',
      message: `Total RRSP contributions ($${(rrspContrib + rrspSpousal).toFixed(2)}) exceed your deduction limit ($${rrspLimit.toFixed(2)}). Excess contributions may be subject to a 1% monthly penalty.`,
      category: 'excess_contribution',
    });
  }

  // ── Ownership Percentages ──
  // Check rental property ownership adds up sensibly
  // (This would iterate over repeat records in a full implementation)

  // ── Province-Specific Checks ──
  const province = getVal('Q_ID_PROVINCE_DEC31') || engagement.province;

  // Québec-specific: must file TP-1
  if (province === 'QC' || province === 'Quebec') {
    const qcFiling = getVal('Q_QC_TP1_FILING');
    if (!qcFiling || qcFiling === 'No') {
      results.push({
        questionId: 'Q_QC_TP1_FILING', recordIndex: 0, severity: 'warning',
        message: 'Québec residents must file a separate provincial return (TP-1) with Revenu Québec.',
        category: 'provincial_requirement',
      });
    }
  }

  // ── Deceased Taxpayer Checks ──
  const diedDuringYear = getVal('Q_ID_DIED_DURING_YEAR');
  if (diedDuringYear === 'Yes') {
    const deathDate = getVal('Q_ID_DEATH_DATE');
    if (!deathDate) {
      results.push({
        questionId: 'Q_ID_DEATH_DATE', recordIndex: 0, severity: 'error',
        message: 'Date of death is required when the taxpayer died during the year.',
        category: 'missing_required',
      });
    }
    const legalRepName = getVal('Q_ID_LEGAL_REP_NAME');
    if (!legalRepName) {
      results.push({
        questionId: 'Q_ID_LEGAL_REP_NAME', recordIndex: 0, severity: 'warning',
        message: 'A legal representative name is recommended for a deceased taxpayer return.',
        category: 'missing_recommended',
      });
    }
  }

  // ── Employment Income without T4 ──
  const hasEmployment = getVal('Q_SCREEN_EMPLOYMENT');
  if (hasEmployment === 'true') {
    // Check if at least one T4 employer name exists
    const t4Employer = getVal('Q_T4_EMPLOYER_NAME', 0);
    if (!t4Employer) {
      results.push({
        questionId: 'Q_T4_EMPLOYER_NAME', recordIndex: 0, severity: 'warning',
        message: 'You indicated employment income but no T4 slip has been entered. Please add your T4 slip(s).',
        category: 'missing_document',
      });
    }
  }

  // ── Self-Employment without Revenue ──
  const hasSelfEmployment = getVal('Q_SCREEN_SELF_EMPLOYMENT');
  if (hasSelfEmployment === 'true') {
    const bizName = getVal('Q_BIZ_NAME', 0);
    if (!bizName) {
      results.push({
        questionId: 'Q_BIZ_NAME', recordIndex: 0, severity: 'warning',
        message: 'You indicated self-employment income but no business details have been entered.',
        category: 'missing_required',
      });
    }
  }

  // ── Foreign Property Threshold ──
  const hasForeignProp = getVal('Q_SCREEN_FOREIGN_PROPERTY');
  if (hasForeignProp === 'true') {
    const maxCost = parseFloat((getVal('Q_FOREIGN_PROP_MAX_COST') || '0').replace(/[$,]/g, ''));
    if (maxCost > 0 && maxCost < 100000) {
      results.push({
        questionId: 'Q_FOREIGN_PROP_MAX_COST', recordIndex: 0, severity: 'warning',
        message: 'T1135 filing is required only when specified foreign property exceeds CAD $100,000 in aggregate cost. Your reported amount is below this threshold.',
        category: 'threshold_check',
      });
    }
  }

  // ── Support Payment Consistency ──
  const supportType = getVal('Q_SUPPORT_RECEIVED_TYPE');
  if (supportType === 'Child support') {
    const taxableAmount = parseFloat((getVal('Q_SUPPORT_RECEIVED_TAXABLE') || '0').replace(/[$,]/g, ''));
    if (taxableAmount > 0) {
      results.push({
        questionId: 'Q_SUPPORT_RECEIVED_TAXABLE', recordIndex: 0, severity: 'warning',
        message: 'Child support received under agreements made after May 1, 1997 is generally not taxable. Please verify your agreement date.',
        category: 'tax_treatment',
      });
    }
  }

  // ── Home Sale without Principal Residence Info ──
  const soldHome = getVal('Q_SCREEN_SOLD_HOME');
  if (soldHome === 'true') {
    const isPrincipalRes = getVal('Q_PROP_DISP_PRINCIPAL');
    if (!isPrincipalRes) {
      results.push({
        questionId: 'Q_PROP_DISP_PRINCIPAL', recordIndex: 0, severity: 'warning',
        message: 'You indicated a home sale but have not specified whether it was your principal residence. This information is required for proper reporting.',
        category: 'missing_required',
      });
    }
  }

  // ── Duplicate Slip Detection ──
  // Would check for multiple T4s from the same employer with same amounts

  return results;
}

// ─── Summary Validation ──────────────────────────────────────────────────

export interface ValidationSummary {
  totalErrors: number;
  totalWarnings: number;
  errorsByCategory: Record<string, number>;
  warningsByCategory: Record<string, number>;
  results: ValidationResult[];
  canSubmit: boolean;  // true if no blocking errors
}

export function generateValidationSummary(results: ValidationResult[]): ValidationSummary {
  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');

  const errorsByCategory: Record<string, number> = {};
  const warningsByCategory: Record<string, number> = {};

  errors.forEach(e => { errorsByCategory[e.category] = (errorsByCategory[e.category] || 0) + 1; });
  warnings.forEach(w => { warningsByCategory[w.category] = (warningsByCategory[w.category] || 0) + 1; });

  return {
    totalErrors: errors.length,
    totalWarnings: warnings.length,
    errorsByCategory,
    warningsByCategory,
    results,
    // Allow submission even with warnings — only block on errors
    canSubmit: errors.length === 0,
  };
}

// ─── Missing Items Generator ─────────────────────────────────────────────

export interface MissingItem {
  questionId: string;
  questionText: string;
  sectionTitle: string;
  moduleTitle: string;
  recordIndex: number;
  reason: 'required_empty' | 'flagged_unsure' | 'flagged_provide_later' | 'flagged_ask_preparer' | 'document_pending';
}

export function generateMissingItems(
  questions: TaxIntakeQuestion[],
  responses: Record<string, TaxIntakeResponse>,
  activeModules: string[]
): MissingItem[] {
  const items: MissingItem[] = [];

  for (const q of questions) {
    if (!activeModules.includes(q.moduleId)) continue;

    const key = `${q.id}:0`;
    const response = responses[key];

    // Check for required but empty
    if (q.validationRules?.some(r => r.type === 'required')) {
      if (!response || !response.value || response.value.trim() === '') {
        if (!response?.flag) {
          items.push({
            questionId: q.id,
            questionText: q.text,
            sectionTitle: q.sectionId,
            moduleTitle: q.moduleId,
            recordIndex: 0,
            reason: 'required_empty',
          });
        }
      }
    }

    // Check for flags
    if (response?.flag) {
      items.push({
        questionId: q.id,
        questionText: q.text,
        sectionTitle: q.sectionId,
        moduleTitle: q.moduleId,
        recordIndex: response.recordIndex,
        reason: response.flag === 'unsure' ? 'flagged_unsure'
          : response.flag === 'provide_later' ? 'flagged_provide_later'
          : 'flagged_ask_preparer',
      });
    }
  }

  return items;
}

export function validateTaxIntakeForm(
  responses: Record<string, any>,
  province: string = 'ON',
  taxYear: string = '2025'
) {
  const missingItems: any[] = [];
  const warnings: any[] = [];

  Object.entries(responses).forEach(([key, val]) => {
    if (key.includes('SIN') && val?.value) {
      if (!validateSIN(String(val.value))) {
        warnings.push({ questionId: key, message: 'Invalid Social Insurance Number checksum.' });
      }
    }
  });

  return {
    isValid: true,
    missingItems,
    warnings,
  };
}
