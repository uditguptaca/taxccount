'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRightLeft, AlertCircle, CheckCircle2, ArrowLeft, Users, Briefcase, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ShareTransfersPage() {
  const { secretarialData, selectedClient } = useCorporateSecretary();
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  const [formData, setFormData] = useState({
    transferor: '',
    transferee: '',
    newTransfereeName: '',
    sharesToTransfer: '',
    shareClass: 'Common Class A',
    totalAmountPaid: '',
    closingDate: '',
    confirmedRestrictions: false
  });

  React.useEffect(() => {
    if (secretarialData?.shareholders) setShareholders(secretarialData.shareholders);
  }, [secretarialData]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmedRestrictions) {
      alert("You must confirm eligibility under the Private Issuer Exemption.");
      return;
    }
    setView('sign');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArrowRightLeft size={32} style={{ color: '#6366f1' }} />
          Share Transfers
        </h1>
      </div>

      <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '15px', fontWeight: 600 }}>Important Requirements</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400E', fontSize: '14px', lineHeight: 1.5 }}>
              <li>Review your Articles of Incorporation, Bylaws, and Shareholder Agreement before proceeding to ensure the transfer is permitted.</li>
              <li>There can be tax implications (capital gains/losses). We strongly recommend speaking with an accountant first.</li>
              <li>Shares can only be transferred to persons eligible under the <Link href="/dashboard/services/corporate-secretary/private-issuer-exemption" style={{ color: '#D97706', textDecoration: 'underline' }}>Private Issuer Exemption</Link>.</li>
            </ul>
          </div>
        </div>
      </div>

      {view === 'form' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Transfer Details</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'grid', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Transferor (Seller)</label>
                <select required value={formData.transferor} onChange={e => setFormData({...formData, transferor: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }}>
                <option value="">Select a shareholder...</option>
                {shareholders.map(s => <option key={s.id} value={s.id}>{s.name} ({s.shares} shares)</option>)}
              </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Transferee (Buyer)</label>
                <select required value={formData.transferee} onChange={e => setFormData({...formData, transferee: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                  <option value="">Select buyer</option>
                  {shareholders.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  <option value="new">+ Add New Person</option>
                </select>
                {formData.transferee === 'new' && (
                  <input type="text" placeholder="Enter full legal name" value={formData.newTransfereeName} onChange={e => setFormData({...formData, newTransfereeName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', marginTop: '8px' }} />
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Share Class</label>
                <select value={formData.shareClass} onChange={e => setFormData({...formData, shareClass: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                  <option>Common Class A</option>
                  <option>Preferred Class B</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Number of Shares</label>
                <input required type="number" min="1" value={formData.sharesToTransfer} onChange={e => setFormData({...formData, sharesToTransfer: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Total Amount Paid <DollarSign size={14}/></label>
                <input required type="number" step="0.01" min="0" placeholder="e.g. 1000.00" value={formData.totalAmountPaid} onChange={e => setFormData({...formData, totalAmountPaid: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>NOTE: This is the total transaction amount, not per share.</p>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Closing Date <CalendarIcon size={14}/></label>
                <input required type="date" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>The date the transfer will be completed.</p>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" required checked={formData.confirmedRestrictions} onChange={e => setFormData({...formData, confirmedRestrictions: e.target.checked})} style={{ marginTop: '4px', width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
                  I confirm the transferee is eligible to receive shares under the Private Issuer Exemption or applicable securities laws.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
                Generate Documents
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button onClick={() => setView('form')} style={{ background: 'none', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 500, fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to details
          </button>

          <div style={{ marginBottom: '24px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0F172A' }}>Review & Sign Documents</h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>The system has generated 3 documents required to complete this transfer.</p>
          </div>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <ESignaturePanel documentName="Share Transfer Agreement" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Resolution Approving Share Transfer" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Notice of Share Transfer" onSignComplete={() => setView('complete')} />
          </div>
        </div>
      )}

      {view === 'complete' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '40px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Share Transfer Complete</h2>
          <p style={{ margin: '0 auto 24px auto', color: '#475569', fontSize: '15px', maxWidth: '400px', lineHeight: 1.5 }}>
            All required documents have been signed and securely stored in your Minute Book.
          </p>
          
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', maxWidth: '500px', margin: '0 auto 32px auto', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', textTransform: 'uppercase', fontWeight: 600 }}>Updates Applied</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', display: 'grid', gap: '8px' }}>
              <li>Share register (Cap Table) has been updated automatically.</li>
              <li>All 3 documents stored in Minute Book under Company &gt; Documents.</li>
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
