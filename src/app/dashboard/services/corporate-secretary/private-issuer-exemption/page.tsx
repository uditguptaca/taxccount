'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, AlertTriangle, ArrowLeft, CheckSquare, Square, Users, CheckCircle2 } from 'lucide-react';

export default function PrivateIssuerExemptionPage() {
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
    router.push(destination);
  };

  const eligibleCategories = [
    "A director, officer, employee, or control person of the corporation",
    "A spouse, parent, grandparent, brother, sister, or child of a director, senior officer, or control person",
    "A close personal friend of a director, senior officer, or control person",
    "A close business associate of a director, senior officer, or control person",
    "An Accredited Investor (high net-worth individual as defined in NI 45-106)"
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Lock size={32} style={{ color: '#6366f1' }} />
          Private Issuer Exemption
        </h1>
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
        <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>
          Any company offering shares to shareholders is normally required to register with a securities regulator and provide a prospectus. The <strong>Private Issuer Exemption</strong> is the most common exception for small, closely-held companies.
        </p>
        
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0F172A' }}>Step 1: Corporation Eligibility Criteria</h3>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          <div onClick={() => setCriteria({...criteria, under50: !criteria.under50})} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: criteria.under50 ? '1px solid #6366f1' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
            {criteria.under50 ? <CheckSquare size={20} style={{ color: '#6366f1' }} /> : <Square size={20} style={{ color: '#94A3B8' }} />}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>Fewer than 50 shareholders (including other security holders)</span>
          </div>
          <div onClick={() => setCriteria({...criteria, transferRestrictions: !criteria.transferRestrictions})} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: criteria.transferRestrictions ? '1px solid #6366f1' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
            {criteria.transferRestrictions ? <CheckSquare size={20} style={{ color: '#6366f1' }} /> : <Square size={20} style={{ color: '#94A3B8' }} />}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>Restrictions on transfer of shares exist in your Articles of Incorporation</span>
          </div>
        </div>

        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0F172A' }}>Eligible Recipients under Exemption</h3>
        <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: 1.6, display: 'grid', gap: '8px' }}>
          {eligibleCategories.map((c, i) => <li key={i}>{c}</li>)}
        </ul>

        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '16px 20px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#991B1B', fontSize: '14px', fontWeight: 600 }}>WARNING: Your Responsibility</h4>
            <span style={{ color: '#991B1B', fontSize: '13px', lineHeight: 1.5 }}>
              It is your responsibility to confirm that the individual receiving shares is eligible. Companies that improperly offer shares can face serious penalties under securities laws.
            </span>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Step 2: Recipient Confirmation</h2>
        </div>
        
        <div style={{ padding: '24px' }}>
          {recipients.map((rec, index) => (
            <div key={index} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Recipient Name</label>
                  <input type="text" value={rec.name} onChange={e => handleUpdateRecipient(index, 'name', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }} placeholder="Full Legal Name" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Eligibility Category</label>
                  <select value={rec.category} onChange={e => handleUpdateRecipient(index, 'category', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: 'white' }}>
                    <option value="">Select category...</option>
                    {eligibleCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              {rec.category.includes('Accredited Investor') && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Basis for Accredited Status</label>
                  <input type="text" value={rec.accreditedBasis} onChange={e => handleUpdateRecipient(index, 'accreditedBasis', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }} placeholder="e.g., Net income > $200k, Net assets > $5M" />
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <input type="checkbox" checked={rec.confirmed} onChange={e => handleUpdateRecipient(index, 'confirmed', e.target.checked)} style={{ marginTop: '4px', width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
                  I confirm this individual is eligible to receive shares under the Private Issuer Exemption.
                </span>
              </label>

              {recipients.length > 1 && (
                <button onClick={() => handleRemoveRecipient(index)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#DC2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
              )}
            </div>
          ))}

          <button onClick={handleAddRecipient} style={{ color: '#4F46E5', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', padding: 0, marginBottom: '24px' }}>+ Add Another Recipient</button>

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
