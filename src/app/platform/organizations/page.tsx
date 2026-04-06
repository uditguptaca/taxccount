'use client';
import { useEffect, useState } from 'react';
import { Building2, Search, MoreVertical, Edit2, Ban, CheckCircle } from 'lucide-react';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(r => r.json())
      .then(data => {
        setOrganizations(data.organizations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Organizations</h1>
        <div className="topbar-search">
          <Search />
          <input type="text" placeholder="Search organizations..." />
        </div>
      </div>
      
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {organizations.map(org => (
                  <tr key={org.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div className="client-name">{org.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{org.plan} plan • {org.member_count} members</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${org.org_type === 'consulting_firm' ? 'badge-blue' : 'badge-cyan'}`}>
                        {org.org_type === 'consulting_firm' ? 'Firm' : 'Individual'}
                      </span>
                    </td>
                    <td>
                      <div style={{ color: '#111827', fontWeight: 500 }}>{org.email}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{org.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <span className={`badge ${org.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {org.status}
                      </span>
                    </td>
                    <td style={{ color: '#6b7280' }}>
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
