'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Clock, CheckCircle2, Play, AlertCircle, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PayrollOverviewPage() {
  const router = useRouter();
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  
  const [payGroups, setPayGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (!clientId) return;
    Promise.all([
      fetch(`/api/payroll/${clientId}/pay-groups`),
      fetch(`/api/payroll/${clientId}/stat-holidays`)
    ]);
    // In a real implementation, we would fetch from /api/payroll/${clientId}/pay-groups
    // For now, let's mock some data based on the design
    setTimeout(() => {
      setPayGroups([
        {
          id: '1',
          name: 'Hourly',
          frequency: 'Weekly',
          autoRun: false,
          employeeCount: 2,
          contractorCount: 2,
          payPeriod: 'Feb 11 - Feb 25',
          processingDate: 'Tues, Feb 22',
          payDate: 'Fri, Feb 26'
        },
        {
          id: '2',
          name: 'Bi-weekly',
          frequency: 'Bi-weekly',
          autoRun: true,
          employeeCount: 2,
          contractorCount: 0,
          payPeriod: 'Feb 11 - Feb 25',
          processingDate: 'Tues, Feb 22',
          payDate: 'Fri, Feb 26'
        },
        {
          id: '3',
          name: 'Monthly',
          frequency: 'Monthly',
          autoRun: false,
          employeeCount: 2,
          contractorCount: 0,
          payPeriod: 'Feb 11 - Feb 25',
          processingDate: 'Tues, Feb 22',
          payDate: 'Fri, Feb 26'
        }
      ]);
      setLoading(false);
    }, 500);
  }, [clientId]);

  const handleRunPayroll = (groupId: string) => {
    router.push(`/dashboard/services/payroll/${clientId}/run/${groupId}`);
  };

  if (clientLoading || loading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading dashboard...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Payroll</h1>
      </div>

      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E2E8F0', marginBottom: '32px' }}>
        {['Overview', 'Not approved', 'Approved', 'Finalized'].map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              paddingBottom: '16px', 
              fontSize: '16px', 
              fontWeight: 500,
              color: activeTab === tab ? '#0F172A' : '#64748B',
              borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          {payGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
              <Calendar size={48} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>No pay groups yet</h3>
              <p style={{ color: '#64748B', marginBottom: '24px' }}>Create a pay group to start running payroll.</p>
              <Link 
                href={`/dashboard/services/payroll/${clientId}/pay-groups`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}
              >
                <Plus size={18} /> Create pay group
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {payGroups.map((group) => (
                <div key={group.id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>{group.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '14px' }}>
                        <Clock size={14} /> {group.frequency}
                      </div>
                    </div>
                    <div style={{ cursor: 'pointer', color: '#94A3B8' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Auto-run</span>
                    <div style={{ 
                      padding: '2px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      background: group.autoRun ? '#D1FAE5' : '#F1F5F9',
                      color: group.autoRun ? '#059669' : '#64748B'
                    }}>
                      {group.autoRun ? 'On' : 'Off'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>Employee(s):</span>
                      <span style={{ color: '#475569' }}>{group.employeeCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>Contractor(s):</span>
                      <span style={{ color: '#475569' }}>{group.contractorCount}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#1E293B', minWidth: '120px' }}>Pay period:</span>
                      <span style={{ color: '#475569' }}>{group.payPeriod}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#1E293B', minWidth: '120px' }}>Processing date:</span>
                      <span style={{ color: '#475569' }}>{group.processingDate}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#1E293B', minWidth: '120px' }}>Pay date:</span>
                      <span style={{ color: '#475569' }}>{group.payDate}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleRunPayroll(group.id)}
                      style={{ 
                        background: '#3B82F6', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 24px', 
                        borderRadius: '6px', 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#2563EB'}
                      onMouseOut={e => e.currentTarget.style.background = '#3B82F6'}
                    >
                      Run
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab !== 'Overview' && (
        <div style={{ textAlign: 'center', padding: '64px', color: '#64748B' }}>
          No {activeTab.toLowerCase()} runs found.
        </div>
      )}
    </div>
  );
}
