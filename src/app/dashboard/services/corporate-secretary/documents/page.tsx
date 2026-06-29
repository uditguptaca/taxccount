'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  FileText, Search, Clock, FileEdit, ArrowRight, ArrowLeft
} from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';

export default function DocumentsPage() {
  const { selectedClientId, corporation, documents, refreshData } = useCorporateSecretary();
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [view, setView] = useState<'list' | 'create' | 'sign'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/corpsec/templates')
      .then(res => res.json())
      .then(d => {
        if (d.templates) setTemplates(d.templates);
      })
      .catch(console.error);
  }, []);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [templates, searchTerm, selectedCategory]);

  const handleStartCreate = (tpl: any) => {
    setSelectedTemplate(tpl);
    // Pre-populate merge fields from corporate record
    const prefilled: any = {};
    if (corporation) {
      prefilled.companyName = corporation.legal_name || '';
      prefilled.partyA = corporation.legal_name || '';
      prefilled.partyB = 'Acme Corp';
      prefilled.amountPerShare = '$1.50';
      prefilled.paymentDate = new Date().toISOString().split('T')[0];
      prefilled.recordDate = new Date().toISOString().split('T')[0];
    }
    setFormData(prefilled);
    setView('create');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedTemplate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/corpsec/${selectedClientId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          name: `${selectedTemplate.name} - Draft`,
          answers: formData,
          minute_book_section: selectedTemplate.category
        })
      });
      const data = await res.json();
      if (res.ok && data.documentId) {
        setActiveDocId(data.documentId);
        setView('sign');
      } else {
        alert('Failed to save document draft.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSignComplete = async () => {
    setSuccess(true);
    await refreshData();
    setView('list');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div className="cs-page-header">
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={28} style={{ color: 'var(--cs-accent)' }} />
          Smart Document Builder
        </h1>
        <p className="cs-page-subtitle">
          Choose a certified legal template, complete the smart form questionnaire, and send for e-signature.
        </p>
      </div>

      {view === 'list' && (
        <div className="cs-grid-2">
          
          {/* Left: Templates Directory */}
          <div>
            {/* Search + Tabs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div className="cs-table-search" style={{ maxWidth: 'none', flex: 1 }}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search template name..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="cs-section-tabs">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`cs-section-tab${selectedCategory === cat ? ' active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="cs-action-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {filteredTemplates.map(tpl => (
                <div key={tpl.id} className="cs-card cs-card-accent" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-accent)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{tpl.category}</span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cs-text-primary)', margin: '0 0 8px 0' }}>{tpl.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleStartCreate(tpl)}
                    className="cs-btn cs-btn-secondary cs-btn-sm"
                    style={{ marginTop: '16px', alignSelf: 'flex-start' }}
                  >
                    Use Template <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Draft Documents list */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: 'var(--cs-accent)' }} />
                <h2>Draft Documents</h2>
              </div>
            </div>
            <div className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documents.length === 0 ? (
                <div className="cs-empty" style={{ padding: '24px 0' }}>
                  <FileText size={32} />
                  <p>No active document drafts.</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} style={{ padding: '14px', border: '1px solid var(--cs-border-light)', borderRadius: '10px', background: 'var(--cs-surface-hover)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '13px' }}>{doc.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span className="cs-badge gray" style={{ fontSize: '10px' }}>{doc.status}</span>
                      <button 
                        onClick={() => { setActiveDocId(doc.id); setView('sign'); }}
                        className="cs-btn cs-btn-ghost cs-btn-sm"
                        style={{ color: 'var(--cs-accent)', padding: '4px 8px' }}
                      >
                        <FileEdit size={13} /> Sign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {view === 'create' && selectedTemplate && (
        <div className="cs-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="cs-card-header">
            <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', padding: 0 }}>
              <ArrowLeft size={14} /> Back to templates
            </button>
            <h2>Complete Document questionnaire</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedTemplate.id === 'tmpl-nda' && (
              <>
                <div className="cs-form-group">
                  <label className="cs-form-label">Disclosing Party (Party A)</label>
                  <input required type="text" className="cs-form-input" value={formData.partyA} onChange={e => setFormData({ ...formData, partyA: e.target.value })} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-form-label">Recipient Party (Party B)</label>
                  <input required type="text" className="cs-form-input" value={formData.partyB} onChange={e => setFormData({ ...formData, partyB: e.target.value })} />
                </div>
              </>
            )}

            {selectedTemplate.id === 'tmpl-div' && (
              <>
                <div className="cs-form-group">
                  <label className="cs-form-label">Dividend Amount per Share ($)</label>
                  <input required type="text" className="cs-form-input" value={formData.amountPerShare} onChange={e => setFormData({ ...formData, amountPerShare: e.target.value })} />
                </div>
                <div className="cs-form-row">
                  <div className="cs-form-group">
                    <label className="cs-form-label">Record Date</label>
                    <input required type="date" className="cs-form-input" value={formData.recordDate} onChange={e => setFormData({ ...formData, recordDate: e.target.value })} />
                  </div>
                  <div className="cs-form-group">
                    <label className="cs-form-label">Payment Date</label>
                    <input required type="date" className="cs-form-input" value={formData.paymentDate} onChange={e => setFormData({ ...formData, paymentDate: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            {selectedTemplate.id === 'tmpl-bylaws' && (
              <div className="cs-form-group">
                <label className="cs-form-label">Corporation Legal Name</label>
                <input required type="text" className="cs-form-input" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="cs-btn cs-btn-secondary" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" disabled={loading} className="cs-btn cs-btn-primary" style={{ flex: 1 }}>
                {loading ? 'Generating draft...' : 'Generate & Proceed to Sign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView(selectedTemplate ? 'create' : 'list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', marginBottom: '16px' }}>
            <ArrowLeft size={14} /> Back
          </button>
          
          <ESignaturePanel 
            documentName={selectedTemplate ? selectedTemplate.name : 'Generated Document'}
            defaultName={corporation.legal_name}
            onSignComplete={onSignComplete}
          />
        </div>
      )}

    </div>
  );
}
