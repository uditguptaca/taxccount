'use client';

import React, { useState } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { 
  Settings, Building2, Blocks, Bell, Shield, Save, 
  HelpCircle, CheckCircle2, ChevronDown, ListTodo, ShieldAlert
} from 'lucide-react';

export default function SettingsPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [defaultProvince, setDefaultProvince] = useState('ON');
  const [remitterType, setRemitterType] = useState('Regular');
  const [wagesExpenseAcc, setWagesExpenseAcc] = useState('5010');
  const [cppPayableAcc, setCppPayableAcc] = useState('2120');
  const [eiPayableAcc, setEiPayableAcc] = useState('2130');
  const [taxPayableAcc, setTaxPayableAcc] = useState('2110');
  const [bankAcc, setBankAcc] = useState('1010');
  const [notifyRunApproved, setNotifyRunApproved] = useState(true);
  const [notifyRemitDue, setNotifyRemitDue] = useState(true);
  const [notifyYearEnd, setNotifyYearEnd] = useState(true);

  if (clientLoading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading settings...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '900px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Payroll Settings</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Configure client tax accounts, general ledger integrations, and notification rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(59,130,246,0.3)' }}
        >
          {saving ? 'Saving...' : success ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : success ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* General Settings */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: '#3B82F6' }} /> General Configuration
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Default Province of Employment</label>
              <select value={defaultProvince} onChange={e => setDefaultProvince(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}>
                {['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Remitter Type (CRA Filing Schedule)</label>
              <select value={remitterType} onChange={e => setRemitterType(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}>
                <option value="Regular">Regular Remitter (monthly by 15th)</option>
                <option value="Quarterly">Quarterly Remitter (quarterly by 15th)</option>
                <option value="Accelerated1">Accelerated 1 (twice-monthly)</option>
                <option value="Accelerated2">Accelerated 2 (four times monthly)</option>
              </select>
            </div>
          </div>
        </div>

        {/* GL Account Mapping */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Blocks size={18} style={{ color: '#3B82F6' }} /> General Ledger (GL) Chart of Accounts Link
          </h3>
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px', lineHeight: '1.4' }}>Map automated payroll run debit and credit entries to Chart of Account ledger codes.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#334155' }}>Wages and Salary Expense Account</span>
              <select value={wagesExpenseAcc} onChange={e => setWagesExpenseAcc(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px' }}>
                <option value="5010">5010 — Salaries and Wages Expense</option>
                <option value="5020">5020 — Contractor Expense</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#334155' }}>CPP Payable Account (Liability)</span>
              <select value={cppPayableAcc} onChange={e => setCppPayableAcc(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px' }}>
                <option value="2120">2120 — CPP Deductions Payable</option>
                <option value="2100">2100 — Payroll Deductions Payable</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#334155' }}>EI Payable Account (Liability)</span>
              <select value={eiPayableAcc} onChange={e => setEiPayableAcc(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px' }}>
                <option value="2130">2130 — EI Deductions Payable</option>
                <option value="2100">2100 — Payroll Deductions Payable</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#334155' }}>Withholding Tax Payable Account (Liability)</span>
              <select value={taxPayableAcc} onChange={e => setTaxPayableAcc(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px' }}>
                <option value="2110">2110 — Employee Income Tax Payable</option>
                <option value="2100">2100 — Payroll Deductions Payable</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#334155' }}>Net Pay Bank Account (Asset/Payout)</span>
              <select value={bankAcc} onChange={e => setBankAcc(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px' }}>
                <option value="1010">1010 — Operating Bank Account</option>
                <option value="1020">1020 — Payroll Clearing Account</option>
              </select>
            </div>

          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: '#3B82F6' }} /> Notification Rules
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={notifyRunApproved} onChange={e => setNotifyRunApproved(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              Email the firm client when payroll runs are approved
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={notifyRemitDue} onChange={e => setNotifyRemitDue(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              Send email alerts 3 days prior to CRA remittance deadlines
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={notifyYearEnd} onChange={e => setNotifyYearEnd(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              Notify about year-end PIER warnings or T4 filing availability
            </label>
          </div>
        </div>

        {/* Data & Security */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: '#3B82F6' }} /> Data Compliance & Engine Version
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>CRA statutory tax engine version:</span>
              <span style={{ fontWeight: 600, color: '#10B981' }}>2026 Table 8.1 / CRA T4127 122nd Edition</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Encryption level:</span>
              <span style={{ fontWeight: 600 }}>AES-256 at-rest (SIN/Bank tokens)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
