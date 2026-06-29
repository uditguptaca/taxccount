import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const db = getDb();
    const sqlPath = path.join(process.cwd(), 'src/db/migrations/013_payroll_module.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    await db.exec(sql);
    return NextResponse.json({ success: true, message: 'Payroll module migration applied successfully' });
  } catch (error: any) {
    console.error('Error applying payroll migration:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
