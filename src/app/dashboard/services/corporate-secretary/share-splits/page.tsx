'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { SplitSquareHorizontal, Info, CheckCircle2, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ShareSplitsPage() {
  const { secretarialData, selectedClient } = useCorporateSecretary();
  const [shareClasses, setShareClasses] = useState<any[]>([]);

  React.useEffect(() => {
    if (secretarialData?.shareClasses) setShareClasses(secretarialData.shareClasses);
  }, [secretarialData]);
  const [jurisdiction, setJurisdiction] = useState('Alberta');
  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  const [formData, setFormData] = useState({
    shareClass: 'Common Class A',
    multiplier: '100'
  });

  const MOCK_CURRENT_SHARES = 100;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('sign');
  };

  const onSignComplete = () => {
    setView('complete');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
            <ArrowLeft size={16} /> Back to Corporate Secretary
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SplitSquareHorizontal size={32} style={{ color: '#6366f1' }} />
            Share Splits
          </h1>
        </div>

        <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Jurisdiction</label>
          <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '15px', fontWeight: 600, color: '#0F172A', outline: 'none', cursor: 'pointer' }}>
            <option value="Alberta">Alberta</option>
            <option value="BC">British Columbia</option>
            <option value="Federal">Federal</option>
            <option value="Ontario">Ontario</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} style={{ color: '#64748B' }} /> Understanding Share Splits
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: 1.6, display: 'grid', gap: '8px' }}>
          <li>A Share Split increases the number of shares in circulation without changing each shareholder's proportion of ownership.</li>
          <li><strong>Example:</strong> Two founders each have 50 shares (100 total). After a 100x split, each has 5,000 shares (10,000 total). Same % ownership, more flexibility for future employee share awards.</li>
          <li>A Share Split is different from issuing new shares. A Split divides existing shares.</li>
          <li>Share Splits are often completed before setting up an ESOP to allow awarding shares in smaller increments.</li>
        </ul>
      </div>

      {(jurisdiction === 'Federal' || jurisdiction === 'Ontario') ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <Layers size={48} style={{ color: '#6366f1', margin: '0 auto 16px auto' }} />
          <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Articles of Amendment Required</h2>
          <p style={{ margin: '0 auto 24px auto', color: '#475569', fontSize: '15px', maxWidth: '500px', lineHeight: 1.5 }}>
            For {jurisdiction} corporations, a share split must be completed via an amendment to your Articles of Incorporation.
          </p>
          <Link href="/dashboard/services/corporate-secretary/articles-of-amendment" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', color: 'white', fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
            Proceed to Articles of Amendment <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {view === 'form' && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Execute Share Split</h2>
              </div>
              
              <form onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'grid', gap: '20px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Select Share Class</label>
                    <select value={formData.shareClass} onChange={e => setFormData({...formData, shareClass: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                      <option value="">Select a share class...</option>
                      {shareClasses.map(sc => <option key={sc.id} value={sc.name}>{sc.name} ({sc.issued} issued)</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Split Multiplier</label>
                    <input required type="number" min="2" placeholder="e.g. 100" value={formData.multiplier} onChange={e => setFormData({...formData, multiplier: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                  </div>
                </div>

                <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '8px', border: '1px solid #BFDBFE', marginTop: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1E40AF', fontWeight: 600 }}>Split Preview</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderRadius: '6px', border: '1px solid #DBEAFE' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Current Shares</div>
                      <div style={{ fontSize: '20px', color: '#0F172A', fontWeight: 700 }}>{MOCK_CURRENT_SHARES.toLocaleString()}</div>
                    </div>
                    <ArrowRight size={24} style={{ color: '#94A3B8' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>After {formData.multiplier || 'X'}x Split</div>
                      <div style={{ fontSize: '20px', color: '#16A34A', fontWeight: 700 }}>{(MOCK_CURRENT_SHARES * (parseInt(formData.multiplier) || 1)).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
                    Confirm Split & Generate Resolution
                  </button>
                </div>
              </form>
            </div>
          )}

          {view === 'sign' && (
            <div>
              <button onClick={() => setView('form')} style={{ background: 'none', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 500, fontSize: '14px' }}>
                <ArrowLeft size={16} /> Back to split details
              </button>

              <div style={{ marginBottom: '24px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0F172A' }}>Review & Sign Documents</h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Please sign the resolution approving the {formData.multiplier}x share split.</p>
              </div>
              
              <ESignaturePanel 
                documentName="Director & Shareholder Resolution Approving Share Split"
                onSignComplete={onSignComplete}
              />
            </div>
          )}

          {view === 'complete' && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '40px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
              </div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Share Split Complete</h2>
              <p style={{ margin: '0 auto 24px auto', color: '#475569', fontSize: '15px', maxWidth: '400px', lineHeight: 1.5 }}>
                The resolution has been signed and all required records have been updated automatically.
              </p>
              
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', maxWidth: '500px', margin: '0 auto 32px auto', textAlign: 'left' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', textTransform: 'uppercase', fontWeight: 600 }}>Updates Applied</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', display: 'grid', gap: '8px' }}>
                  <li>Share ledger and Cap Table updated reflecting new share counts.</li>
                  <li>Resolution securely stored in the Minute Book.</li>
                </ul>
              </div>

              <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                Return to Corporate Secretary
              </Link>
            </div>
          )}
        </>
      )}

    </div>
  );
}
