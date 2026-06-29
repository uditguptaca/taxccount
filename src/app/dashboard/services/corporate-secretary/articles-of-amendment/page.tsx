'use client';
import React, { useState } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FileText, AlertCircle, CheckCircle2, ArrowLeft, ExternalLink, Type, Users, PieChart, ShieldAlert } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ArticlesOfAmendmentPage() {
  const { secretarialData, selectedClientId } = useCorporateSecretary();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'name' | 'directors' | 'shares' | 'restrictions'>('name');
  const [view, setView] = useState<'form' | 'sign' | 'complete'>('form');
  
  // Name Change State
  const [nameType, setNameType] = useState('numbered');
  const [newName, setNewName] = useState('');
  
  // Director Limits State
  const [minDirectors, setMinDirectors] = useState(1);
  const [maxDirectors, setMaxDirectors] = useState(10);
  
  // Share Classes State
  const [shareClasses, setShareClasses] = useState<any[]>([]);

  React.useEffect(() => {
    if (secretarialData?.shareClasses) {
      setShareClasses(secretarialData.shareClasses.map(sc => ({ ...sc, multiplier: '' })));
    }
  }, [secretarialData]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('sign');
  };

  const onSignComplete = () => {
    setView('complete');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="cs-page-header">
        <button onClick={() => router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Overview
        </button>
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={28} style={{ color: 'var(--cs-accent)' }} />
          Federal Articles of Amendment
        </h1>
        <p className="cs-page-subtitle">Submit formal registry amendments for federal CBCA business corporations.</p>
      </div>

      <div className="cs-alert warning" style={{ display: 'block', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle style={{ color: 'var(--cs-amber)', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Jurisdiction Notice</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', lineHeight: 1.5 }}>
              This service is only available for <strong>federally incorporated corporations</strong>. Provincial corporations must file directly with their respective provincial registries:
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--cs-amber)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Ontario <ExternalLink size={12}/></a>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--cs-amber)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>British Columbia <ExternalLink size={12}/></a>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--cs-amber)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Alberta <ExternalLink size={12}/></a>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--cs-amber)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Quebec <ExternalLink size={12}/></a>
            </div>
          </div>
        </div>
      </div>

      <div className="cs-alert info" style={{ marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '13px' }}>
          <strong>Note:</strong> Multiple amendments can be performed in one application. All changes include Government filing, Name Search Report (if applicable), and a Special Shareholders Resolution.
        </p>
      </div>

      {view === 'form' && (
        <div className="cs-card">
          <div className="cs-section-tabs" style={{ background: 'var(--cs-surface-hover)', borderBottom: '1px solid var(--cs-border)', padding: '0 12px', margin: 0 }}>
            {[
              { id: 'name', label: 'Corporation Name', icon: Type },
              { id: 'directors', label: 'Director Limits', icon: Users },
              { id: 'shares', label: 'Share Classes', icon: PieChart },
              { id: 'restrictions', label: 'Restrictions', icon: ShieldAlert }
            ].map(tab => (
              <button 
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`cs-subnav-tab${activeTab === tab.id ? ' active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', borderBottomWidth: '2px', borderBottomStyle: 'solid' }}
              >
                <tab.icon size={15} /> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="cs-card-body">
            
            {/* NAME CHANGE TAB */}
            {activeTab === 'name' && (
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Change Corporation Name</h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <label className="cs-form-checkbox">
                    <input type="radio" name="nameType" value="numbered" checked={nameType === 'numbered'} onChange={(e) => setNameType(e.target.value)} style={{ width: '16px', height: '16px' }} />
                    Numbered Corporation
                  </label>
                  <label className="cs-form-checkbox">
                    <input type="radio" name="nameType" value="named" checked={nameType === 'named'} onChange={(e) => setNameType(e.target.value)} style={{ width: '16px', height: '16px' }} />
                    Named Corporation
                  </label>
                </div>
                
                {nameType === 'named' && (
                  <div className="cs-form-group">
                    <label className="cs-form-label">New Corporation Name</label>
                    <input type="text" className="cs-form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter proposed name" required />
                    <p className="cs-form-hint">A NUANS name search reservation will be required (one-time fee).</p>
                  </div>
                )}
              </div>
            )}

            {/* DIRECTOR LIMITS TAB */}
            {activeTab === 'directors' && (
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Change Min/Max Number of Directors</h3>
                <div className="cs-form-row">
                  <div className="cs-form-group">
                    <label className="cs-form-label">Minimum number of directors</label>
                    <input type="number" className="cs-form-input" min="1" value={minDirectors} onChange={e => setMinDirectors(parseInt(e.target.value))} />
                  </div>
                  <div className="cs-form-group">
                    <label className="cs-form-label">Maximum number of directors</label>
                    <input type="number" className="cs-form-input" min={minDirectors} value={maxDirectors} onChange={e => setMaxDirectors(parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            )}

            {/* SHARE CLASSES TAB */}
            {activeTab === 'shares' && (
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>Change Share Classes</h3>
                <p style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', marginBottom: '20px' }}>Modify existing share classes or apply a share split multiplier.</p>
                
                {shareClasses.length === 0 ? (
                  <div style={{ padding: '16px', border: '1px dashed var(--cs-border)', borderRadius: '8px', textAlign: 'center', color: 'var(--cs-text-muted)' }}>
                    No custom share classes defined. Proceeding with standard Common structure.
                  </div>
                ) : (
                  shareClasses.map((sc, index) => (
                    <div key={sc.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px', background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)' }}>
                      <div style={{ flex: 1 }}>
                        <label className="cs-form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Class Name</label>
                        <input type="text" className="cs-form-input" value={sc.name} onChange={e => { const newArr = [...shareClasses]; newArr[index].name = e.target.value; setShareClasses(newArr); }} />
                      </div>
                      <div style={{ width: '150px' }}>
                        <label className="cs-form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Split Multiplier</label>
                        <input type="number" className="cs-form-input" placeholder="e.g. 100" value={sc.multiplier} onChange={e => { const newArr = [...shareClasses]; newArr[index].multiplier = e.target.value; setShareClasses(newArr); }} />
                      </div>
                    </div>
                  ))
                )}
                
                <button type="button" className="cs-btn cs-btn-ghost cs-btn-sm" style={{ color: 'var(--cs-accent)', paddingLeft: 0, marginTop: '12px' }}>+ Add Share Class</button>
              </div>
            )}

            {/* RESTRICTIONS TAB */}
            {activeTab === 'restrictions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Restriction on Share Transfers & Other Provisions</h3>
                
                <div>
                  <label className="cs-form-label">Restriction on Share Transfers</label>
                  <div style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', fontSize: '13px', color: 'var(--cs-text-secondary)', border: '1px solid var(--cs-border-light)', lineHeight: 1.5 }}>
                    Any transfer of shares shall be restricted in that no shareholder shall be entitled to transfer any share or shares in the capital of the Corporation without the approval of the directors or shareholders of the Corporation by resolution.
                  </div>
                </div>

                <div>
                  <label className="cs-form-label">Other Provisions (Private Issuer)</label>
                  <div style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', fontSize: '13px', color: 'var(--cs-text-secondary)', border: '1px solid var(--cs-border-light)', lineHeight: 1.5 }}>
                    The Corporation is a private issuer and the number of shareholders, exclusive of persons who are in its employment, is limited to not more than 50.
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--cs-border-light)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="cs-btn cs-btn-primary">
                Review Changes & Sign Documents
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('form')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '16px' }}>
            <ArrowLeft size={14} /> Back to form
          </button>

          <div className="cs-alert info" style={{ marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Review & Sign Documents</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>Please review and sign the Articles of Amendment and the Special Shareholders&apos; Resolution.</p>
            </div>
          </div>
          
          <ESignaturePanel 
            documentName="Articles of Amendment (Form 4)"
            onSignComplete={onSignComplete}
          />
        </div>
      )}

      {view === 'complete' && (
        <div className="cs-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--cs-emerald-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={28} style={{ color: 'var(--cs-emerald)' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Amendment Initiated</h2>
          <p style={{ margin: '0 auto 24px', color: 'var(--cs-text-secondary)', fontSize: '14px', maxWidth: '500px', lineHeight: 1.5 }}>
            Your signature has been recorded. The Special Shareholders&apos; Resolution has been sent to all required parties for signature.
          </p>
          
          <div style={{ background: 'var(--cs-surface-hover)', border: '1px solid var(--cs-border)', borderRadius: '12px', padding: '20px', maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--cs-text-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Next Steps</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--cs-text-secondary)', fontSize: '13px', display: 'grid', gap: '8px' }}>
              <li>Once all signatures are collected, the Articles of Amendment will be submitted to Corporations Canada.</li>
              <li>A NUANS search report will be generated automatically if a name change was requested.</li>
              <li>Your dashboard will show the status as "Amendment — Pending" until filed.</li>
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
