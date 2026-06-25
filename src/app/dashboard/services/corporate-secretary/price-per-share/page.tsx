'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function PricePerSharePage() {
  const { secretarialData, selectedClient } = useCorporateSecretary();
  const [shareClasses, setShareClasses] = useState<any[]>([]);

  React.useEffect(() => {
    if (secretarialData?.shareClasses) setShareClasses(secretarialData.shareClasses);
  }, [secretarialData]);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    shareClass: 'Common Class A',
    price: '',
    effectiveDate: '',
    basis: 'Inferred valuation',
    notes: ''
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(`Price of $${formData.price} for ${formData.shareClass} successfully recorded.`);
    // Reset form mostly
    setFormData({...formData, price: '', effectiveDate: '', notes: ''});
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DollarSign size={32} style={{ color: '#6366f1' }} />
          Price per Share
        </h1>
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} style={{ color: '#64748B' }} /> Understanding Price per Share
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: 1.6, display: 'grid', gap: '8px' }}>
          <li>The price per share is the amount the individual receiving shares must pay the corporation for each share.</li>
          <li>It should reflect <strong>fair market value</strong>. Can be based on a formal business valuation, inferred valuation, or recent share issuance event.</li>
          <li>Review your Shareholder Agreement — it may contain instructions for calculating share price.</li>
          <li>Consult an accountant to determine appropriate price and tax implications.</li>
        </ul>
      </div>

      {successMessage && (
        <div style={{ background: '#DCFCE7', border: '1px solid #22C55E', padding: '16px 20px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <CheckCircle2 style={{ color: '#16A34A' }} size={20} />
          <div>
            <div style={{ color: '#166534', fontWeight: 600, fontSize: '15px' }}>{successMessage}</div>
            <div style={{ color: '#15803D', fontSize: '13px', marginTop: '2px' }}>This price will now auto-populate in Share Transfer and Share Repurchase workflows.</div>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Record New Price per Share</h2>
        </div>
        
        <form onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'grid', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Share Class</label>
              <select value={formData.shareClass} onChange={e => setFormData({...formData, shareClass: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                <option value="">Select a share class...</option>
                {shareClasses.map(sc => <option key={sc.id} value={sc.name}>{sc.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Price per Share ($)</label>
              <input required type="number" step="0.01" min="0" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Effective Date</label>
              <input required type="date" value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Basis for Valuation</label>
              <select value={formData.basis} onChange={e => setFormData({...formData, basis: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                <option>Formal business valuation</option>
                <option>Inferred valuation</option>
                <option>Based on recent share issuance</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Notes / Explanation (Optional)</label>
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', resize: 'vertical' }} placeholder="Add any details about how this price was determined..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
              Save Price per Share
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
