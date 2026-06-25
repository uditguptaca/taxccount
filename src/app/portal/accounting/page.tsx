'use client';
import React, { useEffect, useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { PieChart, FileText, FileSpreadsheet, ArrowUpRight, ArrowDownRight, Activity, DollarSign, UploadCloud, CheckCircle, AlertCircle, Check, SplitSquareHorizontal, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function PortalAccountingPage() {
  const { data, loading, refresh } = usePortal();
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data?.client?.id) {
      fetchLedgerData(data.client.id);
    }
  }, [data]);

  const fetchLedgerData = async (clientId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/ledger`);
      if (res.ok) setLedgerData(await res.json());
      
      const txnRes = await fetch(`/api/clients/${clientId}/ledger/transactions`);
      if (txnRes.ok) setTransactions((await txnRes.json()).transactions || []);

      const accRes = await fetch(`/api/clients/${clientId}/ledger/accounts`);
      if (accRes.ok) setAccounts((await accRes.json()).accounts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-gray-500)', fontWeight: 500 }}>Booting LedgerFlow Engine...</p>
    </div>
  );
  if (!data?.client) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load accounting profile</h2></div>;

  const stats = ledgerData?.stats || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, cashInBank: 0 };

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', fontFamily: 'Inter, sans-serif' }}>
      <div className="portal-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
            <Activity size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom', color: 'var(--color-primary)' }} /> 
            Accounting & LedgerFlow
          </h2>
          <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Review financials, upload bank statements, and verify categorizations.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--color-gray-200)' }}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: <PieChart size={14} /> },
          { key: 'transactions', label: 'Transactions & Uploads', icon: <FileText size={14} /> },
          { key: 'reports', label: 'Reports', icon: <FileSpreadsheet size={14} /> }
        ].map(t => (
          <button 
            key={t.key} 
            onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'transparent',
              color: activeTab === t.key ? 'var(--color-primary)' : 'var(--color-gray-500)',
              border: 'none',
              borderBottom: activeTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            
            <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</span>
                <div style={{ background: 'var(--color-success)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={14} style={{ color: 'var(--color-success)' }} />
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.totalRevenue)}</div>
            </div>
            
            <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expenses</span>
                <div style={{ background: 'var(--color-danger)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDownRight size={14} style={{ color: 'var(--color-danger)' }} />
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.totalExpenses)}</div>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Profit</span>
                <div style={{ background: 'var(--color-primary)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={14} style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.netProfit)}</div>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash in Bank</span>
                <div style={{ background: 'var(--color-warning)', opacity: 0.1, width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={14} style={{ color: 'var(--color-warning)' }} />
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(stats.cashInBank)}</div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>Recent Transactions</h3>
                <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '12px' }}>Your firm will review and finalize these entries.</p>
              </div>
              <button onClick={() => setActiveTab('transactions')} style={{ background: 'var(--color-gray-100)', color: '#374151', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                View All
              </button>
            </div>
            
            <div style={{ padding: '0 8px 8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Category</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((txn, i) => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-gray-500)' }}>
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{txn.description}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {txn.entries?.filter((e: any) => e.account_type !== 'asset' && e.account_type !== 'liability').map((e: any) => (
                          <span key={e.id} style={{ display: 'inline-flex', padding: '2px 8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '12px', fontSize: '11px', fontWeight: 600, marginRight: '4px' }}>
                            {e.account_name}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: txn.type === 'deposit' ? 'var(--color-success)' : '#111827' }}>
                        {txn.type === 'deposit' ? '+' : ''}{formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)', fontSize: '13px' }}>
                      No transactions recorded yet.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid var(--color-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '500px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '12px', fontSize: '11px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Zap size={12} /> AI Engine Active
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Upload Bank Statement</h3>
              <p style={{ color: 'var(--color-gray-500)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Drag and drop CSV or Excel statements. We will automatically extract and categorize them for your accountant.</p>
            </div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px dashed var(--color-primary)', textAlign: 'center', width: '220px', cursor: 'pointer' }} onClick={() => alert('Bank import engine triggered.')}>
              <UploadCloud size={20} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600 }}>Select File</h4>
              <p style={{ margin: 0, color: 'var(--color-gray-400)', fontSize: '11px' }}>CSV/XLS up to 50MB</p>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-gray-200)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Transaction Review</h3>
            </div>
            {transactions.length > 0 ? (
              <div style={{ padding: '0 8px 8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Description</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Category (AI Match)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Amount</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-gray-200)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(txn => (
                      <tr key={txn.id} style={{ borderBottom: '1px solid var(--color-gray-100)', background: txn.status === 'pending' ? '#fefce8' : 'white' }}>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-gray-500)' }}>{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{txn.description}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <select style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', background: 'white', width: '180px' }} defaultValue={txn.entries?.[0]?.account_id || ''}>
                            <option value="">Select...</option>
                            {accounts.filter(a => a.type === 'expense' || a.type === 'revenue').map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: txn.type === 'deposit' ? 'var(--color-success)' : '#111827' }}>
                          {txn.type === 'deposit' ? '+' : ''}{formatCurrency(txn.amount)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button style={{ background: 'var(--color-success)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}><Check size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '13px' }}>
                No transactions pending review.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>Profit & Loss</h3>
                <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '12px' }}>Income statement</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Start</label>
                <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-gray-200)', fontSize: '13px' }} defaultValue={`${new Date().getFullYear()}-01-01`} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>End</label>
                <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-gray-200)', fontSize: '13px' }} defaultValue={`${new Date().getFullYear()}-12-31`} />
              </div>
            </div>
            <button style={{ background: '#111827', color: 'white', border: 'none', width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Download P&L Report</button>
          </div>
          
          <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--color-success)', color: 'white', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>Balance Sheet</h3>
                <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '12px' }}>Assets, Liabilities, Equity</p>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>As of Date</label>
              <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-gray-200)', fontSize: '13px' }} defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <button style={{ background: 'var(--color-success)', color: 'white', border: 'none', width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Download Balance Sheet</button>
          </div>
        </div>
      )}
    </div>
  );
}
