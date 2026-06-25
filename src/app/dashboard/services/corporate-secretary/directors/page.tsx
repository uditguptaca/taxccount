'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Users, AlertCircle, CheckCircle2, UserPlus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import ESignaturePanel from '@/components/CorporateSecretary/ESignaturePanel';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';

export default function DirectorsPage() {
  const { secretarialData, selectedClient } = useCorporateSecretary();
  const [directors, setDirectors] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'remove' | 'sign'>('list');
  const [selectedDirector, setSelectedDirector] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', address: '', email: '', phone: '', removeReason: 'Removed' });
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (secretarialData?.directors) setDirectors(secretarialData.directors);
  }, [secretarialData]);

  const handleAction = (action: 'add' | 'edit' | 'remove', director?: any) => {
    setSuccessMessage('');
    if (director) {
      setSelectedDirector(director);
      setFormData({ name: director.name, address: director.address, email: director.email, phone: director.phone, removeReason: 'Removed' });
    } else {
      setSelectedDirector(null);
      setFormData({ name: '', address: '', email: '', phone: '', removeReason: 'Removed' });
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

  const onSignComplete = () => {
    let msg = '';
    if (selectedDirector) {
      if (view === 'remove') {
        msg = `Director ${selectedDirector.name} has been removed. Resolution emailed to shareholders.`;
        setDirectors(prev => prev.filter(d => d.id !== selectedDirector.id));
      } else {
        msg = `Director ${formData.name} information updated.`;
        setDirectors(prev => prev.map(d => d.id === selectedDirector.id ? { ...d, ...formData } : d));
      }
    } else {
      msg = `Director ${formData.name} added. Resolution emailed to shareholders.`;
      setDirectors(prev => [...prev, { id: Date.now(), ...formData }]);
    }
    setSuccessMessage(msg);
    setView('list');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={32} style={{ color: '#6366f1' }} />
          Add, Update, or Remove Directors
        </h1>
      </div>

      {/* Notice Box */}
      <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', padding: '16px 20px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertCircle style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} size={20} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '15px', fontWeight: 600 }}>Important Information</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400E', fontSize: '14px', lineHeight: 1.5 }}>
            <li>Director changes are subject to a one-time fee.</li>
            <li>Changes will be filed with the government after all parties sign.</li>
            <li>The shareholder resolution is automatically prepared and emailed to all shareholders.</li>
          </ul>
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
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Current Directors</h2>
            <button onClick={() => handleAction('add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
              <UserPlus size={16} /> Add Director
            </button>
          </div>
          
          <div>
            {directors.map(d => (
              <div key={d.id} style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '16px' }}>{d.name}</div>
                  <div style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>{d.address}</div>
                  <div style={{ color: '#64748B', fontSize: '14px', marginTop: '2px' }}>{d.email} • {d.phone}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAction('edit', d)} style={{ padding: '8px 12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '13px', fontWeight: 500 }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleAction('remove', d)} style={{ padding: '8px 12px', background: 'white', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(view === 'add' || view === 'edit' || view === 'remove') && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
            {view === 'add' ? 'Add New Director' : view === 'edit' ? `Update ${selectedDirector?.name}` : `Remove ${selectedDirector?.name}`}
          </h2>

          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '20px' }}>
            {view !== 'remove' ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Full Legal Name</label>
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>This director is being:</label>
                <select value={formData.removeReason} onChange={e => setFormData({...formData, removeReason: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', background: 'white' }}>
                  <option value="Removed">Removed</option>
                  <option value="Resigning">Resigning</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setView('list')} style={{ padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                Proceed to Signature
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'sign' && (
        <div>
          <button onClick={() => setView(selectedDirector ? (formData.removeReason ? 'remove' : 'edit') : 'add')} style={{ background: 'none', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 500, fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to form
          </button>
          
          <ESignaturePanel 
            documentName={selectedDirector ? (formData.removeReason ? `Shareholders' Resolution Removing Director` : `Director Resolution approving information change`) : `Consent to Act as Director`}
            defaultName={formData.name}
            onSignComplete={onSignComplete}
          />
        </div>
      )}

    </div>
  );
}
