'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, Building2, Calendar, Clock, DollarSign, MessageSquare, FileText, CheckCircle2, Flame, Thermometer, Snowflake, Plus, ArrowUpRight, UserCheck, XCircle, Edit3, Trash2, AlertTriangle } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'new_inquiry', label: 'New Inquiry', color: '#6366f1' },
  { key: 'contacted', label: 'Contacted', color: '#3b82f6' },
  { key: 'meeting_scheduled', label: 'Meeting Scheduled', color: '#0891b2' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: '#f59e0b' },
  { key: 'negotiation', label: 'Negotiation', color: '#ec4899' },
  { key: 'qualified', label: 'Qualified', color: '#10b981' },
  { key: 'converted', label: 'Converted', color: '#059669' },
  { key: 'lost', label: 'Lost', color: '#dc2626' },
];

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function formatDateTime(d: string) { return d ? new Date(d).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }
function timeAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

function ScoreBadge({ score }: { score: string }) {
  const icons: Record<string, any> = { hot: <Flame size={12} />, warm: <Thermometer size={12} />, cold: <Snowflake size={12} /> };
  return <span className={`lead-score ${score}`} style={{ fontSize: 12 }}>{icons[score]} {score}</span>;
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, any> = { call: '📞', email: '📧', meeting: '🤝', whatsapp: '💬', note: '📝', stage_change: '⚡', status_change: '🔄', task_completed: '✅' };
  return <div className={`activity-log-icon ${type}`}>{icons[type] || '📌'}</div>;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertResult, setConvertResult] = useState<any>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ activity_type: 'call', summary: '', outcome: '', next_action: '', duration_minutes: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
  const [proposalForm, setProposalForm] = useState({ service_name: '', description: '', price: '' });
  const [convertType, setConvertType] = useState('');

  const loadData = useCallback(() => {
    fetch(`/api/leads/${params.id}`).then(r => r.json()).then(d => { setData(d); setLoading(false); if (d.lead) setConvertType(d.lead.lead_type === 'corporation' ? 'business' : d.lead.lead_type === 'partnership' ? 'business' : d.lead.lead_type); });
  }, [params.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/leads/${params.id}/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...activityForm, duration_minutes: parseInt(activityForm.duration_minutes) || null, created_by: user.id }) });
    setShowActivityForm(false);
    setActivityForm({ activity_type: 'call', summary: '', outcome: '', next_action: '', duration_minutes: '' });
    loadData();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/leads/${params.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...taskForm, created_by: user.id }) });
    setShowTaskForm(false);
    setTaskForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
    loadData();
  }

  async function completeTask(taskId: string) {
    await fetch(`/api/leads/${params.id}/tasks`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: taskId, status: 'completed' }) });
    loadData();
  }

  async function addProposal(e: React.FormEvent) {
    e.preventDefault();
    // Using inline fetch since no dedicated proposals API
    await fetch(`/api/leads/${params.id}/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activity_type: 'note', summary: `Added service: ${proposalForm.service_name} — $${proposalForm.price}`, created_by: user.id }) });
    setShowProposalForm(false);
    setProposalForm({ service_name: '', description: '', price: '' });
    loadData();
  }

  async function convertToClient() {
    const res = await fetch(`/api/leads/${params.id}/convert`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_type: convertType, created_by: user.id }) });
    const result = await res.json();
    if (res.ok) { setConvertResult(result); } else { alert(result.error || 'Failed to convert'); }
  }

  async function updateStage(stage: string) {
    const newStatus = stage === 'lost' ? 'lost' : 'active';
    await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: params.id, pipeline_stage: stage, status: newStatus, actor_id: user.id }) });
    loadData();
  }

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading lead...</div>;
  if (!data?.lead) return <div style={{ padding: 'var(--space-8)' }}>Lead not found</div>;

  const lead = data.lead;
  const stageInfo = PIPELINE_STAGES.find(s => s.key === lead.pipeline_stage) || PIPELINE_STAGES[0];
  const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === lead.pipeline_stage);
  const proposalTotal = (data.proposals || []).reduce((a: number, p: any) => a + (p.price || 0), 0);
  const pendingTasks = (data.tasks || []).filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled');

  return (
    <>
      {/* Back nav */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link href="/dashboard/leads" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back to Leads</Link>
      </div>

      {/* Profile Header */}
      <div className="lead-profile-header">
        <div className="lead-profile-info">
          <div className="lead-profile-avatar">{lead.first_name.charAt(0)}{(lead.last_name || '').charAt(0)}</div>
          <div className="lead-profile-details">
            <h1>{lead.first_name} {lead.last_name || ''}</h1>
            {lead.company_name && <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>{lead.company_name}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className="badge" style={{ background: stageInfo.color + '20', color: stageInfo.color }}>{stageInfo.label}</span>
              <ScoreBadge score={lead.lead_score} />
              <span className="badge badge-gray">{lead.lead_type}</span>
              <span className="badge badge-cyan">{lead.source.replace('_', ' ')}</span>
              {lead.lead_code && <span className="text-xs text-muted">{lead.lead_code}</span>}
            </div>
            <div className="lead-profile-meta">
              {lead.email && <div className="lead-profile-meta-item"><Mail /> {lead.email}</div>}
              {lead.phone && <div className="lead-profile-meta-item"><Phone /> {lead.phone}</div>}
              {lead.city && <div className="lead-profile-meta-item"><MapPin /> {lead.city}, {lead.province}</div>}
              {lead.assigned_name && <div className="lead-profile-meta-item"><Building2 /> {lead.assigned_name}</div>}
            </div>
          </div>
        </div>
        <div className="lead-profile-actions">
          {lead.status === 'active' && (
            <>
              <button className="btn btn-primary" onClick={() => setShowConvertModal(true)} style={{ background: '#059669' }}><UserCheck size={16} /> Convert to Client</button>
              <button className="btn btn-secondary" onClick={() => updateStage('lost')} style={{ color: '#dc2626' }}><XCircle size={16} /> Mark Lost</button>
            </>
          )}
          {lead.status === 'converted' && lead.converted_client_id && (
            <Link href={`/dashboard/clients/${lead.converted_client_id}`} className="btn btn-primary"><ArrowUpRight size={16} /> View Client</Link>
          )}
        </div>
      </div>

      {/* Pipeline Progress */}
      {lead.status === 'active' && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
            <div className="stage-tracker">
              {PIPELINE_STAGES.filter(s => s.key !== 'converted' && s.key !== 'lost').map((stage, i) => {
                const thisIdx = PIPELINE_STAGES.findIndex(s => s.key === stage.key);
                const isCompleted = thisIdx < stageIdx;
                const isCurrent = stage.key === lead.pipeline_stage;
                return (
                  <div key={stage.key} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && <div className={`stage-connector ${isCompleted ? 'completed' : ''}`} />}
                    <button
                      className={`stage-item ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}
                      onClick={() => updateStage(stage.key)}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title={`Move to ${stage.label}`}
                    >
                      <div className={`stage-dot ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}>
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      {stage.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'activities', 'tasks', 'documents', 'proposals', 'timeline'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'tasks' ? `Tasks (${pendingTasks.length})` : t === 'activities' ? `Activities (${(data.activities || []).length})` : t}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="kpi-card"><div className="kpi-icon blue"><Calendar size={22} /></div><div className="kpi-label">Last Contact</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-lg)' }}>{formatDate(lead.last_contact_date)}</div></div>
            <div className="kpi-card"><div className="kpi-icon yellow"><Clock size={22} /></div><div className="kpi-label">Next Follow-up</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-lg)', color: lead.next_followup_date && new Date(lead.next_followup_date) < new Date() ? '#dc2626' : undefined }}>{formatDate(lead.next_followup_date)}</div></div>
            <div className="kpi-card"><div className="kpi-icon green"><MessageSquare size={22} /></div><div className="kpi-label">Total Interactions</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-3xl)' }}>{(data.activities || []).length}</div></div>
            <div className="kpi-card"><div className="kpi-icon blue"><DollarSign size={22} /></div><div className="kpi-label">Est. Deal Value</div><div className="kpi-value" style={{ fontSize: 'var(--font-size-lg)' }}>{formatCurrency(lead.expected_value)}</div></div>
          </div>

          {lead.notes && (
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header"><h3>Notes</h3></div>
              <div className="card-body"><p className="text-sm">{lead.notes}</p></div>
            </div>
          )}

          {lead.referral_source && (
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header"><h3>Referral</h3></div>
              <div className="card-body"><p className="text-sm">Referred by: <strong>{lead.referral_source}</strong></p></div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <button className="btn btn-primary btn-sm" onClick={() => { setTab('activities'); setShowActivityForm(true); }}><Plus size={14} /> Log Activity</button>
            </div>
            <div className="card-body">
              <div className="activity-log">
                {(data.activities || []).slice(0, 4).map((a: any) => (
                  <div key={a.id} className="activity-log-entry">
                    <ActivityIcon type={a.activity_type} />
                    <div className="activity-log-body">
                      <h5>{a.summary}</h5>
                      {a.outcome && <p><strong>Outcome:</strong> {a.outcome}</p>}
                      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4 }}>
                        <span className="text-xs text-muted">{a.created_by_name} · {timeAgo(a.contact_date)}</span>
                        {a.duration_minutes > 0 && <span className="text-xs text-muted">{a.duration_minutes}min</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {(data.activities || []).length === 0 && <div className="text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No activities yet</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITIES TAB */}
      {tab === 'activities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowActivityForm(!showActivityForm)}><Plus size={14} /> Log Activity</button>
          </div>
          {showActivityForm && (
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="card-body">
                <form onSubmit={addActivity}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={activityForm.activity_type} onChange={e => setActivityForm({ ...activityForm, activity_type: e.target.value })}>
                        <option value="call">📞 Call</option><option value="email">📧 Email</option><option value="meeting">🤝 Meeting</option><option value="whatsapp">💬 WhatsApp</option><option value="note">📝 Note</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration (min)</label>
                      <input className="form-input" type="number" value={activityForm.duration_minutes} onChange={e => setActivityForm({ ...activityForm, duration_minutes: e.target.value })} placeholder="Optional" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Summary *</label>
                    <textarea className="form-textarea" required value={activityForm.summary} onChange={e => setActivityForm({ ...activityForm, summary: e.target.value })} rows={2} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Outcome</label>
                      <input className="form-input" value={activityForm.outcome} onChange={e => setActivityForm({ ...activityForm, outcome: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Next Action</label>
                      <input className="form-input" value={activityForm.next_action} onChange={e => setActivityForm({ ...activityForm, next_action: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowActivityForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm">Save Activity</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="activity-log">
            {(data.activities || []).map((a: any) => (
              <div key={a.id} className="activity-log-entry">
                <ActivityIcon type={a.activity_type} />
                <div className="activity-log-body">
                  <h5>{a.summary}</h5>
                  {a.outcome && <p><strong>Outcome:</strong> {a.outcome}</p>}
                  {a.next_action && <p><strong>Next Action:</strong> {a.next_action}</p>}
                  <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4 }}>
                    <span className="text-xs text-muted">{a.created_by_name} · {formatDateTime(a.contact_date)}</span>
                    {a.duration_minutes > 0 && <span className="badge badge-gray" style={{ fontSize: 10 }}>{a.duration_minutes} min</span>}
                    <span className="badge badge-gray" style={{ fontSize: 10, textTransform: 'capitalize' }}>{a.activity_type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
            {(data.activities || []).length === 0 && <div className="text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No activities yet. Log your first interaction!</div>}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {tab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(!showTaskForm)}><Plus size={14} /> Add Task</button>
          </div>
          {showTaskForm && (
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="card-body">
                <form onSubmit={addTask}>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Assigned To</label>
                      <select className="form-select" value={taskForm.assigned_to} onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                        <option value="">Unassigned</option>
                        {(data.teamMembers || []).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input className="form-input" type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTaskForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm">Create Task</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {(data.tasks || []).map((t: any) => {
              const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed';
              return (
                <div key={t.id} className="card" style={{ borderLeft: `3px solid ${t.priority === 'urgent' ? '#dc2626' : t.priority === 'high' ? '#f59e0b' : t.priority === 'medium' ? '#3b82f6' : '#9ca3af'}` }}>
                  <div className="card-body" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <button
                      style={{ width: 22, height: 22, borderRadius: 'var(--radius-full)', border: `2px solid ${t.status === 'completed' ? 'var(--color-success)' : 'var(--color-gray-300)'}`, background: t.status === 'completed' ? 'var(--color-success)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      onClick={() => { if (t.status !== 'completed') completeTask(t.id); }}
                    >
                      {t.status === 'completed' && <CheckCircle2 size={14} color="white" />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--color-gray-400)' : 'var(--color-gray-900)' }}>{t.title}</div>
                      {t.description && <div className="text-xs text-muted">{t.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      {t.assigned_name && <span className="text-xs text-muted">{t.assigned_name}</span>}
                      {t.due_date && <span className={`badge ${isOverdue ? 'badge-red' : 'badge-gray'}`} style={{ fontSize: 10 }}>{formatDate(t.due_date)}</span>}
                      <span className={`badge ${t.priority === 'urgent' ? 'badge-red' : t.priority === 'high' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: 10 }}>{t.priority}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(data.tasks || []).length === 0 && <div className="text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No tasks yet. Create a follow-up!</div>}
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {tab === 'documents' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Documents</h3>
            </div>
            {(data.documents || []).length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>File</th><th>Category</th><th>Uploaded By</th><th>Date</th></tr></thead>
                  <tbody>
                    {(data.documents || []).map((d: any) => (
                      <tr key={d.id}>
                        <td><span className="client-name"><FileText size={14} style={{ marginRight: 4 }} />{d.file_name}</span></td>
                        <td><span className="badge badge-cyan">{d.category}</span></td>
                        <td className="text-sm">{d.uploaded_by_name}</td>
                        <td className="text-sm">{formatDate(d.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card-body text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No documents uploaded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* PROPOSALS TAB */}
      {tab === 'proposals' && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-header">
              <h3>Service Pricing</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)', color: 'var(--color-success)' }}>Total: {formatCurrency(proposalTotal)}</span>
              </div>
            </div>
            {(data.proposals || []).length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Service</th><th>Description</th><th>Price</th></tr></thead>
                  <tbody>
                    {(data.proposals || []).map((p: any) => (
                      <tr key={p.id}>
                        <td><span className="client-name">{p.service_name}</span></td>
                        <td className="text-sm">{p.description || '—'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(p.price)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--color-gray-50)' }}>
                      <td colSpan={2} style={{ fontWeight: 700 }}>Total Estimated Value</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: 'var(--font-size-lg)' }}>{formatCurrency(proposalTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card-body text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No service pricing added yet.</div>
            )}
          </div>
        </div>
      )}

      {/* TIMELINE TAB */}
      {tab === 'timeline' && (
        <div>
          <div className="card">
            <div className="card-header"><h3>Timeline</h3></div>
            <div className="card-body">
              <div style={{ position: 'relative', paddingLeft: 'var(--space-6)' }}>
                <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 2, background: 'var(--color-gray-200)' }}></div>
                {(data.timeline || []).map((t: any, i: number) => (
                  <div key={i} style={{ position: 'relative', paddingBottom: 'var(--space-5)' }}>
                    <div style={{ position: 'absolute', left: -20, top: 2, width: 10, height: 10, borderRadius: '50%', background: t.type === 'stage_change' ? '#f59e0b' : t.type === 'call' ? '#2563eb' : t.type === 'meeting' ? '#db2777' : t.type === 'email' ? '#059669' : '#9ca3af', border: '2px solid white', boxShadow: '0 0 0 2px var(--color-gray-200)' }}></div>
                    <div style={{ marginLeft: 'var(--space-3)' }}>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-900)' }}>{t.title}</div>
                      {t.details && <div className="text-xs text-muted" style={{ marginTop: 2 }}>{t.details}</div>}
                      <div className="text-xs text-muted" style={{ marginTop: 4 }}>{t.user} · {formatDateTime(t.date)}</div>
                    </div>
                  </div>
                ))}
                {(data.timeline || []).length === 0 && <div className="text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No timeline events</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Client Modal */}
      {showConvertModal && (
        <div className="modal-overlay" onClick={() => { setShowConvertModal(false); setConvertResult(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{convertResult ? '✅ Lead Converted!' : 'Convert to Client'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowConvertModal(false); setConvertResult(null); }}>✕</button>
            </div>
            {convertResult ? (
              <div className="convert-success">
                <div className="convert-success-icon"><CheckCircle2 size={32} /></div>
                <h3 style={{ marginBottom: 'var(--space-2)' }}>{convertResult.display_name}</h3>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>Client code: {convertResult.client_code}</p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Link href={`/dashboard/clients/${convertResult.client_id}`} className="btn btn-primary"><ArrowUpRight size={16} /> View Client</Link>
                  <button className="btn btn-secondary" onClick={() => { setShowConvertModal(false); setConvertResult(null); router.push('/dashboard/leads'); }}>Back to Leads</button>
                </div>
              </div>
            ) : (
              <div className="convert-modal-body">
                <p className="text-sm" style={{ marginBottom: 'var(--space-4)' }}>This will create a new client from <strong>{lead.first_name} {lead.last_name}</strong> and archive this lead.</p>
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input className="form-input" disabled value={lead.company_name || `${lead.first_name} ${lead.last_name || ''}`.trim()} />
                </div>
                <div className="form-group">
                  <label className="form-label">Entity Type</label>
                  <select className="form-select" value={convertType} onChange={e => setConvertType(e.target.value)}>
                    <option value="individual">Individual</option>
                    <option value="business">Corporation / Business</option>
                    <option value="trust">Trust</option>
                    <option value="sole_proprietor">Sole Proprietor</option>
                  </select>
                </div>
                <div style={{ background: 'var(--color-warning-light)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <AlertTriangle size={16} color="#b45309" />
                  <span className="text-sm" style={{ color: '#b45309' }}>This action cannot be undone. Activities and notes will be linked to the new client.</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setShowConvertModal(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ background: '#059669' }} onClick={convertToClient}><UserCheck size={16} /> Convert Now</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
