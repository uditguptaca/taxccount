'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, AlertCircle, RefreshCw, 
  HelpCircle, DollarSign, Users, ShieldAlert, Calendar, CheckSquare, 
  Square, Info, AlertTriangle, ArrowRight, Printer, FileText, Undo2
} from 'lucide-react';
import { format } from 'date-fns';

function parseLocalDate(dateStr: string | null | undefined) {
  if (!dateStr) return new Date();
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return new Date(datePart + 'T00:00:00');
}

interface Payslip {
  id: string;
  person_id: string;
  first_name: string;
  last_name: string;
  person_type: string;
  pay_type: string;
  pay_rate: number;
  person_standard_hours: number;
  person_vacation_rate: number;
  person_vacation_pay_method: string;
  included: boolean;
  regular_hours: number;
  overtime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  other_income: number;
  other_deductions: number;
  gross_pay: number;
  vacation_pay: number;
  federal_tax: number;
  provincial_tax: number;
  cpp: number;
  cpp2: number;
  ei: number;
  total_deductions: number;
  net_pay: number;
  employer_cpp: number;
  employer_cpp2: number;
  employer_ei: number;
  total_employer_cost: number;
  payment_method: string;
  province_of_employment?: string;
}

interface PayRun {
  id: string;
  pay_group_id: string;
  pay_group_name: string;
  pay_group_frequency: string;
  run_type: string;
  status: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  processing_cutoff: string;
  direct_deposit: boolean;
  remit_taxes: boolean;
  rate_table_year: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  total_employer_cost: number;
  employee_count: number;
  contractor_count: number;
}

