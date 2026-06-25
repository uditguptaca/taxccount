'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, Calendar, FileText, Activity, Clock, Search, 
  Filter, MoreHorizontal, ArrowUpRight, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';

export default function ServiceCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryKey = params.category as string;
  
  const [data, setData] = useState<{ category: string, projects: any[], stats: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`/api/services/${categoryKey}/projects`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [categoryKey]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>Loading service data...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Failed to load data</div>;

  const filteredProjects = data.projects.filter(p => 
    p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.template_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.engagement_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string, priority: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && !['completed', 'filed'].includes(status.toLowerCase());
    
    if (isOverdue) return <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>OVERDUE</span>;
    if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'filed') return <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>COMPLETED</span>;
    if (status.toLowerCase() === 'in_progress') return <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>IN PROGRESS</span>;
    
    return <span style={{ background: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} style={{ color: 'var(--color-primary)' }}/> 
            {data.category} Services
          </h1>
          <p style={{ color: 'var(--color-gray-500)', margin: 0, fontSize: '14px' }}>
            Global view of all {data.category.toLowerCase()} compliances across your firm.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '8px' }}>Active Projects</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{data.stats.total - data.stats.completed}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#991B1B', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> Overdue</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#991B1B' }}>{data.stats.overdue}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14}/> Completed</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#166534' }}>{data.stats.completed}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Tracked</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{data.stats.total}</div>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', gap: '12px', background: '#F9FAFB' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-gray-400)' }} />
            <input 
              type="text" 
              placeholder="Search clients, projects, or codes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--color-gray-300)', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', border: '1px solid var(--color-gray-300)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--color-gray-700)', cursor: 'pointer' }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Data Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'white', borderBottom: '1px solid var(--color-gray-200)' }}>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Client</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Project / Compliance</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Period</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Due Date</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                  No {data.category} projects found.
                </td>
              </tr>
            ) : filteredProjects.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                <td style={{ padding: '16px' }}>
                  <Link href={`/dashboard/clients/${p.client_id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {p.client_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.client_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{p.client_code}</div>
                    </div>
                  </Link>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{p.template_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={12}/> {p.engagement_code}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>
                  {p.period_label || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ color: 'var(--color-gray-400)' }}/>
                    {p.due_date ? format(new Date(p.due_date), 'MMM d, yyyy') : 'No Due Date'}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  {getStatusBadge(p.status, p.priority, p.due_date)}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button onClick={() => {
                    if (categoryKey === 'accounting') {
                      router.push(`/dashboard/clients/${p.client_id}?tab=ledgerflow`);
                    } else if (categoryKey === 'payroll') {
                      router.push(`/dashboard/clients/${p.client_id}?tab=payroll`);
                    } else {
                      router.push(`/dashboard/projects/${p.id}`);
                    }
                  }} style={{ background: 'transparent', border: '1px solid var(--color-gray-200)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View <ArrowUpRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
