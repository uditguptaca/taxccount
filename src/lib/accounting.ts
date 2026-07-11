import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface JournalEntryLine {
  account_id: string;
  debit: number;
  credit: number;
  memo?: string;
}

// Create journal entries atomically - creates a ledger_transaction + ledger_journal_entries
export async function createJournalEntries(
  db: any, // can be db or txDb
  ledgerId: string,
  orgId: string,
  date: string,
  description: string,
  entries: JournalEntryLine[],
  type: string = 'manual_journal'
): Promise<string> {
  // Validate debit = credit
  const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Unbalanced entry: debits (${totalDebit.toFixed(2)}) != credits (${totalCredit.toFixed(2)})`);
  }
  
  const txnId = uuidv4();
  await db.prepare(`
    INSERT INTO ledger_transactions (id, org_id, ledger_id, date, description, type, status, amount, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'categorized', ?, datetime('now'), datetime('now'))
  `).run(txnId, orgId, ledgerId, date, description, type, totalDebit);
  
  for (const entry of entries) {
    await db.prepare(`
      INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit, memo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(uuidv4(), orgId, txnId, entry.account_id, entry.debit || 0, entry.credit || 0, entry.memo || null);
  }
  
  return txnId;
}

// Get a system account by subtype
export async function getAccountBySubtype(db: any, ledgerId: string, subtype: string): Promise<any> {
  return db.prepare(`SELECT * FROM ledger_accounts WHERE ledger_id = ? AND subtype = ? AND is_active = 1 LIMIT 1`).get(ledgerId, subtype);
}

// Get a system account by name
export async function getAccountByName(db: any, ledgerId: string, name: string): Promise<any> {
  return db.prepare(`SELECT * FROM ledger_accounts WHERE ledger_id = ? AND name = ? AND is_active = 1 LIMIT 1`).get(ledgerId, name);
}
