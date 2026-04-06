import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

// GET /api/portal/vault/calendar — Returns ALL compliance items from ALL sources for calendar view
export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId } = session;

    const db = getDb();
    const allTasks: any[] = [];

    // 1. Personal compliance items
    const personalItems = db.prepare(`
      SELECT pci.*, pc.name as consultant_name, pc.specialty as consultant_specialty
      FROM personal_compliance_items pci
      LEFT JOIN personal_consultants pc ON pci.assigned_consultant_id = pc.id
      WHERE pci.user_id = ? AND pci.due_date IS NOT NULL
    `).all(userId) as any[];

    for (const item of personalItems) {
      allTasks.push({
        id: item.id,
        title: item.title,
        due_date: item.due_date,
        source: 'personal',
        source_name: 'Personal',
        category: item.category,
        status: item.status,
        urgency: item.urgency,
        consultant_name: item.consultant_name || null,
        recurrence_label: item.recurrence_label,
        description: item.description,
      });
    }

    // 2. Family compliance items
    const familyItems = db.prepare(`
      SELECT pfc.*, pfm.name as member_name, pfm.relationship
      FROM personal_family_compliance pfc
      JOIN personal_family_members pfm ON pfc.family_member_id = pfm.id
      WHERE pfc.user_id = ? AND pfc.due_date IS NOT NULL
    `).all(userId) as any[];

    for (const item of familyItems) {
      allTasks.push({
        id: item.id,
        title: `${item.member_name}: ${item.title}`,
        due_date: item.due_date,
        source: 'family',
        source_name: item.member_name,
        category: item.category,
        status: item.status,
        urgency: item.urgency,
        consultant_name: null,
        recurrence_label: item.recurrence_label,
        description: item.description,
      });
    }

    // 3. Entity compliance items
    const entityItems = db.prepare(`
      SELECT pec.*, pe.name as entity_name, pe.entity_type
      FROM personal_entity_compliance pec
      JOIN personal_entities pe ON pec.entity_id = pe.id
      WHERE pec.user_id = ? AND pec.due_date IS NOT NULL
    `).all(userId) as any[];

    for (const item of entityItems) {
      allTasks.push({
        id: item.id,
        title: `${item.entity_name}: ${item.title}`,
        due_date: item.due_date,
        source: 'entity',
        source_name: item.entity_name,
        category: item.category,
        status: item.status,
        urgency: item.urgency,
        consultant_name: null,
        recurrence_label: item.recurrence_label,
        description: item.description,
      });
    }

    // 4. Firm compliance items (if user has client records)
    try {
      const clientRecords = db.prepare('SELECT id, display_name FROM clients WHERE portal_user_id = ?').all(userId) as any[];
      for (const client of clientRecords) {
        const firmComps = db.prepare(`
          SELECT cc.*, ct.name as template_name
          FROM client_compliances cc
          JOIN compliance_templates ct ON cc.template_id = ct.id
          WHERE cc.client_id = ? AND cc.due_date IS NOT NULL
        `).all(client.id) as any[];

        for (const comp of firmComps) {
          allTasks.push({
            id: comp.id,
            title: `${comp.template_name} (FY ${comp.financial_year})`,
            due_date: comp.due_date,
            source: 'firm',
            source_name: client.display_name,
            category: 'tax_filing',
            status: comp.status,
            urgency: comp.due_date && new Date(comp.due_date) < new Date() && comp.status !== 'completed' ? 'red' : comp.status === 'completed' ? 'green' : 'yellow',
            consultant_name: 'Abidebylaw',
            recurrence_label: null,
            description: comp.engagement_code,
          });
        }
      }
    } catch { /* no client records */ }

    // Sort by due date
    allTasks.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    return NextResponse.json({ tasks: allTasks });
  } catch (error) {
    console.error('Vault calendar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
