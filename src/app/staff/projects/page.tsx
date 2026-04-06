'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FolderKanban, AlertTriangle, CheckCircle, Clock, ChevronDown, ExternalLink, Search
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function StaffProjectsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading projects...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load projects.</div>;

  const { assignedStages } = data;
  const now = new Date();

  // Group stages by engagement
  const projectMap = new Map<string, any>();
  (assignedStages || []).forEach((s: any) => {
    if (!projectMap.has(s.engagement_id)) {
      projectMap.set(s.engagement_id, {
        engagementId: s.engagement_id,
        engagementCode: s.engagement_code,
        templateName: s.template_name,
        templateCode: s.template_code,
        clientName: s.client_name,
        clientCode: s.client_code,
        clientId: s.client_id,
        clientType: s.client_type,
        financialYear: s.financial_year,
        dueDate: s.due_date,
        price: s.price,
        engagementStatus: s.engagement_status,
        priority: s.priority,
        teamName: s.team_name,
        stages: [],
      });
    }
    projectMap.get(s.engagement_id).stages.push(s);
  });

  let projects = Array.from(projectMap.values());

  // Filter
  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    projects = projects.filter(p =>
      p.clientName.toLowerCase().includes(q) || p.templateName.toLowerCase().includes(q) || p.engagementCode.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'all') {
    projects = projects.filter(p => p.engagementStatus === statusFilter);
  }

  // Sort by due date
  projects.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));

  const getProjectProgress = (stages: any[]) => {
    const total = stages.length;
    const completed = stages.filter((s: any) => s.stage_status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getMyRole = (stages: any[]) => {
    const active = stages.filter((s: any) => s.stage_status === 'in_progress');
    if (active.length > 0) return active.map((s: any) => s.stage_name).join(', ');
    const pending = stages.filter((s: any) => s.stage_status === 'pending');
    if (pending.length > 0) return `${pending.length} pending stage(s)`;
    return 'All stages completed';
  };

  const priorityColor: Record<string, string> = { urgent: 'var(--color-danger)', high: '#f59e0b', medium: 'var(--color-primary)', low: 'var(--color-gray-400)' };
  const statusVariant: Record<string, string> = { in_progress: 'badge-blue', completed: 'badge-green', new: 'badge-gray' };

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><FolderKanban size={28} /> Projects & Compliance</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Engagements where you have assigned stages</p>
        </div>
        <span className="badge badge-blue" style={{ padding: '6px 12px', fontSize: 12 }}>{projects.length} Projects</span>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div className="topbar-search" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input type="text" placeholder="Search projects, clients..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} style={{ width: '100%' }} />
          </div>
          <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="new">New</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Project Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {projects.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
            <FolderKanban size={40} style={{ marginBottom: 8 }} />
            <h3>No projects found</h3>
            <p className="text-sm">You have no assigned engagements matching your criteria.</p>
          </div>
        ) : (
          projects.map((p) => {
            const isExpanded = expandedProject === p.engagementId;
            const progress = getProjectProgress(p.stages);
            const overdue = p.dueDate && new Date(p.dueDate) < now && p.engagementStatus !== 'completed';
            const daysLeft = p.dueDate ? Math.ceil((new Date(p.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div key={p.engagementId} className="card" style={{ overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setExpandedProject(isExpanded ? null : p.engagementId)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: overdue ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', color: overdue ? 'var(--color-danger)' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderKanban size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {p.templateName}
                        <span className="badge" style={{ fontSize: 9, background: `${priorityColor[p.priority]}15`, color: priorityColor[p.priority], border: `1px solid ${priorityColor[p.priority]}30` }}>{p.priority}</span>
                      </div>
                      <div className="text-xs text-muted">{p.clientName} · {p.engagementCode} · FY {p.financialYear}</div>
                      <div className="text-xs" style={{ color: '#6366f1', fontWeight: 500, marginTop: 2 }}>My Role: {getMyRole(p.stages)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    {/* Progress Bar */}
                    <div style={{ width: 120 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="text-xs text-muted">Progress</span>
                        <span className="text-xs" style={{ fontWeight: 600 }}>{progress}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: progress >= 100 ? 'var(--color-success)' : '#6366f1', borderRadius: 3, transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-xs" style={{ fontWeight: 600, color: overdue ? 'var(--color-danger)' : daysLeft !== null && daysLeft <= 14 ? 'var(--color-warning)' : 'var(--color-gray-500)' }}>
                        {overdue ? 'OVERDUE' : daysLeft !== null && daysLeft === 0 ? 'Due Today' : daysLeft !== null ? `${daysLeft}d left` : '—'}
                      </div>
                      <div className="text-xs text-muted">{formatDate(p.dueDate)}</div>
                    </div>
                    <span className={`badge ${statusVariant[p.engagementStatus] || 'badge-gray'}`}>
                      <span className="badge-dot"></span>{p.engagementStatus.replace(/_/g, ' ')}
                    </span>
                    <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                  </div>
                </div>

                {/* Expanded: Stage breakdown */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--color-gray-200)', background: 'var(--color-gray-50)' }}>
                    <div style={{ padding: 'var(--space-3) var(--space-5)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 'var(--space-3)', borderBottom: '1px solid var(--color-gray-100)' }}>
                      <div><span className="text-xs text-muted">Client</span><div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); router.push(`/staff/clients/${p.clientId}`); }}>{p.clientName} →</div><div className="text-xs text-muted">{p.clientCode} · {p.clientType}</div></div>
                      <div><span className="text-xs text-muted">Total Value</span><div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{formatCurrency(p.price)}</div></div>
                      <div><span className="text-xs text-muted">Team</span><div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{p.teamName || '—'}</div></div>
                      <div><span className="text-xs text-muted">My Stages</span><div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{p.stages.length}</div></div>
                      <div>
                        <span className="text-xs text-muted">Completion</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: progress >= 100 ? 'var(--color-success)' : '#6366f1' }}>{progress}%</span>
                          <span className="text-xs text-muted">({p.stages.filter((s: any) => s.stage_status === 'completed').length}/{p.stages.length})</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Stage Pipeline */}
                    <div style={{ padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--color-gray-100)' }}>
                      <div className="text-xs text-muted" style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>STAGE PIPELINE</div>
                      <div style={{ display: 'flex', gap: 2, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        {p.stages.sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((s: any) => (
                          <div key={s.stage_id} title={`${s.stage_name}: ${s.stage_status}`} style={{
                            flex: 1, height: '100%',
                            background: s.stage_status === 'completed' ? 'var(--color-success)' : s.stage_status === 'in_progress' ? '#6366f1' :
                              (s.due_date && new Date(s.due_date) < now && s.stage_status !== 'completed') ? 'var(--color-danger)' : 'var(--color-gray-200)',
                          }}></div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        {p.stages.sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((s: any) => (
                          <span key={s.stage_id} className="text-xs" style={{
                            flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 500,
                            color: s.stage_status === 'completed' ? 'var(--color-success)' : s.stage_status === 'in_progress' ? '#6366f1' : 'var(--color-gray-400)'
                          }}>{s.stage_name}</span>
                        ))}
                      </div>
                    </div>

                    {/* Stages Table */}
                    <div className="data-table-wrapper" style={{ border: 'none' }}>
                      <table className="data-table text-sm">
                        <thead><tr><th>#</th><th>Stage</th><th>Status</th><th>Started</th><th>Completed</th><th>Notes</th></tr></thead>
                        <tbody>
                          {p.stages.sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((s: any) => (
                            <tr key={s.stage_id} style={{ background: s.stage_status === 'in_progress' ? 'rgba(99,102,241,0.03)' : 'transparent' }}>
                              <td className="text-xs text-muted">{s.sequence_order}</td>
                              <td style={{ fontWeight: 600 }}>{s.stage_name}</td>
                              <td>
                                <span className={`badge ${s.stage_status === 'completed' ? 'badge-green' : s.stage_status === 'in_progress' ? 'badge-blue' : 'badge-gray'}`}>
                                  <span className="badge-dot"></span>{s.stage_status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="text-xs">{formatDate(s.started_at)}</td>
                              <td className="text-xs">{formatDate(s.completed_at)}</td>
                              <td className="text-xs text-muted">{s.stage_notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
