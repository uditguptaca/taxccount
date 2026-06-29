'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, Search, MapPin, ChevronRight, Calculator, CheckCircle2, 
  ShieldAlert, Landmark, Users, Clock, ArrowRight, Calendar, AlertCircle,
  FileText, Activity, Settings, UserCheck, Play, ArrowUpRight, RefreshCw
} from 'lucide-react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
function parseLocalDate(dateStr: string | null | undefined) {
  if (!dateStr) return new Date();
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return new Date(datePart + 'T00:00:00');
}

interface ClientRow {
  id: string;
  display_name: string;
  client_code: string;
  state_province: string;
  client_type: string;
  active_team: number;
  payroll_setup: string | null;
  default_province: string | null;
  remitter_type: string | null;
  last_run_date: string | null;
}

interface PendingRun {
  id: string;
  client_id: string;
  client_name: string;
  pay_group_name: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: string;
  total_gross: number;
}

interface PendingRemit {
  id: string;
  client_id: string;
  client_name: string;
  authority: string;
  due_date: string;
  total_amount: number;
}

interface RecentActivity {
  id: string;
  client_name: string;
  pay_group_name: string;
  period_start: string;
  period_end: string;
  total_gross: number;
  updated_at: string;
}

export default function PayrollLandingDashboard() {
  const router = useRouter();
  const { clients, selectedClientId, setSelectedClientId } = usePayrollClient();
  
  // Dashboard API data
  const [dbClients, setDbClients] = useState<ClientRow[]>([]);
  const [pendingRuns, setPendingRuns] = useState<PendingRun[]>([]);
  const [pendingRemits, setPendingRemits] = useState<PendingRemit[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    payrollClientsCount: 0,
    totalActiveEmployees: 0,
    totalProcessedThisMonth: 0
  });

  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/payroll/firm-dashboard`);
      const data = await res.json();
      if (data.clients) setDbClients(data.clients);
      if (data.pendingRuns) setPendingRuns(data.pendingRuns);
      if (data.pendingRemits) setPendingRemits(data.pendingRemits);
      if (data.recentActivity) setActivities(data.recentActivity);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Error loading firm dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredClients = React.useMemo(() => {
    const list = dbClients.length > 0 ? dbClients : (clients as any[]).map(c => ({
      id: c.id,
      display_name: c.display_name,
      client_code: c.client_code || 'MOCK',
      state_province: c.state_province || 'ON',
      client_type: c.client_type || 'Corporation',
      active_team: c.id === clients[0]?.id ? 5 : 0, // Fallback mock employee count if DB query empty
      payroll_setup: c.id === clients[0]?.id ? 'Setup' : null,
      default_province: 'ON',
      remitter_type: 'Regular',
      last_run_date: null
    }));

    return list.filter(c => {
      const matchesSearch = c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.client_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProv = selectedProvince === '' || c.state_province === selectedProvince;
      return matchesSearch && matchesProv;
    });
  }, [dbClients, clients, searchTerm, selectedProvince]);

  const uniqueProvinces = Array.from(new Set(filteredClients.map(c => c.state_province).filter(Boolean))) as string[];

  function formatMoney(n: number) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <RefreshCw size={32} style={{ color: '#10B981', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#64748B', fontSize: '16px' }}>Loading Payroll Dashboard...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.025em' }}>
            Payroll Command Center
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Firm-wide portal for payroll operations, client setup, pay runs, and stat compliance.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Payroll Clients</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{stats.payrollClientsCount} / {stats.totalClients}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Active Employees</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{stats.totalActiveEmployees}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF7ED', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Pending Runs</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: pendingRuns.length > 0 ? '#C2410C' : '#0F172A' }}>{pendingRuns.length}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Processed (Month)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{formatMoney(stats.totalProcessedThisMonth)}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: To-Dos on Left, Directory on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Tasks / Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pay Runs To-Do List */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#EA580C' }} /> Pay Runs To-Do
            </h3>
            {pendingRuns.length === 0 ? (
              <div style={{ padding: '20px', fontStyle: 'italic', color: '#64748B', fontSize: '13px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                All client pay runs are up to date!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRuns.map(run => (
                  <div key={run.id} style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#9A3412' }}>{run.client_name}</span>
                        <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 500 }}>{run.pay_group_name} ({run.status})</div>
                      </div>
                      <button 
                        onClick={() => { setSelectedClientId(run.client_id); router.push(`/dashboard/services/payroll/run/${run.id}`); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F97316', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Run <ArrowUpRight size={13} />
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7C2D12' }}>
                      Period: {format(parseLocalDate(run.period_start), 'MMM d')} – {format(parseLocalDate(run.period_end), 'MMM d')} | Pay Date: {format(parseLocalDate(run.pay_date), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Remittances */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} style={{ color: '#4F46E5' }} /> Remittances Due
            </h3>
            {pendingRemits.length === 0 ? (
              <div style={{ padding: '20px', fontStyle: 'italic', color: '#64748B', fontSize: '13px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                No pending filings or remittances.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRemits.map(remit => (
                  <div key={remit.id} style={{ background: '#EEF2FF', border: '1px solid #E0E7FF', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#3730A3' }}>{remit.client_name}</span>
                      <div style={{ fontSize: '11px', color: '#4338CA', textTransform: 'uppercase', fontWeight: 600 }}>{remit.authority} Due: {format(parseLocalDate(remit.due_date), 'MMM d')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>{formatMoney(remit.total_amount)}</div>
                      <button 
                        onClick={() => { setSelectedClientId(remit.client_id); router.push(`/dashboard/services/payroll/remittances`); }}
                        style={{ color: '#4F46E5', background: 'transparent', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0, marginTop: '2px' }}
                      >
                        View Remit →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Stream */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#10B981' }} /> Recent Activity
            </h3>
            {activities.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '13px' }}>No payroll runs completed yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activities.map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong style={{ color: '#1E293B' }}>{act.client_name}</strong> finalized pay run for <strong>{act.pay_group_name}</strong>.
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        Gross: {formatMoney(act.total_gross)} | {format(new Date(act.updated_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Client Directory */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>Client Payroll Directory</h3>
            
            {/* Search Filters */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
                <input 
                  type="text" 
                  placeholder="Search client name or code..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', background: 'white' }}
              >
                <option value="">All Provinces</option>
                {uniqueProvinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Client Company</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Team Size</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Payroll Setup</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Last Pay Run</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{c.display_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                      <span>{c.client_code}</span>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={11} /> {c.state_province}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                    {Number(c.active_team) > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        {Number(c.active_team)} active
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>0 workers</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {c.payroll_setup ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        Enabled
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        Not Set Up
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                    {c.last_run_date ? format(new Date(c.last_run_date), 'MMM d, yyyy') : 'No past runs'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => { setSelectedClientId(c.id); router.push('/dashboard/services/payroll/overview'); }}
                      style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '4px', 
                        background: '#3B82F6', color: 'white', border: 'none', 
                        padding: '6px 14px', borderRadius: '6px', fontSize: '12px', 
                        fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#2563EB'}
                      onMouseOut={e => e.currentTarget.style.background = '#3B82F6'}
                    >
                      Open Portal <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
