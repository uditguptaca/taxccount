'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function RegisteredAddressPage() {
  const { selectedClient, selectedClientId } = useCorporateSecretary();
  const router = useRouter();
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="cs-page-header">
        <button onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Overview
        </button>
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={28} style={{ color: 'var(--cs-accent)' }} />
          Change Registered Office Address
        </h1>
        <p className="cs-page-subtitle">Update your official head office or mailing address with the corporate registry.</p>
      </div>

      {/* Warnings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div className="cs-alert danger">
          <AlertTriangle style={{ flexShrink: 0 }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Sole Proprietorships Notice</h4>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
              This platform cannot change addresses for sole proprietorships. You must contact the government registry directly.
            </p>
          </div>
        </div>

        <div className="cs-alert warning">
          <AlertTriangle style={{ flexShrink: 0 }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Quebec Corporations Notice</h4>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
              This service cannot be filed automatically for Quebec corporations. Please contact the <strong>Registraire des entreprises</strong> directly.
            </p>
          </div>
        </div>
      </div>

      {view === 'form' && (
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Current Registered Address</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="cs-form-group">
              <label className="cs-form-label">Street Address</label>
              <input required type="text" className="cs-form-input" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
            </div>
            
            <div className="cs-form-row">
              <div className="cs-form-group">
                <label className="cs-form-label">City</label>
                <input required type="text" className="cs-form-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label">Province</label>
                <select className="cs-form-select" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                  <option value="ON">Ontario</option>
                  <option value="BC">British Columbia</option>
                  <option value="AB">Alberta</option>
                  <option value="MB">Manitoba</option>
                  <option value="NS">Nova Scotia</option>
                </select>
              </div>
            </div>

            <div className="cs-form-group" style={{ maxWidth: '50%' }}>
              <label className="cs-form-label">Postal Code</label>
              <input required type="text" className="cs-form-input" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="cs-btn cs-btn-primary">
                Save Changes & Proceed to Sign
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('form')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', marginBottom: '16px', paddingLeft: 0 }}>
            <ArrowLeft size={14} /> Back to edit address
          </button>

          <div className="cs-alert info" style={{ marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700 }}>Review & Sign Documents</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>Review and sign the relevant document for your jurisdiction to authorize this address change.</p>
            </div>
          </div>
          
          <ESignaturePanel 
            documentName="Director Resolution approving change of address"
            onSignComplete={onSignComplete}
          />
        </div>
      )}

      {view === 'complete' && (
        <div className="cs-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--cs-emerald-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={28} style={{ color: 'var(--cs-emerald)' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Address Change Initiated</h2>
          <p style={{ margin: '0 auto 24px', color: 'var(--cs-text-secondary)', fontSize: '14px', maxWidth: '400px', lineHeight: 1.5 }}>
            Your signature has been recorded. All other directors will receive an email from the platform to sign the resolution.
          </p>
          
          <div style={{ background: 'var(--cs-surface-hover)', border: '1px solid var(--cs-border)', borderRadius: '12px', padding: '20px', maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--cs-text-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Next Steps</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--cs-text-secondary)', fontSize: '13px', display: 'grid', gap: '8px' }}>
              <li>Email notifications sent to remaining directors.</li>
              <li>Once all signatures are collected, the <strong>Change of Registered Office filing</strong> will be automatically submitted to the government.</li>
              <li>All completed documents will be securely stored in your Minute Book.</li>
            </ul>
          </div>

          <button 
            className="cs-btn cs-btn-secondary"
            onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)}
          >
            Return to Overview
          </button>
        </div>
      )}

    </div>
  );
}
