'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownToLine, AlertCircle, CheckCircle2, ArrowLeft, DollarSign, CalendarIcon, ShieldAlert } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ShareRepurchasesPage() {
  const { shareClasses, shareholders, selectedClientId } = useCorporateSecretary();
  const router = useRouter();

  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  const [formData, setFormData] = useState({
    shareholderId: '',
    sharesToRepurchase: '',
    shareClass: '',
    pricePerShare: '',
    totalAmountPaid: '',
    closingDate: '',
    consentsConfirmed: false
  });

  React.useEffect(() => {
    if (shareClasses && shareClasses.length > 0) {
      setFormData(prev => ({
        ...prev,
        shareClass: shareClasses[0].name
      }));
    }
  }, [shareClasses]);

  // Auto-calculate total amount paid
  useEffect(() => {
    if (formData.pricePerShare && formData.sharesToRepurchase) {
      const price = parseFloat(formData.pricePerShare);
      const shares = parseInt(formData.sharesToRepurchase);
      if (!isNaN(price) && !isNaN(shares)) {
        setFormData(prev => ({ ...prev, totalAmountPaid: (price * shares).toFixed(2) }));
      }
    }
  }, [formData.pricePerShare, formData.sharesToRepurchase]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentsConfirmed) {
      alert("You must confirm that shareholder consents and waivers have been obtained or are not required.");
      return;
    }
    
    // Validation
    const selectedShareholder = shareholders.find(s => s.personId === formData.shareholderId);
    if (selectedShareholder) {
      const firstClassId = Object.keys(selectedShareholder.classHoldings || {})[0];
      const sharesHeld = Number(selectedShareholder.classHoldings?.[firstClassId] || 0);
      const remainingShares = shareholders.reduce((acc, s) => {
        const classId = Object.keys(s.classHoldings || {})[0];
        return acc + Number(s.classHoldings?.[classId] || 0);
      }, 0) - parseInt(formData.sharesToRepurchase);

      if (remainingShares <= 0) {
        alert("A corporation must have at least one voting share outstanding. You cannot repurchase all remaining shares.");
        return;
      }
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
          <ArrowDownToLine size={28} style={{ color: 'var(--cs-accent)' }} />
          Share Repurchases (Buy-Backs)
        </h1>
        <p className="cs-page-subtitle">Execute corporate buy-backs of outstanding shares from active holders.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div className="cs-alert warning" style={{ display: 'block' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle style={{ color: 'var(--cs-amber)', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Critical Requirements & Liabilities</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.5, display: 'grid', gap: '6px' }}>
                <li><strong>Documents:</strong> Review Articles, Bylaws, and Shareholder Agreement to ensure repurchase is permitted.</li>
                <li><strong>Solvency:</strong> Corporation must meet solvency and net worth requirements before authorizing repurchase (requirements vary by jurisdiction).</li>
                <li><strong>Liability:</strong> Directors who approve and the shareholder whose shares are repurchased may face <em>personal liability</em> if solvency requirements are violated.</li>
                <li><strong>Tax:</strong> Repurchases can trigger capital gains/losses, and possible deemed dividends if sale price exceeds paid-up capital. Consult a tax lawyer/accountant.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="cs-alert info">
          <ShieldAlert style={{ color: 'var(--cs-accent)', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Redeemable Shares Notice</h4>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
              Shares subject to a right of redemption or retraction are considered &apos;redeemable&apos; and may be subject to special restrictions, including price caps and additional solvency requirements.
            </p>
          </div>
        </div>
      </div>

      {view === 'form' && (
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Repurchase Details</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Step 1 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--cs-text-primary)', borderBottom: '1px solid var(--cs-border-light)', paddingBottom: '8px', fontWeight: 700 }}>1. Identify Shares</h3>
              <div className="cs-form-row">
                <div className="cs-form-group">
                  <label className="cs-form-label">Shareholder (Seller)</label>
                  <select required className="cs-form-select" value={formData.shareholderId} onChange={e => setFormData({...formData, shareholderId: e.target.value})}>
                    <option value="">Select shareholder</option>
                    {shareholders.map(s => {
                      const firstClassId = Object.keys(s.classHoldings || {})[0];
                      const sharesCount = Number(s.classHoldings?.[firstClassId] || 0);
                      return <option key={s.personId} value={s.personId}>{s.name} ({sharesCount} shares)</option>;
                    })}
                  </select>
                </div>
                <div className="cs-form-group">
                  <label className="cs-form-label">Share Class</label>
                  <select className="cs-form-select" value={formData.shareClass} onChange={e => setFormData({...formData, shareClass: e.target.value})}>
                    {shareClasses.map(sc => (
                      <option key={sc.id} value={sc.name}>{sc.name}</option>
                    ))}
                    {shareClasses.length === 0 && (
                      <option>Common Class A</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="cs-form-group" style={{ maxWidth: '50%' }}>
                <label className="cs-form-label">Number of shares to repurchase</label>
                <input required type="number" min="1" className="cs-form-input" value={formData.sharesToRepurchase} onChange={e => setFormData({...formData, sharesToRepurchase: e.target.value})} />
                <p className="cs-form-hint">Corporation can repurchase all or a portion of a shareholder&apos;s shares.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--cs-text-primary)', borderBottom: '1px solid var(--cs-border-light)', paddingBottom: '8px', fontWeight: 700 }}>2. Pricing</h3>
              <div className="cs-form-row">
                <div className="cs-form-group">
                  <label className="cs-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Price per Share <DollarSign size={13} style={{ color: 'var(--cs-text-muted)' }} /></label>
                  <input required type="number" step="0.01" min="0" className="cs-form-input" value={formData.pricePerShare} onChange={e => setFormData({...formData, pricePerShare: e.target.value})} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Total Amount Paid <DollarSign size={13} style={{ color: 'var(--cs-text-muted)' }} /></label>
                  <input required type="number" step="0.01" min="0" className="cs-form-input" value={formData.totalAmountPaid} onChange={e => setFormData({...formData, totalAmountPaid: e.target.value})} style={{ background: 'var(--cs-surface-hover)' }} />
                </div>
              </div>
              <p className="cs-form-hint">Total amount paid is the gross aggregate payment for all shares being repurchased.</p>
            </div>

            {/* Step 3 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--cs-text-primary)', borderBottom: '1px solid var(--cs-border-light)', paddingBottom: '8px', fontWeight: 700 }}>3. Closing Date</h3>
              <div className="cs-form-group" style={{ maxWidth: '50%' }}>
                <label className="cs-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Closing Date <CalendarIcon size={13} style={{ color: 'var(--cs-text-muted)' }} /></label>
                <input required type="date" className="cs-form-input" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} />
                <p className="cs-form-hint">The date the repurchase transaction is completed and shares are cancelled.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--cs-text-primary)', borderBottom: '1px solid var(--cs-border-light)', paddingBottom: '8px', fontWeight: 700 }}>4. Shareholder Consents</h3>
              <div className="cs-form-checkbox" style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)' }}>
                <input type="checkbox" required checked={formData.consentsConfirmed} onChange={e => setFormData({...formData, consentsConfirmed: e.target.checked})} id="repurchase-consent" />
                <label htmlFor="repurchase-consent" style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                  I have confirmed this repurchase does not contravene any shareholder agreements, OR I have obtained the necessary consents and waivers from relevant shareholders.
                </label>
              </div>
              <p className="cs-form-hint" style={{ paddingLeft: '28px', marginTop: '8px' }}>
                <strong>Jurisdiction Note:</strong> In Alberta and Quebec, all shareholders must be notified within 30 days of closing. Shareholders in those jurisdictions are also entitled to a free copy of the repurchase agreement.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="cs-btn cs-btn-primary">
                Confirm Repurchase & Generate Documents
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
              <p style={{ margin: 0, fontSize: '13px' }}>The system has generated 4 documents required to complete this repurchase.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ESignaturePanel documentName="Share Repurchase Agreement" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Resolution Repurchasing Shares" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Notice of Share Repurchase" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Shareholder Consent to Repurchase" onSignComplete={() => setView('complete')} />
          </div>
        </div>
      )}

      {view === 'complete' && (
        <div className="cs-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--cs-emerald-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={28} style={{ color: 'var(--cs-emerald)' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Share Repurchase Complete</h2>
          <p style={{ margin: '0 auto 24px', color: 'var(--cs-text-secondary)', fontSize: '14px', maxWidth: '400px', lineHeight: 1.5 }}>
            All required documents have been signed and securely stored in your Minute Book.
          </p>
          
          <div style={{ background: 'var(--cs-surface-hover)', border: '1px solid var(--cs-border)', borderRadius: '12px', padding: '20px', maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--cs-text-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Updates Applied</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--cs-text-secondary)', fontSize: '13px', display: 'grid', gap: '8px' }}>
              <li>Share register updated.</li>
              <li>Cap Table updated showing {formData.sharesToRepurchase} cancelled shares.</li>
              <li>All 4 documents stored in Minute Book under Company &gt; Documents.</li>
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
