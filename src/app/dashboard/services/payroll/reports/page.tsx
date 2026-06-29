'use client';

import React, { useState } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { 
  FileText, Calendar, Users, BarChart3, Download, Eye, 
  ChevronRight, ArrowLeft, RefreshCw, Printer, Filter
} from 'lucide-react';

const REPORTS_LIST = [
  {
    category: 'Pay Run Reports',
    items: [
      { key: 'register', title: 'Payroll Register', desc: 'Summary of gross pay, deductions, and net pay for all employees per run.' },
      { key: 'stub', title: 'Pay Statement / Stub', desc: 'Province-compliant pay statements detailing hours, rates, and deductions.' },
      { key: 'journal', title: 'GL Journal Export', desc: 'Accounting debits and credits ready to import into your Chart of Accounts.' },
      { key: 'funding', title: 'Net Pay & Funding Summary', desc: 'Detailed banking summary of direct deposit files and cheque registers.' }
    ]
  },
  {
    category: 'Compliance & Remittances',
    items: [
      { key: 'pd7a', title: 'PD7A Remittance Summary', desc: 'CRA source deductions summary (tax, CPP, EI) for regular or accelerated filers.' },
      { key: 'pier', title: 'PIER Review Report', desc: 'Pensionable and Insurable Earnings Review to flag CPP/EI calculation variances.' },
      { key: 'wcb', title: 'Workers\' Comp Assessable Earnings', desc: 'Provincial workers\' compensation board taxable wage and levy reports.' },
      { key: 'eht', title: 'EHT / HSF Worksheet', desc: 'Employer Health Tax and Quebec HSF threshold exemptions and calculations.' }
    ]
  },
  {
    category: 'People & Year-End Slips',
    items: [
      { key: 'ytd', title: 'Employee YTD Summary', desc: 'Cumulative year-to-date earnings, tax credits, and employer payroll costs.' },
      { key: 'vacation', title: 'Vacation Liability Report', desc: 'Accrued vs paid vacation pay and outstanding balance liability.' },
      { key: 't4', title: 'T4 / T4 Summary', desc: 'Year-end CRA T4 slip mapping and T4 Summary worksheet calculations.' },
      { key: 'roe', title: 'ROE Register', desc: 'Log of issued Records of Employment with insurable hours and reason codes.' }
    ]
  }
];

export default function ReportsPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [payGroup, setPayGroup] = useState('All');
  const [dateRange, setDateRange] = useState('2026-Q2');
  const [generating, setGenerating] = useState(false);
  const [showReportData, setShowReportData] = useState(false);

  if (clientLoading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading reports...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  const handleRunReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowReportData(true);
    }, 1500);
  };

  const getReportTitle = () => {
    for (const cat of REPORTS_LIST) {
      const item = cat.items.find(i => i.key === selectedReport);
      if (item) return item.title;
    }
    return 'Report';
  };

  return (
    <div style={{ maxWidth: '1000px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Back to menu if in report view */}
      {selectedReport && (
        <button 
          onClick={() => { setSelectedReport(null); setShowReportData(false); }}
          style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', cursor: 'pointer', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Back to Reports Menu
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
          {selectedReport ? getReportTitle() : 'Reports & Analytics'}
        </h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>
          {selectedReport ? 'Configure filters and export your payroll report.' : 'Generate compliance worksheets, pay registers, and accounting journal entries.'}
        </p>
      </div>

      {/* MAIN LAYOUT */}
      {!selectedReport ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {REPORTS_LIST.map((cat) => (
            <div key={cat.category}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {cat.items.map((item) => (
                  <div 
                    key={item.key}
                    onClick={() => setSelectedReport(item.key)}
                    style={{ 
                      background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', 
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', 
                      justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>{item.title}</h4>
                        <p style={{ color: '#64748B', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#94A3B8', marginLeft: '12px' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Filter Panel */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} /> Filter Criteria
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Pay Group</label>
                <select value={payGroup} onChange={e => setPayGroup(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}>
                  <option value="All">All Groups</option>
                  <option value="hourly">Hourly Staff</option>
                  <option value="salaried">Salaried Team</option>
                  <option value="mgmt">Management</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Date Range / Period</label>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}>
                  <option value="2026-Q1">Q1 2026 (Jan - Mar)</option>
                  <option value="2026-Q2">Q2 2026 (Apr - Jun)</option>
                  <option value="2026-Q3">Q3 2026 (Jul - Sep)</option>
                  <option value="2026-Q4">Q4 2026 (Oct - Dec)</option>
                  <option value="custom">Custom Date Range...</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  onClick={handleRunReport}
                  disabled={generating}
                  style={{ width: '100%', background: '#3B82F6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {generating ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <BarChart3 size={16} />}
                  {generating ? 'Generating...' : 'Run Report'}
                </button>
              </div>
            </div>
          </div>

          {/* Report Data / Preview */}
          {showReportData && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>Report Preview</h4>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Generated for period {dateRange} ({payGroup} groups)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: 'white', border: '1px solid #CBD5E1', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Export CSV
                  </button>
                  <button style={{ background: 'white', border: '1px solid #CBD5E1', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Export XLSX
                  </button>
                  <button style={{ background: 'white', border: '1px solid #CBD5E1', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={14} /> Print PDF
                  </button>
                </div>
              </div>

              {/* Sample Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Employee</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Pay Group</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Gross Pay</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Fed Tax</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Prov Tax</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>CPP</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>EI</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Sarah Chen</td>
                      <td style={{ padding: '12px' }}>Salaried Team</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$6,538.46</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$1,273.40</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$432.10</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$354.20</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$106.57</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>$4,372.19</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>James Wilson</td>
                      <td style={{ padding: '12px' }}>Hourly Staff</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$2,280.00</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$254.60</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$98.50</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$112.50</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$37.16</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>$1,777.24</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Maria Garcia</td>
                      <td style={{ padding: '12px' }}>Salaried Team</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$5,538.46</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$984.50</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$324.60</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$298.50</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$90.28</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>$3,840.58</td>
                    </tr>
                    <tr style={{ background: '#F8FAFC', fontWeight: 700 }}>
                      <td colSpan={2} style={{ padding: '12px' }}>Total Sum</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$14,356.92</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$2,512.50</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$855.20</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$765.20</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>$234.01</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#1E3A8A' }}>$9,990.01</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
