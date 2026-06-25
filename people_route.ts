import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    
    // Get people joined with pay_group name
    const sql = `
      SELECT p.*, pg.name as pay_group_name 
      FROM payroll_person p
      LEFT JOIN pay_group pg ON p.pay_group_id = pg.id
      WHERE p.client_id = ? 
      ORDER BY p.first_name ASC
    `;
    const people = await db.prepare(sql).all(params.clientId);
    
    return NextResponse.json({ people });
  } catch (error: any) {
    console.error('Error fetching people:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const body = await request.json();
    
    const orgId = '123e4567-e89b-12d3-a456-426614174000'; // mock session org_id
    
    const sql = `
      INSERT INTO payroll_person (
        org_id, client_id, pay_group_id, first_name, last_name, type, title, department, 
        province_of_employment, hire_date, pay_type, pay_rate, standard_hours, 
        federal_claim, provincial_claim, additional_tax, cpp_exempt, ei_exempt, 
        northern_deduction, vacation_rate, vacation_pay_method, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;
    const result = await db.prepare(sql).get(
      orgId, params.clientId, body.pay_group_id || null, body.first_name, body.last_name, 
      body.type, body.title || null, body.department || null, body.province_of_employment || 'ON', 
      body.hire_date || null, body.pay_type || 'Salary', body.pay_rate || 0, body.standard_hours || 40,
      body.federal_claim || 0, body.provincial_claim || 0, body.additional_tax || 0, 
      body.cpp_exempt || false, body.ei_exempt || false, body.northern_deduction || 0, 
      body.vacation_rate || 4, body.vacation_pay_method || 'accrue', body.status || 'ACTIVE'
    );
    
    return NextResponse.json({ person: result });
  } catch (error: any) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
