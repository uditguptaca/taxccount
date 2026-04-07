'use client';
import { useEffect, useState } from 'react';
import { Building2, Search, MoreVertical, Edit2, Ban, CheckCircle } from 'lucide-react';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(r => r.json())
      .then(data => {
        setOrganizations(data.organizations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter organizations by name or email
  const filteredOrganizations = organizations.filter(org => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (org.name?.toLowerCase().includes(lowerQ) || org.email?.toLowerCase().includes(lowerQ));
  });

  return (
    <div onClick={() => setActiveDropdown(null)}>
      <div className="page-header">
        <h1>Organizations</h1>
        <div className="topbar-search">
          <Search />
          <input 
            type="text" 
            placeholder="Search organizations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : filteredOrganizations.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No organizations found matching "{searchQuery}"</div>
        ) : (
          <div className="data-table-wrapper" style={{ minHeight: '300px' }}>
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
                {filteredOrganizations.map(org => (
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
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: '4px' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === org.id ? null : org.id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeDropdown === org.id && (
                        <div 
                          className="user-dropdown" 
                          style={{ position: 'absolute', right: 20, top: 30, zIndex: 100, width: 160 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="user-dropdown-item" onClick={() => setActiveDropdown(null)}>View Details</button>
                          <button className="user-dropdown-item" onClick={() => setActiveDropdown(null)}>Edit Organization</button>
                          <button className="user-dropdown-item" onClick={() => setActiveDropdown(null)}>Manage Users</button>
                          <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }}></div>
                          <button 
                            className="user-dropdown-item" 
                            style={{ color: '#d97706' }} 
                            onClick={async () => {
                              setActiveDropdown(null);
                              const action = org.status === 'suspended' ? 'activate' : 'suspend';
                              if (confirm(`Are you sure you want to ${action} ${org.name}?`)) {
                                const r = await fetch(`/api/platform/organizations/${org.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action })
                                });
                                if (r.ok) {
                                  setOrganizations(prev => prev.map(o => o.id === org.id ? { ...o, status: action === 'suspend' ? 'suspended' : 'active' } : o));
                                }
                              }
                            }}
                          >
                            {org.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                          </button>
                          <button 
                            className="user-dropdown-item" 
                            style={{ color: '#ef4444' }} 
                            onClick={async () => {
                              setActiveDropdown(null);
                              if (confirm(`CRITICAL WARNING: Are you sure you want to cancel and softly delete ${org.name}?`)) {
                                const r = await fetch(`/api/platform/organizations/${org.id}`, { method: 'DELETE' });
                                if (r.ok) {
                                  setOrganizations(prev => prev.map(o => o.id === org.id ? { ...o, status: 'cancelled' } : o));
                                }
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
