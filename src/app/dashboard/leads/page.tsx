'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, LayoutGrid, List, Flame, Thermometer, Snowflake, Phone, Mail, Globe, Users, UserCheck, DollarSign, TrendingUp, Target, XCircle, ArrowUpRight, Filter, Calendar } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'new_inquiry', label: 'New Inquiry', color: '#6366f1' },
  { key: 'contacted', label: 'Contacted', color: '#3b82f6' },
  { key: 'meeting_scheduled', label: 'Meeting Scheduled', color: '#0891b2' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: '#f59e0b' },
  { key: 'negotiation', label: 'Negotiation', color: '#ec4899' },
  { key: 'qualified', label: 'Qualified', color: '#10b981' },
  { key: 'converted', label: 'Converted ✅', color: '#059669' },
  { key: 'lost', label: 'Lost ❌', color: '#dc2626' },
];

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'; }
function ScoreBadge({ score }: { score: string }) {
  const icons: Record<string, any> = { hot: <Flame size={11} />, warm: <Thermometer size={11} />, cold: <Snowflake size={11} /> };
  return <span className={`lead-score ${score}`}>{icons[score]} {score}</span>;
}

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<any[]>([]);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ source: '', score: '', status: 'active' });
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', company_name: '', email: '', phone: '', lead_type: 'individual', source: 'website', lead_score: 'warm', expected_value: '', assigned_to: '', notes: '', next_followup_date: '', referral_source: '' });

  const loadLeads = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filters.source) params.set('source', filters.source);
    if (filters.score) params.set('score', filters.score);
    if (filters.status) params.set('status', filters.status);
    fetch(`/api/leads?${params}`).then(r => r.json()).then(d => {
      setLeads(d.leads || []);
      setTeamMembers(d.teamMembers || []);
      setLoading(false);
    });
  }, [search, filters]);

  const loadDash = useCallback(() => {
    fetch('/api/leads/dashboard').then(r => r.json()).then(d => setDashData(d)).catch(console.error);
  }, []);

  useEffect(() => { loadLeads(); loadDash(); }, [loadLeads, loadDash]);
  useEffect(() => { if (searchParams.get('create') === 'true') setShowModal(true); }, [searchParams]);

  async function createLead(e: React.FormEvent) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, expected_value: parseFloat(form.expected_value) || 0, created_by: user.id }),
    });
    setShowModal(false);
    setForm({ first_name: '', last_name: '', company_name: '', email: '', phone: '', lead_type: 'individual', source: 'website', lead_score: 'warm', expected_value: '', assigned_to: '', notes: '', next_followup_date: '', referral_source: '' });
    loadLeads();
    loadDash();
  }

  async function handleDrop(leadId: string, newStage: string) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newStatus = newStage === 'converted' ? 'converted' : newStage === 'lost' ? 'lost' : 'active';
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, pipeline_stage: newStage, status: newStatus, actor_id: user.id }),
    });
    loadLeads();
    loadDash();
  }

  const s = dashData?.stats || {};

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading leads...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>{leads.length} leads in pipeline</p>
        </div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><LayoutGrid size={14} /> Board</button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={14} /> List</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> New Lead</button>
        </div>
      </div>

      {/* KPI Cards */}
      {dashData && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          <div className="kpi-card">
            <div className="kpi-icon blue"><Users size={22} /></div>
            <div className="kpi-label">Total Leads</div>
            <div className="kpi-value" style={{ fontSize: 'var(--font-size-3xl)' }}>{s.total_leads}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green"><TrendingUp size={22} /></div>
            <div className="kpi-label">New (7 days)</div>
            <div className="kpi-value" style={{ fontSize: 'var(--font-size-3xl)' }}>{s.new_leads_7d}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon yellow"><Target size={22} /></div>
            <div className="kpi-label">Qualified</div>
            <div className="kpi-value" style={{ fontSize: 'var(--font-size-3xl)' }}>{s.qualified_leads}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green"><UserCheck size={22} /></div>
            <div className="kpi-label">Converted</div>
            <div className="kpi-value" style={{ fontSize: 'var(--font-size-3xl)' }}>{s.converted_leads}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon red"><XCircle size={22} /></div>
            <div className="kpi-label">Lost</div>
            <div className="kpi-value" style={{ fontSize: 'var(--font-size-3xl)' }}>{s.lost_leads}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon blue"><DollarSign size={22} /></div>
            <div className="kpi-label">Conversion Rate</div>
            <div className="kpi-value" style={{ fontSize: 'var(--font-size-3xl)' }}>{s.conversion_rate}%</div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="topbar-search" style={{ flex: 1, minWidth: 200 }}>
          <Search />
          <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} /> Filters</button>
        {filters.status !== 'active' && <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ source: '', score: '', status: 'active' })}>Clear Filters</button>}
      </div>
      {showFilters && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="active">Active</option><option value="">All</option><option value="converted">Converted</option><option value="lost">Lost</option>
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })}>
            <option value="">All Sources</option><option value="website">Website</option><option value="referral">Referral</option><option value="call">Call</option><option value="walk_in">Walk-in</option><option value="email">Email</option><option value="social_media">Social Media</option>
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filters.score} onChange={e => setFilters({ ...filters, score: e.target.value })}>
            <option value="">All Scores</option><option value="hot">🔥 Hot</option><option value="warm">🟡 Warm</option><option value="cold">🔵 Cold</option>
          </select>
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div className="kanban-board">
          {PIPELINE_STAGES.filter(st => st.key !== 'converted' && st.key !== 'lost').map(stage => {
            const stageLeads = leads.filter(l => l.pipeline_stage === stage.key);
            return (
              <div
                key={stage.key}
                className={`kanban-column ${dragOver === stage.key ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('leadId'); if (id) handleDrop(id, stage.key); }}
              >
                <div className="kanban-column-header" style={{ borderLeft: `3px solid ${stage.color}` }}>
                  <h4>{stage.label}</h4>
                  <span className="kanban-column-count">{stageLeads.length}</span>
                </div>
                <div className="kanban-column-body">
                  {stageLeads.map(lead => (
                    <Link
                      key={lead.id}
                      href={`/dashboard/leads/${lead.id}`}
                      className="kanban-card"
                      draggable
                      onDragStart={e => { e.dataTransfer.setData('leadId', lead.id); (e.target as HTMLElement).classList.add('dragging'); }}
                      onDragEnd={e => { (e.target as HTMLElement).classList.remove('dragging'); }}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div className="kanban-card-name">{lead.first_name} {lead.last_name}</div>
                        <ScoreBadge score={lead.lead_score} />
                      </div>
                      {lead.company_name && <div className="kanban-card-company">{lead.company_name}</div>}
                      {lead.next_followup_date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: new Date(lead.next_followup_date) < new Date() ? '#dc2626' : 'var(--color-gray-500)' }}>
                          <Calendar size={10} /> {formatDate(lead.next_followup_date)}
                        </div>
                      )}
                      <div className="kanban-card-meta">
                        <span className="kanban-card-value">{formatCurrency(lead.expected_value)}</span>
                        {lead.assigned_name && (
                          <span className="kanban-card-avatar" title={lead.assigned_name}>{lead.assigned_name.charAt(0)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {stageLeads.length === 0 && <div style={{ textAlign: 'center', padding: 'var(--space-4)', fontSize: 12, color: 'var(--color-gray-400)' }}>No leads</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Stage</th>
                  <th>Assigned To</th>
                  <th>Score</th>
                  <th>Expected Value</th>
                  <th>Next Follow-up</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const stageInfo = PIPELINE_STAGES.find(s => s.key === lead.pipeline_stage);
                  return (
                    <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}>
                      <td>
                        <span className="client-name">{lead.first_name} {lead.last_name}</span>
                        <br /><span className="text-xs text-muted">{lead.lead_code}</span>
                      </td>
                      <td className="text-sm">{lead.company_name || '—'}</td>
                      <td><span className="badge badge-gray">{lead.lead_type}</span></td>
                      <td><span className="badge badge-cyan">{lead.source.replace('_', ' ')}</span></td>
                      <td>
                        <span className="badge" style={{ background: (stageInfo?.color || '#ccc') + '20', color: stageInfo?.color }}>
                          {stageInfo?.label}
                        </span>
                      </td>
                      <td className="text-sm">{lead.assigned_name || '—'}</td>
                      <td><ScoreBadge score={lead.lead_score} /></td>
                      <td className="text-sm" style={{ fontWeight: 600 }}>{formatCurrency(lead.expected_value)}</td>
                      <td>
                        <span className="text-sm" style={{ color: lead.next_followup_date && new Date(lead.next_followup_date) < new Date() ? '#dc2626' : 'inherit' }}>
                          {formatDate(lead.next_followup_date)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${lead.status === 'active' ? 'badge-green' : lead.status === 'converted' ? 'badge-blue' : lead.status === 'lost' ? 'badge-red' : 'badge-gray'}`}>
                          <span className="badge-dot"></span>{lead.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No leads found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {dashData && (
        <div className="grid-2" style={{ marginTop: 'var(--space-6)' }}>
          {/* Leads by Source */}
          <div className="card">
            <div className="card-header"><h3>Leads by Source</h3></div>
            <div className="card-body">
              {(dashData.bySource || []).map((s: any, i: number) => {
                const icons: Record<string, any> = { website: <Globe size={14} />, referral: <Users size={14} />, call: <Phone size={14} />, email: <Mail size={14} />, walk_in: <UserCheck size={14} />, social_media: <TrendingUp size={14} /> };
                const maxCount = Math.max(...(dashData.bySource || []).map((x: any) => x.count), 1);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: i < (dashData.bySource || []).length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-500)', flexShrink: 0 }}>
                      {icons[s.source] || <Globe size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="text-sm" style={{ fontWeight: 500, textTransform: 'capitalize' }}>{s.source.replace('_', ' ')}</span>
                        <span className="text-sm" style={{ fontWeight: 600 }}>{s.count}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)' }}>
                        <div style={{ height: '100%', width: `${(s.count / maxCount) * 100}%`, background: 'var(--color-primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Leads */}
          <div className="card">
            <div className="card-header">
              <h3>Top Leads by Value</h3>
              <Link href="/dashboard/leads" className="btn btn-ghost btn-sm">View All <ArrowUpRight size={14} /></Link>
            </div>
            <div className="card-body">
              {(dashData.topLeads || []).map((l: any, i: number) => (
                <Link key={i} href={`/dashboard/leads/${l.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)', textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{l.first_name} {l.last_name}</div>
                    <div className="text-xs text-muted">{l.company_name || l.lead_code}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <ScoreBadge score={l.lead_score} />
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>{formatCurrency(l.expected_value)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>New Lead</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createLead}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="Optional" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.lead_type} onChange={e => setForm({ ...form, lead_type: e.target.value })}>
                      <option value="individual">Individual</option><option value="corporation">Corporation</option><option value="trust">Trust</option><option value="partnership">Partnership</option><option value="sole_proprietor">Sole Proprietor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select className="form-select" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                      <option value="website">Website</option><option value="referral">Referral</option><option value="call">Call</option><option value="walk_in">Walk-in</option><option value="email">Email</option><option value="social_media">Social Media</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lead Score</label>
                    <select className="form-select" value={form.lead_score} onChange={e => setForm({ ...form, lead_score: e.target.value })}>
                      <option value="hot">🔥 Hot</option><option value="warm">🟡 Warm</option><option value="cold">🔵 Cold</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Value ($)</label>
                    <input className="form-input" type="number" value={form.expected_value} onChange={e => setForm({ ...form, expected_value: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Assigned To</label>
                    <select className="form-select" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                      <option value="">Unassigned</option>
                      {teamMembers.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Follow-up</label>
                    <input className="form-input" type="date" value={form.next_followup_date} onChange={e => setForm({ ...form, next_followup_date: e.target.value })} />
                  </div>
                </div>
                {form.source === 'referral' && (
                  <div className="form-group">
                    <label className="form-label">Referral Source</label>
                    <input className="form-input" value={form.referral_source} onChange={e => setForm({ ...form, referral_source: e.target.value })} placeholder="Who referred this lead?" />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Initial notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
