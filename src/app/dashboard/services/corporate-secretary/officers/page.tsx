'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { UsersRound, AlertCircle, CheckCircle2, UserPlus, Edit, Trash2, ArrowLeft, Replace } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function OfficersPage() {
  const { secretarialData, selectedClient } = useCorporateSecretary();
  const [officers, setOfficers] = useState<any[]>([]);
  const [jurisdiction, setJurisdiction] = useState('Ontario');
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'replace' | 'remove' | 'sign'>('list');
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [formData, setFormData] = useState({ position: '', name: '', address: '', email: '', phone: '' });
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (secretarialData?.officers) setOfficers(secretarialData.officers);
  }, [secretarialData]);

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
      setFormData({ position: officer.position, name: officer.name, address: officer.address, email: officer.email, phone: officer.phone });
    } else {
      setSelectedOfficer(null);
      setFormData({ position: '', name: '', address: '', email: '', phone: '' });
    }
    setView(action);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'remove' && selectedOfficer?.position === 'President' && officers.filter(o => o.position === 'President').length === 1) {
      alert("All corporations must have at least one President. Replace this person instead of removing them.");
      return;
    }
    if (view === 'edit') {
      // Edit contact info doesn't require a signature according to spec
      setSuccessMessage(`Contact info for ${formData.name} updated successfully.`);
      setOfficers(prev => prev.map(o => o.id === selectedOfficer.id ? { ...o, ...formData } : o));
      setView('list');
      return;
    }
    setView('sign');
  };

  const onSignComplete = () => {
    let msg = '';
    if (view === 'add') {
      msg = `Officer ${formData.position} added. Resolution emailed to directors.`;
      setOfficers(prev => [...prev, { id: Date.now(), ...formData }]);
    }
    if (view === 'replace') {
      msg = `Officer ${selectedOfficer.position} replaced. Resolution emailed.`;
      setOfficers(prev => prev.map(o => o.id === selectedOfficer.id ? { ...o, ...formData } : o));
    }
    if (view === 'remove') {
      msg = `Officer ${selectedOfficer.position} removed. Resolution emailed.`;
      setOfficers(prev => prev.filter(o => o.id !== selectedOfficer.id));
    }
    setSuccessMessage(msg);
    setView('list');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
            <ArrowLeft size={16} /> Back to Corporate Secretary
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UsersRound size={32} style={{ color: '#6366f1' }} />
            Add, Update, or Remove Officers
          </h1>
        </div>
        
        <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Jurisdiction</label>
          <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '15px', fontWeight: 600, color: '#0F172A', outline: 'none', cursor: 'pointer' }}>
            <option value="Ontario">Ontario</option>
            <option value="BC">British Columbia</option>
            <option value="Alberta">Alberta</option>
            <option value="Federal">Federal</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px 20px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertCircle style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }} size={20} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', color: '#1D4ED8', fontSize: '15px', fontWeight: 600 }}>Jurisdiction Notice</h4>
          <p style={{ margin: 0, color: '#1E40AF', fontSize: '14px', lineHeight: 1.5 }}>
            {getJurisdictionNotice()} Changes are reflected in the dashboard after all parties sign. Documents are stored in the Minute Book automatically.
          </p>
        </div>
      </div>

      {successMessage && (
        <div style={{ background: '#DCFCE7', border: '1px solid #22C55E', padding: '16px 20px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <CheckCircle2 style={{ color: '#16A34A' }} size={20} />
          <span style={{ color: '#166534', fontWeight: 500, fontSize: '15px' }}>{successMessage}</span>
        </div>
      )}

      {view === 'list' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Current Officers</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleAction('add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#0F172A', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                <UserPlus size={16} /> Add President
              </button>
              <button onClick={() => handleAction('add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                <UserPlus size={16} /> Add New Position
              </button>
            </div>
          </div>
          
          <div>
            {officers.map(o => (
              <div key={o.id} style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{o.position}</div>
                  <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '16px' }}>{o.name}</div>
                  <div style={{ color: '#64748B', fontSize: '14px', marginTop: '2px' }}>{o.email} • {o.phone}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAction('replace', o)} style={{ padding: '8px 12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '13px', fontWeight: 500 }}>
                    <Replace size={14} /> Replace
                  </button>
                  <button onClick={() => handleAction('edit', o)} style={{ padding: '8px 12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '13px', fontWeight: 500 }}>
                    <Edit size={14} /> Edit Info
                  </button>
                  <button onClick={() => handleAction('remove', o)} style={{ padding: '8px 12px', background: 'white', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(view === 'add' || view === 'edit' || view === 'replace' || view === 'remove') && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
            {view === 'add' ? 'Add New Officer' : view === 'replace' ? `Replace ${selectedOfficer?.position}` : view === 'edit' ? `Edit Info for ${selectedOfficer?.name}` : `Remove ${selectedOfficer?.position}`}
          </h2>

          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '20px' }}>
            {view === 'add' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Position Title</label>
                <input required type="text" placeholder="e.g. CEO, Secretary, Treasurer" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
              </div>
            )}
            
            {view !== 'remove' ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>{view === 'replace' ? 'New Officer Name' : 'Full Legal Name'}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Home Address</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px' }} />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.5 }}>You are about to remove <strong>{selectedOfficer?.name}</strong> from the position of <strong>{selectedOfficer?.position}</strong>. A Director Resolution will be generated to formalize this change.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setView('list')} style={{ padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                {view === 'edit' ? 'Save Changes' : 'Proceed to Signature'}
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button onClick={() => setView(selectedOfficer ? 'edit' : 'add')} style={{ background: 'none', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 500, fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to form
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
