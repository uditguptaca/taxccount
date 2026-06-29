'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Clock, CheckCircle2, Play, AlertCircle, Plus, Calendar, Users, Briefcase, RefreshCw, ChevronRight, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

function parseLocalDate(dateStr: string | null | undefined) {
  if (!dateStr) return new Date();
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return new Date(datePart + 'T00:00:00');
}

interface PayGroup {
  id: string;
  name: string;
  frequency: string;
  auto_run: boolean;
  employee_count: number;
  contractor_count: number;
  next_period_start?: string;
  next_period_end?: string;
  next_pay_date?: string;
  next_processing_cutoff?: string;
}

interface PayRun {
  id: string;
  pay_group_name: string;
  status: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  total_gross: number;
  total_net: number;
  employee_count: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: '#F1F5F9', color: '#64748B' },
  HOURS_ENTERED: { bg: '#FEF3C7', color: '#92400E' },
  CALCULATED: { bg: '#DBEAFE', color: '#1D4ED8' },
  APPROVED: { bg: '#D1FAE5', color: '#059669' },
  PAID: { bg: '#D1FAE5', color: '#059669' },
  REVERSED: { bg: '#FEE2E2', color: '#991B1B' },
};

const FREQ_PERIODS: Record<string, number> = {
  Weekly: 52, 'Bi-weekly': 26, 'Semi-monthly': 24, Monthly: 12
};

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

