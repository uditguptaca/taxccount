'use client';
import { useEffect, useState } from 'react';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, Clock, Download, ChevronDown, ChevronUp, FileText, X } from 'lucide-react';

function formatCurrency(amt: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(amt);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig: Record<string, { label: string; badge: string; icon: any }> = {
  paid: { label: 'Paid', badge: 'badge-green', icon: CheckCircle2 },
  sent: { label: 'Unpaid', badge: 'badge-yellow', icon: Clock },
  overdue: { label: 'Overdue', badge: 'badge-red', icon: AlertCircle },
  partially_paid: { label: 'Partial', badge: 'badge-yellow', icon: Clock },
  draft: { label: 'Draft', badge: 'badge-gray', icon: FileText },
  cancelled: { label: 'Cancelled', badge: 'badge-gray', icon: FileText },
};

export default function PortalBilling() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState<any>(null);

  const fetchData = () => {
    fetch('/api/portal/invoices')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openPayModal = (inv: any) => {
    const remaining = inv.total_amount - inv.paid_amount;
    setPayModal(inv);
    setPayAmount(remaining.toFixed(2));
    setPayResult(null);
  };

  const handlePay = async () => {
    if (!payModal || !payAmount) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    setPaying(true);
    try {
      const res = await fetch('/api/portal/invoices/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: payModal.id, amount }),
      });
      const result = await res.json();
      if (res.ok) {
        setPayResult({ success: true, ...result });
        fetchData();
      } else {
        setPayResult({ success: false, error: result.error });
      }
    } catch (err: any) {
      setPayResult({ success: false, error: err.message });
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading billing...</p></div>;
  if (!data) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load billing</h2></div>;

  const { invoices, summary } = data;

  const filtered = filter === 'all' ? invoices : invoices.filter((i: any) => {
    if (filter === 'unpaid') return ['sent', 'overdue', 'partially_paid'].includes(i.status);
    return i.status === filter;
  });

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1><CreditCard size={28} /> Billing & Payments</h1>
          <p className="text-muted">View invoices, make payments, and track your billing history.</p>
        </div>
      </div>

      {/* Billing Summary Cards */}
      <div className="portal-billing-summary">
        <div className="portal-billing-card">
          <div className="portal-billing-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div className="portal-billing-card-label">Outstanding Balance</div>
            <div className="portal-billing-card-value" style={{ color: summary.outstanding > 0 ? '#dc2626' : '#059669' }}>{formatCurrency(summary.outstanding)}</div>
          </div>
        </div>
        <div className="portal-billing-card">
          <div className="portal-billing-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="portal-billing-card-label">Overdue</div>
            <div className="portal-billing-card-value" style={{ color: summary.overdue > 0 ? '#d97706' : 'var(--color-gray-700)' }}>{formatCurrency(summary.overdue)}</div>
          </div>
        </div>
        <div className="portal-billing-card">
          <div className="portal-billing-card-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="portal-billing-card-label">Total Paid</div>
            <div className="portal-billing-card-value">{formatCurrency(summary.total_paid)}</div>
          </div>
        </div>
        <div className="portal-billing-card">
          <div className="portal-billing-card-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="portal-billing-card-label">Total Invoices</div>
            <div className="portal-billing-card-value">{summary.total_invoices}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="portal-doc-tabs">
        {[
          { key: 'all', label: `All (${invoices.length})` },
          { key: 'unpaid', label: `Unpaid (${summary.pending_count + summary.overdue_count})` },
          { key: 'paid', label: `Paid (${summary.paid_count})` },
          { key: 'overdue', label: `Overdue (${summary.overdue_count})` },
        ].map(tab => (
          <button key={tab.key} className={`portal-doc-tab ${filter === tab.key ? 'active' : ''}`} onClick={() => setFilter(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <div className="portal-doc-empty">
          <CheckCircle2 size={48} />
          <h3>No invoices found</h3>
          <p>Try changing the filter.</p>
        </div>
      ) : (
        <div className="portal-invoice-list">
          {filtered.map((inv: any) => {
            const cfg = statusConfig[inv.status] || statusConfig.draft;
            const Icon = cfg.icon;
            const isExpanded = expandedInvoice === inv.id;
            const remaining = inv.total_amount - inv.paid_amount;
            return (
              <div key={inv.id} className={`portal-invoice-card ${inv.status === 'overdue' ? 'overdue' : ''}`}>
                <div className="portal-invoice-card-main" onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}>
                  <div className="portal-invoice-card-left">
                    <div className="portal-invoice-number">#{inv.invoice_number}</div>
                    <div className="portal-invoice-desc">{inv.description || `${inv.template_name || 'Professional services'}`}</div>
                    <div className="portal-invoice-meta">{inv.template_name} · FY {inv.financial_year}</div>
                  </div>
                  <div className="portal-invoice-card-right">
                    <div className="portal-invoice-amount">{formatCurrency(inv.total_amount)}</div>
                    <span className={`badge ${cfg.badge}`}><Icon size={12} /> {cfg.label}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="portal-invoice-details">
                    <div className="portal-invoice-detail-grid">
                      <div><span className="text-muted">Amount</span><br />{formatCurrency(inv.amount)}</div>
                      <div><span className="text-muted">Tax (HST)</span><br />{formatCurrency(inv.tax_amount)}</div>
                      <div><span className="text-muted">Total</span><br /><strong>{formatCurrency(inv.total_amount)}</strong></div>
                      <div><span className="text-muted">Paid</span><br />{formatCurrency(inv.paid_amount)}</div>
                      <div><span className="text-muted">Balance Due</span><br /><strong style={{color: remaining > 0 ? '#dc2626' : '#059669'}}>{formatCurrency(remaining)}</strong></div>
                      <div><span className="text-muted">Issued</span><br />{formatDate(inv.issued_date)}</div>
                      <div><span className="text-muted">Due</span><br />{formatDate(inv.due_date)}</div>
                      {inv.paid_date && <div><span className="text-muted">Paid On</span><br />{formatDate(inv.paid_date)}</div>}
                      {inv.payment_method && <div><span className="text-muted">Method</span><br />{inv.payment_method}</div>}
                    </div>
                    <div className="portal-invoice-detail-actions">
                      <button className="btn btn-ghost btn-sm"><Download size={14} /> Download PDF</button>
                      {['sent', 'overdue', 'partially_paid'].includes(inv.status) && (
                        <button className="btn btn-primary btn-sm" onClick={() => openPayModal(inv)}>
                          <DollarSign size={14} /> Pay {formatCurrency(remaining)}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Partial Payment Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={() => !paying && setPayModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>Make a Payment</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => !paying && setPayModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {payResult?.success ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  <CheckCircle2 size={48} color="#059669" />
                  <h3 style={{ marginTop: 'var(--space-3)', color: '#059669' }}>Payment Successful!</h3>
                  <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
                    {formatCurrency(payResult.amount_paid)} has been applied to Invoice #{payModal.invoice_number}.
                  </p>
                  {payResult.new_balance > 0 && (
                    <p className="text-sm" style={{ marginTop: 'var(--space-2)', color: '#d97706' }}>
                      Remaining balance: {formatCurrency(payResult.new_balance)}
                    </p>
                  )}
                  <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setPayModal(null)}>Done</button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="text-sm text-muted">Invoice</div>
                    <div style={{ fontWeight: 600 }}>#{payModal.invoice_number} — {payModal.template_name || 'Professional services'}</div>
                    <div className="text-sm" style={{ marginTop: 'var(--space-1)' }}>
                      <span className="text-muted">Total:</span> {formatCurrency(payModal.total_amount)} · <span className="text-muted">Paid:</span> {formatCurrency(payModal.paid_amount)} · <span className="text-muted">Remaining:</span> <strong style={{color: '#dc2626'}}>{formatCurrency(payModal.total_amount - payModal.paid_amount)}</strong>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Payment Amount (CAD)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-500)', fontWeight: 600 }}>$</span>
                      <input
                        type="number"
                        className="form-input"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        min="0.01"
                        max={(payModal.total_amount - payModal.paid_amount).toFixed(2)}
                        step="0.01"
                        style={{ paddingLeft: 28, fontSize: '18px', fontWeight: 600 }}
                        disabled={paying}
                      />
                    </div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                      Enter any amount up to {formatCurrency(payModal.total_amount - payModal.paid_amount)}. Partial payments are supported.
                    </div>
                  </div>

                  {payResult?.error && (
                    <div className="badge badge-red" style={{ display: 'block', padding: 'var(--space-2)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>
                      {payResult.error}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={() => setPayModal(null)} disabled={paying}>Cancel</button>
                    <button className="btn btn-primary" onClick={handlePay} disabled={paying || !payAmount || parseFloat(payAmount) <= 0}>
                      {paying ? 'Processing...' : `Pay ${formatCurrency(parseFloat(payAmount) || 0)}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
