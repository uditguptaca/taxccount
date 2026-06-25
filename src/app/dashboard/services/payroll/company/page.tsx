'use client';

import React, { useState, useEffect } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Building2, Save, Building, FileText, Banknote, Landmark } from 'lucide-react';

export default function CompanySetupPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    legal_name: '',
    business_number: '',
    payroll_program_account: 'RP0001',
    default_province: 'ON',
    remitter_type: 'Regular',
    bank_account_tokenized: ''
  });

  useEffect(() => {
    if (!clientId) return;
    fetch(`/api/payroll/${clientId}/company`)
      .then(res => res.json())
      .then(data => {
        if (data.company) {
          setFormData({
            legal_name: data.company.legal_name || '',
            business_number: data.company.business_number || '',
            payroll_program_account: data.company.payroll_program_account || 'RP0001',
            default_province: data.company.default_province || 'ON',
            remitter_type: data.company.remitter_type || 'Regular',
            bank_account_tokenized: data.company.bank_account_tokenized || ''
          });
        } else {
          // prefill legal name from client data if company doesn't exist
          fetch(`/api/clients/${clientId}`)
            .then(res => res.json())
            .then(clientData => {
              if (clientData.client) {
                setFormData(prev => ({ ...prev, legal_name: clientData.client.display_name }));
              }
            });
        }
        setLoading(false);
      });
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch(`/api/payroll/${clientId}/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save company details');
      setMessage('Company details saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (clientLoading || loading) return <div style={{ padding: '40px', color: '#64748B' }}>Loading company settings...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Company Settings</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Configure the payer's legal and remittance details.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', 
            borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1
          }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: message.includes('success') ? '#D1FAE5' : '#FEE2E2', color: message.includes('success') ? '#065F46' : '#991B1B', borderRadius: '6px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {/* Business Details */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={18} style={{ color: '#64748B' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', margin: 0 }}>Business Details</h3>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Legal Name</label>
            <input 
              name="legal_name" value={formData.legal_name} onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Default Province of Employment</label>
            <select 
              name="default_province" value={formData.default_province} onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}
            >
              {['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CRA Accounts */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={18} style={{ color: '#64748B' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', margin: 0 }}>CRA Remittance Accounts</h3>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Business Number (BN9)</label>
              <input 
                name="business_number" value={formData.business_number} onChange={handleChange} placeholder="123456789"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Payroll Program Account</label>
              <input 
                name="payroll_program_account" value={formData.payroll_program_account} onChange={handleChange} placeholder="RP0001"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} 
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Remitter Type</label>
            <select 
              name="remitter_type" value={formData.remitter_type} onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}
            >
              <option value="Regular">Regular (Monthly by 15th)</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Accelerated 1">Threshold 1 (Accelerated)</option>
              <option value="Accelerated 2">Threshold 2 (Accelerated)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Landmark size={18} style={{ color: '#64748B' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', margin: 0 }}>Funding Bank Account</h3>
        </div>
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>This account will be debited to fund payroll and remittances.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Transit</label>
              <input type="password" placeholder="*****" style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Institution</label>
              <input type="password" placeholder="***" style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Account Number</label>
              <input type="password" placeholder="*******1234" style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '12px', fontStyle: 'italic' }}>* Bank details are tokenized and encrypted at rest.</p>
        </div>
      </div>
    </div>
  );
}
