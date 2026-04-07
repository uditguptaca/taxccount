'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart2, Target, Users, Clock, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Briefcase, Calendar as CalendarIcon, Download,
  Settings2, X, Save
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function StaffReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtering
  const [dateRange, setDateRange] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Settings Drawer
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [targetHours, setTargetHours] = useState(35);
  const [targetUtil, setTargetUtil] = useState(80);

  const fetchDashboardData = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) { router.push('/'); return; }
      
      let url = `/api/staff/dashboard?user_id=${user.id}`;
      if (start && end) {
        url += `&start_date=${start}&end_date=${end}`;
      }
      
      const res = await fetch(url);
      const d = await res.json();
      
      if (res.ok) {
        setData(d);
        if (!start && !end && d.preferences?.default_date_range) {
          setDateRange(d.preferences.default_date_range);
          updateDatesFromRange(d.preferences.default_date_range);
        }
        setTargetHours(d.preferences?.target_billable_hours_weekly || 35);
        setTargetUtil(d.preferences?.target_utilization_pct || 80);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateDatesFromRange = (r: string) => {
    const end = new Date();
    const start = new Date();
    if (r === '7d') start.setDate(end.getDate() - 7);
    else if (r === '30d') start.setDate(end.getDate() - 30);
    else if (r === '90d') start.setDate(end.getDate() - 90);
    else if (r === 'this_month') { start.setDate(1); }
    else if (r === 'ytd') { start.setMonth(0, 1); }
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);
    fetchDashboardData(startStr, endStr);
  };

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();
  }, []);

  const handleApplyCustomDates = () => {
    setDateRange('custom');
    if (startDate && endDate) fetchDashboardData(startDate, endDate);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch('/api/staff/reports/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_date_range: dateRange === 'custom' ? '30d' : dateRange,
          target_billable_hours_weekly: targetHours,
          target_utilization_pct: targetUtil
        })
      });
      setShowSettings(false);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || !data.timeEntries) return;
    const headers = ['Description', 'Client', 'Project', 'Date', 'Duration (mins)', 'Rate', 'Total Value'];
    const rows = data.timeEntries.map((te: any) => [
      `"${te.description?.replace(/"/g, '""')}"`,
      `"${te.client_name || ''}"`,
      `"${te.engagement_code || ''}"`,
      te.entry_date,
      te.duration_minutes,
      te.hourly_rate || 0,
      te.hourly_rate ? (te.duration_minutes / 60) * te.hourly_rate : 0
    ]);
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time_report_${startDate}_${endDate}.csv`;
    a.click();
  };

  if (loading && !data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading reporting engine...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load data.</div>;

  const { kpis, assignedStages, staffTasks, timeEntries } = data;

  const allTasks = [
    ...(assignedStages || []).map((s: any) => ({ status: s.stage_status, priority: s.priority, dueDate: s.due_date, completedAt: s.completed_at })),
    ...(staffTasks || []).map((t: any) => ({ status: t.status, priority: t.priority, dueDate: t.due_date, completedAt: t.completed_at })),
  ];

  const now = new Date();
  
  const priorityCounts: Record<string, number> = { urgent: 0, high: 0, medium: 0, low: 0 };
  allTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').forEach(t => {
    priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
  });

  const dailyHours: Record<string, number> = {};
  (timeEntries || []).forEach((te: any) => {
    const d = te.entry_date;
    dailyHours[d] = (dailyHours[d] || 0) + (te.duration_minutes || 0);
  });
  const sortedDays = Object.keys(dailyHours).sort().slice(-14);

  // Growth formulas
  const revGrowth = kpis.prevRevenue > 0 ? ((kpis.totalRevenue - kpis.prevRevenue) / kpis.prevRevenue) * 100 : 0;
  const hoursGrowth = kpis.prevHours > 0 ? ((kpis.totalHours - kpis.prevHours) / kpis.prevHours) * 100 : 0;

  const gradients = [
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
  ];

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><BarChart2 size={28} /> Performance & KPIs</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Advanced reporting tools and utilization matrices.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'white', padding: '4px 4px 4px 12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
             <CalendarIcon size={16} className="text-muted" />
             <select className="form-select" style={{ border: 'none', background: 'transparent', width: 130, padding: '0 8px', fontSize: 13, height: 28, minHeight: 28 }} value={dateRange} onChange={e => {
               setDateRange(e.target.value);
               if (e.target.value !== 'custom') updateDatesFromRange(e.target.value);
             }}>
               <option value="7d">Last 7 Days</option>
               <option value="30d">Last 30 Days</option>
               <option value="90d">Last 90 Days</option>
               <option value="this_month">This Month</option>
               <option value="ytd">Year to Date</option>
               <option value="custom">Custom Range</option>
             </select>
             {dateRange === 'custom' && (
               <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', paddingLeft: 'var(--space-2)', borderLeft: '1px solid var(--color-gray-200)' }}>
                 <input type="date" className="form-input" style={{ border: 'none', padding: '0 8px', height: 28, fontSize: 12, width: 110 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                 <span className="text-muted text-xs">to</span>
                 <input type="date" className="form-input" style={{ border: 'none', padding: '0 8px', height: 28, fontSize: 12, width: 110 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                 <button className="btn btn-primary btn-sm" style={{ marginLeft: 4, height: 28, padding: '0 12px' }} onClick={handleApplyCustomDates}>Apply</button>
               </div>
             )}
          </div>

          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          
          <button className="btn btn-ghost" onClick={() => setShowSettings(true)} style={{ color: 'var(--color-gray-600)', border: '1px solid var(--color-gray-200)', background: 'white' }}>
            <Settings2 size={16} /> Config
          </button>

        </div>
      </div>

      {loading && <div style={{ height: 4, width: '100%', background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', animation: 'slideRight 1.5s infinite', marginBottom: 'var(--space-4)', borderRadius: 2 }} />}

      {/* ═══════ KPI HERO CARDS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-5)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
             <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradients[0], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={22} /></div>
             <span className="text-sm font-medium text-muted">Completion Rate</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{kpis.completionRate}%</div>
          <div className="text-xs text-muted" style={{ marginTop: 'var(--space-1)' }}>Target: 85% expected</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
             <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradients[1], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={22} /></div>
             <span className="text-sm font-medium text-muted">Total Clients Served</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{kpis.clientsServed}</div>
          <div className="text-xs text-muted" style={{ marginTop: 'var(--space-1)' }}>In involved projects</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
             <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradients[2], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={22} /></div>
             <span className="text-sm font-medium text-muted">Hours Logged</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{kpis.totalHours}h</div>
          <div className="text-xs" style={{ marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 4, color: hoursGrowth > 0 ? 'var(--color-success)' : hoursGrowth < 0 ? 'var(--color-danger)' : 'var(--color-gray-400)' }}>
            {hoursGrowth > 0 ? <TrendingUp size={14} /> : hoursGrowth < 0 ? <TrendingDown size={14} /> : null}
            {Math.abs(hoursGrowth).toFixed(1)}% vs prev period
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
             <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradients[3], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={22} /></div>
             <span className="text-sm font-medium text-muted">Revenue Attributed</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{formatCurrency(kpis.totalRevenue)}</div>
          <div className="text-xs" style={{ marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 4, color: revGrowth > 0 ? 'var(--color-success)' : revGrowth < 0 ? 'var(--color-danger)' : 'var(--color-gray-400)' }}>
            {revGrowth > 0 ? <TrendingUp size={14} /> : revGrowth < 0 ? <TrendingDown size={14} /> : null}
            {Math.abs(revGrowth).toFixed(1)}% vs prev period
          </div>
        </div>
      </div>

      {/* ═══════ TWO-COLUMN: Workload + Priority ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {/* Workload Capacity */}
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Briefcase size={18} /> Workload Utilization</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { label: 'Active Pipeline', val: kpis.totalActive, color: '#6366f1' },
                { label: 'Pending Bottlenecks', val: kpis.totalPending, color: 'var(--color-warning)' },
                { label: 'Completed Deliverables', val: kpis.totalCompleted, color: 'var(--color-success)' },
                { label: 'Critically Overdue', val: kpis.totalOverdue, color: 'var(--color-danger)' },
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
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><AlertTriangle size={18} /> Priority Distribution Index</h3>
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
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Clock size={18} /> Daily Hours Output (Target: {targetHours}h/Wk)</h3>
          {kpis.totalHours >= (targetHours * (dateRange === '30d' ? 4 : dateRange === '7d' ? 1 : 4)) ? 
             <span className="badge badge-green"><CheckCircle size={12} style={{ marginRight: 4 }}/> Target Exceeded</span> :
             <span className="badge badge-yellow">Target Pending</span>
          }
        </div>
        <div className="card-body">
          {sortedDays.length > 0 ? (
            <div className="dashboard-bar-chart" style={{ height: 180, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed var(--color-gray-300)', zIndex: 1 }} title="Target Hours Median"></div>
              {sortedDays.map(day => {
                const mins = dailyHours[day] || 0;
                const hrs = Math.round(mins / 60 * 10) / 10;
                const maxMins = Math.max(...sortedDays.map(d => dailyHours[d] || 0));
                const pct = maxMins > 0 ? Math.max(5, (mins / maxMins) * 100) : 5;
                const dayLabel = new Date(day + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
                return (
                  <div key={day} className="bar-column" title={`${dayLabel}: ${hrs}h`} style={{ zIndex: 2 }}>
                    <span className="text-xs" style={{ fontWeight: 600, color: '#6366f1' }}>{hrs}h</span>
                    <div className="bar-fill" style={{ height: `${pct}%`, background: 'linear-gradient(to top, #6366f1, #818cf8)' }}></div>
                    <span className="text-xs text-muted" style={{ fontSize: 10 }}>{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No time entries recorded in this period.</div>
          )}
        </div>
      </div>

      {/* ═══════ TIME LOG TABLE ═══════ */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Clock size={18} /> Detailed Line Item Logs</h3>
        </div>
        <div className="data-table-wrapper" style={{ border: 'none', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <table className="data-table text-sm">
            <thead><tr><th>Description</th><th>Client</th><th>Project / Scope</th><th>Date</th><th>Duration</th><th>Internal Rate</th><th>Attributed Value</th></tr></thead>
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
              {(!timeEntries || timeEntries.length === 0) && <tr>
                <td colSpan={7} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>
                   No time entries exist for this period. Try expanding the Date Range.
                </td>
              </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTINGS DRAWER OVERLAY */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(2px)'
        }} onClick={() => setShowSettings(false)}>
          <div style={{
            width: '100%', maxWidth: 450, backgroundColor: 'white', height: '100%',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.3s forwards'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-gray-50)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Settings2 size={22} className="text-primary" /> Reports Settings
                </h2>
                <p className="text-sm text-muted" style={{ margin: '4px 0 0 0' }}>Configure default KPI targets and reporting periods.</p>
              </div>
              <button className="btn btn-ghost" style={{ padding: 'var(--space-2)' }} onClick={() => setShowSettings(false)}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Target Billable Hours (Weekly)</label>
                <input type="number" className="form-input" value={targetHours} onChange={e => setTargetHours(parseInt(e.target.value) || 0)} />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Utilization Target (%)</label>
                <input type="number" className="form-input" value={targetUtil} onChange={e => setTargetUtil(parseInt(e.target.value) || 0)} max="100" />
              </div>
            </div>
            
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSettings} disabled={savingSettings}>
                <Save size={16} /> Save Preference Config
              </button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}} />
    </>
  );
}
