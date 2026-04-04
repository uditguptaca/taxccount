'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Clock, CheckCircle, AlertTriangle, Briefcase,
  DollarSign, Calendar, Target, TrendingUp, Play, Check, Bell,
  ClipboardList, Users, ArrowRight, ExternalLink, FileText
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function timeAgo(d: string) {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateReminder, setShowCreateReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function quickAction(taskType: string, taskId: string, action: string) {
    await fetch('/api/staff/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_type: taskType, task_id: taskId, action }),
    });
    // Reload
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => setData(d));
  }

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading your dashboard...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load dashboard.</div>;

  const { user, kpis, assignedStages, staffTasks, timeEntries, notifications, systemReminders, staffReminders } = data;
  const now = new Date();

  const priorityColor: Record<string, string> = { urgent: 'var(--color-danger)', high: '#f59e0b', medium: 'var(--color-primary)', low: 'var(--color-gray-400)' };

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < now;
  };

  const daysUntilDue = (dueDate: string) => {
    if (!dueDate) return null;
    return Math.ceil((new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Combine active items for the work queue
  const activeWork = [
    ...(assignedStages || []).filter((s: any) => s.stage_status === 'in_progress').map((s: any) => ({
      ...s, _type: 'stage', _id: s.stage_id, _name: s.stage_name, _priority: s.priority, _dueDate: s.due_date, _clientName: s.client_name, _project: s.template_name
    })),
    ...(staffTasks || []).filter((t: any) => t.status === 'in_progress').map((t: any) => ({
      ...t, _type: 'staff_task', _id: t.id, _name: t.title, _priority: t.priority, _dueDate: t.due_date, _clientName: t.client_name || '—', _project: t.template_name || 'Ad-hoc Task'
    })),
  ].sort((a, b) => (a._dueDate || '9999').localeCompare(b._dueDate || '9999'));

  // Combine all upcoming deadlines
  const upcomingDeadlines = [
    ...(assignedStages || []).filter((s: any) => s.stage_status !== 'completed' && s.due_date).map((s: any) => ({
      _type: 'stage', _id: s.stage_id, _name: s.stage_name, _dueDate: s.due_date, _clientName: s.client_name, _project: s.template_name, _status: s.stage_status
    })),
    ...(staffTasks || []).filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled' && t.due_date).map((t: any) => ({
      _type: 'staff_task', _id: t.id, _name: t.title, _dueDate: t.due_date, _clientName: t.client_name || '—', _project: t.template_name || 'Ad-hoc', _status: t.status
    })),
  ].sort((a, b) => (a._dueDate || '9999').localeCompare(b._dueDate || '9999')).slice(0, 8);

  // Combine reminders
  const allReminders = [
    ...(systemReminders || []).map((r: any) => ({ ...r, _source: 'system' })),
    ...(staffReminders || []).map((r: any) => ({ ...r, _source: 'personal' })),
  ].sort((a, b) => (a.trigger_date || '').localeCompare(b.trigger_date || ''));

  return (
    <>
      {/* ═══════ HEADER ═══════ */}
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            Welcome back, {user.first_name}!
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>
            {user.role?.replace(/_/g, ' ')} {user.team_name ? `· ${user.team_name}` : ''} · {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link href="/staff/tasks" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            <ClipboardList size={14} /> View All Tasks
          </Link>
        </div>
      </div>

      {/* ═══════ KPI CARDS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Briefcase size={20} /></div>
          <div className="kpi-label">Active Tasks</div>
          <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{kpis.totalActive}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}><Clock size={20} /></div>
          <div className="kpi-label">Pending Queue</div>
          <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{kpis.totalPending}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><CheckCircle size={20} /></div>
          <div className="kpi-label">Completed</div>
          <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{kpis.totalCompleted}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: kpis.totalOverdue > 0 ? 'rgba(239,68,68,0.1)' : 'var(--color-gray-100)', color: kpis.totalOverdue > 0 ? 'var(--color-danger)' : 'var(--color-gray-400)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-label">Overdue</div>
          <div className="kpi-value" style={{ fontSize: 'var(--font-size-2xl)', color: kpis.totalOverdue > 0 ? 'var(--color-danger)' : 'inherit' }}>{kpis.totalOverdue}</div>
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

      {/* ═══════ TWO-COLUMN: Completion Rate + Deadlines ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {/* Completion Rate */}
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Target size={18} /> Completion Rate</h3></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-5)' }}>
            <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-gray-100)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={kpis.completionRate >= 75 ? 'var(--color-success)' : kpis.completionRate >= 50 ? 'var(--color-warning)' : '#6366f1'}
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
                  <span style={{ fontWeight: 700 }}>{kpis.totalActive + kpis.totalPending + kpis.totalCompleted}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Calendar size={18} /> Upcoming Deadlines</h3>
            <Link href="/staff/tasks" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>All Tasks →</Link>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 230, overflowY: 'auto' }}>
            {upcomingDeadlines.map((item: any, i) => {
              const days = daysUntilDue(item._dueDate);
              const overdue = days !== null && days < 0;
              return (
                <div key={`${item._type}-${item._id}-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)', cursor: 'pointer' }}
                  onClick={() => router.push('/staff/tasks')}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {overdue && <AlertTriangle size={12} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
                      {item._name}
                      {item._type === 'staff_task' && <span className="badge badge-cyan" style={{ fontSize: 9 }}>Ad-hoc</span>}
                    </div>
                    <div className="text-xs text-muted">{item._clientName} · {item._project}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-xs" style={{ fontWeight: 600, color: overdue ? 'var(--color-danger)' : days !== null && days <= 7 ? 'var(--color-warning)' : 'var(--color-gray-500)' }}>
                      {overdue ? 'OVERDUE' : days !== null && days === 0 ? 'Due Today' : days !== null ? `${days}d left` : '—'}
                    </div>
                    <div className="text-xs text-muted">{formatDate(item._dueDate)}</div>
                  </div>
                </div>
              );
            })}
            {upcomingDeadlines.length === 0 && (
              <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No upcoming deadlines 🎉</div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ ACTIVE WORK QUEUE ═══════ */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Briefcase size={18} /> Active Work Queue</h3>
          <Link href="/staff/tasks" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>View All →</Link>
        </div>
        <div className="data-table-wrapper" style={{ border: 'none', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <table className="data-table text-sm">
            <thead><tr><th>Task</th><th>Type</th><th>Client</th><th>Project</th><th>Due Date</th><th>Priority</th><th style={{ width: 120 }}>Action</th></tr></thead>
            <tbody>
              {activeWork.slice(0, 10).map((item: any) => {
                const overdue = isOverdue(item._dueDate, 'in_progress');
                return (
                  <tr key={`${item._type}-${item._id}`} style={{ background: overdue ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {overdue && <AlertTriangle size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
                        <div>
                          <span style={{ fontWeight: 600 }}>{item._name}</span>
                          {item.engagement_code && <div className="text-xs text-muted">{item.engagement_code}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item._type === 'stage' ? 'badge-blue' : 'badge-cyan'}`} style={{ fontSize: 10 }}>
                        {item._type === 'stage' ? 'Compliance' : 'Ad-hoc'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: 'var(--font-size-xs)' }}>{item._clientName}</td>
                    <td className="text-xs">{item._project}</td>
                    <td>
                      <div className="text-sm">{formatDate(item._dueDate)}</div>
                      {overdue && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-danger)' }}>OVERDUE</span>}
                    </td>
                    <td>
                      <span className="badge" style={{ fontSize: 10, background: `${priorityColor[item._priority]}20`, color: priorityColor[item._priority], border: `1px solid ${priorityColor[item._priority]}40` }}>
                        {item._priority}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={() => quickAction(item._type, item._id, 'complete')}>
                        <Check size={12} /> Complete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {activeWork.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No active tasks. Check your pending queue!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ TWO-COLUMN: Reminders + Recent Notifications ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {/* Reminders */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Bell size={18} /> Reminders</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="badge badge-yellow">{allReminders.length}</span>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setShowCreateReminder(!showCreateReminder)}>+ New</button>
            </div>
          </div>
          {/* Create Reminder Form */}
          {showCreateReminder && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <input className="form-input" style={{ flex: 1, fontSize: 'var(--font-size-xs)' }} placeholder="Reminder title..." value={newReminderTitle} onChange={e => setNewReminderTitle(e.target.value)} />
                <input className="form-input" style={{ width: 140, fontSize: 'var(--font-size-xs)' }} type="date" value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => { setShowCreateReminder(false); setNewReminderTitle(''); setNewReminderDate(''); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} disabled={!newReminderTitle || !newReminderDate} onClick={async () => {
                  const usr = JSON.parse(localStorage.getItem('user') || '{}');
                  await fetch('/api/staff/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: usr.id, title: newReminderTitle, trigger_date: newReminderDate }) });
                  setShowCreateReminder(false); setNewReminderTitle(''); setNewReminderDate('');
                  fetch(`/api/staff/dashboard?user_id=${usr.id}`).then(r => r.json()).then(d => setData(d));
                }}>Create</button>
              </div>
            </div>
          )}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {allReminders.slice(0, 8).map((r: any) => {
              const isPast = new Date(r.trigger_date) < now;
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)', background: isPast ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPast ? 'var(--color-danger)' : r._source === 'personal' ? '#6366f1' : 'var(--color-warning)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>{r.title}</div>
                    <div className="text-xs text-muted">{r._source === 'personal' ? 'Personal' : 'System'} · {formatDate(r.trigger_date)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {isPast && <span className="badge badge-red" style={{ fontSize: 9 }}>Past Due</span>}
                    {r._source === 'personal' && (
                      <>
                        <button title="Snooze 3 days" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--color-primary)', fontWeight: 600 }} onClick={async () => {
                          const usr = JSON.parse(localStorage.getItem('user') || '{}');
                          await fetch('/api/staff/reminders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reminder_id: r.id, action: 'snooze', snooze_days: 3 }) });
                          fetch(`/api/staff/dashboard?user_id=${usr.id}`).then(res => res.json()).then(d => setData(d));
                        }}>Snooze</button>
                        <button title="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--color-gray-400)', fontWeight: 600 }} onClick={async () => {
                          const usr = JSON.parse(localStorage.getItem('user') || '{}');
                          await fetch('/api/staff/reminders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reminder_id: r.id, action: 'dismiss' }) });
                          fetch(`/api/staff/dashboard?user_id=${usr.id}`).then(res => res.json()).then(d => setData(d));
                        }}>Dismiss</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {allReminders.length === 0 && (
              <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No pending reminders</div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Bell size={18} /> Notifications</h3>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {(notifications || []).slice(0, 8).map((n: any) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)', background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.03)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: n.is_read ? 'var(--color-gray-100)' : 'rgba(99,102,241,0.1)', color: n.is_read ? 'var(--color-gray-400)' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {n.item_type === 'document_uploaded' ? <FileText size={14} /> : n.item_type === 'invoice_paid' ? <DollarSign size={14} /> : <Bell size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: 'var(--font-size-xs)' }}>{n.title}</div>
                </div>
                <div className="text-xs text-muted" style={{ flexShrink: 0 }}>{timeAgo(n.created_at)}</div>
              </div>
            ))}
            {(!notifications || notifications.length === 0) && (
              <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>All caught up! 🎉</div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ RECENT TIME ENTRIES ═══════ */}
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
    </>
  );
}
