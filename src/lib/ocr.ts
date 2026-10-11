// OCR & Document Text Extraction Engine
// Tier 2: Extract text from PDFs and images for full-text search
// Uses built-in Node.js capabilities + simple heuristic parsing

import { getDb } from './db';

/**
 * Extract text from a PDF using basic heuristic parsing of its text operators.
 * A real OCR service (AWS Textract, Google Vision, Azure AI) would replace this;
 * until then this reads the text embedded in the PDF itself.
 */
export function extractTextFromPdf(buffer: Buffer): string {
  try {
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
 * "Text" for image files: a readable form of the file name.
 * Real OCR (Tesseract or a cloud service) would replace this.
 */
export function extractTextFromImage(fileName: string): string {
  const basename = fileName.replace(/\.[^.]+$/, '');
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
export function extractTextFromPlain(buffer: Buffer): string {
  // Limit to first 50KB for indexing
  return buffer.toString('utf-8', 0, Math.min(buffer.length, 50000));
}

/**
 * Main extraction dispatcher. Works on the file's bytes, not a path on disk.
 */
export function extractDocumentText(buffer: Buffer, fileName: string, mimeType: string): string {
  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(buffer);
  }
  if (mimeType.startsWith('image/')) {
    return extractTextFromImage(fileName);
  }
  if (['text/plain', 'text/csv'].includes(mimeType)) {
    return extractTextFromPlain(buffer);
  }

  // Office documents: file name only (a real parser would read the contents)
  return `[${mimeType}] ${fileName}`;
}

/**
 * Index one document: read its text and store it for search.
 * Pass the bytes when you already have them (a fresh upload); otherwise they are read from Neon.
 */
export async function processDocumentOcr(
  documentId: string,
  bytes?: Buffer,
): Promise<{ success: boolean; charCount: number }> {
  const db = getDb();

  const doc = await db.prepare('SELECT id, file_name, mime_type FROM document_files WHERE id = ?').get(documentId) as any;
  if (!doc) return { success: false, charCount: 0 };

  try {
    await db.prepare("UPDATE document_files SET ocr_status = 'processing' WHERE id = ?").run(documentId);

    let buffer = bytes;
    if (!buffer) {
      const row = await db.prepare('SELECT content FROM document_blobs WHERE document_id = ?').get(documentId) as any;
      if (!row) {
        // Nothing stored for this document (an old record whose file was never kept).
        await db.prepare("UPDATE document_files SET ocr_status = 'failed' WHERE id = ?").run(documentId);
        return { success: false, charCount: 0 };
      }
      buffer = Buffer.from(row.content);
    }

    const extractedText = extractDocumentText(buffer, doc.file_name, doc.mime_type);

    await db.prepare("UPDATE document_files SET ocr_text = ?, ocr_status = 'completed' WHERE id = ?")
      .run(extractedText || null, documentId);

    return { success: true, charCount: extractedText.length };
  } catch (err) {
    console.error(`[OCR] Processing failed for ${documentId}:`, err);
    await db.prepare("UPDATE document_files SET ocr_status = 'failed' WHERE id = ?").run(documentId);
    return { success: false, charCount: 0 };
  }
}

/**
 * Batch process all documents that haven't been indexed yet.
 */
export async function batchProcessOcr(limit: number = 50): Promise<{ processed: number; failed: number }> {
  const db = getDb();

  const pending = await db.prepare(`
    SELECT id FROM document_files
    WHERE ocr_status = 'pending' OR ocr_status IS NULL
    LIMIT ?
  `).all(limit) as any[];

  let processed = 0;
  let failed = 0;

  for (const doc of pending) {
    const result = await processDocumentOcr(doc.id);
    if (result.success) processed++;
    else failed++;
  }

  return { processed, failed };
}
