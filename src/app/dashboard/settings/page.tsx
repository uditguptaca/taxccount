'use client';
import { useEffect, useState } from 'react';
import { Building2, Users, FileStack, Bell, Calculator, Link2, Save, CheckCircle2, Network } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('firm');
  const [saved, setSaved] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  
  // Invite Team Member Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ first_name: '', last_name: '', email: '', role: 'team_member', phone: '', team_id: '' });

  // Client Types State
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState('');

  // Integrations State
  const [integrations, setIntegrations] = useState([
    { id: 'cra', name: 'CRA Auto-fill', desc: 'Automatically download T4, T5, and other CRA slips', status: 'connected' },
    { id: 'qbo', name: 'QuickBooks Online', desc: 'Sync invoices and payments with QBO', status: 'available' },
    { id: 'stripe', name: 'Stripe Payments', desc: 'Accept online credit card payments for invoices', status: 'available' },
    { id: 'docusign', name: 'DocuSign', desc: 'Electronic signatures for engagement letters and T183', status: 'available' },
    { id: 'm365', name: 'Microsoft 365', desc: 'Email integration and file storage', status: 'available' },
  ]);

  const [firmProfile, setFirmProfile] = useState({
    name: 'Taxccount Professional Services',
    address: '100 King Street West, Suite 5600',
    city: 'Toronto',
    province: 'Ontario',
    postal_code: 'M5X 1C9',
    phone: '416-555-0100',
    email: 'admin@taxccount.ca',
    website: 'www.taxccount.ca',
    gst_number: '123456789RT0001',
    fiscal_year_end: '2025-12-31',
  });

  const loadTeamsData = () => {
    fetch('/api/teams').then(r => r.json()).then(d => {
      if (d.members) setTeamMembers(d.members);
      if (d.teams) setTeams(d.teams);
    }).catch(() => {});
  };

  const loadClientTypes = () => {
    fetch('/api/settings/client-types').then(r => r.json()).then(d => {
      if (d.types) setClientTypes(d.types);
    }).catch(() => {});
  };

  useEffect(() => { 
    loadTeamsData(); 
    loadClientTypes();
  }, []);

  async function handleSave() {
    await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firmProfile)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/settings/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteForm)
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to invite team member');
      return;
    }
    setShowInviteModal(false);
    setInviteForm({ first_name: '', last_name: '', email: '', role: 'team_member', phone: '', team_id: '' });
    loadTeamsData();
  }

  async function handleAddClientType() {
    if (!newTypeName.trim()) return;
    const res = await fetch('/api/settings/client-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTypeName.trim() })
    });
    if (res.ok) {
      setNewTypeName('');
      loadClientTypes();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add type');
    }
  }

  async function handleDeleteClientType(id: string) {
    if (!confirm('Are you sure you want to remove this client type?')) return;
    const res = await fetch(`/api/settings/client-types?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadClientTypes();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const err = await res.json();
      alert(err.error || 'Cannot remove type in use.');
    }
  }

  const handleConnectIntegration = (id: string, currentStatus: string) => {
    if (currentStatus === 'connected') return;
    
    setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connecting' } : int));
    
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connected' } : int));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  };

  const navItems = [
    { key: 'firm', label: 'Firm Profile', icon: Building2 },
    { key: 'team', label: 'Team Management', icon: Users },
    { key: 'client_types', label: 'Client Types', icon: Network },
    { key: 'templates', label: 'Templates', icon: FileStack },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'tax', label: 'Tax Rates', icon: Calculator },
    { key: 'integrations', label: 'Integrations', icon: Link2 },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>System configuration and preferences</p>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: 500, background: 'var(--color-success-light)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            <CheckCircle2 size={16} /> Changes saved
          </div>
        )}
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={`settings-nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon size={16} /> {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Firm Profile */}
          {activeTab === 'firm' && (
            <div className="card">
              <div className="card-header"><h3>Firm Profile</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Firm Name</label>
                  <input className="form-input" value={firmProfile.name} onChange={e => setFirmProfile({ ...firmProfile, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={firmProfile.address} onChange={e => setFirmProfile({ ...firmProfile, address: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={firmProfile.city} onChange={e => setFirmProfile({ ...firmProfile, city: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <select className="form-select" value={firmProfile.province} onChange={e => setFirmProfile({ ...firmProfile, province: e.target.value })}>
                      <option value="Ontario">Ontario</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Alberta">Alberta</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="New Brunswick">New Brunswick</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input className="form-input" value={firmProfile.postal_code} onChange={e => setFirmProfile({ ...firmProfile, postal_code: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={firmProfile.phone} onChange={e => setFirmProfile({ ...firmProfile, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={firmProfile.email} onChange={e => setFirmProfile({ ...firmProfile, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input className="form-input" value={firmProfile.website} onChange={e => setFirmProfile({ ...firmProfile, website: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST/HST Number</label>
                    <input className="form-input" value={firmProfile.gst_number} onChange={e => setFirmProfile({ ...firmProfile, gst_number: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Fiscal Year End</label>
                  <input className="form-input" type="date" value={firmProfile.fiscal_year_end} onChange={e => setFirmProfile({ ...firmProfile, fiscal_year_end: e.target.value })} style={{ width: 200 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                  <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* Team Management */}
          {activeTab === 'team' && (
            <div className="card">
              <div className="card-header">
                <h3>Team Members</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowInviteModal(true)}><Users size={14} /> Invite Member</button>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Status</th></tr></thead>
                  <tbody>
                    {teamMembers.map((m: any) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="topbar-avatar" style={{ width: 32, height: 32, fontSize: '11px' }}>
                              {m.first_name?.charAt(0)}{m.last_name?.charAt(0)}
                            </div>
                            <span className="client-name">{m.first_name} {m.last_name}</span>
                          </div>
                        </td>
                        <td className="text-sm">{m.email}</td>
                        <td>
                          <span className={`badge ${m.role === 'super_admin' ? 'badge-red' : m.role === 'team_manager' ? 'badge-blue' : 'badge-gray'}`}>
                            {m.role?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-sm">{m.team_name || '—'}</td>
                        <td>
                          <span className={`badge ${m.is_active ? 'badge-green' : 'badge-gray'}`}>
                            <span className="badge-dot"></span>{m.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {teamMembers.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>Loading team members...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Client Types Configuration */}
          {activeTab === 'client_types' && (
            <div className="card">
              <div className="card-header">
                <h3>Client Entity Types</h3>
              </div>
              <div className="card-body">
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-6)' }}>Manage the types of entities your firm works with. These categories appear as options when onboarding a new client and determine workflow constraints.</p>
                
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                  <input className="form-input" placeholder="New Client Type (e.g. Holding Company)" value={newTypeName} onChange={e => setNewTypeName(e.target.value)} style={{ flex: 1, maxWidth: 300 }} onKeyDown={e => e.key === 'Enter' && handleAddClientType()} />
                  <button className="btn btn-primary" onClick={handleAddClientType}>Add Type</button>
                </div>

                <div className="data-table-wrapper" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Entity Type Name</th>
                        <th>Classification</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientTypes.map(ct => (
                        <tr key={ct.id}>
                          <td style={{ fontWeight: 500 }}>{ct.name}</td>
                          <td>
                            {ct.is_system === 1 ? <span className="badge badge-gray">System Default</span> : <span className="badge badge-blue">Custom Entity</span>}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {ct.is_system === 0 && (
                              <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDeleteClientType(ct.id)}>Remove</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {clientTypes.length === 0 && (
                        <tr><td colSpan={3} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>Loading types...</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Templates */}
          {activeTab === 'templates' && (
            <div className="card">
              <div className="card-header"><h3>Compliance Templates</h3></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                  {[
                    { code: 'T1', name: 'T1 Personal Tax Return', price: '$500', category: 'Personal Tax' },
                    { code: 'T2', name: 'T2 Corporate Tax Return', price: '$1,500', category: 'Corporate Tax' },
                    { code: 'GST-HST', name: 'GST/HST Return', price: '$400', category: 'Sales Tax' },
                    { code: 'T4', name: 'T4 Information Return', price: '$350', category: 'Information Returns' },
                    { code: 'BK-MTH', name: 'Monthly Bookkeeping', price: '$600', category: 'Bookkeeping' },
                    { code: 'T3-TRUST', name: 'T3 Trust Return', price: '$1,200', category: 'Personal Tax' },
                  ].map((t, i) => (
                    <div key={i} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <span className="badge badge-cyan">{t.code}</span>
                        <span className="text-sm" style={{ fontWeight: 600, color: 'var(--color-success)' }}>{t.price}</span>
                      </div>
                      <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>{t.name}</h4>
                      <p className="text-xs text-muted">{t.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header"><h3>Notification Preferences</h3></div>
              <div className="card-body">
                {[
                  { label: 'New document uploaded', desc: 'When a client uploads a document to their portal' },
                  { label: 'Invoice payment received', desc: 'When an invoice is paid via any method' },
                  { label: 'Filing deadline approaching', desc: '7, 3, and 1 day reminders before CRA deadlines' },
                  { label: 'New client message', desc: 'When a client sends a message through the portal' },
                  { label: 'Stage transition', desc: 'When an engagement moves to a new stage' },
                  { label: 'Proposal accepted', desc: 'When a client accepts an engagement proposal' },
                ].map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderBottom: i < 5 ? '1px solid var(--color-gray-100)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{n.label}</div>
                      <div className="text-xs text-muted">{n.desc}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)' }} /> Email
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)' }} /> In-app
                      </label>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                  <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Preferences</button>
                </div>
              </div>
            </div>
          )}

          {/* Tax Rates */}
          {activeTab === 'tax' && (
            <div className="card">
              <div className="card-header"><h3>Tax Rates</h3></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                  {[
                    { prov: 'Federal', gst: '5%', pst: '—', combined: '5%' },
                    { prov: 'Ontario', gst: '5%', pst: '8% (HST)', combined: '13%' },
                    { prov: 'British Columbia', gst: '5%', pst: '7%', combined: '12%' },
                    { prov: 'Alberta', gst: '5%', pst: '—', combined: '5%' },
                    { prov: 'Quebec', gst: '5%', pst: '9.975% (QST)', combined: '14.975%' },
                    { prov: 'Manitoba', gst: '5%', pst: '7%', combined: '12%' },
                    { prov: 'Saskatchewan', gst: '5%', pst: '6%', combined: '11%' },
                    { prov: 'Nova Scotia', gst: '5%', pst: '10% (HST)', combined: '15%' },
                  ].map((r, i) => (
                    <div key={i} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>{r.prov}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                        <span>GST: {r.gst}</span><span>PST: {r.pst}</span><span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>Total: {r.combined}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="card">
              <div className="card-header"><h3>Integrations</h3></div>
              <div className="card-body">
                {integrations.map((int, i) => (
                  <div key={int.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderBottom: i < integrations.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{int.name}</div>
                      <div className="text-sm text-muted">{int.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <button 
                        className={`btn ${int.status === 'connected' ? 'btn-secondary' : int.status === 'connecting' ? 'btn-secondary' : 'btn-primary'} btn-sm`} 
                        onClick={() => handleConnectIntegration(int.id, int.status)}
                        disabled={int.status === 'connected' || int.status === 'connecting'}
                      >
                        {int.status === 'connected' ? 'Connected ✓' : int.status === 'connecting' ? 'Connecting...' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleInviteMember}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" required value={inviteForm.first_name} onChange={e => setInviteForm({...inviteForm, first_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" required value={inviteForm.last_name} onChange={e => setInviteForm({...inviteForm, last_name: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" required value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={inviteForm.phone} onChange={e => setInviteForm({...inviteForm, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role *</label>
                    <select className="form-select" required value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})}>
                      <option value="admin">Admin</option>
                      <option value="team_manager">Team Manager</option>
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign to Team</label>
                  <select className="form-select" value={inviteForm.team_id} onChange={e => setInviteForm({...inviteForm, team_id: e.target.value})}>
                    <option value="">No Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
