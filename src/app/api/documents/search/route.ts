import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

/**
 * Full-text document search API
 * Searches across: file_name, ocr_text (extracted content), document_category, financial_year
 * Supports portal (client RLS) and staff access
 */
export async function GET(request: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const clientId = searchParams.get('client_id');
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    // Full-text search across file name and OCR content
    const searchPattern = `%${query}%`;
    conditions.push(`(df.file_name LIKE ? OR df.ocr_text LIKE ? OR df.document_category LIKE ?)`);
    params.push(searchPattern, searchPattern, searchPattern);

    // RLS: Client users can only see their own documents (not internal-only)
    if (role === 'client') {
      const client = db.prepare('SELECT id FROM clients WHERE portal_user_id = ?').get(userId) as any;
      if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      conditions.push('df.client_id = ? AND df.is_internal_only = 0');
      params.push(client.id);
    } else if (clientId) {
      conditions.push('df.client_id = ?');
      params.push(clientId);
    }

    if (category) {
      conditions.push('df.document_category = ?');
      params.push(category);
    }
    if (year) {
      conditions.push('df.financial_year = ?');
      params.push(year);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const results = db.prepare(`
      SELECT 
        df.id, df.file_name, df.mime_type, df.file_size_bytes, df.document_category,
        df.financial_year, df.status, df.storage_path, df.created_at, df.ocr_status,
        c.display_name as client_name, c.client_code,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        cc.engagement_code, ct.name as template_name,
        CASE 
          WHEN df.file_name LIKE ? THEN 'filename'
          WHEN df.ocr_text LIKE ? THEN 'content'
          ELSE 'metadata'
        END as match_type,
        CASE 
          WHEN df.ocr_text LIKE ? THEN 
            SUBSTR(df.ocr_text, MAX(1, INSTR(LOWER(df.ocr_text), LOWER(?)) - 50), 150)
          ELSE NULL
        END as content_snippet
      FROM document_files df
      JOIN clients c ON df.client_id = c.id
      LEFT JOIN users u ON df.uploaded_by = u.id
      LEFT JOIN client_compliances cc ON df.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      ${whereClause}
      ORDER BY 
        CASE WHEN df.file_name LIKE ? THEN 0 ELSE 1 END,
        df.created_at DESC
      LIMIT ?
    `).all(
      searchPattern, searchPattern, searchPattern, query,
      ...params,
      searchPattern,
      limit
    ) as any[];

    return NextResponse.json({
      query,
      total: results.length,
      results: results.map(r => ({
        ...r,
        content_snippet: r.content_snippet?.replace(/\s+/g, ' ').trim() || null,
      })),
    });
  } catch (error: any) {
    console.error('Document search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
