'use client';
import React, { useEffect, useState } from 'react';
import { 
  BookOpen, DollarSign, ShoppingCart, Landmark, PieChart, 
  ChevronDown, ChevronRight, FileText, ArrowUpRight, ArrowDownRight, 
  Activity, CheckCircle2, Search, Plus, MoreVertical, Edit2, 
  UploadCloud, Check, SplitSquareHorizontal, Zap, Users, Receipt, CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function LedgerFlowTab({ clientId }: { clientId: string }) {
  const [data, setData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart_of_accounts');
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [salesData, setSalesData] = useState<any>({ customers: [], invoices: [] });
  const [purchasesData, setPurchasesData] = useState<any>({ vendors: [], bills: [] });

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    accounting: true, sales: true, purchases: true, banking: true, reports: true
  });

  // Journal Entry State
  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    entries: [
      { id: 1, account_id: '', debit: '', credit: '' },
      { id: 2, account_id: '', debit: '', credit: '' }
    ]
  });
  const [postingJournal, setPostingJournal] = useState(false);

  const toggleSection = (section: string) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    fetchLedgerData();
  }, [clientId]);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/ledger`);
      if (res.ok) setData(await res.json());
      
      const txnRes = await fetch(`/api/clients/${clientId}/ledger/transactions`);
      if (txnRes.ok) setTransactions((await txnRes.json()).transactions || []);

      const accRes = await fetch(`/api/clients/${clientId}/ledger/accounts`);
      if (accRes.ok) setAccounts((await accRes.json()).accounts || []);

      const salesRes = await fetch(`/api/clients/${clientId}/ledger/sales`);
      if (salesRes.ok) setSalesData(await salesRes.json());

      const purRes = await fetch(`/api/clients/${clientId}/ledger/purchases`);
      if (purRes.ok) setPurchasesData(await purRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJournal = async () => {
    if (!journalForm.date || !journalForm.description) return alert("Please fill out date and description");
    
    // Validate balance
    let totalDebit = 0;
    let totalCredit = 0;
    for (const e of journalForm.entries) {
      if (!e.account_id) return alert("Please select an account for all lines.");
      totalDebit += parseFloat(e.debit || '0');
      totalCredit += parseFloat(e.credit || '0');
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return alert(`Debits (${totalDebit}) must equal Credits (${totalCredit})`);
    }

    if (totalDebit === 0) return alert("Please enter amounts.");

    setPostingJournal(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalForm)
      });
      if (res.ok) {
        alert("Journal entry posted successfully!");
        setJournalForm({
          date: new Date().toISOString().split('T')[0],
          description: '',
          entries: [{ id: 1, account_id: '', debit: '', credit: '' }, { id: 2, account_id: '', debit: '', credit: '' }]
        });
        fetchLedgerData(); // Refresh data
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post entry");
      }
    } catch(e) {
      alert("An error occurred");
    } finally {
      setPostingJournal(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-gray-500)', fontWeight: 500 }}>Booting LedgerFlow Engine...</p>
    </div>
  );

  const stats = data?.stats || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, cashInBank: 0 };

  const SidebarItem = ({ id, label }: { id: string, label: string }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{
        padding: '6px 12px 6px 36px',
        fontSize: '13px',
        color: activeTab === id ? '#0F172A' : '#64748B',
        background: activeTab === id ? '#F1F5F9' : 'transparent',
        borderRadius: '6px', cursor: 'pointer', marginBottom: '2px',
        fontWeight: activeTab === id ? 600 : 400,
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </div>
  );

  const SidebarSection = ({ id, label, icon: Icon, children }: any) => (
    <div style={{ marginBottom: '8px' }}>
      <div 
        onClick={() => toggleSection(id)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', color: '#1E293B', fontWeight: 600, fontSize: '13px' }}
      >
        <Icon size={16} style={{ color: '#64748B' }} />
        <span style={{ flex: 1 }}>{label}</span>
        {expanded[id] ? <ChevronDown size={14} color="#64748B" /> : <ChevronRight size={14} color="#64748B" />}
      </div>
      {expanded[id] && <div>{children}</div>}
    </div>
  );

  const TableHeader = ({ title, desc, actionLabel, icon: Icon, onAction }: any) => (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '13px' }}>{desc}</p>
      </div>
      {actionLabel && (
        <button onClick={onAction} disabled={postingJournal} style={{ background: '#111827', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', opacity: postingJournal ? 0.7 : 1 }}>
          <Icon size={14} /> {postingJournal ? 'Posting...' : actionLabel}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: '800px', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT SIDEBAR - LIGHT THEME */}
      <div style={{ width: '250px', flexShrink: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 8px', overflowY: 'auto', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
        <SidebarSection id="accounting" label="Accounting" icon={BookOpen}>
          <SidebarItem id="chart_of_accounts" label="Chart of Accounts" />
          <SidebarItem id="journal_entries" label="Journal Entries" />
          <SidebarItem id="general_ledger" label="General Ledger" />
        </SidebarSection>
        <SidebarSection id="sales" label="Sales (AR)" icon={DollarSign}>
          <SidebarItem id="customers" label="Customers" />
          <SidebarItem id="invoices" label="Invoices" />
        </SidebarSection>
        <SidebarSection id="purchases" label="Purchases (AP)" icon={ShoppingCart}>
          <SidebarItem id="vendors" label="Vendors" />
          <SidebarItem id="bills" label="Bills" />
        </SidebarSection>
        <SidebarSection id="banking" label="Banking" icon={Landmark}>
          <SidebarItem id="transaction_inbox" label="Transaction Inbox" />
          <SidebarItem id="csv_import" label="CSV Import" />
          <SidebarItem id="reconciliation" label="Reconciliation" />
        </SidebarSection>
        <SidebarSection id="reports" label="Reports" icon={PieChart}>
          <SidebarItem id="reports_hub" label="Reports Hub" />
          <SidebarItem id="profit_loss" label="Profit & Loss" />
        </SidebarSection>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
        
        {/* KPI DASHBOARD HEADER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue (YTD)</span>
              <div style={{ background: 'var(--color-success)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={14} style={{ color: 'var(--color-success)' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expenses (YTD)</span>
              <div style={{ background: 'var(--color-danger)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDownRight size={14} style={{ color: 'var(--color-danger)' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.totalExpenses)}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Profit</span>
              <div style={{ background: 'var(--color-primary)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={14} style={{ color: 'var(--color-primary)' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.netProfit)}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash on Hand</span>
              <div style={{ background: 'var(--color-warning)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Landmark size={14} style={{ color: 'var(--color-warning)' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.cashInBank)}</div>
          </div>
        </div>

        {/* CHART OF ACCOUNTS */}
        {activeTab === 'chart_of_accounts' && (
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <TableHeader title="Chart of Accounts" desc="Customized accounting structure for this specific client." actionLabel="Add Account" icon={Plus} />
            <div style={{ padding: '0 8px 8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Account Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {['asset', 'liability', 'equity', 'revenue', 'expense'].map(groupType => {
                    const groupAccounts = accounts.filter(a => a.type === groupType);
                    if (groupAccounts.length === 0) return null;
                    return (
                      <React.Fragment key={groupType}>
                        <tr><td colSpan={3} style={{ padding: '16px 16px 8px', fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>{groupType}</td></tr>
                        {groupAccounts.map(acc => (
                          <tr key={acc.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{acc.name}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-gray-500)', textTransform: 'capitalize' }}>{acc.subtype?.replace('_', ' ')}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatCurrency(acc.balance || 0)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JOURNAL ENTRIES */}
        {activeTab === 'journal_entries' && (
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <TableHeader title="Journal Entries" desc="Create manual double-entry accounting records." actionLabel="Post Entry" icon={Check} onAction={handlePostJournal} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 4 }}>Date</label>
                  <input type="date" value={journalForm.date} onChange={e => setJournalForm({...journalForm, date: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-200)' }} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
                  <input type="text" value={journalForm.description} onChange={e => setJournalForm({...journalForm, description: e.target.value})} placeholder="e.g. Depreciation adjusting entry" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-200)' }} />
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: 'var(--color-gray-500)' }}>Account</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: 'var(--color-gray-500)', width: '120px' }}>Debit</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: 'var(--color-gray-500)', width: '120px' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {journalForm.entries.map((entry, index) => (
                    <tr key={entry.id}>
                      <td style={{ padding: '8px' }}>
                        <select value={entry.account_id} onChange={e => {
                          const newEntries = [...journalForm.entries];
                          newEntries[index].account_id = e.target.value;
                          setJournalForm({...journalForm, entries: newEntries});
                        }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-200)' }}>
                          <option value="">Select Account...</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="number" value={entry.debit} onChange={e => {
                          const newEntries = [...journalForm.entries];
                          newEntries[index].debit = e.target.value;
                          newEntries[index].credit = ''; // Clear credit if typing debit
                          setJournalForm({...journalForm, entries: newEntries});
                        }} placeholder="0.00" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', textAlign: 'right' }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="number" value={entry.credit} onChange={e => {
                          const newEntries = [...journalForm.entries];
                          newEntries[index].credit = e.target.value;
                          newEntries[index].debit = ''; // Clear debit if typing credit
                          setJournalForm({...journalForm, entries: newEntries});
                        }} placeholder="0.00" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', textAlign: 'right' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => setJournalForm({...journalForm, entries: [...journalForm.entries, { id: Date.now(), account_id: '', debit: '', credit: '' }]})}
                style={{ color: 'var(--color-primary)', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Plus size={14} /> Add Line
              </button>
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === 'customers' && (
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <TableHeader title="Customers (AR)" desc="Manage accounts receivable clients." actionLabel="New Customer" icon={Users} onAction={() => alert('New Customer Modal')} />
            <div style={{ padding: '0 8px 8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.customers.map((c: any) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{c.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-gray-500)' }}>{c.email || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-success)', textAlign: 'right', fontWeight: 600 }}>Active</td>
                    </tr>
                  ))}
                  {salesData.customers.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>No customers found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVOICES */}
        {activeTab === 'invoices' && (
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <TableHeader title="Invoices" desc="Manage outgoing invoices to customers." actionLabel="Create Invoice" icon={Receipt} onAction={() => alert('New Invoice Modal')} />
            <div style={{ padding: '0 8px 8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Invoice #</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.invoices.map((inv: any) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoice_number}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827', fontWeight: 500 }}>{inv.customer_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase', fontWeight: 700, color: inv.status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)' }}>{inv.status}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>{formatCurrency(inv.total_amount)}</td>
                    </tr>
                  ))}
                  {salesData.invoices.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>No invoices found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRANSACTION INBOX */}
        {activeTab === 'transaction_inbox' && (
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <TableHeader 
              title="Transaction Inbox" 
              desc="Review, categorize, and reconcile imported bank transactions." 
              actionLabel="Add Bank Transaction" 
              icon={Landmark} 
              onAction={async () => {
                const desc = prompt("Enter bank transaction description (e.g. 'Coffee Shop'):");
                const amount = prompt("Enter amount (positive for deposit, negative for withdrawal):");
                if (desc && amount) {
                  await fetch(`/api/clients/${clientId}/ledger/transactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      date: new Date().toISOString().split('T')[0],
                      description: desc,
                      amount: parseFloat(amount),
                      type: parseFloat(amount) >= 0 ? 'deposit' : 'withdrawal',
                      status: 'pending', // Will override 'categorized' from API temporarily for demo
                      reference: 'BANK-SYNC'
                    })
                  });
                  fetchLedgerData();
                }
              }} 
            />
            <div style={{ padding: '0 8px 8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn: any) => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid var(--color-gray-100)', background: txn.status === 'reconciled' ? 'rgba(16, 185, 129, 0.05)' : 'white' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-gray-500)' }}>{new Date(txn.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{txn.description}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, textAlign: 'right', color: txn.amount >= 0 ? 'var(--color-success)' : '#111827' }}>{formatCurrency(txn.amount)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', padding: '4px 8px', borderRadius: '12px',
                          background: txn.status === 'reconciled' ? 'var(--color-success)' : txn.status === 'pending' ? 'var(--color-warning)' : 'var(--color-primary)',
                          color: 'white'
                        }}>
                          {txn.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {txn.status !== 'reconciled' && (
                          <button 
                            onClick={async () => {
                              await fetch(`/api/clients/${clientId}/ledger/transactions/reconcile`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ transaction_id: txn.id, status: 'reconciled' })
                              });
                              fetchLedgerData();
                            }}
                            style={{ background: 'transparent', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            Reconcile
                          </button>
                        )}
                        {txn.status === 'reconciled' && <CheckCircle2 size={16} style={{ color: 'var(--color-success)', display: 'inline-block' }} />}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>No bank transactions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
