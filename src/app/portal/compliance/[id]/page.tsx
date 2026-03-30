'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle, FileText,
  UploadCloud, MessageSquare, CreditCard, Calendar, ChevronRight,
  Shield, Eye, Download, DollarSign
} from 'lucide-react';

type ClientStatus = 'Waiting for You' | 'In Progress' | 'Review & Sign' | 'Payment Required' | 'Completed' | 'Not Started';

const statusStyles: Record<ClientStatus, { color: string; bg: string }> = {
  'Waiting for You': { color: '#d97706', bg: '#fef3c7' },
  'In Progress': { color: '#2563eb', bg: '#dbeafe' },
  'Review & Sign': { color: '#7c3aed', bg: '#ede9fe' },
  'Payment Required': { color: '#dc2626', bg: '#fee2e2' },
  'Completed': { color: '#059669', bg: '#d1fae5' },
  'Not Started': { color: '#6b7280', bg: '#f3f4f6' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amt: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amt);
}

export default function ComplianceDetail() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'chat' | 'billing'>('overview');

  useEffect(() => {
    if (params.id) {
      fetch(`/api/portal/compliance/${params.id}`)
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading compliance details...</p></div>;
  if (!data || data.error) return <div className="portal-error"><AlertCircle size={48} /><h2>Compliance not found</h2><Link href="/portal" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Back to Dashboard</Link></div>;

  const { compliance, stages, documents, requiredDocs, chatThreads, invoices } = data;
  const status = compliance.client_status as ClientStatus;
  const cfg = statusStyles[status] || statusStyles['In Progress'];
  const isOverdue = compliance.due_date && new Date(compliance.due_date) < new Date() && compliance.status !== 'completed';
  const pendingDocs = requiredDocs.filter((d: any) => d.uploaded_count === 0);

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="portal-comp-detail-header">
        <Link href="/portal" className="portal-back-link"><ArrowLeft size={18} /> Back to Dashboard</Link>
        <div className="portal-comp-detail-title-row">
          <div>
            <h1>{compliance.template_name}</h1>
            <p className="portal-comp-detail-subtitle">
              FY {compliance.financial_year} · {compliance.engagement_code}
              {compliance.due_date && <> · Due {formatDate(compliance.due_date)}</>}
            </p>
          </div>
          <div className="portal-comp-detail-status">
            <span className="portal-comp-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
              {status}
            </span>
            {isOverdue && <span className="badge badge-red">Overdue</span>}
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="portal-timeline-card">
        <h3><Shield size={18} /> Progress Timeline</h3>
        <div className="portal-timeline">
          {stages.map((stage: any, i: number) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'in_progress';
            return (
              <div key={stage.id} className="portal-timeline-step">
                <div className={`portal-timeline-dot ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : isCurrent ? <Clock size={16} /> : <Circle size={16} />}
                </div>
                {i < stages.length - 1 && <div className={`portal-timeline-line ${isCompleted ? 'completed' : ''}`} />}
                <div className="portal-timeline-label">
                  <span className={`portal-timeline-name ${isCurrent ? 'current' : ''}`}>{stage.stage_name}</span>
                  {isCompleted && stage.completed_at && <span className="portal-timeline-date">{formatDate(stage.completed_at)}</span>}
                  {isCurrent && <span className="portal-timeline-date" style={{ color: cfg.color }}>In Progress</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="portal-doc-tabs">
        {[
          { key: 'overview', label: 'Overview', icon: Shield },
          { key: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          { key: 'chat', label: `Chat (${chatThreads.length})`, icon: MessageSquare },
          { key: 'billing', label: `Billing (${invoices.length})`, icon: CreditCard },
        ].map(tab => (
          <button key={tab.key} className={`portal-doc-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key as any)}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="portal-comp-overview">
          {/* Action Panel */}
          {(pendingDocs.length > 0 || status === 'Waiting for You' || status === 'Payment Required') && (
            <div className="portal-comp-action-panel">
              <h3><AlertCircle size={18} /> What you need to do</h3>
              {pendingDocs.length > 0 && (
                <div className="portal-comp-action-item" onClick={() => setActiveTab('documents')}>
                  <UploadCloud size={18} />
                  <span>Upload {pendingDocs.length} missing document{pendingDocs.length > 1 ? 's' : ''}</span>
                  <ChevronRight size={16} />
                </div>
              )}
              {status === 'Review & Sign' && (
                <div className="portal-comp-action-item">
                  <FileText size={18} />
                  <span>Review and sign documents sent by your firm</span>
                  <ChevronRight size={16} />
                </div>
              )}
              {status === 'Payment Required' && invoices.filter((i: any) => ['sent', 'overdue'].includes(i.status)).length > 0 && (
                <div className="portal-comp-action-item" onClick={() => setActiveTab('billing')}>
                  <CreditCard size={18} />
                  <span>Pay outstanding invoice</span>
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          )}

          {/* Document Checklist */}
          <div className="portal-comp-checklist">
            <h3><FileText size={18} /> Document Checklist</h3>
            {requiredDocs.length === 0 ? (
              <p className="text-muted" style={{ padding: 'var(--space-4)' }}>No documents required for this compliance.</p>
            ) : (
              <div className="portal-comp-checklist-list">
                {requiredDocs.map((doc: any, i: number) => (
                  <div key={i} className={`portal-comp-checklist-item ${doc.uploaded_count > 0 ? 'done' : 'pending'}`}>
                    {doc.uploaded_count > 0 ? <CheckCircle2 size={18} style={{ color: '#059669' }} /> : <Circle size={18} style={{ color: '#d97706' }} />}
                    <div>
                      <span className="portal-comp-checklist-name">{doc.document_name}</span>
                      <span className="portal-comp-checklist-meta">
                        {doc.is_mandatory ? 'Required' : 'Optional'} · {doc.document_category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {doc.uploaded_count > 0 ? (
                      <span className="badge badge-green">Uploaded</span>
                    ) : (
                      <span className="badge badge-yellow">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="portal-comp-summary-grid">
            <div className="portal-comp-summary-item">
              <Calendar size={16} />
              <div><span className="text-muted">Due Date</span><br /><strong>{formatDate(compliance.due_date)}</strong></div>
            </div>
            <div className="portal-comp-summary-item">
              <Shield size={16} />
              <div><span className="text-muted">Priority</span><br /><strong style={{ textTransform: 'capitalize' }}>{compliance.priority}</strong></div>
            </div>
            <div className="portal-comp-summary-item">
              <CreditCard size={16} />
              <div><span className="text-muted">Fee</span><br /><strong>{formatCurrency(compliance.price || 0)}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS TAB ── */}
      {activeTab === 'documents' && (
        <div>
          {documents.length === 0 ? (
            <div className="portal-doc-empty">
              <FileText size={48} />
              <h3>No documents yet</h3>
              <p>Documents will appear here as they are uploaded.</p>
            </div>
          ) : (
            <div className="portal-doc-file-list">
              {documents.map((doc: any) => (
                <div key={doc.id} className="portal-doc-file-row">
                  <div className="portal-doc-file-icon"><FileText size={20} /></div>
                  <div className="portal-doc-file-info">
                    <span className="portal-doc-file-name">{doc.file_name}</span>
                    <span className="portal-doc-file-meta">{doc.uploaded_by_name} · {formatDate(doc.created_at)}</span>
                  </div>
                  <span className={`badge ${doc.status === 'signed' ? 'badge-green' : doc.status === 'viewed' ? 'badge-blue' : 'badge-gray'}`}>{doc.status}</span>
                  <div className="portal-doc-file-actions">
                    <button className="btn btn-ghost btn-sm"><Eye size={16} /></button>
                    <button className="btn btn-ghost btn-sm"><Download size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === 'chat' && (
        <div>
          {chatThreads.length === 0 ? (
            <div className="portal-doc-empty">
              <MessageSquare size={48} />
              <h3>No conversations yet</h3>
              <p>Your firm will start a conversation when needed.</p>
            </div>
          ) : chatThreads.map((thread: any) => (
            <Link key={thread.id} href="/portal/chats" className="portal-chat-preview-item" style={{ display: 'flex', padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
              <div className="portal-chat-preview-avatar">{thread.subject?.substring(0, 2).toUpperCase()}</div>
              <div className="portal-chat-preview-info">
                <span className="portal-chat-preview-subject">{thread.subject}</span>
                <span className="portal-chat-preview-msg">Last activity: {formatDate(thread.last_message_at)}</span>
              </div>
              {thread.unread_count > 0 && <div className="portal-chat-preview-badge">{thread.unread_count}</div>}
            </Link>
          ))}
        </div>
      )}

      {/* ── BILLING TAB ── */}
      {activeTab === 'billing' && (
        <div>
          {invoices.length === 0 ? (
            <div className="portal-doc-empty">
              <CreditCard size={48} />
              <h3>No invoices for this compliance</h3>
            </div>
          ) : (
            <div className="portal-invoice-list">
              {invoices.map((inv: any) => (
                <div key={inv.id} className={`portal-invoice-card ${inv.status === 'overdue' ? 'overdue' : ''}`}>
                  <div className="portal-invoice-card-main">
                    <div className="portal-invoice-card-left">
                      <div className="portal-invoice-number">#{inv.invoice_number}</div>
                      <div className="portal-invoice-desc">{inv.description}</div>
                    </div>
                    <div className="portal-invoice-card-right">
                      <div className="portal-invoice-amount">{formatCurrency(inv.total_amount)}</div>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-green' : inv.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>{inv.status}</span>
                      {['sent', 'overdue'].includes(inv.status) && (
                        <button className="btn btn-primary btn-sm" onClick={() => alert('Pay now (Demo)')}><DollarSign size={14} /> Pay</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
