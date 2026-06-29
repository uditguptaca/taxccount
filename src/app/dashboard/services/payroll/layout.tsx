'use client';

import React, { Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Edit3, CalendarDays, CalendarClock, FileText, 
  MessageSquare, Users, BarChart3, Building2, Blocks, Settings,
  Calculator, Receipt, Files
} from 'lucide-react';
import { PayrollProvider, usePayrollClient } from '@/components/Payroll/ClientContext';

function PayrollHeader() {
  const { clients, selectedClientId, setSelectedClientId, selectedClient, loading } = usePayrollClient();
  const router = useRouter();

  const handleSelectClient = (id: string | null) => {
    setSelectedClientId(id);
    if (id) {
      router.push(`/dashboard/services/payroll/overview?clientId=${id}`);
    } else {
      router.push('/dashboard/services/payroll');
    }
  };

  return (
    <div className="cs-header">
      <div className="cs-header-inner">
        <div className="cs-header-brand">
          <div className="cs-header-brand-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            <Calculator size={18} />
          </div>
          <div>
            <div className="cs-header-brand-text">Payroll Console</div>
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
          <div className="cs-active-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Building2 size={14} style={{ color: '#10B981' }} />
            <span style={{ color: '#34D399' }}>{selectedClient.display_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PayrollSidebar() {
  const { selectedClientId, selectedClient } = usePayrollClient();
  const pathname = usePathname();

  if (!selectedClientId) return null;

  const basePath = `/dashboard/services/payroll`;

  const groups = [
    { section: 'Main', tabs: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/overview' },
    ]},
    { section: 'Pay Runs', tabs: [
      { id: 'adjustments', label: 'Adjustments', icon: Edit3, path: '/adjustments' },
      { id: 'pay-groups', label: 'Pay groups', icon: CalendarDays, path: '/pay-groups' },
      { id: 'stat-holidays', label: 'Stat holidays', icon: CalendarClock, path: '/stat-holidays' },
      { id: 'roe', label: 'Record of Employment', icon: FileText, path: '/roe' },
    ]},
    { section: 'Compliance', tabs: [
      { id: 'remittances', label: 'Remittances', icon: Receipt, path: '/remittances' },
      { id: 'year-end', label: 'Year-End Slips', icon: Files, path: '/year-end' },
      { id: 'paystub-memos', label: 'Paystub memos', icon: MessageSquare, path: '/paystub-memos' },
    ]},
    { section: 'People', tabs: [
      { id: 'people', label: 'Workers', icon: Users, path: '/people' },
      { id: 'company', label: 'Company Profile', icon: Building2, path: '/company' },
    ]},
    { section: 'System', tabs: [
      { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
      { id: 'addons', label: 'Add-ons', icon: Blocks, path: '/addons' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
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
      {selectedClient && (
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
            background: 'linear-gradient(135deg, #10B981, #059669)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            fontSize: '15px', 
            flexShrink: 0 
          }}>
            {selectedClient.display_name.charAt(0).toUpperCase()}
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
              {selectedClient.display_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="cs-badge green" style={{ fontSize: '9px', padding: '1px 6px' }}>
                Payroll Setup
              </span>
              <span style={{ fontSize: '11px', color: 'var(--cs-text-muted)', fontWeight: 500 }}>
                {selectedClient.state_province || 'ON'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {groups.map((group) => (
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
              const fullPath = basePath + tab.path;
              const isActive = pathname.startsWith(fullPath) && (tab.path !== '' || pathname === basePath + '/overview');
              return (
                <Link 
                  key={tab.id} 
                  href={fullPath}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#059669' : 'var(--cs-text-secondary)',
                    background: isActive ? '#E6F4EA' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="cs-sidebar-tab"
                >
                  <tab.icon size={15} style={{ opacity: isActive ? 1 : 0.7, color: isActive ? '#059669' : 'inherit' }} />
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

function PayrollLayoutContent({ children }: { children: React.ReactNode }) {
  const { selectedClientId } = usePayrollClient();

  return (
    <div className="cs-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
      <PayrollHeader />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {selectedClientId && <PayrollSidebar />}
        <div className="cs-content" style={{ flex: 1, background: 'var(--cs-bg)', minWidth: 0, overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PayrollWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="cs-layout">
        <div className="cs-header">
          <div className="cs-header-inner">
            <div className="cs-header-brand">
              <div className="cs-header-brand-icon" style={{ background: '#10B981' }}><Calculator size={18} /></div>
              <div>
                <div className="cs-header-brand-text">Payroll Console</div>
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
      <PayrollProvider>
        <PayrollLayoutContent>{children}</PayrollLayoutContent>
      </PayrollProvider>
    </Suspense>
  );
}
