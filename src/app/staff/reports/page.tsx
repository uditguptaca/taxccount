'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart2, Target, Users, Clock, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle, Briefcase
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function StaffReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading performance data...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load data.</div>;

  const { kpis, assignedStages, staffTasks, timeEntries } = data;

  // Task breakdown by status
  const allTasks = [
    ...(assignedStages || []).map((s: any) => ({ status: s.stage_status, priority: s.priority, dueDate: s.due_date, completedAt: s.completed_at })),
    ...(staffTasks || []).map((t: any) => ({ status: t.status, priority: t.priority, dueDate: t.due_date, completedAt: t.completed_at })),
  ];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Priority breakdown
  const priorityCounts: Record<string, number> = { urgent: 0, high: 0, medium: 0, low: 0 };
  allTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').forEach(t => {
    priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
  });

  // Overdue detail
  const overdueItems = allTasks.filter(t => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    return t.dueDate && new Date(t.dueDate) < now;
  });

  // Time entries by day (for chart simulation)
  const dailyHours: Record<string, number> = {};
  (timeEntries || []).forEach((te: any) => {
    const d = te.entry_date;
    dailyHours[d] = (dailyHours[d] || 0) + (te.duration_minutes || 0);
  });
  const sortedDays = Object.keys(dailyHours).sort().slice(-14); // last 14 days with entries

  const gradients = [
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
  ];

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><BarChart2 size={28} /> Performance & Reports</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Your productivity metrics and KPI dashboard</p>
        </div>
      </div>

      {/* ═══════ KPI HERO CARDS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {[
          { icon: Target, label: 'Completion Rate', value: `${kpis.completionRate}%`, gradient: gradients[0] },
          { icon: Users, label: 'Clients Served', value: kpis.clientsServed, gradient: gradients[1] },
          { icon: Clock, label: 'Hours Logged (30d)', value: `${kpis.totalHours}h`, gradient: gradients[2] },
          { icon: DollarSign, label: 'Revenue Attributed', value: formatCurrency(kpis.totalRevenue), gradient: gradients[3] },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, margin: '0 auto var(--space-3)',
                borderRadius: '50%', background: card.gradient,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={28} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{card.value}</div>
              <div className="text-sm text-muted">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* ═══════ TWO-COLUMN: Workload + Priority ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {/* Workload Capacity */}
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><TrendingUp size={18} /> Workload Capacity</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { label: 'Active', val: kpis.totalActive, color: '#6366f1' },
                { label: 'Pending', val: kpis.totalPending, color: 'var(--color-warning)' },
                { label: 'Completed', val: kpis.totalCompleted, color: 'var(--color-success)' },
                { label: 'Overdue', val: kpis.totalOverdue, color: 'var(--color-danger)' },
              ].map(item => {
                const total = kpis.totalActive + kpis.totalPending + kpis.totalCompleted;
                const pct = total > 0 ? Math.round((item.val / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="text-sm" style={{ fontWeight: 600 }}>{item.label}</span>
                      <span className="text-sm text-muted">{item.val} tasks ({pct}%)</span>
                    </div>
                    <div style={{ height: 10, background: 'var(--color-gray-100)', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 5, transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><AlertTriangle size={18} /> Priority Distribution</h3>
            <span className="text-xs text-muted">Active + Pending tasks</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { label: 'Urgent', val: priorityCounts.urgent, color: 'var(--color-danger)' },
                { label: 'High', val: priorityCounts.high, color: '#f59e0b' },
                { label: 'Medium', val: priorityCounts.medium, color: '#6366f1' },
                { label: 'Low', val: priorityCounts.low, color: 'var(--color-gray-400)' },
              ].map(item => {
                const totalActive = Object.values(priorityCounts).reduce((s, v) => s + v, 0);
                const pct = totalActive > 0 ? Math.round((item.val / totalActive) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }}></div>
                        <span className="text-sm" style={{ fontWeight: 600 }}>{item.label}</span>
                      </div>
                      <span className="text-sm text-muted">{item.val} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 4, transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ DAILY HOURS BAR CHART ═══════ */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Clock size={18} /> Daily Hours (Last 14 Active Days)</h3>
          <span className="badge badge-blue">{kpis.totalHours}h total</span>
        </div>
        <div className="card-body">
          {sortedDays.length > 0 ? (
            <div className="dashboard-bar-chart" style={{ height: 180 }}>
              {sortedDays.map(day => {
                const mins = dailyHours[day] || 0;
                const hrs = Math.round(mins / 60 * 10) / 10;
                const maxMins = Math.max(...sortedDays.map(d => dailyHours[d] || 0));
                const pct = maxMins > 0 ? Math.max(5, (mins / maxMins) * 100) : 5;
                const dayLabel = new Date(day + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
                return (
                  <div key={day} className="bar-column" title={`${dayLabel}: ${hrs}h`}>
                    <span className="text-xs" style={{ fontWeight: 600, color: '#6366f1' }}>{hrs}h</span>
                    <div className="bar-fill" style={{ height: `${pct}%`, background: 'linear-gradient(to top, #6366f1, #818cf8)' }}></div>
                    <span className="text-xs text-muted" style={{ fontSize: 10 }}>{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No time entries in the last 30 days</div>
          )}
        </div>
      </div>

      {/* ═══════ TIME LOG TABLE ═══════ */}
      <div className="card">
        <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Clock size={18} /> Time Log (Last 30 Days)</h3></div>
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
              {(!timeEntries || timeEntries.length === 0) && <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No time entries.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
