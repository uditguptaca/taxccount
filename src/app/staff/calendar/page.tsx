'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Clock, Briefcase } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'; }

export default function StaffCalendarPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading calendar...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load data.</div>;

  const { assignedStages, staffTasks } = data;

  // Build events
  const events = [
    ...(assignedStages || []).filter((s: any) => s.due_date).map((s: any) => ({
      id: s.stage_id, name: s.stage_name, dueDate: s.due_date, status: s.stage_status,
      client: s.client_name, project: s.template_name, code: s.engagement_code,
      priority: s.priority, type: 'compliance'
    })),
    ...(staffTasks || []).filter((t: any) => t.due_date).map((t: any) => ({
      id: t.id, name: t.title, dueDate: t.due_date, status: t.status,
      client: t.client_name || '—', project: t.template_name || 'Ad-hoc', code: t.engagement_code,
      priority: t.priority, type: 'adhoc'
    })),
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthLabel = currentDate.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.dueDate === dateStr);
  };

  const statusColor = (s: string) => {
    if (s === 'completed') return 'var(--color-success)';
    if (s === 'in_progress') return '#6366f1';
    return 'var(--color-warning)';
  };

  const priorityColor: Record<string, string> = { urgent: 'var(--color-danger)', high: '#f59e0b', medium: '#6366f1', low: 'var(--color-gray-400)' };

  // build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CalIcon size={28} /> My Calendar</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Deadlines and tasks assigned to you</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span><span className="text-xs">Done</span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', display: 'inline-block', marginLeft: 8 }}></span><span className="text-xs">Active</span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-warning)', display: 'inline-block', marginLeft: 8 }}></span><span className="text-xs">Pending</span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-danger)', display: 'inline-block', marginLeft: 8 }}></span><span className="text-xs">Overdue</span>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)' }}>
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>{monthLabel}</h2>
            <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid var(--color-gray-200)' }}>
          {daysOfWeek.map(d => (
            <div key={d} style={{ padding: 'var(--space-2)', textAlign: 'center', fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)' }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} style={{ minHeight: 100, background: 'var(--color-gray-50)', borderRight: '1px solid var(--color-gray-100)', borderBottom: '1px solid var(--color-gray-100)' }}></div>;
            const dayEvents = getEventsForDay(day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;

            return (
              <div key={day} style={{ minHeight: 100, padding: 'var(--space-1)', borderRight: '1px solid var(--color-gray-100)', borderBottom: '1px solid var(--color-gray-100)', background: isToday ? 'rgba(99,102,241,0.04)' : 'white', position: 'relative' }}>
                <div style={{ textAlign: 'right', marginBottom: 2 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', fontSize: 'var(--font-size-xs)', fontWeight: isToday ? 700 : 400, background: isToday ? '#6366f1' : 'transparent', color: isToday ? 'white' : 'var(--color-gray-600)' }}>{day}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayEvents.slice(0, 3).map(ev => {
                    const overdue = new Date(ev.dueDate) < today && ev.status !== 'completed';
                    return (
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{
                        padding: '2px 4px', borderRadius: 3, fontSize: 10, fontWeight: 500, cursor: 'pointer',
                        background: overdue ? 'rgba(239,68,68,0.1)' : `${statusColor(ev.status)}15`,
                        color: overdue ? 'var(--color-danger)' : statusColor(ev.status),
                        borderLeft: `2px solid ${overdue ? 'var(--color-danger)' : statusColor(ev.status)}`,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {ev.name}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && <div style={{ fontSize: 9, color: 'var(--color-gray-400)', textAlign: 'center' }}>+{dayEvents.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(selectedEvent.status) }}></div>
                {selectedEvent.name}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div><span className="text-xs text-muted">Client</span><div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{selectedEvent.client}</div></div>
                <div><span className="text-xs text-muted">Project</span><div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{selectedEvent.project}</div></div>
                <div><span className="text-xs text-muted">Due Date</span><div style={{ fontWeight: 600 }}>{formatDate(selectedEvent.dueDate)}</div></div>
                <div><span className="text-xs text-muted">Priority</span><div><span className="badge" style={{ background: `${priorityColor[selectedEvent.priority]}20`, color: priorityColor[selectedEvent.priority], border: `1px solid ${priorityColor[selectedEvent.priority]}40` }}>{selectedEvent.priority}</span></div></div>
                <div><span className="text-xs text-muted">Status</span><div><span className={`badge ${selectedEvent.status === 'completed' ? 'badge-green' : selectedEvent.status === 'in_progress' ? 'badge-blue' : 'badge-yellow'}`}>{selectedEvent.status.replace(/_/g, ' ')}</span></div></div>
                <div><span className="text-xs text-muted">Type</span><div><span className={`badge ${selectedEvent.type === 'compliance' ? 'badge-blue' : 'badge-cyan'}`}>{selectedEvent.type === 'compliance' ? 'Compliance' : 'Ad-hoc'}</span></div></div>
              </div>
              {selectedEvent.code && <div style={{ marginTop: 'var(--space-3)' }}><span className="text-xs text-muted">Engagement Code</span><div style={{ fontWeight: 500 }}>{selectedEvent.code}</div></div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setSelectedEvent(null); router.push('/staff/tasks'); }}>View in My Tasks</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
