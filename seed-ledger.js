const { join } = require('path');
const postgres = require('postgres');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const envStr = fs.readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function seed() {
  const sql = postgres(dbUrl);
  try {
    const ledgers = await sql`SELECT * FROM ledgers`;
    if (ledgers.length === 0) {
      console.log('No ledgers found to seed.');
      return;
    }

    for (const ledger of ledgers) {
      const { id: ledger_id, org_id } = ledger;

      // Check if already seeded
      const existing = await sql`SELECT count(*) as count FROM ledger_transactions WHERE ledger_id = ${ledger_id}`;
      if (existing[0].count > 0) continue;

      console.log(`Seeding ledger ${ledger_id}...`);

      // Get accounts
      const accounts = await sql`SELECT * FROM ledger_accounts WHERE ledger_id = ${ledger_id}`;
      
      const bankAcc = accounts.find(a => a.subtype === 'bank')?.id;
      const salesAcc = accounts.find(a => a.subtype === 'sales')?.id;
      const rentAcc = accounts.find(a => a.subtype === 'rent')?.id;
      const officeAcc = accounts.find(a => a.subtype === 'office')?.id;
      const feesAcc = accounts.find(a => a.subtype === 'fees')?.id;

      if (!bankAcc) continue; // safety check

      const dummyTransactions = [
        { date: '2026-06-01', desc: 'Shopify Payout', amount: 4500.00, type: 'deposit', creditAcc: salesAcc },
        { date: '2026-06-03', desc: 'Office Lease June', amount: 1200.00, type: 'withdrawal', debitAcc: rentAcc },
        { date: '2026-06-05', desc: 'Stripe Transfer', amount: 3250.50, type: 'deposit', creditAcc: salesAcc },
        { date: '2026-06-10', desc: 'Staples - Office Supplies', amount: 154.20, type: 'withdrawal', debitAcc: officeAcc },
        { date: '2026-06-15', desc: 'Monthly Bank Fee', amount: 15.00, type: 'withdrawal', debitAcc: feesAcc },
        { date: '2026-06-18', desc: 'Shopify Payout', amount: 2100.00, type: 'deposit', creditAcc: salesAcc },
        { date: '2026-06-20', desc: 'Amazon AWS', amount: 89.99, type: 'withdrawal', debitAcc: officeAcc },
      ];

      for (const txn of dummyTransactions) {
        const txnId = uuidv4();
        await sql`
          INSERT INTO ledger_transactions (id, org_id, ledger_id, date, description, type, status, amount)
          VALUES (${txnId}, ${org_id}, ${ledger_id}, ${txn.date}, ${txn.desc}, ${txn.type}, 'categorized', ${txn.amount})
        `;

        if (txn.type === 'deposit') {
          // Debit Bank, Credit Sales
          await sql`INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit) VALUES (${uuidv4()}, ${org_id}, ${txnId}, ${bankAcc}, ${txn.amount}, 0)`;
          await sql`INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit) VALUES (${uuidv4()}, ${org_id}, ${txnId}, ${txn.creditAcc}, 0, ${txn.amount})`;
        } else {
          // Credit Bank, Debit Expense
          await sql`INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit) VALUES (${uuidv4()}, ${org_id}, ${txnId}, ${bankAcc}, 0, ${txn.amount})`;
          await sql`INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit) VALUES (${uuidv4()}, ${org_id}, ${txnId}, ${txn.debitAcc}, ${txn.amount}, 0)`;
        }
      }
    }
    console.log('Seeding complete.');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

seed();
