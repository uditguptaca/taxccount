'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, Users, AlertTriangle, DollarSign, CheckCircle2, ArrowUpRight, Building2, Receipt, FileText, Bell, Clock, Plus, Calendar, TrendingUp, Layers, Activity, Target } from 'lucide-react';

interface DashboardData {
  stats: any;
  projectsByStage: any[];
  recentProjects: any[];
  teamWorkload: any[];
  upcomingDue: any[];
  revenuePipeline: any[];
  recentActivity: any[];
  blockedProjects?: any[];
  leadsMetrics?: {
    totalReceived: number;
    converted: number;
    lost: number;
    conversionRate: number;
  };
}

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function daysUntil(d: string) { if (!d) return null; return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }
function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getActivityIcon(action: string) {
  if (action.includes('stage') || action.includes('filed') || action.includes('completed') || action.includes('assigned')) return 'stage';
  if (action.includes('document') || action.includes('engagement_letter')) return 'document';
  if (action.includes('invoice') || action.includes('payment')) return 'invoice';
  if (action.includes('message')) return 'message';
  return 'client';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading dashboard...</div>;
  if (!data) return <div>Failed to load dashboard</div>;

  const s = data.stats;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Welcome back, Sarah. Here&apos;s your firm overview.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/dashboard/clients" className="btn btn-secondary"><Plus size={16} /> New Client</Link>
          <Link href="/dashboard/projects" className="btn btn-primary"><Plus size={16} /> New Project</Link>
          <Link href="/dashboard/calendar" className="btn btn-secondary"><Calendar size={16} /> View Calendar</Link>
          <Link href="/dashboard/reminders" className="btn btn-secondary"><Bell size={16} /> Send Reminder</Link>
        </div>
      </div>      {/* Overview Grid - Compact */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 className="section-title text-sm" style={{ marginBottom: 'var(--space-3)', color: 'var(--color-gray-500)', fontWeight: 600 }}>Firm Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          
          {/* Work & Projects */}
          <Link href="/dashboard/projects" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon blue" style={{ width: 32, height: 32 }}><FolderKanban size={16} /></div>
            <div><div className="text-xs text-muted">Active Projects</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.totalProjects}</div></div>
          </Link>
          <Link href="/dashboard/projects?status=overdue" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon red" style={{ width: 32, height: 32 }}><AlertTriangle size={16} /></div>
            <div><div className="text-xs text-muted">Overdue</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.overdueProjects}</div></div>
          </Link>
          <Link href="/dashboard/projects?status=completed" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon green" style={{ width: 32, height: 32 }}><CheckCircle2 size={16} /></div>
            <div><div className="text-xs text-muted">Completed</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.completedProjects}</div></div>
          </Link>
          <Link href="/dashboard/clients" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon blue" style={{ width: 32, height: 32 }}><Users size={16} /></div>
            <div><div className="text-xs text-muted">Active Clients</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.totalClients}</div></div>
          </Link>

          {/* Revenue */}
          <Link href="/dashboard/billing" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon green" style={{ width: 32, height: 32 }}><DollarSign size={16} /></div>
            <div><div className="text-xs text-muted">Revenue</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{formatCurrency(s.totalRevenue)}</div></div>
          </Link>
          <Link href="/dashboard/billing" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon yellow" style={{ width: 32, height: 32 }}><Clock size={16} /></div>
            <div><div className="text-xs text-muted">Pending Rev.</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{formatCurrency(s.pendingRevenue)}</div></div>
          </Link>
          <Link href="/dashboard/billing" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon yellow" style={{ width: 32, height: 32 }}><Receipt size={16} /></div>
            <div><div className="text-xs text-muted">Invoices Out</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.pendingInvoices}</div></div>
          </Link>
          <Link href="/dashboard/documents" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon blue" style={{ width: 32, height: 32 }}><FileText size={16} /></div>
            <div><div className="text-xs text-muted">Pending Docs</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.pendingDocuments}</div></div>
          </Link>

          {/* CRM & Leads */}
          {data.leadsMetrics && (
            <>
              <Link href="/dashboard/leads" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                <div className="kpi-icon blue" style={{ width: 32, height: 32 }}><Target size={16} /></div>
                <div><div className="text-xs text-muted">Total Leads</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{data.leadsMetrics.totalReceived}</div></div>
              </Link>
              <Link href="/dashboard/leads" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                <div className="kpi-icon green" style={{ width: 32, height: 32 }}><Building2 size={16} /></div>
                <div><div className="text-xs text-muted">Converted</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{data.leadsMetrics.converted}</div></div>
              </Link>
              <Link href="/dashboard/leads" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                <div className="kpi-icon red" style={{ width: 32, height: 32 }}><Activity size={16} /></div>
                <div><div className="text-xs text-muted">Lost</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{data.leadsMetrics.lost}</div></div>
              </Link>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                <div className="kpi-icon yellow" style={{ width: 32, height: 32 }}><TrendingUp size={16} /></div>
                <div><div className="text-xs text-muted">Conversion Rate</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{data.leadsMetrics.conversionRate}%</div></div>
              </div>
            </>
          )}

          <Link href="/dashboard/billing" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon green" style={{ width: 32, height: 32 }}><FileText size={16} /></div>
            <div><div className="text-xs text-muted">Proposals Sent</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.pendingProposals}</div></div>
          </Link>
          <Link href="/dashboard/reminders" className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-icon red" style={{ width: 32, height: 32 }}><Bell size={16} /></div>
            <div><div className="text-xs text-muted">Reminders Due</div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{s.pendingReminders}</div></div>
          </Link>

        </div>
      </div>

      {/* Revenue Pipeline — Detailed (matching Projects by Stage style) */}
      {data.revenuePipeline && data.revenuePipeline.length > 0 && (() => {
        const REV_COLORS: Record<string, string> = {
          paid: '#10b981', sent: '#3b82f6', partially_paid: '#06b6d4',
          overdue: '#ef4444', unpaid: '#f59e0b', draft: '#9ca3af', cancelled: '#6b7280'
        };
        const REV_BG: Record<string, string> = {
          paid: '#ecfdf5', sent: '#eff6ff', partially_paid: '#ecfeff',
          overdue: '#fef2f2', unpaid: '#fffbeb', draft: '#f9fafb', cancelled: '#f3f4f6'
        };
        const pipelineData = data.revenuePipeline;
        const grandTotal = pipelineData.reduce((a: number, r: any) => a + (r.amount || 0), 0) || 1;
        const totalInvoices = pipelineData.reduce((a: number, r: any) => a + (r.count || 0), 0);
        return (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <DollarSign size={16} style={{ color: '#10b981' }} />
                Revenue Pipeline
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="text-sm text-muted">{totalInvoices} invoices · {formatCurrency(grandTotal)}</span>
                <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 110, height: 28 }} defaultValue="all">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
                <Link href="/dashboard/billing" className="btn btn-ghost btn-sm">View Billing <ArrowUpRight size={14} /></Link>
              </div>
            </div>

            {/* Stacked visual pipeline bar */}
            <div style={{ padding: '0 var(--space-5) var(--space-3)' }}>
              <div style={{ height: 10, borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex', gap: 2 }}>
                {pipelineData.map((r: any, i: number) => (
                  <div
                    key={r.status}
                    title={`${r.status}: ${formatCurrency(r.amount)} (${r.count})`}
                    style={{
                      width: `${Math.max(((r.amount || 0) / grandTotal) * 100, 2)}%`,
                      background: REV_COLORS[r.status] || '#9ca3af',
                      borderRadius: i === 0 ? '99px 0 0 99px' : i === pipelineData.length - 1 ? '0 99px 99px 0' : 0,
                      transition: 'width 0.4s ease'
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 'var(--space-2)' }}>
                {pipelineData.map((r: any) => (
                  <div key={r.status} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-gray-500)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: REV_COLORS[r.status] || '#9ca3af', display: 'inline-block', flexShrink: 0 }} />
                    {r.status.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed status cards */}
            <div className="card-body" style={{ paddingTop: 'var(--space-2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                {pipelineData.map((r: any) => {
                  const color = REV_COLORS[r.status] || '#9ca3af';
                  const bg = REV_BG[r.status] || '#f9fafb';
                  const pct = ((r.amount || 0) / grandTotal * 100).toFixed(1);
                  const avgAmount = r.count > 0 ? (r.amount || 0) / r.count : 0;
                  return (
                    <div key={r.status} style={{
                      padding: 'var(--space-3)',
                      background: bg,
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${color}20`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Left accent bar */}
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '4px 0 0 4px' }} />
                      <div style={{ paddingLeft: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                          <span className="text-xs" style={{ fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'capitalize' }}>{r.status.replace(/_/g, ' ')}</span>
                          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color, lineHeight: 1 }}>{r.count}</span>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color, marginBottom: 2 }}>
                          {formatCurrency(r.amount || 0)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-gray-500)', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                            {pct}% of total
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-gray-500)', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                            ~{formatCurrency(avgAmount)} avg
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}


      {/* Team Workload & Stage Analytics */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Team Workload */}
        <div className="card">
          <div className="card-header">
            <h3>Team Workload & Attribution</h3>
            <Link href="/dashboard/teams" className="btn btn-ghost btn-sm">Manage Capacity <ArrowUpRight size={14} /></Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {data.teamWorkload && data.teamWorkload.slice(0, 5).map((w: any, i: number) => {
                const total = (w.active || 0) + (w.pending || 0) + (w.completed || 0);
                const activePct = total > 0 ? (w.active / total) * 100 : 0;
                const completedPct = total > 0 ? (w.completed / total) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', alignItems: 'center' }}>
                      <span className="text-sm" style={{ fontWeight: 500 }}>{w.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span className="text-sm" style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(w.revenue_attributed || 0)}</span>
                        <Link href="/dashboard/teams" className="btn btn-secondary btn-sm" style={{ padding: '0 6px', height: 22, fontSize: 11 }} title="Bulk Reassign">Reassign</Link>
                      </div>
                    </div>
                    <div className="progress-bar-bg" style={{ display: 'flex' }}>
                       <div className="progress-bar-fill" style={{ width: `${completedPct}%`, backgroundColor: 'var(--color-success)', borderRadius: 'var(--radius-full) 0 0 var(--radius-full)' }} title={`${w.completed} completed`}></div>
                       <div className="progress-bar-fill" style={{ width: `${activePct}%`, backgroundColor: 'var(--color-primary)', borderRadius: completedPct === 0 ? 'var(--radius-full)' : '0 var(--radius-full) var(--radius-full) 0' }} title={`${w.active} active`}></div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '4px', fontSize: '11px', color: 'var(--color-gray-500)' }}>
                      <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', marginRight: 4 }}></span>{w.active} active</span>
                      <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', marginRight: 4 }}></span>{w.completed} done</span>
                    </div>
                  </div>
                );
              })}
              {(!data.teamWorkload || data.teamWorkload.length === 0) && <div className="text-sm text-muted">No team workload data available.</div>}
            </div>
          </div>
        </div>

        {/* Projects by Stage */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Layers size={16} style={{ color: 'var(--color-primary)' }} />
              Projects by Stage
            </h3>
            <Link href="/dashboard/projects" className="btn btn-ghost btn-sm">View Pipeline <ArrowUpRight size={14} /></Link>
          </div>

          {/* Stacked visual pipeline bar */}
          {data.projectsByStage && data.projectsByStage.length > 0 && (() => {
            const totalCount = data.projectsByStage.reduce((a: number, s: any) => a + (s.count || 0), 0) || 1;
            const STAGE_COLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#06b6d4','#f97316'];
            return (
              <div style={{ padding: '0 var(--space-5) var(--space-3)' }}>
                <div style={{ height: 10, borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex', gap: 2 }}>
                  {data.projectsByStage.map((s: any, i: number) => (
                    <div
                      key={i}
                      title={`${s.stage_name}: ${s.count} project${s.count !== 1 ? 's' : ''}`}
                      style={{
                        width: `${(s.count / totalCount) * 100}%`,
                        background: STAGE_COLORS[i % STAGE_COLORS.length],
                        borderRadius: i === 0 ? '99px 0 0 99px' : i === data.projectsByStage.length - 1 ? '0 99px 99px 0' : 0,
                        transition: 'width 0.4s ease'
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 'var(--space-2)' }}>
                  {data.projectsByStage.map((s: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-gray-500)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[i % STAGE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                      {s.stage_name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="card-body" style={{ paddingTop: 'var(--space-2)', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {data.projectsByStage && data.projectsByStage.slice(0, 6).map((s: any, i: number) => {
                const STAGE_COLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#06b6d4','#f97316'];
                const color = STAGE_COLORS[i % STAGE_COLORS.length];
                const hasOverdue = s.overdue_count > 0;
                const avgDays = s.avg_days_in_stage;
                return (
                  <div key={i} style={{
                    padding: 'var(--space-3) var(--space-3)',
                    background: 'var(--color-gray-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${hasOverdue ? '#fde68a' : 'var(--color-gray-200)'}`,
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Left accent bar */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '4px 0 0 4px' }} />
                    <div style={{ paddingLeft: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                        <span className="text-xs" style={{ fontWeight: 600, color: 'var(--color-gray-700)', lineHeight: 1.3, maxWidth: '70%' }}>{s.stage_name}</span>
                        <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color, lineHeight: 1 }}>{s.count}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {hasOverdue && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#dc2626', background: '#fee2e2', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                            <AlertTriangle size={9} />{s.overdue_count} overdue
                          </span>
                        )}
                        {avgDays != null && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-gray-500)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                            <Clock size={9} />~{avgDays}d avg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!data.projectsByStage || data.projectsByStage.length === 0) && (
                <div className="text-sm text-muted" style={{ gridColumn: 'span 2', textAlign: 'center', padding: 'var(--space-6) 0' }}>No active projects in pipeline.</div>
              )}
            </div>

            {/* Footer stats row */}
            {data.projectsByStage && data.projectsByStage.length > 0 && (() => {
              const totalInPipeline = data.projectsByStage.reduce((a: number, s: any) => a + (s.count || 0), 0);
              const totalOverdue   = data.projectsByStage.reduce((a: number, s: any) => a + (s.overdue_count || 0), 0);
              const stageCount     = data.projectsByStage.length;
              return (
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-gray-100)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{totalInPipeline}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-gray-500)', marginTop: 2 }}>In Pipeline</div>
                  </div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-gray-100)', borderRight: '1px solid var(--color-gray-100)' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: totalOverdue > 0 ? '#dc2626' : 'var(--color-success)' }}>{totalOverdue}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-gray-500)', marginTop: 2 }}>Overdue</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-700)' }}>{stageCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-gray-500)', marginTop: 2 }}>Active Stages</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Blocked / Waiting on Client Queue */}
      {data.blockedProjects && data.blockedProjects.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-warning)' }}>
          <div className="card-header" style={{ background: 'var(--color-warning-light)', borderBottom: '1px solid var(--color-gray-100)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#b45309' }}>
              <AlertTriangle size={18} /> Blocked: Waiting on Client
            </h3>
            <Link href="/dashboard/projects" className="btn btn-ghost btn-sm" style={{ color: '#b45309' }}>View All <ArrowUpRight size={14} /></Link>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Client</th><th>Type</th><th>Blocked Stage</th><th>Due Date</th><th>Action</th></tr></thead>
              <tbody>
                {data.blockedProjects.map((p: any) => {
                  const days = daysUntil(p.due_date);
                  return (
                    <tr key={p.id}>
                      <td><span className="client-name">{p.client_name}</span><br /><span className="text-xs text-muted">{p.client_code}</span></td>
                      <td><span className="badge badge-cyan">{p.template_code}</span></td>
                      <td className="text-sm"><span className="badge badge-yellow">{p.blocked_stage_name || p.current_stage_name || 'Pending Actions'}</span></td>
                      <td>
                        <span className="text-sm">{formatDate(p.due_date)}</span>
                        {days !== null && <span className={`badge ${days < 0 ? 'badge-red' : 'badge-gray'}`} style={{ marginLeft: 4, fontSize: '10px' }}>{days < 0 ? 'Overdue' : `${days}d`}</span>}
                      </td>
                      <td>
                        <Link href={`/dashboard/messages`} className="btn btn-secondary btn-sm" style={{ padding: '0 8px', height: 28, fontSize: 12 }}>
                          <Bell size={12} style={{ marginRight: 4 }} /> Nudge
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Active Projects Table */}
        <div className="card">
          <div className="card-header">
            <h3>Active Projects</h3>
            <Link href="/dashboard/projects" className="btn btn-ghost btn-sm">View All <ArrowUpRight size={14} /></Link>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Client</th><th>Type</th><th>Stage</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {data.recentProjects.map((p: any) => {
                  const days = daysUntil(p.due_date);
                  return (
                    <tr key={p.id}>
                      <td><span className="client-name">{p.client_name}</span><br /><span className="text-xs text-muted">{p.client_code}</span></td>
                      <td><span className="badge badge-cyan">{p.template_code}</span></td>
                      <td className="text-sm">{p.current_stage_name || '—'}</td>
                      <td>
                        <span className="text-sm">{formatDate(p.due_date)}</span>
                        {days !== null && days <= 7 && days >= 0 && <span className="badge badge-yellow" style={{ marginLeft: 4, fontSize: '10px' }}>{days}d</span>}
                        {days !== null && days < 0 && <span className="badge badge-red" style={{ marginLeft: 4, fontSize: '10px' }}>Overdue</span>}
                      </td>
                      <td><span className={`badge ${p.status === 'completed' ? 'badge-green' : p.status === 'new' ? 'badge-gray' : 'badge-blue'}`}><span className="badge-dot"></span>{p.status.replace('_', ' ')}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="card-header"><h3>Upcoming Deadlines</h3></div>
            <div className="card-body">
              {data.upcomingDue.map((d: any, i: number) => {
                const days = daysUntil(d.due_date);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{d.client_name}</div>
                      <div className="text-xs text-muted">{d.template_name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-sm">{formatDate(d.due_date)}</div>
                      {days !== null && <span className={`badge ${days < 0 ? 'badge-red' : days <= 7 ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '10px' }}>{days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <Link href="/dashboard/activity" className="btn btn-ghost btn-sm">View All <ArrowUpRight size={14} /></Link>
            </div>
            <div className="card-body">
              <div className="activity-timeline">
                {(data.recentActivity || []).slice(0, 6).map((a: any, i: number) => (
                  <div className="activity-item" key={i}>
                    <div className={`activity-dot ${getActivityIcon(a.action)}`}>
                      {a.actor_name?.charAt(0) || '?'}
                    </div>
                    <div className="activity-content">
                      <p><strong>{a.actor_name}</strong> {a.details}</p>
                      {a.client_name && <p className="text-xs text-muted">{a.client_name}</p>}
                      <div className="activity-time">{timeAgo(a.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
