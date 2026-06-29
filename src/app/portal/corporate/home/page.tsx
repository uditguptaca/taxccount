'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  Building2, Users, UserCheck, Shield, Calendar, 
  CheckCircle, Clock, CheckSquare, Square
} from 'lucide-react';

export default function ClientCorporateHome() {
  const { 
    selectedClient, corporation, directors, officers, shareholders, 
    shareClasses, complianceTasks, changes 
  } = useCorporateSecretary();

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
    { label: 'Adopt bylaws & corporate resolutions', done: true }, 
    { label: 'Configure GST/HST & compliance dates', done: !!corporation.business_number }
  ];
  const checklistDoneCount = checklist.filter(item => item.done).length;
  const checklistPct = Math.round((checklistDoneCount / checklist.length) * 100);

  // Get next upcoming compliance task
  const nextTask = complianceTasks.find(t => t.status === 'pending');

  return (
    <div>
      {/* Top Profile Header */}
      <div className="cs-profile-hero" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #065f46 100%)' }}>
        <div className="cs-profile-hero-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Building2 size={24} style={{ color: '#A7F3D0' }} />
              <h1 className="cs-profile-hero-name">{corporation.legal_name}</h1>
              <span className="cs-badge green" style={{ fontSize: '11px', background: 'rgba(52, 211, 153, 0.2)', color: '#A7F3D0' }}>
                {corporation.status}
              </span>
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
        <div className="cs-metric">
          <div className="cs-metric-icon emerald"><Users size={20} /></div>
          <div>
            <div className="cs-metric-label">Directors</div>
            <div className="cs-metric-value">{directors.length}</div>
            <div className="cs-metric-sub">Active Board Members</div>
          </div>
        </div>

        <div className="cs-metric">
          <div className="cs-metric-icon emerald"><UserCheck size={20} /></div>
          <div>
            <div className="cs-metric-label">Officers</div>
            <div className="cs-metric-value">{officers.length}</div>
            <div className="cs-metric-sub">Appointed Positions</div>
          </div>
        </div>

        <div className="cs-metric">
          <div className="cs-metric-icon emerald"><Shield size={20} /></div>
          <div>
            <div className="cs-metric-label">Shareholders</div>
            <div className="cs-metric-value">{shareholders.length}</div>
            <div className="cs-metric-sub">Total Equity Holders</div>
          </div>
        </div>

        <div className="cs-metric">
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
        </div>
      </div>

      {/* Split layout */}
      <div className="cs-grid-equal">
        
        {/* Pending Changes Card */}
        <div className="cs-card">
          <div className="cs-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--cs-emerald)' }} />
              <h2>Active Filing Requests</h2>
            </div>
          </div>
          <div className="cs-card-body">
            {changes.length === 0 ? (
              <div className="cs-empty">
                <CheckCircle size={36} style={{ color: 'var(--cs-emerald)' }} />
                <h3>All filings finalized</h3>
                <p>Your records are fully up to date.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {changes.map((change) => {
                  const signers = JSON.parse(change.signers_json || '[]');
                  const signedCount = signers.filter((s: any) => s.status === 'signed').length;
                  return (
                    <div key={change.id} style={{ padding: '16px', border: '1px solid var(--cs-border-light)', borderRadius: '12px', background: 'var(--cs-surface-hover)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>{change.change_type}</span>
                        <span className="cs-badge amber">{change.status}</span>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--cs-text-muted)', marginBottom: '4px' }}>
                          <span>Signing progress</span>
                          <span>{signedCount} / {signers.length} signed</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--cs-border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--cs-emerald)', width: `${(signedCount / signers.length) * 100}%`, borderRadius: '3px' }} />
                        </div>
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
            <div style={{ height: '8px', background: 'var(--cs-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ height: '100%', background: 'var(--cs-emerald)', width: `${checklistPct}%`, borderRadius: '4px' }} />
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
