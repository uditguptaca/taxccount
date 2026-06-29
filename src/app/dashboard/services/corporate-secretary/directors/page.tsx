'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, AlertCircle, CheckCircle2, UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function DirectorsPage() {
  const { selectedClientId, corporation, refreshData } = useCorporateSecretary();
  
  const [directors, setDirectors] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'remove' | 'sign'>('list');
  const [selectedDirector, setSelectedDirector] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', address: '', email: '', phone: '', removeReason: 'Removed', appointed_date: new Date().toISOString().split('T')[0], is_resident_canadian: true });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDirectors = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/corpsec/${selectedClientId}/registers/directors`);
      const data = await res.json();
      if (data.directors) setDirectors(data.directors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchDirectors();
  }, [fetchDirectors]);

  const handleAction = (action: 'add' | 'edit' | 'remove', director?: any) => {
    setSuccessMessage('');
    if (director) {
      setSelectedDirector(director);
      setFormData({
        name: director.name,
        address: director.address,
        email: director.email,
        phone: director.phone || '',
        removeReason: 'Removed',
        appointed_date: director.appointed_date || new Date().toISOString().split('T')[0],
        is_resident_canadian: director.is_resident_canadian === 1
      });
    } else {
      setSelectedDirector(null);
      setFormData({
        name: '',
        address: '',
        email: '',
        phone: '',
        removeReason: 'Removed',
        appointed_date: new Date().toISOString().split('T')[0],
        is_resident_canadian: true
      });
    }
    setView(action);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'remove' && directors.length === 1) {
      alert("A company must have at least one director. You cannot remove the sole director.");
      return;
    }
    setView('sign');
  };

  const onSignComplete = async () => {
    let msg = '';
    try {
      if (view === 'add') {
        const res = await fetch(`/api/corpsec/${selectedClientId}/changes/director-appoint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          msg = `Director ${formData.name} added successfully. Resolution and Consent generated.`;
        } else {
          msg = `Failed to add director.`;
        }
      } else if (view === 'remove') {
        const res = await fetch(`/api/corpsec/${selectedClientId}/changes/director-remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            person_id: selectedDirector.person_id,
            ceased_date: new Date().toISOString().split('T')[0],
            remove_reason: formData.removeReason
          })
        });
        if (res.ok) {
          msg = `Director ${selectedDirector.name} has been removed.`;
        } else {
          msg = `Failed to remove director.`;
        }
      }
      
      setSuccessMessage(msg);
      await fetchDirectors();
      await refreshData();
      setView('list');
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="cs-page-header">
        <Link href={`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Overview
        </Link>
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={28} style={{ color: 'var(--cs-accent)' }} />
          Directors Management
        </h1>
        <p className="cs-page-subtitle">Add, update, or cease directors for {corporation?.legal_name}.</p>
      </div>

      {/* Notice Box */}
      <div className="cs-alert warning">
        <AlertCircle style={{ flexShrink: 0 }} size={20} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Important Compliance Information</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.5 }}>
            <li>Changes are recorded immediately in the corporate event log.</li>
            <li>Government filings will be prepared and placed in the draft package.</li>
            <li>Resolution and Consent to Act documents are auto-generated.</li>
          </ul>
        </div>
      </div>

      {successMessage && (
        <div className="cs-alert success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 style={{ flexShrink: 0 }} size={20} />
          <span style={{ fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {view === 'list' && (
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Current Board of Directors</h2>
            <button className="cs-btn cs-btn-primary cs-btn-sm" onClick={() => handleAction('add')}>
              <UserPlus size={16} /> Appoint Director
            </button>
          </div>
          
          <div className="cs-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="cs-empty">
                <div className="cs-skeleton" style={{ width: '200px', height: '14px', margin: '0 auto 8px' }} />
                <div className="cs-skeleton" style={{ width: '150px', height: '12px', margin: '0 auto' }} />
              </div>
            ) : directors.length === 0 ? (
              <div className="cs-empty">
                <Users size={40} />
                <h3>No Active Directors</h3>
                <p>There are no directors currently registered on the board.</p>
              </div>
            ) : (
              <div className="cs-person-grid" style={{ gridTemplateColumns: '1fr', gap: 0 }}>
                {directors.map(d => (
                  <div key={d.id} className="cs-person-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', borderBottom: '1px solid var(--cs-border-light)', borderRadius: 0, padding: '20px 24px' }}>
                    <div className="cs-person-top" style={{ marginBottom: 0, flex: 1 }}>
                      <div className="cs-person-avatar">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="cs-person-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                          {d.name}
                          {d.is_resident_canadian === 1 && (
                            <span className="cs-badge indigo" style={{ fontSize: '10px', textTransform: 'capitalize' }}>Resident Canadian</span>
                          )}
                        </div>
                        <div style={{ color: 'var(--cs-text-secondary)', fontSize: '13px', marginTop: '4px' }}>{d.address}</div>
                        <div style={{ color: 'var(--cs-text-muted)', fontSize: '12px', marginTop: '2px' }}>{d.email} • Appointed: {d.appointed_date}</div>
                      </div>
                    </div>
                    <div className="cs-person-actions" style={{ border: 'none', paddingTop: 0 }}>
                      <button className="cs-btn cs-btn-danger cs-btn-sm" onClick={() => handleAction('remove', d)}>
                        <Trash2 size={13} /> Cease / Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(view === 'add' || view === 'edit' || view === 'remove') && (
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>
              {view === 'add' ? 'Appoint New Director' : view === 'edit' ? `Update ${selectedDirector?.name}` : `Remove ${selectedDirector?.name}`}
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="cs-card-body">
            {view !== 'remove' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="cs-form-group">
                  <label className="cs-form-label">Full Legal Name</label>
                  <input required type="text" className="cs-form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-form-label">Home Address</label>
                  <input required type="text" className="cs-form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="cs-form-row">
                  <div className="cs-form-group">
                    <label className="cs-form-label">Email Address</label>
                    <input required type="email" className="cs-form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="cs-form-group">
                    <label className="cs-form-label">Phone Number</label>
                    <input required type="tel" className="cs-form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="cs-form-row">
                  <div className="cs-form-group">
                    <label className="cs-form-label">Appointment Date</label>
                    <input required type="date" className="cs-form-input" value={formData.appointed_date} onChange={e => setFormData({...formData, appointed_date: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '20px' }}>
                    <label className="cs-form-checkbox">
                      <input type="checkbox" checked={formData.is_resident_canadian} onChange={e => setFormData({...formData, is_resident_canadian: e.target.checked})} />
                      Resident Canadian
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cs-form-group">
                <label className="cs-form-label">Reason for cessation:</label>
                <select className="cs-form-select" value={formData.removeReason} onChange={e => setFormData({...formData, removeReason: e.target.value})}>
                  <option value="Removed">Removed</option>
                  <option value="Resigning">Resigning</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="cs-btn cs-btn-secondary" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="cs-btn cs-btn-primary">
                Proceed to Signature
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView(selectedDirector ? 'remove' : 'add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', marginBottom: '16px' }}>
            <ArrowLeft size={14} /> Back to form
          </button>
          
          <ESignaturePanel 
            documentName={selectedDirector ? `Shareholders' Resolution Removing Director` : `Consent to Act as Director`}
            defaultName={formData.name}
            onSignComplete={onSignComplete}
          />
        </div>
      )}

    </div>
  );
}
