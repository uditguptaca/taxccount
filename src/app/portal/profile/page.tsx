'use client';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Calendar, Shield, Users, AlertCircle, CheckCircle2, Copy, Key } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading profile...</p></div>;
  if (!data || data.error) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load profile</h2></div>;

  const { client, user, contacts, personalInfo } = data;

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1><User size={28} /> My Profile</h1>
      </div>

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
                <span className="portal-profile-detail-value">{client.primary_phone || '—'}</span>
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

        {/* Contacts (Business Clients) */}
        {contacts.length > 0 && (
          <div className="portal-profile-card">
            <h3><Users size={18} /> Associated Contacts</h3>
            <div className="portal-contacts-list">
              {contacts.map((contact: any) => (
                <div key={contact.id} className="portal-contact-item">
                  <div className="portal-contact-avatar">{contact.contact_name?.substring(0, 2).toUpperCase()}</div>
                  <div className="portal-contact-info">
                    <span className="portal-contact-name">
                      {contact.contact_name}
                      {contact.is_primary ? <span className="badge badge-blue" style={{ marginLeft: 8 }}>Primary</span> : null}
                    </span>
                    <span className="portal-contact-meta">
                      {contact.relationship && <>{contact.relationship} · </>}
                      {contact.email || ''} {contact.phone && `· ${contact.phone}`}
                    </span>
                    <div className="portal-contact-perms">
                      {contact.can_login ? <span className="badge badge-green">Can Login</span> : null}
                      {contact.notify ? <span className="badge badge-blue">Receives Notifications</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & MFA */}
        <MfaSetupCard />

        {/* Firm Contact */}
        <div className="portal-profile-card">
          <h3><Building2 size={18} /> Your Firm</h3>
          <div className="portal-profile-detail-list">
            <div className="portal-profile-detail">
              <Building2 size={16} />
              <div>
                <span className="portal-profile-detail-label">Firm Name</span>
                <span className="portal-profile-detail-value">Taxccount Advisory</span>
              </div>
            </div>
            <div className="portal-profile-detail">
              <Phone size={16} />
              <div>
                <span className="portal-profile-detail-label">Phone</span>
                <span className="portal-profile-detail-value">(555) 123-4567</span>
              </div>
            </div>
            <div className="portal-profile-detail">
              <Mail size={16} />
              <div>
                <span className="portal-profile-detail-label">Email</span>
                <span className="portal-profile-detail-value">contact@taxccount.ca</span>
              </div>
            </div>
            <div className="portal-profile-detail">
              <MapPin size={16} />
              <div>
                <span className="portal-profile-detail-label">Address</span>
                <span className="portal-profile-detail-value">123 Finance Way, Suite 400, Toronto, ON M5V 3L9</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
