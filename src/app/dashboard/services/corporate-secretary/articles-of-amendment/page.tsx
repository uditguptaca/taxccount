'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, AlertCircle, CheckCircle2, ArrowLeft, ExternalLink, Type, Users, PieChart, ShieldAlert } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function ArticlesOfAmendmentPage() {
  const { secretarialData } = useCorporateSecretary();
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
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={32} style={{ color: '#6366f1' }} />
          Federal Articles of Amendment
        </h1>
      </div>

      <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', padding: '16px 20px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertCircle style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} size={20} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '15px', fontWeight: 600 }}>Important Notice</h4>
          <p style={{ margin: '0 0 8px 0', color: '#92400E', fontSize: '14px', lineHeight: 1.5 }}>
            This service is only available for <strong>federally incorporated corporations</strong>. Provincial corporations must file directly with their respective registries:
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <a href="#" style={{ color: '#B45309', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>Ontario <ExternalLink size={12}/></a>
            <a href="#" style={{ color: '#B45309', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>British Columbia <ExternalLink size={12}/></a>
            <a href="#" style={{ color: '#B45309', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>Alberta <ExternalLink size={12}/></a>
            <a href="#" style={{ color: '#B45309', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>Quebec <ExternalLink size={12}/></a>
          </div>
        </div>
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
        <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
          <strong>Note:</strong> Multiple amendments can be performed in one application. All changes include Government filing, Name Search Report (if applicable), and a Special Shareholders Resolution.
        </p>
      </div>

      {view === 'form' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', overflowX: 'auto' }}>
            {[
              { id: 'name', label: 'Corporation Name', icon: Type },
              { id: 'directors', label: 'Director Limits', icon: Users },
              { id: 'shares', label: 'Share Classes', icon: PieChart },
              { id: 'restrictions', label: 'Restrictions', icon: ShieldAlert }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ 
                  flex: 1, padding: '16px 24px', background: 'transparent', border: 'none', 
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : '#64748B',
                  fontWeight: activeTab === tab.id ? 600 : 500, fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap'
                }}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} style={{ padding: '32px' }}>
            
            {/* NAME CHANGE TAB */}
            {activeTab === 'name' && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0F172A' }}>Change Corporation Name</h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="nameType" value="numbered" checked={nameType === 'numbered'} onChange={(e) => setNameType(e.target.value)} />
                    <span style={{ fontSize: '15px', color: '#334155' }}>Numbered Corporation</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="nameType" value="named" checked={nameType === 'named'} onChange={(e) => setNameType(e.target.value)} />
                    <span style={{ fontSize: '15px', color: '#334155' }}>Named Corporation</span>
                  </label>
                </div>
                
                {nameType === 'named' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>New Corporation Name</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter proposed name" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                    <p style={{ marginTop: '8px', fontSize: '13px', color: '#64748B' }}>A NUANS name search reservation will be required (one-time fee).</p>
                  </div>
                )}
              </div>
            )}

            {/* DIRECTOR LIMITS TAB */}
            {activeTab === 'directors' && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0F172A' }}>Change Min/Max Number of Directors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Minimum number of directors</label>
                    <input type="number" min="1" value={minDirectors} onChange={e => setMinDirectors(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Maximum number of directors</label>
                    <input type="number" min={minDirectors} value={maxDirectors} onChange={e => setMaxDirectors(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                  </div>
                </div>
              </div>
            )}

            {/* SHARE CLASSES TAB */}
            {activeTab === 'shares' && (
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Change Share Classes</h3>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Modify existing share classes or apply a share split multiplier.</p>
                
                {shareClasses.map((sc, index) => (
                  <div key={sc.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Class Name</label>
                      <input type="text" value={sc.name} onChange={e => { const newArr = [...shareClasses]; newArr[index].name = e.target.value; setShareClasses(newArr); }} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }} />
                    </div>
                    <div style={{ width: '150px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Split Multiplier</label>
                      <input type="number" placeholder="e.g. 100" value={sc.multiplier} onChange={e => { const newArr = [...shareClasses]; newArr[index].multiplier = e.target.value; setShareClasses(newArr); }} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }} />
                    </div>
                  </div>
                ))}
                
                <button type="button" style={{ color: '#4F46E5', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', padding: 0 }}>+ Add Share Class</button>
              </div>
            )}

            {/* RESTRICTIONS TAB */}
            {activeTab === 'restrictions' && (
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Restriction on Share Transfers & Other Provisions</h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Restriction on Share Transfers</label>
                  <div style={{ background: '#F1F5F9', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#475569', border: '1px solid #E2E8F0' }}>
                    Any transfer of shares shall be restricted in that no shareholder shall be entitled to transfer any share or shares in the capital of the Corporation without the approval of the directors or shareholders of the Corporation by resolution.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Other Provisions (Private Issuer)</label>
                  <div style={{ background: '#F1F5F9', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#475569', border: '1px solid #E2E8F0' }}>
                    The Corporation is a private issuer and the number of shareholders, exclusive of persons who are in its employment, is limited to not more than 50.
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}>
                Review Changes & Sign Documents
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button onClick={() => setView('form')} style={{ background: 'none', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 500, fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to forms
          </button>

          <div style={{ marginBottom: '24px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0F172A' }}>Review & Sign Documents</h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Please review and sign the Articles of Amendment and the Special Shareholders' Resolution.</p>
          </div>
          
          <ESignaturePanel 
            documentName="Articles of Amendment (Form 4)"
            onSignComplete={onSignComplete}
          />
        </div>
      )}

      {view === 'complete' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '40px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Amendment Initiated</h2>
          <p style={{ margin: '0 auto 24px auto', color: '#475569', fontSize: '15px', maxWidth: '500px', lineHeight: 1.5 }}>
            Your signature has been recorded. The Special Shareholders' Resolution has been sent to all required parties for signature.
          </p>
          
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', maxWidth: '500px', margin: '0 auto 32px auto', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', textTransform: 'uppercase', fontWeight: 600 }}>Next Steps</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', display: 'grid', gap: '8px' }}>
              <li>Once all signatures are collected, the Articles of Amendment will be submitted to Corporations Canada.</li>
              <li>A NUANS search report will be generated automatically if a name change was requested.</li>
              <li>Your dashboard will show the status as "Amendment — Pending" until filed.</li>
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
