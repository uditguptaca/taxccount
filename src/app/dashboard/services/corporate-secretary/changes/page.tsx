'use client';

import React, { useState } from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { 
  ArrowRightLeft, Users, UserCheck, Settings, FileText, CheckCircle, 
  Clock, Plus, PlusCircle, ArrowRight, UserMinus, ShieldAlert
} from 'lucide-react';

export default function ChangesPage() {
  const { selectedClientId, corporation, changes, refreshData } = useCorporateSecretary();
  
  const [showSelector, setShowSelector] = useState(false);
  const [activeWizard, setActiveWizard] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const wizards = [
    {
      category: 'Directors & Officers',
      items: [
        { label: 'Appoint Director', type: 'director-appoint', icon: Users, desc: 'Add a new member to the Board of Directors.' },
        { label: 'Remove / Cease Director', type: 'director-cease', icon: UserMinus, desc: 'Record a resignation or remove an active director.' },
        { label: 'Appoint Officer', type: 'officer-appoint', icon: UserCheck, desc: 'Assign a new title like President, CEO, or Secretary.' }
      ]
    },
    {
      category: 'Shares & Equity',
      items: [
        { label: 'Issue Shares', type: 'share-issuance', icon: PlusCircle, desc: 'Issue new shares from authorized capital to a shareholder.' },
        { label: 'Transfer Shares', type: 'share-transfer', icon: ArrowRightLeft, desc: 'Transfer shares from one existing holder to another.' }
      ]
    },
    {
      category: 'Company Identity',
      items: [
        { label: 'Change Registered Address', type: 'registered-address', icon: Settings, desc: 'Change your official head office registry address.' },
        { label: 'Change Corporation Name', type: 'name-change', icon: FileText, desc: 'Adopt a new named or numbered corporate identity.' }
      ]
    }
  ];

  const handleStartWizard = (type: string) => {
    setActiveWizard(type);
    setShowSelector(false);
    setFormData({});
    setSuccess(false);
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/corpsec/${selectedClientId}/changes/${activeWizard}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        await refreshData();
      } else {
        alert('Filing failed. Please check parameters.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
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
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArrowRightLeft size={28} style={{ color: 'var(--cs-accent)' }} />
            Corporate Changes Hub
          </h1>
          <p className="cs-page-subtitle">
            Initiate legally compliant changes, auto-generate resolutions, and queue filings with the registry.
          </p>
        </div>

        <button 
          onClick={() => setShowSelector(true)} 
          className="cs-btn cs-btn-primary cs-btn-sm"
        >
          <Plus size={15} />
          Start a Change Wizard
        </button>
      </div>

      {/* Main Grid: Pending changes board & Event timeline */}
      <div className="cs-grid-2">
        
        {/* Pending Changes Board */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--cs-accent)' }} />
            Pending Changes Board
          </h2>

          <div className="cs-kanban">
            
            {/* Drafted Column */}
            <div className="cs-kanban-column">
              <div className="cs-kanban-column-header">
                <span>Drafted / Pending Sign</span>
                <span className="cs-kanban-column-count">
                  {changes.filter(c => c.status === 'draft').length}
                </span>
              </div>

              <div className="cs-kanban-cards">
                {changes.filter(c => c.status === 'draft').length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--cs-text-muted)', fontSize: '13px' }}>
                    No drafts pending signature.
                  </div>
                ) : (
                  changes.filter(c => c.status === 'draft').map(c => {
                    const signers = JSON.parse(c.signers_json || '[]');
                    const signed = signers.filter((s: any) => s.status === 'signed').length;
                    return (
                      <div key={c.id} className="cs-kanban-card">
                        <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px', marginBottom: '6px' }}>{c.change_type}</div>
                        <div style={{ fontSize: '12px', color: 'var(--cs-text-secondary)', marginBottom: '8px' }}>Signing progress: {signed} / {signers.length}</div>
                        <div className="cs-ownership-bar" style={{ height: '4px', marginTop: 0 }}>
                          <div className="cs-ownership-fill" style={{ width: `${(signed / signers.length) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Signed Column */}
            <div className="cs-kanban-column">
              <div className="cs-kanban-column-header">
                <span>Signed & Ready</span>
                <span className="cs-kanban-column-count" style={{ background: 'var(--cs-accent-light)', color: 'var(--cs-accent)' }}>
                  {changes.filter(c => c.status === 'signed').length}
                </span>
              </div>
              <div className="cs-kanban-cards">
                {changes.filter(c => c.status === 'signed').length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--cs-text-muted)', fontSize: '13px' }}>
                    No signed packages waiting.
                  </div>
                ) : (
                  changes.filter(c => c.status === 'signed').map(c => (
                    <div key={c.id} className="cs-kanban-card">
                      <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px' }}>{c.change_type}</div>
                      <div style={{ fontSize: '12px', color: 'var(--cs-text-secondary)', marginTop: '6px' }}>Package prepared for registry filing.</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Filed Column */}
            <div className="cs-kanban-column">
              <div className="cs-kanban-column-header">
                <span>Filed / Confirmed</span>
                <span className="cs-kanban-column-count" style={{ background: 'var(--cs-emerald-light)', color: 'var(--cs-emerald)' }}>
                  {changes.filter(c => c.status === 'filed' || c.status === 'confirmed').length}
                </span>
              </div>
              <div className="cs-kanban-cards">
                {changes.filter(c => c.status === 'filed' || c.status === 'confirmed').length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--cs-text-muted)', fontSize: '13px' }}>
                    No finalized filings.
                  </div>
                ) : (
                  changes.filter(c => c.status === 'filed' || c.status === 'confirmed').map(c => (
                    <div key={c.id} className="cs-kanban-card">
                      <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {c.change_type}
                        <CheckCircle size={14} style={{ color: 'var(--cs-emerald)' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--cs-text-secondary)', marginTop: '6px' }}>Completed and saved to minute book.</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Quick Stats / Notice */}
        <div className="cs-card">
          <div className="cs-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--cs-amber)' }} />
              <h2>Regulatory Rules</h2>
            </div>
          </div>
          <div className="cs-card-body">
            <p style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Every corporate change requires an authorizing resolution signed by the board or shareholders. All resolutions are generated by the Taxccount Pro Services engine and locked once signed.
            </p>
          </div>
        </div>

      </div>

      {/* 1. Modal: Wizard Selector */}
      {showSelector && (
        <div className="cs-modal-overlay">
          <div className="cs-modal" style={{ maxWidth: '650px' }}>
            <div className="cs-modal-header">
              <h2>Select a Change Wizard</h2>
              <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setShowSelector(false)}>Close</button>
            </div>

            <div className="cs-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {wizards.map((group, idx) => (
                <div key={idx}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cs-accent)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>{group.category}</h4>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      return (
                        <button 
                          key={item.type}
                          onClick={() => handleStartWizard(item.type)}
                          className="cs-action-card"
                          style={{ width: '100%', border: '1px solid var(--cs-border)' }}
                        >
                          <div className="cs-action-icon indigo">
                            <Icon size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="cs-action-label">{item.label}</div>
                            <div className="cs-action-desc">{item.desc}</div>
                          </div>
                          <ArrowRight size={16} className="cs-action-arrow" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Active Wizard Flow */}
      {activeWizard && (
        <div className="cs-modal-overlay">
          <div className="cs-modal">
            <div className="cs-modal-header">
              <h2>{activeWizard.replace('-', ' ').toUpperCase()} Wizard</h2>
            </div>

            <div className="cs-modal-body">
              {success ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle size={48} style={{ color: 'var(--cs-emerald)', margin: '0 auto 16px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '8px' }}>Filing Initiated Successfully</h4>
                  <p style={{ fontSize: '14px', color: 'var(--cs-text-secondary)', margin: '0 0 24px' }}>The corporate event log has been updated, and draft documents have been placed in the changes board.</p>
                  <button className="cs-btn cs-btn-primary" onClick={() => { setActiveWizard(null); setSuccess(false); }}>Close Wizard</button>
                </div>
              ) : (
                <form onSubmit={handleWizardSubmit} style={{ display: 'grid', gap: '16px' }}>
                  
                  {activeWizard === 'director-appoint' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="cs-form-group">
                        <label className="cs-form-label">Full Legal Name</label>
                        <input required type="text" className="cs-form-input" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="cs-form-group">
                        <label className="cs-form-label">Email Address</label>
                        <input required type="email" className="cs-form-input" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className="cs-form-group">
                        <label className="cs-form-label">Address</label>
                        <input required type="text" className="cs-form-input" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                      <div className="cs-form-group">
                        <label className="cs-form-label">Appointment Date</label>
                        <input required type="date" className="cs-form-input" onChange={e => setFormData({ ...formData, appointed_date: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {activeWizard === 'share-issuance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="cs-form-group">
                        <label className="cs-form-label">Recipient Full Legal Name</label>
                        <input required type="text" className="cs-form-input" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="cs-form-group">
                        <label className="cs-form-label">Share Class</label>
                        <select required className="cs-form-select" onChange={e => setFormData({ ...formData, share_class_id: e.target.value })}>
                          <option value="">-- Select Share Class --</option>
                          <option value="c-001">Class A Common</option>
                          <option value="c-002">Class B Preferred</option>
                        </select>
                      </div>
                      <div className="cs-form-row">
                        <div className="cs-form-group">
                          <label className="cs-form-label">Quantity</label>
                          <input required type="number" className="cs-form-input" onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })} />
                        </div>
                        <div className="cs-form-group">
                          <label className="cs-form-label">Price per Share ($)</label>
                          <input required type="number" step="0.01" className="cs-form-input" onChange={e => setFormData({ ...formData, price_per_share: parseFloat(e.target.value) })} />
                        </div>
                      </div>
                      <div className="cs-form-group">
                        <label className="cs-form-label">Issue Date</label>
                        <input required type="date" className="cs-form-input" onChange={e => setFormData({ ...formData, issue_date: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {activeWizard === 'registered-address' && (
                    <div className="cs-form-group">
                      <label className="cs-form-label">New Registered Office Address</label>
                      <input required type="text" className="cs-form-input" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                  )}

                  {activeWizard === 'name-change' && (
                    <div className="cs-form-group">
                      <label className="cs-form-label">New Corporation Name</label>
                      <input required type="text" className="cs-form-input" onChange={e => setFormData({ ...formData, new_name: e.target.value })} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="button" className="cs-btn cs-btn-secondary" onClick={() => setActiveWizard(null)}>Cancel</button>
                    <button type="submit" disabled={loading} className="cs-btn cs-btn-primary" style={{ flex: 1 }}>
                      {loading ? 'Filing Change...' : 'Authorize and Run Wizard'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
