import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Install anything the database is missing and report what was done. The app
 * does the same by itself on its first query, so this is only a way to run
 * it on demand and see the result.
 */
export async function POST() {
  try {
    const results = await runMigrations();
    return NextResponse.json({ success: true, results, count: results.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
