'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { TrendingUp, Info } from 'lucide-react';

export default function ClientCorporateEquity() {
  const { shareClasses, capTable, optionPlans, optionGrants } = useCorporateSecretary();

  // Find Class A Common ID
  const classA = shareClasses.find(c => c.name.includes('Class A Common'));
  const totalClassAShares = classA ? Number(classA.issued_count || 1000) : 1000;

  // Calculate Option Plan stats
  const totalReserved = optionPlans.reduce((sum, p) => sum + Number(p.pool_size), 0);
  const totalGranted = optionGrants.reduce((sum, g) => sum + Number(g.quantity), 0);
  const totalAvailable = totalReserved - totalGranted;

  // Exercise Price & Implied Valuation Helper
  const lastPrice = classA ? Number(classA.par_value || 1.00) : 1.00;
  const impliedValuation = totalClassAShares * lastPrice;

  return (
    <div className="cs-grid-2">
      
      {/* Left Side: Cap Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="cs-table-wrap">
          <div className="cs-table-toolbar">
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--cs-text-primary)' }}>Cap Table Breakdown</h2>
          </div>
          
          <table className="cs-table">
            <thead>
              <tr>
                <th>Holder</th>
                <th>Shares</th>
                <th style={{ textAlign: 'right' }}>Issued %</th>
                <th style={{ textAlign: 'right' }}>Fully Diluted %</th>
              </tr>
            </thead>
            <tbody>
              {capTable.map((holder, idx) => {
                const firstClassId = Object.keys(holder.classHoldings || {})[0];
                const quantity = Number(holder.classHoldings?.[firstClassId] || 0);
                const issuedPct = totalClassAShares > 0 ? Math.round((quantity / totalClassAShares) * 100) : 0;
                
                const totalDiluted = totalClassAShares + totalReserved;
                const dilutedPct = totalDiluted > 0 ? Math.round((quantity / totalDiluted) * 100) : 0;

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--cs-text-primary)' }}>{holder.name}</td>
                    <td style={{ color: 'var(--cs-text-secondary)' }}>{quantity.toLocaleString()} Shares</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{issuedPct}%</td>
                    <td style={{ textAlign: 'right', color: 'var(--cs-emerald)', fontWeight: 700 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span>{dilutedPct}%</span>
                        <div className="cs-ownership-bar" style={{ width: '80px', margin: '4px 0 0' }}>
                          <div className="cs-ownership-fill" style={{ width: `${dilutedPct}%`, background: 'linear-gradient(90deg, var(--cs-emerald), #34D399)' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Option Plan Pool Tracker</h2>
          </div>
          <div className="cs-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase' }}>Reserved</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cs-text-primary)', marginTop: '4px' }}>{totalReserved.toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase' }}>Granted</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cs-text-primary)', marginTop: '4px' }}>{totalGranted.toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--cs-surface-hover)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cs-border-light)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase' }}>Available</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cs-emerald)', marginTop: '4px' }}>{totalAvailable.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Side */}
      <div className="cs-card">
        <div className="cs-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--cs-emerald)' }} />
            <h2>Implied Valuation</h2>
          </div>
        </div>
        <div className="cs-card-body">
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--cs-text-primary)', margin: '8px 0' }}>
            ${impliedValuation.toLocaleString()}
          </div>
          
          <div className="cs-alert info" style={{ marginTop: '16px', marginBottom: 0 }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '11px', lineHeight: 1.4 }}>
              <strong>Non-Formal Valuation Disclaimer:</strong> This valuation is an approximation based on the par value or latest recorded transaction. It does not constitute a formal 409A or regulatory business valuation.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
