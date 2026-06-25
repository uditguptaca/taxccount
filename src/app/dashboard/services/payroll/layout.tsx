'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Edit3, CalendarDays, CalendarClock, FileText, 
  MessageSquare, Users, BarChart3, Building2, Blocks, Settings,
  Bell, HelpCircle
} from 'lucide-react';
import { PayrollProvider, usePayrollClient } from '@/components/Payroll/ClientContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/overview' },
  { id: 'adjustments', label: 'Adjustments', icon: Edit3, path: '/adjustments' },
  { id: 'pay-groups', label: 'Pay groups', icon: CalendarDays, path: '/pay-groups' },
  { id: 'stat-holidays', label: 'Stat holidays', icon: CalendarClock, path: '/stat-holidays' },
  { id: 'roe', label: 'Record of employment', icon: FileText, path: '/roe' },
  { id: 'paystub-memos', label: 'Paystub memos', icon: MessageSquare, path: '/paystub-memos' },
  { id: 'people', label: 'People', icon: Users, path: '/people' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { id: 'company', label: 'Company', icon: Building2, path: '/company' },
  { id: 'addons', label: 'Add-ons', icon: Blocks, path: '/addons' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

function PayrollLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedClientId, selectedClient, setSelectedClientId, loading } = usePayrollClient();

  // If no client is selected, just render the landing page (children)
  if (!selectedClientId) {
    return <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>{children}</div>;
  }

  const basePath = `/dashboard/services/payroll`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Header */}
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '20px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            wagepoint<span style={{ color: '#10B981' }}>›</span>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#CBD5E1', margin: '0 8px' }} />
          <button 
            onClick={() => setSelectedClientId(null)}
            style={{ fontSize: '14px', fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'transparent', border: 'none' }}
          >
            {selectedClient?.display_name || 'Loading client...'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#475569' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} />
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>12</div>
          </div>
          <HelpCircle size={20} style={{ cursor: 'pointer' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden' }}>
              <img src="https://ui-avatars.com/api/?name=Wally+Lane&background=E2E8F0&color=475569" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>Wally Lane</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <div style={{ width: '250px', background: '#F8FAFC', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item, index) => {
            const itemPath = basePath + item.path;
            const isActive = pathname.startsWith(itemPath) && (item.path !== '' || pathname === basePath + '/overview');
            const hasDividerBefore = ['people', 'reports', 'company', 'addons', 'settings'].includes(item.id);
            
            return (
              <React.Fragment key={item.id}>
                {hasDividerBefore && <div style={{ height: '1px', background: '#E2E8F0', margin: '8px 24px' }} />}
                <Link 
                  href={itemPath}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 24px', textDecoration: 'none',
                    color: isActive ? '#0F172A' : '#475569',
                    background: isActive ? '#E2E8F0' : 'transparent',
                    borderLeft: isActive ? '4px solid #3B82F6' : '4px solid transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon size={18} style={{ color: isActive ? '#3B82F6' : '#64748B' }} />
                      {item.label}
                    </div>
                  </div>
                </Link>
                {/* Simulated Sub-menu for Payroll if active */}
                {isActive && item.id === 'overview' && (
                  <div style={{ paddingLeft: '48px', paddingTop: '4px', paddingBottom: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                      Overview
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PayrollWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <PayrollProvider>
      <PayrollLayoutContent>
        {children}
      </PayrollLayoutContent>
    </PayrollProvider>
  );
}
