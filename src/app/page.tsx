'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@taxccount.ca');
  const [password, setPassword] = useState('password123');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const body: any = { email, password };
      if (mfaRequired && mfaCode) {
        body.mfa_code = mfaCode;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      // MFA challenge response
      if (data.mfa_required && !data.user?.id) {
        setMfaRequired(true);
        setError('');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'client') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'var(--color-primary)', borderRadius: 'var(--radius-lg)', color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
            T
          </div>
          <h1>Taxccount</h1>
          <p>Tax & Accounting Firm Management</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!mfaRequired ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <Shield size={48} color="var(--color-primary)" style={{ margin: '0 auto var(--space-3)' }} />
              <h3 style={{ marginBottom: 'var(--space-1)' }}>Two-Factor Authentication</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-4)' }}>
                Enter the 6-digit code from your authenticator app.
              </p>
              <div className="form-group">
                <input
                  id="mfa_code"
                  type="text"
                  className="form-input"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '0.5em', fontWeight: 600, fontFamily: 'monospace' }}
                  autoFocus
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 'var(--space-1)' }}
                onClick={() => { setMfaRequired(false); setMfaCode(''); setError(''); }}
              >
                ← Back to login
              </button>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? 'Signing in...' : mfaRequired ? 'Verify & Sign In' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
          Demo: admin@taxccount.ca / password123
        </p>
      </div>
    </div>
  );
}
