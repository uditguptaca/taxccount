import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET /api/cron/penalty-monitor — Daily cron to calculate and log overdue penalties
export async function GET(request: Request) {
  try {
    // Optional: Verify cron secret for Vercel Cron Jobs
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow localhost bypass for development
      const url = new URL(request.url);
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const db = getDb();
    const now = new Date().toISOString();
    let processed = 0;
    let penaltiesCreated = 0;
    let itemsEscalated = 0;

    // 1. Find all overdue personal compliance items
    const overdueItems = db.prepare(`
      SELECT pci.id, pci.user_id, pci.due_date, pci.status, pci.title, pci.urgency
      FROM personal_compliance_items pci
      WHERE pci.due_date < datetime('now')
        AND pci.status NOT IN ('completed')
      ORDER BY pci.due_date ASC
    `).all() as any[];

    for (const item of overdueItems) {
      processed++;
      const dueDate = new Date(item.due_date);
      const daysLate = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLate <= 0) continue;

      // 2. Escalate urgency to red if not already
      if (item.urgency !== 'red') {
        db.prepare(`
          UPDATE personal_compliance_items 
          SET urgency = 'red', status = 'overdue', updated_at = ? 
          WHERE id = ?
        `).run(now, item.id);
        itemsEscalated++;
      }

      // 3. Find linked sub-compliance via user_selected_compliances
      const selectedComp = db.prepare(`
        SELECT usc.sub_compliance_id
        FROM user_selected_compliances usc
        WHERE usc.personal_compliance_item_id = ? AND usc.user_id = ?
        LIMIT 1
      `).get(item.id, item.user_id) as any;

      if (!selectedComp) continue;

      // 4. Find applicable penalties for this sub-compliance
      const penalties = db.prepare(`
        SELECT * FROM sm_penalties
        WHERE sub_compliance_id = ? AND is_active = 1
      `).all(selectedComp.sub_compliance_id) as any[];

      for (const penalty of penalties) {
        let calculatedAmount = 0;

        switch (penalty.penalty_type) {
          case 'fixed':
            calculatedAmount = penalty.amount || 0;
            break;

          case 'per_day':
            calculatedAmount = (penalty.amount || 0) * daysLate;
            break;

          case 'percentage':
            // percentage of base amount (use penalty.amount as base)
            const base = penalty.amount || 0;
            const rate = penalty.rate || 0;
            calculatedAmount = base * (rate / 100) * daysLate;
            break;

          case 'progressive': {
            // Parse details JSON for slab-based calculation
            // Expected format: [{ "from": 0, "to": 30, "amount_per_day": 50 }, { "from": 31, "to": 90, "amount_per_day": 100 }]
            try {
              const slabs = JSON.parse(penalty.details || '[]');
              for (const slab of slabs) {
                const slabFrom = slab.from || 0;
                const slabTo = slab.to || Infinity;
                if (daysLate > slabFrom) {
                  const effectiveDays = Math.min(daysLate, slabTo) - slabFrom;
                  if (effectiveDays > 0) {
                    calculatedAmount += effectiveDays * (slab.amount_per_day || slab.amount || 0);
                  }
                }
              }
            } catch {
              calculatedAmount = penalty.amount || 0;
            }
            break;
          }

          case 'custom':
            calculatedAmount = penalty.amount || 0;
            break;

          default:
            calculatedAmount = penalty.amount || 0;
        }

        // Apply max_amount cap if defined
        if (penalty.max_amount && calculatedAmount > penalty.max_amount) {
          calculatedAmount = penalty.max_amount;
        }

        // 5. UPSERT: Update existing log or insert new one
        const existingLog = db.prepare(`
          SELECT id FROM compliance_penalties_log
          WHERE compliance_item_id = ? AND base_penalty_id = ?
        `).get(item.id, penalty.id) as any;

        if (existingLog) {
          db.prepare(`
            UPDATE compliance_penalties_log 
            SET days_late = ?, calculated_amount = ?, last_calculated_at = ?, updated_at = ?
            WHERE id = ?
          `).run(daysLate, calculatedAmount, now, now, existingLog.id);
        } else {
          const logId = uuidv4();
          db.prepare(`
            INSERT INTO compliance_penalties_log (id, compliance_item_id, user_id, base_penalty_id, sub_compliance_id, penalty_description, penalty_type, days_late, calculated_amount, last_calculated_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            logId, item.id, item.user_id, penalty.id,
            selectedComp.sub_compliance_id, penalty.description,
            penalty.penalty_type, daysLate, calculatedAmount, now, now, now
          );
          penaltiesCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now,
      stats: {
        overdueItemsFound: overdueItems.length,
        itemsProcessed: processed,
        penaltiesCreated,
        itemsEscalated,
      }
    });
  } catch (error) {
    console.error('Penalty monitor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
