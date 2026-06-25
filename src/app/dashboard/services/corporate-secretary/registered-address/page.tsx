'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, AlertTriangle, CheckCircle2, ArrowLeft, Building, Download } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function RegisteredAddressPage() {
  const { selectedClient } = useCorporateSecretary();
  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: ''
  });

  React.useEffect(() => {
    if (selectedClient) {
      setFormData({
        street: selectedClient.address_line_1 || '',
        city: selectedClient.city || '',
        province: selectedClient.state_province || '',
        postalCode: selectedClient.postal_code || ''
      });
    }
  }, [selectedClient]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('sign');
  };

  const onSignComplete = () => {
    setView('complete');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={32} style={{ color: '#6366f1' }} />
          Change Registered Office Address
        </h1>
      </div>

      {/* Warnings */}
      <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#FEF2F2', border: '1px solid #F87171', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#991B1B', fontSize: '15px', fontWeight: 600 }}>Sole Proprietorships</h4>
            <p style={{ margin: 0, color: '#991B1B', fontSize: '14px', lineHeight: 1.5 }}>
              This platform cannot change addresses for sole proprietorships. You must contact the government directly: <a href="#" style={{ color: '#DC2626', textDecoration: 'underline' }}>Service Ontario</a>, <a href="#" style={{ color: '#DC2626', textDecoration: 'underline' }}>Registry Agent (AB)</a>, or <a href="#" style={{ color: '#DC2626', textDecoration: 'underline' }}>BC Registries</a>.
            </p>
          </div>
        </div>

        <div style={{ background: '#FFF7ED', border: '1px solid #FDBA74', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle style={{ color: '#EA580C', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#9A3412', fontSize: '15px', fontWeight: 600 }}>Quebec Corporations</h4>
            <p style={{ margin: 0, color: '#9A3412', fontSize: '14px', lineHeight: 1.5 }}>
              This service cannot be filed automatically for Quebec corporations. Please contact the <strong>Registraire des entreprises</strong> directly.
            </p>
          </div>
        </div>
      </div>

      {view === 'form' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} style={{ color: '#64748B' }} /> Current Registered Address
            </h2>
          </div>
          
          <form onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Street Address</label>
              <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>City</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Province</label>
                <select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                  <option value="Ontario">Ontario</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Alberta">Alberta</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Postal Code</label>
              <input required type="text" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} style={{ width: '50%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
                Save Changes & Proceed to Sign
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button onClick={() => setView('form')} style={{ background: 'none', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 500, fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to edit address
          </button>

          <div style={{ marginBottom: '24px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0F172A' }}>Review & Sign Documents</h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Review and sign the relevant document for your jurisdiction to authorize this address change.</p>
          </div>
          
          <ESignaturePanel 
            documentName="Director Resolution approving change of address"
            onSignComplete={onSignComplete}
          />
        </div>
      )}

      {view === 'complete' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '40px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Address Change Initiated</h2>
          <p style={{ margin: '0 auto 24px auto', color: '#475569', fontSize: '15px', maxWidth: '400px', lineHeight: 1.5 }}>
            Your signature has been recorded. All other directors will receive an email from the platform to sign the resolution.
          </p>
          
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', maxWidth: '500px', margin: '0 auto 32px auto', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', textTransform: 'uppercase', fontWeight: 600 }}>Next Steps</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', display: 'grid', gap: '8px' }}>
              <li>Email notifications sent to remaining directors.</li>
              <li>Once all signatures are collected, the <strong>Change of Registered Office filing</strong> will be automatically submitted to the government.</li>
              <li>All completed documents will be securely stored in your Minute Book.</li>
            </ul>
          </div>

          <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
            Return to Corporate Secretary
          </Link>
        </div>
      )}

    </div>
  );
}
