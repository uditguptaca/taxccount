'use client';
import { useEffect, useState } from 'react';
import { Building2, Search, MoreVertical, Edit2, Ban, CheckCircle, Plus } from 'lucide-react';
import CreateOrganizationModal from '@/components/modals/CreateOrganizationModal';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  function load() {
    setLoading(true);
    fetch('/api/platform/stats')
      .then(r => r.json())
      .then(data => {
        setOrganizations(data.organizations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="topbar-search">
            <Search />
            <input 
              type="text" 
              placeholder="Search organizations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> New Organization
          </button>
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
                          <button className="user-dropdown-item" onClick={() => { setSelectedOrg(org); setActiveDropdown(null); }}>View Details</button>
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
      {showCreateModal && (
        <CreateOrganizationModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            load();
          }} 
        />
      )}

      {selectedOrg && (
        <div className="modal-overlay" onClick={() => setSelectedOrg(null)} style={{ zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ height: '100vh', margin: 0, borderRadius: 0, width: '100%', maxWidth: '400px', animation: 'slideInRight 0.3s ease' }} role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="modal-header">
              <h2 id="detail-title">Organization Details</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrg(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '24px 0', borderBottom: '1px solid #f3f4f6', marginBottom: '24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Building2 size={32} />
                </div>
                <h3 style={{ fontSize: '20px', margin: 0 }}>{selectedOrg.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>{selectedOrg.org_type?.replace('_', ' ')} • {selectedOrg.plan} plan</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Contact Information</label>
                  <p style={{ margin: 0, fontWeight: 500 }}>{selectedOrg.email}</p>
                  <p style={{ margin: 0, color: '#6b7280' }}>{selectedOrg.phone || 'No phone provided'}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Membership</label>
                  <p style={{ margin: 0 }}>{selectedOrg.member_count} active members</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Account Status</label>
                  <span className={`badge ${selectedOrg.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{selectedOrg.status}</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Joined Date</label>
                  <p style={{ margin: 0 }}>{new Date(selectedOrg.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: 'auto' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedOrg(null)}>Close Panel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
