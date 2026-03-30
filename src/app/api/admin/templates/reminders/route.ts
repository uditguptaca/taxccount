import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const templates = db.prepare('SELECT * FROM reminder_templates ORDER BY created_at DESC').all();
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, cascade_config_json } = await request.json();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reminder_templates (id, name, cascade_config_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, cascade_config_json, now, now);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
