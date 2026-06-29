'use client';

import React, { Suspense } from 'react';
import { CorporateSecretaryProvider, useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  Briefcase, Building2, AlertCircle, LayoutDashboard, BookOpen, GitPullRequest,
  Users, UserCog, PieChart, UsersRound, RefreshCw, Landmark, FileText, ShieldCheck
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

function CorporateSecretaryHeader() {
  const { clients, selectedClientId, setSelectedClientId, selectedClient, loading } = useCorporateSecretary();
  const router = useRouter();

  const handleSelectClient = (id: string | null) => {
    setSelectedClientId(id);
    if (id) {
      router.push(`/dashboard/services/corporate-secretary/overview?clientId=${id}`);
    } else {
      router.push('/dashboard/services/corporate-secretary');
    }
  };

  return (
    <div className="cs-header">
      <div className="cs-header-inner">
        <div className="cs-header-brand">
          <div className="cs-header-brand-icon">
            <Briefcase size={18} />
          </div>
          <div>
            <div className="cs-header-brand-text">Corporate Secretary</div>
            <div className="cs-header-brand-sub">Taxccount Pro Services</div>
          </div>
          <div className="cs-header-divider" />
          {loading ? (
            <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading clients...</div>
          ) : (
            <div className="cs-client-select">
              <label>Client:</label>
              <select 
                value={selectedClientId || ''} 
                onChange={e => handleSelectClient(e.target.value || null)}
              >
                <option value="">— Select a company —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedClient && (
          <div className="cs-active-badge">
            <Building2 size={14} />
            <span>{selectedClient.display_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SubNavigationSidebar() {
  const { selectedClientId, corporation } = useCorporateSecretary();
  const pathname = usePathname();

  if (!selectedClientId) return null;

  const tabGroups = [
    { section: 'Main', tabs: [
      { label: 'Overview', path: 'overview', icon: LayoutDashboard },
      { label: 'Minute Book', path: 'minute-book', icon: BookOpen },
    ]},
    { section: 'Governance', tabs: [
      { label: 'Directors', path: 'directors', icon: Users },
      { label: 'Officers', path: 'officers', icon: UserCog },
      { label: 'Shareholders', path: 'shareholders', icon: UsersRound },
    ]},
    { section: 'Equity', tabs: [
      { label: 'Cap Table & Pools', path: 'equity', icon: PieChart },
    ]},
    { section: 'Workflows', tabs: [
      { label: 'Filing Board', path: 'changes', icon: GitPullRequest },
      { label: 'Document Builder', path: 'documents', icon: FileText },
      { label: 'Updates & Cease', path: 'updates', icon: RefreshCw },
      { label: 'Team Roster', path: 'team', icon: Landmark },
    ]},
    { section: 'Compliance', tabs: [
      { label: 'Calendar & Tasks', path: 'compliance', icon: ShieldCheck },
    ]},
  ];

  return (
    <div style={{ 
      width: '260px', 
      background: 'white', 
      borderRight: '1px solid var(--cs-border)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px', 
      padding: '20px 16px', 
      overflowY: 'auto', 
      flexShrink: 0,
      minHeight: '100%'
    }}>
      {/* Mini Company Status Card */}
      {corporation && (
        <div style={{ 
          background: 'var(--cs-surface-hover)', 
          borderRadius: '12px', 
          padding: '12px 14px', 
          border: '1px solid var(--cs-border-light)', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center' 
        }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #6366f1, #8B5CF6)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            fontSize: '15px', 
            flexShrink: 0 
          }}>
            {corporation.legal_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: '13px', 
              color: 'var(--cs-text-primary)', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {corporation.legal_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="cs-badge green" style={{ fontSize: '9px', padding: '1px 6px' }}>
                Compliant
              </span>
              <span style={{ fontSize: '11px', color: 'var(--cs-text-muted)', fontWeight: 500 }}>
                {corporation.jurisdiction.includes('Federal') ? 'Federal' : 'Provincial'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {tabGroups.map((group) => (
          <div key={group.section} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              color: 'var(--cs-text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              paddingLeft: '12px', 
              marginBottom: '4px' 
            }}>
              {group.section}
            </div>
            {group.tabs.map(tab => {
              const fullPath = `/dashboard/services/corporate-secretary/${tab.path}`;
              const isActive = pathname === fullPath;
              return (
                <Link 
                  key={tab.path} 
                  href={`${fullPath}?clientId=${selectedClientId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--cs-accent)' : 'var(--cs-text-secondary)',
                    background: isActive ? 'var(--cs-accent-light)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="cs-sidebar-tab"
                >
                  <tab.icon size={15} style={{ opacity: isActive ? 1 : 0.7 }} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContextEnforcer({ children }: { children: React.ReactNode }) {
  const { selectedClientId } = useCorporateSecretary();
  const pathname = usePathname();

  if (!selectedClientId && pathname !== '/dashboard/services/corporate-secretary') {
    return (
      <div className="cs-empty" style={{ padding: '80px 32px' }}>
        <AlertCircle size={56} style={{ color: '#F59E0B', opacity: 0.6 }} />
        <h3 style={{ fontSize: '22px', marginTop: '16px' }}>No Company Selected</h3>
        <p>Please select a client from the header dropdown to access corporate secretary services.</p>
        <Link href="/dashboard/services/corporate-secretary" className="cs-btn cs-btn-primary" style={{ marginTop: '8px' }}>
          Browse Clients
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

function CorporateSecretaryLayoutContent({ children }: { children: React.ReactNode }) {
  const { selectedClientId } = useCorporateSecretary();

  return (
    <div className="cs-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
      <CorporateSecretaryHeader />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {selectedClientId && <SubNavigationSidebar />}
        <div className="cs-content" style={{ flex: 1, background: 'var(--cs-bg)', minWidth: 0, overflowX: 'hidden' }}>
          <ContextEnforcer>
            {children}
          </ContextEnforcer>
        </div>
      </div>
    </div>
  );
}

export default function CorporateSecretaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="cs-layout">
        <div className="cs-header">
          <div className="cs-header-inner">
            <div className="cs-header-brand">
              <div className="cs-header-brand-icon"><Briefcase size={18} /></div>
              <div>
                <div className="cs-header-brand-text">Corporate Secretary</div>
                <div className="cs-header-brand-sub">Loading...</div>
              </div>
            </div>
          </div>
        </div>
        <div className="cs-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
          <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
        </div>
      </div>
    }>
      <CorporateSecretaryProvider>
        <CorporateSecretaryLayoutContent>{children}</CorporateSecretaryLayoutContent>
      </CorporateSecretaryProvider>
    </Suspense>
  );
}
