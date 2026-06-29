'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { CorporateSecretaryProvider, useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Briefcase, Building2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

function CorporatePortalHeader() {
  const { setSelectedClientId, selectedClient } = useCorporateSecretary();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard to get the client ID
    const urlParams = new URLSearchParams(window.location.search);
    const clientIdParam = urlParams.get('client_id');
    const fetchUrl = clientIdParam ? `/api/portal/dashboard?client_id=${clientIdParam}` : '/api/portal/dashboard';

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (data.client?.id) {
          setSelectedClientId(data.client.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [setSelectedClientId]);

  return (
    <div style={{ background: '#0F172A', borderBottom: '1px solid #1E293B', padding: '16px 32px', color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px 12px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 600 }}>
          <Briefcase size={20} />
          Corporate Client Portal
        </div>
      </div>

      {selectedClient && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1E293B', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px' }}>
          <Building2 size={14} style={{ color: '#10B981' }} />
          <span>Active Company: <strong>{selectedClient.display_name}</strong></span>
        </div>
      )}
    </div>
  );
}

function CorporatePortalSubNav() {
  const { selectedClientId } = useCorporateSecretary();
  const pathname = usePathname();

  if (!selectedClientId) return null;

  const tabs = [
    { label: 'Overview', path: 'home' },
    { label: 'Minute Book', path: 'minute-book' },
    { label: 'Company Info', path: 'company' },
    { label: 'Equity Ledger', path: 'equity' },
    { label: 'Documents', path: 'documents' },
    { label: 'Filing Requests', path: 'requests' },
    { label: 'Compliance', path: 'compliance' }
  ];

  return (
    <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 32px', display: 'flex', gap: '24px', overflowX: 'auto' }}>
      {tabs.map(tab => {
        const fullPath = `/portal/corporate/${tab.path}`;
        const targetUrl = `/portal/corporate/${tab.path}?client_id=${selectedClientId}`;
        const isActive = pathname === fullPath;
        return (
          <Link 
            key={tab.path} 
            href={targetUrl}
            style={{
              padding: '16px 4px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#10B981' : '#64748B',
              textDecoration: 'none',
              borderBottom: isActive ? '2px solid #10B981' : '2px solid transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function CorporatePortalLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <CorporateSecretaryProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', background: '#F8FAFC', width: '100%' }}>
        <CorporatePortalHeader />
        <CorporatePortalSubNav />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </CorporateSecretaryProvider>
  );
}

export default function CorporatePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading Corporate Portal...</div>}>
      <CorporatePortalLayoutContent>{children}</CorporatePortalLayoutContent>
    </Suspense>
  );
}
