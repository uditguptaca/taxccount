'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Clock, Calendar, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function daysUntil(d: string) { if (!d) return null; return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

export default function StaffRemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<any[]>([]);
  const [systemReminders, setSystemReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', trigger_date: '', description: '' });

  function loadData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    Promise.all([
      fetch(`/api/staff/reminders?user_id=${user.id}`).then(r => r.json()),
      fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()),
    ]).then(([reminderData, dashData]) => {
      setReminders(reminderData.reminders || []);
      setSystemReminders(dashData.systemReminders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await fetch('/api/staff/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, title: form.title, trigger_date: form.trigger_date })
    });
    setShowModal(false);
    setForm({ title: '', trigger_date: '', description: '' });
    loadData();
  }

  async function handleAction(id: string, action: string) {
    await fetch('/api/staff/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reminder_id: id, action, snooze_days: 3 })
    });
    loadData();
  }

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading reminders...</div>;

  // Combine all reminders
  const allItems = [
    ...reminders.map((r: any) => ({ ...r, _source: 'personal' })),
    ...systemReminders.map((r: any) => ({ ...r, _source: 'system' })),
  ].map((r: any) => {
    const days = daysUntil(r.trigger_date);
    const computedStatus = r.status === 'dismissed' ? 'dismissed' : (days !== null && days < 0) ? 'overdue' : (days !== null && days <= 3) ? 'upcoming' : 'pending';
    return { ...r, computedStatus, days };
  });

  const filtered = filter === 'all' ? allItems.filter(r => r.computedStatus !== 'dismissed') : allItems.filter(r => r.computedStatus === filter);
  const counts = {
    all: allItems.filter(r => r.computedStatus !== 'dismissed').length,
    upcoming: allItems.filter(r => r.computedStatus === 'upcoming').length,
    overdue: allItems.filter(r => r.computedStatus === 'overdue').length,
    dismissed: allItems.filter(r => r.computedStatus === 'dismissed').length,
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Bell size={28} /> Reminders</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Personal and system reminders for your tasks and deadlines</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Reminder</button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'all', label: 'Active' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'dismissed', label: 'Dismissed' },
        ].map(f => (
          <button key={f.key} className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f.key)}>
            {f.label} ({(counts as any)[f.key] || 0})
          </button>
        ))}
      </div>

      {/* Reminder Cards */}
      <div className="reminder-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
        {filtered.map((r: any) => (
          <div key={r.id} className="card" style={{
            borderLeft: `4px solid ${r.computedStatus === 'overdue' ? 'var(--color-danger)' : r.computedStatus === 'upcoming' ? 'var(--color-warning)' : r.computedStatus === 'dismissed' ? 'var(--color-gray-300)' : '#6366f1'}`,
            opacity: r.computedStatus === 'dismissed' ? 0.6 : 1,
          }}>
            <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: r.computedStatus === 'overdue' ? 'rgba(239,68,68,0.1)' : r.computedStatus === 'upcoming' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                color: r.computedStatus === 'overdue' ? 'var(--color-danger)' : r.computedStatus === 'upcoming' ? 'var(--color-warning)' : '#6366f1',
              }}>
                {r.computedStatus === 'overdue' ? <AlertTriangle size={18} /> : r.computedStatus === 'upcoming' ? <Clock size={18} /> : <Bell size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>{r.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {formatDate(r.trigger_date)}</span>
                  {r.days !== null && (
                    <span style={{ fontWeight: 600, color: r.days < 0 ? 'var(--color-danger)' : r.days <= 3 ? 'var(--color-warning)' : 'inherit' }}>
                      {r.days < 0 ? `${Math.abs(r.days)} days overdue` : r.days === 0 ? 'Due today' : `${r.days} days left`}
                    </span>
                  )}
                  <span className={`badge ${r._source === 'personal' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 9 }}>
                    {r._source === 'personal' ? 'Personal' : 'System'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className={`badge ${r.computedStatus === 'overdue' ? 'badge-red' : r.computedStatus === 'upcoming' ? 'badge-yellow' : r.computedStatus === 'dismissed' ? 'badge-gray' : 'badge-blue'}`}>
                  {r.computedStatus === 'overdue' ? <><AlertTriangle size={10} /> Overdue</> :
                    r.computedStatus === 'upcoming' ? <><Clock size={10} /> Upcoming</> :
                      r.computedStatus === 'dismissed' ? 'Dismissed' : 'Pending'}
                </span>
                {r._source === 'personal' && r.computedStatus !== 'dismissed' && (
                  <>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => handleAction(r.id, 'snooze')}>Snooze</button>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--color-gray-400)' }} onClick={() => handleAction(r.id, 'dismiss')}>Dismiss</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
            <Bell size={40} style={{ marginBottom: 8 }} />
            <h3>No reminders</h3>
            <p className="text-sm">Create a personal reminder to stay on track.</p>
          </div>
        )}
      </div>

      {/* New Reminder Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2>New Reminder</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="E.g., Follow up with client" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date" required value={form.trigger_date} onChange={e => setForm({...form, trigger_date: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
