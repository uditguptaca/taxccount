import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDb();
    
    const { readdirSync } = require('fs');
    const migrationsDir = join(process.cwd(), 'src', 'db', 'migrations');
    const files = readdirSync(migrationsDir).filter((f: string) => f.endsWith('.sql')).sort();
    
    const results: string[] = [];
    
    for (const file of files) {
      const migrationPath = join(migrationsDir, file);
      const migrationSql = readFileSync(migrationPath, 'utf-8');
      
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const stmt of statements) {
        try {
          await db.prepare(stmt).run();
          results.push(`✓ [${file}] ${stmt.substring(0, 50)}...`);
        } catch (err: any) {
          if (err.message?.includes('already exists') || err.message?.includes('42701') || err.message?.includes('duplicate column')) {
            results.push(`⚠ [${file}] SKIPPED (already exists): ${stmt.substring(0, 50)}...`);
          } else {
            results.push(`✗ [${file}] ERROR: ${err.message} — ${stmt.substring(0, 50)}...`);
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, results, count: results.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
