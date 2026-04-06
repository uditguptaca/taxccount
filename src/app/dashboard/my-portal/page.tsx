'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Clock, CheckCircle, AlertTriangle, Users, Briefcase,
  DollarSign, FileText, ChevronDown, ExternalLink, MessageSquare, Bell,
  Play, Check, RotateCcw, User, Filter, ArrowUpDown, Calendar, Target,
  TrendingUp, Search, Send, X
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function timeAgo(d: string) {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function EmployeePortalPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');

  // Task filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('due_date');

  // Expanded task detail
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [taskNote, setTaskNote] = useState('');

  // Reassign modal
  const [showReassign, setShowReassign] = useState<string | null>(null);
  const [reassignTo, setReassignTo] = useState('');

  function loadData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/employee/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  async function updateStage(stageId: string, action: string, notes?: string, newUserId?: string) {
    await fetch('/api/employee/dashboard', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_id: stageId, action, notes, new_user_id: newUserId }),
    });
    loadData();
    setExpandedTask(null);
    setTaskNote('');
    setShowReassign(null);
    setReassignTo('');
  }

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading your portal...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load portal data.</div>;

  const { user, kpis, assignedStages, timeEntries, notifications, reminders, teammates } = data;
  const now = new Date();

  // Filter and sort tasks
  const filteredTasks = (assignedStages || []).filter((s: any) => {
    if (statusFilter !== 'all' && s.stage_status !== statusFilter) return false;
    if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false;
    if (searchFilter && !s.client_name.toLowerCase().includes(searchFilter.toLowerCase()) && !s.template_name.toLowerCase().includes(searchFilter.toLowerCase()) && !s.stage_name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === 'due_date') return (a.due_date || '9999').localeCompare(b.due_date || '9999');
    if (sortBy === 'priority') {
      const po: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (po[a.priority] || 2) - (po[b.priority] || 2);
    }
    if (sortBy === 'client') return (a.client_name || '').localeCompare(b.client_name || '');
    return 0;
  });

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < now;
  };

  const daysUntilDue = (dueDate: string) => {
    if (!dueDate) return null;
    return Math.ceil((new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const priorityColor: Record<string, string> = { urgent: 'var(--color-danger)', high: '#f59e0b', medium: 'var(--color-primary)', low: 'var(--color-gray-400)' };

  return (
    <>
      {/* ═══════ HEADER ═══════ */}
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary), #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            My Portal
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>
            Welcome back, {user.first_name}! · {user.role?.replace('_', ' ')} {user.team_name ? `· ${user.team_name}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span className="badge badge-blue" style={{ fontSize: 12, padding: '6px 12px' }}><Calendar size={14} /> {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ═══════ TABS ═══════ */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { key: 'tasks', label: 'My Tasks' },
          { key: 'performance', label: 'Performance' },
          { key: 'notifications', label: 'Notifications' },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
            {t.key === 'notifications' && notifications?.filter((n: any) => !n.is_read).length > 0 && (
              <span className="badge badge-red" style={{ marginLeft: 6, fontSize: 10 }}>{notifications.filter((n: any) => !n.is_read).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════ DASHBOARD TAB ═══════ */}
      {tab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-3)' }}>
            <div className="kpi-card">
              <div className="kpi-icon blue"><Briefcase size={20} /></div>
              <div className="kpi-label">Active Tasks</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{kpis.activeStages}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}><Clock size={20} /></div>
              <div className="kpi-label">Pending Queue</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{kpis.pendingStages}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon green"><CheckCircle size={20} /></div>
              <div className="kpi-label">Completed</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{kpis.completedStages}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: kpis.overdueStages > 0 ? 'rgba(239,68,68,0.1)' : 'var(--color-gray-100)', color: kpis.overdueStages > 0 ? 'var(--color-danger)' : 'var(--color-gray-400)' }}>
                <AlertTriangle size={20} />
              </div>
              <div className="kpi-label">Overdue</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)', color: kpis.overdueStages > 0 ? 'var(--color-danger)' : 'inherit' }}>{kpis.overdueStages}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon blue"><Clock size={20} /></div>
              <div className="kpi-label">Hours (30d)</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{kpis.totalHours}h</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon green"><DollarSign size={20} /></div>
              <div className="kpi-label">Revenue</div>
              <div className="kpi-value" style={{ fontSize: 'var(--font-size-lg)' }}>{formatCurrency(kpis.totalRevenue)}</div>
            </div>
          </div>

          {/* Completion Rate + Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {/* Completion Rate Card */}
            <div className="card">
              <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Target size={18} /> Completion Rate</h3></div>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-5)' }}>
                <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-gray-100)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={kpis.completionRate >= 75 ? 'var(--color-success)' : kpis.completionRate >= 50 ? 'var(--color-warning)' : 'var(--color-primary)'}
                      strokeWidth="10" strokeDasharray={`${kpis.completionRate * 3.14} 314`}
                      strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 0.5s' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{kpis.completionRate}%</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-sm text-muted">Clients Served</span>
                      <span style={{ fontWeight: 700 }}>{kpis.clientsServed}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-sm text-muted">Projects Involved</span>
                      <span style={{ fontWeight: 700 }}>{kpis.projectsInvolved}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-sm text-muted">Total Tasks Assigned</span>
                      <span style={{ fontWeight: 700 }}>{kpis.activeStages + kpis.pendingStages + kpis.completedStages}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="card">
              <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Calendar size={18} /> Upcoming Deadlines</h3></div>
              <div className="card-body" style={{ padding: 0, maxHeight: 220, overflowY: 'auto' }}>
                {(assignedStages || []).filter((s: any) => s.stage_status !== 'completed' && s.due_date).slice(0, 6).map((s: any) => {
                  const days = daysUntilDue(s.due_date);
                  const overdue = isOverdue(s.due_date, s.stage_status);
                  return (
                    <div key={s.stage_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)', cursor: 'pointer' }}
                      onClick={() => router.push(`/dashboard/projects/${s.engagement_id}`)}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{s.stage_name}</div>
                        <div className="text-xs text-muted">{s.client_name} · {s.template_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="text-xs" style={{ fontWeight: 600, color: overdue ? 'var(--color-danger)' : days !== null && days <= 7 ? 'var(--color-warning)' : 'var(--color-gray-500)' }}>
                          {overdue ? 'OVERDUE' : days !== null ? `${days}d left` : '—'}
                        </div>
                        <div className="text-xs text-muted">{formatDate(s.due_date)}</div>
                      </div>
                    </div>
                  );
                })}
                {(assignedStages || []).filter((s: any) => s.stage_status !== 'completed' && s.due_date).length === 0 && (
                  <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No upcoming deadlines</div>
                )}
              </div>
            </div>
          </div>

          {/* Active Tasks Quick View */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Briefcase size={18} /> Active Work Queue</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('tasks')}>View All →</button>
            </div>
            <div className="data-table-wrapper" style={{ border: 'none', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
              <table className="data-table text-sm">
                <thead><tr><th>Task / Stage</th><th>Client</th><th>Project</th><th>Due Date</th><th>Priority</th><th>Status</th><th style={{ width: 120 }}>Action</th></tr></thead>
                <tbody>
                  {(assignedStages || []).filter((s: any) => s.stage_status === 'in_progress').slice(0, 8).map((s: any) => {
                    const overdue = isOverdue(s.due_date, s.stage_status);
                    return (
                      <tr key={s.stage_id} style={{ background: overdue ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            {overdue && <AlertTriangle size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
                            <div>
                              <span style={{ fontWeight: 600 }}>{s.stage_name}</span>
                              <div className="text-xs text-muted">{s.engagement_code}</div>
                            </div>
                          </div>
                        </td>
                        <td><Link href={`/dashboard/clients/${s.client_id}`} style={{ fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>{s.client_name}</Link></td>
                        <td className="text-xs">{s.template_name}</td>
                        <td>
                          <div className="text-sm">{formatDate(s.due_date)}</div>
                          {overdue && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-danger)' }}>OVERDUE</span>}
                        </td>
                        <td>
                          <span className="badge" style={{ fontSize: 10, background: `${priorityColor[s.priority]}20`, color: priorityColor[s.priority], border: `1px solid ${priorityColor[s.priority]}40` }}>
                            {s.priority}
                          </span>
                        </td>
                        <td><span className="badge badge-blue"><span className="badge-dot"></span>In Progress</span></td>
                        <td>
                          <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={() => updateStage(s.stage_id, 'complete')}>
                            <Check size={12} /> Complete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {(assignedStages || []).filter((s: any) => s.stage_status === 'in_progress').length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No active tasks right now. Check your pending queue!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Time Entries */}
          {timeEntries && timeEntries.length > 0 && (
            <div className="card">
              <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Clock size={18} /> Recent Time Entries</h3></div>
              <div className="data-table-wrapper" style={{ border: 'none', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
                <table className="data-table text-sm">
                  <thead><tr><th>Description</th><th>Client</th><th>Date</th><th>Duration</th><th>Rate</th></tr></thead>
                  <tbody>
                    {timeEntries.slice(0, 5).map((te: any) => (
                      <tr key={te.id}>
                        <td style={{ fontWeight: 500 }}>{te.description}</td>
                        <td className="text-sm">{te.client_name || '—'}<br /><span className="text-xs text-muted">{te.template_name}</span></td>
                        <td className="text-sm">{formatDate(te.entry_date)}</td>
                        <td><span className="badge badge-blue">{Math.floor(te.duration_minutes / 60)}h {te.duration_minutes % 60}m</span></td>
                        <td className="text-sm">{te.hourly_rate ? `$${te.hourly_rate}/hr` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ MY TASKS TAB ═══════ */}
      {tab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Filters Bar */}
          <div className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="topbar-search" style={{ flex: 1, minWidth: 200 }}>
                <Search size={16} />
                <input type="text" placeholder="Search tasks, clients..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Filter size={14} style={{ color: 'var(--color-gray-400)' }} />
                <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 100 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <ArrowUpDown size={14} style={{ color: 'var(--color-gray-400)' }} />
                <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 100 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="client">Client Name</option>
                </select>
              </div>
              <span className="badge badge-gray">{filteredTasks.length} tasks</span>
            </div>
          </div>

          {/* Task Cards */}
          {filteredTasks.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
              <Briefcase size={40} style={{ marginBottom: 8 }} />
              <h3>No tasks match your filters</h3>
              <p className="text-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredTasks.map((s: any) => {
              const overdue = isOverdue(s.due_date, s.stage_status);
              const days = daysUntilDue(s.due_date);
              const isExpanded = expandedTask === s.stage_id;

              return (
                <div key={s.stage_id} className="card" style={{
                  borderLeft: `4px solid ${s.stage_status === 'completed' ? 'var(--color-success)' : overdue ? 'var(--color-danger)' : s.stage_status === 'in_progress' ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setExpandedTask(isExpanded ? null : s.stage_id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
                      {overdue && <AlertTriangle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {s.stage_name}
                          <span className="badge" style={{ fontSize: 9, background: `${priorityColor[s.priority]}15`, color: priorityColor[s.priority], border: `1px solid ${priorityColor[s.priority]}30` }}>{s.priority}</span>
                        </div>
                        <div className="text-xs text-muted">{s.client_name} · {s.template_name} · {s.engagement_code}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="text-xs" style={{ fontWeight: 600, color: overdue ? 'var(--color-danger)' : days !== null && days <= 7 ? 'var(--color-warning)' : 'var(--color-gray-500)' }}>
                          {s.stage_status === 'completed' ? 'Done' : overdue ? 'OVERDUE' : days !== null && days <= 0 ? 'Due Today' : days !== null ? `${days}d left` : '—'}
                        </div>
                        <div className="text-xs text-muted">{formatDate(s.due_date)}</div>
                      </div>
                      <span className={`badge ${s.stage_status === 'completed' ? 'badge-green' : s.stage_status === 'in_progress' ? 'badge-blue' : 'badge-gray'}`}>
                        <span className="badge-dot"></span>{s.stage_status.replace('_', ' ')}
                      </span>
                      <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                    </div>
                  </div>

                  {/* Expanded Task Detail */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--color-gray-200)', padding: 'var(--space-4)', background: 'var(--color-gray-50)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div><div className="text-xs text-muted">Client</div><Link href={`/dashboard/clients/${s.client_id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', fontSize: 'var(--font-size-sm)' }}>{s.client_name}</Link><div className="text-xs text-muted">{s.client_code} · {s.client_type}</div></div>
                        <div><div className="text-xs text-muted">Project</div><Link href={`/dashboard/projects/${s.engagement_id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', fontSize: 'var(--font-size-sm)' }}>{s.template_name}</Link><div className="text-xs text-muted">{s.engagement_code} · FY {s.financial_year}</div></div>
                        <div><div className="text-xs text-muted">Price</div><div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{formatCurrency(s.price)}</div></div>
                        <div><div className="text-xs text-muted">Team</div><div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{s.team_name || '—'}</div></div>
                      </div>

                      {/* Notes */}
                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <div className="text-xs text-muted" style={{ marginBottom: 4 }}>Add Note / Comment</div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <input className="form-input" placeholder="Add a note to this task..." value={taskNote} onChange={e => setTaskNote(e.target.value)} style={{ flex: 1, fontSize: 'var(--font-size-sm)' }} />
                          <button className="btn btn-secondary btn-sm" disabled={!taskNote} onClick={() => updateStage(s.stage_id, 'add_note', taskNote)}>
                            <Send size={12} /> Save Note
                          </button>
                        </div>
                        {s.stage_notes && <div className="text-xs" style={{ marginTop: 4, padding: 'var(--space-2)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }}>{s.stage_notes}</div>}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {s.stage_status === 'pending' && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStage(s.stage_id, 'start')}>
                            <Play size={12} /> Start Task
                          </button>
                        )}
                        {s.stage_status === 'in_progress' && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStage(s.stage_id, 'complete', taskNote || undefined)}>
                            <Check size={12} /> Mark Complete
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => { setShowReassign(s.stage_id); setReassignTo(''); }}>
                          <RotateCcw size={12} /> Reassign
                        </button>
                        <Link href={`/dashboard/projects/${s.engagement_id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={12} /> Open Project
                        </Link>
                      </div>

                      {/* Reassign inline */}
                      {showReassign === s.stage_id && (
                        <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                          <select className="form-select" style={{ flex: 1, fontSize: 'var(--font-size-sm)' }} value={reassignTo} onChange={e => setReassignTo(e.target.value)}>
                            <option value="">Select teammate...</option>
                            {(teammates || []).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <button className="btn btn-primary btn-sm" disabled={!reassignTo} onClick={() => updateStage(s.stage_id, 'reassign', undefined, reassignTo)}>Transfer</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setShowReassign(null)}><X size={14} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════ PERFORMANCE TAB ═══════ */}
      {tab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Performance KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, margin: '0 auto var(--space-2)', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={24} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{kpis.completionRate}%</div>
              <div className="text-sm text-muted">Completion Rate</div>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, margin: '0 auto var(--space-2)', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{kpis.clientsServed}</div>
              <div className="text-sm text-muted">Clients Served</div>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, margin: '0 auto var(--space-2)', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{kpis.totalHours}h</div>
              <div className="text-sm text-muted">Hours Logged (30d)</div>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, margin: '0 auto var(--space-2)', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{formatCurrency(kpis.totalRevenue)}</div>
              <div className="text-sm text-muted">Revenue Attributed</div>
            </div>
          </div>

          {/* Workload Capacity Gauge */}
          <div className="card">
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><TrendingUp size={18} /> Workload Capacity</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {['Active', 'Pending', 'Completed'].map(label => {
                  const val = label === 'Active' ? kpis.activeStages : label === 'Pending' ? kpis.pendingStages : kpis.completedStages;
                  const total = kpis.activeStages + kpis.pendingStages + kpis.completedStages;
                  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                  const color = label === 'Active' ? 'var(--color-primary)' : label === 'Pending' ? 'var(--color-warning)' : 'var(--color-success)';
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="text-sm" style={{ fontWeight: 600 }}>{label}</span>
                        <span className="text-sm text-muted">{val} tasks ({pct}%)</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--color-gray-100)', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 5, transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Entry Log */}
          <div className="card">
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Clock size={18} /> Time Log (Last 30 Days)</h3>
              <span className="badge badge-blue">{kpis.totalHours}h total</span>
            </div>
            <div className="data-table-wrapper" style={{ border: 'none', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
              <table className="data-table text-sm">
                <thead><tr><th>Description</th><th>Client</th><th>Project</th><th>Date</th><th>Duration</th><th>Rate</th><th>Billable Amount</th></tr></thead>
                <tbody>
                  {(timeEntries || []).map((te: any) => (
                    <tr key={te.id}>
                      <td style={{ fontWeight: 500 }}>{te.description}</td>
                      <td>{te.client_name || '—'}</td>
                      <td className="text-xs">{te.template_name || '—'}<br /><span className="text-muted">{te.engagement_code}</span></td>
                      <td>{formatDate(te.entry_date)}</td>
                      <td><span className="badge badge-blue">{Math.floor(te.duration_minutes / 60)}h {te.duration_minutes % 60}m</span></td>
                      <td>{te.hourly_rate ? `$${te.hourly_rate}/hr` : '—'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>{te.hourly_rate ? formatCurrency((te.duration_minutes / 60) * te.hourly_rate) : '—'}</td>
                    </tr>
                  ))}
                  {(!timeEntries || timeEntries.length === 0) && <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No time entries in the last 30 days.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ NOTIFICATIONS TAB ═══════ */}
      {tab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Pending Reminders */}
          {reminders && reminders.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-2)' }}>
              <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Bell size={18} /> Pending Reminders</h3>
                <span className="badge badge-yellow">{reminders.length}</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {reminders.map((r: any) => {
                  const isPast = new Date(r.trigger_date) < now;
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)', background: isPast ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPast ? 'var(--color-danger)' : 'var(--color-warning)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{r.title}</div>
                        <div className="text-xs text-muted">{r.client_name} · {r.engagement_code} · Due {formatDate(r.trigger_date)}</div>
                      </div>
                      {isPast && <span className="badge badge-red" style={{ fontSize: 10 }}>Overdue</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inbox Notifications */}
          <div className="card">
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><MessageSquare size={18} /> Recent Notifications</h3></div>
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {(notifications || []).map((n: any) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)', background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.03)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.is_read ? 'var(--color-gray-100)' : 'var(--color-primary-light)', color: n.is_read ? 'var(--color-gray-400)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {n.item_type === 'document_uploaded' ? <FileText size={16} /> : n.item_type === 'invoice_paid' ? <DollarSign size={16} /> : n.item_type === 'deadline_approaching' ? <AlertTriangle size={16} /> : <Bell size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: 'var(--font-size-sm)' }}>{n.title}</div>
                    <div className="text-xs text-muted">{n.message}</div>
                  </div>
                  <div className="text-xs text-muted" style={{ flexShrink: 0 }}>{timeAgo(n.created_at)}</div>
                </div>
              ))}
              {(!notifications || notifications.length === 0) && (
                <div className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>
                  <Bell size={40} style={{ marginBottom: 8 }} /><h3>All caught up!</h3><p className="text-sm">No new notifications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