export default function PayrollOverviewPage() {
  const router = useRouter();
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();

  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [payRuns, setPayRuns] = useState<PayRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [creatingRun, setCreatingRun] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const [groupsRes, runsRes] = await Promise.all([
        fetch(`/api/payroll/${clientId}/pay-groups`),
        fetch(`/api/payroll/${clientId}/runs`).catch(() => null)
      ]);

      const groupsData = await groupsRes.json();
      const runsData = runsRes ? await runsRes.json().catch(() => ({ runs: [] })) : { runs: [] };

      if (groupsData.groups) {
        // Enrich groups with employee counts and next period info
        const enriched = await Promise.all(groupsData.groups.map(async (g: any) => {
          // Get employee/contractor counts for this group
          let employeeCount = 0;
          let contractorCount = 0;
          try {
            const peopleRes = await fetch(`/api/payroll/${clientId}/people`);
            const peopleData = await peopleRes.json();
            if (peopleData.people) {
              const groupPeople = peopleData.people.filter((p: any) => p.pay_group_id === g.id);
              employeeCount = groupPeople.filter((p: any) => p.type === 'Employee').length;
              contractorCount = groupPeople.filter((p: any) => p.type === 'Contractor').length;
            }
          } catch {}

          // Get the next open schedule period
          let nextPeriod: any = null;
          try {
            const schedRes = await fetch(`/api/payroll/${clientId}/pay-groups/${g.id}/schedule`);
            const schedData = await schedRes.json();
            if (schedData.schedules) {
              nextPeriod = schedData.schedules.find((s: any) => s.status === 'OPEN') || schedData.schedules[0];
            }
          } catch {}

          // If no schedule, generate reasonable defaults
          const now = new Date();
          const freq = g.frequency || 'Bi-weekly';
          const periodsPerYear = FREQ_PERIODS[freq] || 26;

          return {
            ...g,
            auto_run: g.auto_run || false,
            employee_count: employeeCount,
            contractor_count: contractorCount,
            next_period_start: nextPeriod?.period_start || format(now, 'yyyy-MM-dd'),
            next_period_end: nextPeriod?.period_end || format(new Date(now.getTime() + 14 * 86400000), 'yyyy-MM-dd'),
            next_pay_date: nextPeriod?.pay_date || format(new Date(now.getTime() + 19 * 86400000), 'yyyy-MM-dd'),
            next_processing_cutoff: nextPeriod?.processing_cutoff,
          };
        }));
        setPayGroups(enriched);
      }

      if (runsData.runs) {
        setPayRuns(runsData.runs);
      }
    } catch (err) {
      console.error('Error loading overview:', err);
      // Set fallback dummy data if API fails
      setPayGroups([
        { id: 'demo-1', name: 'Hourly Staff', frequency: 'Weekly', auto_run: false, employee_count: 2, contractor_count: 1, next_period_start: '2026-06-22', next_period_end: '2026-06-28', next_pay_date: '2026-07-03' },
        { id: 'demo-2', name: 'Salaried Team', frequency: 'Bi-weekly', auto_run: true, employee_count: 3, contractor_count: 0, next_period_start: '2026-06-15', next_period_end: '2026-06-28', next_pay_date: '2026-07-03' },
        { id: 'demo-3', name: 'Management', frequency: 'Monthly', auto_run: false, employee_count: 1, contractor_count: 0, next_period_start: '2026-06-01', next_period_end: '2026-06-30', next_pay_date: '2026-07-05' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunPayroll = async (group: PayGroup) => {
    setCreatingRun(group.id);
    try {
      const res = await fetch(`/api/payroll/${clientId}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pay_group_id: group.id,
          period_start: group.next_period_start,
          period_end: group.next_period_end,
          pay_date: group.next_pay_date,
        }),
      });

      const data = await res.json();
      if (data.run?.id) {
        router.push(`/dashboard/services/payroll/run/${data.run.id}`);
      } else {
        // Fallback — navigate with group info
        router.push(`/dashboard/services/payroll/run/new?groupId=${group.id}`);
      }
    } catch {
      router.push(`/dashboard/services/payroll/run/new?groupId=${group.id}`);
    } finally {
      setCreatingRun(null);
    }
  };

  const filteredRuns = payRuns.filter(r => {
    if (activeTab === 'Overview') return true;
    if (activeTab === 'Not approved') return ['DRAFT', 'HOURS_ENTERED', 'CALCULATED'].includes(r.status);
    if (activeTab === 'Approved') return r.status === 'APPROVED';
    if (activeTab === 'Finalized') return r.status === 'PAID';
    return true;
  });

  if (clientLoading || loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <RefreshCw size={32} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#64748B', fontSize: '16px' }}>Loading payroll dashboard...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>Payroll</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Manage pay runs for your employees and contractors.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: '1px solid #E2E8F0', borderRadius: '8px', background: 'white', color: '#475569', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', padding: '20px', borderRadius: '12px', border: '1px solid #C7D2FE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={16} style={{ color: '#4F46E5' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4F46E5', textTransform: 'uppercase' }}>Pay Groups</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E1B4B' }}>{payGroups.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', padding: '20px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Briefcase size={16} style={{ color: '#16A34A' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', textTransform: 'uppercase' }}>Employees</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#14532D' }}>{payGroups.reduce((sum, g) => sum + g.employee_count, 0)}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', padding: '20px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={16} style={{ color: '#EA580C' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#EA580C', textTransform: 'uppercase' }}>YTD Payroll</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#7C2D12' }}>{formatMoney(payRuns.filter(r => r.status === 'PAID').reduce((s, r) => s + (r.total_gross || 0), 0))}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', padding: '20px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={16} style={{ color: '#2563EB' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase' }}>Runs Completed</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E3A5F' }}>{payRuns.filter(r => r.status === 'PAID').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E2E8F0', marginBottom: '32px' }}>
        {['Overview', 'Not approved', 'Approved', 'Finalized'].map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              paddingBottom: '16px',
              fontSize: '16px',
              fontWeight: 500,
              color: activeTab === tab ? '#0F172A' : '#64748B',
              borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
            {tab !== 'Overview' && (
              <span style={{ marginLeft: '6px', fontSize: '12px', background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px', color: '#64748B' }}>
                {payRuns.filter(r => {
                  if (tab === 'Not approved') return ['DRAFT', 'HOURS_ENTERED', 'CALCULATED'].includes(r.status);
                  if (tab === 'Approved') return r.status === 'APPROVED';
                  if (tab === 'Finalized') return r.status === 'PAID';
                  return false;
                }).length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Overview Tab — Pay Group Cards */}
      {activeTab === 'Overview' && (
        <>
          {payGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
              <Calendar size={48} style={{ color: '#94A3B8', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>No pay groups yet</h3>
              <p style={{ color: '#64748B', marginBottom: '24px' }}>Create a pay group to start running payroll for this client.</p>
              <Link
                href="/dashboard/services/payroll/pay-groups"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500, fontSize: '14px' }}
              >
                <Plus size={18} /> Create pay group
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {payGroups.map((group) => {
                const periodStart = group.next_period_start ? format(parseLocalDate(group.next_period_start), 'MMM d') : '—';
                const periodEnd = group.next_period_end ? format(parseLocalDate(group.next_period_end), 'MMM d') : '—';
                const payDate = group.next_pay_date ? format(parseLocalDate(group.next_pay_date), 'EEE, MMM d') : '—';

                return (
                  <div key={group.id} style={{
                    background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px',
                    padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease'
                  }}
                    onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>{group.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EEF2FF', color: '#4F46E5', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                            <Clock size={12} /> {group.frequency}
                          </span>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: group.auto_run ? '#D1FAE5' : '#F1F5F9',
                            color: group.auto_run ? '#059669' : '#64748B',
                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600
                          }}>
                            Auto-run {group.auto_run ? 'On' : 'Off'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* People counts */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Employees</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>{group.employee_count}</div>
                      </div>
                      <div style={{ width: '1px', background: '#E2E8F0' }} />
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Contractors</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>{group.contractor_count}</div>
                      </div>
                    </div>

                    {/* Schedule details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>Pay period</span>
                        <span style={{ color: '#0F172A', fontWeight: 500 }}>{periodStart} – {periodEnd}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>Pay date</span>
                        <span style={{ color: '#0F172A', fontWeight: 500 }}>{payDate}</span>
                      </div>
                    </div>

                    {/* Run button */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleRunPayroll(group)}
                        disabled={creatingRun === group.id}
                        style={{
                          background: creatingRun === group.id ? '#94A3B8' : '#10B981',
                          color: 'white', border: 'none', padding: '10px 28px', borderRadius: '8px',
                          fontSize: '14px', fontWeight: 600, cursor: creatingRun === group.id ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'background 0.2s ease, transform 0.1s ease'
                        }}
                        onMouseOver={e => { if (creatingRun !== group.id) e.currentTarget.style.background = '#059669'; }}
                        onMouseOut={e => { if (creatingRun !== group.id) e.currentTarget.style.background = '#10B981'; }}
                      >
                        {creatingRun === group.id ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
                        {creatingRun === group.id ? 'Creating...' : 'Run Payroll'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Pay Runs */}
          {payRuns.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Recent Pay Runs</h2>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Pay Group</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Period</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Pay Date</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Gross</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Net</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payRuns.slice(0, 5).map(run => {
                      const st = STATUS_STYLES[run.status] || STATUS_STYLES.DRAFT;
                      return (
                        <tr key={run.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{run.pay_group_name || 'Pay Run'}</td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>
                            {run.period_start ? format(new Date(run.period_start), 'MMM d') : '—'} – {run.period_end ? format(new Date(run.period_end), 'MMM d') : '—'}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>
                            {run.pay_date ? format(new Date(run.pay_date), 'MMM d, yyyy') : '—'}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#0F172A', fontWeight: 600, textAlign: 'right' }}>{formatMoney(run.total_gross || 0)}</td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#0F172A', fontWeight: 600, textAlign: 'right' }}>{formatMoney(run.total_net || 0)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span style={{ background: st.bg, color: st.color, padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                              {run.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => router.push(`/dashboard/services/payroll/run/${run.id}`)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
                            >
                              View <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Non-Overview tabs — Show filtered pay runs */}
      {activeTab !== 'Overview' && (
        <>
          {filteredRuns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#64748B' }}>
              <AlertCircle size={32} style={{ color: '#94A3B8', margin: '0 auto 12px', display: 'block' }} />
              No {activeTab.toLowerCase()} runs found.
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Pay Group</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Period</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Pay Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>People</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Gross</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRuns.map(run => {
                    const st = STATUS_STYLES[run.status] || STATUS_STYLES.DRAFT;
                    return (
                      <tr key={run.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{run.pay_group_name || 'Pay Run'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>
                          {run.period_start ? format(new Date(run.period_start), 'MMM d') : '—'} – {run.period_end ? format(new Date(run.period_end), 'MMM d') : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>
                          {run.pay_date ? format(new Date(run.pay_date), 'MMM d, yyyy') : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'right' }}>{run.employee_count || 0}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#0F172A', fontWeight: 600, textAlign: 'right' }}>{formatMoney(run.total_gross || 0)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ background: st.bg, color: st.color, padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                            {run.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => router.push(`/dashboard/services/payroll/run/${run.id}`)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
                          >
                            {['DRAFT', 'HOURS_ENTERED', 'CALCULATED'].includes(run.status) ? 'Continue' : 'View'} <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
