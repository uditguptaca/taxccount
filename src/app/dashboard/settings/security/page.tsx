'use client';
import { useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Smartphone, Key, Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SetupState = 'idle' | 'loading' | 'qr_ready' | 'verifying' | 'complete' | 'error';

export default function SecuritySettingsPage() {
  const [state, setState] = useState<SetupState>('idle');
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);

  async function initSetup() {
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setState('error'); return; }
      setSecret(data.secret);
      setOtpauthUri(data.otpauthUri);
      setRecoveryCodes(data.recoveryCodes);
      setState('qr_ready');
    } catch {
      setError('Failed to initialize MFA setup');
      setState('error');
    }
  }

  async function verifyAndEnable() {
    if (verifyCode.length !== 6) { setError('Enter the full 6-digit code'); return; }
    setState('verifying');
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setState('qr_ready'); return; }
      setState('complete');
    } catch {
      setError('Verification failed');
      setState('qr_ready');
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyRecoveryCodes() {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: 560, margin: '0 auto',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4,
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 640, margin: '0 auto' }}>
      <Link href="/dashboard/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Settings
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Security Settings</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Manage two-factor authentication</p>
        </div>
      </div>

      {/* Status Card */}
      {state === 'idle' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <ShieldAlert size={28} color="#f59e0b" />
            <div>
              <div style={sectionTitle}>Two-Factor Authentication</div>
              <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Add an extra layer of security to your account</p>
            </div>
          </div>
          <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Two-factor authentication (2FA) adds a second verification step when you log in. After entering your password,
            you&apos;ll need to provide a 6-digit code from an authenticator app like <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong>.
          </p>
          <button onClick={initSetup} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 15, fontWeight: 600 }}>
            <Smartphone size={18} style={{ marginRight: 8 }} /> Enable Two-Factor Authentication
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Generating your secret key...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* QR Code Ready — Step 1: Scan */}
      {state === 'qr_ready' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>1</div>
            <div style={sectionTitle}>Scan QR Code</div>
          </div>
          <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Open your authenticator app and scan this QR code. If you can&apos;t scan, enter the secret key manually.
          </p>

          {/* QR Code placeholder — the otpauth URI is what authenticator apps need */}
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 20, border: '1px solid #e5e7eb' }}>
            <div style={{ width: 180, height: 180, background: '#fff', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d1d5db', flexDirection: 'column', gap: 8 }}>
              <Smartphone size={40} color="#9ca3af" />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Scan with app</span>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Or enter this secret key manually:</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <code style={{ background: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700, letterSpacing: 2, border: '1px solid #e5e7eb', color: '#111827' }}>
                {secret}
              </code>
              <button onClick={copySecret} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} color="#6b7280" />}
              </button>
            </div>
          </div>

          {/* Step 2: Verify */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>2</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Verify Setup</div>
          </div>
          <p style={{ color: '#374151', fontSize: 14, marginBottom: 16 }}>Enter the 6-digit code shown in your authenticator app:</p>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={{
                flex: 1, padding: '12px 16px', fontSize: 20, fontWeight: 700, letterSpacing: 6,
                textAlign: 'center', border: '2px solid #e5e7eb', borderRadius: 12, outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
            />
            <button
              onClick={verifyAndEnable}
              className="btn btn-primary"
              disabled={verifyCode.length !== 6}
              style={{ padding: '12px 24px', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {state === 'verifying' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Verifying your code...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Success */}
      {state === 'complete' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>2FA Enabled Successfully!</h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Your account is now protected with two-factor authentication.</p>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Key size={18} color="#d97706" />
              <strong style={{ fontSize: 14, color: '#92400e' }}>Save Your Recovery Codes</strong>
            </div>
            <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5, marginBottom: 12 }}>
              Store these codes somewhere safe. Each code can only be used once. If you lose access to your authenticator app, these are your only way back in.
            </p>
            <button
              onClick={() => setCodesRevealed(!codesRevealed)}
              style={{ background: '#fff', border: '1px solid #fbbf24', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#92400e' }}
            >
              {codesRevealed ? 'Hide Codes' : 'Reveal Recovery Codes'}
            </button>
          </div>

          {codesRevealed && (
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {recoveryCodes.map((code, i) => (
                  <code key={i} style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 14, fontWeight: 600, textAlign: 'center', border: '1px solid #e5e7eb', color: '#111827' }}>
                    {code}
                  </code>
                ))}
              </div>
              <button onClick={copyRecoveryCodes} style={{ marginTop: 12, background: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy all codes</>}
              </button>
            </div>
          )}

          <Link href="/dashboard/settings" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '12px 0', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
            Done
          </Link>
        </div>
      )}

      {state === 'error' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Setup Failed</h2>
            <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 20 }}>{error}</p>
            <button onClick={initSetup} className="btn btn-primary" style={{ padding: '10px 20px' }}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
