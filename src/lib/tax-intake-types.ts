// ═══════════════════════════════════════════════════════════════════════════
// TAX INTAKE SYSTEM — TypeScript Type Definitions
// Canadian T1 Personal Income Tax Client Intake Module
// ═══════════════════════════════════════════════════════════════════════════

// ─── Core Types ──────────────────────────────────────────────────────────

export type TaxYear = '2025' | '2024' | '2023' | '2022' | '2021' | '2020';

export type Province =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NT' | 'NS' | 'NU'
  | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export const PROVINCE_NAMES: Record<Province, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba',
  NB: 'New Brunswick', NL: 'Newfoundland and Labrador',
  NT: 'Northwest Territories', NS: 'Nova Scotia', NU: 'Nunavut',
  ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon',
};

export type InputType =
  | 'text' | 'long_text' | 'currency' | 'number' | 'percentage'
  | 'date' | 'radio' | 'select' | 'checkbox' | 'multi_checkbox'
  | 'file' | 'sin' | 'address' | 'phone' | 'email'
  | 'boolean'
  | 'info_only';  // Display-only informational text

export type SensitivityLevel = 'normal' | 'protected' | 'restricted' | 'low';

export type EngagementStatus =
  | 'not_started' | 'in_progress' | 'awaiting_documents'
  | 'needs_clarification' | 'submitted' | 'under_review'
  | 'reviewed' | 'returned_to_client';

export type FilingType = 'original' | 'unfiled_prior_year' | 'adjustment';

export type ResponseFlag = 'unsure' | 'provide_later' | 'ask_preparer';

export type ReviewItemType =
  | 'missing_required' | 'client_unsure' | 'client_question'
  | 'duplicate_slip' | 'validation_warning' | 'specialist_referral'
  | 'preparer_override' | 'document_mismatch';

export type ReviewItemStatus = 'open' | 'in_progress' | 'resolved' | 'deferred';

// ─── Condition System ────────────────────────────────────────────────────

export type ConditionOperator =
  | 'equals' | 'not_equals' | 'contains' | 'not_contains'
  | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  | 'in' | 'not_in' | 'is_true' | 'is_false';

export interface Condition {
  questionId: string;
  operator: ConditionOperator;
  value?: string | string[] | number | boolean;
  /** For compound conditions */
  logicalOp?: 'AND' | 'OR';
}

// ─── Validation System ───────────────────────────────────────────────────

export type ValidationType =
  | 'required' | 'min_length' | 'max_length' | 'pattern'
  | 'min_value' | 'max_value' | 'date_range' | 'sin_format'
  | 'postal_code' | 'phone_format' | 'email_format'
  | 'percentage_range' | 'cross_field' | 'custom';

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
  /** Cross-field reference for comparison validations */
  referenceQuestionId?: string;
  severity: 'error' | 'warning';
}

// ─── Question Definition ─────────────────────────────────────────────────

export interface TaxIntakeQuestion {
  id: string;
  sectionId: string;
  moduleId: string;
  text: string;
  textFr?: string;
  helpText?: string;
  helpTextFr?: string;
  whyWeAsk?: string;
  whyWeAskFr?: string;
  inputType: InputType;
  options?: string[];
  optionsFr?: string[];
  placeholder?: string;
  defaultValue?: string;
  repeatable: boolean;
  visibilityConditions?: Condition[];
  requiredConditions?: Condition[];
  validationRules?: ValidationRule[];
  taxYear: TaxYear | 'all';
  provinces?: Province[] | 'all';
  suggestedDocuments?: string[];
  allowUnsure: boolean;
  allowProvideLater: boolean;
  allowAskPreparer: boolean;
  preparerReviewFlag?: string;
  formLineMapping?: string;
  sensitivityLevel: SensitivityLevel;
  sortOrder: number;
  /** For grouping related questions (e.g., all Box fields on a T4) */
  groupId?: string;
  /** For questions that should appear as a sub-question */
  parentQuestionId?: string;
}

// ─── Section Definition ──────────────────────────────────────────────────

export interface TaxIntakeSection {
  id: string;
  moduleId: string;
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  sortOrder: number;
  isConditional: boolean;
  visibilityConditions?: Condition[];
  /** Whether this section supports repeatable records */
  isRepeatable: boolean;
  repeatLabel?: string;       // e.g., "T4 Slip", "Dependant", "Property"
  repeatLabelFr?: string;
  maxRecords?: number;
}

// ─── Module Definition ───────────────────────────────────────────────────

