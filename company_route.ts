import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    
    // We should ideally filter by org_id from the session, but we will simplify for now
    const sql = `SELECT * FROM payroll_company WHERE client_id = ? LIMIT 1`;
    const company = await db.prepare(sql).get(params.clientId);
    
    if (!company) {
      return NextResponse.json({ company: null });
    }
    
    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const body = await request.json();
    
    // Check if company already exists
    const existingSql = `SELECT id FROM payroll_company WHERE client_id = ? LIMIT 1`;
    const existing = await db.prepare(existingSql).get(params.clientId);
    
    // For now, hardcode org_id (in a real app, this comes from the auth session)
    const orgId = '123e4567-e89b-12d3-a456-426614174000'; // mock
    
    if (existing) {
      // Update
      const sql = `
        UPDATE payroll_company 
        SET legal_name = ?, business_number = ?, payroll_program_account = ?, 
            default_province = ?, remitter_type = ?, updated_at = NOW()
        WHERE client_id = ?
        RETURNING *
      `;
      const result = await db.prepare(sql).get(
        body.legal_name, body.business_number, body.payroll_program_account, 
        body.default_province, body.remitter_type, params.clientId
      );
      return NextResponse.json({ company: result });
    } else {
      // Insert
      const sql = `
        INSERT INTO payroll_company (org_id, client_id, legal_name, business_number, payroll_program_account, default_province, remitter_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `;
      const result = await db.prepare(sql).get(
        orgId, params.clientId, body.legal_name, body.business_number, 
        body.payroll_program_account, body.default_province, body.remitter_type
      );
      return NextResponse.json({ company: result });
    }
  } catch (error: any) {
    console.error('Error saving company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
