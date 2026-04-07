'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MfaChallengePage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const body = useRecovery
      ? { recovery_code: recoveryCode }
      : { code: code.join('') };

    if (!useRecovery && code.join('').length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      router.push(data.redirect || '/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="brand-logo-lg">A</div>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '16px 0 4px' }}>
            Two-Factor Authentication
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
            {useRecovery
              ? 'Enter one of your recovery codes to sign in.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!useRecovery ? (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  style={{
                    width: 48, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700,
                    border: '2px solid #e5e7eb', borderRadius: 12, outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    color: '#111827', background: '#fff',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" htmlFor="recovery-code">Recovery Code</label>
              <input
                id="recovery-code"
                type="text"
                className="form-input"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="XXXX-XXXX"
                style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, letterSpacing: 2 }}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => { setUseRecovery(!useRecovery); setError(''); }}
            style={{
              background: 'none', border: 'none', color: '#6366f1', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            {useRecovery ? 'Use authenticator app instead' : 'Use a recovery code'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/login" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
