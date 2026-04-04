'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList, AlertTriangle, Search, Filter, ArrowUpDown,
  Play, Check, Send, X, ChevronDown, ExternalLink, RotateCcw,
  Briefcase, Clock, CalendarDays, Tag
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function StaffTasksPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('due_date');

  // Expanded task
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [taskNote, setTaskNote] = useState('');
  const [showReassign, setShowReassign] = useState<string | null>(null);
  const [reassignTo, setReassignTo] = useState('');

  function loadData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  async function updateTask(taskType: string, taskId: string, action: string, notes?: string, newUserId?: string) {
    await fetch('/api/staff/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_type: taskType, task_id: taskId, action, notes, new_user_id: newUserId }),
    });
    loadData();
    setExpandedTask(null);
    setTaskNote('');
    setShowReassign(null);
    setReassignTo('');
  }

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading tasks...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load tasks.</div>;

  const { assignedStages, staffTasks, teammates } = data;
  const now = new Date();

  const priorityColor: Record<string, string> = { urgent: 'var(--color-danger)', high: '#f59e0b', medium: 'var(--color-primary)', low: 'var(--color-gray-400)' };
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

  // Unify tasks
  const allTasks = [
    ...(assignedStages || []).map((s: any) => ({
      _type: 'stage' as const, _id: s.stage_id, _name: s.stage_name, _priority: s.priority,
      _dueDate: s.due_date, _status: s.stage_status, _clientName: s.client_name, _clientCode: s.client_code,
      _clientId: s.client_id, _clientType: s.client_type, _project: s.template_name,
      _engagementCode: s.engagement_code, _engagementId: s.engagement_id, _financialYear: s.financial_year,
      _teamName: s.team_name, _price: s.price, _notes: s.stage_notes,
      _startedAt: s.started_at, _completedAt: s.completed_at, _description: null,
    })),
    ...(staffTasks || []).map((t: any) => ({
      _type: 'staff_task' as const, _id: t.id, _name: t.title, _priority: t.priority,
      _dueDate: t.due_date, _status: t.status, _clientName: t.client_name || '—', _clientCode: t.client_code,
      _clientId: t.client_id, _clientType: null, _project: t.template_name || 'Ad-hoc Task',
      _engagementCode: t.engagement_code, _engagementId: t.engagement_id, _financialYear: null,
      _teamName: null, _price: null, _notes: t.notes,
      _startedAt: null, _completedAt: t.completed_at, _description: t.description,
      _assignedByName: t.assigned_by_name,
    })),
  ];

  // Filter
  const filteredTasks = allTasks.filter(t => {
    if (statusFilter !== 'all' && t._status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t._priority !== priorityFilter) return false;
    if (typeFilter !== 'all' && t._type !== typeFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      if (!t._name.toLowerCase().includes(q) && !t._clientName?.toLowerCase().includes(q) && !t._project?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'due_date') return (a._dueDate || '9999').localeCompare(b._dueDate || '9999');
    if (sortBy === 'priority') return (priorityOrder[a._priority] ?? 2) - (priorityOrder[b._priority] ?? 2);
    if (sortBy === 'client') return (a._clientName || '').localeCompare(b._clientName || '');
    if (sortBy === 'status') {
      const so: Record<string, number> = { in_progress: 0, pending: 1, completed: 2 };
      return (so[a._status] ?? 2) - (so[b._status] ?? 2);
    }
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

  // Summary counts
  const counts = {
    all: allTasks.length,
    in_progress: allTasks.filter(t => t._status === 'in_progress').length,
    pending: allTasks.filter(t => t._status === 'pending').length,
    completed: allTasks.filter(t => t._status === 'completed').length,
  };

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><ClipboardList size={28} /> My Tasks</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>All compliance stages and ad-hoc tasks assigned to you</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span className="badge badge-blue" style={{ padding: '6px 12px', fontSize: 12 }}>{counts.in_progress} Active</span>
          <span className="badge badge-yellow" style={{ padding: '6px 12px', fontSize: 12 }}>{counts.pending} Pending</span>
          <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: 12 }}>{counts.completed} Done</span>
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
          { key: 'pending', label: `Pending (${counts.pending})` },
          { key: 'completed', label: `Completed (${counts.completed})` },
        ].map(s => (
          <button key={s.key} className={`btn ${statusFilter === s.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setStatusFilter(s.key)}>{s.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="topbar-search" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input type="text" placeholder="Search tasks, clients, projects..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Tag size={14} style={{ color: 'var(--color-gray-400)' }} />
            <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 100 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="stage">Compliance</option>
              <option value="staff_task">Ad-hoc</option>
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
              <option value="client">Client</option>
              <option value="status">Status</option>
            </select>
          </div>
          <span className="badge badge-gray">{filteredTasks.length} tasks</span>
        </div>
      </div>

      {/* Task Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filteredTasks.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
            <Briefcase size={40} style={{ marginBottom: 8 }} />
            <h3>No tasks match your filters</h3>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const overdue = isOverdue(task._dueDate, task._status);
            const days = daysUntilDue(task._dueDate);
            const isExpanded = expandedTask === `${task._type}-${task._id}`;

            return (
              <div key={`${task._type}-${task._id}`} className="card" style={{
                borderLeft: `4px solid ${task._status === 'completed' ? 'var(--color-success)' : overdue ? 'var(--color-danger)' : task._status === 'in_progress' ? '#6366f1' : 'var(--color-gray-300)'}`,
                overflow: 'hidden'
              }}>
                <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setExpandedTask(isExpanded ? null : `${task._type}-${task._id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
                    {overdue && <AlertTriangle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {task._name}
                        <span className="badge" style={{ fontSize: 9, background: `${priorityColor[task._priority]}15`, color: priorityColor[task._priority], border: `1px solid ${priorityColor[task._priority]}30` }}>{task._priority}</span>
                        <span className={`badge ${task._type === 'stage' ? 'badge-blue' : 'badge-cyan'}`} style={{ fontSize: 9 }}>
                          {task._type === 'stage' ? 'Compliance' : 'Ad-hoc'}
                        </span>
                      </div>
                      <div className="text-xs text-muted">{task._clientName} · {task._project} {task._engagementCode ? `· ${task._engagementCode}` : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-xs" style={{ fontWeight: 600, color: overdue ? 'var(--color-danger)' : days !== null && days <= 7 ? 'var(--color-warning)' : 'var(--color-gray-500)' }}>
                        {task._status === 'completed' ? 'Done' : overdue ? 'OVERDUE' : days !== null && days <= 0 ? 'Due Today' : days !== null ? `${days}d left` : '—'}
                      </div>
                      <div className="text-xs text-muted">{formatDate(task._dueDate)}</div>
                    </div>
                    <span className={`badge ${task._status === 'completed' ? 'badge-green' : task._status === 'in_progress' ? 'badge-blue' : 'badge-gray'}`}>
                      <span className="badge-dot"></span>{task._status.replace(/_/g, ' ')}
                    </span>
                    <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--color-gray-200)', padding: 'var(--space-4)', background: 'var(--color-gray-50)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <div className="text-xs text-muted">Client</div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{task._clientName}</div>
                        {task._clientCode && <div className="text-xs text-muted">{task._clientCode} · {task._clientType}</div>}
                      </div>
                      <div>
                        <div className="text-xs text-muted">Project</div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{task._project}</div>
                        {task._engagementCode && <div className="text-xs text-muted">{task._engagementCode} {task._financialYear ? `· FY ${task._financialYear}` : ''}</div>}
                      </div>
                      <div>
                        <div className="text-xs text-muted">{task._type === 'stage' ? 'Price' : 'Assigned By'}</div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                          {task._type === 'stage' ? formatCurrency(task._price) : (task as any)._assignedByName || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted">{task._type === 'stage' ? 'Team' : 'Description'}</div>
                        <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                          {task._type === 'stage' ? (task._teamName || '—') : ((task as any)._description || '—')}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                      <div className="text-xs text-muted" style={{ marginBottom: 4 }}>Add Note / Comment</div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <input className="form-input" placeholder="Add a note to this task..." value={taskNote}
                          onChange={e => setTaskNote(e.target.value)} style={{ flex: 1, fontSize: 'var(--font-size-sm)' }} />
                        <button className="btn btn-secondary btn-sm" disabled={!taskNote}
                          onClick={() => updateTask(task._type, task._id, 'add_note', taskNote)}>
                          <Send size={12} /> Save Note
                        </button>
                      </div>
                      {task._notes && <div className="text-xs" style={{ marginTop: 4, padding: 'var(--space-2)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }}>{task._notes}</div>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {task._status === 'pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateTask(task._type, task._id, 'start')}>
                          <Play size={12} /> Start Task
                        </button>
                      )}
                      {task._status === 'in_progress' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateTask(task._type, task._id, 'complete', taskNote || undefined)}>
                          <Check size={12} /> Mark Complete
                        </button>
                      )}
                      {task._type === 'stage' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => { setShowReassign(`${task._type}-${task._id}`); setReassignTo(''); }}>
                          <RotateCcw size={12} /> Reassign
                        </button>
                      )}
                      {task._engagementId && (
                        <Link href={`/dashboard/projects/${task._engagementId}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={12} /> Open Project
                        </Link>
                      )}
                    </div>

                    {/* Reassign inline (stages only) */}
                    {showReassign === `${task._type}-${task._id}` && task._type === 'stage' && (
                      <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <select className="form-select" style={{ flex: 1, fontSize: 'var(--font-size-sm)' }} value={reassignTo} onChange={e => setReassignTo(e.target.value)}>
                          <option value="">Select teammate...</option>
                          {(teammates || []).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button className="btn btn-primary btn-sm" disabled={!reassignTo} onClick={() => updateTask('stage', task._id, 'reassign', undefined, reassignTo)}>Transfer</button>
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
    </>
  );
}
