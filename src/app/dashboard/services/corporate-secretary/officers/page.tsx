'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UsersRound, AlertCircle, CheckCircle2, UserPlus, Trash2, ArrowLeft, Replace } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function OfficersPage() {
  const { selectedClientId, corporation, refreshData } = useCorporateSecretary();
  
  const [officers, setOfficers] = useState<any[]>([]);
  const [jurisdiction, setJurisdiction] = useState('Ontario');
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'replace' | 'remove' | 'sign'>('list');
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [formData, setFormData] = useState({ position: '', name: '', address: '', email: '', phone: '', appointed_date: new Date().toISOString().split('T')[0] });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOfficers = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/corpsec/${selectedClientId}/registers/officers`);
      const data = await res.json();
      if (data.officers) setOfficers(data.officers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  useEffect(() => {
    if (corporation?.jurisdiction) {
      setJurisdiction(corporation.jurisdiction.includes('Federal') ? 'Federal' : 'Ontario');
    }
  }, [corporation]);

  const getJurisdictionNotice = () => {
    switch(jurisdiction) {
      case 'Ontario': return "In Ontario, officer changes are filed with the government.";
      case 'BC': return "In BC, officer changes are recorded when the Annual Return is filed.";
      case 'Alberta': return "In Alberta, officer changes are NOT recorded by the government, only in your Minute Book.";
      default: return "Officer changes are updated in your Minute Book.";
    }
  };

  const handleAction = (action: 'add' | 'edit' | 'replace' | 'remove', officer?: any) => {
    setSuccessMessage('');
    if (officer) {
      setSelectedOfficer(officer);
      setFormData({ 
        position: officer.position || officer.title || '', 
        name: officer.name, 
        address: officer.address || '', 
        email: officer.email || '', 
        phone: officer.phone || '',
        appointed_date: officer.appointed_date || new Date().toISOString().split('T')[0]
      });
    } else {
      setSelectedOfficer(null);
      setFormData({ 
        position: '', 
        name: '', 
        address: '', 
        email: '', 
        phone: '',
        appointed_date: new Date().toISOString().split('T')[0]
      });
    }
    setView(action);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'remove' && selectedOfficer?.position === 'President' && officers.filter(o => o.position === 'President').length === 1) {
      alert("All corporations must have at least one President. Replace this person instead of removing them.");
      return;
    }
    setView('sign');
  };

  const onSignComplete = async () => {
    let msg = '';
    try {
      if (view === 'add' || view === 'replace') {
        const res = await fetch(`/api/corpsec/${selectedClientId}/changes/officer-appoint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.position,
            name: formData.name,
            address: formData.address,
            email: formData.email,
            phone: formData.phone,
            appointed_date: formData.appointed_date
          })
        });
        
        if (res.ok) {
          msg = `Officer appointed successfully. Board resolution generated.`;
        } else {
          msg = `Failed to appoint officer.`;
        }
      } else if (view === 'remove') {
        const res = await fetch(`/api/corpsec/${selectedClientId}/changes/officer-cease`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            officer_id: selectedOfficer.id
          })
        });
        
        if (res.ok) {
          msg = `Officer removed. Board resolution generated.`;
        } else {
          msg = `Failed to remove officer.`;
        }
      }
      
      setSuccessMessage(msg);
      await fetchOfficers();
      await refreshData();
      setView('list');
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href={`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', paddingLeft: 0, marginBottom: '12px' }}>
            <ArrowLeft size={14} /> Back to Overview
          </Link>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UsersRound size={28} style={{ color: 'var(--cs-accent)' }} />
            Officers Management
          </h1>
          <p className="cs-page-subtitle">Manage executive and officer appointments for {corporation?.legal_name}.</p>
        </div>
        
        <div style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--cs-border)' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Jurisdiction</label>
          <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-primary)', outline: 'none', cursor: 'pointer', padding: 0 }}>
            <option value="Ontario">Ontario</option>
            <option value="BC">British Columbia</option>
            <option value="Alberta">Alberta</option>
            <option value="Federal">Federal</option>
          </select>
        </div>
      </div>

      <div className="cs-alert info">
        <AlertCircle style={{ flexShrink: 0 }} size={20} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Jurisdiction Notice</h4>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
            {getJurisdictionNotice()} Changes are reflected in the dashboard after all parties sign. Documents are stored in the Minute Book automatically.
          </p>
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
            <h2>Current Officers</h2>
            <button className="cs-btn cs-btn-primary cs-btn-sm" onClick={() => handleAction('add')}>
              <UserPlus size={16} /> Appoint Officer
            </button>
          </div>
          
          <div className="cs-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="cs-empty">
                <div className="cs-skeleton" style={{ width: '200px', height: '14px', margin: '0 auto 8px' }} />
                <div className="cs-skeleton" style={{ width: '150px', height: '12px', margin: '0 auto' }} />
              </div>
            ) : officers.length === 0 ? (
              <div className="cs-empty">
                <UsersRound size={40} />
                <h3>No Officers Appointed</h3>
                <p>There are no officers currently appointed for this corporation.</p>
              </div>
            ) : (
              <div className="cs-person-grid" style={{ gridTemplateColumns: '1fr', gap: 0 }}>
                {officers.map(o => (
                  <div key={o.id} className="cs-person-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', borderBottom: '1px solid var(--cs-border-light)', borderRadius: 0, padding: '20px 24px' }}>
                    <div className="cs-person-top" style={{ marginBottom: 0, flex: 1 }}>
                      <div className="cs-person-avatar" style={{ background: 'linear-gradient(135deg, var(--cs-emerald-light), #C6F6D5)', color: 'var(--cs-emerald)' }}>
                        {o.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cs-accent)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>{o.title || o.position}</div>
                        <div className="cs-person-name" style={{ margin: 0 }}>{o.name}</div>
                        <div style={{ color: 'var(--cs-text-muted)', fontSize: '12px', marginTop: '2px' }}>{o.email} • Appointed: {o.appointed_date}</div>
                      </div>
                    </div>
                    <div className="cs-person-actions" style={{ border: 'none', paddingTop: 0, gap: '8px' }}>
                      <button className="cs-btn cs-btn-secondary cs-btn-sm" onClick={() => handleAction('replace', o)}>
                        <Replace size={13} /> Replace
                      </button>
                      <button className="cs-btn cs-btn-danger cs-btn-sm" onClick={() => handleAction('remove', o)}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(view === 'add' || view === 'edit' || view === 'replace' || view === 'remove') && (
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>
              {view === 'add' ? 'Appoint New Officer' : view === 'replace' ? `Replace ${selectedOfficer?.title || selectedOfficer?.position}` : `Remove ${selectedOfficer?.title || selectedOfficer?.position}`}
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="cs-card-body">
            {(view === 'add' || view === 'replace') && (
              <div className="cs-form-group">
                <label className="cs-form-label">Position Title</label>
                <input required type="text" className="cs-form-input" placeholder="e.g. CEO, Secretary, Treasurer" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
            )}
            
            {view !== 'remove' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="cs-form-group">
                  <label className="cs-form-label">{view === 'replace' ? 'New Officer Name' : 'Full Legal Name'}</label>
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
                <div className="cs-form-group">
                  <label className="cs-form-label">Appointment Date</label>
                  <input required type="date" className="cs-form-input" value={formData.appointed_date} onChange={e => setFormData({...formData, appointed_date: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="cs-alert danger" style={{ margin: 0 }}>
                <AlertCircle size={20} />
                <p style={{ margin: 0 }}>
                  You are about to remove <strong>{selectedOfficer?.name}</strong> from the position of <strong>{selectedOfficer?.title || selectedOfficer?.position}</strong>. A Director Resolution will be generated to formalize this change.
                </p>
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
          <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView(selectedOfficer ? 'replace' : 'add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', marginBottom: '16px' }}>
            <ArrowLeft size={14} /> Back to form
          </button>
          
          <ESignaturePanel 
            documentName={`Director Resolution regarding officer`}
            defaultName={formData.name}
            onSignComplete={onSignComplete}
          />
        </div>
      )}

    </div>
  );
}
