'use client';
import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Settings2, ShieldCheck, Mail, Save, Calendar, FileText, CheckCircle2, 
  Search, Filter, ChevronRight, X, Clock, HelpCircle, AlertCircle, FileSearch, HardDrive, Key
} from 'lucide-react';
import Link from 'next/link';

export default function OnboardingSettingsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // internal firm users available to be consultants
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    consultant_id: '',
    onboarding_status: 'draft',
    role_type: 'external_consultant',
    internal_notes: '',
    visibility_scopes: {
      documents: true,
      invoices: false,
      chat: true,
      compliance: true
    },
    assigned_clients: [] as string[]
  });

  const loadData = async () => {
    try {
      const res = await fetch('/api/dashboard/onboarding/settings');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
      
      // Load firm team members to populate the assignment dropdown
      const teamRes = await fetch('/api/teams');
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setUsers(teamData.members || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/dashboard/onboarding/settings', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        closeDrawer();
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save rules');
      }
    } catch (e) {
      alert('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const openNewDrawer = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      consultant_id: '',
      onboarding_status: 'draft',
      role_type: 'external_consultant',
      internal_notes: '',
      visibility_scopes: { documents: true, invoices: false, chat: true, compliance: true },
      assigned_clients: []
    });
    setShowDrawer(true);
  };

  const openEditDrawer = (rule: any) => {
    setIsEditing(true);
    setFormData({
      id: rule.id,
      consultant_id: rule.consultant_id,
      onboarding_status: rule.onboarding_status || 'draft',
      role_type: rule.role_type || 'external_consultant',
      internal_notes: rule.internal_notes || '',
      visibility_scopes: rule.visibility_scopes || { documents: true, invoices: false, chat: true, compliance: true },
      assigned_clients: rule.assigned_clients || []
    });
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this consultant configuration?')) return;
    try {
      const res = await fetch(`/api/dashboard/onboarding/settings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = (r.first_name + ' ' + r.last_name).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.onboarding_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="badge badge-green"><span className="badge-dot"></span>Active</span>;
      case 'invited': return <span className="badge badge-blue">Invited</span>;
      case 'pending_setup': return <span className="badge badge-yellow">Pending Setup</span>;
      case 'in_review': return <span className="badge badge-purple">In Review</span>;
      case 'suspended': return <span className="badge badge-red">Suspended</span>;
      case 'archived': return <span className="badge badge-gray">Archived</span>;
      case 'draft': 
      default: return <span className="badge badge-gray">Draft</span>;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'internal_team': return 'Internal Team';
      case 'shared_accountant': return 'Shared External Accountant';
      case 'external_consultant': return 'External Consultant';
      default: return role;
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <Link href="/dashboard/settings" className="text-muted text-sm" style={{ textDecoration: 'none' }}>Settings</Link>
            <ChevronRight size={14} className="text-muted" />
            <span className="text-sm font-medium">Consultant Onboarding</span>
          </div>
          <h1>Onboarding & Permissions Engine</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Configure how external consultants, shared accountants, and advisors access client accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" onClick={openNewDrawer}>
            <UserPlus size={16} /> Setup New Consultant
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: 500, background: 'var(--color-success-light)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle2 size={16} /> Configuration saved successfully.
        </div>
      )}

      {/* Advanced Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-body" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: 12, top: 10 }} />
            <input 
              className="form-input" 
              placeholder="Search consultants by name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Filter size={16} className="text-muted" />
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="invited">Invited</option>
              <option value="pending_setup">Pending Setup</option>
              <option value="active">Active</option>
              <option value="in_review">In Review</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Consultant / Professional</th>
                <th>Role Architecture</th>
                <th>Visibility Scope</th>
                <th>Lifecycle Status</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>Loading engine configs...</td></tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: 'var(--space-12)' }}>
                    <Users size={48} style={{ opacity: 0.2, margin: '0 auto var(--space-4)' }} />
                    <p>No consultant rules matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRules.map((r, i) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div className="topbar-avatar" style={{ width: 36, height: 36, flexShrink: 0, fontSize: 13 }}>
                          {r.first_name?.charAt(0) || '?'}{r.last_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{r.first_name} {r.last_name}</div>
                          <div className="text-xs text-muted">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                        <ShieldCheck size={14} className="text-primary" />
                        {getRoleLabel(r.role_type)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        {r.visibility_scopes?.documents && <span title="Documents Access" style={{ background: 'var(--color-gray-100)', padding: 4, borderRadius: 4 }}><HardDrive size={14} className="text-gray-700" /></span>}
                        {r.visibility_scopes?.compliance && <span title="Compliance Access" style={{ background: 'var(--color-cyan-light)', padding: 4, borderRadius: 4 }}><FileSearch size={14} className="text-cyan" /></span>}
                        {r.visibility_scopes?.invoices && <span title="Invoicing Access" style={{ background: 'var(--color-green-light)', padding: 4, borderRadius: 4 }}><FileText size={14} className="text-success" /></span>}
                        {r.visibility_scopes?.chat && <span title="Communications" style={{ background: 'var(--color-blue-light)', padding: 4, borderRadius: 4 }}><Mail size={14} className="text-blue" /></span>}
                      </div>
                    </td>
                    <td>{getStatusBadge(r.onboarding_status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditDrawer(r)} style={{ marginRight: 'var(--space-2)' }}>Configure</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(r.id)}>Revoke</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Overlay */}
      {showDrawer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end',
          backdropFilter: 'blur(2px)', transition: 'all 0.3s'
        }} onClick={closeDrawer}>
          <div 
            style={{
              width: '100%', maxWidth: 640, backgroundColor: 'white', height: '100%',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
              animation: 'slideInRight 0.3s forwards', borderLeft: '1px solid var(--color-gray-200)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-gray-50)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Settings2 size={22} className="text-primary" />
                  {isEditing ? 'Configure Consultant Matrix' : 'Setup New Consultant'}
                </h2>
                <p className="text-sm text-muted" style={{ margin: '4px 0 0 0' }}>Define onboarding lifecycle, scope rules, and client assignments.</p>
              </div>
              <button className="btn btn-ghost" style={{ padding: 'var(--space-2)' }} onClick={closeDrawer}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
              <form id="onboarding-form" onSubmit={handleSave}>
                
                <h3 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <UserPlus size={14} /> Identity & Lifecycle
                </h3>
                
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', boxShadow: 'none', border: '1px solid var(--color-gray-200)' }}>
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Select System User (Consultant/Advisor) *</label>
                    <select 
                      className="form-select" required disabled={isEditing}
                      value={formData.consultant_id} 
                      onChange={e => setFormData({...formData, consultant_id: e.target.value})}
                    >
                      <option value="">-- Select Member --</option>
                      {users.map((u: any) => (
                        <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name} ({u.email})</option>
                      ))}
                    </select>
                    {!isEditing && <div className="text-xs text-muted" style={{ marginTop: 4 }}>Note: Only active system users can be mapped.</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Onboarding Status</label>
                      <select className="form-select" value={formData.onboarding_status} onChange={e => setFormData({...formData, onboarding_status: e.target.value})}>
                        <option value="draft">Draft (Planning)</option>
                        <option value="invited">Invited (Awaiting Setup)</option>
                        <option value="pending_setup">Pending Setup (Incomplete)</option>
                        <option value="in_review">In Review (Compliance Check)</option>
                        <option value="active">Active (Live Access)</option>
                        <option value="suspended">Suspended (Access Revoked)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Structural Role Mapping</label>
                      <select className="form-select" value={formData.role_type} onChange={e => setFormData({...formData, role_type: e.target.value})}>
                        <option value="internal_team">Internal Team Advisor</option>
                        <option value="shared_accountant">Shared External Accountant</option>
                        <option value="external_consultant">External Consultant</option>
                      </select>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <ShieldCheck size={14} /> Module Visibility Scopes
                </h3>
                
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', boxShadow: 'none', border: '1px solid var(--color-gray-200)' }}>
                  <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>Determine which firm modules this consultant can view for their assigned clients.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', background: formData.visibility_scopes.documents ? 'var(--color-primary-light)' : 'transparent' }}>
                      <input type="checkbox" checked={formData.visibility_scopes.documents} onChange={e => setFormData({...formData, visibility_scopes: {...formData.visibility_scopes, documents: e.target.checked}})} style={{ marginTop: 2, accentColor: 'var(--color-primary)' }} />
                      <div>
                         <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Documents Vault</div>
                         <div className="text-xs text-muted">Can view and upload files.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', background: formData.visibility_scopes.compliance ? 'var(--color-cyan-light)' : 'transparent' }}>
                      <input type="checkbox" checked={formData.visibility_scopes.compliance} onChange={e => setFormData({...formData, visibility_scopes: {...formData.visibility_scopes, compliance: e.target.checked}})} style={{ marginTop: 2, accentColor: 'var(--color-cyan)' }} />
                      <div>
                         <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Compliance Items</div>
                         <div className="text-xs text-muted">Can view legal/tax deadlines.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', background: formData.visibility_scopes.invoices ? 'var(--color-green-light)' : 'transparent' }}>
                      <input type="checkbox" checked={formData.visibility_scopes.invoices} onChange={e => setFormData({...formData, visibility_scopes: {...formData.visibility_scopes, invoices: e.target.checked}})} style={{ marginTop: 2, accentColor: 'var(--color-success)' }} />
                      <div>
                         <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Firm Invoicing</div>
                         <div className="text-xs text-muted">View financial billing lines.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', background: formData.visibility_scopes.chat ? 'var(--color-blue-light)' : 'transparent' }}>
                      <input type="checkbox" checked={formData.visibility_scopes.chat} onChange={e => setFormData({...formData, visibility_scopes: {...formData.visibility_scopes, chat: e.target.checked}})} style={{ marginTop: 2, accentColor: 'var(--color-blue)' }} />
                      <div>
                         <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Communications</div>
                         <div className="text-xs text-muted">Can chat with assigned clients.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <HelpCircle size={14} /> Internal Logistics
                </h3>
                
                <div className="card" style={{ padding: 'var(--space-4)', boxShadow: 'none', border: '1px solid var(--color-gray-200)' }}>
                  <div className="form-group">
                    <label className="form-label">Internal Firm Notes</label>
                    <textarea 
                      className="form-input" rows={3} 
                      placeholder="Notes regarding this consultant's contract, specialties, or limits... (Not visible to clients)"
                      value={formData.internal_notes}
                      onChange={e => setFormData({...formData, internal_notes: e.target.value})}
                    />
                  </div>
                </div>

              </form>
            </div>
            
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', background: 'white' }}>
              <button className="btn btn-secondary" onClick={closeDrawer} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" type="submit" form="onboarding-form" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Deploy Blueprint'}
              </button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}} />
        </div>
      )}
    </>
  );
}
