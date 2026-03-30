'use client';
import { useEffect, useState } from 'react';
import { Receipt, DollarSign, AlertTriangle, Clock, FileText } from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [subTab, setSubTab] = useState('invoices');
  const [clients, setClients] = useState<any[]>([]);

  // Modals state
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState<string | null>(null);
  
  // Forms state
  const [invoiceForm, setInvoiceForm] = useState({ client_id: '', total_amount: '', due_date: '', notes: '' });
  const [paymentForm, setPaymentForm] = useState({ payment_amount: '', payment_method: 'e-transfer', notes: '' });

  useEffect(() => { 
    fetch('/api/billing').then(r => r.json()).then(setData); 
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
  }, []);
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading billing...</div>;

  const s = data.summary || {};
  const invoices = (data.invoices || []).filter((i: any) => filter === 'all' || i.status === filter);
  const statusBadge = (st: string) => {
    const m: Record<string, string> = { paid: 'badge-green', unpaid: 'badge-yellow', overdue: 'badge-red', draft: 'badge-gray', sent: 'badge-blue', partially_paid: 'badge-cyan', cancelled: 'badge-gray' };
    return <span className={`badge ${m[st] || 'badge-gray'}`}><span className="badge-dot"></span>{st.replace('_', ' ')}</span>;
  };

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceForm)
    });
    setShowCreateInvoice(false);
    setInvoiceForm({ client_id: '', total_amount: '', due_date: '', notes: '' });
    fetch('/api/billing').then(r => r.json()).then(setData);
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!showRecordPayment) return;
    await fetch(`/api/billing/${showRecordPayment}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentForm)
    });
    setShowRecordPayment(null);
    setPaymentForm({ payment_amount: '', payment_method: 'e-transfer', notes: '' });
    fetch('/api/billing').then(r => r.json()).then(setData);
  }

  return (
    <>
      <div className="page-header">
        <div><h1>Billing</h1><p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Invoices, payments, and revenue tracking</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreateInvoice(true)}><Receipt size={18} /> Create Invoice</button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-icon blue"><Receipt size={22} /></div><div className="kpi-label">Total Invoices</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{s.total_count || 0}</div><div className="text-xs text-muted">{formatCurrency(s.total_amount)}</div></div>
        <div className="kpi-card"><div className="kpi-icon green"><DollarSign size={22} /></div><div className="kpi-label">Collected</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{formatCurrency(s.collected_amount)}</div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><Clock size={22} /></div><div className="kpi-label">Unpaid</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{formatCurrency(s.unpaid_amount)}</div></div>
        <div className="kpi-card"><div className="kpi-icon red"><AlertTriangle size={22} /></div><div className="kpi-label">Overdue</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{formatCurrency(s.overdue_amount)}</div></div>
      </div>

      {/* Sub Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        {['invoices', 'time_entries', 'proposals'].map(t => (
          <button key={t} className={`tab ${subTab === t ? 'active' : ''}`} onClick={() => setSubTab(t)}>
            {t === 'invoices' ? 'Invoices' : t === 'time_entries' ? 'Time Entries' : 'Proposals'}
          </button>
        ))}
      </div>

      {subTab === 'invoices' && (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {['all', 'draft', 'sent', 'paid', 'unpaid', 'overdue', 'partially_paid'].map(f => (
              <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Invoice</th><th>Client</th><th>Status</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Action</th></tr></thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td><span className="client-name">{inv.invoice_number}</span><br /><span className="text-xs text-muted">{inv.engagement_code || ''}</span></td>
                      <td><span className="text-sm">{inv.client_name}</span><br /><span className="text-xs text-muted">{inv.client_code}</span></td>
                      <td>{statusBadge(inv.status)}</td>
                      <td className="text-sm">{formatDate(inv.issued_date)}</td>
                      <td className="text-sm">{formatCurrency(inv.total_amount)}</td>
                      <td className="text-sm">{formatCurrency(inv.paid_amount)}</td>
                      <td className="text-sm" style={{ fontWeight: 600, color: inv.total_amount - inv.paid_amount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {formatCurrency(inv.total_amount - inv.paid_amount)}
                      </td>
                      <td>
                        {inv.status !== 'paid' && inv.status !== 'draft' && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => {
                                setPaymentForm({ ...paymentForm, payment_amount: (inv.total_amount - inv.paid_amount).toFixed(2) });
                                setShowRecordPayment(inv.id);
                            }}
                          >
                            Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {subTab === 'time_entries' && (
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Team Member</th><th>Client</th><th>Description</th><th>Duration</th><th>Rate</th><th>Amount</th></tr></thead>
              <tbody>
                {(data.timeEntries || []).map((te: any) => (
                  <tr key={te.id}>
                    <td className="text-sm">{formatDate(te.entry_date)}</td>
                    <td className="text-sm">{te.user_name}</td>
                    <td className="text-sm">{te.client_name}</td>
                    <td className="text-sm">{te.description}</td>
                    <td className="text-sm">{Math.floor(te.duration_minutes / 60)}h {te.duration_minutes % 60}m</td>
                    <td className="text-sm">{formatCurrency(te.hourly_rate)}/hr</td>
                    <td className="text-sm" style={{ fontWeight: 600 }}>{formatCurrency((te.duration_minutes / 60) * te.hourly_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'proposals' && (
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Proposal</th><th>Client</th><th>Title</th><th>Amount</th><th>Status</th><th>Sent</th></tr></thead>
              <tbody>
                {(data.proposals || []).map((p: any) => (
                  <tr key={p.id}>
                    <td><span className="client-name">{p.proposal_number}</span></td>
                    <td className="text-sm">{p.client_name}</td>
                    <td className="text-sm">{p.title}</td>
                    <td className="text-sm" style={{ fontWeight: 600 }}>{formatCurrency(p.total_amount)}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td className="text-sm">{formatDate(p.sent_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <div className="modal-overlay" onClick={() => setShowCreateInvoice(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Create Invoice</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateInvoice(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select className="form-select" required value={invoiceForm.client_id} onChange={e => setInvoiceForm({...invoiceForm, client_id: e.target.value})}>
                    <option value="">Select a client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.display_name} ({c.client_code})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Amount ($) *</label>
                    <input className="form-input" type="number" step="0.01" required value={invoiceForm.total_amount} onChange={e => setInvoiceForm({...invoiceForm, total_amount: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input className="form-input" type="date" required value={invoiceForm.due_date} onChange={e => setInvoiceForm({...invoiceForm, due_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes / Description</label>
                  <textarea className="form-input" value={invoiceForm.notes} onChange={e => setInvoiceForm({...invoiceForm, notes: e.target.value})} placeholder="Tax preparation services..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateInvoice(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="modal-overlay" onClick={() => setShowRecordPayment(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRecordPayment(null)}>✕</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Payment Amount ($) *</label>
                  <input className="form-input" type="number" step="0.01" required value={paymentForm.payment_amount} onChange={e => setPaymentForm({...paymentForm, payment_amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select className="form-select" required value={paymentForm.payment_method} onChange={e => setPaymentForm({...paymentForm, payment_method: e.target.value})}>
                    <option value="e-transfer">E-Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash / Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Internal Notes</label>
                  <input className="form-input" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} placeholder="Reference #" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRecordPayment(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-success)' }}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
