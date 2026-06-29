'use client';

import React, { useState, useMemo } from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  Folder, FileText, Search, ShieldCheck, Download, 
  Eye, Clock, AlertTriangle, CheckCircle, Sliders
} from 'lucide-react';

export default function ClientCorporateMinuteBook() {
  const { corporation, minuteBook } = useCorporateSecretary();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [asAtDate, setAsAtDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTravel, setShowTravel] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  const sections = [
    'All',
    'Incorporation',
    'Constating',
    'Directors & Officers',
    'Shares & Securities',
    'Resolutions & Minutes',
    'Registers',
    'Annual Returns & Filings',
    'Agreements',
    'Other/Uploaded'
  ];

  const allItems = useMemo(() => {
    if (!minuteBook) return [];
    const items: any[] = [];

    if (minuteBook.resolutions) {
      minuteBook.resolutions.forEach((r: any) => {
        items.push({
          id: r.id,
          name: `${r.resolution_type.toUpperCase()} Resolution - ${r.effective_date}`,
          date: r.effective_date,
          status: r.status,
          section: r.minute_book_section || 'Resolutions & Minutes',
          type: 'Resolution',
          body: r.body_html
        });
      });
    }

    if (minuteBook.filings) {
      minuteBook.filings.forEach((f: any) => {
        items.push({
          id: f.id,
          name: `${f.filing_type.replace('_', ' ').toUpperCase()} Filing Package`,
          date: f.submitted_date || f.due_date,
          status: f.status,
          section: 'Annual Returns & Filings',
          type: 'Filing',
          body: `<p>Filing status: ${f.status}</p><p>Due Date: ${f.due_date}</p><p>Confirmation Reference: ${f.confirmation_ref || 'Pending'}</p>`
        });
      });
    }

    if (minuteBook.generatedDocuments) {
      minuteBook.generatedDocuments.forEach((d: any) => {
        items.push({
          id: d.id,
          name: d.name,
          date: d.created_at.split('T')[0],
          status: d.status,
          section: d.minute_book_section || 'Agreements',
          type: 'Document',
          body: `<h3>${d.name}</h3><p>Answers: ${d.answers_json}</p><p>Language: ${d.language.toUpperCase()}</p>`
        });
      });
    }

    if (minuteBook.shareCertificates) {
      minuteBook.shareCertificates.forEach((c: any) => {
        items.push({
          id: c.id,
          name: `Share Certificate #${c.certificate_number} - Class A Common`,
          date: c.issue_date,
          status: 'signed',
          section: 'Shares & Securities',
          type: 'Certificate',
          body: `<h3>Share Certificate #${c.certificate_number}</h3><p>Issued to: Holder ID ${c.holder_id}</p><p>Quantity: ${c.quantity} Shares</p>`
        });
      });
    }

    return items;
  }, [minuteBook]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection = selectedSection === 'All' || item.section === selectedSection;
      const matchesDate = !showTravel || item.date <= asAtDate;
      return matchesSearch && matchesSection && matchesDate;
    });
  }, [allItems, searchTerm, selectedSection, asAtDate, showTravel]);

  const completeness = useMemo(() => {
    let score = 75;
    const flags: string[] = [];
    const hasBylaws = allItems.some(i => i.name.toLowerCase().includes('bylaw') || i.name.toLowerCase().includes('règlement'));
    const hasConsents = allItems.some(i => i.name.toLowerCase().includes('consent'));
    const hasReturns = allItems.some(i => i.section === 'Annual Returns & Filings');

    if (hasBylaws) score += 10; else flags.push('Missing Corporate By-Laws');
    if (hasConsents) score += 10; else flags.push('Missing Director Consents to Act');
    if (hasReturns) score += 5; else flags.push('No Annual Returns filed recently');

    return { score: Math.min(score, 100), flags };
  }, [allItems]);

  if (!corporation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
      </div>
    );
  }

  // Ring parameters for SVG completeness gauge
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness.score / 100) * circumference;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title & Time Travel header */}
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Folder size={28} style={{ color: 'var(--cs-emerald)' }} />
            Corporate Minute Book
          </h1>
          <p className="cs-page-subtitle">View and download legal registries, filings, and certificates.</p>
        </div>

        <button 
          onClick={() => setShowTravel(!showTravel)} 
          className={`cs-btn cs-btn-secondary cs-btn-sm ${showTravel ? 'active' : ''}`}
          style={{ 
            background: showTravel ? 'var(--cs-emerald-light)' : 'white', 
            color: showTravel ? 'var(--cs-emerald)' : 'var(--cs-text-secondary)',
            borderColor: showTravel ? 'var(--cs-emerald)' : 'var(--cs-border)'
          }}
        >
          <Sliders size={15} />
          {showTravel ? 'Time Travel: Active' : 'As-At Time Travel'}
        </button>
      </div>

      {showTravel && (
        <div className="cs-alert info" style={{ display: 'block', marginBottom: '24px', background: 'var(--cs-emerald-light)', borderColor: 'var(--cs-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} /> Viewing records &quot;As-At&quot;: <strong>{asAtDate}</strong>
            </span>
            <button 
              onClick={() => { setAsAtDate(new Date().toISOString().split('T')[0]); setShowTravel(false); }} 
              style={{ background: 'transparent', border: 'none', color: '#047857', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset to Present
            </button>
          </div>
          <input 
            type="range" 
            min="2024-01-01" 
            max={new Date().toISOString().split('T')[0]} 
            value={asAtDate} 
            onChange={e => setAsAtDate(e.target.value)}
            style={{ width: '100%', height: '6px', background: '#A7F3D0', borderRadius: '3px', cursor: 'pointer', outline: 'none' }}
          />
        </div>
      )}

      {/* Split Layout */}
      <div className="cs-grid-2">
        
        {/* Left Side */}
        <div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="cs-table-search" style={{ maxWidth: 'none', flex: 1 }}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search documents by name..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="cs-section-tabs">
            {sections.map(sec => (
              <button 
                key={sec} 
                onClick={() => setSelectedSection(sec)}
                className={`cs-section-tab${selectedSection === sec ? ' active' : ''}`}
                style={{
                  background: selectedSection === sec ? 'var(--cs-emerald)' : 'white',
                  borderColor: selectedSection === sec ? 'var(--cs-emerald)' : 'var(--cs-border)'
                }}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="cs-table-wrap">
            {filteredItems.length === 0 ? (
              <div className="cs-empty">
                <FileText size={40} />
                <p>No documents found in this section.</p>
              </div>
            ) : (
              <table className="cs-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Section</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: 'var(--cs-emerald)', flexShrink: 0 }} />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--cs-text-secondary)' }}>{item.section}</td>
                      <td style={{ color: 'var(--cs-text-secondary)' }}>{item.date}</td>
                      <td>
                        <span className={`cs-badge ${item.status === 'signed' ? 'green' : 'gray'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setViewingDoc(item)} 
                            className="cs-btn cs-btn-secondary cs-btn-icon cs-btn-sm"
                            title="Quick View"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="cs-card">
            <div className="cs-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--cs-emerald)' }} />
                <h2>Completeness Score</h2>
              </div>
            </div>
            <div className="cs-card-body">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div className="cs-progress-ring" style={{ width: '110px', height: '110px' }}>
                  <svg width="110" height="110">
                    <circle 
                      cx="55" 
                      cy="55" 
                      r={radius} 
                      className="cs-progress-ring-bg" 
                      strokeWidth={strokeWidth} 
                    />
                    <circle 
                      cx="55" 
                      cy="55" 
                      r={radius} 
                      className="cs-progress-ring-fill" 
                      strokeWidth={strokeWidth} 
                      stroke="var(--cs-emerald)"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <span className="cs-progress-ring-text" style={{ fontSize: '20px' }}>{completeness.score}%</span>
                </div>
              </div>

              {completeness.flags.length > 0 ? (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Action Items Required</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {completeness.flags.map((flag, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--cs-amber)' }}>
                        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="cs-alert success" style={{ margin: 0 }}>
                  <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontWeight: 600 }}>Your minute book is fully compliant!</span>
                </div>
              )}
            </div>
          </div>

          {viewingDoc && (
            <div className="cs-card">
              <div className="cs-card-header" style={{ padding: '16px 20px' }}>
                <h2>Document Preview</h2>
                <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setViewingDoc(null)} style={{ padding: '4px 8px' }}>Close</button>
              </div>
              <div className="cs-card-body" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', maxHeight: '300px', overflowY: 'auto', background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  <div dangerouslySetInnerHTML={{ __html: viewingDoc.body }} />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
