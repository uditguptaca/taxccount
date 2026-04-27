import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const stats = {
      countries: (await db.prepare('SELECT COUNT(*) as c FROM sm_countries WHERE is_active=1').get() as any)?.c || 0,
      states: (await db.prepare('SELECT COUNT(*) as c FROM sm_states WHERE is_active=1').get() as any)?.c || 0,
      entityTypes: (await db.prepare('SELECT COUNT(*) as c FROM sm_entity_types WHERE is_active=1').get() as any)?.c || 0,
      departments: (await db.prepare('SELECT COUNT(*) as c FROM sm_departments WHERE is_active=1').get() as any)?.c || 0,
      complianceHeads: (await db.prepare('SELECT COUNT(*) as c FROM sm_compliance_heads WHERE is_active=1').get() as any)?.c || 0,
      subCompliances: (await db.prepare('SELECT COUNT(*) as c FROM sm_sub_compliances WHERE is_active=1').get() as any)?.c || 0,
      serviceRules: (await db.prepare('SELECT COUNT(*) as c FROM sm_service_rules WHERE is_active=1').get() as any)?.c || 0,
      questions: (await db.prepare('SELECT COUNT(*) as c FROM sm_questions WHERE is_active=1').get() as any)?.c || 0,
      infoFields: (await db.prepare('SELECT COUNT(*) as c FROM sm_info_fields WHERE is_active=1').get() as any)?.c || 0,
      penalties: (await db.prepare('SELECT COUNT(*) as c FROM sm_penalties WHERE is_active=1').get() as any)?.c || 0,
      userProfiles: (await db.prepare('SELECT COUNT(*) as c FROM user_compliance_profiles').get() as any)?.c || 0,
      userSelections: (await db.prepare('SELECT COUNT(*) as c FROM user_selected_compliances').get() as any)?.c || 0,
    };
    return NextResponse.json(stats);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
