'use client';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Calendar, Shield, Users, AlertCircle, CheckCircle2, Copy, Key, HardDrive, RefreshCw, Settings, Edit, Plus, Trash, Save, X } from 'lucide-react';

function GoogleDriveIntegrationCard({ connected }: { connected: boolean }) {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(connected);

  const toggleConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isConnected ? 'disconnect' : 'connect' })
      });
      if (res.ok) {
        setIsConnected(!isConnected);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-profile-card">
      <h3><HardDrive size={18} /> Google Drive Integration</h3>
      <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
        Automatically sync your compliance vault documents with a secure folder in your Google Drive.
      </p>

      {isConnected ? (
        <div style={{ padding: 'var(--space-3)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <CheckCircle2 color="#16a34a" size={24} />
          <div>
            <div style={{ fontWeight: 600, color: '#166534' }}>Google Drive Linked</div>
            <div className="text-sm" style={{ color: '#15803d' }}>Files are mirroring automatically using two-way sync.</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 'var(--space-3)', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <HardDrive color="#64748b" size={24} />
          <div>
            <div style={{ fontWeight: 600, color: '#334155' }}>Not Connected</div>
            <div className="text-sm" style={{ color: '#64748b' }}>Connect your Google Workspace.</div>
          </div>
        </div>
      )}

      <button onClick={toggleConnection} disabled={loading} className={`btn ${isConnected ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }}>
        {loading ? <RefreshCw size={16} className="spin" /> : isConnected ? 'Disconnect Google Drive' : 'Connect Google Drive'}
      </button>
    </div>
  );
}

function MfaSetupCard() {
  const [mfaStatus, setMfaStatus] = useState<'unknown' | 'disabled' | 'enabled'>('unknown');
  const [setupData, setSetupData] = useState<any>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState(false);

  useEffect(() => {
    // Check if user has MFA enabled from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.mfa_enabled) {
      setMfaStatus('enabled');
    } else {
      setMfaStatus('disabled');
    }
  }, []);

  const startSetup = async () => {
    setSetupError('');
    try {
      const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSetupData(data);
      } else {
        setSetupError(data.error || 'Failed to start MFA setup');
      }
    } catch {
      setSetupError('Network error');
    }
  };

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) return;
    setVerifying(true);
    setSetupError('');
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      });
      const data = await res.json();
      if (data.verified) {
        setSetupSuccess(true);
        setMfaStatus('enabled');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.mfa_enabled = true;
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        setSetupError(data.error || 'Invalid code');
      }
    } catch {
      setSetupError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="portal-profile-card">
      <h3><Shield size={18} /> Security & Multi-Factor Authentication</h3>
      
      {mfaStatus === 'enabled' && !setupData && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: '#d1fae5', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle2 size={24} color="#059669" />
          <div>
            <div style={{ fontWeight: 600, color: '#065f46' }}>MFA is Active</div>
            <div className="text-sm" style={{ color: '#047857' }}>Your account is protected with two-factor authentication.</div>
          </div>
        </div>
      )}

      {mfaStatus === 'disabled' && !setupData && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: '#fef3c7', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
            <AlertCircle size={24} color="#d97706" />
            <div>
              <div style={{ fontWeight: 600, color: '#92400e' }}>MFA Not Enabled</div>
              <div className="text-sm" style={{ color: '#a16207' }}>Protect your tax documents and financial data with a second security layer.</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={startSetup}>
            <Key size={16} /> Set Up Two-Factor Authentication
          </button>
        </div>
      )}

      {setupData && !setupSuccess && (
        <div>
          <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Step 1:</strong> Add this secret to your authenticator app (Google Authenticator, Authy, etc.):
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
            <code style={{ flex: 1 }}>{setupData.secret}</code>
            <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(setupData.secret)}><Copy size={14} /></button>
          </div>

          <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>
            <strong>Step 2:</strong> Enter the 6-digit code from your authenticator:
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <input
              type="text"
              className="form-input"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '0.3em', fontFamily: 'monospace', maxWidth: 180 }}
            />
            <button className="btn btn-primary" onClick={verifyAndEnable} disabled={verifying || verifyCode.length !== 6}>
              {verifying ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>

          {setupData.recoveryCodes && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div className="text-sm" style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Recovery Codes (save these somewhere safe!):</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-1)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '13px' }}>
                {setupData.recoveryCodes.map((code: string, i: number) => (
                  <div key={i}>{code}</div>
                ))}
              </div>
            </div>
          )}

          {setupError && <div className="login-error" style={{ marginTop: 'var(--space-3)' }}>{setupError}</div>}
        </div>
      )}

      {setupSuccess && (
        <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
          <CheckCircle2 size={48} color="#059669" />
          <h3 style={{ marginTop: 'var(--space-2)', color: '#059669' }}>MFA Successfully Enabled!</h3>
          <p className="text-muted text-sm">You will be prompted for your authenticator code on every login.</p>
        </div>
      )}
    </div>
  );
}

export default function PortalProfile() {
  const [data, setData] = useState<any>(null);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [editProfileForm, setEditProfileForm] = useState({ first_name: '', last_name: '', phone: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [consultantForm, setConsultantForm] = useState<any>({});
  const [savingConsultant, setSavingConsultant] = useState(false);

  const fetchData = async () => {
    try {
      const [profRes, consRes] = await Promise.all([
        fetch('/api/portal/profile'),
        fetch('/api/portal/consultants')
      ]);
      const d = await profRes.json();
      const c = await consRes.json();
      setData(d);
      setConsultants(c.consultants || []);
      if (d.user) {
        setEditProfileForm({
          first_name: d.user.first_name || '',
          last_name: d.user.last_name || '',
          phone: d.user.phone || '',
          email: d.user.email || ''
        });
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileForm)
      });
      if (res.ok) {
        await fetchData();
        setActiveTab('overview');
      } else {
        alert('Failed to update profile');
      }
    } catch (e) {
      alert('Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveConsultant = async () => {
    setSavingConsultant(true);
    try {
      const method = consultantForm.id ? 'PUT' : 'POST';
      const url = consultantForm.id ? `/api/portal/consultants/${consultantForm.id}` : '/api/portal/consultants';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultantForm)
      });
      if (res.ok) {
        await fetchData();
        setShowConsultantModal(false);
      } else {
        alert('Failed to save consultant');
      }
    } catch (e) {
      alert('Error saving consultant');
    } finally {
      setSavingConsultant(false);
    }
  };

  const handleDeleteConsultant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this consultant?')) return;
    try {
      const res = await fetch(`/api/portal/consultants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to delete consultant');
      }
    } catch (e) {
      alert('Error deleting consultant');
    }
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading profile...</p></div>;
  if (!data || data.error) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load profile</h2></div>;

  const { client, user, contacts, personalInfo, org } = data;
  const isPersonal = client.client_code === 'PERSONAL';

  return (
    <div className="portal-page">
      <div className="portal-page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <h1><Settings size={28} /> Profile & Settings</h1>
      </div>

      <div className="portal-tabs" style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <button className={`portal-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} style={{ padding: '0 0 12px 0', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-gray-500)', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
          Overview
        </button>
        <button className={`portal-tab ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')} style={{ padding: '0 0 12px 0', background: 'none', border: 'none', borderBottom: activeTab === 'edit' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'edit' ? 'var(--color-primary)' : 'var(--color-gray-500)', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
          Edit Profile
        </button>
        {isPersonal && (
          <button className={`portal-tab ${activeTab === 'consultants' ? 'active' : ''}`} onClick={() => setActiveTab('consultants')} style={{ padding: '0 0 12px 0', background: 'none', border: 'none', borderBottom: activeTab === 'consultants' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'consultants' ? 'var(--color-primary)' : 'var(--color-gray-500)', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
            Manage Consultants
          </button>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="portal-profile-grid">
          {/* Main Info Card */}
          <div className="portal-profile-card portal-profile-main">
            <div className="portal-profile-avatar-large">
              {client.display_name?.substring(0, 2).toUpperCase()}
            </div>
            <h2>{client.display_name}</h2>
            <span className="badge badge-blue" style={{ marginBottom: 'var(--space-4)' }}>{client.client_type}</span>
            <span className="text-muted text-sm">Client Code: {client.client_code}</span>
          </div>

          {/* Contact Info */}
          <div className="portal-profile-card">
            <h3><Mail size={18} /> Contact Information</h3>
            <div className="portal-profile-detail-list">
              <div className="portal-profile-detail">
                <Mail size={16} />
                <div>
                  <span className="portal-profile-detail-label">Email</span>
                  <span className="portal-profile-detail-value">{client.primary_email || user?.email || '—'}</span>
                </div>
              </div>
              <div className="portal-profile-detail">
                <Phone size={16} />
                <div>
                  <span className="portal-profile-detail-label">Phone</span>
                  <span className="portal-profile-detail-value">{client.primary_phone || user?.phone || '—'}</span>
                </div>
              </div>
              <div className="portal-profile-detail">
                <MapPin size={16} />
                <div>
                  <span className="portal-profile-detail-label">Address</span>
                  <span className="portal-profile-detail-value">
                    {client.city && client.province ? `${client.city}, ${client.province} ${client.postal_code || ''}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          {personalInfo.length > 0 && (
            <div className="portal-profile-card">
              <h3><Shield size={18} /> Personal Details</h3>
              <div className="portal-profile-detail-list">
                {personalInfo.map((info: any) => (
                  <div key={info.id} className="portal-profile-detail">
                    <Calendar size={16} />
                    <div>
                      <span className="portal-profile-detail-label">{info.info_key}</span>
                      <span className="portal-profile-detail-value">{info.info_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & MFA */}
          <MfaSetupCard />

          {/* Google Drive Integration */}
          <GoogleDriveIntegrationCard connected={org?.google_drive_connected === 1} />
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="portal-profile-card" style={{ maxWidth: 600 }}>
          <h3><Edit size={18} /> Edit Your Profile</h3>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>Update your personal and contact details.</p>
          
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input type="text" className="form-input" value={editProfileForm.first_name} onChange={e => setEditProfileForm({...editProfileForm, first_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-input" value={editProfileForm.last_name} onChange={e => setEditProfileForm({...editProfileForm, last_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" value={editProfileForm.phone} onChange={e => setEditProfileForm({...editProfileForm, phone: e.target.value})} />
          </div>
          <div className="form-group" style={{ opacity: 0.6 }}>
            <label className="form-label">Login Email</label>
            <input type="email" className="form-input" value={editProfileForm.email} readOnly />
            <span className="form-hint">Contact support to change your primary login email address.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'consultants' && isPersonal && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3>Your Consultants</h3>
            <button className="btn btn-primary" onClick={() => { setConsultantForm({}); setShowConsultantModal(true); }}>
              <Plus size={16} /> Add Consultant
            </button>
          </div>
          
          {consultants.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <Users size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: 8, fontSize: 18 }}>No Consutlants Found</h3>
              <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>Add your trusted advisors to keep track of who manages what in your compliance vault.</p>
              <button className="btn btn-primary" onClick={() => { setConsultantForm({}); setShowConsultantModal(true); }}>
                <Plus size={16} /> Add Consultant
              </button>
            </div>
          ) : (
            <div className="portal-contacts-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {consultants.map((c: any) => (
                <div key={c.id} className="portal-profile-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="portal-contact-avatar" style={{ background: '#2563eb', color: 'white', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {c.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</div>
                        <div style={{ fontSize: 13, color: '#6b7280', textTransform: 'capitalize' }}>
                          {(c.specialty || 'General').replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="portal-profile-detail-list" style={{ flex: 1 }}>
                    {c.company && (
                      <div className="portal-profile-detail" style={{ padding: '6px 0' }}>
                        <Building2 size={14} color="#6b7280" /> <span style={{ fontSize: 13 }}>{c.company}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="portal-profile-detail" style={{ padding: '6px 0' }}>
                        <Mail size={14} color="#6b7280" /> <span style={{ fontSize: 13 }}>{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="portal-profile-detail" style={{ padding: '6px 0' }}>
                        <Phone size={14} color="#6b7280" /> <span style={{ fontSize: 13 }}>{c.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid #e5e7eb' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setConsultantForm(c); setShowConsultantModal(true); }}><Edit size={14} /> Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={() => handleDeleteConsultant(c.id)}><Trash size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Consultant Modal */}
      {showConsultantModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="modal-content" style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0 }}>{consultantForm.id ? 'Edit Consultant' : 'Add Consultant'}</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowConsultantModal(false)}><X size={20} color="#6b7280" /></button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-input" value={consultantForm.name || ''} onChange={e => setConsultantForm({ ...consultantForm, name: e.target.value })} placeholder="John Doe" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <select className="form-input" value={consultantForm.specialty || 'General'} onChange={e => setConsultantForm({ ...consultantForm, specialty: e.target.value })}>
                  <option value="tax_advisor">Tax Advisor</option>
                  <option value="legal_expert">Legal Expert</option>
                  <option value="financial_planner">Financial Planner</option>
                  <option value="insurance_broker">Insurance Broker</option>
                  <option value="real_estate_agent">Real Estate Agent</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input type="text" className="form-input" value={consultantForm.company || ''} onChange={e => setConsultantForm({ ...consultantForm, company: e.target.value })} placeholder="ABC Firm" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={consultantForm.email || ''} onChange={e => setConsultantForm({ ...consultantForm, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" value={consultantForm.phone || ''} onChange={e => setConsultantForm({ ...consultantForm, phone: e.target.value })} placeholder="555-0199" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={3} value={consultantForm.notes || ''} onChange={e => setConsultantForm({ ...consultantForm, notes: e.target.value })} placeholder="Handles my real estate closings..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button className="btn btn-ghost" onClick={() => setShowConsultantModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveConsultant} disabled={savingConsultant || !consultantForm.name}>
                {savingConsultant ? 'Saving...' : 'Save Consultant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
