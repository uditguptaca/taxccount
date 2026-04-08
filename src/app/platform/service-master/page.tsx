'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, MapPin, Building, Briefcase, FileText, Link2, HelpCircle, ClipboardList, AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function ServiceMasterDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/platform/service-master/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Countries', value: stats?.countries, icon: Globe, href: '/platform/service-master/countries', color: '#3b82f6' },
    { label: 'States', value: stats?.states, icon: MapPin, href: '/platform/service-master/countries', color: '#8b5cf6' },
    { label: 'Entity Types', value: stats?.entityTypes, icon: Building, href: '/platform/service-master/entity-types', color: '#06b6d4' },
    { label: 'Departments', value: stats?.departments, icon: Briefcase, href: '/platform/service-master/departments', color: '#10b981' },
    { label: 'Compliance Heads', value: stats?.complianceHeads, icon: FileText, href: '/platform/service-master/compliance-heads', color: '#f59e0b' },
    { label: 'Sub-Compliances', value: stats?.subCompliances, icon: ClipboardList, href: '/platform/service-master/sub-compliances', color: '#ef4444' },
    { label: 'Service Rules', value: stats?.serviceRules, icon: Link2, href: '/platform/service-master/rules', color: '#ec4899' },
    { label: 'Questions', value: stats?.questions, icon: HelpCircle, href: '/platform/service-master/questions', color: '#14b8a6' },
    { label: 'Info Fields', value: stats?.infoFields, icon: ClipboardList, href: '/platform/service-master/info-forms', color: '#a855f7' },
    { label: 'Penalties', value: stats?.penalties, icon: AlertTriangle, href: '/platform/service-master/penalties', color: '#f97316' },
  ];

  const userCards = [
    { label: 'User Profiles', value: stats?.userProfiles, icon: Users, color: '#6366f1' },
    { label: 'Compliance Selections', value: stats?.userSelections, icon: TrendingUp, color: '#22c55e' },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <h1>📋 Service Master</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Manage the compliance catalog that powers the intelligent suggestion engine</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading...</div>
      ) : (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, margin: '24px 0 12px' }}>Catalog Entities</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {cards.map(c => (
              <Link key={c.label} href={c.href} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e5e7eb' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = c.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <c.icon size={20} style={{ color: c.color }} />
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>{c.value ?? '—'}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, fontWeight: 500 }}>{c.label}</div>
                </div>
              </Link>
            ))}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, margin: '32px 0 12px' }}>User Engagement</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {userCards.map(c => (
              <div key={c.label} className="card" style={{ padding: 20, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <c.icon size={20} style={{ color: c.color }} />
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>{c.value ?? '—'}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, fontWeight: 500 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
