'use client';

import React, { useState } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Plus, FileText, Send, Clock, CheckCircle2, AlertCircle, X, Search, Download, Eye } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { bg: '#F1F5F9', color: '#64748B', icon: <Clock size={12} /> },
  ISSUED: { bg: '#DBEAFE', color: '#1D4ED8', icon: <CheckCircle2 size={12} /> },
  SUBMITTED: { bg: '#D1FAE5', color: '#059669', icon: <Send size={12} /> },
};

const REASON_CODES: Record<string, { code: string; label: string; color: string }> = {
  A: { code: 'A', label: 'Shortage of Work', color: '#3B82F6' },
  D: { code: 'D', label: 'Illness / Injury', color: '#F59E0B' },
  E: { code: 'E', label: 'Quit', color: '#EF4444' },
  K: { code: 'K', label: 'Other', color: '#64748B' },
  M: { code: 'M', label: 'Dismissal', color: '#DC2626' },
  N: { code: 'N', label: 'Leave of Absence', color: '#8B5CF6' },
};

const DUMMY_ROES = [
  {
    id: '1',
    employee: 'James Wilson',
    sin_last4: '•••• 4821',
    reasonCode: 'A',
    lastDayWorked: '2026-06-20',
    firstDayWorked: '2023-03-15',
    insurableHours: 1847,
    insurableEarnings: 68450.00,
    vacationPay: 2738.00,
    status: 'SUBMITTED',
    serialNumber: 'W12345678',
    issuedDate: '2026-06-22',
  },
  {
    id: '2',
    employee: 'Emily Rodriguez',
    sin_last4: '•••• 9037',
    reasonCode: 'E',
    lastDayWorked: '2026-06-15',
    firstDayWorked: '2024-09-01',
    insurableHours: 1560,
    insurableEarnings: 52300.00,
    vacationPay: 2092.00,
    status: 'ISSUED',
    serialNumber: 'W12345679',
    issuedDate: '2026-06-18',
  },
  {
    id: '3',
    employee: 'David Park',
    sin_last4: '•••• 6253',
    reasonCode: 'D',
    lastDayWorked: '2026-06-25',
    firstDayWorked: '2022-01-10',
    insurableHours: 2080,
    insurableEarnings: 78900.00,
    vacationPay: 3156.00,
    status: 'DRAFT',
    serialNumber: '',
    issuedDate: '',
  },
];

