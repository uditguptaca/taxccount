'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [tab, setTab] = useState<'firm'|'individual'>('firm');
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', firm_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: tab }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); return; }
      localStorage.setItem('user', JSON.stringify(data.user));
      if (tab === 'firm') router.push('/dashboard');
      else router.push('/portal');
    } catch { setError('Something went wrong.'); } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: 'none' }}><div className="brand-logo-lg">A</div></Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '16px 0 4px' }}>Get started free</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Create your Abidebylaw account</p>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'firm' ? 'active' : ''}`} onClick={() => setTab('firm')}>I&apos;m a Consulting Firm</button>
          <button className={`auth-tab ${tab === 'individual' ? 'active' : ''}`} onClick={() => setTab('individual')}>I&apos;m an Individual</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {tab === 'firm' && (
            <div className="form-group">
              <label className="form-label">Firm Name *</label>
              <input className="form-input" value={form.firm_name} onChange={e => setForm({...form, firm_name: e.target.value})} placeholder="e.g. Smith & Associates CPA" required />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 8 characters" minLength={8} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12, padding: '12px 0', fontSize: 15, fontWeight: 600 }} disabled={loading}>
            {loading ? 'Creating account...' : tab === 'firm' ? 'Create Firm Account' : 'Create Personal Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7280' }}>
          Already have an account? <Link href="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
