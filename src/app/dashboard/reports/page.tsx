'use client';
import { useEffect, useState } from 'react';
import { 
  FileDown, Search, BarChart2, Users, FileText, 
  DollarSign, Activity, AlertCircle, Bell, Clock 
} from 'lucide-react';

// Formatting Helpers
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA') : '—'; }
function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n || 0); }
function daysOverdue(due_date: string) {
  if (!due_date) return null;
  const days = Math.ceil((Date.now() - new Date(due_date).getTime()) / 86400000);
  return days > 0 ? days : 0;
}

const TABS = [
  { id: 'productivity', label: 'Productivity', icon: <Activity size={16}/> },
  { id: 'compliance', label: 'Compliance Status', icon: <FileText size={16}/> },
  { id: 'revenue', label: 'Revenue & Expenses', icon: <DollarSign size={16}/> },
  { id: 'active-clients', label: 'Active Clients', icon: <Users size={16}/> },
  { id: 'churn', label: 'Client Churn Risk', icon: <AlertCircle size={16}/> },
  { id: 'missing-documents', label: 'Missing Documents', icon: <FileDown size={16}/> },
  { id: 'workflow', label: 'Workflow Pipeline', icon: <BarChart2 size={16}/> },
  { id: 'reminders', label: 'Reminders', icon: <Bell size={16}/> },
];

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [data, setData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch KPI Ribbon
  useEffect(() => {
    fetch('/api/reports/data?tab=overview')
      .then(r => r.json())
      .then(d => setOverview(d.data))
      .catch(console.error);
  }, []);

  // Fetch Tab Data
  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/reports/data?tab=${activeTab}`)
      .then(r => r.json())
      .then(d => {
        setData(d.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [activeTab]);

  const exportCSV = () => {
    const list = Array.isArray(data) ? data : data?.records;
    if (!list || list.length === 0) return;
    
    // Extract headers dynamically from the first object
    const headers = Object.keys(list[0]);
    const rows = list.map((row: any) => {
      return headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generic List Filter logic
  const getFilteredData = () => {
    const list = Array.isArray(data) ? data : data?.records;
    if (!list) return [];
    if (!search) return list;
    return list.filter((r: any) => 
      Object.values(r).some(val => 
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const filteredData = getFilteredData();

  // Render Strategy based on Active Tab
  const renderTableHeaders = () => {
    switch(activeTab) {
      case 'productivity': return ['Employee', 'Tasks Completed', 'Active Clients', 'Overdue Tasks'];
      case 'compliance': return ['Client', 'Project', 'Status', 'Complete %', 'Missing Docs', 'Due Date'];
      case 'revenue': return ['Invoice #', 'Client', 'Amount', 'Due Date', 'Status', 'Created'];
      case 'active-clients': return ['Client', 'Code', 'Status', 'Onboarded Date', 'Active Projects'];
      case 'churn': return ['Client', 'Code', 'Status', 'Onboarded Date', 'Last Interaction', 'Active Engagements'];
      case 'missing-documents': return ['Client', 'Engagement', 'Template', 'Missing Document', 'Due Date'];
      case 'workflow': return ['Stage Code', 'Stage Name', 'Active Count', 'Stale Count (>7 days)'];
      case 'reminders': return ['Client', 'Message', 'Due Date', 'Status'];
      default: return [];
    }
  };

  const renderTableRow = (row: any, i: number) => {
    switch(activeTab) {
      case 'productivity':
        return (
          <tr key={i}>
            <td style={{ fontWeight: 500 }}>{row.employee_name}</td>
            <td><span className="badge badge-gray">{row.tasks_completed}</span></td>
            <td>{row.active_clients}</td>
            <td>
              {row.overdue_tasks > 0 ? <span className="badge badge-red">{row.overdue_tasks}</span> : <span className="text-muted">0</span>}
            </td>
          </tr>
        );
      case 'compliance':
        return (
          <tr key={i}>
            <td>
              <div style={{ fontWeight: 500 }}>{row.client_name}</div>
              <div className="text-xs text-muted">{row.client_code}</div>
            </td>
            <td>
              <div>{row.project_name}</div>
              <div className="text-xs text-muted">{row.engagement_code}</div>
            </td>
            <td><span className={`badge ${row.status==='completed'?'badge-green':'badge-blue'}`}>{row.status}</span></td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <progress value={row.percent_complete} max="100" style={{ width: 60 }}></progress>
                <span className="text-xs">{Math.round(row.percent_complete || 0)}%</span>
              </div>
            </td>
            <td>{row.missing_docs_count > 0 ? <span className="text-danger flex items-center gap-1"><AlertCircle size={12}/> {row.missing_docs_count}</span> : '0'}</td>
            <td>{formatDate(row.due_date)}</td>
          </tr>
        );
      case 'revenue':
        return (
          <tr key={i}>
            <td style={{ fontWeight: 500 }}>{row.invoice_number}</td>
            <td>{row.client_name}</td>
            <td style={{ fontWeight: 600 }}>{formatCurrency(row.amount)}</td>
            <td>{formatDate(row.due_date)}</td>
            <td>
              <span className={`badge ${row.status==='paid'?'badge-green':row.status==='overdue'?'badge-red':'badge-yellow'}`}>{row.status}</span>
            </td>
            <td className="text-sm text-muted">{formatDate(row.created_at)}</td>
          </tr>
        );
      case 'active-clients':
      case 'churn':
        return (
          <tr key={i}>
            <td style={{ fontWeight: 500 }}>{row.client_name}</td>
            <td>{row.client_code}</td>
            <td><span className={`badge ${row.status==='active'?'badge-green':'badge-gray'}`}>{row.status}</span></td>
            <td>{formatDate(row.onboarded_date)}</td>
            {activeTab === 'churn' && <td>{formatDate(row.last_interaction_date)}</td>}
            <td>{row.active_projects ?? row.active_engagements}</td>
          </tr>
        );
      case 'missing-documents': {
        const days = daysOverdue(row.due_date);
        return (
          <tr key={i}>
            <td>
              <div style={{ fontWeight: 500 }}>{row.client_name}</div>
              <div className="text-xs text-muted">{row.client_code}</div>
            </td>
            <td>{row.engagement_code}</td>
            <td>{row.template_name}</td>
            <td><span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>{row.document_name}</span></td>
            <td>
              {formatDate(row.due_date)}
              {days && days > 0 && <div className="text-xs text-danger mt-1">{days} days overdue</div>}
            </td>
          </tr>
        );
      }
      case 'workflow':
        return (
          <tr key={i}>
            <td style={{ fontFamily: 'monospace' }}>{row.stage_code}</td>
            <td style={{ fontWeight: 500 }}>{row.stage_name}</td>
            <td><span className="badge badge-blue">{row.active_count}</span></td>
            <td>{row.stale_count > 0 ? <span className="badge badge-red">{row.stale_count}</span> : '0'}</td>
          </tr>
        );
      case 'reminders':
        return (
          <tr key={i}>
            <td style={{ fontWeight: 500 }}>{row.client_name}</td>
            <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.message}</td>
            <td>{formatDate(row.due_date)}</td>
            <td><span className={`badge ${row.status==='completed'?'badge-green':'badge-gray'}`}>{row.status}</span></td>
          </tr>
        );
      default: return <tr key={i}><td>...</td></tr>;
    }
  };

  return (
    <>
      {/* 1. Header & Global KPIs */}
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1>Firm Intelligence</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Comprehensive analytics across productivity, revenue, and client health.</p>
        </div>
        <button className="btn btn-primary" onClick={exportCSV} disabled={!data || loading || filteredData.length === 0}>
          <FileDown size={18} /> Export Results to CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', width: '100%' }}>
        <div className="card" style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
          <div className="text-muted text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
            {overview ? formatCurrency(overview.revenue) : '...'}
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
          <div className="text-muted text-sm font-semibold uppercase tracking-wider mb-2" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
             <Users size={14}/> Active Clients
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-blue-700)' }}>
            {overview ? overview.active_clients : '...'}
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', borderLeft: '4px solid var(--color-danger)' }}>
          <div className="text-muted text-sm font-semibold uppercase tracking-wider mb-2" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Clock size={14}/> Overdue Tasks
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-danger)' }}>
            {overview ? overview.overdue_tasks : '...'}
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', borderLeft: '4px solid var(--color-orange-500)' }}>
          <div className="text-muted text-sm font-semibold uppercase tracking-wider mb-2">Missing Docs</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {overview ? overview.missing_docs : '...'}
          </div>
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div style={{ borderBottom: '1px solid var(--color-gray-200)', marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-6)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
        {TABS.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'var(--space-2) var(--space-1)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-gray-500)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      {/* 3. Dynamic Report Area */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-gray-50)' }}>
          <div className="search-bar" style={{ width: '350px', background: '#fff' }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder={`Search ${TABS.find(t=>t.id===activeTab)?.label.toLowerCase()}...`}
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          
          {/* Sub-summaries for specific tabs */}
          {activeTab === 'revenue' && data?.summary && (
            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '13px' }}>
               <span className="text-muted">Outstanding: <strong className="text-danger">{formatCurrency(data.summary.outstanding_revenue)}</strong></span>
            </div>
          )}

          <div className="text-sm text-muted">Showing {filteredData.length} records</div>
        </div>
        
        <div className="data-table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                {renderTableHeaders().map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center text-muted" style={{ padding: 'var(--space-12)' }}>Gathering intelligence...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-muted" style={{ padding: 'var(--space-12)' }}>No data found for this report criteria.</td></tr>
              ) : (
                filteredData.map((row: any, i: number) => renderTableRow(row, i))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
