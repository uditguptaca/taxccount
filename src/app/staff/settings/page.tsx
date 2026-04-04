'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, Lock, Bell, Building2, Calendar, Save, CheckCircle, AlertCircle } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'; }

export default function StaffSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  // Edit state
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Notification prefs
  const [notifTaskAssigned, setNotifTaskAssigned] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifDueDates, setNotifDueDates] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/profile?user_id=${user.id}`).then(r => r.json()).then(d => {
      setProfile(d.user);
      setTeams(d.teams || []);
      setPhone(d.user?.phone || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSaveMsg(''); setSaveError('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await fetch('/api/staff/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, phone }),
    });
    if (res.ok) {
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      const data = await res.json();
      setSaveError(data.error || 'Failed to update profile');
    }
  }

  async function changePassword() {
    setSaveMsg(''); setSaveError('');
    if (newPassword !== confirmPassword) { setSaveError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setSaveError('Password must be at least 8 characters'); return; }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await fetch('/api/staff/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, current_password: currentPassword, new_password: newPassword }),
    });
    if (res.ok) {
      setSaveMsg('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      const data = await res.json();
      setSaveError(data.error || 'Failed to change password');
    }
  }

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading settings...</div>;
  if (!profile) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load profile.</div>;

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Settings size={28} /> Settings & Profile</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Manage your profile and preferences</p>
        </div>
      </div>

      {/* Alerts */}
      {saveMsg && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
          <CheckCircle size={16} /> {saveMsg}
        </div>
      )}
      {saveError && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
          <AlertCircle size={16} /> {saveError}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'security', label: 'Security', icon: Lock },
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'teams', label: 'Teams', icon: Building2 },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            <t.icon size={14} style={{ marginRight: 6 }} />{t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header"><h3>Personal Information</h3></div>
          <div className="card-body">
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 'var(--font-size-2xl)'
              }}>
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{profile.first_name} {profile.last_name}</div>
                <div className="text-sm text-muted">{profile.role?.replace(/_/g, ' ')} · Member since {formatDate(profile.created_at)}</div>
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" value={profile.first_name} disabled style={{ background: 'var(--color-gray-50)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={profile.last_name} disabled style={{ background: 'var(--color-gray-50)' }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={profile.email} disabled style={{ background: 'var(--color-gray-50)' }} />
              <span className="text-xs text-muted" style={{ marginTop: 4, display: 'block' }}>Contact your admin to update your email</span>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-primary" onClick={saveProfile}><Save size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header"><h3>Change Password</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password (min 8 chars)" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-primary" disabled={!currentPassword || !newPassword || !confirmPassword} onClick={changePassword}>
                <Lock size={16} /> Change Password
              </button>
            </div>

            {/* MFA Status */}
            <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Two-Factor Authentication</div>
              <div className="text-sm text-muted">
                Status: {profile.mfa_enabled ? (
                  <span className="badge badge-green" style={{ marginLeft: 4 }}>Enabled</span>
                ) : (
                  <span className="badge badge-gray" style={{ marginLeft: 4 }}>Not Enabled</span>
                )}
              </div>
              <div className="text-xs text-muted" style={{ marginTop: 4 }}>Contact your admin to set up MFA for your account.</div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header"><h3>Notification Preferences</h3></div>
          <div className="card-body">
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>Choose which notifications you want to receive.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { label: 'New task assignments', desc: 'Get notified when admin assigns a new task to you', checked: notifTaskAssigned, onChange: setNotifTaskAssigned },
                { label: 'Reminder alerts', desc: 'Receive alerts for personal and system reminders', checked: notifReminders, onChange: setNotifReminders },
                { label: 'Due date warnings', desc: 'Get warned when tasks are approaching their due dates', checked: notifDueDates, onChange: setNotifDueDates },
                { label: 'Email notifications', desc: 'Also send notifications via email (in addition to in-app)', checked: notifEmail, onChange: setNotifEmail },
              ].map((pref, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{pref.label}</div>
                    <div className="text-xs text-muted">{pref.desc}</div>
                  </div>
                  <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                    <input type="checkbox" checked={pref.checked} onChange={e => pref.onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: 12, background: pref.checked ? '#6366f1' : 'var(--color-gray-300)', transition: 'background 0.2s' }}>
                      <span style={{ position: 'absolute', top: 3, left: pref.checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></span>
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
              <button className="btn btn-primary" onClick={() => { setSaveMsg('Notification preferences saved!'); setTimeout(() => setSaveMsg(''), 3000); }}>
                <Save size={16} /> Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {tab === 'teams' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header"><h3>Team Memberships</h3></div>
          <div className="card-body">
            {teams.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {teams.map((t: any, i: number) => (
                  <div key={i} style={{
                    padding: 'var(--space-4)', background: 'var(--color-gray-50)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.team_name}</div>
                        <div className="text-xs text-muted">Role: {t.role_in_team} · Joined {formatDate(t.joined_at)}</div>
                      </div>
                    </div>
                    <span className="badge badge-blue">{t.role_in_team}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>
                <Building2 size={40} style={{ marginBottom: 8 }} />
                <p>No team memberships found.</p>
                <p className="text-sm">Contact your admin to be assigned to a team.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