export type ModuleCode =
  | 'A_ENGAGEMENT' | 'B_IDENTIFICATION' | 'C_RESIDENCY'
  | 'D_MARITAL' | 'E_DEPENDANTS' | 'F_INCOME_DISCOVERY'
  | 'G_TAX_SLIPS' | 'H_EMPLOYMENT' | 'I_PENSIONS'
  | 'J_SELF_EMPLOYMENT' | 'K_FARMING_FISHING' | 'L_VEHICLE_WORKSPACE'
  | 'M_RENTAL' | 'N_INVESTMENTS' | 'O_CAPITAL_GAINS'
  | 'P_PRINCIPAL_RESIDENCE' | 'Q_CRYPTO' | 'R_FOREIGN'
  | 'S_RRSP_PLANS' | 'T_FHSA_REGISTERED' | 'U_EMPLOYMENT_EXPENSES'
  | 'V_CHILDCARE_SUPPORT' | 'W_EDUCATION' | 'X_MEDICAL_DISABILITY'
  | 'Y_HOUSING_MOVING' | 'Z_DONATIONS_CREDITS'
  | 'AA_PROVINCIAL' | 'AB_QUEBEC' | 'AC_SPECIAL_SITUATIONS'
  | 'AD_PAYMENTS_REVIEW';

export interface TaxIntakeModule {
  code: ModuleCode;
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  icon: string;
  phase: 'getting_started' | 'personal_info' | 'income' | 'deductions_credits' | 'provincial' | 'review';
  sortOrder: number;
  /** Always shown vs. conditional on screening answers */
  alwaysVisible: boolean;
  /** Conditions that activate this module from the screening questionnaire */
  activationConditions?: Condition[];
  sections: TaxIntakeSection[];
  questions: TaxIntakeQuestion[];
}

// ─── Engagement & Response Types ─────────────────────────────────────────

export interface TaxIntakeEngagement {
  id: string;
  orgId: string;
  clientId: string;
  clientName?: string;
  taxpayerName?: string;
  taxYear: TaxYear;
  filingType: FilingType;
  province?: Province;
  status: EngagementStatus;
  assignedPreparerId?: string;
  assignedReviewerId?: string;
  activeModules: ModuleCode[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  dueDate?: string;
  portalToken?: string;
}

export interface TaxIntakeResponse {
  id: string;
  engagementId: string;
  questionId: string;
  recordIndex: number;      // 0 for non-repeatable, 1+ for repeatable records
  value: string | null;
  flag?: ResponseFlag;
  flagNote?: string;         // Client's note when "Ask my preparer"
  createdAt: string;
  updatedAt: string;
}

export interface TaxIntakeDocument {
  id: string;
  engagementId: string;
  questionId?: string;
  sectionId?: string;
  recordIndex: number;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  storageKey?: string;       // Path in storage bucket
  uploadStatus: 'pending' | 'uploaded' | 'verified' | 'rejected';
  ocrStatus?: 'none' | 'processing' | 'completed' | 'failed';
  ocrData?: string;          // JSON of extracted values
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface TaxIntakeRepeatRecord {
  id: string;
  engagementId: string;
  sectionId: string;
  recordIndex: number;
  label?: string;            // e.g., "Acme Corp T4", "Child: Sarah"
  createdAt: string;
}

export interface TaxIntakeReviewItem {
  id: string;
  engagementId: string;
  questionId?: string;
  recordIndex: number;
  type: ReviewItemType;
  title: string;
  description?: string;
  status: ReviewItemStatus;
  assignedTo?: string;
  clientNote?: string;
  preparerNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface TaxIntakePreparerNote {
  id: string;
  engagementId: string;
  questionId?: string;
  sectionId?: string;
  note: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxIntakeSubmission {
  id: string;
  engagementId: string;
  versionNumber: number;
  snapshotData: string;     // Full JSON of all responses + documents at submission time
  submittedAt: string;
  submittedBy: string;
  clientAcknowledgements: string; // JSON of what was acknowledged
}

// ─── Screening Questions (Module F) ─────────────────────────────────────

export interface ScreeningCategory {
  id: string;
  title: string;
  titleFr?: string;
  icon: string;
  questions: ScreeningQuestion[];
}

export interface ScreeningQuestion {
  id: string;
  text: string;
  textFr?: string;
  helpText?: string;
  /** Which modules get activated when this is checked */
  activatesModules: ModuleCode[];
}

// ─── UI State Types ──────────────────────────────────────────────────────

export interface ModuleProgress {
  moduleCode: ModuleCode;
  totalQuestions: number;
  answeredQuestions: number;
  requiredQuestions: number;
  requiredAnswered: number;
  flaggedCount: number;
  documentsPending: number;
  status: 'not_started' | 'in_progress' | 'complete' | 'has_issues';
}

export interface IntakeFormState {
  engagement: TaxIntakeEngagement;
  responses: Record<string, TaxIntakeResponse>;   // Keyed by `${questionId}:${recordIndex}`
  documents: TaxIntakeDocument[];
  repeatRecords: Record<string, TaxIntakeRepeatRecord[]>;  // Keyed by sectionId
  reviewItems: TaxIntakeReviewItem[];
  moduleProgress: ModuleProgress[];
  currentModule: ModuleCode | null;
  currentSection: string | null;
  isSaving: boolean;
  lastSavedAt: string | null;
  isDirty: boolean;
  language: 'en' | 'fr';
}
