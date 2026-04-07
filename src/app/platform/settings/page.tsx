'use client';
import { useState } from 'react';
import { Settings, Server, Shield, Database } from 'lucide-react';

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1>Global Settings</h1>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { id: 'general', label: 'General', icon: <Settings size={18} /> },
              { id: 'security', label: 'Security & Auth', icon: <Shield size={18} /> },
              { id: 'billing', label: 'Billing Tiers', icon: <Database size={18} /> },
              { id: 'system', label: 'System Logs', icon: <Server size={18} /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  background: activeTab === t.id ? '#eef2ff' : 'transparent',
                  color: activeTab === t.id ? '#4f46e5' : '#4b5563',
                  border: 'none', borderRadius: 6, fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-4)' }}>
              {activeTab === 'general' && 'Platform Configuration'}
              {activeTab === 'security' && 'Global Security Policies'}
              {activeTab === 'billing' && 'SaaS Subscription Tiers'}
              {activeTab === 'system' && 'Infrastructure & Logs'}
            </h2>
            <div style={{ padding: 'var(--space-6)', background: '#f9fafb', borderRadius: 8, border: '1px dashed #d1d5db', textAlign: 'center', color: '#6b7280' }}>
              <Settings size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>System configuration panel is currently locked in the demo environment.</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Super-Admin privileges required to mutate core environment states.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
