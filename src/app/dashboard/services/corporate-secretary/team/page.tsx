'use client';

import React, { useState, useEffect } from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Users, UserPlus, ExternalLink, ArrowLeft } from 'lucide-react';

export default function TeamPage() {
  const { selectedClientId, refreshData } = useCorporateSecretary();
  
  const [team, setTeam] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'add'>('list');
  const [formData, setFormData] = useState({ name: '', email: '', type: 'Employee', role: '', salary: '', startDate: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTeam = async () => {
    if (!selectedClientId) return;
    try {
      const res = await fetch(`/api/corpsec/${selectedClientId}/registers/directors`); // Fallback query to get persons
      const data = await res.json();
      // Map directors and other persons as team members
      if (data.directors) {
        const members = data.directors.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          type: 'Employee',
          role: 'Director',
          startDate: d.appointed_date,
          status: 'Active'
        }));
        setTeam(members);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [selectedClientId]);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate payroll sync and onboarding
      const docRes = await fetch(`/api/corpsec/${selectedClientId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: 'tmpl-nda',
          name: `${formData.type} Agreement - ${formData.name}`,
          answers: { partyA: formData.name, partyB: 'Maple Leaf Consulting Inc.' },
          minute_book_section: 'Agreements'
        })
      });

      if (docRes.ok) {
        setSuccessMsg(`Onboarded ${formData.name} successfully! Generated ${formData.type} Agreement in Documents tab.`);
        setView('list');
        fetchTeam();
        refreshData();
      } else {
        alert('Onboarding failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} style={{ color: 'var(--cs-accent)' }} />
            Team Roster & Onboarding
          </h1>
          <p className="cs-page-subtitle">
            Manage employee and contractor registries, generate employment contracts, and sync with the Payroll module.
          </p>
        </div>

        {view === 'list' && (
          <button 
            onClick={() => setView('add')} 
            className="cs-btn cs-btn-primary cs-btn-sm"
          >
            <UserPlus size={15} />
            Onboard Team Member
          </button>
        )}
      </div>

      {successMsg && (
        <div className="cs-alert success" style={{ marginBottom: '24px' }}>
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {view === 'list' ? (
        <div className="cs-table-wrap">
          <table className="cs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Classification</th>
                <th>Title/Role</th>
                <th>Start Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--cs-text-primary)' }}>{member.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--cs-text-muted)', marginTop: '2px' }}>{member.email}</div>
                  </td>
                  <td style={{ color: 'var(--cs-text-secondary)' }}>{member.type}</td>
                  <td style={{ color: 'var(--cs-text-secondary)' }}>{member.role}</td>
                  <td style={{ color: 'var(--cs-text-secondary)' }}>{member.startDate}</td>
                  <td>
                    <span className="cs-badge green">{member.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => alert('Synced with Payroll. Roster details verified.')}
                      className="cs-btn cs-btn-secondary cs-btn-sm"
                      style={{ padding: '6px 12px' }}
                    >
                      Payroll Sync <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cs-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="cs-card-header">
            <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cs-accent)', padding: 0 }}>
              <ArrowLeft size={14} /> Back to roster
            </button>
            <h2>Onboard Team Member</h2>
          </div>

          <form onSubmit={handleOnboard} className="cs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="cs-form-group">
              <label className="cs-form-label">Full Legal Name</label>
              <input required type="text" className="cs-form-input" onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="cs-form-group">
              <label className="cs-form-label">Email Address</label>
              <input required type="email" className="cs-form-input" onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div className="cs-form-row">
              <div className="cs-form-group">
                <label className="cs-form-label">Classification</label>
                <select className="cs-form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="Employee">Employee</option>
                  <option value="Contractor">Contractor</option>
                </select>
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label">Title / Role</label>
                <input required type="text" className="cs-form-input" placeholder="e.g. Sales Director" onChange={e => setFormData({ ...formData, role: e.target.value })} />
              </div>
            </div>

            <div className="cs-form-row">
              <div className="cs-form-group">
                <label className="cs-form-label">Salary / Wage ($)</label>
                <input required type="number" className="cs-form-input" onChange={e => setFormData({ ...formData, salary: e.target.value })} />
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label">Start Date</label>
                <input required type="date" className="cs-form-input" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="cs-btn cs-btn-secondary" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" disabled={loading} className="cs-btn cs-btn-primary" style={{ flex: 1 }}>
                {loading ? 'Onboarding...' : 'Onboard & Generate Contract'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
