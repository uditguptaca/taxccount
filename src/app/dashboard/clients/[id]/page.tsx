'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, FolderKanban, FileText, DollarSign, MessageSquare, Eye, PenTool, Plus, ChevronRight, ChevronLeft, Check, Users, User, Bell, Repeat, Calendar, Layers, Network, Link2, FolderOpen, Upload, Shield, CheckCircle, XCircle, Clock, Download, ChevronDown, UploadCloud, History, Building2, UserCircle, ExternalLink, AlertTriangle, Receipt } from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function timeAgo(d: string) { const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (mins < 1) return 'now'; if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; }
function fileSize(b: number) { return b > 1000000 ? `${(b / 1000000).toFixed(1)} MB` : `${Math.round(b / 1000)} KB`; }

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ contact_name: '', relationship: '', email: '', phone: '', is_primary: false, can_login: false });
  const [editForm, setEditForm] = useState<any>({});
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ linked_client_id: '', role: '' });
  const [allClients, setAllClients] = useState<any[]>([]);
  const [linkedCompliances, setLinkedCompliances] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ===== DOCUMENT MANAGEMENT STATE =====
  const [docData, setDocData] = useState<any>(null);
  const [docExpandedYear, setDocExpandedYear] = useState<string | null>(null);
  const [docExpandedFolder, setDocExpandedFolder] = useState<string | null>(null);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [docUploadTarget, setDocUploadTarget] = useState<{ category: string; year: string; label: string }>({ category: 'client_supporting', year: 'Permanent', label: 'Permanent Documents' });
  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);

  // ===== ADD COMPLIANCE WIZARD =====
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [templates, setTemplates] = useState<any[]>([]);
  const [assignables, setAssignables] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [wizardForm, setWizardForm] = useState({
    template_id: '',
    financial_year: String(new Date().getFullYear()),
    period_label: '',
    due_date: '',
    price: '',
    assignee_type: 'unassigned' as string,
    assignee_id: '' as string,
    is_recurring: false,
    rec_freq: 'yearly',
    rec_interval: 1,
    rec_until: '',
    reminder_rules: [] as any[],
    question_answers: [] as any[],
  });
  const [newReminder, setNewReminder] = useState({ offset_value: 30, offset_unit: 'days', channel: 'both' as string });
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);

  const loadClient = () => fetch(`/api/clients/${id}`).then(r => r.json()).then(d => {
    setData(d);
    if (d.client) setEditForm({ display_name: d.client.display_name || '', client_type_id: d.client.client_type_id || '', primary_email: d.client.primary_email || '', primary_phone: d.client.primary_phone || '', address_line_1: d.client.address_line_1 || '', city: d.client.city || '', province: d.client.province || '', postal_code: d.client.postal_code || '', status: d.client.status || 'active', notes: d.client.notes || '' });
  }).catch(console.error);

  const loadDocData = () => fetch(`/api/clients/${id}/documents`).then(r => r.json()).then(setDocData).catch(console.error);

  const handleDocUpload = async () => {
    if (!docUploadFile) return;
    setDocUploading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const formData = new FormData();
    formData.append('file', docUploadFile);
    formData.append('client_id', id as string);
    formData.append('document_category', docUploadTarget.category);
    formData.append('financial_year', docUploadTarget.year);
    formData.append('uploaded_by', user.id || 'system');
    await fetch('/api/documents', { method: 'POST', body: formData });
    setDocUploading(false);
    setShowDocUploadModal(false);
    setDocUploadFile(null);
    loadDocData();
    loadClient();
  };

  const handleDocApproval = async (docId: string, status: string) => {
    if (!confirm(`Mark this document as ${status}?`)) return;
    await fetch(`/api/documents/${docId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approval_status: status }) });
    loadDocData();
  };

  const loadRelationships = () => fetch(`/api/clients/${id}/relationships`).then(r => r.json()).then(async d => {
    if (d.relationships) {
      setRelationships(d.relationships);
      // Fetch compliances for each linked entity
      const linkedComps: any[] = [];
      for (const rel of d.relationships) {
        try {
          const res = await fetch(`/api/clients/${rel.client_id}`);
          const clientData = await res.json();
          if (clientData.engagements?.length > 0) {
            linkedComps.push({
              client_id: rel.client_id,
              display_name: clientData.client?.display_name || rel.display_name,
              client_type: clientData.client?.client_type_name || rel.client_type_name || clientData.client?.client_type || 'Entity',
              client_code: clientData.client?.client_code || rel.client_code,
              role: rel.role,
              engagements: clientData.engagements,
            });
          }
        } catch {}  
      }
      setLinkedCompliances(linkedComps);
    }
  });

  useEffect(() => { 
    setCurrentUser(JSON.parse(localStorage.getItem('user') || '{}'));
    loadClient(); 
    loadRelationships();
    loadDocData();
    fetch('/api/settings/client-types').then(r => r.json()).then(d => setClientTypes(d.types || [])).catch(console.error);
  }, [id]);

  const loadAllClients = () => {
    if (allClients.length === 0) {
      fetch('/api/clients').then(r => r.json()).then(d => setAllClients(d.clients || [])).catch(console.error);
    }
  };

  const openWizard = () => {
    setShowWizard(true);
    setWizardStep(1);
    setSelectedTemplate(null);
    setCreateResult(null);
    setWizardForm({ template_id: '', financial_year: String(new Date().getFullYear()), period_label: '', due_date: '', price: '', assignee_type: 'unassigned', assignee_id: '', is_recurring: false, rec_freq: 'yearly', rec_interval: 1, rec_until: '', reminder_rules: [], question_answers: [] });
    fetch('/api/templates').then(r => r.json()).then(d => setTemplates(d.templates || [])).catch(console.error);
    fetch('/api/teams/assignables').then(r => r.json()).then(d => setAssignables(d.assignables || [])).catch(console.error);
  };

  const selectTemplate = (t: any) => {
    setSelectedTemplate(t);
    setWizardForm(f => ({
      ...f,
      template_id: t.id,
      price: t.default_price?.toString() || '',
      assignee_type: t.assignee_type || 'unassigned',
      assignee_id: t.default_assignee_id || '',
      is_recurring: !!t.is_recurring_default,
      rec_freq: t.default_recurrence_rule?.match(/FREQ=(\w+)/)?.[1]?.toLowerCase() || 'yearly',
      rec_interval: parseInt(t.default_recurrence_rule?.match(/INTERVAL=(\d+)/)?.[1] || '1'),
      reminder_rules: (t.reminder_rules || []).map((r: any) => ({ offset_value: r.offset_value, offset_unit: r.offset_unit, channel: r.channel, recipient_scope: r.recipient_scope })),
      question_answers: (t.questions || []).map((q: any) => ({ ...q, answer_text: '' })),
    }));
    setWizardStep(2);
  };

  const handleCreateCompliance = async () => {
    setCreating(true);
    const rrule = wizardForm.is_recurring ? `FREQ=${wizardForm.rec_freq.toUpperCase()};INTERVAL=${wizardForm.rec_interval}` : null;
    const result = await fetch(`/api/clients/${id}/engagements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: wizardForm.template_id,
        financial_year: wizardForm.financial_year,
        period_label: wizardForm.period_label || `FY ${wizardForm.financial_year}`,
        due_date: wizardForm.due_date,
        price: wizardForm.price ? parseFloat(wizardForm.price) : null,
        assignee_type: wizardForm.assignee_type,
        assignee_id: wizardForm.assignee_id || null,
        is_recurring: wizardForm.is_recurring,
        recurrence_rule: rrule,
        recurrence_start: wizardForm.due_date,
        recurrence_until: wizardForm.rec_until || null,
        reminder_rules: wizardForm.reminder_rules,
        question_answers: wizardForm.question_answers.filter((q: any) => q.answer_text),
      }),
    }).then(r => r.json());
    setCreateResult(result);
    setCreating(false);
    if (result.success) { loadClient(); setWizardStep(9); }
  };

  async function handleSaveClient(e: React.FormEvent) { e.preventDefault(); await fetch(`/api/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) }); setShowEditModal(false); loadClient(); }
  async function handleArchiveClient() { if (!confirm('Archive this client?')) return; await fetch(`/api/clients/${id}`, { method: 'DELETE' }); window.location.href = '/dashboard/clients'; }
  async function handleCreateContact(e: React.FormEvent) { e.preventDefault(); await fetch(`/api/clients/${id}/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contactForm) }); setShowContactModal(false); setContactForm({ contact_name: '', relationship: '', email: '', phone: '', is_primary: false, can_login: false }); loadClient(); }

  async function handleLinkEntity(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/clients/${id}/relationships`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkForm)
    });
    if (res.ok) {
      setShowLinkModal(false);
      setLinkForm({ linked_client_id: '', role: '' });
      loadRelationships();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to link entities');
    }
  }

  async function handleUnlink(linkId: string) {
    if (!confirm('Remove this relationship link?')) return;
    await fetch(`/api/clients/${id}/relationships?link_id=${linkId}`, { method: 'DELETE' });
    loadRelationships();
  }

  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading...</div>;
  const { client, personalInfo, engagements, tags, invoices, documents, threads, summary, contacts } = data;
  const typeLabel: Record<string, string> = { individual: 'Individual', business: 'Business', trust: 'Trust', sole_proprietor: 'Sole Proprietor' };
  const statusBadge = (st: string) => { const m: Record<string, string> = { paid: 'badge-green', unpaid: 'badge-yellow', overdue: 'badge-red', draft: 'badge-gray', sent: 'badge-blue', partially_paid: 'badge-cyan', cancelled: 'badge-gray' }; return <span className={`badge ${m[st] || 'badge-gray'}`}><span className="badge-dot"></span>{st.replace('_', ' ')}</span>; };
  const filteredAssignables = assignables.filter(a => wizardForm.assignee_type === 'team' ? a.type === 'team' : wizardForm.assignee_type === 'member' ? a.type === 'member' : false);

  const WIZARD_STEPS = ['Template', 'Preview', 'Details', 'Recurrence', 'Reminders', 'Assignment', 'Questions', 'Confirm'];

  return (
    <>
      <Link href="/dashboard/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}><ArrowLeft size={16} /> Back to Clients</Link>

      {/* Client Header */}
      <div className="card" style={{ marginBottom: relationships.length > 0 ? 'var(--space-3)' : 'var(--space-6)' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{client.display_name}</h1>
              <span className={`badge ${client.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{client.status}</span>
              <span className="badge badge-gray">{client.client_type_name || client.client_type}</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-6)', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><FileText size={14} /> {client.client_code}</span>
              {client.primary_email && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Mail size={14} /> {client.primary_email}</span>}
              {client.primary_phone && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Phone size={14} /> {client.primary_phone}</span>}
              {client.city && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><MapPin size={14} /> {[client.city, client.province].filter(Boolean).join(', ')}</span>}
            </div>
            {tags?.length > 0 && <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>{tags.map((tag: any, i: number) => <span key={i} className="tag" style={{ background: tag.color + '20', color: tag.color }}>{tag.name}</span>)}</div>}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}><PenTool size={16} /> Edit Client</button>
            <button className="btn btn-primary" onClick={openWizard}><Plus size={16} /> Add Compliance</button>
          </div>
        </div>
      </div>

      {/* ===== LINKED ACCOUNTS BANNER ===== */}
      {relationships.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-3) var(--space-4)', background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Network size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>Linked Accounts</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {relationships.map((r: any) => {
              const typeIcon = (r.client_type_name || '').toLowerCase();
              const isBusiness = typeIcon.includes('business') || typeIcon.includes('corp') || typeIcon.includes('company');
              const isTrust = typeIcon.includes('trust');
              return (
                <Link key={r.link_id} href={`/dashboard/clients/${r.client_id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit', transition: 'all 0.15s', cursor: 'pointer' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.15)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gray-200)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isBusiness ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : isTrust ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isBusiness ? <Building2 size={14} /> : isTrust ? <Shield size={14} /> : <UserCircle size={14} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.display_name}</div>
                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{r.role}</span>
                      <span>·</span>
                      <span>{r.client_type_name || 'Individual'}</span>
                    </div>
                  </div>
                  <ExternalLink size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[{ key: 'overview', label: 'Overview' }, { key: 'compliances', label: 'Compliances' }, { key: 'entities', label: 'Linked Entities' }, { key: 'communications', label: 'Communications' }, { key: 'invoices', label: 'Invoices' }, { key: 'documents', label: 'Documents' }, { key: 'personal_info', label: 'Other Info' }].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}
            {t.key === 'invoices' && invoices?.length > 0 && <span className="badge badge-gray" style={{ marginLeft: 6, fontSize: 10 }}>{invoices.length}</span>}
            {t.key === 'documents' && documents?.length > 0 && <span className="badge badge-gray" style={{ marginLeft: 6, fontSize: 10 }}>{documents.length}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (<>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div className="kpi-card"><div className="kpi-icon blue"><FolderKanban size={22} /></div><div className="kpi-label">Active Projects</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{summary?.active_projects || 0}</div></div>
          <div className="kpi-card"><div className="kpi-icon green"><DollarSign size={22} /></div><div className="kpi-label">Total Billed</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{formatCurrency(summary?.total_billed)}</div></div>
          <div className="kpi-card"><div className="kpi-icon yellow"><DollarSign size={22} /></div><div className="kpi-label">Outstanding</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)', color: summary?.outstanding > 0 ? 'var(--color-danger)' : 'inherit' }}>{formatCurrency(summary?.outstanding)}</div></div>
          <div className="kpi-card"><div className="kpi-icon blue"><FileText size={22} /></div><div className="kpi-label">Documents</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{summary?.total_documents || 0}</div></div>
        </div>
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><h3>Compliance Engagements</h3></div>
          <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Compliance</th><th>Year</th><th>Stage</th><th>Due Date</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>{(engagements || []).slice(0, 5).map((e: any) => (
              <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/projects/${e.id}`}>
                <td><span className="client-name">{e.template_name}</span><br /><span className="text-xs text-muted">{e.engagement_code}</span></td>
                <td className="text-sm">{e.financial_year}</td><td className="text-sm">{e.current_stage || '—'}</td><td className="text-sm">{formatDate(e.due_date)}</td>
                <td className="text-sm">{formatCurrency(e.price)}</td>
                <td><span className={`badge ${e.status === 'completed' ? 'badge-green' : e.status === 'new' ? 'badge-gray' : 'badge-blue'}`}><span className="badge-dot"></span>{e.status}</span></td>
              </tr>
            ))}</tbody></table></div>
        </div>
        {invoices?.length > 0 && (<div className="card"><div className="card-header"><h3>Recent Invoices</h3><button className="btn btn-ghost btn-sm" onClick={() => setTab('invoices')}>View all</button></div>
          <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Invoice</th><th>Status</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead>
            <tbody>{invoices.slice(0, 3).map((inv: any) => (
              <tr key={inv.id}><td><span className="client-name">{inv.invoice_number}</span><br /><span className="text-xs text-muted">{formatDate(inv.issued_date)}</span></td>
                <td>{statusBadge(inv.status)}</td><td className="text-sm">{formatCurrency(inv.total_amount)}</td><td className="text-sm">{formatCurrency(inv.paid_amount)}</td>
                <td className="text-sm" style={{ fontWeight: 600, color: inv.total_amount - inv.paid_amount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatCurrency(inv.total_amount - inv.paid_amount)}</td></tr>
            ))}</tbody></table></div></div>)}
      </>)}

      {/* ===== COMPLIANCES TAB — YEAR-WISE TIMELINE ===== */}
      {tab === 'compliances' && (() => {
        const currentYear = new Date().getFullYear();
        const now = new Date();

        // Helper to categorize and group engagements by year
        const groupByYear = (engs: any[]) => {
          const years: Record<string, any[]> = {};
          (engs || []).forEach(e => {
            const y = e.financial_year || 'Unknown';
            if (!years[y]) years[y] = [];
            years[y].push(e);
          });
          return Object.entries(years).sort(([a], [b]) => parseInt(b) - parseInt(a));
        };

        const getTimePeriod = (year: string) => {
          const y = parseInt(year);
          if (isNaN(y)) return 'current';
          if (y > currentYear) return 'future';
          if (y === currentYear) return 'current';
          return 'past';
        };

        const isOverdue = (dueDate: string, status: string) => {
          if (!dueDate || status === 'completed') return false;
          return new Date(dueDate) < now;
        };

        const daysUntilDue = (dueDate: string) => {
          if (!dueDate) return null;
          const diff = Math.ceil((new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diff;
        };

        // Find related docs and invoices for each engagement
        const getDocCount = (engCode: string) => (documents || []).filter((d: any) => d.engagement_code === engCode).length;
        const getInvoice = (engId: string) => (invoices || []).find((inv: any) => inv.engagement_id === engId);

        // KPI totals for own engagements
        const allOwn = engagements || [];
        const totalPrice = allOwn.reduce((s: number, e: any) => s + (e.price || 0), 0);
        const completedCount = allOwn.filter((e: any) => e.status === 'completed').length;
        const activeCount = allOwn.filter((e: any) => e.status !== 'completed').length;
        const overdueCount = allOwn.filter((e: any) => isOverdue(e.due_date, e.status)).length;

        const ownYears = groupByYear(allOwn);

        // Render an engagement row with the enhanced layout
        const EngRow = ({ e }: { e: any }) => {
          const overdue = isOverdue(e.due_date, e.status);
          const daysLeft = daysUntilDue(e.due_date);
          const docCount = getDocCount(e.engagement_code);
          const inv = getInvoice(e.id);
          return (
            <tr key={e.id} style={{ cursor: 'pointer', background: overdue ? 'rgba(239,68,68,0.03)' : 'transparent' }} onClick={() => window.location.href = `/dashboard/projects/${e.id}`}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {overdue && <AlertTriangle size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
                  <div>
                    <span className="client-name">{e.template_name}</span><br />
                    <span className="text-xs text-muted">{e.engagement_code}</span>
                  </div>
                </div>
              </td>
              <td className="text-sm">{e.current_stage || '—'}</td>
              <td className="text-sm">{e.assigned_to || '—'}</td>
              <td className="text-sm">
                <div>{formatDate(e.due_date)}</div>
                {overdue && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-danger)' }}>OVERDUE</span>}
                {!overdue && daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-warning)' }}>{daysLeft}d left</span>
                )}
              </td>
              <td className="text-sm" style={{ fontWeight: 600 }}>{formatCurrency(e.price || 0)}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                  <span className={`badge ${e.status === 'completed' ? 'badge-green' : e.status === 'new' ? 'badge-gray' : overdue ? 'badge-red' : 'badge-blue'}`}>
                    <span className="badge-dot"></span>{overdue && e.status !== 'completed' ? 'overdue' : e.status}
                  </span>
                  {inv && (
                    <span className={`badge ${inv.status === 'paid' ? 'badge-green' : inv.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`} style={{ fontSize: 10 }}>
                      <DollarSign size={10} /> {inv.status === 'paid' ? 'Paid' : inv.status === 'overdue' ? 'Payment Overdue' : 'Unpaid'}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  {docCount > 0 && (
                    <span className="badge badge-blue" style={{ fontSize: 10 }} title={`${docCount} linked documents`}>
                      <FileText size={10} /> {docCount}
                    </span>
                  )}
                  <ExternalLink size={14} style={{ color: 'var(--color-gray-400)' }} />
                </div>
              </td>
            </tr>
          );
        };

        // Render a year section
        const YearSection = ({ year, engs, defaultExpanded }: { year: string; engs: any[]; defaultExpanded: boolean }) => {
          const period = getTimePeriod(year);
          const yearOverdue = engs.filter((e: any) => isOverdue(e.due_date, e.status)).length;
          const yearCompleted = engs.filter((e: any) => e.status === 'completed').length;
          const yearTotal = engs.reduce((s: number, e: any) => s + (e.price || 0), 0);
          const periodColor = period === 'past' ? 'var(--color-gray-500)' : period === 'future' ? '#8b5cf6' : 'var(--color-primary)';
          const periodBg = period === 'past' ? 'var(--color-gray-50)' : period === 'future' ? 'rgba(139,92,246,0.05)' : 'rgba(99,102,241,0.05)';
          const periodLabel = period === 'past' ? 'Completed' : period === 'future' ? 'Upcoming' : 'Active';
          const [expanded, setExpanded] = useState(defaultExpanded);

          return (
            <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: periodBg, cursor: 'pointer' }}
                onClick={() => setExpanded(!expanded)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: period === 'past' ? 'var(--color-gray-200)' : period === 'future' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, var(--color-primary), #4f46e5)', color: period === 'past' ? 'var(--color-gray-600)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>
                    {year === 'Unknown' ? '?' : year.slice(-2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>FY {year}</div>
                    <div className="text-xs text-muted">{engs.length} compliance task{engs.length !== 1 ? 's' : ''} · {formatCurrency(yearTotal)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className={`badge ${period === 'past' ? 'badge-gray' : period === 'future' ? 'badge-cyan' : 'badge-blue'}`} style={{ fontSize: 10 }}>{periodLabel}</span>
                  {yearCompleted > 0 && <span className="badge badge-green" style={{ fontSize: 10 }}><CheckCircle size={10} /> {yearCompleted}</span>}
                  {yearOverdue > 0 && <span className="badge badge-red" style={{ fontSize: 10, color: 'var(--color-danger)' }}><AlertTriangle size={10} /> {yearOverdue} overdue</span>}
                  <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                </div>
              </div>
              {expanded && (
                <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="data-table text-sm">
                    <thead><tr><th>Compliance</th><th>Stage</th><th>Assigned</th><th>Due Date</th><th>Price</th><th>Status</th><th style={{ width: 80 }}>Links</th></tr></thead>
                    <tbody>{engs.map((e: any) => <EngRow key={e.id} e={e} />)}</tbody>
                  </table>
                </div>
              )}
            </div>
          );
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* ── ENTITY HEADER ── */}
            <div className="card">
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCircle size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{client.display_name}</h3>
                    <span className="text-sm text-muted">{client.client_type_name || client.client_type} · {client.client_code}</span>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={openWizard}><Plus size={16} /> Add Compliance</button>
              </div>
            </div>

            {/* ── KPI SUMMARY ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{allOwn.length}</div>
                <div className="text-xs text-muted">Total Tasks</div>
              </div>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{activeCount}</div>
                <div className="text-xs text-muted">Active</div>
              </div>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-success)' }}>{completedCount}</div>
                <div className="text-xs text-muted">Completed</div>
              </div>
              <div style={{ padding: 'var(--space-3)', background: overdueCount > 0 ? 'rgba(239,68,68,0.05)' : 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-gray-400)' }}>{overdueCount}</div>
                <div className="text-xs text-muted">Overdue</div>
              </div>
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(totalPrice)}</div>
                <div className="text-xs text-muted">Total Value</div>
              </div>
            </div>

            {/* ── YEAR-WISE SECTIONS ── */}
            {ownYears.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
                <FolderKanban size={40} style={{ marginBottom: 8 }} />
                <h3>No Compliance Tasks</h3>
                <p className="text-sm">Click "Add Compliance" to create the first engagement for this client.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {ownYears.map(([year, engs]) => (
                  <YearSection key={year} year={year} engs={engs} defaultExpanded={getTimePeriod(year) === 'current' || getTimePeriod(year) === 'future'} />
                ))}
              </div>
            )}

            {/* ── LINKED ENTITIES COMPLIANCES (also year-grouped) ── */}
            {linkedCompliances.map((lc: any) => {
              const isBusiness = (lc.client_type || '').toLowerCase().includes('business') || (lc.client_type || '').toLowerCase().includes('corp');
              const isTrust = (lc.client_type || '').toLowerCase().includes('trust');
              const avatarBg = isBusiness ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : isTrust ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, #f59e0b, #d97706)';
              const EntityIcon = isBusiness ? Building2 : isTrust ? Shield : Users;
              const lcYears = groupByYear(lc.engagements);

              return (
                <div key={lc.client_id} style={{ marginTop: 'var(--space-4)' }}>
                  {/* Linked Entity Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', border: '1px solid var(--color-gray-200)', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarBg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EntityIcon size={16} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {lc.display_name}
                          <span className="badge badge-gray" style={{ fontSize: 10 }}>{lc.role}</span>
                        </h3>
                        <span className="text-xs text-muted">{lc.client_type} · {lc.client_code}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/clients/${lc.client_id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExternalLink size={14} /> View Account
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', border: '1px solid var(--color-gray-200)', borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: 'var(--space-3)' }}>
                    {lcYears.map(([year, engs]) => (
                      <YearSection key={year} year={year} engs={engs} defaultExpanded={getTimePeriod(year) === 'current'} />
                    ))}
                  </div>
                </div>
              );
            })}

            {linkedCompliances.length === 0 && relationships.length > 0 && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)' }}>
                <Network size={20} style={{ marginBottom: 4 }} /><br />
                Linked accounts have no active compliances.
              </div>
            )}
          </div>
        );
      })()}

      {/* Other tabs remain the same */}
      {tab === 'communications' && (<div className="card"><div className="card-header"><h3>Chat Threads</h3></div>{threads?.length > 0 ? <div>{threads.map((t: any) => (<div key={t.id} className="inbox-item" onClick={() => window.location.href = '/dashboard/messages'}><div className={`inbox-item-icon ${t.thread_type === 'internal' ? 'task' : 'message'}`}><MessageSquare size={20} /></div><div className="inbox-item-content"><div className="inbox-item-title">{t.subject}</div><div className="inbox-item-subtitle">{t.last_message?.slice(0, 80)}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>{t.thread_type === 'internal' && <span className="badge badge-yellow">Internal</span>}<span className="inbox-item-time">{timeAgo(t.last_message_at)}</span></div></div>))}</div> : <div className="empty-state"><MessageSquare size={48} /><h3>No conversations</h3></div>}</div>)}
      {tab === 'invoices' && (<div className="card"><div className="card-header"><h3>Invoices</h3></div>{invoices?.length > 0 ? <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Invoice</th><th>Engagement</th><th>Status</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead><tbody>{invoices.map((inv: any) => (<tr key={inv.id}><td><span className="client-name">{inv.invoice_number}</span></td><td className="text-xs text-muted">{inv.engagement_code || '—'}</td><td>{statusBadge(inv.status)}</td><td className="text-sm">{formatDate(inv.issued_date)}</td><td className="text-sm">{formatCurrency(inv.total_amount)}</td><td className="text-sm">{formatCurrency(inv.paid_amount)}</td><td className="text-sm" style={{ fontWeight: 600, color: inv.total_amount - inv.paid_amount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatCurrency(inv.total_amount - inv.paid_amount)}</td></tr>))}</tbody></table></div> : <div className="empty-state"><DollarSign size={48} /><h3>No invoices</h3></div>}</div>)}
      {/* ===== STRUCTURED DOCUMENT MANAGEMENT TAB ===== */}
      {tab === 'documents' && (
        <div>
          {/* Doc Summary KPIs */}
          {docData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              <div className="kpi-card"><div className="kpi-icon blue"><FileText size={18} /></div><div className="kpi-label">Total</div><div className="kpi-value">{docData.summary?.totalDocs || 0}</div></div>
              <div className="kpi-card"><div className="kpi-icon green"><Shield size={18} /></div><div className="kpi-label">Permanent</div><div className="kpi-value">{docData.summary?.permanentCount || 0}</div></div>
              <div className="kpi-card"><div className="kpi-icon yellow"><Clock size={18} /></div><div className="kpi-label">Pending</div><div className="kpi-value">{docData.summary?.pendingApproval || 0}</div></div>
              <div className="kpi-card"><div className="kpi-icon green"><CheckCircle size={18} /></div><div className="kpi-label">Approved</div><div className="kpi-value">{docData.summary?.approved || 0}</div></div>
              <div className="kpi-card"><div className="kpi-icon red" style={{ background: 'var(--color-red-50, #fef2f2)', color: 'var(--color-danger)' }}><XCircle size={18} /></div><div className="kpi-label">Rejected</div><div className="kpi-value">{docData.summary?.rejected || 0}</div></div>
            </div>
          )}

          {/* ── PERMANENT DOCUMENTS FOLDER ── */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-header" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))' }}
              onClick={() => setDocExpandedYear(docExpandedYear === 'Permanent' ? null : 'Permanent')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>Permanent Documents</h3>
                  <span className="text-xs text-muted">IDs, Registration Certificates, & Non-Year-Specific Files</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="badge badge-blue">{docData?.permanentDocs?.length || 0} files</span>
                <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setDocUploadTarget({ category: 'permanent', year: 'Permanent', label: 'Permanent Documents' }); setShowDocUploadModal(true); }}>
                  <Upload size={14} /> Upload
                </button>
                <ChevronDown size={18} style={{ transform: docExpandedYear === 'Permanent' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
              </div>
            </div>
            {docExpandedYear === 'Permanent' && (
              <div className="card-body" style={{ padding: 0 }}>
                {(!docData?.permanentDocs || docData.permanentDocs.length === 0) ? (
                  <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                    <Shield size={36} style={{ marginBottom: 'var(--space-2)' }} />
                    <p style={{ margin: 0 }}>No permanent documents uploaded yet.</p>
                    <p className="text-xs text-muted">Upload Government IDs, Business Registration Papers, SIN, etc.</p>
                  </div>
                ) : (
                  <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="data-table">
                      <thead><tr><th>Document</th><th>Uploaded</th><th>By</th><th>Approval</th><th style={{ width: 120 }}>Actions</th></tr></thead>
                      <tbody>
                        {docData.permanentDocs.map((d: any) => (
                          <tr key={d.id}>
                            <td>
                              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FileText size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                {d.file_name}
                              </div>
                              <div className="text-xs text-muted">{fileSize(d.file_size_bytes)} · {d.mime_type}</div>
                            </td>
                            <td className="text-sm">{formatDate(d.created_at)}</td>
                            <td className="text-sm">{d.uploaded_by_name || '—'}</td>
                            <td>
                              {d.approval_status === 'APPROVED' && <span className="badge badge-green"><CheckCircle size={12} /> Approved</span>}
                              {d.approval_status === 'REJECTED' && <span className="badge badge-red" style={{ color: 'var(--color-danger)', background: 'var(--color-red-50, #fef2f2)' }}><XCircle size={12} /> Rejected</span>}
                              {(!d.approval_status || d.approval_status === 'PENDING') && <span className="badge badge-yellow"><Clock size={12} /> Pending</span>}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                <a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-icon" title="Download"><Download size={14} /></a>
                                {d.approval_status !== 'APPROVED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-success)' }} title="Approve" onClick={() => handleDocApproval(d.id, 'APPROVED')}><Check size={14} /></button>}
                                {d.approval_status !== 'REJECTED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} title="Reject" onClick={() => handleDocApproval(d.id, 'REJECTED')}><XCircle size={14} /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── YEAR-WISE COMPLIANCE FOLDERS ── */}
          {(docData?.yearFolders || []).map((yf: any) => (
            <div key={yf.year} className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="card-header" style={{ cursor: 'pointer' }}
                onClick={() => setDocExpandedYear(docExpandedYear === yf.year ? null : yf.year)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                    {yf.year.slice(-2)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>FY {yf.year}</h3>
                    <span className="text-xs text-muted">Compliance documents for financial year {yf.year}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className="badge badge-gray">{yf.total} files</span>
                  {yf.auditTrail?.length > 0 && <span className="badge badge-cyan">{yf.auditTrail.length} audit entries</span>}
                  <ChevronDown size={18} style={{ transform: docExpandedYear === yf.year ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                </div>
              </div>

              {docExpandedYear === yf.year && (
                <div className="card-body" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

                  {/* Subfolders */}
                  {Object.entries(yf.subfolders).map(([key, sf]: [string, any]) => (
                    <div key={key} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', cursor: 'pointer' }}
                        onClick={() => setDocExpandedFolder(docExpandedFolder === `${yf.year}-${key}` ? null : `${yf.year}-${key}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <FolderOpen size={16} style={{ color: key === 'onboarding' ? '#f59e0b' : key === 'client_provided' ? '#3b82f6' : '#10b981' }} />
                          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{sf.label}</span>
                          <span className="badge badge-gray" style={{ fontSize: 10 }}>{sf.docs.length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <button className="btn btn-ghost btn-sm" onClick={(e) => {
                            e.stopPropagation();
                            setDocUploadTarget({ category: key === 'onboarding' ? 'onboarding' : key === 'client_provided' ? 'client_supporting' : 'final_document', year: yf.year, label: `${sf.label} — FY ${yf.year}` });
                            setShowDocUploadModal(true);
                          }}><Upload size={14} /> Upload</button>
                          <ChevronDown size={16} style={{ transform: docExpandedFolder === `${yf.year}-${key}` ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--color-gray-400)' }} />
                        </div>
                      </div>

                      {docExpandedFolder === `${yf.year}-${key}` && (
                        <div style={{ padding: 0 }}>
                          {sf.docs.length === 0 ? (
                            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
                              No documents in this folder yet.
                            </div>
                          ) : (
                            <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                              <table className="data-table text-sm">
                                <thead><tr><th>Document</th><th>Compliance</th><th>Uploaded</th><th>Approval</th><th style={{ width: 130 }}>Actions</th></tr></thead>
                                <tbody>
                                  {sf.docs.map((d: any) => (
                                    <tr key={d.id}>
                                      <td>
                                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                          <FileText size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                          {d.file_name}
                                          {d.is_internal_only === 1 && <span className="badge badge-gray" style={{ fontSize: 9 }}>Internal</span>}
                                        </div>
                                        <span className="text-xs text-muted">{fileSize(d.file_size_bytes)}</span>
                                      </td>
                                      <td className="text-xs">{d.engagement_code ? <><span style={{ fontWeight: 500 }}>{d.engagement_code}</span><br /><span className="text-muted">{d.template_name}</span></> : <span className="text-muted">—</span>}</td>
                                      <td><span className="text-xs">{formatDate(d.created_at)}</span><br /><span className="text-xs text-muted">{d.uploaded_by_name}</span></td>
                                      <td>
                                        {d.approval_status === 'APPROVED' && <span className="badge badge-green"><CheckCircle size={11} /> Approved</span>}
                                        {d.approval_status === 'REJECTED' && <span className="badge badge-red" style={{ color: 'var(--color-danger)', background: 'var(--color-red-50, #fef2f2)' }}><XCircle size={11} /> Rejected</span>}
                                        {(!d.approval_status || d.approval_status === 'PENDING') && <span className="badge badge-yellow"><Clock size={11} /> Pending</span>}
                                      </td>
                                      <td>
                                        <div style={{ display: 'flex', gap: 2 }}>
                                          <a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-icon" title="Download"><Download size={14} /></a>
                                          {d.approval_status !== 'APPROVED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-success)' }} title="Approve" onClick={() => handleDocApproval(d.id, 'APPROVED')}><Check size={14} /></button>}
                                          {d.approval_status !== 'REJECTED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} title="Reject" onClick={() => handleDocApproval(d.id, 'REJECTED')}><XCircle size={14} /></button>}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Audit Trail Sub-section */}
                  <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', cursor: 'pointer' }}
                      onClick={() => setDocExpandedFolder(docExpandedFolder === `${yf.year}-audit` ? null : `${yf.year}-audit`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <History size={16} style={{ color: '#8b5cf6' }} />
                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Audit Trail</span>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{yf.auditTrail?.length || 0}</span>
                      </div>
                      <ChevronDown size={16} style={{ transform: docExpandedFolder === `${yf.year}-audit` ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--color-gray-400)' }} />
                    </div>
                    {docExpandedFolder === `${yf.year}-audit` && (
                      <div style={{ padding: 'var(--space-4)', maxHeight: 400, overflowY: 'auto' }}>
                        {(!yf.auditTrail || yf.auditTrail.length === 0) ? (
                          <div style={{ textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-4)' }}>No audit entries for this year.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {yf.auditTrail.map((a: any, i: number) => {
                              let details: any = {};
                              try { details = JSON.parse(a.details || '{}'); } catch {}
                              const actionLabel = (a.action || '').replace('DOCUMENT_', '').replace(/_/g, ' ');
                              const actionColor = a.action?.includes('APPROVED') ? 'var(--color-success)' : a.action?.includes('REJECTED') ? 'var(--color-danger)' : a.action?.includes('UPLOADED') ? 'var(--color-primary)' : 'var(--color-gray-500)';
                              return (
                                <div key={a.id || i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: i < yf.auditTrail.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: actionColor, marginTop: 6, flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                      <span style={{ fontWeight: 600, color: actionColor, textTransform: 'capitalize' }}>{actionLabel}</span>
                                      {details.file_name && <span className="text-muted"> — {details.file_name}</span>}
                                    </div>
                                    <div className="text-xs text-muted">
                                      {a.actor_name || 'System'} · {formatDate(a.created_at)}{a.created_at ? ` at ${new Date(a.created_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}` : ''}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          ))}

          {/* Empty state */}
          {docData && !docData.permanentDocs?.length && !docData.yearFolders?.length && (
            <div className="card">
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                <FolderOpen size={48} style={{ marginBottom: 'var(--space-3)' }} />
                <h3>No Documents Yet</h3>
                <p className="text-sm text-muted">Upload permanent documents or create a compliance engagement to start organizing documents.</p>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => { setDocUploadTarget({ category: 'permanent', year: 'Permanent', label: 'Permanent Documents' }); setShowDocUploadModal(true); }}><Upload size={16} /> Upload Permanent Document</button>
              </div>
            </div>
          )}

          {/* ── UPLOAD INTO FOLDER MODAL ── */}
          {showDocUploadModal && (
            <div className="modal-overlay" onClick={() => setShowDocUploadModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div className="modal-header">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><UploadCloud size={20} /> Upload Document</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowDocUploadModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                    <div className="text-xs text-muted">Uploading to</div>
                    <div style={{ fontWeight: 600 }}>{docUploadTarget.label}</div>
                  </div>
                  <div style={{ border: '2px dashed var(--color-gray-300)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', textAlign: 'center', background: 'var(--color-gray-50)' }}>
                    <UploadCloud size={36} style={{ color: 'var(--color-gray-400)' }} />
                    <p style={{ marginTop: 'var(--space-2)', fontWeight: 500 }}>{docUploadFile ? docUploadFile.name : 'Choose a file to upload'}</p>
                    <p className="text-xs text-muted">PDF, JPEG, PNG, XLSX, DOCX (Max 20MB)</p>
                    <input type="file" id="doc-folder-upload" style={{ display: 'none' }} onChange={e => setDocUploadFile(e.target.files?.[0] || null)} />
                    <label htmlFor="doc-folder-upload" className="btn btn-secondary" style={{ marginTop: 'var(--space-3)', cursor: 'pointer' }}>{docUploadFile ? 'Change File' : 'Browse Files'}</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => { setShowDocUploadModal(false); setDocUploadFile(null); }}>Cancel</button>
                  <button className="btn btn-primary" disabled={!docUploadFile || docUploading} onClick={handleDocUpload}>
                    {docUploading ? 'Uploading...' : <><Upload size={16} /> Upload</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === 'personal_info' && (<div className="card"><div className="card-header"><h3>Additional Information</h3></div><div className="card-body">{personalInfo?.length > 0 ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>{personalInfo.map((info: any) => (<div key={info.id} style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}><div className="text-xs text-muted" style={{ marginBottom: 'var(--space-1)' }}>{info.info_key}</div><div style={{ fontWeight: 500 }}>{info.is_sensitive ? '••••••••' : info.info_value}</div></div>))}</div> : <div className="empty-state"><p>No extra data added</p></div>}</div></div>)}
      
      {/* Linked Entities Graph UI */}
      {tab === 'entities' && (
        <div className="card">
          <div className="card-header">
            <h3>Linked Entities</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { loadAllClients(); setShowLinkModal(true); }}>
              <Link2 size={14} /> Link Client
            </button>
          </div>
          <div className="card-body">
            {relationships.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {relationships.map(r => (
                  <div key={r.link_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Network size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Link href={`/dashboard/clients/${r.client_id}`} className="client-name" style={{ color: 'var(--color-primary)' }}>{r.display_name}</Link>
                          <span className="badge badge-gray">{r.client_type_name || 'Individual'}</span>
                        </div>
                        <div className="text-sm text-muted" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <span>{r.client_code}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="badge badge-blue" style={{ fontSize: 'var(--font-size-sm)', padding: '4px 12px' }}>Role: {r.role}</span>
                      <button className="btn btn-ghost btn-sm text-danger" style={{ marginLeft: 'var(--space-4)' }} onClick={() => handleUnlink(r.link_id)}>Unlink</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Network size={48} />
                <h3>No Linked Entities</h3>
                <p>Connect this client to related businesses, family members, or holding companies in your CRM.</p>
                <button className="btn btn-outline" style={{ marginTop: 'var(--space-4)' }} onClick={() => { loadAllClients(); setShowLinkModal(true); }}>Link a Client</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ADD COMPLIANCE WIZARD MODAL ===== */}
      {showWizard && (
        <div className="modal-overlay" onClick={() => setShowWizard(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><FolderKanban size={20} /> Add Compliance</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowWizard(false)}>✕</button>
            </div>

            {/* Wizard Progress Bar */}
            {wizardStep <= 8 && (
              <div style={{ padding: 'var(--space-3) var(--space-6)', background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-100)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                  {WIZARD_STEPS.map((label, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: wizardStep > i + 1 ? 'var(--color-success)' : wizardStep === i + 1 ? 'var(--color-primary)' : 'var(--color-gray-200)', color: wizardStep >= i + 1 ? 'white' : 'var(--color-gray-500)' }}>
                        {wizardStep > i + 1 ? <Check size={12} /> : i + 1}
                      </div>
                      {i < WIZARD_STEPS.length - 1 && <div style={{ width: 16, height: 2, background: wizardStep > i + 1 ? 'var(--color-success)' : 'var(--color-gray-200)' }} />}
                    </div>
                  ))}
                </div>
                <div className="text-xs" style={{ marginTop: 4, fontWeight: 600, color: 'var(--color-primary)' }}>{WIZARD_STEPS[wizardStep - 1]}</div>
              </div>
            )}

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
              {/* STEP 1: Select Template */}
              {wizardStep === 1 && (
                <div>
                  <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>Choose a compliance template to apply to this client.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                    {templates.map(t => (
                      <div key={t.id} onClick={() => selectTemplate(t)} style={{ padding: 'var(--space-4)', border: '2px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')} onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-gray-200)')}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                        <span className="badge badge-gray" style={{ marginRight: 4 }}>{t.code}</span>
                        {t.category && <span className="badge badge-cyan">{t.category}</span>}
                        <div className="text-xs text-muted" style={{ marginTop: 8, display: 'flex', gap: 'var(--space-4)' }}>
                          <span><Layers size={12} /> {t.stage_count} stages</span>
                          <span><FileText size={12} /> {t.doc_count} docs</span>
                          {t.default_price > 0 && <span><DollarSign size={12} /> {formatCurrency(t.default_price)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Preview */}
              {wizardStep === 2 && selectedTemplate && (
                <div>
                  <h3 style={{ marginBottom: 'var(--space-3)' }}>Template: {selectedTemplate.name}</h3>
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <h4 className="text-sm" style={{ marginBottom: 'var(--space-2)' }}>Workflow Stages ({selectedTemplate.stages?.length || 0})</h4>
                    {(selectedTemplate.stages || []).map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2)', borderBottom: '1px solid var(--color-gray-100)' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{i + 1}</div>
                        <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{s.stage_name}</span>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{s.stage_group.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                  {selectedTemplate.reminder_rules?.length > 0 && (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                      <h4 className="text-sm" style={{ marginBottom: 'var(--space-2)' }}><Bell size={14} /> Default Reminders</h4>
                      {selectedTemplate.reminder_rules.map((r: any, i: number) => <div key={i} className="text-sm">{r.offset_value} {r.offset_unit} before due via {r.channel}</div>)}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Engagement Details */}
              {wizardStep === 3 && (
                <div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Financial Year *</label><input className="form-input" required value={wizardForm.financial_year} onChange={e => setWizardForm({ ...wizardForm, financial_year: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Period Label</label><input className="form-input" placeholder="e.g., FY 2025, Q1 2025" value={wizardForm.period_label} onChange={e => setWizardForm({ ...wizardForm, period_label: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Due Date *</label><input className="form-input" type="date" required value={wizardForm.due_date} onChange={e => setWizardForm({ ...wizardForm, due_date: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Price (CAD)</label><input className="form-input" type="number" step="0.01" value={wizardForm.price} onChange={e => setWizardForm({ ...wizardForm, price: e.target.value })} placeholder={selectedTemplate?.default_price?.toString() || '0'} /></div>
                  </div>
                </div>
              )}

              {/* STEP 4: Recurrence */}
              {wizardStep === 4 && (
                <div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                    <input type="checkbox" id="wiz_recurring" checked={wizardForm.is_recurring} onChange={e => setWizardForm({ ...wizardForm, is_recurring: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                    <label htmlFor="wiz_recurring" style={{ fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Repeat size={16} /> This compliance is recurring</label>
                  </div>
                  {wizardForm.is_recurring && (
                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                      <div className="form-row">
                        <div className="form-group"><label className="form-label">Repeat every</label><input className="form-input" type="number" min="1" value={wizardForm.rec_interval} onChange={e => setWizardForm({ ...wizardForm, rec_interval: parseInt(e.target.value) || 1 })} style={{ width: 80 }} /></div>
                        <div className="form-group"><label className="form-label">Frequency</label>
                          <select className="form-select" value={wizardForm.rec_freq} onChange={e => setWizardForm({ ...wizardForm, rec_freq: e.target.value })}>
                            <option value="daily">Day(s)</option><option value="weekly">Week(s)</option><option value="monthly">Month(s)</option><option value="yearly">Year(s)</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group"><label className="form-label">End Date (optional)</label><input className="form-input" type="date" value={wizardForm.rec_until} onChange={e => setWizardForm({ ...wizardForm, rec_until: e.target.value })} /></div>
                      <p className="text-xs text-muted" style={{ marginTop: 8 }}>Future engagements will be auto-generated by the scheduler.</p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Reminders */}
              {wizardStep === 5 && (
                <div>
                  <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Configure notifications before the due date.</p>
                  {wizardForm.reminder_rules.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }}>
                      <Bell size={14} style={{ color: 'var(--color-warning)' }} />
                      <span style={{ fontWeight: 500 }}>{r.offset_value} {r.offset_unit}</span> before due
                      <span className={`badge ${r.channel === 'email' ? 'badge-blue' : r.channel === 'in_app' ? 'badge-cyan' : 'badge-green'}`}>{r.channel}</span>
                      <div style={{ flex: 1 }} />
                      <button className="btn btn-ghost btn-sm" onClick={() => { const rr = [...wizardForm.reminder_rules]; rr.splice(i, 1); setWizardForm({ ...wizardForm, reminder_rules: rr }); }} style={{ color: 'var(--color-danger)' }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', marginTop: 'var(--space-3)' }}>
                    <div className="form-group" style={{ margin: 0 }}><label className="form-label text-xs">Offset</label><input className="form-input" type="number" min="1" value={newReminder.offset_value} onChange={e => setNewReminder({ ...newReminder, offset_value: parseInt(e.target.value) || 1 })} style={{ width: 70 }} /></div>
                    <div className="form-group" style={{ margin: 0 }}><label className="form-label text-xs">Unit</label><select className="form-select" value={newReminder.offset_unit} onChange={e => setNewReminder({ ...newReminder, offset_unit: e.target.value })} style={{ width: 90 }}><option value="days">Days</option><option value="weeks">Weeks</option></select></div>
                    <div className="form-group" style={{ margin: 0 }}><label className="form-label text-xs">Channel</label><select className="form-select" value={newReminder.channel} onChange={e => setNewReminder({ ...newReminder, channel: e.target.value })} style={{ width: 100 }}><option value="email">Email</option><option value="in_app">In-App</option><option value="both">Both</option></select></div>
                    <button className="btn btn-primary btn-sm" onClick={() => { setWizardForm({ ...wizardForm, reminder_rules: [...wizardForm.reminder_rules, { ...newReminder, recipient_scope: 'client' }] }); setNewReminder({ offset_value: 7, offset_unit: 'days', channel: 'both' }); }}>+ Add</button>
                  </div>
                </div>
              )}

              {/* STEP 6: Assignment */}
              {wizardStep === 6 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Assign work to</label>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      {(['unassigned', 'team', 'member'] as const).map(t => (
                        <button key={t} className={`btn ${wizardForm.assignee_type === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => setWizardForm({ ...wizardForm, assignee_type: t, assignee_id: '' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {t === 'team' ? <Users size={14} /> : t === 'member' ? <User size={14} /> : null}
                          {t === 'unassigned' ? 'Unassigned' : t === 'team' ? 'Team' : 'Individual'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {wizardForm.assignee_type !== 'unassigned' && (
                    <div className="form-group">
                      <label className="form-label">Select {wizardForm.assignee_type === 'team' ? 'Team' : 'Team Member'}</label>
                      <select className="form-select" value={wizardForm.assignee_id} onChange={e => setWizardForm({ ...wizardForm, assignee_id: e.target.value })}>
                        <option value="">Choose...</option>
                        {filteredAssignables.map(a => <option key={a.id} value={a.id}>{a.display_name} — {a.detail}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 7: Questions */}
              {wizardStep === 7 && (
                <div>
                  {wizardForm.question_answers.length === 0 ? (
                    <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No questions defined for this template. You can skip this step.</div>
                  ) : (
                    wizardForm.question_answers.map((q: any, i: number) => (
                      <div key={i} className="form-group">
                        <label className="form-label">{q.question_text} {q.is_required ? <span style={{ color: 'var(--color-danger)' }}>*</span> : ''}</label>
                        {q.question_type === 'text' && <input className="form-input" value={q.answer_text} onChange={e => { const qa = [...wizardForm.question_answers]; qa[i].answer_text = e.target.value; setWizardForm({ ...wizardForm, question_answers: qa }); }} />}
                        {q.question_type === 'date' && <input className="form-input" type="date" value={q.answer_text} onChange={e => { const qa = [...wizardForm.question_answers]; qa[i].answer_text = e.target.value; setWizardForm({ ...wizardForm, question_answers: qa }); }} />}
                        {q.question_type === 'number' && <input className="form-input" type="number" value={q.answer_text} onChange={e => { const qa = [...wizardForm.question_answers]; qa[i].answer_text = e.target.value; setWizardForm({ ...wizardForm, question_answers: qa }); }} />}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* STEP 8: Confirm */}
              {wizardStep === 8 && (
                <div>
                  <h3 style={{ marginBottom: 'var(--space-4)' }}>Review & Create</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}><div className="text-xs text-muted">Template</div><div style={{ fontWeight: 600 }}>{selectedTemplate?.name}</div></div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}><div className="text-xs text-muted">Year / Period</div><div style={{ fontWeight: 600 }}>{wizardForm.financial_year} {wizardForm.period_label && `(${wizardForm.period_label})`}</div></div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}><div className="text-xs text-muted">Due Date</div><div style={{ fontWeight: 600 }}>{formatDate(wizardForm.due_date)}</div></div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}><div className="text-xs text-muted">Price</div><div style={{ fontWeight: 600 }}>{wizardForm.price ? formatCurrency(parseFloat(wizardForm.price)) : formatCurrency(selectedTemplate?.default_price || 0)}</div></div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}><div className="text-xs text-muted">Assignment</div><div style={{ fontWeight: 600 }}>{wizardForm.assignee_type === 'unassigned' ? 'Unassigned' : assignables.find(a => a.id === wizardForm.assignee_id)?.display_name || 'None'}</div></div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}><div className="text-xs text-muted">Recurring</div><div style={{ fontWeight: 600 }}>{wizardForm.is_recurring ? `Every ${wizardForm.rec_interval} ${wizardForm.rec_freq}` : 'No'}</div></div>
                  </div>
                  {wizardForm.reminder_rules.length > 0 && (
                    <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                      <div className="text-xs text-muted" style={{ marginBottom: 4 }}>Reminders ({wizardForm.reminder_rules.length})</div>
                      {wizardForm.reminder_rules.map((r, i) => <div key={i} className="text-sm">{r.offset_value} {r.offset_unit} before via {r.channel}</div>)}
                    </div>
                  )}
                  <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                    <strong>Will create:</strong> 1 engagement, {selectedTemplate?.stages?.length || 0} stages, {wizardForm.reminder_rules.length} reminders{wizardForm.is_recurring ? ', 1 recurrence schedule' : ''}
                  </div>
                </div>
              )}

              {/* STEP 9: Success */}
              {wizardStep === 9 && createResult && (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}><Check size={32} /></div>
                  <h2 style={{ marginBottom: 'var(--space-2)' }}>Compliance Created!</h2>
                  <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>{createResult.engagement_code}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', maxWidth: 400, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{createResult.stages_created}</div><div className="text-xs text-muted">Stages</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-warning)' }}>{createResult.reminder_instances_created}</div><div className="text-xs text-muted">Reminders</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)' }}>{createResult.doc_requirements_created}</div><div className="text-xs text-muted">Doc Reqs</div></div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            {wizardStep <= 8 && (
              <div className="modal-footer" style={{ borderTop: '1px solid var(--color-gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  {wizardStep > 1 && wizardStep < 9 && <button className="btn btn-secondary" onClick={() => setWizardStep(s => s - 1)}><ChevronLeft size={16} /> Back</button>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-secondary" onClick={() => setShowWizard(false)}>Cancel</button>
                  {wizardStep >= 2 && wizardStep <= 7 && (
                    <button className="btn btn-primary" onClick={() => setWizardStep(s => s + 1)}
                      disabled={wizardStep === 3 && !wizardForm.due_date}>
                      Next <ChevronRight size={16} />
                    </button>
                  )}
                  {wizardStep === 8 && (
                    <button className="btn btn-primary" onClick={handleCreateCompliance} disabled={creating}
                      style={{ background: 'var(--color-success)' }}>
                      {creating ? 'Creating...' : '✓ Create Engagement'}
                    </button>
                  )}
                </div>
              </div>
            )}
            {wizardStep === 9 && (
              <div className="modal-footer"><button className="btn btn-primary" onClick={() => setShowWizard(false)}>Done</button></div>
            )}
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (<div className="modal-overlay" onClick={() => setShowEditModal(false)}><div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}><div className="modal-header"><h2>Edit Client</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>✕</button></div>
        <form onSubmit={handleSaveClient}><div className="modal-body">
          <div className="form-group"><label className="form-label">Client Name *</label><input className="form-input" required value={editForm.display_name} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })} /></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Type</label><select className="form-select" value={editForm.client_type_id} onChange={e => setEditForm({ ...editForm, client_type_id: e.target.value })}>{clientTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select></div></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={editForm.primary_email} onChange={e => setEditForm({ ...editForm, primary_email: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={editForm.primary_phone} onChange={e => setEditForm({ ...editForm, primary_phone: e.target.value })} /></div></div>
          <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={editForm.address_line_1} onChange={e => setEditForm({ ...editForm, address_line_1: e.target.value })} /></div>
          <div className="form-row"><div className="form-group"><label className="form-label">City</label><input className="form-input" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Province</label><input className="form-input" value={editForm.province} onChange={e => setEditForm({ ...editForm, province: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Postal Code</label><input className="form-input" value={editForm.postal_code} onChange={e => setEditForm({ ...editForm, postal_code: e.target.value })} /></div></div>
        </div><div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {currentUser?.role !== 'team_member' && (
              <button type="button" className="btn btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={handleArchiveClient}>Archive Client</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}><button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div></div></form></div></div>)}

      {/* Link Entity Modal */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Link Entity to Graph</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowLinkModal(false)}>✕</button>
            </div>
            <form onSubmit={handleLinkEntity}>
              <div className="modal-body">
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>Establish a formal relationship between this client and another entity in the directory.</p>
                <div className="form-group">
                  <label className="form-label">Target Entity *</label>
                  <select className="form-select" required value={linkForm.linked_client_id} onChange={e => setLinkForm({ ...linkForm, linked_client_id: e.target.value })}>
                    <option value="">Search directory...</option>
                    {allClients.filter(c => c.id !== id).map(c => (
                      <option key={c.id} value={c.id}>{c.display_name} ({c.client_code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship Role (e.g., Director, Target Entity, Spouse) *</label>
                  <input className="form-input" required placeholder="e.g. Shareholder, Dependent, Manager" value={linkForm.role} onChange={e => setLinkForm({ ...linkForm, role: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLinkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!linkForm.linked_client_id || !linkForm.role}><Link2 size={16} /> Link Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
