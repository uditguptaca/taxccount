'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  Settings, Building, FileText, ShieldCheck, Trash2, RefreshCw, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default function UpdatesPage() {
  const { selectedClientId } = useCorporateSecretary();

  const services = [
    {
      title: 'Change Registered Office Address',
      desc: 'Formally update the corporation\'s head office or mailing address with the registry.',
      icon: Building,
      type: 'registered-address',
      color: 'emerald' as const
    },
    {
      title: 'Change Corporation Name',
      desc: 'Submit Articles of Amendment to adopt a new named or numbered corporate identity.',
      icon: FileText,
      type: 'name-change',
      color: 'indigo' as const
    },
    {
      title: 'Adopt/Amend Corporate By-laws',
      desc: 'Draft and adopt new by-laws regulating directors, officers, or banking provisions.',
      icon: Settings,
      type: 'adopt-bylaws',
      color: 'amber' as const
    },
    {
      title: 'CRA Business Registrations',
      desc: 'Register for GST/HST, Payroll Accounts, or Import/Export import numbers.',
      icon: ShieldCheck,
      type: 'cra-registration',
      color: 'cyan' as const
    },
    {
      title: 'Rectification & Reversals',
      desc: 'Revert an erroneous event in the event history with justification for record compliance.',
      icon: RefreshCw,
      type: 'rectification',
      color: 'indigo' as const
    },
    {
      title: 'Corporate Dissolution',
      desc: 'File for voluntary dissolution to shut down the corporation legally.',
      icon: Trash2,
      type: 'dissolution',
      color: 'red' as const
    }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div className="cs-page-header">
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} style={{ color: 'var(--cs-accent)' }} />
          Company Updates Console
        </h1>
        <p className="cs-page-subtitle">
          Formally update corporate structures, register accounts, file amendments, or rectify corporate history logs.
        </p>
      </div>

      {/* Grid of Update Wizards */}
      <div className="cs-action-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div key={idx} className="cs-card cs-card-accent" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div className={`cs-action-icon ${srv.color}`} style={{ marginBottom: '16px' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', margin: '0 0 8px 0' }}>{srv.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, margin: '0 0 20px 0' }}>{srv.desc}</p>
              </div>
              
              <Link 
                href={`/dashboard/services/corporate-secretary/changes?clientId=${selectedClientId}`}
                className="cs-btn cs-btn-secondary cs-btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                Launch Wizard <ArrowRight size={13} style={{ marginLeft: '4px' }} />
              </Link>
            </div>
          );
        })}
      </div>

    </div>
  );
}
