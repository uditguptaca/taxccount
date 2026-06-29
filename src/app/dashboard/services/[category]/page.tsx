'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, Calendar, FileText, Activity, Clock, Search, 
  Filter, ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle, MapPin
} from 'lucide-react';
import { format } from 'date-fns';

function parseLocalDate(dateStr: string | null | undefined) {
  if (!dateStr) return new Date();
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return new Date(datePart + 'T00:00:00');
}

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

  if (loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div className="cs-skeleton" style={{ width: '42px', height: '42px', borderRadius: '50%', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--cs-text-secondary)', fontSize: '15px' }}>Loading Command Center...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cs-red)' }}>
        Failed to load category data.
      </div>
    );
  }

  const categoryName = data.category;
  const isAccounting = categoryKey === 'accounting';
  const isDirectTax = categoryKey === 'direct-tax';
  const isIndirectTax = categoryKey === 'indirect-tax';

  // Dynamic Content Configurations
  const config = {
    title: `${categoryName} Command Center`,
    subtitle: isAccounting 
      ? 'Firm-wide portal for bookkeeping, ledger flows, month-end close, and trial balances.'
      : isDirectTax 
      ? 'Firm-wide portal for corporate tax (T2), partnership returns, capital gains schedules, and tax compliance.'
      : 'Firm-wide portal for GST/HST returns, PST/QST returns, sales tax audits, and CRA remittances.',
    statLabel1: isAccounting ? 'Bookkeeping Clients' : isDirectTax ? 'T2 Tax Files' : 'GST/HST Remitters',
    statLabel2: isAccounting ? 'Pending Closings' : 'Pending Filings',
    statLabel3: 'Overdue Returns',
    statLabel4: isAccounting ? 'Ledger Accounts' : 'Tracked Compliance',
    todoTitle: isAccounting ? 'Reconciliations To-Do' : 'Filings To-Do',
    reviewTitle: isAccounting ? 'Month-End Close Review' : 'CRA Submissions Pending',
    activityTitle: 'Recent Compliance Activity'
  };

  const filteredProjects = data.projects.filter(p => 
    p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.template_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter lists for Command Center To-Dos
  const todoItems = filteredProjects.filter(p => p.status === 'in_progress').slice(0, 2);
  const reviewItems = filteredProjects.filter(p => p.status === 'new').slice(0, 1);
  const completedActivities = filteredProjects.filter(p => p.status === 'completed').slice(0, 2);

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && !['completed', 'filed'].includes(status.toLowerCase());
    if (isOverdue) return <span className="cs-badge red" style={{ fontWeight: 600 }}>OVERDUE</span>;
    if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'filed') return <span className="cs-badge green" style={{ fontWeight: 600 }}>COMPLETED</span>;
    return <span className="cs-badge blue" style={{ fontWeight: 600 }}>IN PROGRESS</span>;
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--cs-text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.025em' }}>
            {config.title}
          </h1>
          <p style={{ color: 'var(--cs-text-secondary)', fontSize: '15px', margin: 0 }}>
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{config.statLabel1}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-text-primary)' }}>{data.stats.total - data.stats.completed} / {data.stats.total}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{config.statLabel2}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-text-primary)' }}>{data.stats.total - data.stats.completed}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF7ED', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{config.statLabel3}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-red)' }}>{data.stats.overdue}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{config.statLabel4}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-text-primary)' }}>{data.stats.completed}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: To-Dos on Left, Directory on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Tasks / Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Reconciliations / Filings To-Do List */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#EA580C' }} /> {config.todoTitle}
            </h3>
            {todoItems.length === 0 ? (
              <div style={{ padding: '20px', fontStyle: 'italic', color: 'var(--cs-text-muted)', fontSize: '13px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed var(--cs-border)', textAlign: 'center' }}>
                All client tasks are currently complete!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todoItems.map(item => (
                  <div key={item.id} style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#9A3412' }}>{item.client_name}</span>
                        <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 500 }}>{item.template_name} ({item.period_label})</div>
                      </div>
                      <button 
                        onClick={() => router.push(isAccounting ? `/dashboard/clients/${item.client_id}?tab=ledgerflow` : `/dashboard/projects/${item.id}`)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F97316', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Action <ArrowUpRight size={13} />
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7C2D12' }}>
                      Due Date: {item.due_date ? format(parseLocalDate(item.due_date), 'MMM d, yyyy') : 'No Due Date'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submissions Pending Review */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: '#4F46E5' }} /> {config.reviewTitle}
            </h3>
            {reviewItems.length === 0 ? (
              <div style={{ padding: '20px', fontStyle: 'italic', color: 'var(--cs-text-muted)', fontSize: '13px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed var(--cs-border)', textAlign: 'center' }}>
                No returns or closeouts pending review.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviewItems.map(item => (
                  <div key={item.id} style={{ background: '#EEF2FF', border: '1px solid #E0E7FF', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#3730A3' }}>{item.client_name}</span>
                      <div style={{ fontSize: '11px', color: '#4338CA', textTransform: 'uppercase', fontWeight: 600 }}>{item.template_name} ({item.period_label})</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => router.push(`/dashboard/projects/${item.id}`)}
                        style={{ color: '#4F46E5', background: 'transparent', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0, marginTop: '2px' }}
                      >
                        Review Return →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Stream */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: 'var(--cs-emerald)' }} /> {config.activityTitle}
            </h3>
            {completedActivities.length === 0 ? (
              <div style={{ color: 'var(--cs-text-muted)', fontSize: '13px' }}>No completed activities yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {completedActivities.map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cs-emerald)', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong style={{ color: 'var(--cs-text-primary)' }}>{act.client_name}</strong> finalized return filing for <strong>{act.template_name}</strong>.
                      <div style={{ fontSize: '11px', color: 'var(--cs-text-muted)', marginTop: '2px' }}>
                        Period: {act.period_label} | Due: {act.due_date ? format(parseLocalDate(act.due_date), 'MMM d, yyyy') : '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Client Directory */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--cs-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cs-text-primary)', margin: '0 0 16px 0' }}>Client Compliance Directory</h3>
            
            {/* Search Filters */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--cs-text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search client name or code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 38px', borderRadius: '8px', border: '1px solid var(--cs-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="cs-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--cs-surface-hover)', borderBottom: '1px solid var(--cs-border)' }}>
                  <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase' }}>Client Company</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase' }}>Project / Compliance</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Period</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--cs-text-muted)' }}>
                      No active tracked projects found.
                    </td>
                  </tr>
                ) : filteredProjects.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--cs-border-light)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-primary)' }}>{p.client_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cs-text-muted)', fontSize: '12px', marginTop: '2px' }}>
                        <span>{p.client_code}</span>
                        <span style={{ color: 'var(--cs-border)' }}>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={11} /> ON</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cs-text-secondary)' }}>{p.template_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--cs-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><FileText size={11}/> {p.engagement_code}</div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: 'var(--cs-text-secondary)' }}>
                      {p.period_label || '-'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      {getStatusBadge(p.status, p.due_date)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => router.push(isAccounting ? `/dashboard/clients/${p.client_id}?tab=ledgerflow` : `/dashboard/projects/${p.id}`)}
                        className="cs-btn cs-btn-primary cs-btn-sm"
                      >
                        Open Portal <ChevronRight size={13} style={{ marginLeft: '2px' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
