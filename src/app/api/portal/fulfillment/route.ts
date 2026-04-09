import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

// GET /api/portal/fulfillment?compliance_item_id=<id>
// Returns info fields for the linked sub-compliance, plus any existing submission
export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const complianceItemId = searchParams.get('compliance_item_id');

    if (!complianceItemId) {
      return NextResponse.json({ error: 'compliance_item_id is required' }, { status: 400 });
    }

    // 1. Verify the vault item belongs to this user
    const vaultItem = db.prepare(
      `SELECT * FROM personal_compliance_items WHERE id = ? AND user_id = ?`
    ).get(complianceItemId, userId) as any;

    if (!vaultItem) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    // 2. Find the user_selected_compliances link for this vault item
    const selectedCompliance = db.prepare(
      `SELECT usc.*, sc.name as sub_compliance_name, sc.brief, sc.undertaking_required, sc.undertaking_text,
              ch.name as compliance_head_name, ch.color_code as head_color
       FROM user_selected_compliances usc
       JOIN sm_sub_compliances sc ON usc.sub_compliance_id = sc.id
       LEFT JOIN sm_compliance_heads ch ON sc.compliance_head_id = ch.id
       WHERE usc.personal_compliance_item_id = ? AND usc.user_id = ?
       LIMIT 1`
    ).get(complianceItemId, userId) as any;

    if (!selectedCompliance) {
      // Vault item is a manual/custom item with no Service Master link
      return NextResponse.json({
        complianceItem: vaultItem,
        selectedCompliance: null,
        infoFields: [],
        existingSubmission: null,
        submissionData: [],
        message: 'This item is not linked to a Service Master compliance. No fulfillment fields available.'
      });
    }

    // 3. Fetch the info fields defined by admin for this sub-compliance
    const infoFields = db.prepare(
      `SELECT * FROM sm_info_fields 
       WHERE sub_compliance_id = ? AND is_active = 1 
       ORDER BY sort_order ASC`
    ).all(selectedCompliance.sub_compliance_id) as any[];

    // 4. Check for existing submission
    const existingSubmission = db.prepare(
      `SELECT * FROM user_compliance_submissions 
       WHERE compliance_item_id = ? AND user_id = ?
       ORDER BY submitted_at DESC LIMIT 1`
    ).get(complianceItemId, userId) as any;

    let submissionData: any[] = [];
    if (existingSubmission) {
      submissionData = db.prepare(
        `SELECT usd.*, sif.field_label, sif.field_type
         FROM user_submission_data usd
         JOIN sm_info_fields sif ON usd.info_field_id = sif.id
         WHERE usd.submission_id = ?
         ORDER BY sif.sort_order ASC`
      ).all(existingSubmission.id) as any[];
    }

    // 5. Fetch penalties if any are logged for this item
    const penalties = db.prepare(
      `SELECT * FROM compliance_penalties_log 
       WHERE compliance_item_id = ? AND user_id = ?
       ORDER BY last_calculated_at DESC`
    ).all(complianceItemId, userId) as any[];

    return NextResponse.json({
      complianceItem: vaultItem,
      selectedCompliance: {
        id: selectedCompliance.id,
        subComplianceName: selectedCompliance.sub_compliance_name,
        brief: selectedCompliance.brief,
        undertakingRequired: !!selectedCompliance.undertaking_required,
        undertakingText: selectedCompliance.undertaking_text,
        headName: selectedCompliance.compliance_head_name,
        headColor: selectedCompliance.head_color,
        selectionMethod: selectedCompliance.selection_method,
        calculatedDueDate: selectedCompliance.calculated_due_date,
      },
      infoFields: infoFields.map((f: any) => ({
        id: f.id,
        label: f.field_label,
        type: f.field_type,
        isRequired: !!f.is_required,
        placeholder: f.placeholder,
        helpText: f.help_text,
        options: f.options ? JSON.parse(f.options) : null,
      })),
      existingSubmission: existingSubmission ? {
        id: existingSubmission.id,
        status: existingSubmission.status,
        submittedAt: existingSubmission.submitted_at,
        reviewerNotes: existingSubmission.reviewer_notes,
      } : null,
      submissionData: submissionData.map((d: any) => ({
        infoFieldId: d.info_field_id,
        fieldLabel: d.field_label,
        fieldType: d.field_type,
        valueText: d.value_text,
        valueFileUrl: d.value_file_url,
        valueFileName: d.value_file_name,
      })),
      penalties: penalties.map((p: any) => ({
        id: p.id,
        description: p.penalty_description,
        type: p.penalty_type,
        daysLate: p.days_late,
        amount: p.calculated_amount,
        calculatedAt: p.last_calculated_at,
      })),
    });
  } catch (error) {
    console.error('Fulfillment GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/portal/fulfillment — Submit fulfillment data
export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId } = session;

    const db = getDb();
    const body = await request.json();
    const { compliance_item_id, field_responses, undertaking_accepted } = body;

    if (!compliance_item_id) {
      return NextResponse.json({ error: 'compliance_item_id is required' }, { status: 400 });
    }

    // 1. Verify vault item
    const vaultItem = db.prepare(
      `SELECT * FROM personal_compliance_items WHERE id = ? AND user_id = ?`
    ).get(compliance_item_id, userId) as any;

    if (!vaultItem) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    // 2. Find the selected compliance link
    const selectedCompliance = db.prepare(
      `SELECT usc.*, sc.undertaking_required
       FROM user_selected_compliances usc
       JOIN sm_sub_compliances sc ON usc.sub_compliance_id = sc.id
       WHERE usc.personal_compliance_item_id = ? AND usc.user_id = ?
       LIMIT 1`
    ).get(compliance_item_id, userId) as any;

    if (!selectedCompliance) {
      return NextResponse.json({ error: 'No Service Master compliance linked' }, { status: 400 });
    }

    // 3. Validate undertaking if required
    if (selectedCompliance.undertaking_required && !undertaking_accepted) {
      return NextResponse.json({ error: 'Undertaking acceptance is required' }, { status: 400 });
    }

    // 4. Create submission record
    const submissionId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO user_compliance_submissions (id, user_id, compliance_item_id, selected_compliance_id, status, submitted_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending_review', ?, ?, ?)
    `).run(submissionId, userId, compliance_item_id, selectedCompliance.id, now, now, now);

    // 5. Insert field response data
    if (field_responses && Array.isArray(field_responses)) {
      const insertData = db.prepare(`
        INSERT INTO user_submission_data (id, submission_id, info_field_id, value_text, value_file_url, value_file_name, value_file_size, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const resp of field_responses) {
        const dataId = uuidv4();
        insertData.run(
          dataId,
          submissionId,
          resp.info_field_id,
          resp.value_text || null,
          resp.value_file_base64 || null, // Storing base64 as the "url" for demo
          resp.value_file_name || null,
          resp.value_file_size || null,
          now,
          now
        );
      }
    }

    // 6. Update vault item status to in_progress
    db.prepare(`
      UPDATE personal_compliance_items 
      SET status = 'in_progress', updated_at = ? 
      WHERE id = ? AND user_id = ? AND status != 'completed'
    `).run(now, compliance_item_id, userId);

    // 7. Update the undertaking on the selected compliance
    if (undertaking_accepted) {
      db.prepare(`
        UPDATE user_selected_compliances SET undertaking_accepted = 1, updated_at = ? WHERE id = ?
      `).run(now, selectedCompliance.id);
    }

    return NextResponse.json({
      submissionId,
      message: 'Fulfillment submitted successfully. Your submission is pending review.',
      status: 'pending_review',
    });
  } catch (error) {
    console.error('Fulfillment POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
