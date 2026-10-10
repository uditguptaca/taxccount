'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  Building2, Users, UserCheck, Shield, Award, Calendar, 
  CheckCircle, Clock, FileText, ArrowRight, CheckSquare, Square,
  TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function CorporateSecretaryOverview() {
  const { 
    selectedClient, corporation, directors, officers, shareholders, 
    shareClasses, optionPlans, complianceTasks, changes, minuteBook, refreshData 
  } = useCorporateSecretary();

  const minuteBookItems = React.useMemo(() => {
    if (!minuteBook) return [];
    const items: any[] = [];
    if (minuteBook.resolutions) {
      minuteBook.resolutions.forEach((r: any) => {
        items.push({ name: `${r.resolution_type.toUpperCase()} Resolution - ${r.effective_date}`, section: r.minute_book_section || 'Resolutions & Minutes' });
      });
    }
    if (minuteBook.filings) {
      minuteBook.filings.forEach((f: any) => {
        items.push({ name: `${f.filing_type.replace('_', ' ').toUpperCase()} Filing Package`, section: 'Annual Returns & Filings' });
      });
    }
    if (minuteBook.generatedDocuments) {
      minuteBook.generatedDocuments.forEach((d: any) => {
        items.push({ name: d.name, section: d.minute_book_section || 'Agreements' });
      });
    }
    if (minuteBook.shareCertificates) {
      minuteBook.shareCertificates.forEach((c: any) => {
        items.push({ name: `Share Certificate #${c.certificate_number} - Class A Common`, section: 'Shares & Securities' });
      });
    }
    return items;
  }, [minuteBook]);

  const completeness = React.useMemo(() => {
    const hasAnyDocs = minuteBookItems.length > 0;
    let score = hasAnyDocs ? 75 : 0;
    const flags: string[] = [];
    if (!hasAnyDocs) flags.push('No documents in Minute Book');
    const hasBylaws = minuteBookItems.some(i => i.name.toLowerCase().includes('bylaw') || i.name.toLowerCase().includes('règlement'));
    const hasConsents = minuteBookItems.some(i => i.name.toLowerCase().includes('consent'));
    const hasReturns = minuteBookItems.some(i => i.section === 'Annual Returns & Filings');
    if (hasBylaws) score += 10; else flags.push('Missing Corporate By-Laws');
    if (hasConsents) score += 10; else flags.push('Missing Director Consents to Act');
    if (hasReturns) score += 5; else flags.push('No Annual Returns filed recently');
    return { score: Math.min(score, 100), flags };
  }, [minuteBookItems]);

  if (!selectedClient || !corporation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
      </div>
    );
  }

  // Calculate setup checklist status
  const checklist = [
    { label: 'Confirm corporate profile & jurisdiction', done: !!corporation.incorporation_number },
    { label: 'Appoint initial directors & officers', done: directors.length > 0 && officers.length > 0 },
    { label: 'Define share classes & issue founder shares', done: shareClasses.length > 0 && shareholders.length > 0 },
    { label: 'Adopt bylaws & corporate resolutions', done: completeness.score >= 85 },
    { label: 'Configure GST/HST & compliance dates', done: !!corporation.business_number }
  ];
  const checklistDoneCount = checklist.filter(item => item.done).length;
  const checklistPct = Math.round((checklistDoneCount / checklist.length) * 100);

  // Get next upcoming compliance task
  const nextTask = complianceTasks.find(t => t.status === 'pending');

  return (
    <div>
      {/* Top Profile Header */}
      <div className="cs-profile-hero">
        <div className="cs-profile-hero-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Building2 size={24} style={{ color: '#8B5CF6' }} />
              <h1 className="cs-profile-hero-name">{corporation.legal_name}</h1>
              {(!corporation.business_number && !corporation.incorporation_date) ? (
                <span className="cs-badge amber" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24' }}>
                  Setup Required
                </span>
              ) : (
                <span className="cs-badge green" style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }}>
                  {corporation.status}
                </span>
              )}
            </div>
            <div className="cs-profile-hero-details">
              <div className="cs-profile-detail">
                <span className="cs-profile-detail-label">Jurisdiction</span>
                <span className="cs-profile-detail-value">{corporation.jurisdiction}</span>
              </div>
              <div className="cs-profile-detail">
                <span className="cs-profile-detail-label">Business Number (BN)</span>
                <span className="cs-profile-detail-value">{corporation.business_number || 'N/A'}</span>
              </div>
              <div className="cs-profile-detail">
                <span className="cs-profile-detail-label">Inc. Date</span>
                <span className="cs-profile-detail-value">{corporation.incorporation_date || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="cs-profile-detail-label">Fiscal Year End</span>
            <span className="cs-profile-detail-value" style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: 'white', marginTop: '4px' }}>
              {corporation.fiscal_year_end ? corporation.fiscal_year_end : '12-31'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Info Tiles */}
      <div className="cs-metrics">
        <Link href={`/dashboard/services/corporate-secretary/directors?clientId=${selectedClient.id}`} className="cs-metric" style={{ textDecoration: 'none' }}>
          <div className="cs-metric-icon indigo"><Users size={20} /></div>
          <div>
            <div className="cs-metric-label">Directors</div>
            <div className="cs-metric-value">{directors.length}</div>
            <div className="cs-metric-sub">Active Board Members</div>
          </div>
        </Link>

        <Link href={`/dashboard/services/corporate-secretary/officers?clientId=${selectedClient.id}`} className="cs-metric" style={{ textDecoration: 'none' }}>
          <div className="cs-metric-icon emerald"><UserCheck size={20} /></div>
          <div>
            <div className="cs-metric-label">Officers</div>
            <div className="cs-metric-value">{officers.length}</div>
            <div className="cs-metric-sub">Appointed Positions</div>
          </div>
        </Link>

        <Link href={`/dashboard/services/corporate-secretary/shareholders?clientId=${selectedClient.id}`} className="cs-metric" style={{ textDecoration: 'none' }}>
          <div className="cs-metric-icon amber"><Shield size={20} /></div>
          <div>
            <div className="cs-metric-label">Shareholders</div>
            <div className="cs-metric-value">{shareholders.length}</div>
            <div className="cs-metric-sub">Total Equity Holders</div>
          </div>
        </Link>

        <Link href={`/dashboard/services/corporate-secretary/equity?clientId=${selectedClient.id}`} className="cs-metric" style={{ textDecoration: 'none' }}>
          <div className="cs-metric-icon cyan"><Award size={20} /></div>
          <div>
            <div className="cs-metric-label">Option Plans</div>
            <div className="cs-metric-value">{optionPlans.length}</div>
            <div className="cs-metric-sub">ESOP Programs Active</div>
          </div>
        </Link>

        <Link href={`/dashboard/services/corporate-secretary/compliance?clientId=${selectedClient.id}`} className="cs-metric" style={{ textDecoration: 'none' }}>
          <div className="cs-metric-icon red"><Calendar size={20} /></div>
          <div>
            <div className="cs-metric-label">Next Obligation</div>
            <div className="cs-metric-value" style={{ fontSize: '14px', minHeight: '31px', display: 'flex', alignItems: 'center' }}>
              {nextTask ? nextTask.title : 'No pending tasks'}
            </div>
            <div className="cs-metric-sub" style={{ color: nextTask ? 'var(--cs-red)' : 'var(--cs-text-muted)', fontWeight: nextTask ? 600 : 400 }}>
              {nextTask ? `Due: ${nextTask.due_date}` : 'Compliant'}
            </div>
          </div>
        </Link>
      </div>

      {/* Main Body Split: Pending Changes & Setup Checklist */}
      <div className="cs-grid-equal">
        
        {/* Pending Changes Card */}
        <div className="cs-card">
          <div className="cs-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--cs-accent)' }} />
              <h2>Pending Corporate Changes</h2>
            </div>
          </div>
          <div className="cs-card-body">
            {changes.length === 0 ? (
              <div className="cs-empty">
                {completeness.score < 100 ? (
                  <>
                    <AlertTriangle size={36} style={{ color: 'var(--cs-amber, #F59E0B)' }} />
                    <h3 style={{ marginTop: '12px' }}>Minute Book is {completeness.score}% complete</h3>
                    <p style={{ margin: '8px 0 12px' }}>{completeness.flags[0] || 'Pending setup items remain.'}</p>
                    <Link href={`/dashboard/services/corporate-secretary/minute-book?clientId=${selectedClient.id}`} className="cs-btn cs-btn-secondary cs-btn-sm">
                      Complete Minute Book
                    </Link>
                  </>
                ) : (
                  <>
                    <CheckCircle size={36} style={{ color: 'var(--cs-emerald)' }} />
                    <h3>All changes finalized & filed</h3>
                    <p>Your minute book is fully up to date (100% complete).</p>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {changes.map((change) => {
                  const parsedSigners = JSON.parse(change.signers_json || '[]');
                  const signers = Array.isArray(parsedSigners) ? parsedSigners : [];
                  const signedCount = signers.filter((s: any) => s.status === 'signed').length;
                  return (
                    <div key={change.id} style={{ padding: '16px', border: '1px solid var(--cs-border-light)', borderRadius: '12px', background: 'var(--cs-surface-hover)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>{change.change_type}</span>
                        <span className="cs-badge amber">{change.status}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--cs-text-muted)', marginBottom: '4px' }}>
                          <span>Signing progress</span>
                          <span>{signedCount} / {signers.length} signatures</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--cs-border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--cs-accent)', width: `${(signedCount / signers.length) * 100}%`, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--cs-border-light)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--cs-text-muted)' }}>Created on {new Date(change.created_at).toLocaleDateString()}</span>
                        <Link 
                          href={`/dashboard/services/corporate-secretary/changes?clientId=${selectedClient.id}`}
                          className="cs-btn cs-btn-ghost cs-btn-sm"
                          style={{ color: 'var(--cs-accent)', fontWeight: 600, padding: '4px 8px' }}
                        >
                          View Checklist <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Setup Checklist Card */}
        <div className="cs-card">
          <div className="cs-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} style={{ color: 'var(--cs-emerald)' }} />
              <h2>Setup Checklist</h2>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cs-emerald)' }}>{checklistPct}%</span>
          </div>
          <div className="cs-card-body">
            {/* Progress bar */}
            <div style={{ height: '8px', background: 'var(--cs-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ height: '100%', background: 'var(--cs-emerald)', width: `${checklistPct}%`, borderRadius: '4px', transition: 'width 0.4s ease' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.done ? (
                    <CheckCircle size={20} style={{ color: 'var(--cs-emerald)', flexShrink: 0 }} />
                  ) : (
                    <Square size={20} style={{ color: 'var(--cs-text-muted)', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '14px', color: item.done ? 'var(--cs-text-muted)' : 'var(--cs-text-primary)', textDecoration: item.done ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
