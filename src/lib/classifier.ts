// Document Auto-Classification Engine
// Rule-based + pattern matching document classifier
// Automatically tags uploaded documents based on filename patterns, MIME type, and context

export interface ClassificationResult {
  tags: string[];
  confidence: number; // 0-1
  category_suggestion?: string;
  tax_year_detected?: string;
}

// ── Classification Rules ─────────────────────────────────────────────────

interface ClassificationRule {
  pattern: RegExp;
  tags: string[];
  category?: string;
  confidence: number;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // Tax Slips & Forms
  { pattern: /\b(t4|t-4)\b/i, tags: ['tax-slip', 'employment-income', 'T4'], category: 'client_supporting', confidence: 0.95 },
  { pattern: /\b(t4a|t-4a)\b/i, tags: ['tax-slip', 'pension-income', 'T4A'], category: 'client_supporting', confidence: 0.95 },
  { pattern: /\b(t4e|t-4e)\b/i, tags: ['tax-slip', 'ei-income', 'T4E'], category: 'client_supporting', confidence: 0.95 },
  { pattern: /\b(t5|t-5)\b/i, tags: ['tax-slip', 'investment-income', 'T5'], category: 'client_supporting', confidence: 0.95 },
  { pattern: /\b(t3|t-3)\b/i, tags: ['tax-slip', 'trust-income', 'T3'], category: 'client_supporting', confidence: 0.95 },
  { pattern: /\b(t5008|t-5008)\b/i, tags: ['tax-slip', 'securities-transactions', 'T5008'], category: 'client_supporting', confidence: 0.95 },
  { pattern: /\b(t2202|t-2202)\b/i, tags: ['tax-slip', 'tuition', 'T2202'], category: 'client_supporting', confidence: 0.95 },
  { pattern: /\b(t1|t-1)\b.*\b(return|general)\b/i, tags: ['tax-return', 'personal', 'T1'], category: 'final_document', confidence: 0.90 },
  { pattern: /\b(t2|t-2)\b.*\b(return|corporate)\b/i, tags: ['tax-return', 'corporate', 'T2'], category: 'final_document', confidence: 0.90 },
  { pattern: /\b(gst|hst)\b.*\b(return|filing)\b/i, tags: ['tax-return', 'sales-tax', 'GST/HST'], category: 'final_document', confidence: 0.85 },
  { pattern: /\bnoa\b/i, tags: ['notice-of-assessment', 'CRA'], category: 'final_document', confidence: 0.90 },
  { pattern: /notice\s*of\s*assessment/i, tags: ['notice-of-assessment', 'CRA'], category: 'final_document', confidence: 0.95 },

  // Financial Statements  
  { pattern: /\bbalance\s*sheet\b/i, tags: ['financial-statement', 'balance-sheet'], category: 'client_supporting', confidence: 0.90 },
  { pattern: /\bincome\s*statement\b/i, tags: ['financial-statement', 'income-statement', 'P&L'], category: 'client_supporting', confidence: 0.90 },
  { pattern: /\btrial\s*balance\b/i, tags: ['financial-statement', 'trial-balance'], category: 'client_supporting', confidence: 0.90 },
  { pattern: /\b(financial|annual)\s*stat/i, tags: ['financial-statement'], category: 'client_supporting', confidence: 0.80 },
  { pattern: /\bprofit\s*(and|&)\s*loss\b/i, tags: ['financial-statement', 'P&L'], category: 'client_supporting', confidence: 0.90 },

  // Bank & Investment
  { pattern: /\bbank\s*statement/i, tags: ['bank-statement', 'banking'], category: 'client_supporting', confidence: 0.90 },
  { pattern: /\brlsp|rrsp\b/i, tags: ['investment', 'RRSP'], category: 'client_supporting', confidence: 0.85 },
  { pattern: /\btfsa\b/i, tags: ['investment', 'TFSA'], category: 'client_supporting', confidence: 0.85 },
  { pattern: /\bmortgage/i, tags: ['mortgage', 'real-estate'], category: 'client_supporting', confidence: 0.80 },

  // Receipts & Expenses
  { pattern: /\breceipt/i, tags: ['receipt', 'expense'], category: 'client_supporting', confidence: 0.80 },
  { pattern: /\bdonation/i, tags: ['receipt', 'charitable-donation'], category: 'client_supporting', confidence: 0.85 },
  { pattern: /\bmedical\b/i, tags: ['medical-expense'], category: 'client_supporting', confidence: 0.80 },
  { pattern: /\bchildcare|daycare\b/i, tags: ['childcare-expense'], category: 'client_supporting', confidence: 0.85 },
  { pattern: /\btuition/i, tags: ['education', 'tuition'], category: 'client_supporting', confidence: 0.85 },

  // Legal / Engagement
  { pattern: /\bengagement\s*letter/i, tags: ['engagement-letter', 'legal'], category: 'onboarding', confidence: 0.95 },
  { pattern: /\bconsent/i, tags: ['consent-form', 'authorization'], category: 'onboarding', confidence: 0.85 },
  { pattern: /\bauthoriz/i, tags: ['authorization', 'CRA'], category: 'client_signed', confidence: 0.80 },
  { pattern: /\bpower\s*of\s*attorney/i, tags: ['authorization', 'POA', 'CRA'], category: 'client_signed', confidence: 0.90 },

