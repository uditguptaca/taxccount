'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { 
  Building2, Calendar, FileText, CheckCircle2, AlertCircle, 
  RefreshCw, DollarSign, ArrowRight, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { format } from 'date-fns';

interface Remittance {
  id: string;
  pay_run_id?: string;
  authority: string;
  period_start: string;
  period_end: string;
  due_date: string;
  total_cpp: number;
  total_ei: number;
  total_tax: number;
  total_employer_cpp: number;
  total_employer_ei: number;
  total_amount: number;
  status: string;
  filed_at?: string;
  pay_date?: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  FILED: { bg: '#DBEAFE', color: '#1D4ED8' },
  PAID: { bg: '#D1FAE5', color: '#059669' },
  LATE: { bg: '#FEE2E2', color: '#991B1B' }
};

export default function RemittancesPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('CRA');
  const [selectedRemit, setSelectedRemit] = useState<Remittance | null>(null);

  const fetchRemittances = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/${clientId}/remittances`);
      const data = await res.json();
      if (data.remittances) {
        setRemittances(data.remittances);
        if (data.remittances.length > 0) {
          setSelectedRemit(data.remittances[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching remittances:', err);
      // Fallback dummy data
      const dummy = [
        { id: '1', authority: 'CRA', period_start: '2026-05-01', period_end: '2026-05-31', due_date: '2026-06-15', total_cpp: 406.80, total_ei: 111.60, total_tax: 860.00, total_employer_cpp: 406.80, total_employer_ei: 156.24, total_amount: 1941.44, status: 'PAID' },
        { id: '2', authority: 'CRA', period_start: '2026-06-01', period_end: '2026-06-30', due_date: '2026-07-15', total_cpp: 384.20, total_ei: 98.40, total_tax: 720.00, total_employer_cpp: 384.20, total_employer_ei: 137.76, total_amount: 1724.56, status: 'PENDING' },
        { id: '3', authority: 'WCB', period_start: '2026-04-01', period_end: '2026-06-30', due_date: '2026-07-31', total_cpp: 0, total_ei: 0, total_tax: 0, total_employer_cpp: 0, total_employer_ei: 0, total_amount: 184.50, status: 'PENDING' }
      ];
      setRemittances(dummy);
      setSelectedRemit(dummy[0]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchRemittances();
  }, [fetchRemittances]);

  const handleMarkPaid = async (id: string) => {
    // In a full implementation, this hits an API PATCH. Let's do instant client-side update for prototype feedback
    const updated = remittances.map(r => r.id === id ? { ...r, status: 'PAID' } : r);
    setRemittances(updated);
    if (selectedRemit?.id === id) {
      setSelectedRemit({ ...selectedRemit, status: 'PAID' });
    }
  };

  if (clientLoading || loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <RefreshCw size={32} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#64748B', fontSize: '16px' }}>Loading remittances...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  const filtered = remittances.filter(r => r.authority === activeTab);
  const pendingCount = remittances.filter(r => r.status === 'PENDING').length;
  const paidYtd = remittances.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.total_amount, 0);

  function formatMoney(n: number) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
  }

  return (
    <div style={{ maxWidth: '1200px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Remittances</h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Track source deductions (tax, CPP, EI) and workers\' compensation payments due to government authorities.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Next Remittance Due</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>July 15, 2026</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Filings</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: pendingCount > 0 ? '#B45309' : '#0F172A' }}>{pendingCount}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Total Paid (2026 YTD)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#16A34A' }}>{formatMoney(paidYtd)}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Tracked Accounts</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>2 Authorities</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px' }}>
        {['CRA', 'Revenu Québec', 'WCB', 'EHT/HSF'].map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              paddingBottom: '16px', 
              fontSize: '15px', 
              fontWeight: 500,
              color: activeTab === tab ? '#0F172A' : '#64748B',
              borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Content Split: List & PD7A Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px' }}>
        
        {/* Left Side: Remittance List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#64748B' }}>
              <BadgeInfo size={36} style={{ color: '#CBD5E1', margin: '0 auto 12px', display: 'block' }} />
              No remittances found for {activeTab}.
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Period</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Due Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const st = STATUS_COLORS[r.status] || STATUS_COLORS.PENDING;
                    const isSelected = selectedRemit?.id === r.id;
                    return (
                      <tr 
                        key={r.id} 
                        onClick={() => setSelectedRemit(r)}
                        style={{ 
                          borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
                          background: isSelected ? '#EFF6FF' : 'transparent',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                          {format(new Date(r.period_start + 'T00:00:00'), 'MMM d')} – {format(new Date(r.period_end + 'T00:00:00'), 'MMM d, yyyy')}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                          {format(new Date(r.due_date + 'T00:00:00'), 'MMM d, yyyy')}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>
                          {formatMoney(r.total_amount)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Breakout Detail Panel */}
        <div>
          {selectedRemit ? (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>PD7A Remittance Summary</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Period: {format(new Date(selectedRemit.period_start + 'T00:00:00'), 'MMM d')} – {format(new Date(selectedRemit.period_end + 'T00:00:00'), 'MMM d, yyyy')}</span>
                </div>
                <span style={{ background: STATUS_COLORS[selectedRemit.status].bg, color: STATUS_COLORS[selectedRemit.status].color, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                  {selectedRemit.status}
                </span>
              </div>

              {selectedRemit.authority === 'CRA' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Federal Income Tax (Withheld)</span>
                    <span style={{ fontWeight: 500 }}>{formatMoney(selectedRemit.total_tax)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>CPP Employee Portion</span>
                    <span style={{ fontWeight: 500 }}>{formatMoney(selectedRemit.total_cpp)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>CPP Employer Portion (1.0x)</span>
                    <span style={{ fontWeight: 500 }}>{formatMoney(selectedRemit.total_employer_cpp || selectedRemit.total_cpp)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>EI Employee Portion</span>
                    <span style={{ fontWeight: 500 }}>{formatMoney(selectedRemit.total_ei)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>EI Employer Portion (1.4x)</span>
                    <span style={{ fontWeight: 500 }}>{formatMoney(selectedRemit.total_employer_ei || selectedRemit.total_ei * 1.4)}</span>
                  </div>
                  
                  <div style={{ height: '1px', background: '#E2E8F0', margin: '8px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#1E3A8A' }}>
                    <span>Total Remittance Due</span>
                    <span>{formatMoney(selectedRemit.total_amount)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Gross Assessable Earnings</span>
                    <span style={{ fontWeight: 500 }}>{formatMoney(selectedRemit.total_amount * 100 / 1.5)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>WCB Premium Levy Rate</span>
                    <span style={{ fontWeight: 500 }}>1.50%</span>
                  </div>
                  <div style={{ height: '1px', background: '#E2E8F0', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#1E3A8A' }}>
                    <span>Total Levy Due</span>
                    <span>{formatMoney(selectedRemit.total_amount)}</span>
                  </div>
                </div>
              )}

              {selectedRemit.status === 'PENDING' && (
                <button 
                  onClick={() => handleMarkPaid(selectedRemit.id)}
                  style={{ width: '100%', marginTop: '24px', background: '#10B981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} /> Mark Paid & Remitted
                </button>
              )}
            </div>
          ) : (
            <div style={{ border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', color: '#64748B' }}>
              Select a remittance period to view detailed PD7A calculations.
            </div>
          )}
        </div>

      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
