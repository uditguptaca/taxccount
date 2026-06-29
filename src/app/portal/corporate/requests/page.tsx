'use client';

import React, { useState } from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { FileText, Clock, Plus, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ClientCorporateRequests() {
  const { selectedClientId, corporation, changes, refreshData } = useCorporateSecretary();
  
  const [view, setView] = useState<'list' | 'create'>('list');
  const [changeType, setChangeType] = useState('registered-address');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const payload: any = { details };
      if (changeType === 'registered-address') {
        payload.address = details;
      } else if (changeType === 'name-change') {
        payload.new_name = details;
      }

      const res = await fetch(`/api/corpsec/${selectedClientId}/changes/${changeType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        setView('list');
        setDetails('');
        await refreshData();
      } else {
        alert('Failed to submit filing request.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!corporation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
      </div>
    );
  }

  return (
    <div>
      
      {/* Title Header */}
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={28} style={{ color: 'var(--cs-emerald)' }} />
            Filing & Change Requests
          </h1>
          <p className="cs-page-subtitle">
            Submit corporate structure change requests to Taxccount Pro Services.
          </p>
        </div>

        {view === 'list' && (
          <button 
            onClick={() => { setView('create'); setSuccess(false); }} 
            className="cs-btn cs-btn-primary cs-btn-sm"
            style={{ background: 'var(--cs-emerald)', borderColor: 'var(--cs-emerald)' }}
          >
            <Plus size={15} />
            Request a Change
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="cs-grid-2">
          
          {/* Requests List */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: 'var(--cs-emerald)' }} />
                <h2>Active Filing History</h2>
              </div>
            </div>

            <div className="cs-card-body" style={{ padding: 0 }}>
              {success && (
                <div className="cs-alert success" style={{ margin: '16px 20px 0' }}>
                  <span style={{ fontWeight: 600 }}>✓ Filing request submitted. Our team will review the details and prepare resolutions.</span>
                </div>
              )}

              {changes.length === 0 ? (
                <div className="cs-empty">
                  <Clock size={32} />
                  <p>No active change requests submitted.</p>
                </div>
              ) : (
                <div className="cs-person-grid" style={{ gridTemplateColumns: '1fr', gap: 0 }}>
                  {changes.map(change => (
                    <div key={change.id} className="cs-person-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', borderBottom: '1px solid var(--cs-border-light)', borderRadius: 0, padding: '16px 20px' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>{change.change_type}</div>
                        <div style={{ fontSize: '12px', color: 'var(--cs-text-muted)', marginTop: '4px' }}>Requested: {new Date(change.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className={`cs-badge ${change.status === 'confirmed' ? 'green' : 'amber'}`}>
                        {change.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--cs-emerald)' }} />
                <h2>Important Notice</h2>
              </div>
            </div>
            <div className="cs-card-body">
              <p style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Requests submitted through this portal are received by our corporate secretarial team. We will draft the legally required resolutions and send them for board signature within 24 hours.
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className="cs-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="cs-card-header">
            <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', padding: 0 }}>
              <ArrowLeft size={14} /> Back to history
            </button>
            <h2>Request a Corporate Change</h2>
          </div>

          <form onSubmit={handleRequestChange} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="cs-form-group">
              <label className="cs-form-label">Type of Change</label>
              <select className="cs-form-select" value={changeType} onChange={e => setChangeType(e.target.value)}>
                <option value="registered-address">Change Registered Address</option>
                <option value="name-change">Change Corporate Name</option>
                <option value="director-appoint">Appoint Board Director</option>
                <option value="share-issuance">Issue New Shares</option>
              </select>
            </div>

            <div className="cs-form-group">
              <label className="cs-form-label">Provide Details</label>
              <textarea 
                required 
                className="cs-form-textarea"
                rows={4} 
                placeholder="Include new address details, name preference, or quantity of shares to issue..."
                value={details} 
                onChange={e => setDetails(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="cs-btn cs-btn-secondary" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" disabled={loading} className="cs-btn cs-btn-primary" style={{ background: 'var(--cs-emerald)', borderColor: 'var(--cs-emerald)', flex: 1 }}>
                {loading ? 'Submitting request...' : 'Send Filing Request'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
