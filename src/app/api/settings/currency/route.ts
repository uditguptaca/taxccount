import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    
    // Get or create firm settings
    let settings = await db.prepare('SELECT * FROM firm_settings WHERE org_id = ?').get(session.orgId) as any;
    if (!settings) {
      // Also check the org's currency_code as fallback
      const org = await db.prepare('SELECT currency_code FROM organizations WHERE id = ?').get(session.orgId) as any;
      const baseCurrency = org?.currency_code || 'CAD';
      const id = uuidv4();
      await db.prepare(
        'INSERT INTO firm_settings (id, org_id, base_currency, currency_display_style, default_template_currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())'
      ).run(id, session.orgId, baseCurrency, 'code', baseCurrency);
      settings = { id, org_id: session.orgId, base_currency: baseCurrency, currency_display_style: 'code', default_template_currency: baseCurrency };
    }
    
    // Get exchange rates
    const rates = await db.prepare(
      'SELECT * FROM currency_exchange_rates WHERE org_id = ? ORDER BY from_currency, to_currency'
    ).all(session.orgId);
    
    return NextResponse.json({ settings, rates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();
    const { base_currency, currency_display_style, default_template_currency } = body;
    
    // Upsert firm settings
    const existing = await db.prepare('SELECT id FROM firm_settings WHERE org_id = ?').get(session.orgId) as any;
    if (existing) {
      await db.prepare(
        'UPDATE firm_settings SET base_currency = ?, currency_display_style = ?, default_template_currency = ?, updated_at = NOW() WHERE org_id = ?'
      ).run(base_currency || 'CAD', currency_display_style || 'code', default_template_currency || base_currency || 'CAD', session.orgId);
    } else {
      await db.prepare(
        'INSERT INTO firm_settings (id, org_id, base_currency, currency_display_style, default_template_currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())'
      ).run(uuidv4(), session.orgId, base_currency || 'CAD', currency_display_style || 'code', default_template_currency || base_currency || 'CAD');
    }
    
    // Also update org's currency_code for backward compat
    await db.prepare('UPDATE organizations SET currency_code = ? WHERE id = ?').run(base_currency || 'CAD', session.orgId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
