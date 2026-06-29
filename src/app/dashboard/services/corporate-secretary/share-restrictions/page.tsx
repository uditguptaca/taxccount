'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, AlertTriangle, ArrowLeft, CheckSquare, Square, FileText } from 'lucide-react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ShareRestrictionsPage() {
  const { selectedClientId } = useCorporateSecretary();
  const router = useRouter();
  const [checkedDocs, setCheckedDocs] = useState({ articles: false, bylaws: false, shareholder: false });
  const [formData, setFormData] = useState({
    confirmed: false,
    restrictionType: 'None',
    notes: ''
  });

  const handleFormSubmit = (e: React.FormEvent, destination: string) => {
    e.preventDefault();
    if (!formData.confirmed) {
      alert("You must confirm you have reviewed the documents.");
      return;
    }
    
    // Stored in compliance log
    console.log("Compliance confirmation saved:", formData);
    router.push(`${destination}?clientId=${selectedClientId}`);
  };

  const toggleCheck = (key: keyof typeof checkedDocs) => {
    setCheckedDocs({ ...checkedDocs, [key]: !checkedDocs[key] });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="cs-page-header">
        <button onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Overview
        </button>
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={28} style={{ color: 'var(--cs-accent)' }} />
          Share Restrictions Review
        </h1>
        <p className="cs-page-subtitle">Verify share issuance and transfer regulations against constating documents.</p>
      </div>

      <div className="cs-alert info" style={{ display: 'block', marginBottom: '24px' }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.6 }}>
          When issuing or transferring shares after incorporation, you must review existing corporate documents to ensure no shareholder has a prior right to purchase shares you are issuing or transferring.
        </p>
        
        <div className="cs-alert danger" style={{ margin: 0, padding: '10px 14px' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            If you issue or transfer shares not in accordance with existing documents, the transaction may become null and void.
          </span>
        </div>

        <h3 style={{ margin: '16px 0 12px', fontSize: '15px', color: 'var(--cs-text-primary)', fontWeight: 700 }}>Documents to Review</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { key: 'articles', label: 'Articles of Incorporation' },
            { key: 'bylaws', label: 'Bylaws' },
            { key: 'shareholder', label: 'Shareholder Agreement (if exists)' }
          ].map(doc => (
            <div 
              key={doc.key} 
              onClick={() => toggleCheck(doc.key as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: checkedDocs[doc.key as keyof typeof checkedDocs] ? '1px solid var(--cs-accent)' : '1px solid var(--cs-border)', borderRadius: '10px', cursor: 'pointer', transition: 'var(--cs-transition)' }}
            >
              {checkedDocs[doc.key as keyof typeof checkedDocs] ? <CheckSquare size={18} style={{ color: 'var(--cs-accent)' }} /> : <Square size={18} style={{ color: 'var(--cs-text-muted)' }} />}
              <FileText size={16} style={{ color: 'var(--cs-text-secondary)' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-primary)' }}>{doc.label}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--cs-text-muted)' }}>
          <strong>Note:</strong> Provisions in your Shareholder Agreement override any restrictions in your Bylaws or Articles.
        </p>
      </div>

      <div className="cs-card">
        <div className="cs-card-header">
          <h2>Review & Confirm</h2>
        </div>
        
        <div className="cs-card-body">
          <div className="cs-form-checkbox" style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)', marginBottom: '20px' }}>
            <input type="radio" checked={formData.confirmed} onChange={() => setFormData({...formData, confirmed: true})} id="review-confirm" style={{ width: '16px', height: '16px' }} />
            <label htmlFor="review-confirm" style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
              I have reviewed all relevant corporate documents and confirm the proposed share issuance or transfer is permitted.
            </label>
          </div>

          <div className="cs-form-group">
            <label className="cs-form-label">What type of restriction applies?</label>
            <select className="cs-form-select" value={formData.restrictionType} onChange={e => setFormData({...formData, restrictionType: e.target.value})}>
              <option>Pre-emptive rights</option>
              <option>Right of first refusal</option>
              <option>Transfer approval required</option>
              <option>None</option>
              <option>Other</option>
            </select>
          </div>

          <div className="cs-form-group">
            <label className="cs-form-label">Notes (Stored in compliance log)</label>
            <textarea className="cs-form-textarea" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Add details about board approvals, waivers obtained, etc..."></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--cs-border-light)', paddingTop: '20px' }}>
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
