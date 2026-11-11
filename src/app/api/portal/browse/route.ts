// ══════════════════════════════════════════════════════════════════
// PORTAL BROWSE API — Main Intelligence Endpoints
// Handles: reference data, discovery, suggestions, date calculation,
// profile management, and compliance selection
//
// The person is ALWAYS the signed-in one (session.userId). A user id or
// firm id sent by the browser is ignored: this route once trusted
// `userId` from the query string and the body, so any signed-in user
// could read another person's profile and add items to their vault.
// ══════════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getAllMatchingCompliances, getDiscoveryQuestions, suggestCompliances } from '@/lib/compliance-suggestion-engine';
import { calculateComplianceDate, getRequiredBaseDates } from '@/lib/compliance-date-calculator';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session?.userId) return unauthorized();
    const userId = session.userId;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      // ── Reference Data ──────────────────────────────────────
      case 'countries':
        return NextResponse.json(await db.prepare('SELECT id, name, iso_code, financial_year_end_default, fy_is_fixed FROM sm_countries WHERE is_active=1 ORDER BY sort_order').all());

      case 'states': {
        const countryId = searchParams.get('countryId');
        if (!countryId) return NextResponse.json({ error: 'countryId required' }, { status: 400 });
        return NextResponse.json(await db.prepare('SELECT id, name, code FROM sm_states WHERE country_id=? AND is_active=1 ORDER BY sort_order').all(countryId));
      }

      case 'entity-types':
        return NextResponse.json(await db.prepare('SELECT id, name, description FROM sm_entity_types WHERE is_active=1 ORDER BY sort_order').all());

      case 'departments':
        return NextResponse.json(await db.prepare('SELECT id, name, description FROM sm_departments WHERE is_active=1 ORDER BY sort_order').all());

      // ── All matching compliances (for Step D) ───────────────
      case 'search': {
        const cId = searchParams.get('countryId');
        const sId = searchParams.get('stateId');
        const eId = searchParams.get('entityTypeId');
        if (!cId || !sId || !eId) return NextResponse.json({ error: 'countryId, stateId, entityTypeId required' }, { status: 400 });
        const results = await getAllMatchingCompliances({ countryId: cId, stateId: sId, entityTypeId: eId });
        return NextResponse.json(results);
      }

      // ── Discovery questions (for Step C "No" path) ──────────
      case 'discover': {
        const cId2 = searchParams.get('countryId');
        const sId2 = searchParams.get('stateId');
        const eId2 = searchParams.get('entityTypeId');
        if (!cId2 || !sId2 || !eId2) return NextResponse.json({ error: 'countryId, stateId, entityTypeId required' }, { status: 400 });

        // Get compulsory compliances
        const all = await getAllMatchingCompliances({ countryId: cId2, stateId: sId2, entityTypeId: eId2 });
        const compulsory = all.filter(c => c.is_compulsory);

        // Get questions
        const questions = await getDiscoveryQuestions({ countryId: cId2, stateId: sId2, entityTypeId: eId2 });

        return NextResponse.json({ compulsory, questions });
      }

      // ── Sub-compliance detail ───────────────────────────────
      case 'detail': {
        const scId = searchParams.get('id');
        if (!scId) return NextResponse.json({ error: 'id required' }, { status: 400 });
        const sc = await db.prepare(`SELECT sc.*, ch.name as compliance_head_name, ch.icon, ch.color_code
          FROM sm_sub_compliances sc JOIN sm_compliance_heads ch ON sc.compliance_head_id = ch.id WHERE sc.id = ?`).get(scId);
        if (!sc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const infoFields = await db.prepare('SELECT * FROM sm_info_fields WHERE sub_compliance_id=? AND is_active=1 ORDER BY sort_order').all(scId);
        const penalties = await db.prepare('SELECT * FROM sm_penalties WHERE sub_compliance_id=? AND is_active=1').all(scId);
        return NextResponse.json({ ...(sc as any), info_fields: infoFields, penalties });
      }

      // ── User's profile ──────────────────────────────────────
      case 'profile': {
        const profile = await db.prepare('SELECT * FROM user_compliance_profiles WHERE user_id=? AND status=? ORDER BY created_at DESC LIMIT 1').get(userId, 'active');
        return NextResponse.json(profile || null);
      }

      // ── User's past selections ──────────────────────────────
      case 'my-selections': {
        const selections = await db.prepare(`SELECT usc.*, sc.name, sc.brief, sc.period_type, ch.name as head_name, ch.icon
          FROM user_selected_compliances usc
          JOIN sm_sub_compliances sc ON usc.sub_compliance_id = sc.id
          JOIN sm_compliance_heads ch ON sc.compliance_head_id = ch.id
          WHERE usc.user_id = ? ORDER BY usc.created_at DESC`).all(userId);
        return NextResponse.json(selections);
      }

      default:
        return NextResponse.json({ error: 'Unknown action. Use: countries, states, entity-types, departments, search, discover, detail, profile, my-selections' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session?.userId) return unauthorized();
    const userId = session.userId;

    const db = getDb();
    const body = await req.json();
    const action = body.action;

    switch (action) {
      // ── Suggest compliances (Step C "No" → answer questions) ──
      case 'suggest': {
        const { countryId, stateId, entityTypeId, answers } = body;
        if (!countryId || !stateId || !entityTypeId) return NextResponse.json({ error: 'Missing profile fields' }, { status: 400 });
        const suggested = await suggestCompliances(
          { countryId, stateId, entityTypeId },
          answers || []
        );
        return NextResponse.json(suggested);
      }

      // ── Calculate dates (Step E) ──────────────────────────────
      case 'calculate-dates': {
        const { selectedCompliances, baseDates, countryId: cId } = body;
        if (!selectedCompliances || !baseDates) return NextResponse.json({ error: 'selectedCompliances and baseDates required' }, { status: 400 });

        // Get country info for FY defaults
        let countryFYDefault: string | undefined;
        let countryFYFixed = false;
        if (cId) {
          const country = await db.prepare('SELECT * FROM sm_countries WHERE id = ?').get(cId) as any;
          if (country) {
            countryFYDefault = country.financial_year_end_default || undefined;
            countryFYFixed = !!country.fy_is_fixed;
          }
        }

        const results = selectedCompliances.map((sc: any) => {
          if (!sc.has_compliance_date || sc.dependency_type === 'none') {
            return { ...sc, calculated: null };
          }

          const userDate = baseDates[sc.dependency_type] || '';
          if (!userDate && sc.dependency_type !== 'calendar_year_fixed') {
            return { ...sc, calculated: null, error: `Missing date for ${sc.dependency_label || sc.dependency_type}` };
          }

          const result = calculateComplianceDate({
            dependencyType: sc.dependency_type,
            userProvidedDate: userDate,
            countryFYDefault,
            countryFYFixed,
            periodType: sc.period_type || 'yearly',
            periodValue: sc.period_value || 1,
            graceValue: sc.grace_value || 0,
            graceUnit: sc.grace_unit || 'days',
          });

          return { ...sc, calculated: result };
        });

        // Also figure out which base dates are needed
        const requiredDates = getRequiredBaseDates(selectedCompliances);

        return NextResponse.json({ results, requiredDates });
      }

      // ── Save profile (Steps A-B) ──────────────────────────────
      case 'save-profile': {
        // `userId` in the body is dropped, never used: the profile is the signed-in person's.
        const { userId: _ignoredUserId, action: _action, ...profileData } = body;

        // Check for existing profile
        const existing = await db.prepare('SELECT id FROM user_compliance_profiles WHERE user_id=? AND status=?').get(userId, 'active') as any;

        if (existing) {
          const now = new Date().toISOString();
          await db.prepare(`UPDATE user_compliance_profiles SET country_id=?,state_id=?,entity_type_id=?,company_name=?,business_number=?,gst_number=?,payroll_number=?,directors=?,contact_person=?,address=?,financial_year_end_income_tax=?,incorporation_date_federal=?,incorporation_date_provincial=?,financial_year_end_gst=?,financial_year_end_payroll=?,additional_dates=?,discovery_method=?,updated_at=? WHERE id=? AND user_id=?`).run(
            profileData.country_id||null, profileData.state_id||null, profileData.entity_type_id||null,
            profileData.company_name||null, profileData.business_number||null, profileData.gst_number||null,
            profileData.payroll_number||null, profileData.directors ? JSON.stringify(profileData.directors) : null,
            profileData.contact_person||null, profileData.address||null,
            profileData.financial_year_end_income_tax||null, profileData.incorporation_date_federal||null,
            profileData.incorporation_date_provincial||null, profileData.financial_year_end_gst||null,
            profileData.financial_year_end_payroll||null, profileData.additional_dates ? JSON.stringify(profileData.additional_dates) : null,
            profileData.discovery_method||null, now, existing.id, userId
          );
          return NextResponse.json({ id: existing.id, updated: true });
        } else {
          const id = uuidv4();
          const now = new Date().toISOString();
          await db.prepare(`INSERT INTO user_compliance_profiles (id,user_id,country_id,state_id,entity_type_id,company_name,business_number,gst_number,payroll_number,directors,contact_person,address,financial_year_end_income_tax,incorporation_date_federal,incorporation_date_provincial,financial_year_end_gst,financial_year_end_payroll,additional_dates,discovery_method,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
            id, userId, profileData.country_id||null, profileData.state_id||null, profileData.entity_type_id||null,
            profileData.company_name||null, profileData.business_number||null, profileData.gst_number||null,
            profileData.payroll_number||null, profileData.directors ? JSON.stringify(profileData.directors) : null,
            profileData.contact_person||null, profileData.address||null,
            profileData.financial_year_end_income_tax||null, profileData.incorporation_date_federal||null,
            profileData.incorporation_date_provincial||null, profileData.financial_year_end_gst||null,
            profileData.financial_year_end_payroll||null, profileData.additional_dates ? JSON.stringify(profileData.additional_dates) : null,
            profileData.discovery_method||null, now, now
          );
          return NextResponse.json({ id, created: true });
        }
      }

      // ── Save answers (Step C) ──────────────────────────────────
      case 'save-answers': {
        const { profileId, answers: ans } = body;
        if (!profileId || !Array.isArray(ans)) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        // The profile must be the caller's own before anything on it is cleared or written.
        const ownProfile = await db.prepare('SELECT id FROM user_compliance_profiles WHERE id=? AND user_id=?').get(profileId, userId);
        if (!ownProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        const now = new Date().toISOString();
        await db.transaction(async (tx: any) => {
          // Clear old answers
          await tx.prepare('DELETE FROM user_question_answers WHERE profile_id = ? AND user_id = ?').run(profileId, userId);
          for (const a of ans) {
            await tx.prepare('INSERT INTO user_question_answers (id,user_id,profile_id,question_id,answer_text,created_at) VALUES (?,?,?,?,?,?)').run(
              uuidv4(), userId, profileId, a.questionId, a.answer ?? null, now
            );
          }
        })();
        return NextResponse.json({ saved: ans.length });
      }

      // ── Select compliances + add to vault (Step F) ─────────────
      case 'select': {
        // `userId` and `orgId` in the body are ignored: the vault items go to the signed-in person, in their firm.
        const { profileId: selProfileId, selectedCompliances: selected, confirmedDates } = body;
        if (!selProfileId || !Array.isArray(selected)) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        const ownProfile = await db.prepare('SELECT id FROM user_compliance_profiles WHERE id=? AND user_id=?').get(selProfileId, userId);
        if (!ownProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        const now = new Date().toISOString();
        const orgId = session.orgId || null;

        const createdItems: any[] = [];

        await db.transaction(async (tx: any) => {
          // Update profile undertaking
          await tx.prepare('UPDATE user_compliance_profiles SET undertaking_accepted=1, undertaking_accepted_at=? WHERE id=? AND user_id=?').run(now, selProfileId, userId);

          for (const comp of selected) {
            const uscId = uuidv4();
            const pciId = uuidv4();

            const confirmedDate = confirmedDates?.[comp.sub_compliance_id] || comp.calculated?.nextDueDate || null;
            const recurrenceType = comp.calculated?.recurrenceType || 'FREQ=YEARLY';
            const recurrenceLabel = comp.calculated?.recurrenceLabel || 'Yearly';

            // Determine urgency based on due date
            let urgency = 'green';
            if (confirmedDate) {
              const daysUntil = Math.ceil((new Date(confirmedDate).getTime() - Date.now()) / (1000*60*60*24));
              if (daysUntil <= 7) urgency = 'red';
              else if (daysUntil <= 30) urgency = 'yellow';
            }

            // Map compliance head to vault category
            const categoryMap: Record<string, string> = {
              'Corporate Tax': 'tax_filing', 'Indirect Tax': 'tax_filing',
              'Secretarial Compliances': 'documents_ids', 'Payroll': 'tax_filing',
              'Audit Report': 'financial', 'Advisory': 'custom', 'Litigation': 'custom',
            };
            const category = categoryMap[comp.compliance_head_name] || 'custom';

            // Create personal_compliance_items entry (vault item)
            await tx.prepare(`INSERT INTO personal_compliance_items (id,user_id,org_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,assigned_consultant_id,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
              pciId, userId, orgId,
              comp.name, category, comp.brief || comp.description || '',
              confirmedDate, recurrenceType, recurrenceLabel,
              'pending', urgency, null, `Source: Service Master | Method: ${comp.selectionMethod}`, null, now, now
            );

            // Create user_selected_compliances entry. The engine calls a hand-picked one 'available';
            // the column allows only compulsory / auto_suggested / manual.
            const selectionMethod = ['compulsory', 'auto_suggested'].includes(comp.selectionMethod) ? comp.selectionMethod : 'manual';
            await tx.prepare(`INSERT INTO user_selected_compliances (id,user_id,profile_id,sub_compliance_id,service_rule_id,selection_method,base_date,calculated_due_date,confirmed_due_date,recurrence_type,calculation_formula,status,personal_compliance_item_id,undertaking_accepted,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
              uscId, userId, selProfileId, comp.sub_compliance_id,
              comp.service_rule_id || null, selectionMethod,
              comp.base_date || null, comp.calculated?.nextDueDate || null, confirmedDate,
              recurrenceLabel, comp.calculated?.formulaExplanation || null,
              'active', pciId, 1, null, now, now
            );

            createdItems.push({ uscId, pciId, name: comp.name, dueDate: confirmedDate });
          }
        })();

        return NextResponse.json({ success: true, created: createdItems.length, items: createdItems });
      }

      default:
        return NextResponse.json({ error: 'Unknown action. Use: suggest, calculate-dates, save-profile, save-answers, select' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
