'use client';

import React, { useState } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Plus, DollarSign, AlertTriangle, Gift, MoreVertical, Calendar, Users, TrendingUp, ChevronDown, X } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  COMPLETED: { bg: '#D1FAE5', color: '#059669' },
  DRAFT: { bg: '#F1F5F9', color: '#64748B' },
  APPROVED: { bg: '#DBEAFE', color: '#1D4ED8' },
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Bonus: <Gift size={16} style={{ color: '#10B981' }} />,
  Correction: <AlertTriangle size={16} style={{ color: '#EF4444' }} />,
  'Extra Payment': <DollarSign size={16} style={{ color: '#3B82F6' }} />,
};

const DUMMY_ADJUSTMENTS = [
  {
    id: '1',
    date: '2026-06-15',
    type: 'Bonus',
    description: 'Q2 Performance Bonus',
    people: ['Sarah Chen', 'Michael Torres', 'Priya Sharma'],
    gross: 7500.00,
    net: 4987.50,
    status: 'COMPLETED',
    payGroup: 'Salaried — Bi-weekly',
  },
  {
    id: '2',
    date: '2026-06-10',
    type: 'Correction',
    description: 'Overtime correction — May period',
    people: ['James Wilson'],
    gross: -150.00,
    net: -99.75,
    status: 'COMPLETED',
    payGroup: 'Hourly — Weekly',
  },
  {
    id: '3',
    date: '2026-06-28',
    type: 'Extra Payment',
    description: 'Signing bonus — new hire',
    people: ['Emily Rodriguez'],
    gross: 2500.00,
    net: 1662.50,
    status: 'DRAFT',
    payGroup: 'Salaried — Bi-weekly',
  },
];

const formatCurrency = (v: number) => {
  const sign = v < 0 ? '-' : '';
  return sign + '$' + Math.abs(v).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function AdjustmentsPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [adjustments] = useState(DUMMY_ADJUSTMENTS);
  const [showDrawer, setShowDrawer] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'Bonus',
    description: '',
    people: [] as string[],
    amount: '',
    payGroup: '',
  });

  if (clientLoading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading adjustments...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  const totalGross = adjustments.reduce((s, a) => s + a.gross, 0);
  const completedCount = adjustments.filter(a => a.status === 'COMPLETED').length;
  const draftCount = adjustments.filter(a => a.status === 'DRAFT').length;

  const statsCards = [
    { label: 'Total Adjustments', value: adjustments.length.toString(), icon: <TrendingUp size={20} />, color: '#3B82F6' },
    { label: 'Completed', value: completedCount.toString(), icon: <Calendar size={20} />, color: '#10B981' },
    { label: 'Drafts', value: draftCount.toString(), icon: <AlertTriangle size={20} />, color: '#F59E0B' },
    { label: 'Total Gross', value: formatCurrency(totalGross), icon: <DollarSign size={20} />, color: '#8B5CF6' },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Adjustments</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Bonus runs, corrections, and off-cycle payments.</p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          style={{
            background: '#10B981', color: 'white', border: 'none', padding: '10px 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 1px 3px rgba(16,185,129,0.3)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = '#059669'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = '#10B981'; }}
        >
          <Plus size={16} /> New Adjustment
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statsCards.map(card => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0',
            padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>{card.value}</div>
              </div>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: card.color + '15', color: card.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Adjustment History</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', cursor: 'pointer' }}>
            All Types <ChevronDown size={14} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Date', 'Type', 'Description', 'People', 'Gross', 'Net', 'Status', ''].map(h => (
                <th key={h} style={{
                  padding: '14px 24px', fontSize: '11px', fontWeight: 600, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  textAlign: h === 'Gross' || h === 'Net' ? 'right' : 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adjustments.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <div style={{ color: '#94A3B8', marginBottom: '8px' }}>
                    <DollarSign size={40} style={{ opacity: 0.3 }} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>No adjustments yet</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8' }}>Create your first bonus run, correction, or off-cycle payment.</div>
                </td>
              </tr>
            ) : adjustments.map(a => {
              const s = STATUS_STYLES[a.status] || STATUS_STYLES.DRAFT;
              return (
                <tr
                  key={a.id}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    background: hoveredRow === a.id ? '#F8FAFC' : 'transparent',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={() => setHoveredRow(a.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>
                    {new Date(a.date + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>
                      {TYPE_ICONS[a.type]} {a.type}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>{a.description}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} style={{ color: '#94A3B8' }} />
                      <span style={{ fontSize: '14px', color: '#475569' }}>{a.people.length}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '4px' }}>
                        {a.people.length === 1 ? a.people[0] : `${a.people[0]} +${a.people.length - 1}`}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '16px 24px', fontSize: '14px', fontWeight: 600, textAlign: 'right',
                    color: a.gross < 0 ? '#EF4444' : '#0F172A', fontFamily: 'monospace',
                  }}>
                    {formatCurrency(a.gross)}
                  </td>
                  <td style={{
                    padding: '16px 24px', fontSize: '14px', textAlign: 'right',
                    color: a.net < 0 ? '#EF4444' : '#475569', fontFamily: 'monospace',
                  }}>
                    {formatCurrency(a.net)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex', padding: '3px 10px', borderRadius: '12px',
                      fontSize: '12px', fontWeight: 600,
                      background: s.bg, color: s.color,
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Adjustment Drawer */}
      {showDrawer && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} onClick={() => setShowDrawer(false)} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px',
            background: 'white', boxShadow: '-8px 0 24px rgba(0,0,0,0.08)', zIndex: 1000,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0F172A' }}>New Adjustment</h2>
              <button onClick={() => setShowDrawer(false)} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Adjustment Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px', background: 'white' }}>
                  <option value="Bonus">Bonus</option>
                  <option value="Correction">Correction</option>
                  <option value="Extra Payment">Extra Payment</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Description</label>
                <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Q2 performance bonus" style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Pay Group</label>
                <select value={formData.payGroup} onChange={e => setFormData({ ...formData, payGroup: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px', background: 'white' }}>
                  <option value="">-- Select pay group --</option>
                  <option value="salaried">Salaried — Bi-weekly</option>
                  <option value="hourly">Hourly — Weekly</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Gross Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748B', fontSize: '14px' }}>$</span>
                  <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" style={{ width: '100%', padding: '10px 12px 10px 24px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Note</div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  All applicable source deductions (CPP, EI, income tax) will be calculated automatically based on employee YTD balances.
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', color: '#334155' }}>Cancel</button>
              <button style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', boxShadow: '0 1px 3px rgba(16,185,129,0.3)' }}>Create Adjustment</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
