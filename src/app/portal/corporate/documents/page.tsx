'use client';

import React, { useState } from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Clock, FileEdit, ArrowLeft } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';

export default function ClientCorporateDocuments() {
  const { corporation, documents, refreshData } = useCorporateSecretary();
  
  const [view, setView] = useState<'list' | 'sign'>('list');
  const [activeDoc, setActiveDoc] = useState<any | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSign = (doc: any) => {
    setActiveDoc(doc);
    setView('sign');
    setSuccess(false);
  };

  const onSignComplete = async () => {
    setSuccess(true);
    await refreshData();
    setView('list');
  };

  if (!corporation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
      </div>
    );
  }

  return (
    <div>
      
      {view === 'list' ? (
        <div className="cs-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="cs-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: 'var(--cs-emerald)' }} />
              <h2>Pending Documents Awaiting Signature</h2>
            </div>
          </div>

          <div className="cs-card-body">
            {success && (
              <div className="cs-alert success" style={{ marginBottom: '16px' }}>
                <span style={{ fontWeight: 600 }}>✓ Document signed successfully and saved to Minute Book!</span>
              </div>
            )}

            {documents.filter(d => d.status !== 'signed').length === 0 ? (
              <div className="cs-empty" style={{ padding: '24px 0' }}>
                <Clock size={32} />
                <p>No documents awaiting your signature.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {documents.filter(d => d.status !== 'signed').map(doc => (
                  <div key={doc.id} style={{ padding: '16px', border: '1px solid var(--cs-border-light)', borderRadius: '12px', background: 'var(--cs-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>{doc.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--cs-text-secondary)', marginTop: '4px' }}>Section: {doc.minute_book_section}</div>
                    </div>
                    <button 
                      onClick={() => handleSign(doc)}
                      className="cs-btn cs-btn-primary cs-btn-sm"
                    >
                      <FileEdit size={13} style={{ marginRight: '4px' }} /> E-Sign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', marginBottom: '16px', paddingLeft: 0 }}>
            <ArrowLeft size={14} /> Back to documents
          </button>
          
          <ESignaturePanel 
            documentName={activeDoc ? activeDoc.name : 'Generated Document'}
            defaultName={corporation.legal_name}
            onSignComplete={onSignComplete}
          />
        </div>
      )}

    </div>
  );
}