  // ID & Personal
  { pattern: /\b(driver|license|passport|id\s*card)\b/i, tags: ['identification', 'government-ID'], category: 'onboarding', confidence: 0.85 },
  { pattern: /\b(sin|social\s*insurance)\b/i, tags: ['identification', 'SIN'], category: 'onboarding', confidence: 0.90 },

  // Payroll
  { pattern: /\bpayroll/i, tags: ['payroll'], category: 'client_supporting', confidence: 0.85 },
  { pattern: /\bpay\s*stub/i, tags: ['payroll', 'pay-stub'], category: 'client_supporting', confidence: 0.90 },

  // Invoice / Billing
  { pattern: /\binvoice/i, tags: ['invoice', 'billing'], category: 'client_supporting', confidence: 0.75 },

  // Signed Documents
  { pattern: /\bsigned/i, tags: ['signed-document'], category: 'client_signed', confidence: 0.75 },
  { pattern: /\bsignature/i, tags: ['signed-document', 'e-signature'], category: 'client_signed', confidence: 0.80 },
];

// ── Year Detection ───────────────────────────────────────────────────────

const YEAR_PATTERNS = [
  /\b(20\d{2})\b/,           // 2020, 2021, ..., 2029
  /\b(FY|fy|fiscal)\s*(20\d{2})\b/,
  /\b(tax\s*year|TY)\s*(20\d{2})\b/i,
];

function detectTaxYear(filename: string): string | undefined {
  for (const pattern of YEAR_PATTERNS) {
    const match = filename.match(pattern);
    if (match) {
      // Return the last group that looks like a year
      const groups = match.filter(g => g && /^20\d{2}$/.test(g));
      if (groups.length > 0) return groups[groups.length - 1];
    }
  }
  return undefined;
}

// ── MIME-Based Classification ────────────────────────────────────────────

function classifyByMimeType(mimeType: string): string[] {
  const tags: string[] = [];
  
  if (mimeType === 'application/pdf') tags.push('pdf');
  else if (mimeType.startsWith('image/')) tags.push('image', 'scan');
  else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) tags.push('spreadsheet', 'financial-data');
  else if (mimeType.includes('word') || mimeType.includes('document')) tags.push('document', 'text');
  else if (mimeType === 'text/csv') tags.push('csv', 'data', 'financial-data');
  else if (mimeType === 'text/plain') tags.push('text');
  
  return tags;
}

// ── Main Classification Function ─────────────────────────────────────────

/**
 * Classify a document based on filename, MIME type, and context.
 * Returns an array of tags for the document.
 */
export function classifyDocument(
  fileName: string,
  mimeType: string,
  existingCategory?: string
): string[] {
  const allTags = new Set<string>();
  let bestConfidence = 0;
  let _suggestedCategory: string | undefined;

  // 1. Apply filename-based rules
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.pattern.test(fileName)) {
      for (const tag of rule.tags) {
        allTags.add(tag);
      }
      if (rule.confidence > bestConfidence) {
        bestConfidence = rule.confidence;
        _suggestedCategory = rule.category;
      }
    }
  }

  // 2. Apply MIME-type-based tags
  const mimeTags = classifyByMimeType(mimeType);
  for (const tag of mimeTags) {
    allTags.add(tag);
  }

  // 3. Detect tax year
  const year = detectTaxYear(fileName);
  if (year) {
    allTags.add(`year-${year}`);
  }

  // 4. Add the existing category as a tag if present
  if (existingCategory) {
    allTags.add(existingCategory);
  }

  return Array.from(allTags);
}

/**
 * Get a detailed classification result with confidence and suggestions
 */
export function classifyDocumentDetailed(
  fileName: string,
  mimeType: string,
  existingCategory?: string
): ClassificationResult {
  const tags = classifyDocument(fileName, mimeType, existingCategory);
  
  let bestConfidence = 0;
  let suggestedCategory: string | undefined;

  for (const rule of CLASSIFICATION_RULES) {
    if (rule.pattern.test(fileName) && rule.confidence > bestConfidence) {
      bestConfidence = rule.confidence;
      suggestedCategory = rule.category;
    }
  }

  return {
    tags,
    confidence: bestConfidence || 0.5,
    category_suggestion: suggestedCategory,
    tax_year_detected: detectTaxYear(fileName),
  };
}

/**
 * Batch classify all untagged documents in the database
 */
export function batchClassifyDocuments(limit: number = 100): { classified: number } {
  const { getDb } = require('./db');
  const db = getDb();

  // Ensure column exists
  try { db.exec(`ALTER TABLE document_files ADD COLUMN auto_tags TEXT;`); } catch { }

  const untagged = db.prepare(`
    SELECT id, file_name, mime_type, document_category 
    FROM document_files 
    WHERE auto_tags IS NULL
    LIMIT ?
  `).all(limit) as any[];

  let classified = 0;
  for (const doc of untagged) {
    const tags = classifyDocument(doc.file_name, doc.mime_type, doc.document_category);
    if (tags.length > 0) {
      db.prepare('UPDATE document_files SET auto_tags = ? WHERE id = ?').run(JSON.stringify(tags), doc.id);
      classified++;
    }
  }

  return { classified };
}
