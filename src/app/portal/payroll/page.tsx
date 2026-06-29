'use client';

import React, { useEffect, useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { 
  DollarSign, FileText, Users, Calendar, ArrowRight, Eye, 
  Download, Clock, AlertCircle, TrendingUp, CheckCircle, RefreshCw
} from 'lucide-react';

interface PayRun {
  id: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: string;
  total_gross: number;
  total_net: number;
  total_deductions: number;
  total_employer_cost: number;
  employee_count: number;
  pay_group_name?: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  pay_rate: number;
  pay_type: string;
  status: string;
}

export default function PortalPayrollPage() {
  const { data, loading } = usePortal();
  const [runs, setRuns] = useState<PayRun[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const clientId = data?.client?.id;

  const fetchPayrollData = async (cid: string) => {
    setIsLoading(true);
    try {
      // Fetch runs
      const runRes = await fetch(`/api/payroll/${cid}/runs`);
      if (runRes.ok) {
        const runData = await runRes.json();
        setRuns(runData.runs || []);
      }

      // Fetch employees
      const empRes = await fetch(`/api/payroll/${cid}/people`);
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.people || []);
      }
    } catch (e) {
      console.error('Error fetching portal payroll data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchPayrollData(clientId);
    }
  }, [clientId]);

  if (loading || isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-gray-500)', fontWeight: 500 }}>Syncing Client Payroll Vault...</p>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid var(--color-gray-200)' }}>
        <AlertCircle size={48} style={{ color: '#EF4444', marginBottom: '16px' }} />
        <h2>Unable to resolve client session</h2>
      </div>
    );
  }

  const completedRuns = runs.filter(r => r.status === 'PAID');
  const totalYtdGross = completedRuns.reduce((sum, r) => sum + (Number(r.total_gross) || 0), 0);
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE');

  function formatMoney(n: number) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
            Payroll Service Hub
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            View completed pay stubs, payroll schedules, remittances, and T4 slips managed by your advisory firm.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-gray-200)' }}>
        {[
          { key: 'overview', label: 'Payroll Overview', icon: <TrendingUp size={14} /> },
          { key: 'employees', label: 'My Employees', icon: <Users size={14} /> },
          { key: 'slips', label: 'T4 Tax Slips', icon: <FileText size={14} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', fontSize: '13px', fontWeight: 600,
              background: 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-gray-500)',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: '-1px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', background: 'white' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Active Employees</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '8px' }}>{activeEmployees.length}</div>
            </div>
            <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', background: 'white' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Processed Runs</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '8px' }}>{completedRuns.length}</div>
            </div>
            <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', background: 'white' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>YTD Gross Payroll</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '8px' }}>{formatMoney(totalYtdGross)}</div>
            </div>
            <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', background: 'white' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Next Pay Date</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginTop: '8px' }}>
                {runs.find(r => r.status === 'DRAFT')?.pay_date ? (
                  new Date(runs.find(r => r.status === 'DRAFT')!.pay_date + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
                ) : 'No pending runs'}
              </div>
            </div>
          </div>

          {/* Pay Run History Table */}
          <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-gray-200)', background: '#F9FAFB', fontWeight: 600, fontSize: '14px', color: '#374151' }}>
              Pay Run History
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'white', borderBottom: '1px solid var(--color-gray-200)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Pay Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Period Range</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-gray-500)', textAlign: 'center' }}>Staff Paid</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-gray-500)', textAlign: 'right' }}>Total Gross</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-gray-500)', textAlign: 'right' }}>Net Funding</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-gray-500)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {completedRuns.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                      No completed pay runs yet.
                    </td>
                  </tr>
                ) : (
                  completedRuns.map(run => (
                    <tr key={run.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>
                        {new Date(run.pay_date + 'T00:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#4B5563' }}>
                        {new Date(run.period_start + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} – {new Date(run.period_end + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#4B5563' }}>{run.employee_count}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 500, color: '#111827' }}>{formatMoney(run.total_gross)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#059669' }}>{formatMoney(run.total_net)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button style={{ background: 'transparent', border: '1px solid var(--color-gray-200)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Download size={12} /> Pay Register
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Employees Tab Content */}
      {activeTab === 'employees' && (
        <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--color-gray-200)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Position</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Compensation</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                    No employees seeded or registered.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{emp.first_name} {emp.last_name}</td>
                    <td style={{ padding: '14px 16px', color: '#4B5563' }}>{emp.email}</td>
                    <td style={{ padding: '14px 16px', color: '#4B5563' }}>{emp.job_title || 'Worker'}</td>
                    <td style={{ padding: '14px 16px', color: '#111827', fontWeight: 500 }}>
                      {formatMoney(emp.pay_rate)} {emp.pay_type === 'salary' ? '/ yr' : '/ hr'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                        background: emp.status === 'ACTIVE' ? '#ECFDF5' : '#F3F4F6',
                        color: emp.status === 'ACTIVE' ? '#065F46' : '#374151'
                      }}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tax Slips Tab Content */}
      {activeTab === 'slips' && (
        <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--color-gray-300)', borderRadius: '12px', background: '#F9FAFB' }}>
          <FileText size={48} style={{ color: '#9CA3AF', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Year-End Slips Filing Vault</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', maxWidth: '400px', margin: '0 auto 16px', lineHeight: '1.5' }}>
            Access generated employee T4 slips. T4 slips for the 2026 tax year are finalized by your accountant after calendar year-end closure.
          </p>
          <button disabled style={{ background: '#E5E7EB', color: '#9CA3AF', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'not-allowed' }}>
            No slips available
          </button>
        </div>
      )}

    </div>
  );
}
