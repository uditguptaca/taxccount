'use client';
import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, Activity } from 'lucide-react';

export default function PlatformDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch('/api/platform/stats').then(r => r.json()).then(setStats).catch(() => {}); }, []);

  return (
    <div>
      <div className="page-header"><h1>Platform Dashboard</h1></div>
      <div className="kpi-grid">
        {[
          { label: 'Total Organizations', value: stats?.totalOrgs ?? '—', icon: <Building2 size={22} />, cls: 'blue' },
          { label: 'Consulting Firms', value: stats?.totalFirms ?? '—', icon: <TrendingUp size={22} />, cls: 'green' },
          { label: 'Individual Users', value: stats?.totalIndividuals ?? '—', icon: <Users size={22} />, cls: 'yellow' },
          { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: <Activity size={22} />, cls: 'red' },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className={`kpi-icon ${k.cls}`}>{k.icon}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>
      {stats?.organizations && (
        <div className="card">
          <div className="card-header"><h3>All Organizations</h3></div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Type</th><th>Plan</th><th>Status</th><th>Members</th><th>Created</th></tr></thead>
              <tbody>
                {stats.organizations.map((org: any) => (
                  <tr key={org.id}>
                    <td className="client-name">{org.name}</td>
                    <td><span className={`badge ${org.org_type === 'consulting_firm' ? 'badge-blue' : 'badge-cyan'}`}>{org.org_type === 'consulting_firm' ? 'Firm' : 'Individual'}</span></td>
                    <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{org.plan}</span></td>
                    <td><span className={`badge ${org.status === 'active' ? 'badge-green' : 'badge-red'}`}>{org.status}</span></td>
                    <td>{org.member_count}</td>
                    <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(org.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
