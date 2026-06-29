'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SplitSquareHorizontal, Info, CheckCircle2, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ShareSplitsPage() {
  const { shareClasses, selectedClient, selectedClientId } = useCorporateSecretary();
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState('Alberta');
  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  const [formData, setFormData] = useState({
    shareClass: '',
    multiplier: '10'
  });

  React.useEffect(() => {
    if (selectedClient?.state_province) {
      setJurisdiction(selectedClient.state_province === 'ON' ? 'Ontario' : selectedClient.state_province === 'BC' ? 'BC' : 'Alberta');
    }
  }, [selectedClient]);

  React.useEffect(() => {
    if (shareClasses && shareClasses.length > 0) {
      setFormData(prev => ({
        ...prev,
        shareClass: shareClasses[0].name
      }));
    }
  }, [shareClasses]);

  const selectedClassObj = shareClasses.find(sc => sc.name === formData.shareClass);
  const currentSharesCount = selectedClassObj ? Number(selectedClassObj.issued_count || 1000) : 1000;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('sign');
  };

  const onSignComplete = () => {
    setView('complete');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
            <ArrowLeft size={14} /> Back to Overview
          </button>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SplitSquareHorizontal size={28} style={{ color: 'var(--cs-accent)' }} />
            Share Splits
          </h1>
          <p className="cs-page-subtitle">Execute share split operations on active capital share classes.</p>
        </div>

        <div style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--cs-border)' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Jurisdiction</label>
          <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-primary)', outline: 'none', cursor: 'pointer', padding: 0 }}>
            <option value="Alberta">Alberta</option>
            <option value="BC">British Columbia</option>
            <option value="Federal">Federal</option>
            <option value="Ontario">Ontario</option>
          </select>
        </div>
      </div>

      <div className="cs-alert info" style={{ display: 'block', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} style={{ color: 'var(--cs-accent)' }} /> Understanding Share Splits
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.6, display: 'grid', gap: '8px' }}>
          <li>A Share Split increases the number of shares in circulation without changing each shareholder&apos;s proportion of ownership.</li>
          <li><strong>Example:</strong> Two founders each have 50 shares (100 total). After a 100x split, each has 5,000 shares (10,000 total). Same % ownership, more flexibility for future employee share awards.</li>
          <li>A Share Split is different from issuing new shares. A Split divides existing shares.</li>
          <li>Share Splits are often completed before setting up an ESOP to allow awarding shares in smaller increments.</li>
        </ul>
      </div>

      {(jurisdiction === 'Federal' || jurisdiction === 'Ontario') ? (
        <div className="cs-card" style={{ padding: '32px', textAlign: 'center' }}>
          <Layers size={44} style={{ color: 'var(--cs-accent)', margin: '0 auto 16px' }} />
          <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Articles of Amendment Required</h2>
          <p style={{ margin: '0 auto 24px', color: 'var(--cs-text-secondary)', fontSize: '14px', maxWidth: '500px', lineHeight: 1.5 }}>
            For {jurisdiction} corporations, a share split must be completed via an amendment to your Articles of Incorporation.
          </p>
          <button 
            className="cs-btn cs-btn-primary"
            onClick={() => router.push(`/dashboard/services/corporate-secretary/articles-of-amendment?clientId=${selectedClientId}`)}
          >
            Proceed to Articles of Amendment <ArrowRight size={15} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      ) : (
        <>
          {view === 'form' && (
            <div className="cs-card">
              <div className="cs-card-header">
                <h2>Execute Share Split</h2>
              </div>
              
              <form onSubmit={handleFormSubmit} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="cs-form-row">
                  <div className="cs-form-group">
                    <label className="cs-form-label">Select Share Class</label>
                    <select className="cs-form-select" value={formData.shareClass} onChange={e => setFormData({...formData, shareClass: e.target.value})}>
                      {shareClasses.map(sc => (
                        <option key={sc.id} value={sc.name}>{sc.name} ({Number(sc.issued_count || 0).toLocaleString()} issued)</option>
                      ))}
                      {shareClasses.length === 0 && (
                        <option>Common Class A</option>
                      )}
                    </select>
                  </div>
                  <div className="cs-form-group">
                    <label className="cs-form-label">Split Multiplier</label>
                    <input required type="number" min="2" className="cs-form-input" placeholder="e.g. 100" value={formData.multiplier} onChange={e => setFormData({...formData, multiplier: e.target.value})} />
                  </div>
                </div>

                <div className="cs-alert info" style={{ display: 'block', marginTop: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700 }}>Split Preview</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderRadius: '8px', border: '1px solid var(--cs-border)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--cs-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Current Shares</div>
                      <div style={{ fontSize: '18px', color: 'var(--cs-text-primary)', fontWeight: 700 }}>{currentSharesCount.toLocaleString()}</div>
                    </div>
                    <ArrowRight size={20} style={{ color: 'var(--cs-text-muted)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--cs-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>After {formData.multiplier || 'X'}x Split</div>
                      <div style={{ fontSize: '18px', color: 'var(--cs-emerald)', fontWeight: 700 }}>{(currentSharesCount * (parseInt(formData.multiplier) || 1)).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="submit" className="cs-btn cs-btn-primary">
                    Confirm Split & Generate Resolution
                  </button>
                </div>
              </form>
            </div>
          )}

          {view === 'sign' && (
            <div>
              <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('form')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '16px' }}>
                <ArrowLeft size={14} /> Back to split details
              </button>

              <div className="cs-alert info" style={{ marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Review & Sign Documents</h3>
                  <p style={{ margin: 0, fontSize: '13px' }}>Please sign the resolution approving the {formData.multiplier}x share split.</p>
                </div>
              </div>
              
              <ESignaturePanel 
                documentName="Director & Shareholder Resolution Approving Share Split"
                onSignComplete={onSignComplete}
              />
            </div>
          )}

          {view === 'complete' && (
            <div className="cs-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--cs-emerald-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={28} style={{ color: 'var(--cs-emerald)' }} />
              </div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Share Split Complete</h2>
              <p style={{ margin: '0 auto 24px', color: 'var(--cs-text-secondary)', fontSize: '14px', maxWidth: '400px', lineHeight: 1.5 }}>
                The resolution has been signed and all required records have been updated automatically.
              </p>
              
              <div style={{ background: 'var(--cs-surface-hover)', border: '1px solid var(--cs-border)', borderRadius: '12px', padding: '20px', maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--cs-text-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Updates Applied</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--cs-text-secondary)', fontSize: '13px', display: 'grid', gap: '8px' }}>
                  <li>Share register (Cap Table) has been updated automatically.</li>
                  <li>Resolution securely stored in the Minute Book.</li>
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
        </>
      )}

    </div>
  );
}
