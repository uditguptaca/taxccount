'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'platform_admin') router.push('/platform');
      else if (data.user.role === 'individual') router.push('/portal');
      else if (data.user.role === 'client') router.push('/portal');
      else if (data.user.role === 'team_member' || data.user.role === 'team_manager') router.push('/staff');
      else router.push('/dashboard');
    } catch { setError('Something went wrong.'); } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="brand-logo-lg">A</div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '16px 0 4px' }}>Welcome back</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Sign in to your Abidebylaw account</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: '12px 0', fontSize: 15, fontWeight: 600 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7280' }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
        </p>
        <div style={{ marginTop: 32, padding: '16px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#9ca3af' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#6b7280' }}>Demo Accounts:</div>
          <div>Platform Admin: platform@abidebylaw.com</div>
          <div>Firm Admin: admin@taxccount.ca</div>
          <div>Staff: emily@taxccount.ca</div>
          <div>Client: james@email.com</div>
          <div>Individual: james.personal@email.com</div>
          <div style={{ marginTop: 4, fontStyle: 'italic' }}>Password: password123</div>
        </div>
      </div>
    </div>
  );
}
