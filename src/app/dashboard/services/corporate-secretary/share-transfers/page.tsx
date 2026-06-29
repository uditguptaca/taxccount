'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, AlertCircle, CheckCircle2, ArrowLeft, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ShareTransfersPage() {
  const { shareClasses, shareholders, selectedClientId } = useCorporateSecretary();
  const router = useRouter();
  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  const [formData, setFormData] = useState({
    transferor: '',
    transferee: '',
    newTransfereeName: '',
    sharesToTransfer: '',
    shareClass: '',
    totalAmountPaid: '',
    closingDate: '',
    confirmedRestrictions: false
  });

  React.useEffect(() => {
    if (shareClasses && shareClasses.length > 0) {
      setFormData(prev => ({
        ...prev,
        shareClass: shareClasses[0].name
      }));
    }
  }, [shareClasses]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmedRestrictions) {
      alert("You must confirm eligibility under the Private Issuer Exemption.");
      return;
    }
    setView('sign');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="cs-page-header">
        <button onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Overview
        </button>
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArrowRightLeft size={28} style={{ color: 'var(--cs-accent)' }} />
          Share Transfers
        </h1>
        <p className="cs-page-subtitle">Formally transfer shares between existing holders or new investors.</p>
      </div>

      <div className="cs-alert warning" style={{ display: 'block', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle style={{ color: 'var(--cs-amber)', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Important Requirements</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.5 }}>
              <li>Review your Articles of Incorporation, Bylaws, and Shareholder Agreement before proceeding to ensure the transfer is permitted.</li>
              <li>There can be tax implications (capital gains/losses). We strongly recommend speaking with an accountant first.</li>
              <li>Shares can only be transferred to persons eligible under the <Link href="/dashboard/services/corporate-secretary/private-issuer-exemption" style={{ color: 'var(--cs-amber)', textDecoration: 'underline', fontWeight: 600 }}>Private Issuer Exemption</Link>.</li>
            </ul>
          </div>
        </div>
      </div>

      {view === 'form' && (
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Transfer Details</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="cs-form-row">
              <div className="cs-form-group">
                <label className="cs-form-label">Transferor (Seller)</label>
                <select required className="cs-form-select" value={formData.transferor} onChange={e => setFormData({...formData, transferor: e.target.value})}>
                  <option value="">Select a shareholder...</option>
                  {shareholders.map(s => {
                    const firstClassId = Object.keys(s.classHoldings || {})[0];
                    const sharesCount = Number(s.classHoldings?.[firstClassId] || 0);
                    return <option key={s.personId} value={s.personId}>{s.name} ({sharesCount} shares)</option>;
                  })}
                </select>
              </div>
              
              <div className="cs-form-group">
                <label className="cs-form-label">Transferee (Buyer)</label>
                <select required className="cs-form-select" value={formData.transferee} onChange={e => setFormData({...formData, transferee: e.target.value})}>
                  <option value="">Select buyer</option>
                  {shareholders.map(s => <option key={s.personId} value={s.personId}>{s.name}</option>)}
                  <option value="new">+ Add New Person</option>
                </select>
                {formData.transferee === 'new' && (
                  <input type="text" className="cs-form-input" placeholder="Enter full legal name" value={formData.newTransfereeName} onChange={e => setFormData({...formData, newTransfereeName: e.target.value})} style={{ marginTop: '8px' }} />
                )}
              </div>
            </div>

            <div className="cs-form-row">
              <div className="cs-form-group">
                <label className="cs-form-label">Share Class</label>
                <select className="cs-form-select" value={formData.shareClass} onChange={e => setFormData({...formData, shareClass: e.target.value})}>
                  {shareClasses.map(sc => (
                    <option key={sc.id} value={sc.name}>{sc.name}</option>
                  ))}
                  {shareClasses.length === 0 && (
                    <>
                      <option>Common Class A</option>
                      <option>Preferred Class B</option>
                    </>
                  )}
                </select>
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label">Number of Shares</label>
                <input required type="number" min="1" className="cs-form-input" value={formData.sharesToTransfer} onChange={e => setFormData({...formData, sharesToTransfer: e.target.value})} />
              </div>
            </div>

            <div className="cs-form-row">
              <div className="cs-form-group">
                <label className="cs-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Total Amount Paid <DollarSign size={13} style={{ color: 'var(--cs-text-muted)' }} /></label>
                <input required type="number" step="0.01" min="0" placeholder="e.g. 1000.00" className="cs-form-input" value={formData.totalAmountPaid} onChange={e => setFormData({...formData, totalAmountPaid: e.target.value})} />
                <p className="cs-form-hint">NOTE: This is the total transaction amount, not per share.</p>
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Closing Date <CalendarIcon size={13} style={{ color: 'var(--cs-text-muted)' }} /></label>
                <input required type="date" className="cs-form-input" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} />
                <p className="cs-form-hint">The date the transfer will be completed.</p>
              </div>
            </div>

            <div className="cs-form-checkbox" style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)' }}>
              <input type="checkbox" required checked={formData.confirmedRestrictions} onChange={e => setFormData({...formData, confirmedRestrictions: e.target.checked})} id="exemption-checkbox" />
              <label htmlFor="exemption-checkbox" style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                I confirm the transferee is eligible to receive shares under the Private Issuer Exemption or applicable securities laws.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="cs-btn cs-btn-primary">
                Generate Documents
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('form')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '16px' }}>
            <ArrowLeft size={14} /> Back to details
          </button>

          <div className="cs-alert info" style={{ marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Review & Sign Documents</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>The system has generated 3 documents required to complete this transfer.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ESignaturePanel documentName="Share Transfer Agreement" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Resolution Approving Share Transfer" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Notice of Share Transfer" onSignComplete={() => setView('complete')} />
          </div>
        </div>
      )}

      {view === 'complete' && (
        <div className="cs-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--cs-emerald-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={28} style={{ color: 'var(--cs-emerald)' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Share Transfer Complete</h2>
          <p style={{ margin: '0 auto 24px', color: 'var(--cs-text-secondary)', fontSize: '14px', maxWidth: '400px', lineHeight: 1.5 }}>
            All required documents have been signed and securely stored in your Minute Book.
          </p>
          
          <div style={{ background: 'var(--cs-surface-hover)', border: '1px solid var(--cs-border)', borderRadius: '12px', padding: '20px', maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--cs-text-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Updates Applied</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--cs-text-secondary)', fontSize: '13px', display: 'grid', gap: '8px' }}>
              <li>Share register (Cap Table) has been updated automatically.</li>
              <li>All 3 documents stored in Minute Book under Company &gt; Documents.</li>
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
