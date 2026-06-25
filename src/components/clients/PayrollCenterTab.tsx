import React, { useEffect, useState } from 'react';
import { Users, Banknote, FileText, Plus, Calculator, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
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
    try {
      const [empRes, runRes] = await Promise.all([
        fetch(`/api/clients/${clientId}/payroll/employees`),
        fetch(`/api/clients/${clientId}/payroll/runs`)
      ]);
      if (empRes.ok) setEmployees((await empRes.json()).employees || []);
      if (runRes.ok) setPayRuns((await runRes.json()).runs || []);
    } catch (e) {
      console.error(e);
    }
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
    <div style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #1E293B' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <Calculator size={20} style={{ color: '#10B981' }} />
            Canadian Payroll Processing
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>CRA-compliant pay runs, payslips, and automated GL integration.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowAddEmployee(true)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> Add Employee
          </button>
          <button onClick={() => setShowRunPayroll(true)} style={{ background: '#10B981', border: 'none', color: '#022C22', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlayCircle size={14} /> Run Payroll
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1E293B', background: '#0B1120' }}>
        <button onClick={() => setActiveSubTab('employees')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeSubTab === 'employees' ? '2px solid #10B981' : '2px solid transparent', color: activeSubTab === 'employees' ? '#10B981' : '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Employees ({employees.length})</button>
        <button onClick={() => setActiveSubTab('runs')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeSubTab === 'runs' ? '2px solid #10B981' : '2px solid transparent', color: activeSubTab === 'runs' ? '#10B981' : '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Payroll Runs ({payRuns.length})</button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeSubTab === 'employees' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Name</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>SIN</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Pay Rate</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Frequency</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? <tr><td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: '#64748B' }}>No employees added yet.</td></tr> : null}
              {employees.map(e => (
                <tr key={e.id}>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', fontWeight: 500 }}>{e.first_name} {e.last_name}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', color: '#94A3B8', fontFamily: 'monospace' }}>{e.sin}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B' }}>{formatCurrency(e.pay_rate)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', textTransform: 'capitalize' }}>{e.pay_frequency}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B' }}><span style={{ background: '#022C22', color: '#34D399', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeSubTab === 'runs' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Run Date</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Period</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Gross Pay</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Deductions (CPP, EI, Tax)</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>Net Pay</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid #1E293B', textAlign: 'right' }}>GL Sync</th>
              </tr>
            </thead>
            <tbody>
              {payRuns.length === 0 ? <tr><td colSpan={6} style={{ padding: '24px 0', textAlign: 'center', color: '#64748B' }}>No payrolls run yet.</td></tr> : null}
              {payRuns.map(r => (
                <tr key={r.id}>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', fontWeight: 500 }}>{r.run_date}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>{r.period_start} to {r.period_end}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', color: '#10B981' }}>{formatCurrency(r.total_gross)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', color: '#EF4444' }}>-{formatCurrency(r.total_gross - r.total_net)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', fontWeight: 600 }}>{formatCurrency(r.total_net)}</td>
                  <td style={{ padding: '16px 0', borderBottom: '1px solid #1E293B', textAlign: 'right' }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1E293B', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Add Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>First Name</label><input required value={empForm.first_name} onChange={e => setEmpForm({...empForm, first_name: e.target.value})} style={{ width: '100%', padding: '8px', background: '#0F172A', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Last Name</label><input required value={empForm.last_name} onChange={e => setEmpForm({...empForm, last_name: e.target.value})} style={{ width: '100%', padding: '8px', background: '#0F172A', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>SIN (Canadian Social Insurance)</label><input required value={empForm.sin} onChange={e => setEmpForm({...empForm, sin: e.target.value})} placeholder="XXX-XXX-XXX" style={{ width: '100%', padding: '8px', background: '#0F172A', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Annual Salary (CAD)</label><input required type="number" value={empForm.pay_rate} onChange={e => setEmpForm({...empForm, pay_rate: e.target.value})} style={{ width: '100%', padding: '8px', background: '#0F172A', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} /></div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddEmployee(false)} style={{ flex: 1, padding: '10px', background: '#334155', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#10B981', border: 'none', color: '#022C22', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Run Payroll Modal */}
      {showRunPayroll && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1E293B', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Process Payroll Run</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '24px' }}>Running payroll will calculate CRA deductions for all active employees and post journal entries to the ledger automatically.</p>
            <form onSubmit={handleRunPayroll}>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Period Start</label><input required type="date" value={runForm.period_start} onChange={e => setRunForm({...runForm, period_start: e.target.value})} style={{ width: '100%', padding: '8px', background: '#0F172A', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Period End</label><input required type="date" value={runForm.period_end} onChange={e => setRunForm({...runForm, period_end: e.target.value})} style={{ width: '100%', padding: '8px', background: '#0F172A', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} /></div>
              <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Run Date (Payout)</label><input required type="date" value={runForm.run_date} onChange={e => setRunForm({...runForm, run_date: e.target.value})} style={{ width: '100%', padding: '8px', background: '#0F172A', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} /></div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowRunPayroll(false)} style={{ flex: 1, padding: '10px', background: '#334155', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={running} style={{ flex: 1, padding: '10px', background: '#10B981', border: 'none', color: '#022C22', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>{running ? 'Processing...' : 'Run Payroll'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
