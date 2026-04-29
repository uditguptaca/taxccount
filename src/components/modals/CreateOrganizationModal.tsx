'use client';
import { useState } from 'react';
import { Building2, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrganizationModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    org_type: 'consulting_firm',
    plan: 'free'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const r = await fetch('/api/platform/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to create organization');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Building2 size={24} style={{ color: 'var(--color-primary)' }} />
            New Organization
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Organization Name *</label>
              <input 
                className="form-input" 
                required 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Abidebylaw Consulting"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Email *</label>
              <input 
                className="form-input" 
                type="email"
                required 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="admin@example.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select 
                  className="form-select" 
                  value={form.org_type} 
                  onChange={e => setForm({...form, org_type: e.target.value})}
                >
                  <option value="consulting_firm">Consulting Firm</option>
                  <option value="individual">Individual Practice</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Plan</label>
                <select 
                  className="form-select" 
                  value={form.plan} 
                  onChange={e => setForm({...form, plan: e.target.value})}
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <input 
                className="form-input" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
