import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDb();
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'src', 'db', 'migrations', '002_template_wizard_currency.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const results: string[] = [];
    for (const stmt of statements) {
      try {
        await db.prepare(stmt).run();
        results.push(`✓ ${stmt.substring(0, 80)}...`);
      } catch (err: any) {
        // Ignore "already exists" errors for idempotent migration
        if (err.message?.includes('already exists') || err.message?.includes('42701')) {
          results.push(`⚠ SKIPPED (already exists): ${stmt.substring(0, 80)}...`);
        } else {
          results.push(`✗ ERROR: ${err.message} — ${stmt.substring(0, 80)}...`);
        }
      }
    }
    
    return NextResponse.json({ success: true, results, count: results.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
