'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';

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
      
      if (data.mfa_required) {
        router.push('/login/mfa');
        return;
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'platform_admin' || data.user.is_platform_admin) {
        router.push('/platform/service-master');
      } else if (data.user.role === 'individual' || data.user.role === 'client') {
        router.push('/portal/browse-compliances');
      } else if (data.user.role === 'team_member' || data.user.role === 'team_manager') {
        router.push('/staff');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', fontWeight: 'bold', fontSize: 24, marginBottom: 16 }}>A</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>ABIDEBYLAW</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>Internal Platform Access</p>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 6, fontSize: 13, marginBottom: 20, border: '1px solid #f87171' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }} className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, left: 12, color: '#9ca3af' }}><Mail size={18} /></div>
              <input id="email" type="email" style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required />
            </div>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }} className="form-label" htmlFor="password">Password</label>
              <a href="#" style={{ fontSize: 12, color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, left: 12, color: '#9ca3af' }}><Lock size={18} /></div>
              <input id="password" type="password" style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '12px 0', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 32, padding: 20, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Demo Accounts</div>
          
          <button onClick={() => fillDemo('platform@abidebylaw.com', 'password123')} style={demoBtn}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Super Admin</span>
            <span style={{ color: '#94a3b8' }}>platform@abidebylaw.com</span>
          </button>
          
          <button onClick={() => fillDemo('admin@taxccount.ca', 'password123')} style={demoBtn}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Firm Admin</span>
            <span style={{ color: '#94a3b8' }}>admin@taxccount.ca</span>
          </button>
          
          <button onClick={() => fillDemo('james.personal@email.com', 'password123')} style={{ ...demoBtn, marginBottom: 0 }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Standard User</span>
            <span style={{ color: '#94a3b8' }}>james.personal@email.com</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const demoBtn: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  marginBottom: 8,
  textAlign: 'left'
};
