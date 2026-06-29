import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { companyId: string, slug: string[] } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orgId, userId, role } = session;
    const { companyId, slug } = params;
    const subRoute = slug[0];

    const db = getDb();

    // Enforce Tenant Isolation: Check if this client belongs to the user's organization
    const client = await db.prepare('SELECT id, display_name, state_province, client_type FROM clients WHERE id = ? AND org_id = ?').get(companyId, orgId);
    if (!client) {
      return NextResponse.json({ error: 'Company not found or access denied' }, { status: 403 });
    }

    if (subRoute === 'corporation') {
      let corp = await db.prepare('SELECT * FROM cs_corporations WHERE id = ? AND org_id = ?').get(companyId, orgId);
      if (!corp) {
        // Auto-create a default corporation record if it doesn't exist
        const corpId = companyId;
        await db.prepare(`
          INSERT INTO cs_corporations (id, org_id, legal_name, jurisdiction, status, corp_type, registered_office, records_office, fiscal_year_end, language)
          VALUES (?, ?, ?, 'Federal (CBCA)', 'active', 'named', '123 Business Bay, Toronto, ON', '123 Business Bay, Toronto, ON', '12-31', 'en')
        `).run(corpId, orgId, client.display_name);
        corp = await db.prepare('SELECT * FROM cs_corporations WHERE id = ? AND org_id = ?').get(companyId, orgId);
      }
      return NextResponse.json({ corporation: corp });
    }

    if (subRoute === 'minute-book') {
      const resolutions = await db.prepare('SELECT * FROM cs_resolutions WHERE company_id = ? AND org_id = ? ORDER BY effective_date DESC').all(companyId, orgId);
      const filings = await db.prepare('SELECT * FROM cs_filings WHERE company_id = ? AND org_id = ? ORDER BY due_date DESC').all(companyId, orgId);
      const generatedDocs = await db.prepare('SELECT * FROM cs_generated_documents WHERE company_id = ? AND org_id = ? ORDER BY created_at DESC').all(companyId, orgId);
      const issuances = await db.prepare('SELECT * FROM cs_share_issuances WHERE company_id = ? AND org_id = ? AND certificate_number IS NOT NULL').all(companyId, orgId);

      return NextResponse.json({
        resolutions,
        filings,
        generatedDocuments: generatedDocs,
        shareCertificates: issuances
      });
    }

    if (subRoute === 'registers') {
      const type = slug[1];
      if (type === 'directors') {
        const directors = await db.prepare(`
          SELECT d.*, p.name, p.email, p.address, p.date_of_birth
          FROM cs_directors d
          JOIN cs_persons p ON p.id = d.person_id
          WHERE d.company_id = ? AND d.org_id = ?
        `).all(companyId, orgId);
        return NextResponse.json({ directors });
      }

      if (type === 'officers') {
        const officers = await db.prepare(`
          SELECT o.*, p.name, p.email, p.address
          FROM cs_officers o
          JOIN cs_persons p ON p.id = o.person_id
          WHERE o.company_id = ? AND o.org_id = ?
        `).all(companyId, orgId);
        return NextResponse.json({ officers });
      }

      if (type === 'securities') {
        const issuances = await db.prepare(`
          SELECT i.id, 'issuance' as tx_type, p.name as holder_name, c.name as class_name, i.quantity, i.price_per_share, i.issue_date as tx_date, i.certificate_number
          FROM cs_share_issuances i
          JOIN cs_persons p ON p.id = i.holder_id
          JOIN cs_share_classes c ON c.id = i.share_class_id
          WHERE i.company_id = ? AND i.org_id = ?
        `).all(companyId, orgId);

        const transfers = await db.prepare(`
          SELECT t.id, 'transfer' as tx_type, p1.name as transferor_name, p2.name as transferee_name, c.name as class_name, t.quantity, t.price_per_share, t.transfer_date as tx_date
          FROM cs_share_transfers t
          JOIN cs_persons p1 ON p1.id = t.transferor_id
          JOIN cs_persons p2 ON p2.id = t.transferee_id
          JOIN cs_share_classes c ON c.id = t.share_class_id
          WHERE t.company_id = ? AND t.org_id = ?
        `).all(companyId, orgId);

        const repurchases = await db.prepare(`
          SELECT r.id, 'repurchase' as tx_type, p.name as holder_name, c.name as class_name, r.quantity, r.price_per_share, r.repurchase_date as tx_date
          FROM cs_share_repurchases r
          JOIN cs_persons p ON p.id = r.holder_id
          JOIN cs_share_classes c ON c.id = r.share_class_id
          WHERE r.company_id = ? AND r.org_id = ?
        `).all(companyId, orgId);

        const allTransactions = [...issuances, ...transfers, ...repurchases].sort((a: any, b: any) => b.tx_date.localeCompare(a.tx_date));
        return NextResponse.json({ transactions: allTransactions });
      }

      if (type === 'shareholders') {
        const issuances = await db.prepare('SELECT * FROM cs_share_issuances WHERE company_id = ? AND org_id = ?').all(companyId, orgId) as any[];
        const transfers = await db.prepare('SELECT * FROM cs_share_transfers WHERE company_id = ? AND org_id = ?').all(companyId, orgId) as any[];
        const repurchases = await db.prepare('SELECT * FROM cs_share_repurchases WHERE company_id = ? AND org_id = ?').all(companyId, orgId) as any[];
        const persons = await db.prepare('SELECT * FROM cs_persons WHERE org_id = ?').all(orgId) as any[];

        const personMap = new Map(persons.map(p => [p.id, p]));
        const holdings: Record<string, { personId: string, name: string, classHoldings: Record<string, number> }> = {};

        issuances.forEach(i => {
          if (!holdings[i.holder_id]) {
            holdings[i.holder_id] = { personId: i.holder_id, name: personMap.get(i.holder_id)?.name || 'Unknown', classHoldings: {} };
          }
          holdings[i.holder_id].classHoldings[i.share_class_id] = (holdings[i.holder_id].classHoldings[i.share_class_id] || 0) + Number(i.quantity);
        });

        transfers.forEach(t => {
          if (holdings[t.transferor_id]) {
            holdings[t.transferor_id].classHoldings[t.share_class_id] = (holdings[t.transferor_id].classHoldings[t.share_class_id] || 0) - Number(t.quantity);
          }
          if (!holdings[t.transferee_id]) {
            holdings[t.transferee_id] = { personId: t.transferee_id, name: personMap.get(t.transferee_id)?.name || 'Unknown', classHoldings: {} };
          }
          holdings[t.transferee_id].classHoldings[t.share_class_id] = (holdings[t.transferee_id].classHoldings[t.share_class_id] || 0) + Number(t.quantity);
        });

        repurchases.forEach(r => {
          if (holdings[r.holder_id]) {
            holdings[r.holder_id].classHoldings[r.share_class_id] = (holdings[r.holder_id].classHoldings[r.share_class_id] || 0) - Number(r.quantity);
          }
        });

        const shareholders = Object.values(holdings).filter(h => {
          return Object.values(h.classHoldings).some(qty => qty > 0);
        });

        return NextResponse.json({ shareholders });
      }

      if (type === 'isc') {
        const isc = await db.prepare(`
          SELECT entry.*, p.name, p.email, p.address, p.date_of_birth
          FROM cs_isc_register_entries entry
          JOIN cs_persons p ON p.id = entry.person_id
          WHERE entry.company_id = ? AND entry.org_id = ?
        `).all(companyId, orgId);
        return NextResponse.json({ isc });
      }
    }

    if (subRoute === 'equity') {
      const action = slug[1];
      if (action === 'cap-table') {
        const shareClasses = await db.prepare('SELECT * FROM cs_share_classes WHERE company_id = ? AND org_id = ?').all(companyId, orgId) as any[];
        const issuances = await db.prepare('SELECT * FROM cs_share_issuances WHERE company_id = ? AND org_id = ?').all(companyId, orgId) as any[];
        const transfers = await db.prepare('SELECT * FROM cs_share_transfers WHERE company_id = ? AND org_id = ?').all(companyId, orgId) as any[];
        const repurchases = await db.prepare('SELECT * FROM cs_share_repurchases WHERE company_id = ? AND org_id = ?').all(companyId, orgId) as any[];
        const convertibles = await db.prepare(`
          SELECT con.*, p.name as holder_name
          FROM cs_convertibles con
          JOIN cs_persons p ON p.id = con.holder_id
          WHERE con.company_id = ? AND con.org_id = ?
        `).all(companyId, orgId);
        
        const optionPlans = await db.prepare('SELECT * FROM cs_option_plans WHERE company_id = ? AND org_id = ?').all(companyId, orgId);
        const optionGrants = await db.prepare(`
          SELECT og.*, p.name as grantee_name
          FROM cs_option_grants og
          JOIN cs_persons p ON p.id = og.grantee_id
          WHERE og.company_id = ? AND og.org_id = ?
        `).all(companyId, orgId);

        const persons = await db.prepare('SELECT * FROM cs_persons WHERE org_id = ?').all(orgId) as any[];
        const personMap = new Map(persons.map(p => [p.id, p]));

        // Calculate current holdings by class
        const holdingsMap: Record<string, Record<string, number>> = {};
        issuances.forEach(i => {
          if (!holdingsMap[i.holder_id]) holdingsMap[i.holder_id] = {};
          holdingsMap[i.holder_id][i.share_class_id] = (holdingsMap[i.holder_id][i.share_class_id] || 0) + Number(i.quantity);
        });

        transfers.forEach(t => {
          if (holdingsMap[t.transferor_id]) {
            holdingsMap[t.transferor_id][t.share_class_id] = (holdingsMap[t.transferor_id][t.share_class_id] || 0) - Number(t.quantity);
          }
          if (!holdingsMap[t.transferee_id]) holdingsMap[t.transferee_id] = {};
          holdingsMap[t.transferee_id][t.share_class_id] = (holdingsMap[t.transferee_id][t.share_class_id] || 0) + Number(t.quantity);
        });

        repurchases.forEach(r => {
          if (holdingsMap[r.holder_id]) {
            holdingsMap[r.holder_id][r.share_class_id] = (holdingsMap[r.holder_id][r.share_class_id] || 0) - Number(r.quantity);
          }
        });

        // Compute total issued shares per class
        const classTotals: Record<string, number> = {};
        const capTable: any[] = [];

        Object.keys(holdingsMap).forEach(holderId => {
          const classes = holdingsMap[holderId];
          const hasShares = Object.values(classes).some(qty => qty > 0);
          if (hasShares) {
            const holderName = personMap.get(holderId)?.name || 'Unknown';
            const record: any = { holderId, name: holderName, classHoldings: {} };
            Object.keys(classes).forEach(classId => {
              const qty = classes[classId];
              if (qty > 0) {
                record.classHoldings[classId] = qty;
                classTotals[classId] = (classTotals[classId] || 0) + qty;
              }
            });
            capTable.push(record);
          }
        });

        const shareClassesWithTotals = shareClasses.map(sc => ({
          ...sc,
          issued_count: classTotals[sc.id] || 0
        }));

        return NextResponse.json({
          capTable,
          shareClasses: shareClassesWithTotals,
          convertibles,
          optionPlans,
          optionGrants
        });
      }
    }

    if (subRoute === 'changes') {
      const changes = await db.prepare('SELECT * FROM cs_corporate_changes WHERE company_id = ? AND org_id = ? ORDER BY created_at DESC').all(companyId, orgId);
      return NextResponse.json({ changes });
    }

    if (subRoute === 'compliance') {
      const tasks = await db.prepare('SELECT * FROM cs_compliance_tasks WHERE company_id = ? AND org_id = ? ORDER BY due_date ASC').all(companyId, orgId);
      return NextResponse.json({ tasks });
    }

    if (subRoute === 'documents') {
      const docs = await db.prepare('SELECT * FROM cs_generated_documents WHERE company_id = ? AND org_id = ? ORDER BY created_at DESC').all(companyId, orgId);
      return NextResponse.json({ documents: docs });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    console.error('[CorpSec Catch-All GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { companyId: string, slug: string[] } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orgId, userId } = session;
    const { companyId, slug } = params;
    const subRoute = slug[0];

    const db = getDb();

    // Tenant Check
    const client = await db.prepare('SELECT id, display_name FROM clients WHERE id = ? AND org_id = ?').get(companyId, orgId);
    if (!client) {
      return NextResponse.json({ error: 'Company not found or access denied' }, { status: 403 });
    }

    const body = await request.json();

    if (subRoute === 'changes') {
      const changeType = slug[1];
      const changeId = uuidv4();
      const payloadStr = JSON.stringify(body);

      // Create a pending change
      await db.prepare(`
        INSERT INTO cs_corporate_changes (id, org_id, company_id, change_type, status, payload_json, progress_pct, signers_json)
        VALUES (?, ?, ?, ?, 'draft', ?::jsonb, 0, ?::jsonb)
      `).run(
        changeId, orgId, companyId, changeType, payloadStr, 
        JSON.stringify([
          { name: 'Jane Thompson', email: 'jane.thompson@example.com', role: 'Director', status: 'pending' }
        ])
      );

      // Log Event
      const eventId = uuidv4();
      await db.prepare(`
        INSERT INTO cs_corporate_events (id, org_id, company_id, event_type, effective_date, payload_json, created_by)
        VALUES (?, ?, ?, ?, ?, ?::jsonb, ?)
      `).run(eventId, orgId, companyId, changeType.toUpperCase().replace('-', '_'), new Date().toISOString().split('T')[0], payloadStr, userId);

      // Depending on the change, insert record or trigger action
      if (changeType === 'director-appoint') {
        const personId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_persons (id, org_id, name, email, address, is_entity)
          VALUES (?, ?, ?, ?, ?, 0)
        `).run(personId, orgId, body.name, body.email || '', body.address || '');

        const directorId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_directors (id, org_id, company_id, person_id, appointed_date, is_resident_canadian)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(directorId, orgId, companyId, personId, body.appointed_date, body.is_resident_canadian ? 1 : 0);

        // Auto-generate Consent Document
        const docId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_generated_documents (id, org_id, company_id, name, answers_json, status, minute_book_section)
          VALUES (?, ?, ?, ?, ?, 'draft', 'Directors & Officers')
        `).run(docId, orgId, companyId, `Consent to Act as Director - ${body.name}`, JSON.stringify(body));
      }

      if (changeType === 'director-remove' || changeType === 'director-cease') {
        const ceasedDate = body.ceased_date || new Date().toISOString().split('T')[0];
        await db.prepare(`
          UPDATE cs_directors
          SET ceased_date = ?
          WHERE company_id = ? AND person_id = ? AND ceased_date IS NULL
        `).run(ceasedDate, companyId, body.person_id);
      }

      if (changeType === 'officer-appoint') {
        const personId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_persons (id, org_id, name, email, address, is_entity)
          VALUES (?, ?, ?, ?, ?, 0)
        `).run(personId, orgId, body.name, body.email || '', body.address || '');

        const officerId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_officers (id, org_id, company_id, person_id, title, appointed_date)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(officerId, orgId, companyId, personId, body.title, body.appointed_date);
      }

      if (changeType === 'officer-remove' || changeType === 'officer-cease') {
        const ceasedDate = body.ceased_date || new Date().toISOString().split('T')[0];
        await db.prepare(`
          UPDATE cs_officers
          SET ceased_date = ?
          WHERE company_id = ? AND id = ? AND ceased_date IS NULL
        `).run(ceasedDate, companyId, body.officer_id);
      }

      if (changeType === 'share-issuance') {
        let holderId = body.holder_id;
        if (!holderId && body.name) {
          holderId = uuidv4();
          await db.prepare(`
            INSERT INTO cs_persons (id, org_id, name, email, address, is_entity)
            VALUES (?, ?, ?, ?, ?, 0)
          `).run(holderId, orgId, body.name, body.email || '', body.address || '');
        }

        const issuanceId = uuidv4();
        const certNo = `TX-A-${Math.floor(100 + Math.random() * 900)}`;
        await db.prepare(`
          INSERT INTO cs_share_issuances (id, org_id, company_id, holder_id, share_class_id, quantity, price_per_share, consideration, issue_date, certificate_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(issuanceId, orgId, companyId, holderId, body.share_class_id, body.quantity, body.price_per_share, body.consideration || 'Cash', body.issue_date, certNo);
      }

      if (changeType === 'share-transfer') {
        const transferId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_share_transfers (id, org_id, company_id, transferor_id, transferee_id, share_class_id, quantity, price_per_share, consideration, transfer_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(transferId, orgId, companyId, body.transferor_id, body.transferee_id, body.share_class_id, body.quantity, body.price_per_share, body.consideration || 'Cash', body.transfer_date);
      }

      if (changeType === 'share-repurchase') {
        const repurchaseId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_share_repurchases (id, org_id, company_id, holder_id, share_class_id, quantity, price_per_share, repurchase_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(repurchaseId, orgId, companyId, body.holder_id, body.share_class_id, body.quantity, body.price_per_share, body.repurchase_date);
      }

      if (changeType === 'share-split') {
        const multiplier = Number(body.multiplier || 2);
        const classId = body.share_class_id;

        await db.prepare(`
          UPDATE cs_share_issuances
          SET quantity = quantity * ?, price_per_share = price_per_share / ?
          WHERE company_id = ? AND share_class_id = ?
        `).run(multiplier, multiplier, companyId, classId);

        await db.prepare(`
          UPDATE cs_share_transfers
          SET quantity = quantity * ?, price_per_share = price_per_share / ?
          WHERE company_id = ? AND share_class_id = ?
        `).run(multiplier, multiplier, companyId, classId);

        await db.prepare(`
          UPDATE cs_option_grants
          SET quantity = quantity * ?, exercise_price = exercise_price / ?
          WHERE company_id = ? AND option_plan_id IN (SELECT id FROM cs_option_plans WHERE share_class_id = ?)
        `).run(multiplier, multiplier, companyId, classId);
      }

      if (changeType === 'safe-issue') {
        const safeId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_convertibles (id, org_id, company_id, holder_id, convertible_type, principal, valuation_cap, discount_rate, status)
          VALUES (?, ?, ?, ?, 'SAFE', ?, ?, ?, 'outstanding')
        `).run(safeId, orgId, companyId, body.holder_id, body.principal, body.valuation_cap, body.discount_rate);
      }

      if (changeType === 'option-grant') {
        const grantId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_option_grants (id, org_id, company_id, option_plan_id, grantee_id, quantity, exercise_price, grant_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'granted')
        `).run(grantId, orgId, companyId, body.option_plan_id, body.grantee_id, body.quantity, body.exercise_price, body.grant_date);
      }

      if (changeType === 'option-exercise') {
        const exerciseId = uuidv4();
        await db.prepare(`
          INSERT INTO cs_option_exercises (id, org_id, company_id, option_grant_id, quantity, exercise_date, amount_paid)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(exerciseId, orgId, companyId, body.option_grant_id, body.quantity, body.exercise_date, body.amount_paid);

        const grant = await db.prepare('SELECT grantee_id, option_plan_id FROM cs_option_grants WHERE id = ?').get(body.option_grant_id) as any;
        const plan = await db.prepare('SELECT share_class_id FROM cs_option_plans WHERE id = ?').get(grant.option_plan_id) as any;
        const issuanceId = uuidv4();
        const certNo = `TX-A-EX-${Math.floor(100 + Math.random() * 900)}`;
        
        await db.prepare(`
          INSERT INTO cs_share_issuances (id, org_id, company_id, holder_id, share_class_id, quantity, price_per_share, consideration, issue_date, certificate_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'Option Exercise', ?, ?)
        `).run(issuanceId, orgId, companyId, grant.grantee_id, plan.share_class_id, body.quantity, body.exercise_price || 0.00, body.exercise_date, certNo);
      }

      if (changeType === 'registered-address') {
        await db.prepare('UPDATE cs_corporations SET registered_office = ?, records_office = ?, updated_at = NOW() WHERE id = ? AND org_id = ?')
          .run(body.address, body.address, companyId, orgId);
      }

      if (changeType === 'name-change') {
        await db.prepare('UPDATE cs_corporations SET legal_name = ?, updated_at = NOW() WHERE id = ? AND org_id = ?')
          .run(body.new_name, companyId, orgId);
      }

      await logActivity({
        orgId,
        actorId: userId,
        action: 'corpsec_change',
        entityType: 'corporate_change',
        entityId: changeId,
        entityName: changeType,
        clientId: companyId,
        details: `Corporate change ${changeType} initialized.`
      });

      return NextResponse.json({ success: true, changeId });
    }

    if (subRoute === 'documents') {
      const docId = uuidv4();
      await db.prepare(`
        INSERT INTO cs_generated_documents (id, org_id, company_id, template_id, name, answers_json, language, status, minute_book_section)
        VALUES (?, ?, ?, ?, ?, ?::jsonb, ?, 'draft', ?)
      `).run(docId, orgId, companyId, body.template_id || null, body.name, JSON.stringify(body.answers || {}), body.language || 'en', body.minute_book_section || 'Other/Uploaded');

      return NextResponse.json({ success: true, documentId: docId });
    }

    if (subRoute === 'import') {
      // Import opening state
      const corpId = companyId;
      await db.prepare(`
        INSERT INTO cs_corporations (id, org_id, legal_name, jurisdiction, incorporation_number, business_number, incorporation_date, status, corp_type, registered_office, records_office)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'named', ?, ?)
        ON CONFLICT (id) DO UPDATE SET legal_name = EXCLUDED.legal_name, jurisdiction = EXCLUDED.jurisdiction
      `).run(corpId, orgId, body.legal_name, body.jurisdiction, body.incorporation_number || '', body.business_number || '', body.incorporation_date || '', body.registered_office || '', body.records_office || '');

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    console.error('[CorpSec Catch-All POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
