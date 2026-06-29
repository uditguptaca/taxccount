import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { addDays, addWeeks, addMonths, startOfWeek, endOfWeek, format } from 'date-fns';

export async function POST(request: Request, { params }: { params: { clientId: string, groupId: string } }) {
  try {
    const db = getDb();
    const body = await request.json();
    const { year, firstPeriodStart, firstPayDate } = body;
    
    // Get the pay group
    const groupSql = `SELECT * FROM pay_group WHERE id = ? AND client_id = ? LIMIT 1`;
    const group = await db.prepare(groupSql).get(params.groupId, params.clientId);
    
    if (!group) {
      return NextResponse.json({ error: 'Pay group not found' }, { status: 404 });
    }

    const orgId = group.org_id;
    const periods = [];
    let currentStart = new Date(firstPeriodStart);
    let currentPayDate = new Date(firstPayDate);
    
    const count = group.frequency === 'Weekly' ? 52 :
                  group.frequency === 'Bi-weekly' ? 26 :
                  group.frequency === 'Semi-monthly' ? 24 : 12;

    for (let i = 0; i < count; i++) {
      let currentEnd;
      if (group.frequency === 'Weekly') {
        currentEnd = addDays(currentStart, 6);
      } else if (group.frequency === 'Bi-weekly') {
        currentEnd = addDays(currentStart, 13);
      } else if (group.frequency === 'Monthly') {
        // approximate for simplicity
        currentEnd = addDays(addMonths(currentStart, 1), -1);
      } else { // Semi-monthly
        currentEnd = addDays(currentStart, 14);
      }

      // Processing cutoff: say, 2 days before pay date
      const processingCutoff = new Date(currentPayDate);
      processingCutoff.setDate(processingCutoff.getDate() - 2);

      periods.push({
        org_id: orgId,
        client_id: params.clientId,
        pay_group_id: params.groupId,
        period_start: format(currentStart, 'yyyy-MM-dd'),
        period_end: format(currentEnd, 'yyyy-MM-dd'),
        pay_date: format(currentPayDate, 'yyyy-MM-dd'),
        processing_cutoff: format(processingCutoff, 'yyyy-MM-dd HH:mm:ss'),
        status: 'OPEN'
      });

      // advance to next period
      if (group.frequency === 'Weekly') {
        currentStart = addWeeks(currentStart, 1);
        currentPayDate = addWeeks(currentPayDate, 1);
      } else if (group.frequency === 'Bi-weekly') {
        currentStart = addWeeks(currentStart, 2);
        currentPayDate = addWeeks(currentPayDate, 2);
      } else if (group.frequency === 'Monthly') {
        currentStart = addMonths(currentStart, 1);
        currentPayDate = addMonths(currentPayDate, 1);
      } else {
        currentStart = addDays(currentStart, 15);
        currentPayDate = addDays(currentPayDate, 15);
      }
    }

    // Clear existing open periods for this year (simplified)
    await db.prepare(`DELETE FROM pay_schedule WHERE pay_group_id = ? AND status = 'OPEN'`).run(params.groupId);

    // Insert new periods
    const insertSql = `
      INSERT INTO pay_schedule (org_id, client_id, pay_group_id, period_start, period_end, pay_date, processing_cutoff, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const stmt = db.prepare(insertSql);
    for (const p of periods) {
      await stmt.run(p.org_id, p.client_id, p.pay_group_id, p.period_start, p.period_end, p.pay_date, p.processing_cutoff, p.status);
    }
    
    return NextResponse.json({ success: true, generatedPeriods: periods.length });
  } catch (error: any) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
