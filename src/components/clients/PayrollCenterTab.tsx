import React, { useEffect, useState } from 'react';
import { Users, Banknote, FileText, Plus, Calculator, CheckCircle2, AlertCircle, PlayCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface PayrollCenterTabProps {
  clientId: string;
}

export default function PayrollCenterTab({ clientId }: PayrollCenterTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'runs'>('employees');
  const [employees, setEmployees] = useState<any[]>([]);
  const [payRuns, setPayRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Employee Form
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [empForm, setEmpForm] = useState({ first_name: '', last_name: '', sin: '', pay_rate: '', pay_frequency: 'monthly' });

  // Run Payroll Form
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [runForm, setRunForm] = useState({ period_start: '', period_end: '', run_date: new Date().toISOString().split('T')[0] });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    setLoading(true);
    // Setting rich dummy data
    setEmployees([
      { id: 1, first_name: 'John', last_name: 'Doe', sin: '123-456-789', pay_rate: 65000, pay_frequency: 'semi-monthly', status: 'Active' },
      { id: 2, first_name: 'Jane', last_name: 'Smith', sin: '987-654-321', pay_rate: 35, pay_frequency: 'bi-weekly', status: 'Active' },
      { id: 3, first_name: 'Michael', last_name: 'Johnson', sin: '456-789-123', pay_rate: 72000, pay_frequency: 'monthly', status: 'On Leave' },
      { id: 4, first_name: 'Emily', last_name: 'Davis', sin: '321-654-987', pay_rate: 42, pay_frequency: 'weekly', status: 'Active' }
    ]);
    
    setPayRuns([
      { id: 1, run_date: '2026-06-15', period_start: '2026-06-01', period_end: '2026-06-15', total_gross: 45000, total_net: 32500 },
      { id: 2, run_date: '2026-05-31', period_start: '2026-05-16', period_end: '2026-05-31', total_gross: 44500, total_net: 32100 },
      { id: 3, run_date: '2026-05-15', period_start: '2026-05-01', period_end: '2026-05-15', total_gross: 45000, total_net: 32500 }
    ]);
    setLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/clients/${clientId}/payroll/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empForm)
    });
    setShowAddEmployee(false);
    setEmpForm({ first_name: '', last_name: '', sin: '', pay_rate: '', pay_frequency: 'monthly' });
    loadData();
  };

  const handleRunPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    await fetch(`/api/clients/${clientId}/payroll/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runForm)
    });
    setRunning(false);
    setShowRunPayroll(false);
    loadData();
    setActiveSubTab('runs');
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading Payroll Center...</div>;

  return (
    <div style={{ background: 'white', color: '#1E293B', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0', color: '#0F172A' }}>
            <Calculator size={20} style={{ color: '#10B981' }} />
            Canadian Payroll Processing
          </h2>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>CRA-compliant pay runs, payslips, and automated GL integration.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => window.location.href = `/dashboard/services/payroll/${clientId}`} style={{ background: '#4F46E5', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Open Full Payroll Module <ArrowRight size={14} />
          </button>
          <button onClick={() => setShowAddEmployee(true)} style={{ background: 'white', border: '1px solid #E2E8F0', color: '#1E293B', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <Users size={14} /> Add Employee
          </button>
          <button onClick={() => setShowRunPayroll(true)} style={{ background: '#10B981', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlayCircle size={14} /> Run Payroll
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
        <button onClick={() => setActiveSubTab('employees')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeSubTab === 'employees' ? '2px solid #10B981' : '2px solid transparent', color: activeSubTab === 'employees' ? '#10B981' : '#64748B', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Employees ({employees.length})</button>
        <button onClick={() => setActiveSubTab('runs')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeSubTab === 'runs' ? '2px solid #10B981' : '2px solid transparent', color: activeSubTab === 'runs' ? '#10B981' : '#64748B', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Payroll Runs ({payRuns.length})</button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeSubTab === 'employees' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Name</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>SIN</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Pay Rate</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Frequency</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? <tr><td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: '#64748B' }}>No employees added yet.</td></tr> : null}
              {employees.map(e => (
                <tr key={e.id}>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', fontWeight: 500 }}>{e.first_name} {e.last_name}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontFamily: 'monospace' }}>{e.sin}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>{formatCurrency(e.pay_rate)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', textTransform: 'capitalize' }}>{e.pay_frequency}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}><span style={{ background: '#F0FDF4', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeSubTab === 'runs' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Run Date</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Period</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Gross Pay</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Deductions (CPP, EI, Tax)</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>Net Pay</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>GL Sync</th>
              </tr>
            </thead>
            <tbody>
              {payRuns.length === 0 ? <tr><td colSpan={6} style={{ padding: '24px 0', textAlign: 'center', color: '#64748B' }}>No payrolls run yet.</td></tr> : null}
              {payRuns.map(r => (
                <tr key={r.id}>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', fontWeight: 500 }}>{r.run_date}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>{r.period_start} to {r.period_end}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', color: '#10B981' }}>{formatCurrency(r.total_gross)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', color: '#EF4444' }}>-{formatCurrency(r.total_gross - r.total_net)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', fontWeight: 600 }}>{formatCurrency(r.total_net)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>
                    <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Add Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', color: '#4B5563', marginBottom: '4px', fontWeight: 500 }}>First Name</label><input required value={empForm.first_name} onChange={e => setEmpForm({...empForm, first_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '6px', outline: 'none' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', color: '#4B5563', marginBottom: '4px', fontWeight: 500 }}>Last Name</label><input required value={empForm.last_name} onChange={e => setEmpForm({...empForm, last_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '6px', outline: 'none' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', color: '#4B5563', marginBottom: '4px', fontWeight: 500 }}>SIN (Canadian Social Insurance)</label><input required value={empForm.sin} onChange={e => setEmpForm({...empForm, sin: e.target.value})} placeholder="XXX-XXX-XXX" style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '6px', outline: 'none' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', color: '#4B5563', marginBottom: '4px', fontWeight: 500 }}>Annual Salary (CAD)</label><input required type="number" value={empForm.pay_rate} onChange={e => setEmpForm({...empForm, pay_rate: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '6px', outline: 'none' }} /></div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddEmployee(false)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#10B981', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Run Payroll Modal */}
      {showRunPayroll && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Process Payroll Run</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>Running payroll will calculate CRA deductions for all active employees and post journal entries to the ledger automatically.</p>
            <form onSubmit={handleRunPayroll}>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', color: '#4B5563', marginBottom: '4px', fontWeight: 500 }}>Period Start</label><input required type="date" value={runForm.period_start} onChange={e => setRunForm({...runForm, period_start: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '6px', outline: 'none' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', color: '#4B5563', marginBottom: '4px', fontWeight: 500 }}>Period End</label><input required type="date" value={runForm.period_end} onChange={e => setRunForm({...runForm, period_end: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '6px', outline: 'none' }} /></div>
              <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '13px', color: '#4B5563', marginBottom: '4px', fontWeight: 500 }}>Run Date (Payout)</label><input required type="date" value={runForm.run_date} onChange={e => setRunForm({...runForm, run_date: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '6px', outline: 'none' }} /></div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowRunPayroll(false)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={running} style={{ flex: 1, padding: '10px', background: '#10B981', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>{running ? 'Processing...' : 'Run Payroll'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
