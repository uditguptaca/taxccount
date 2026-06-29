'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Shield, Plus, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShareholdersPage() {
  const { selectedClientId, shareholders, shareClasses } = useCorporateSecretary();

  // Find Class A Common ID
  const classA = shareClasses.find(c => c.name.includes('Class A Common'));
  const totalClassAShares = classA ? Number(classA.issued_count || 1000) : 1000;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={28} style={{ color: 'var(--cs-accent)' }} />
            Shareholders Register
          </h1>
          <p className="cs-page-subtitle">
            View shareholder ledgers, share classes definitions, and current cap table distributions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            href={`/dashboard/services/corporate-secretary/changes?clientId=${selectedClientId}`}
            className="cs-btn cs-btn-secondary cs-btn-sm"
          >
            <ArrowRightLeft size={15} />
            Transfer Shares
          </Link>
          <Link 
            href={`/dashboard/services/corporate-secretary/changes?clientId=${selectedClientId}`}
            className="cs-btn cs-btn-primary cs-btn-sm"
          >
            <Plus size={15} />
            Issue Shares
          </Link>
        </div>
      </div>

      <div className="cs-grid-2">
        
        {/* Left: Shareholders List */}
        <div className="cs-table-wrap">
          <div className="cs-table-toolbar">
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Shareholder Ledger</h2>
          </div>

          {shareholders.length === 0 ? (
            <div className="cs-empty">
              <Shield size={36} />
              <h3>No Share Issuances</h3>
              <p>No share issuances recorded for this company.</p>
            </div>
          ) : (
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Shareholder Name</th>
                  <th>Share Class</th>
                  <th style={{ textAlign: 'right' }}>Shares Held</th>
                  <th style={{ textAlign: 'right' }}>Ownership %</th>
                </tr>
              </thead>
              <tbody>
                {shareholders.map((sh) => {
                  const firstClassId = Object.keys(sh.classHoldings || {})[0];
                  const sharesCount = Number(sh.classHoldings?.[firstClassId] || 0);
                  const pct = totalClassAShares > 0 ? Math.round((sharesCount / totalClassAShares) * 100) : 0;
                  const className = shareClasses.find(c => c.id === firstClassId)?.name || 'Class A Common';
                  
                  return (
                    <tr key={sh.personId}>
                      <td style={{ fontWeight: 600, color: 'var(--cs-text-primary)' }}>{sh.name}</td>
                      <td style={{ color: 'var(--cs-text-secondary)' }}>{className}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{sharesCount.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: 'var(--cs-accent)', fontWeight: 700 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span>{pct}%</span>
                          <div className="cs-ownership-bar" style={{ width: '80px', margin: '4px 0 0' }}>
                            <div className="cs-ownership-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Share Classes Details */}
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Share Structure</h2>
          </div>
          <div className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shareClasses.map(cls => (
              <div key={cls.id} style={{ padding: '14px', border: '1px solid var(--cs-border-light)', borderRadius: '10px', background: 'var(--cs-surface-hover)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>
                  <span>{cls.name}</span>
                  <span className="cs-badge indigo">{Number(cls.issued_count || 0).toLocaleString()} Issued</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--cs-text-secondary)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Voting: <strong>{cls.is_voting === 1 ? 'Yes' : 'No'}</strong></span>
                  <span>Par Value: <strong>${Number(cls.par_value || 1).toFixed(2)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
