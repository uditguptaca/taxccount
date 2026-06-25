'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, AlertTriangle, ArrowLeft, CheckSquare, Square, FileText } from 'lucide-react';

export default function ShareRestrictionsPage() {
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
    
    // In a real app, this would save to the Minute Book compliance log
    console.log("Compliance confirmation saved:", formData);
    
    router.push(destination);
  };

  const toggleCheck = (key: keyof typeof checkedDocs) => {
    setCheckedDocs({ ...checkedDocs, [key]: !checkedDocs[key] });
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={32} style={{ color: '#6366f1' }} />
          Share Restrictions Review
        </h1>
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
        <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>
          When issuing or transferring shares after incorporation, you must review existing corporate documents to ensure no shareholder has a prior right to purchase shares you are issuing or transferring.
        </p>
        
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <AlertTriangle size={18} style={{ color: '#DC2626' }} />
          <span style={{ color: '#991B1B', fontSize: '14px', fontWeight: 500 }}>
            If you issue or transfer shares not in accordance with existing documents, the transaction may become null and void.
          </span>
        </div>

        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0F172A' }}>Documents to Review</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { key: 'articles', label: 'Articles of Incorporation' },
            { key: 'bylaws', label: 'Bylaws' },
            { key: 'shareholder', label: 'Shareholder Agreement (if exists)' }
          ].map(doc => (
            <div 
              key={doc.key} 
              onClick={() => toggleCheck(doc.key as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: checkedDocs[doc.key as keyof typeof checkedDocs] ? '1px solid #6366f1' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {checkedDocs[doc.key as keyof typeof checkedDocs] ? <CheckSquare size={20} style={{ color: '#6366f1' }} /> : <Square size={20} style={{ color: '#94A3B8' }} />}
              <FileText size={18} style={{ color: '#64748B' }} />
              <span style={{ fontSize: '15px', fontWeight: 500, color: '#334155' }}>{doc.label}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#64748B' }}>
          <strong>Note:</strong> Provisions in your Shareholder Agreement override any restrictions in your Bylaws or Articles.
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Review & Confirm</h2>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input type="radio" checked={formData.confirmed} onChange={() => setFormData({...formData, confirmed: true})} style={{ marginTop: '4px', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '15px', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
                I have reviewed all relevant corporate documents and confirm the proposed share issuance or transfer is permitted.
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>What type of restriction applies?</label>
            <select value={formData.restrictionType} onChange={e => setFormData({...formData, restrictionType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
              <option>Pre-emptive rights</option>
              <option>Right of first refusal</option>
              <option>Transfer approval required</option>
              <option>None</option>
              <option>Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Notes (Stored in compliance log)</label>
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', resize: 'vertical' }} placeholder="Add details about board approvals, waivers obtained, etc..."></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <button onClick={(e) => handleFormSubmit(e, '/dashboard/services/corporate-secretary/share-transfers')} style={{ padding: '12px 20px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Confirm & Proceed to Transfer
            </button>
            <button onClick={(e) => handleFormSubmit(e, '/dashboard/services/corporate-secretary')} style={{ padding: '12px 20px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
              Confirm & Proceed to Issuance
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
