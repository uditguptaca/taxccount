'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Building2, Users, UserCheck } from 'lucide-react';

export default function ClientCorporateCompanyInfo() {
  const { corporation, directors, officers } = useCorporateSecretary();

  if (!corporation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Registered & Records Offices */}
      <div className="cs-card" style={{ marginBottom: '24px' }}>
        <div className="cs-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} style={{ color: 'var(--cs-emerald)' }} />
            <h2>Registered Registry Address</h2>
          </div>
        </div>
        <div className="cs-card-body">
          <div className="cs-grid-equal" style={{ gap: '24px' }}>
            <div>
              <span className="cs-profile-detail-label">Registered Office Address</span>
              <p style={{ fontSize: '15px', color: 'var(--cs-text-primary)', fontWeight: 600, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                {corporation.registered_office || 'No address registered.'}
              </p>
            </div>
            <div>
              <span className="cs-profile-detail-label">Records Office Address</span>
              <p style={{ fontSize: '15px', color: 'var(--cs-text-primary)', fontWeight: 600, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                {corporation.records_office || 'No address registered.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="cs-grid-equal">
        
        {/* Directors List */}
        <div className="cs-card">
          <div className="cs-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--cs-emerald)' }} />
              <h2>Active Board of Directors</h2>
            </div>
          </div>
          <div className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {directors.map(d => (
              <div key={d.id} style={{ padding: '14px', border: '1px solid var(--cs-border-light)', borderRadius: '10px', background: 'var(--cs-surface-hover)' }}>
                <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>{d.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--cs-text-secondary)', marginTop: '4px' }}>{d.address}</div>
                <div style={{ fontSize: '12px', color: 'var(--cs-text-muted)', marginTop: '2px' }}>Appointed: {d.appointed_date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Officers List */}
        <div className="cs-card">
          <div className="cs-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} style={{ color: 'var(--cs-emerald)' }} />
              <h2>Active Corporate Officers</h2>
            </div>
          </div>
          <div className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {officers.map(o => (
              <div key={o.id} style={{ padding: '14px', border: '1px solid var(--cs-border-light)', borderRadius: '10px', background: 'var(--cs-surface-hover)' }}>
                <span className="cs-badge green" style={{ fontSize: '10px', display: 'inline-block', marginBottom: '6px' }}>{o.title || o.position}</span>
                <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>{o.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--cs-text-muted)', marginTop: '2px' }}>Appointed: {o.appointed_date}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
