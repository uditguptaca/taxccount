'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, AlertTriangle, ArrowLeft, CheckSquare, Square, X } from 'lucide-react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function PrivateIssuerExemptionPage() {
  const { selectedClientId } = useCorporateSecretary();
  const router = useRouter();
  const [criteria, setCriteria] = useState({ under50: false, transferRestrictions: false });
  const [recipients, setRecipients] = useState([{ name: '', category: '', accreditedBasis: '', confirmed: false }]);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { name: '', category: '', accreditedBasis: '', confirmed: false }]);
  };

  const handleUpdateRecipient = (index: number, field: string, value: any) => {
    const newArr = [...recipients];
    newArr[index] = { ...newArr[index], [field]: value };
    setRecipients(newArr);
  };

  const handleRemoveRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const handleFormSubmit = (e: React.FormEvent, destination: string) => {
    e.preventDefault();
    if (!criteria.under50 || !criteria.transferRestrictions) {
      alert("You must meet the basic eligibility criteria to use this exemption.");
      return;
    }
    const allConfirmed = recipients.every(r => r.confirmed && r.name && r.category);
    if (!allConfirmed) {
      alert("Please confirm eligibility for all recipients.");
      return;
    }
    
    // In a real app, record stored in Minute Book
    console.log("Private Issuer confirmation saved.");
    router.push(`${destination}?clientId=${selectedClientId}`);
  };

  const eligibleCategories = [
    "A director, officer, employee, or control person of the corporation",
    "A spouse, parent, grandparent, brother, sister, or child of a director, senior officer, or control person",
    "A close personal friend of a director, senior officer, or control person",
    "A close business associate of a director, senior officer, or control person",
    "An Accredited Investor (high net-worth individual as defined in NI 45-106)"
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="cs-page-header">
        <button onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Overview
        </button>
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Lock size={28} style={{ color: 'var(--cs-accent)' }} />
          Private Issuer Exemption
        </h1>
        <p className="cs-page-subtitle">Verify securities law prospectus exemption eligibility profiles.</p>
      </div>

      <div className="cs-alert info" style={{ display: 'block', marginBottom: '24px' }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.6 }}>
          Any company offering shares to shareholders is normally required to register with a securities regulator and provide a prospectus. The <strong>Private Issuer Exemption</strong> is the most common exception for small, closely-held companies.
        </p>
        
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--cs-text-primary)', fontWeight: 700 }}>Step 1: Corporation Eligibility Criteria</h3>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          <div onClick={() => setCriteria({...criteria, under50: !criteria.under50})} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: criteria.under50 ? '1px solid var(--cs-accent)' : '1px solid var(--cs-border)', borderRadius: '10px', cursor: 'pointer', transition: 'var(--cs-transition)' }}>
            {criteria.under50 ? <CheckSquare size={18} style={{ color: 'var(--cs-accent)' }} /> : <Square size={18} style={{ color: 'var(--cs-text-muted)' }} />}
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-primary)' }}>Fewer than 50 shareholders (including other security holders)</span>
          </div>
          <div onClick={() => setCriteria({...criteria, transferRestrictions: !criteria.transferRestrictions})} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: criteria.transferRestrictions ? '1px solid var(--cs-accent)' : '1px solid var(--cs-border)', borderRadius: '10px', cursor: 'pointer', transition: 'var(--cs-transition)' }}>
            {criteria.transferRestrictions ? <CheckSquare size={18} style={{ color: 'var(--cs-accent)' }} /> : <Square size={18} style={{ color: 'var(--cs-text-muted)' }} />}
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-primary)' }}>Restrictions on transfer of shares exist in your Articles of Incorporation</span>
          </div>
        </div>

        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--cs-text-primary)', fontWeight: 700 }}>Eligible Recipients under Exemption</h3>
        <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', fontSize: '13px', lineHeight: 1.6, display: 'grid', gap: '8px' }}>
          {eligibleCategories.map((c, i) => <li key={i}>{c}</li>)}
        </ul>

        <div className="cs-alert danger" style={{ margin: 0, padding: '14px 18px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--cs-red)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 700 }}>WARNING: Your Responsibility</h4>
            <span style={{ fontSize: '12px', lineHeight: 1.5 }}>
              It is your responsibility to confirm that the individual receiving shares is eligible. Companies that improperly offer shares can face serious penalties under securities laws.
            </span>
          </div>
        </div>
      </div>

      <div className="cs-card">
        <div className="cs-card-header">
          <h2>Step 2: Recipient Confirmation</h2>
        </div>
        
        <div className="cs-card-body">
          {recipients.map((rec, index) => (
            <div key={index} style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--cs-border-light)', borderRadius: '12px', background: 'var(--cs-surface-hover)', position: 'relative' }}>
              <div className="cs-form-row" style={{ marginBottom: '16px' }}>
                <div className="cs-form-group">
                  <label className="cs-form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Recipient Name</label>
                  <input type="text" className="cs-form-input" value={rec.name} onChange={e => handleUpdateRecipient(index, 'name', e.target.value)} placeholder="Full Legal Name" />
                </div>
                <div className="cs-form-group">
                  <label className="cs-form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Eligibility Category</label>
                  <select className="cs-form-select" value={rec.category} onChange={e => handleUpdateRecipient(index, 'category', e.target.value)}>
                    <option value="">Select category...</option>
                    {eligibleCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              {rec.category.includes('Accredited Investor') && (
                <div className="cs-form-group" style={{ marginBottom: '16px' }}>
                  <label className="cs-form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Basis for Accredited Status</label>
                  <input type="text" className="cs-form-input" value={rec.accreditedBasis} onChange={e => handleUpdateRecipient(index, 'accreditedBasis', e.target.value)} placeholder="e.g., Net income > $200k, Net assets > $5M" />
                </div>
              )}

              <div className="cs-form-checkbox" style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--cs-border)' }}>
                <input type="checkbox" checked={rec.confirmed} onChange={e => handleUpdateRecipient(index, 'confirmed', e.target.checked)} id={`recipient-confirm-${index}`} style={{ width: '16px', height: '16px' }} />
                <label htmlFor={`recipient-confirm-${index}`} style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                  I confirm this individual is eligible to receive shares under the Private Issuer Exemption.
                </label>
              </div>

              {recipients.length > 1 && (
                <button 
                  onClick={() => handleRemoveRecipient(index)} 
                  className="cs-btn cs-btn-ghost cs-btn-sm" 
                  style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--cs-red)', padding: '4px 8px' }}
                >
                  <X size={14} /> Remove
                </button>
              )}
            </div>
          ))}

          <button onClick={handleAddRecipient} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '24px', fontWeight: 700 }}>+ Add Another Recipient</button>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--cs-border-light)', paddingTop: '24px' }}>
            <button className="cs-btn cs-btn-secondary" onClick={(e) => handleFormSubmit(e, '/dashboard/services/corporate-secretary/share-transfers')}>
              Confirm & Proceed to Transfer
            </button>
            <button className="cs-btn cs-btn-primary" onClick={(e) => handleFormSubmit(e, '/dashboard/services/corporate-secretary')}>
              Confirm & Proceed to Issuance
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
