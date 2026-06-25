'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, AlertCircle, CheckCircle2, ArrowLeft, DollarSign, CalendarIcon, ShieldAlert } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ShareRepurchasesPage() {
  const { secretarialData, selectedClient } = useCorporateSecretary();
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [shareClasses, setShareClasses] = useState<any[]>([]);

  React.useEffect(() => {
    if (secretarialData?.shareholders) setShareholders(secretarialData.shareholders);
    if (secretarialData?.shareClasses) setShareClasses(secretarialData.shareClasses);
  }, [secretarialData]);

  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  const [formData, setFormData] = useState({
    shareholderId: '',
    sharesToRepurchase: '',
    shareClass: 'Common Class A',
    pricePerShare: '',
    totalAmountPaid: '',
    closingDate: '',
    consentsConfirmed: false
  });

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
    const selectedShareholder = shareholders.find(s => s.id.toString() === formData.shareholderId);
    if (selectedShareholder) {
      const remainingShares = shareholders.reduce((acc, s) => acc + s.shares, 0) - parseInt(formData.sharesToRepurchase);
      if (remainingShares <= 0) {
        alert("A corporation must have at least one voting share outstanding. You cannot repurchase all remaining shares.");
        return;
      }
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
          <ArrowDownToLine size={32} style={{ color: '#6366f1' }} />
          Share Repurchases (Buy-Backs)
        </h1>
      </div>

      <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400E', fontSize: '15px', fontWeight: 600 }}>Critical Requirements & Liabilities</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400E', fontSize: '14px', lineHeight: 1.5, display: 'grid', gap: '6px' }}>
              <li><strong>Documents:</strong> Review Articles, Bylaws, and Shareholder Agreement to ensure repurchase is permitted.</li>
              <li><strong>Solvency:</strong> Corporation must meet solvency and net worth requirements before authorizing repurchase (requirements vary by jurisdiction).</li>
              <li><strong>Liability:</strong> Directors who approve and the shareholder whose shares are repurchased may face <em>personal liability</em> if solvency requirements are violated.</li>
              <li><strong>Tax:</strong> Repurchases can trigger capital gains/losses, and possible deemed dividends if sale price exceeds paid-up capital. Consult a tax lawyer/accountant.</li>
            </ul>
          </div>
        </div>

        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <ShieldAlert style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#1E40AF', fontSize: '14px', fontWeight: 600 }}>Redeemable Shares Notice</h4>
            <p style={{ margin: 0, color: '#1E40AF', fontSize: '14px', lineHeight: 1.5 }}>
              Shares subject to a right of redemption or retraction are considered 'redeemable' and may be subject to special restrictions, including price caps and additional solvency requirements.
            </p>
          </div>
        </div>
      </div>

      {view === 'form' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Repurchase Details</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'grid', gap: '24px' }}>
            
            {/* Step 1 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>1. Identify Shares</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Shareholder (Seller)</label>
                  <select required value={formData.shareholderId} onChange={e => setFormData({...formData, shareholderId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                    <option value="">Select shareholder</option>
                    {shareholders.map(s => <option key={s.id} value={s.id}>{s.name} ({s.shares} shares)</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Share Class</label>
                  <select value={formData.shareClass} onChange={e => setFormData({...formData, shareClass: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                    <option value="">Select a share class...</option>
                    {shareClasses.map(sc => <option key={sc.id} value={sc.name}>{sc.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Number of shares to repurchase</label>
                <input required type="number" min="1" value={formData.sharesToRepurchase} onChange={e => setFormData({...formData, sharesToRepurchase: e.target.value})} style={{ width: '50%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748B' }}>Corporation can repurchase all or a portion of a shareholder's shares.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>2. Pricing</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Price per Share <DollarSign size={14}/></label>
                  <input required type="number" step="0.01" min="0" value={formData.pricePerShare} onChange={e => setFormData({...formData, pricePerShare: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Total Amount Paid <DollarSign size={14}/></label>
                  <input required type="number" step="0.01" min="0" value={formData.totalAmountPaid} onChange={e => setFormData({...formData, totalAmountPaid: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: '#F8FAFC' }} />
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748B' }}>Total amount paid is the gross aggregate payment for all shares being repurchased.</p>
            </div>

            {/* Step 3 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>3. Closing Date</h3>
              <div style={{ width: '50%' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Closing Date <CalendarIcon size={14}/></label>
                <input required type="date" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748B' }}>The date the repurchase transaction is completed and shares are cancelled.</p>
            </div>

            {/* Step 4 */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>4. Shareholder Consents</h3>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" required checked={formData.consentsConfirmed} onChange={e => setFormData({...formData, consentsConfirmed: e.target.checked})} style={{ marginTop: '4px', width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
                    I have confirmed this repurchase does not contravene any shareholder agreements, OR I have obtained the necessary consents and waivers from relevant shareholders.
                  </span>
                </label>
                <p style={{ margin: '12px 0 0 28px', fontSize: '13px', color: '#64748B' }}>
                  <strong>Jurisdiction Note:</strong> In Alberta and Quebec, all shareholders must be notified within 30 days of closing. Shareholders in those jurisdictions are also entitled to a free copy of the repurchase agreement.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
                Confirm Repurchase & Generate Documents
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
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>The system has generated 4 documents required to complete this repurchase.</p>
          </div>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <ESignaturePanel documentName="Share Repurchase Agreement" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Resolution Repurchasing Shares" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Notice of Share Repurchase" onSignComplete={() => {}} />
            <ESignaturePanel documentName="Shareholder Consent to Repurchase" onSignComplete={() => setView('complete')} />
          </div>
        </div>
      )}

      {view === 'complete' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '40px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Share Repurchase Complete</h2>
          <p style={{ margin: '0 auto 24px auto', color: '#475569', fontSize: '15px', maxWidth: '400px', lineHeight: 1.5 }}>
            All required documents have been signed and securely stored in your Minute Book.
          </p>
          
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', maxWidth: '500px', margin: '0 auto 32px auto', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', textTransform: 'uppercase', fontWeight: 600 }}>Updates Applied</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', display: 'grid', gap: '8px' }}>
              <li>Share register updated.</li>
              <li>Cap Table updated showing {formData.sharesToRepurchase} cancelled shares.</li>
              <li>All 4 documents stored in Minute Book under Company &gt; Documents.</li>
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
