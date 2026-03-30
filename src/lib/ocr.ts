// OCR & Document Text Extraction Engine
// Tier 2: Extract text from PDFs and images for full-text search
// Uses built-in Node.js capabilities + simple heuristic parsing

import fs from 'fs';
import path from 'path';
import { getDb } from './db';

/**
 * Extract text from a PDF file using basic heuristic parsing.
 * In production, this would integrate with a cloud OCR service (AWS Textract, Google Vision, Azure AI).
 * This implementation extracts readable embedded text from PDF streams.
 */
export function extractTextFromPdf(filePath: string): string {
  try {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('latin1');
    
    // Extract text between BT (begin text) and ET (end text) operators
    const textBlocks: string[] = [];
    const btEtPattern = /BT\s([\s\S]*?)ET/g;
    let match;
    
    while ((match = btEtPattern.exec(content)) !== null) {
      const block = match[1];
      // Extract Tj (show text) and TJ (show text array) content
      const tjPattern = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjPattern.exec(block)) !== null) {
        textBlocks.push(tjMatch[1]);
      }
      
      // TJ arrays: [(text) num (text) num ...]
      const tjArrayPattern = /\[([^\]]*)\]\s*TJ/g;
      let arrMatch;
      while ((arrMatch = tjArrayPattern.exec(block)) !== null) {
        const arrContent = arrMatch[1];
        const textParts = arrContent.match(/\(([^)]*)\)/g);
        if (textParts) {
          textBlocks.push(textParts.map(t => t.slice(1, -1)).join(''));
        }
      }
    }
    
    // Decode special PDF escape sequences
    let result = textBlocks.join(' ')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
    
    // Clean up excessive whitespace
    result = result.replace(/\s+/g, ' ').trim();
    
    return result || '';
  } catch (err) {
    console.error('[OCR] PDF extraction error:', err);
    return '';
  }
}

/**
 * Extract "text" from image files.
 * This is a stub for real OCR (would connect to Tesseract/cloud OCR).
 * For now, we store filename metadata as searchable content.
 */
export function extractTextFromImage(filePath: string): string {
  // In production: call AWS Textract, Google Vision, or local Tesseract
  // Return filename-based metadata for MVP
  const basename = path.basename(filePath, path.extname(filePath));
  const readable = basename
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\d{8,}/g, (m) => {
      // Try to parse date-like numbers
      if (m.length === 8) return `${m.slice(0,4)}-${m.slice(4,6)}-${m.slice(6,8)}`;
      return m;
    });
  return `[Image file] ${readable}`;
}

/**
 * Extract text from plain text files (CSV, TXT, etc.)
 */
export function extractTextFromPlain(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Limit to first 50KB for indexing
    return content.slice(0, 50000);
  } catch {
    return '';
  }
}

/**
 * Main OCR/extraction dispatcher
 */
export function extractDocumentText(filePath: string, mimeType: string): string {
  const resolvedPath = filePath.startsWith('/')
    ? path.join(process.cwd(), 'public', filePath)
    : filePath;

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`[OCR] File not found: ${resolvedPath}`);
    return '';
  }

  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(resolvedPath);
  }
  if (mimeType.startsWith('image/')) {
    return extractTextFromImage(resolvedPath);
  }
  if (['text/plain', 'text/csv'].includes(mimeType)) {
    return extractTextFromPlain(resolvedPath);
  }

  // For Office docs, extract filename metadata only (real implementation: use libreoffice/docx parser)
  return `[${mimeType}] ${path.basename(filePath)}`;
}

/**
 * Process a document for OCR and store extracted text in the database.
 */
export function processDocumentOcr(documentId: string): { success: boolean; charCount: number } {
  const db = getDb();

  // Add ocr columns if they don't exist
  try {
    db.exec(`ALTER TABLE document_files ADD COLUMN ocr_text TEXT;`);
  } catch { /* already exists */ }
  try {
    db.exec(`ALTER TABLE document_files ADD COLUMN ocr_status TEXT NOT NULL DEFAULT 'pending';`);
  } catch { /* already exists */ }

  const doc = db.prepare('SELECT * FROM document_files WHERE id = ?').get(documentId) as any;
  if (!doc) return { success: false, charCount: 0 };

  try {
    db.prepare("UPDATE document_files SET ocr_status = 'processing' WHERE id = ?").run(documentId);

    const extractedText = extractDocumentText(doc.storage_path, doc.mime_type);

    db.prepare("UPDATE document_files SET ocr_text = ?, ocr_status = 'completed' WHERE id = ?")
      .run(extractedText || null, documentId);

    return { success: true, charCount: extractedText.length };
  } catch (err) {
    console.error(`[OCR] Processing failed for ${documentId}:`, err);
    db.prepare("UPDATE document_files SET ocr_status = 'failed' WHERE id = ?").run(documentId);
    return { success: false, charCount: 0 };
  }
}

/**
 * Batch process all documents that haven't been OCR'd yet.
 */
export function batchProcessOcr(limit: number = 50): { processed: number; failed: number } {
  const db = getDb();

  // Ensure columns exist
  try { db.exec(`ALTER TABLE document_files ADD COLUMN ocr_text TEXT;`); } catch { }
  try { db.exec(`ALTER TABLE document_files ADD COLUMN ocr_status TEXT NOT NULL DEFAULT 'pending';`); } catch { }

  const pending = db.prepare(`
    SELECT id FROM document_files 
    WHERE ocr_status = 'pending' OR ocr_status IS NULL
    LIMIT ?
  `).all(limit) as any[];

  let processed = 0;
  let failed = 0;

  for (const doc of pending) {
    const result = processDocumentOcr(doc.id);
    if (result.success) processed++;
    else failed++;
  }

  return { processed, failed };
}
