'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Overview Page Crash:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px', textAlign: 'center' }}>
      <div style={{ background: 'var(--cs-red-light, #fee2e2)', color: 'var(--cs-red, #ef4444)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <AlertCircle size={32} />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cs-text-primary, #0f172a)', marginBottom: '8px' }}>Something went wrong!</h2>
      <p style={{ color: 'var(--cs-text-secondary, #475569)', maxWidth: '400px', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
        We encountered an error loading the Corporate Secretary overview page. This might be due to incomplete or malformed company registry data.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={reset}
          className="cs-btn cs-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={14} /> Try Again
        </button>
        <Link href="/dashboard" className="cs-btn cs-btn-secondary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
