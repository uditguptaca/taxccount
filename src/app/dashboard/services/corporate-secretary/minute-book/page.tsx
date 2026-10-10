'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  Folder, FileText, Search, Calendar, ShieldCheck, Download, 
  Eye, Clock, AlertTriangle, CheckCircle, Sliders
} from 'lucide-react';
import Link from 'next/link';

const defaultStartDate = new Date('2024-01-01');
const getDaysOffset = (dateStr: string, sd: Date) => {
  const d = new Date(dateStr);
  const diffTime = d.getTime() - sd.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const getDateFromOffset = (offset: number, sd: Date) => {
  const d = new Date(sd);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const renderDocumentPreviewHtml = (doc: any) => {
  if (doc.type === 'Certificate') {
    return `
      <div style="border: 6px double #d4af37; padding: 32px; background: #fffdf5; color: #1a1a1a; font-family: 'Georgia', serif; text-align: center; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin: 0 auto; max-width: 600px;">
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #b8860b; margin-bottom: 4px;">SHARE CERTIFICATE</div>
        <div style="font-size: 11px; color: #666; margin-bottom: 24px; letter-spacing: 1px;">ORGANIZED UNDER THE LAWS OF CANADA</div>
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 20px;">MAPLE LEAF CONSULTING INC.</div>
        <div style="font-size: 14px; line-height: 1.6; margin-bottom: 30px; padding: 0 10px;">
          This certifies that <strong style="font-size: 16px; border-bottom: 1px solid #1a1a1a; padding-bottom: 2px; min-width: 150px; display: inline-block;">Jane Thompson</strong> is the registered holder of <strong style="font-size: 16px; border-bottom: 1px solid #1a1a1a; padding-bottom: 2px; min-width: 60px; display: inline-block;">600</strong> Class A Common Shares in the capital of the Corporation, transferable only on the books of the Corporation.
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 16px; font-size: 11px; text-align: left;">
          <div>
            <div style="font-style: italic; color: #3b82f6; height: 24px;">Jane Thompson</div>
            <strong>President & CEO</strong>
          </div>
          <div style="text-align: right;">
            <div>Certificate No: <strong>TX-A-001</strong></div>
            <div>Date: <strong>2024-01-15</strong></div>
          </div>
        </div>
      </div>
    `;
  }
  
  if (doc.type === 'Resolution') {
    return `
      <div style="font-family: 'Times New Roman', Times, serif; line-height: 1.6; color: #222; background: white; padding: 32px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 650px; margin: 0 auto; text-align: left; border: 1px solid #ddd;">
        <h3 style="text-align: center; margin-bottom: 6px; font-size: 16px; font-weight: bold; text-transform: uppercase;">RESOLUTIONS OF THE DIRECTORS OF</h3>
        <h2 style="text-align: center; margin-top: 0; margin-bottom: 24px; font-size: 18px; font-weight: bold; text-transform: uppercase;">MAPLE LEAF CONSULTING INC.</h2>
        <div style="margin-bottom: 20px; font-size: 14px;"><strong>EFFECTIVE DATE:</strong> ${doc.date}</div>
        <div style="margin-bottom: 20px; font-size: 14px; text-align: justify;">
          <strong>WHEREAS</strong> the board has reviewed the proposed change and resolved that the following action is in the best interests of the Corporation;
        </div>
        <div style="margin-bottom: 24px; font-size: 14px; text-align: justify;">
          <strong>RESOLVED THAT</strong> ${doc.name} is hereby authorized, ratified, and approved in all respects, and any officer or director is authorized to execute all registry documents.
        </div>
        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 12px; display: flex; justify-content: space-between; font-size: 12px;">
          <div>
            <div>Signed: <span style="font-style: italic; color: #3b82f6; font-weight: 600;">Jane Thompson</span></div>
            <div>Title: Director</div>
          </div>
          <div>
            <div>Date: ${doc.date}</div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left;">
      <h3 style="margin-top: 0; margin-bottom: 12px; color: #0f172a; font-size: 16px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">${doc.name}</h3>
      <div style="font-size: 14px; color: #475569;">
        ${doc.body}
      </div>
    </div>
  `;
};

export default function MinuteBookPage() {
  const { selectedClientId, corporation, minuteBook } = useCorporateSecretary();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [asAtDate, setAsAtDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTravel, setShowTravel] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  const startDate = corporation?.incorporation_date ? new Date(corporation.incorporation_date) : defaultStartDate;

  const totalDays = useMemo(() => {
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [startDate]);

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

  // Derive all items in the minute book from resolutions, filings, generated docs, etc.
  const allItems = useMemo(() => {
    if (!minuteBook) return [];

    const items: any[] = [];

    // Add Resolutions
    if (minuteBook.resolutions) {
      minuteBook.resolutions.forEach((r: any) => {
        items.push({
          id: r.id,
          name: `${r.resolution_type.toUpperCase()} Resolution - ${r.effective_date}`,
          date: r.effective_date,
          status: r.status, // draft, finalized, signed
          section: r.minute_book_section || 'Resolutions & Minutes',
          type: 'Resolution',
          body: r.body_html
        });
      });
    }

    // Add Filings
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

    // Add Generated Documents
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

    // Add Share Certificates
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

  // Filter items based on search term, section, and as-at time travel date
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection = selectedSection === 'All' || item.section === selectedSection;
      const matchesDate = !showTravel || item.date <= asAtDate;
      return matchesSearch && matchesSection && matchesDate;
    });
  }, [allItems, searchTerm, selectedSection, asAtDate, showTravel]);

  // Compute completeness score
  const completeness = useMemo(() => {
    const hasAnyDocs = allItems.length > 0;
    let score = hasAnyDocs ? 75 : 0;
    const flags: string[] = [];
    if (!hasAnyDocs) flags.push('No documents in Minute Book');

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
            <Folder size={28} style={{ color: 'var(--cs-accent)' }} />
            Corporate Minute Book
          </h1>
          <p className="cs-page-subtitle">
            All corporate documents, resolutions, filings, and certificates for <strong>{corporation.legal_name}</strong>.
          </p>
        </div>

        <button 
          onClick={() => setShowTravel(!showTravel)} 
          className={`cs-btn cs-btn-secondary cs-btn-sm ${showTravel ? 'active' : ''}`}
          style={{ 
            background: showTravel ? 'var(--cs-accent-light)' : 'white', 
            color: showTravel ? 'var(--cs-accent)' : 'var(--cs-text-secondary)',
            borderColor: showTravel ? 'var(--cs-accent)' : 'var(--cs-border)'
          }}
        >
          <Sliders size={15} />
          {showTravel ? 'Time Travel: Active' : 'As-At Time Travel'}
        </button>
      </div>

      {/* Time Travel Slider Control */}
      {showTravel && (
        <div className="cs-alert info" style={{ display: 'block', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} /> Viewing records "As-At": <strong>{asAtDate}</strong>
            </span>
            <button 
              onClick={() => { setAsAtDate(new Date().toISOString().split('T')[0]); setShowTravel(false); }} 
              style={{ background: 'transparent', border: 'none', color: 'var(--cs-accent)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset to Present
            </button>
          </div>
          <input 
            type="range" 
            min={0} 
            max={totalDays} 
            value={getDaysOffset(asAtDate, startDate)} 
            onChange={e => setAsAtDate(getDateFromOffset(parseInt(e.target.value), startDate))}
            style={{ width: '100%', height: '6px', background: 'var(--cs-border)', borderRadius: '3px', cursor: 'pointer', outline: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--cs-text-muted)', marginTop: '6px' }}>
            <span>{corporation?.incorporation_date ? `Inc. (${new Date(corporation.incorporation_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : 'Earliest'}</span>
            <span>Current Date</span>
          </div>
        </div>
      )}

      {/* Split Layout */}
      <div className="cs-grid-2">
        
        {/* Left Side Container */}
        <div>
          {/* Search + Section Tabs */}
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

          {/* Horizontal scrollable Section filter tabs */}
          <div className="cs-section-tabs">
            {sections.map(sec => (
              <button 
                key={sec} 
                onClick={() => setSelectedSection(sec)}
                className={`cs-section-tab${selectedSection === sec ? ' active' : ''}`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Documents Table */}
          <div className="cs-table-wrap">
            {filteredItems.length === 0 ? (
              <div className="cs-empty">
                <FileText size={40} />
                <h3>No documents found</h3>
                <p>No documents match the current filters.</p>
              </div>
            ) : (
              <table className="cs-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Section</th>
                    <th>Effective Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: 'var(--cs-accent)', flexShrink: 0 }} />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--cs-text-secondary)' }}>{item.section}</td>
                      <td style={{ color: 'var(--cs-text-secondary)' }}>{item.date}</td>
                      <td>
                        <span className={`cs-badge ${item.status === 'signed' ? 'green' : item.status === 'finalized' ? 'blue' : 'gray'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="cs-btn cs-btn-secondary cs-btn-icon cs-btn-sm"
                            onClick={() => setViewingDoc(item)} 
                            title="Quick View"
                          >
                            <Eye size={13} />
                          </button>
                          <button 
                            className="cs-btn cs-btn-secondary cs-btn-icon cs-btn-sm"
                            onClick={() => alert('PDF download is currently in mock format. The document will download to your system.')}
                            title="Download PDF"
                          >
                            <Download size={13} />
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

        {/* Right Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Completeness Meter Card */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--cs-emerald)' }} />
                <h2>Completeness Score</h2>
              </div>
            </div>
            <div className="cs-card-body">
              {/* Score circle */}
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

          {/* Quick View Sidebar block */}
          {viewingDoc && (
            <div className="cs-card">
              <div className="cs-card-header" style={{ padding: '16px 20px' }}>
                <h2>Document Preview</h2>
                <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setViewingDoc(null)} style={{ padding: '4px 8px' }}>Close</button>
              </div>
              <div className="cs-card-body" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', maxHeight: '400px', overflowY: 'auto', background: '#f8fafc', padding: '8px', borderRadius: '10px', border: '1px solid var(--cs-border-light)' }}>
                  <div dangerouslySetInnerHTML={{ __html: renderDocumentPreviewHtml(viewingDoc) }} />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