const formatCurrency = (v: number) =>
  '$' + v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ROEPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [roes] = useState(DUMMY_ROES);
  const [showDrawer, setShowDrawer] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedROE, setSelectedROE] = useState<typeof DUMMY_ROES[0] | null>(null);

  if (clientLoading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading ROEs...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  const filteredRoes = roes.filter(r => r.employee.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = [
    { label: 'Total ROEs', value: roes.length.toString(), color: '#3B82F6' },
    { label: 'Submitted', value: roes.filter(r => r.status === 'SUBMITTED').length.toString(), color: '#10B981' },
    { label: 'Pending', value: roes.filter(r => r.status !== 'SUBMITTED').length.toString(), color: '#F59E0B' },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Record of Employment</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Issue ROEs when employee earnings stop.</p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          style={{
            background: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 1px 3px rgba(59,130,246,0.3)',
          }}
        >
          <Plus size={16} /> Issue ROE
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0',
            padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: s.color + '12', color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ROE Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Issued ROEs</span>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
            <input
              type="text" placeholder="Search employees..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Employee', 'Reason', 'Last Day Worked', 'Insurable Hours', 'Insurable Earnings', 'Status', ''].map((h, i) => (
                <th key={h || i} style={{
                  padding: '14px 24px', fontSize: '11px', fontWeight: 600, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  textAlign: ['Insurable Hours', 'Insurable Earnings'].includes(h) ? 'right' : 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRoes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <div style={{ color: '#94A3B8', marginBottom: '8px' }}><FileText size={40} style={{ opacity: 0.3 }} /></div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>No ROEs found</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8' }}>Issue an ROE when an employee&apos;s earnings are interrupted.</div>
                </td>
              </tr>
            ) : filteredRoes.map(r => {
              const reason = REASON_CODES[r.reasonCode];
              const status = STATUS_STYLES[r.status];
              return (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    background: hoveredRow === r.id ? '#F8FAFC' : 'transparent',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={() => setHoveredRow(r.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{r.employee}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>SIN {r.sin_last4}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: reason.color + '15', color: reason.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700,
                      }}>
                        {reason.code}
                      </div>
                      <span style={{ fontSize: '13px', color: '#475569' }}>{reason.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                    {new Date(r.lastDayWorked + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', textAlign: 'right', fontFamily: 'monospace' }}>
                    {r.insurableHours.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#0F172A', textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatCurrency(r.insurableEarnings)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: '12px',
                      fontSize: '12px', fontWeight: 600,
                      background: status.bg, color: status.color,
                    }}>
                      {status.icon} {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedROE(r)}
                        style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                      >
                        <Eye size={13} /> View
                      </button>
                      {r.status === 'DRAFT' && (
                        <button style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                          <Send size={13} /> Submit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ROE Detail Panel */}
      {selectedROE && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} onClick={() => setSelectedROE(null)} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px',
            background: 'white', boxShadow: '-8px 0 24px rgba(0,0,0,0.08)', zIndex: 1000,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0F172A' }}>ROE Details</h2>
              <button onClick={() => setSelectedROE(null)} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  ['Employee', selectedROE.employee],
                  ['SIN', selectedROE.sin_last4],
                  ['Reason Code', `${selectedROE.reasonCode} — ${REASON_CODES[selectedROE.reasonCode].label}`],
                  ['First Day Worked', new Date(selectedROE.firstDayWorked + 'T00:00:00').toLocaleDateString('en-CA')],
                  ['Last Day Worked', new Date(selectedROE.lastDayWorked + 'T00:00:00').toLocaleDateString('en-CA')],
                  ['Insurable Hours', selectedROE.insurableHours.toLocaleString()],
                  ['Insurable Earnings', formatCurrency(selectedROE.insurableEarnings)],
                  ['Vacation Pay', formatCurrency(selectedROE.vacationPay)],
                  ['Serial Number', selectedROE.serialNumber || '—'],
                  ['Status', selectedROE.status],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Insurable Earnings Breakdown (Last Pay Periods)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[5250.00, 5250.00, 5250.00, 5250.00, 4875.00].map((amt, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748B' }}>PP {i + 1}</span>
                      <span style={{ fontFamily: 'monospace', color: '#0F172A', fontWeight: 500 }}>{formatCurrency(amt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </>
      )}

      {/* Issue ROE Drawer */}
      {showDrawer && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} onClick={() => setShowDrawer(false)} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px',
            background: 'white', boxShadow: '-8px 0 24px rgba(0,0,0,0.08)', zIndex: 1000,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0F172A' }}>Issue ROE</h2>
              <button onClick={() => setShowDrawer(false)} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Employee</label>
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px', background: 'white' }}>
                  <option value="">-- Select employee --</option>
                  <option>Sarah Chen</option>
                  <option>Michael Torres</option>
                  <option>Priya Sharma</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Reason Code</label>
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px', background: 'white' }}>
                  <option value="">-- Select reason --</option>
                  {Object.values(REASON_CODES).map(r => (
                    <option key={r.code} value={r.code}>{r.code} — {r.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>First Day Worked</label>
                  <input type="date" style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Last Day Worked</label>
                  <input type="date" style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Insurable Hours</label>
                  <input type="number" placeholder="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Insurable Earnings</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748B' }}>$</span>
                    <input type="number" step="0.01" placeholder="0.00" style={{ width: '100%', padding: '10px 12px 10px 24px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
                  </div>
                </div>
              </div>
              <div style={{ background: '#FFFBEB', borderRadius: '8px', padding: '16px', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ color: '#D97706', marginTop: '1px', flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
                    ROEs must be issued within 5 calendar days of the employee&apos;s last day of work or the day you become aware of the interruption of earnings.
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', color: '#334155' }}>Cancel</button>
              <button style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Issue ROE</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
