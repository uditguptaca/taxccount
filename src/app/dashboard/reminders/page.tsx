'use client';
import { useEffect, useState } from 'react';
import { Bell, Clock, Mail, Smartphone, Calendar, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function daysUntil(d: string) { if (!d) return null; return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

export default function RemindersPage() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', title: '', trigger_date: '', reminder_type: 'custom', channel: 'in_app', message_template: '' });

  const loadData = () => fetch('/api/reminders').then(r => r.json()).then(setData);
  useEffect(() => { loadData(); }, []);

  async function handleCreateReminder(e: React.FormEvent) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id: user.id || 'system' })
    });
    setShowModal(false);
    setForm({ client_id: '', title: '', trigger_date: '', reminder_type: 'custom', channel: 'in_app', message_template: '' });
    loadData();
  }

  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading reminders...</div>;

  const reminders = (data.reminders || []).map((r: any) => {
    const days = daysUntil(r.trigger_date);
    const computedStatus = r.status === 'sent' ? 'sent' : (days !== null && days < 0) ? 'overdue' : (days !== null && days <= 3) ? 'upcoming' : 'pending';
    return { ...r, computedStatus, days };
  });

  const filtered = filter === 'all' ? reminders : reminders.filter((r: any) => r.computedStatus === filter);
  const counts = { all: reminders.length, upcoming: reminders.filter((r: any) => r.computedStatus === 'upcoming').length, overdue: reminders.filter((r: any) => r.computedStatus === 'overdue').length, sent: reminders.filter((r: any) => r.computedStatus === 'sent').length };

  const channelIcon = (ch: string) => {
    if (ch === 'email') return <Mail size={14} />;
    if (ch === 'in_app') return <Smartphone size={14} />;
    return <><Mail size={14} /><Smartphone size={14} /></>;
  };

  const typeIcon = (t: string) => {
    if (t === 'deadline') return <Calendar size={18} />;
    if (t === 'payment') return <AlertTriangle size={18} />;
    if (t === 'document_request') return <Send size={18} />;
    return <Bell size={18} />;
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Reminders</h1><p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Compliance deadlines, document requests, and payment reminders</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Bell size={18} /> New Reminder</button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'sent', label: 'Sent' },
        ].map(f => (
          <button key={f.key} className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f.key)}>
            {f.label} ({(counts as any)[f.key]})
          </button>
        ))}
      </div>

      <div className="reminder-grid">
        {filtered.map((r: any) => (
          <div key={r.id} className={`reminder-card ${r.computedStatus}`}>
            <div className="reminder-icon" style={{
              background: r.computedStatus === 'overdue' ? 'var(--color-danger-light)' : r.computedStatus === 'upcoming' ? 'var(--color-warning-light)' : r.computedStatus === 'sent' ? 'var(--color-success-light)' : 'var(--color-primary-light)',
              color: r.computedStatus === 'overdue' ? 'var(--color-danger)' : r.computedStatus === 'upcoming' ? 'var(--color-warning)' : r.computedStatus === 'sent' ? 'var(--color-success)' : 'var(--color-primary)',
            }}>
              {typeIcon(r.reminder_type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{r.title}</span>
                <span className={`badge ${r.computedStatus === 'overdue' ? 'badge-red' : r.computedStatus === 'upcoming' ? 'badge-yellow' : r.computedStatus === 'sent' ? 'badge-green' : 'badge-gray'}`}>
                  {r.computedStatus === 'overdue' ? <><AlertTriangle size={10} /> Overdue</> :
                   r.computedStatus === 'upcoming' ? <><Clock size={10} /> Upcoming</> :
                   r.computedStatus === 'sent' ? <><CheckCircle2 size={10} /> Sent</> : 'Pending'}
                </span>
              </div>
              <div className="text-xs text-muted" style={{ marginBottom: 'var(--space-1)' }}>{r.client_name} {r.engagement_code ? `• ${r.engagement_code}` : ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {formatDate(r.trigger_date)}</span>
                {r.days !== null && <span style={{ fontWeight: 600, color: r.days < 0 ? 'var(--color-danger)' : r.days <= 3 ? 'var(--color-warning)' : 'inherit' }}>
                  {r.days < 0 ? `${Math.abs(r.days)} days overdue` : r.days === 0 ? 'Due today' : `${r.days} days left`}
                </span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{channelIcon(r.channel)} {r.channel.replace('_', ' ')}</span>
                {r.is_recurring ? <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Recurring</span> : null}
                <span>Assigned: {r.assigned_to}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No reminders found</div>}
      </div>

      {/* New Reminder Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>New Reminder</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateReminder}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client (Optional)</label>
                  <select className="form-select" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
                    <option value="">No specific client</option>
                    {(data.clients || []).map((c: any) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="E.g., Call CRA" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" required value={form.trigger_date} onChange={e => setForm({...form, trigger_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.reminder_type} onChange={e => setForm({...form, reminder_type: e.target.value})}>
                      <option value="custom">General Reminder</option>
                      <option value="deadline">Deadline</option>
                      <option value="document_request">Document Request</option>
                      <option value="payment">Payment Reminder</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Channel</label>
                  <select className="form-select" value={form.channel} onChange={e => setForm({...form, channel: e.target.value})}>
                    <option value="in_app">In-App (Taxccount)</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="all">All Channels</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message Template</label>
                  <textarea className="form-input" value={form.message_template} onChange={e => setForm({...form, message_template: e.target.value})} placeholder="Leave blank to use default template..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