export default function PayRunWizard() {
  const router = useRouter();
  const params = useParams();
  const runId = params?.payRunId as string;
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();

  const [run, setRun] = useState<PayRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [expandedPayslip, setExpandedPayslip] = useState<string | null>(null);

  // Wizard state: 1 = Select Dates, 2 = Hours/Incomes, 3 = Taxes, 4 = Review/Approve, 5 = Confirmation
  const [step, setStep] = useState<number>(1);

  // Form states for Step 1
  const [payDate, setPayDate] = useState<string>('');
  const [directDeposit, setDirectDeposit] = useState<boolean>(true);
  const [remitTaxes, setRemitTaxes] = useState<boolean>(true);

  // Load run details
  const fetchRunDetails = useCallback(async () => {
    if (!clientId || !runId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/${clientId}/runs/${runId}`);
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setPayDate(data.run.pay_date.split('T')[0]);
        setDirectDeposit(!!data.run.direct_deposit);
        setRemitTaxes(!!data.run.remit_taxes);
        
        // Map status to step
        if (data.run.status === 'DRAFT') setStep(1);
        else if (data.run.status === 'HOURS_ENTERED') setStep(2);
        else if (data.run.status === 'CALCULATED') setStep(3);
        else if (data.run.status === 'APPROVED') setStep(4);
        else if (data.run.status === 'PAID') setStep(5);
        else if (data.run.status === 'REVERSED') {
          setStep(1);
        }
      }
      if (data.payslips) {
        setPayslips(data.payslips);
      }
    } catch (err) {
      console.error('Error loading run details:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId, runId]);

  useEffect(() => {
    fetchRunDetails();
  }, [fetchRunDetails]);

  // Form helpers for step 2 inputs
  const handlePayslipChange = (index: number, field: keyof Payslip, value: any) => {
    const updated = [...payslips];
    updated[index] = { ...updated[index], [field]: value } as Payslip;

    // Recalculate basic gross on the client side for instant UI feedback
    const slip = updated[index];
    if (field === 'regular_hours' || field === 'overtime_hours' || field === 'other_income' || field === 'vacation_pay' || field === 'included') {
      if (!slip.included) {
        slip.gross_pay = 0;
        slip.net_pay = 0;
      } else {
        const rate = slip.pay_rate || 0;
        let regPay = slip.regular_pay;
        let otPay = slip.overtime_pay;

        if (slip.pay_type === 'Salary') {
          // Salaried: keep regular pay flat, OT is calculated
          const freq = run?.pay_group_frequency || 'Bi-weekly';
          const P = freq === 'Weekly' ? 52 : freq === 'Bi-weekly' ? 26 : freq === 'Semi-monthly' ? 24 : 12;
          regPay = rate / P;
          const hourlyEquivalent = rate / ((slip.person_standard_hours || 40) * P);
          otPay = hourlyEquivalent * 1.5 * slip.overtime_hours;
        } else {
          // Hourly
          regPay = rate * slip.regular_hours;
          otPay = rate * 1.5 * slip.overtime_hours;
        }

        let vacPay = slip.vacation_pay;
        if (slip.person_vacation_pay_method === 'pay_each_period' && vacPay === 0) {
          vacPay = (regPay + otPay + slip.other_income) * ((slip.person_vacation_rate || 4) / 100);
        }

        slip.regular_pay = regPay;
        slip.overtime_pay = otPay;
        slip.vacation_pay = vacPay;
        slip.gross_pay = regPay + otPay + slip.other_income + vacPay;
        slip.net_pay = slip.gross_pay - slip.other_deductions;
      }
    }
    setPayslips(updated);
  };

  // Step 1: Save Dates
  const handleSaveStep1 = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/payroll/${clientId}/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pay_date: payDate, direct_deposit: directDeposit, remit_taxes: remitTaxes }),
      });
      if (res.ok) {
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Save Hours & Incomes, then trigger Calculations
  const handleSaveStep2 = async () => {
    setSaving(true);
    try {
      // 1. Save step 2 inputs
      const saveRes = await fetch(`/api/payroll/${clientId}/runs/${runId}/step2`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payslips }),
      });

      if (!saveRes.ok) throw new Error('Failed to save hours');

      // 2. Trigger calculations
      const calcRes = await fetch(`/api/payroll/${clientId}/runs/${runId}/calculate`, {
        method: 'POST',
      });

      if (calcRes.ok) {
        await fetchRunDetails();
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Step 3: Go to Review
  const handleNextStep3 = () => {
    setStep(4);
  };

  // Step 4: Approve Payroll (PAID)
  const handleApprovePayroll = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/payroll/${clientId}/runs/${runId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        setShowConfirmModal(false);
        await fetchRunDetails();
        setStep(5);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Step 5: Undo Payroll
  const handleUndoPayroll = async () => {
    if (!confirm('Are you sure you want to undo this payroll run? This will roll back all year-to-date balances and journal entries.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/payroll/${clientId}/runs/${runId}/reverse`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchRunDetails();
        setStep(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  function formatMoney(n: number) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
  }

  if (clientLoading || loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <RefreshCw size={32} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#64748B', fontSize: '16px' }}>Loading pay run wizard...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!run) return <div style={{ padding: '40px', color: '#EF4444', textAlign: 'center' }}>Error: Pay run not found.</div>;

  const totalGross = payslips.filter(p => p.included).reduce((s, p) => s + (p.gross_pay || 0), 0);
  const totalNet = payslips.filter(p => p.included).reduce((s, p) => s + (p.net_pay || 0), 0);
  const totalTax = payslips.filter(p => p.included).reduce((s, p) => s + (p.federal_tax || 0) + (p.provincial_tax || 0), 0);
  const totalCpp = payslips.filter(p => p.included).reduce((s, p) => s + (p.cpp || 0) + (p.cpp2 || 0), 0);
  const totalEi = payslips.filter(p => p.included).reduce((s, p) => s + (p.ei || 0), 0);
  const totalEmployerCpp = payslips.filter(p => p.included).reduce((s, p) => s + (p.employer_cpp || 0) + (p.employer_cpp2 || 0), 0);
  const totalEmployerEi = payslips.filter(p => p.included).reduce((s, p) => s + (p.employer_ei || 0), 0);
  const totalDeductions = totalTax + totalCpp + totalEi;
  const totalEmployerCost = totalEmployerCpp + totalEmployerEi;
  const totalRemittance = totalDeductions + totalEmployerCost;
  const totalDebit = totalNet + totalRemittance;

  const activePeriodStart = format(parseLocalDate(run.period_start), 'MMMM d, yyyy');
  const activePeriodEnd = format(parseLocalDate(run.period_end), 'MMMM d, yyyy');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Wizard Header / Back navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => router.push('/dashboard/services/payroll/overview')}
          style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Back to Overview
        </button>
        <div style={{ width: '1px', height: '20px', background: '#E2E8F0' }} />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {run.pay_group_name} Payroll Run
          </h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Period: {activePeriodStart} – {activePeriodEnd}
          </span>
        </div>
      </div>

      {/* STEP RAIL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {[
          { num: 1, label: 'Select dates' },
          { num: 2, label: 'Hours & incomes' },
          { num: 3, label: 'Taxes calculated' },
          { num: 4, label: 'Review & approve' },
        ].map((s, idx, arr) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '50%', 
                background: step > s.num ? '#10B981' : step === s.num ? '#3B82F6' : '#F1F5F9',
                color: step >= s.num ? 'white' : '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '14px'
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontSize: '14px', fontWeight: step === s.num ? 600 : 500, color: step === s.num ? '#0F172A' : '#64748B' }}>
                {s.label}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: step > s.num ? '#10B981' : '#E2E8F0', margin: '0 16px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: SELECT DATES */}
      {step === 1 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '24px' }}>Confirm Dates & Settings</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Pay Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                  <input 
                    type="date" 
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Payment Processing</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', marginBottom: '10px' }}>
                  <input type="checkbox" checked={directDeposit} onChange={e => setDirectDeposit(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  Enable Direct Deposit (automatic bank transfer)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={remitTaxes} onChange={e => setRemitTaxes(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  Automatically Remit Source Deductions (CRA tax, CPP, EI)
                </label>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', color: '#0369A1' }}>
                <Info size={20} style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Processing Cutoff Notice</span>
                  <span style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    To fund direct deposits by {run.pay_date ? format(parseLocalDate(run.pay_date), 'MMMM d') : 'the pay date'}, you must approve this pay run by 12:00 PM ET on {run.processing_cutoff ? format(new Date(run.processing_cutoff), 'MMMM d, yyyy') : 'two business days prior'}.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <button 
              onClick={handleSaveStep1}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Next: Hours & incomes <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: HOURS & INCOMES */}
      {step === 2 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Hours and Incomes</h3>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Enter work hours, overtime, and other additions or deductions for this pay period.</p>

          <div style={{ overflowX: 'auto', marginBottom: '32px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', width: '40px' }}>
                    <input type="checkbox" checked={payslips.every(p => p.included)} onChange={e => {
                      const checked = e.target.checked;
                      setPayslips(payslips.map(p => ({ ...p, included: checked })));
                    }} />
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Person</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Rate</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center', width: '100px' }}>Regular Hours</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center', width: '100px' }}>OT Hours</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right', width: '120px' }}>Other Income</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right', width: '120px' }}>Deductions</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Gross Pay</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((slip, idx) => (
                  <tr key={slip.id} style={{ borderBottom: '1px solid #F1F5F9', background: slip.included ? 'transparent' : '#F8FAFC' }}>
                    <td style={{ padding: '16px' }}>
                      <input 
                        type="checkbox" 
                        checked={slip.included} 
                        onChange={e => handlePayslipChange(idx, 'included', e.target.checked)} 
                      />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{slip.first_name} {slip.last_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{slip.province_of_employment}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>
                      {slip.pay_type} ({slip.person_type})
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>
                      {slip.pay_type === 'Salary' ? `${formatMoney(slip.pay_rate)}/yr` : `${formatMoney(slip.pay_rate)}/hr`}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        value={slip.regular_hours}
                        disabled={!slip.included || slip.pay_type === 'Salary'}
                        onChange={e => handlePayslipChange(idx, 'regular_hours', parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        value={slip.overtime_hours}
                        disabled={!slip.included}
                        onChange={e => handlePayslipChange(idx, 'overtime_hours', parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <input 
                        type="number" 
                        value={slip.other_income}
                        disabled={!slip.included}
                        onChange={e => handlePayslipChange(idx, 'other_income', parseFloat(e.target.value) || 0)}
                        style={{ width: '100px', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', textAlign: 'right', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <input 
                        type="number" 
                        value={slip.other_deductions}
                        disabled={!slip.included}
                        onChange={e => handlePayslipChange(idx, 'other_deductions', parseFloat(e.target.value) || 0)}
                        style={{ width: '100px', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', textAlign: 'right', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>
                      {formatMoney(slip.gross_pay || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <button 
              onClick={() => setStep(1)}
              style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
            >
              Back
            </button>
            <button 
              onClick={handleSaveStep2}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              {saving ? 'Calculating Deductions...' : 'Next: Calculate taxes'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TAXES */}
      {step === 3 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Taxes and Source Deductions</h3>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Deductions auto-calculated by the Canadian Payroll calculation engine.</p>

          <div style={{ overflowX: 'auto', marginBottom: '32px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Person</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Gross Pay</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Fed Tax</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Prov Tax</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>CPP/CPP2</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>EI</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Total Ded.</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Net Pay</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {payslips.filter(p => p.included).map((slip) => (
                  <React.Fragment key={slip.id}>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{slip.first_name} {slip.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{slip.province_of_employment}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: '#0F172A', textAlign: 'right' }}>{formatMoney(slip.gross_pay || 0)}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>{formatMoney(slip.federal_tax || 0)}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>{formatMoney(slip.provincial_tax || 0)}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>{formatMoney((slip.cpp || 0) + (slip.cpp2 || 0))}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>{formatMoney(slip.ei || 0)}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#B91C1C', fontWeight: 500, textAlign: 'right' }}>{formatMoney(slip.total_deductions || 0)}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#16A34A', textAlign: 'right' }}>{formatMoney(slip.net_pay || 0)}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setExpandedPayslip(expandedPayslip === slip.id ? null : slip.id)}
                          style={{ background: 'transparent', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {expandedPayslip === slip.id ? 'Hide' : 'More'}
                        </button>
                      </td>
                    </tr>
                    {expandedPayslip === slip.id && (
                      <tr style={{ background: '#F8FAFC' }}>
                        <td colSpan={9} style={{ padding: '24px 40px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', fontSize: '13px' }}>
                            <div>
                              <h4 style={{ fontWeight: 600, marginBottom: '8px', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Earnings Details</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Regular Pay:</span><span>{formatMoney(slip.regular_pay || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Overtime Pay:</span><span>{formatMoney(slip.overtime_pay || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Other Income:</span><span>{formatMoney(slip.other_income || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Vacation Pay:</span><span>{formatMoney(slip.vacation_pay || 0)}</span></div>
                            </div>
                            <div>
                              <h4 style={{ fontWeight: 600, marginBottom: '8px', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Employee Deductions</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Federal Income Tax:</span><span>{formatMoney(slip.federal_tax || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Provincial Income Tax:</span><span>{formatMoney(slip.provincial_tax || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>CPP Contribution:</span><span>{formatMoney(slip.cpp || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>CPP2 Contribution:</span><span>{formatMoney(slip.cpp2 || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>EI Premium:</span><span>{formatMoney(slip.ei || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontWeight: 600 }}><span>Other Deductions:</span><span>{formatMoney(slip.other_deductions || 0)}</span></div>
                            </div>
                            <div>
                              <h4 style={{ fontWeight: 600, marginBottom: '8px', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>Employer Contributions</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Employer CPP (1x):</span><span>{formatMoney(slip.employer_cpp || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Employer CPP2 (1x):</span><span>{formatMoney(slip.employer_cpp2 || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span>Employer EI (1.4x):</span><span>{formatMoney(slip.employer_ei || 0)}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', borderTop: '1px dashed #CBD5E1', paddingTop: '4px', fontWeight: 600 }}>
                                <span>Total Employer Cost:</span>
                                <span>{formatMoney(slip.total_employer_cost || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <button 
              onClick={() => setStep(2)}
              style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
            >
              Back
            </button>
            <button 
              onClick={handleNextStep3}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Next: Review & approve <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & APPROVE */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Review and Approve Payroll</h3>
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Please double check the totals and payment summary before approving.</p>

            {/* Total cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', background: '#F8FAFC' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Total Gross Pay</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{formatMoney(totalGross)}</span>
              </div>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', background: '#F8FAFC' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Employee Deductions</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#991B1B' }}>-{formatMoney(totalDeductions)}</span>
              </div>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', background: '#F8FAFC' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Net Pay Payout</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#166534' }}>{formatMoney(totalNet)}</span>
              </div>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', background: '#F8FAFC' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Employer Cost</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{formatMoney(totalEmployerCost)}</span>
              </div>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', background: '#F8FAFC' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Total Debit</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A8A' }}>{formatMoney(totalDebit)}</span>
              </div>
            </div>

            {/* Debit Info Alert */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', padding: '20px', display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <AlertTriangle size={24} style={{ color: '#D97706', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', display: 'block', marginBottom: '4px' }}>Funding debit scheduled</span>
                <span style={{ fontSize: '13px', color: '#B45309', lineHeight: '1.5' }}>
                  Upon approval, we will debit the company account for the total funding of <strong>{formatMoney(totalDebit)}</strong> (Net Pay of {formatMoney(totalNet)} + Source Deductions of {formatMoney(totalRemittance)}) on <strong>{run.pay_date ? format(parseLocalDate(run.pay_date), 'EEEE, MMMM d, yyyy') : 'the pay date' }</strong>.
                </span>
              </div>
            </div>

            {/* Source deductions breakdown */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Source Deductions Summary (CRA Remittance)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Federal & Provincial Income Tax</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(totalTax)}</span>
                </div>
                <div>
                  <span style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>CPP/CPP2 (Employee + Employer)</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(totalCpp + totalEmployerCpp)}</span>
                </div>
                <div>
                  <span style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>EI (Employee + Employer)</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(totalEi + totalEmployerEi)}</span>
                </div>
                <div style={{ borderLeft: '1px dashed #CBD5E1', paddingLeft: '24px' }}>
                  <span style={{ color: '#1E3A8A', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Total Remittance Amount</span>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#1E3A8A' }}>{formatMoney(totalRemittance)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
              <button 
                onClick={() => setStep(3)}
                style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
              >
                Back
              </button>
              <button 
                onClick={() => setShowConfirmModal(true)}
                style={{ background: '#10B981', color: 'white', padding: '12px 32px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Approve and Submit Payroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION */}
      {step === 5 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} style={{ color: '#10B981' }} />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>You're all set!</h3>
          <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            Payroll has been approved and submitted successfully. We have scheduled the automated funding transfer.
          </p>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', background: '#F8FAFC', textAlign: 'left', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#475569' }}>Total Gross Payroll</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(totalGross)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#475569' }}>Net Employee Payout (via Direct Deposit)</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(totalNet)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#475569' }}>CRA Source Deductions (CPP, EI, Tax)</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(totalRemittance)}</span>
            </div>
            <div style={{ height: '1px', background: '#E2E8F0', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#1E3A8A' }}>
              <span>Total Funding Debit</span>
              <span>{formatMoney(totalDebit)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button 
              onClick={() => router.push('/dashboard/services/payroll/overview')}
              style={{ background: '#3B82F6', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Return to Overview
            </button>
            <button 
              onClick={handleUndoPayroll}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Undo2 size={16} /> Undo/Reverse Payroll
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Approve Payroll?</h4>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
              By approving, you authorize Taxccount to initiate a bank debit for <strong>{formatMoney(totalDebit)}</strong> and credit your employees on <strong>{run.pay_date ? format(parseLocalDate(run.pay_date), 'MMMM d, yyyy') : 'the pay date' }</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleApprovePayroll}
                disabled={saving}
                style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {saving ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
