'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DollarSign, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function PricePerSharePage() {
  const { shareClasses, selectedClientId } = useCorporateSecretary();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    shareClass: '',
    price: '',
    effectiveDate: '',
    basis: 'Inferred valuation',
    notes: ''
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
    setSuccessMessage(`Price of $${formData.price} for ${formData.shareClass} successfully recorded.`);
    // Reset form mostly
    setFormData({...formData, price: '', effectiveDate: '', notes: ''});
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="cs-page-header">
        <button onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Overview
        </button>
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DollarSign size={28} style={{ color: 'var(--cs-accent)' }} />
          Price per Share
        </h1>
        <p className="cs-page-subtitle">Record and update historic valuation and share pricing profiles.</p>
      </div>

      <div className="cs-alert info" style={{ display: 'block', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} style={{ color: 'var(--cs-accent)' }} /> Understanding Price per Share
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.6, display: 'grid', gap: '8px' }}>
          <li>The price per share is the amount the individual receiving shares must pay the corporation for each share.</li>
          <li>It should reflect <strong>fair market value</strong>. Can be based on a formal business valuation, inferred valuation, or recent share issuance event.</li>
          <li>Review your Shareholder Agreement — it may contain instructions for calculating share price.</li>
          <li>Consult an accountant to determine appropriate price and tax implications.</li>
        </ul>
      </div>

      {successMessage && (
        <div className="cs-alert success" style={{ display: 'block', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <CheckCircle2 style={{ color: 'var(--cs-emerald)', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{successMessage}</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>This price will now auto-populate in Share Transfer and Share Repurchase workflows.</div>
            </div>
          </div>
        </div>
      )}

      <div className="cs-card">
        <div className="cs-card-header">
          <h2>Record New Price per Share</h2>
        </div>
        
        <form onSubmit={handleFormSubmit} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="cs-form-row">
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
            <div className="cs-form-group">
              <label className="cs-form-label">Price per Share ($)</label>
              <input required type="number" step="0.01" min="0" placeholder="0.00" className="cs-form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          <div className="cs-form-row">
            <div className="cs-form-group">
              <label className="cs-form-label">Effective Date</label>
              <input required type="date" className="cs-form-input" value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} />
            </div>
            <div className="cs-form-group">
              <label className="cs-form-label">Basis for Valuation</label>
              <select className="cs-form-select" value={formData.basis} onChange={e => setFormData({...formData, basis: e.target.value})}>
                <option>Formal business valuation</option>
                <option>Inferred valuation</option>
                <option>Based on recent share issuance</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="cs-form-group">
            <label className="cs-form-label">Notes / Explanation (Optional)</label>
            <textarea className="cs-form-textarea" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Add any details about how this price was determined..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="cs-btn cs-btn-primary">
              Save Price per Share
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
