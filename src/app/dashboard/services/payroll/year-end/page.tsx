'use client';

import React, { useState } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { FileText, Users, Download, Eye, AlertTriangle, CheckCircle2, RefreshCw, Printer, ChevronDown } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: '#F1F5F9', color: '#64748B' },
  ISSUED: { bg: '#D1FAE5', color: '#059669' },
  AMENDED: { bg: '#FEF3C7', color: '#92400E' },
};

const SLIP_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  T4: { bg: '#DBEAFE', color: '#1D4ED8' },
  T4A: { bg: '#E0E7FF', color: '#4338CA' },
  'RL-1': { bg: '#FCE7F3', color: '#BE185D' },
};

const formatCurrency = (v: number) =>
  '$' + v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DUMMY_SLIPS = [
  { id: '1', employee: 'Sarah Chen', sin_last4: '•••• 3912', slipType: 'T4', box14: 82500.00, box22: 16087.50, cpp: 3867.50, ei: 1049.12, status: 'ISSUED' },
  { id: '2', employee: 'Michael Torres', sin_last4: '•••• 7284', slipType: 'T4', box14: 68000.00, box22: 12920.00, cpp: 3867.50, ei: 1049.12, status: 'ISSUED' },
  { id: '3', employee: 'Priya Sharma', sin_last4: '•••• 5601', slipType: 'T4', box14: 95200.00, box22: 20854.80, cpp: 3867.50, ei: 1049.12, status: 'DRAFT' },
  { id: '4', employee: 'James Wilson', sin_last4: '•••• 4821', slipType: 'T4', box14: 62400.00, box22: 11232.00, cpp: 3567.84, ei: 963.37, status: 'AMENDED' },
  { id: '5', employee: 'David Park', sin_last4: '•••• 6253', slipType: 'T4A', box14: 15000.00, box22: 2250.00, cpp: 0, ei: 0, status: 'DRAFT' },
  { id: '6', employee: 'Sarah Chen', sin_last4: '•••• 3912', slipType: 'RL-1', box14: 82500.00, box22: 16087.50, cpp: 3867.50, ei: 1049.12, status: 'ISSUED' },
];

const PIER_WARNINGS = [
  { employee: 'James Wilson', type: 'CPP Under-remittance', expected: 3867.50, actual: 3567.84, variance: -299.66, severity: 'warning' },
  { employee: 'James Wilson', type: 'EI Under-remittance', expected: 1049.12, actual: 963.37, variance: -85.75, severity: 'warning' },
  { employee: 'David Park', type: 'Tax Over-remittance', expected: 2100.00, actual: 2250.00, variance: 150.00, severity: 'info' },
];

export default function YearEndPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  if (clientLoading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading year-end data...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  const t4Count = DUMMY_SLIPS.filter(s => s.slipType === 'T4').length;
  const t4aCount = DUMMY_SLIPS.filter(s => s.slipType === 'T4A').length;
  const rl1Count = DUMMY_SLIPS.filter(s => s.slipType === 'RL-1').length;
  const uniqueEmployees = new Set(DUMMY_SLIPS.map(s => s.employee)).size;

  const statsCards = [
    { label: 'Total Employees', value: uniqueEmployees.toString(), icon: <Users size={20} />, color: '#3B82F6' },
    { label: 'T4s Generated', value: t4Count.toString(), icon: <FileText size={20} />, color: '#1D4ED8' },
    { label: 'T4As Generated', value: t4aCount.toString(), icon: <FileText size={20} />, color: '#4338CA' },
    { label: 'RL-1s Generated', value: rl1Count.toString(), icon: <FileText size={20} />, color: '#BE185D' },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Year-End Slips</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Generate and manage T4, T4A, and RL-1 slips for tax year {selectedYear}.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #CBD5E1', padding: '8px 12px', borderRadius: '8px' }}>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              background: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px',
              borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 1px 3px rgba(59,130,246,0.3)',
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Printer size={16} />}
            {generating ? 'Generating...' : 'Generate All Slips'}
          </button>
        </div>
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

      {/* Slips Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Tax Slips — {selectedYear}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'white', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={13} /> Export All
            </button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Employee', 'Slip Type', 'Box 14 — Employment Income', 'Box 22 — Tax Deducted', 'CPP', 'EI', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '14px 20px', fontSize: '11px', fontWeight: 600, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  textAlign: ['Box 14 — Employment Income', 'Box 22 — Tax Deducted', 'CPP', 'EI'].includes(h) ? 'right' : 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DUMMY_SLIPS.map(s => {
              const statusStyle = STATUS_STYLES[s.status];
              const typeStyle = SLIP_TYPE_COLORS[s.slipType];
              return (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    background: hoveredRow === s.id ? '#F8FAFC' : 'transparent',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={() => setHoveredRow(s.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{s.employee}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>SIN {s.sin_last4}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex', padding: '3px 10px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: 700,
                      background: typeStyle.bg, color: typeStyle.color,
                    }}>
                      {s.slipType}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: '#0F172A', textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatCurrency(s.box14)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#475569', textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatCurrency(s.box22)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#475569', textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatCurrency(s.cpp)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#475569', textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatCurrency(s.ei)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex', padding: '3px 10px', borderRadius: '12px',
                      fontSize: '12px', fontWeight: 600,
                      background: statusStyle.bg, color: statusStyle.color,
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}>
                        <Eye size={14} />
                      </button>
                      <button style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}>
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PIER Variance Check */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#FEF3C7', color: '#D97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>PIER Variance Check</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>Pensionable and Insurable Earnings Review — identifies under/over-remittance</div>
            </div>
          </div>
          <span style={{
            display: 'inline-flex', padding: '4px 12px', borderRadius: '12px',
            fontSize: '12px', fontWeight: 600,
            background: '#FEF3C7', color: '#92400E',
          }}>
            {PIER_WARNINGS.length} warnings
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FFFBEB', borderBottom: '1px solid #E2E8F0' }}>
              {['Employee', 'Variance Type', 'Expected', 'Actual', 'Variance'].map(h => (
                <th key={h} style={{
                  padding: '12px 24px', fontSize: '11px', fontWeight: 600, color: '#92400E',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  textAlign: ['Expected', 'Actual', 'Variance'].includes(h) ? 'right' : 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PIER_WARNINGS.map((w, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{w.employee}</td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                    {w.severity === 'warning' ? <AlertTriangle size={14} style={{ color: '#D97706' }} /> : <CheckCircle2 size={14} style={{ color: '#3B82F6' }} />}
                    {w.type}
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#475569', textAlign: 'right', fontFamily: 'monospace' }}>
                  {formatCurrency(w.expected)}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#475569', textAlign: 'right', fontFamily: 'monospace' }}>
                  {formatCurrency(w.actual)}
                </td>
                <td style={{
                  padding: '14px 24px', fontSize: '14px', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace',
                  color: w.variance < 0 ? '#EF4444' : '#10B981',
                }}>
                  {w.variance < 0 ? '-' : '+'}${Math.abs(w.variance).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Keyframes for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
