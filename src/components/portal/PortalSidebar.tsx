'use client';

import { usePortal } from './PortalContext';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, FileText, Mail, Phone, MapPin } from 'lucide-react';

export default function PortalSidebar() {
  const { data, loading } = usePortal();
  const pathname = usePathname();
  const router = useRouter();

  if (loading || !data || data.error) return <div style={{ width: '230px', flexShrink: 0 }} />;

  const { client, compliances, invoices, docSummary, statusSummary, unreadChats, vaultSummary, consultantSummary } = data;
  const isIndividual = client?.client_type === 'individual';

  // Determine current "tab" from pathname
  // e.g. /portal/documents -> 'documents'
  // /portal -> 'overview' or 'vault_dashboard'
  let currentTab = 'overview';
  if (pathname === '/portal') {
     currentTab = isIndividual ? 'vault_dashboard' : 'overview';
  } else {
     const parts = pathname.split('/');
     currentTab = parts[parts.length - 1]; 
  }

  // Handle click on sidebar item
  const handleNav = (key: string) => {
    // If it's a consultant tab, we might need a special route, or query param
    // For now, let's map keys to routes:
    const routes: Record<string, string> = {
      'overview': '/portal',
      'vault_dashboard': '/portal',
      'compliances': '/portal/compliances',
      'entities': '/portal/entities',
      'communications': '/portal/chats',
      'calendar': '/portal/calendar',
      'invoices': '/portal/invoices',
      'documents': '/portal/documents',
      'requests': '/portal/requests',
      'other_info': '/portal/other-info',
      'vault': '/portal/vault',
      'family': '/portal/vault/family',
      'my_entities': '/portal/vault/entities',
      'vault_calendar': '/portal/vault/calendar',
      'consultants': '/portal/vault/consultants'
    };

    if (key.startsWith('consultant_')) {
      router.push(`/portal/consultants/${key.replace('consultant_', '')}`);
    } else {
      router.push(routes[key] || `/portal`);
    }
  };

  const baseVaultTabs = [
    { key: '_vault_header', label: 'COMPLIANCE VAULT', section: true },
    { key: 'vault_dashboard', label: 'Dashboard', icon: '🏠' },
    { key: 'vault', label: 'Personal Vault', icon: '🛡️' },
    { key: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { key: 'my_entities', label: 'My Entities', icon: '🏢' },
    { key: 'vault_calendar', label: 'Calendar', icon: '📅' },
  ];

  const hasPrimaryFirm = true; 
  const hasExternalConsultants = (consultantSummary || []).length > 0;
  const consultantHeader = (hasPrimaryFirm || hasExternalConsultants) ? [{ key: '_firm_header', label: 'YOUR CONSULTANTS', section: true }] : [];
  const firmTabs = hasPrimaryFirm ? [{ key: 'consultant_taxccount', label: 'Taxccount Advisory', icon: '💼' }] : [];
  
  const consultantTabs = (consultantSummary || []).map((c: any) => ({
    key: `consultant_${c.id}`, label: c.name, icon: '👤'
  }));

  const manageConsultantsTab = [{ key: 'consultants', label: 'Manage Consultants', icon: '➕' }];
  const communicationsSection = [
    { key: '_comms_header', label: 'COMMUNICATIONS', section: true },
    { key: 'communications', label: 'Messages', icon: '💬', badge: unreadChats },
  ];
  const endVaultTabs = [
    { key: '_account_header', label: 'ACCOUNT', section: true },
    { key: 'entities', label: 'Linked Entities', icon: '🔗' },
    { key: 'other_info', label: 'Other Info', icon: 'ℹ️' },
  ];

  const vaultTabs = [...baseVaultTabs, ...consultantHeader, ...firmTabs, ...consultantTabs, ...manageConsultantsTab, ...communicationsSection, ...endVaultTabs];
  const standardTabs = [
    { key: 'overview', label: 'Overview', icon: '🏠' },
    { key: 'compliances', label: 'Compliances', icon: '📋' },
    { key: 'entities', label: 'Linked Entities', icon: '🔗' },
    { key: 'communications', label: 'Communications', icon: '💬' },
    { key: 'calendar', label: 'Calendar', icon: '📅' },
    { key: 'invoices', label: 'Invoices', icon: '💰', badge: invoices?.length },
    { key: 'documents', label: 'Documents', icon: '📄', badge: docSummary?.total_docs },
    { key: 'requests', label: 'Action Requests', icon: '📌', badge: statusSummary?.pending_actions },
    { key: 'other_info', label: 'Other Info', icon: 'ℹ️' },
  ];

  const activeTabs = isIndividual ? vaultTabs : standardTabs;

  const isVaultTab = (key: string) => ['vault','family','my_entities','consultants','vault_dashboard','vault_calendar'].includes(key);
  const isFirmTab = (key: string) => ['compliances','communications','documents','invoices','requests'].includes(key);

  return (
    <div style={{ width: '230px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px', position: 'sticky', top: '24px' }}>
      {isIndividual && (
        <div style={{ padding: '12px 14px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {client.display_name?.substring(0,1).toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.display_name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-500)' }}>Personal Account</div>
          </div>
        </div>
      )}
      {!isIndividual && (
        <div style={{ padding: '0 12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-500)' }}>Portal Menu</span>
        </div>
      )}
      {activeTabs.map(t => {
        if ((t as any).section) {
          const colors: Record<string,string> = { 'COMPLIANCE VAULT': '#7c3aed', 'YOUR CONSULTANTS': '#2563eb', 'COMMUNICATIONS': '#10b981', 'ACCOUNT': '#6b7280' };
          const icons: Record<string,string> = { 'COMPLIANCE VAULT': '🔐', 'YOUR CONSULTANTS': '🏛️', 'COMMUNICATIONS': '💬', 'ACCOUNT': '⚙️' };
          return (
            <div key={t.key} className="vault-sidebar-section">
              <span className="vault-sidebar-section-label" style={{ color: colors[t.label] || 'var(--color-gray-500)' }}>{icons[t.label]} {t.label}</span>
            </div>
          );
        }
        
        let isActive = currentTab === t.key;
        if (t.key === 'communications' && currentTab === 'chats') isActive = true;

        const isVault = isVaultTab(t.key);
        return (
        <button key={t.key}
            style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: isActive ? (isVault ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.08))' : isFirmTab(t.key) ? 'rgba(37,99,235,0.06)' : 'var(--color-gray-100)') : 'transparent',
                color: isActive ? (isVault ? '#7c3aed' : isFirmTab(t.key) ? '#2563eb' : 'var(--color-gray-900)') : 'var(--color-gray-600)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.85rem',
                textAlign: 'left', transition: 'all 0.15s', width: '100%',
                fontFamily: 'var(--font-family)'
            }}
            onClick={() => handleNav(t.key)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{(t as any).icon} {t.label}</span>
          {(t as any).badge != null && (t as any).badge > 0 && <span className="badge" style={{ fontSize: 10, background: isActive ? 'var(--color-primary)' : 'var(--color-gray-200)', color: isActive ? 'white' : 'var(--color-gray-700)' }}>{(t as any).badge}</span>}
        </button>
        );
      })}
    </div>
  );
}
