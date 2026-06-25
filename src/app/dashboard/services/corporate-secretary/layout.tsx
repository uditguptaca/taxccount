'use client';

import React from 'react';
import { CorporateSecretaryProvider, useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Briefcase, Building2, AlertCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

function CorporateSecretaryHeader() {
  const { clients, selectedClientId, setSelectedClientId, selectedClient, loading } = useCorporateSecretary();
  const pathname = usePathname();

  // Show the banner on all pages
  return (
    <div style={{ background: '#0F172A', borderBottom: '1px solid #1E293B', padding: '16px 32px', color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 600 }}>
          <Briefcase size={20} />
          Corporate Secretary
        </div>
        <div style={{ width: '1px', height: '24px', background: '#334155' }} />
        {loading ? (
          <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading clients...</div>
        ) : selectedClientId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>Select Client:</span>
            <select 
              value={selectedClientId || ''} 
              onChange={e => setSelectedClientId(e.target.value || null)}
              style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', outline: 'none', cursor: 'pointer', minWidth: '250px' }}
            >
              <option value="">-- Choose a company --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.display_name} {c.client_type ? `(${c.client_type})` : ''}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {selectedClient && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1E293B', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px' }}>
          <Building2 size={14} style={{ color: '#10B981' }} />
          <span>Active Context: <strong>{selectedClient.display_name}</strong></span>
        </div>
      )}
    </div>
  );
}

function ContextEnforcer({ children }: { children: React.ReactNode }) {
  const { selectedClientId } = useCorporateSecretary();
  const pathname = usePathname();

  // Don't block the main overview page if no client is selected, 
  // but block the individual service pages.
  if (!selectedClientId && pathname !== '/dashboard/services/corporate-secretary') {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <AlertCircle size={48} style={{ color: '#F59E0B', margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>No Client Selected</h2>
        <p style={{ color: '#4B5563', fontSize: '16px' }}>
          Please select a client from the dropdown menu in the header above to proceed with this corporate secretary service.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function CorporateSecretaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <CorporateSecretaryProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', background: '#F8FAFC' }}>
        <CorporateSecretaryHeader />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ContextEnforcer>
            {children}
          </ContextEnforcer>
        </div>
      </div>
    </CorporateSecretaryProvider>
  );
}
