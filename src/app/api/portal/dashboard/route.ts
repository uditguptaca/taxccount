import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { searchParams } = new URL(req.url);
    const requestedClientId = searchParams.get('client_id');

    const db = getDb();

    // ── FIND ALL ACCESSIBLE ACCOUNTS ──
    let accessibleAccounts = db.prepare('SELECT id, display_name, client_type FROM clients WHERE portal_user_id = ?').all(userId) as any[];
    
    let client: any = null;
    
    if (accessibleAccounts.length === 0) {
      if (role === 'individual') {
        const u = db.prepare('SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?').get(userId) as any;
        if (!u) return NextResponse.json({ error: 'No User found' }, { status: 404 });
        
        accessibleAccounts = [{
          id: u.id,
          display_name: `${u.first_name} ${u.last_name}`,
          client_type: 'individual'
        }];
        
        client = {
          id: u.id,
          display_name: `${u.first_name} ${u.last_name}`,
          client_code: 'PERSONAL',
          client_type: 'individual',
          primary_email: u.email,
          primary_phone: u.phone,
          status: 'active'
        };
      } else {
        return NextResponse.json({ error: 'No client accounts found' }, { status: 404 });
      }
    } else {
      // Determine working client
      client = accessibleAccounts.find((a: any) => a.id === requestedClientId);
      if (!client) {
        client = accessibleAccounts[0];
      }
      
      // Fetch full client details for working client
      client = db.prepare('SELECT * FROM clients WHERE id = ?').get(client.id) as any;
    }

    // ── COMPLIANCES (grouped by client_facing_status) ──
    const compliances = db.prepare(`
      SELECT cc.*, ct.name as template_name, ct.code as template_code,
        (SELECT stage_name FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'in_progress' LIMIT 1) as current_stage_name,
        (SELECT stage_code FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'in_progress' LIMIT 1) as current_stage_code
      FROM client_compliances cc
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.client_id = ?
      ORDER BY cc.due_date ASC
    `).all(client.id) as any[];

    // ── CLIENT TASKS (pending) ──
    const tasks = db.prepare(`
      SELECT ct.*, cht.subject as thread_subject
      FROM client_tasks ct
      LEFT JOIN chat_threads cht ON ct.thread_id = cht.id
      WHERE ct.client_id = ? AND ct.is_completed = 0
      ORDER BY ct.created_at DESC
    `).all(client.id) as any[];

    // ── DOCUMENT REQUESTS (from engagements in DATA_COLLECTION stage) ──
    const docRequests = db.prepare(`
      SELECT ctd.document_name, ctd.document_category, ctd.is_mandatory, ctd.id as template_doc_id,
        cc.id as engagement_id, cc.engagement_code, cc.financial_year,
        ct2.name as template_name,
        ccs.stage_code,
        (SELECT COUNT(*) FROM document_files df 
         WHERE df.engagement_id = cc.id AND df.template_doc_id = ctd.id) as uploaded_count
      FROM client_compliances cc
      JOIN compliance_templates ct2 ON cc.template_id = ct2.id
      JOIN client_compliance_stages ccs ON ccs.engagement_id = cc.id
      JOIN compliance_template_documents ctd ON ctd.template_id = cc.template_id
        AND ctd.linked_stage_code = ccs.stage_code
        AND ctd.upload_by IN ('client', 'either')
      WHERE cc.client_id = ?
        AND ccs.status = 'in_progress'
        AND ccs.stage_code IN ('DATA_COLLECTION', 'ONBOARDING', 'SENT_TO_CLIENT')
      ORDER BY ctd.is_mandatory DESC, ctd.document_name ASC
    `).all(client.id) as any[];

    // ── UNREAD CHATS ──
    const unreadChats = db.prepare(`
      SELECT cht.id, cht.subject, cht.last_message_at,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.thread_id = cht.id AND cm.is_read = 0 AND cm.sender_id != ?) as unread_count,
        (SELECT content FROM chat_messages cm2 WHERE cm2.thread_id = cht.id ORDER BY cm2.created_at DESC LIMIT 1) as last_message,
        (SELECT u.first_name || ' ' || u.last_name FROM chat_messages cm3 JOIN users u ON cm3.sender_id = u.id WHERE cm3.thread_id = cht.id ORDER BY cm3.created_at DESC LIMIT 1) as last_sender
      FROM chat_threads cht
      WHERE cht.client_id = ? AND cht.thread_type = 'client_facing' AND cht.is_active = 1
      ORDER BY cht.last_message_at DESC
    `).all(userId, client.id) as any[];

    // ── BILLING ──
    const billing = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN status IN ('sent','overdue','partially_paid') THEN total_amount - paid_amount ELSE 0 END), 0) as outstanding,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total_amount - paid_amount ELSE 0 END), 0) as overdue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COUNT(CASE WHEN status IN ('sent','overdue','partially_paid') THEN 1 END) as unpaid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM invoices WHERE client_id = ?
    `).get(client.id) as any;

    // ── FULL INVOICES LIST ──
    const invoices = db.prepare(`
      SELECT i.*, ct.name as template_name, cc.engagement_code, cc.financial_year
      FROM invoices i
      LEFT JOIN client_compliances cc ON i.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE i.client_id = ?
      ORDER BY i.issued_date DESC
    `).all(client.id) as any[];

    // Map internal status -> client-facing status
    const mapClientStatus = (comp: any) => {
      const code = comp.current_stage_code;
      if (comp.status === 'completed') return 'Completed';
      if (!code) return comp.status === 'new' ? 'Not Started' : 'In Progress';
      if (['DATA_COLLECTION', 'ONBOARDING'].includes(code)) return 'Waiting for You';
      if (['SENT_TO_CLIENT'].includes(code)) return 'Review & Sign';
      if (['BILLING', 'PAYMENT_RECEIVED'].includes(code)) return 'Payment Required';
      if (['PREPARED', 'FIRST_CHECK', 'SECOND_CHECK'].includes(code)) return 'In Progress';
      if (['FINAL_FILING', 'DOC_CHECKLIST', 'COMPLETED'].includes(code)) return 'Completed';
      return 'In Progress';
    };

    // ── LINKED ENTITIES ──
    let linkedEntities: any[] = [];
    try {
      linkedEntities = db.prepare(`
        SELECT cr.id as link_id, cr.role,
          CASE WHEN cr.client_id = ? THEN cr.linked_client_id ELSE cr.client_id END as linked_client_id
        FROM client_relationships cr
        WHERE cr.client_id = ? OR cr.linked_client_id = ?
      `).all(client.id, client.id, client.id) as any[];
    } catch (e) { console.warn('linkedEntities table missing', e); }

    const linkedEntitiesEnriched: any[] = [];
    for (const le of linkedEntities) {
      const linkedClient = db.prepare('SELECT id, display_name, client_code, client_type, primary_email, status FROM clients WHERE id = ?').get(le.linked_client_id) as any;
      if (!linkedClient) continue;
      // Fetch compliances for linked entity
      const linkedComps = db.prepare(`
        SELECT cc.*, ct.name as template_name, ct.code as template_code,
          (SELECT stage_name FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'in_progress' LIMIT 1) as current_stage,
          (SELECT stage_code FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'in_progress' LIMIT 1) as current_stage_code
        FROM client_compliances cc
        JOIN compliance_templates ct ON cc.template_id = ct.id
        WHERE cc.client_id = ?
        ORDER BY cc.due_date ASC
      `).all(linkedClient.id) as any[];

      linkedEntitiesEnriched.push({
        link_id: le.link_id,
        role: le.role,
        client_id: linkedClient.id,
        display_name: linkedClient.display_name,
        client_code: linkedClient.client_code,
        client_type: linkedClient.client_type,
        primary_email: linkedClient.primary_email,
        status: linkedClient.status,
        engagements: linkedComps.map((c: any) => ({ ...c, client_status: mapClientStatus(c) })),
      });
    }

    // ── DOCUMENTS SUMMARY ──
    let docSummary: any = { total_docs: 0, permanent_count: 0, pending_approval: 0, approved: 0, rejected: 0 };
    try {
      docSummary = db.prepare(`
        SELECT 
          COUNT(*) as total_docs,
          COUNT(CASE WHEN document_category = 'permanent' THEN 1 END) as permanent_count,
          COUNT(CASE WHEN approval_status = 'PENDING' OR approval_status IS NULL THEN 1 END) as pending_approval,
          COUNT(CASE WHEN approval_status = 'APPROVED' THEN 1 END) as approved,
          COUNT(CASE WHEN approval_status = 'REJECTED' THEN 1 END) as rejected
        FROM document_files WHERE client_id = ?
      `).get(client.id) as any;
    } catch (e) { console.warn('document_files table missing', e); }

    // ── CLIENT CONTACTS ──
    let contacts: any[] = [];
    try {
      contacts = db.prepare(`
        SELECT * FROM client_contacts WHERE client_id = ? ORDER BY is_primary DESC, contact_name ASC
      `).all(client.id) as any[];
    } catch (e) { console.warn('client_contacts table missing', e); }

    // ── PERSONAL INFO ──
    let personalInfo: any[] = [];
    try {
      personalInfo = db.prepare(`
        SELECT * FROM client_personal_info WHERE client_id = ? ORDER BY info_key ASC
      `).all(client.id) as any[];
    } catch (e) { console.warn('client_personal_info table missing', e); }

    // ── CLIENT TAGS ──
    let tags: any[] = [];
    try {
      tags = db.prepare(`
        SELECT t.name, t.color FROM client_tag_assignments cta
        JOIN client_tags t ON cta.tag_id = t.id
        WHERE cta.client_id = ?
      `).all(client.id) as any[];
    } catch (e) { console.warn('client_tags table missing', e); }

    // ── REMINDERS (upcoming for this client) ──
    const reminders = db.prepare(`
      SELECT r.*, cc.engagement_code, ct.name as template_name
      FROM reminders r
      LEFT JOIN client_compliances cc ON r.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE r.client_id = ? AND r.status = 'pending'
      ORDER BY r.trigger_date ASC
      LIMIT 10
    `).all(client.id) as any[];

    // ── RECENT ACTIVITY ──
    let activity: any[] = [];
    try {
      activity = db.prepare(`
        SELECT af.*, u.first_name || ' ' || u.last_name as actor_name
        FROM activity_feed af
        JOIN users u ON af.actor_id = u.id
        WHERE af.client_id = ?
        ORDER BY af.created_at DESC
        LIMIT 8
      `).all(client.id) as any[];
    } catch (e) { console.warn('activity_feed table missing', e); }

    // ── STATUS SUMMARY ──
    const statusSummary = {
      total: compliances.length,
      active_projects: compliances.filter((c: any) => c.status !== 'completed').length,
      total_billed: invoices.reduce((s: number, inv: any) => s + (inv.total_amount || 0), 0),
      pending_actions: tasks.length + docRequests.filter((d: any) => d.uploaded_count === 0).length,
      overdue: compliances.filter((c: any) => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'completed').length,
      upcoming_due: compliances.filter((c: any) => {
        if (!c.due_date || c.status === 'completed') return false;
        const d = new Date(c.due_date);
        const now = new Date();
        const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      }).length,
      unread_messages: unreadChats.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0),
    };

    const enrichedCompliances = compliances.map((c: any) => ({
      ...c,
      client_status: mapClientStatus(c),
    }));

    // ── VAULT SUMMARY (for individual users) ──
    let vaultSummary: any = null;
    let consultantSummary: any[] = [];
    let upcomingDeadlines: any[] = [];
    
    try {
      // Personal vault items
      const vaultPersonal = db.prepare(`
        SELECT pci.*, pc.name as consultant_name
        FROM personal_compliance_items pci
        LEFT JOIN personal_consultants pc ON pci.assigned_consultant_id = pc.id
        WHERE pci.user_id = ?
      `).all(userId) as any[];

      const vaultFamily = db.prepare(`
        SELECT pfc.*, pfm.name as member_name
        FROM personal_family_compliance pfc
        JOIN personal_family_members pfm ON pfc.family_member_id = pfm.id
        WHERE pfc.user_id = ?
      `).all(userId) as any[];

      const vaultEntities = db.prepare(`
        SELECT pec.*, pe.name as entity_name
        FROM personal_entity_compliance pec 
        JOIN personal_entities pe ON pec.entity_id = pe.id
        WHERE pec.user_id = ?
      `).all(userId) as any[];

      const familyMembers = db.prepare(`SELECT * FROM personal_family_members WHERE user_id = ?`).all(userId) as any[];
      const entities = db.prepare(`SELECT * FROM personal_entities WHERE user_id = ?`).all(userId) as any[];

      const allVaultItems = [...vaultPersonal, ...vaultFamily, ...vaultEntities];
      const now2 = new Date();
      const in30 = new Date(now2.getTime() + 30 * 86400000);

      vaultSummary = {
        total_personal: vaultPersonal.length,
        total_family: vaultFamily.length,
        total_entity: vaultEntities.length,
        total_all: allVaultItems.length,
        active: allVaultItems.filter(i => i.status !== 'completed').length,
        completed: allVaultItems.filter(i => i.status === 'completed').length,
        overdue: allVaultItems.filter(i => i.urgency === 'red' && i.status !== 'completed').length,
        due_soon: allVaultItems.filter(i => {
          if (!i.due_date || i.status === 'completed') return false;
          const d = new Date(i.due_date);
          return d > now2 && d <= in30;
        }).length,
        family_count: familyMembers.length,
        entity_count: entities.length,
      };

      // Consultants summary
      consultantSummary = db.prepare(`
        SELECT pc.*, 
          (SELECT COUNT(*) FROM personal_consultant_assignments pca WHERE pca.consultant_id = pc.id) as total_assignments,
          (SELECT COUNT(*) FROM personal_consultant_assignments pca 
           JOIN personal_compliance_items pci ON pca.compliance_item_id = pci.id 
           WHERE pca.consultant_id = pc.id AND pci.status = 'completed') as completed_assignments
        FROM personal_consultants pc WHERE pc.user_id = ?
      `).all(userId) as any[];

      // Upcoming deadlines across ALL sources
      const deadlineItems: any[] = [];
      for (const item of vaultPersonal) {
        if (item.due_date && item.status !== 'completed') {
          deadlineItems.push({ title: item.title, due_date: item.due_date, source: 'personal', source_name: 'Personal', urgency: item.urgency, consultant_name: item.consultant_name, category: item.category });
        }
      }
      for (const item of vaultFamily) {
        if (item.due_date && item.status !== 'completed') {
          deadlineItems.push({ title: item.title, due_date: item.due_date, source: 'family', source_name: item.member_name, urgency: item.urgency, category: item.category });
        }
      }
      for (const item of vaultEntities) {
        if (item.due_date && item.status !== 'completed') {
          deadlineItems.push({ title: item.title, due_date: item.due_date, source: 'entity', source_name: item.entity_name, urgency: item.urgency, category: item.category });
        }
      }
      // Add firm compliances to deadlines
      for (const comp of compliances) {
        if (comp.due_date && comp.status !== 'completed') {
          deadlineItems.push({ title: comp.template_name, due_date: comp.due_date, source: 'firm', source_name: 'Taxccount (Firm)', urgency: comp.due_date && new Date(comp.due_date) < now2 ? 'red' : 'yellow', category: 'tax_filing' });
        }
      }
      deadlineItems.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      upcomingDeadlines = deadlineItems.slice(0, 10);
    } catch (e) { console.warn('vault summary error:', e); }

    return NextResponse.json({
      accessible_accounts: accessibleAccounts,
      client: {
        id: client.id,
        display_name: client.display_name,
        client_code: client.client_code,
        client_type: client.client_type,
        primary_email: client.primary_email,
        primary_phone: client.primary_phone,
        city: client.city,
        province: client.province,
        postal_code: client.postal_code,
        address_line_1: client.address_line_1,
        status: client.status,
        notes: client.notes,
      },
      compliances: enrichedCompliances,
      tasks,
      docRequests,
      unreadChats,
      billing,
      invoices,
      linkedEntities: linkedEntitiesEnriched,
      docSummary,
      contacts,
      personalInfo,
      tags,
      reminders,
      activity,
      statusSummary,
      vaultSummary,
      consultantSummary,
      upcomingDeadlines,
    });
  } catch (error) {
    console.error('Portal dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

