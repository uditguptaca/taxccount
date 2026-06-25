'use client';

import React, { useState, useEffect } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Plus, Users, Search, MoreVertical, Edit2, Building } from 'lucide-react';

export default function PeoplePage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  
  const [people, setPeople] = useState<any[]>([]);
  const [payGroups, setPayGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    type: 'Employee',
    status: 'ACTIVE',
    pay_group_id: '',
    pay_type: 'Salary',
    pay_rate: '',
    province_of_employment: 'ON',
    federal_claim: 16452,
    provincial_claim: 12747,
    vacation_rate: 4,
    vacation_pay_method: 'accrue'
  });

  const fetchData = async () => {
    try {
      const [peopleRes, groupsRes] = await Promise.all([
        fetch(`/api/payroll/${clientId}/people`),
        fetch(`/api/payroll/${clientId}/pay-groups`)
      ]);
      const peopleData = await peopleRes.json();
      const groupsData = await groupsRes.json();
      
      if (peopleData.people) setPeople(peopleData.people);
      if (groupsData.groups) setPayGroups(groupsData.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;
    fetchData();
  }, [clientId]);

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) return alert('Name is required');
    setSaving(true);
    try {
      const res = await fetch(`/api/payroll/${clientId}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pay_rate: parseFloat(formData.pay_rate) || 0
        })
      });
      if (!res.ok) throw new Error('Failed to save person');
      setShowDrawer(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredPeople = people.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (clientLoading || loading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading people...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>People</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Manage employees and contractors.</p>
        </div>
        <button 
          onClick={() => setShowDrawer(true)}
          style={{ 
            background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', 
            borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={16} /> Add employee or contractor
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '16px', background: '#F8FAFC' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
            <input 
              type="text" placeholder="Search people..." 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Pay Group</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  No people found.
                </td>
              </tr>
            ) : filteredPeople.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {p.first_name[0]}{p.last_name[0]}
                  </div>
                  <div>
                    {p.first_name} {p.last_name}
                    {p.title && <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>{p.title}</div>}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{p.type}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                  <div style={{ 
                    display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                    background: p.status === 'ACTIVE' ? '#D1FAE5' : '#F1F5F9', 
                    color: p.status === 'ACTIVE' ? '#059669' : '#64748B'
                  }}>
                    {p.status}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                  {p.pay_group_name || <span style={{ color: '#94A3B8' }}>Unassigned</span>}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDrawer && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px', background: 'white', boxShadow: '-4px 0 15px rgba(0,0,0,0.05)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Add Person</h2>
            <button onClick={() => setShowDrawer(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#64748B' }}>&times;</button>
          </div>
          
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>First Name</label>
                <input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Last Name</label>
                <input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}>
                  <option value="Employee">Employee</option>
                  <option value="Contractor">Contractor</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Pay Group</label>
                <select value={formData.pay_group_id} onChange={e => setFormData({...formData, pay_group_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}>
                  <option value="">-- Select --</option>
                  {payGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1E293B' }}>Compensation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Pay Type</label>
                  <select value={formData.pay_type} onChange={e => setFormData({...formData, pay_type: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}>
                    <option value="Salary">Salary</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Pay Rate</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748B' }}>$</span>
                    <input type="number" step="0.01" value={formData.pay_rate} onChange={e => setFormData({...formData, pay_rate: e.target.value})} style={{ width: '100%', padding: '10px 12px 10px 24px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1E293B' }}>Taxes & Compliance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Province of Employment</label>
                  <select value={formData.province_of_employment} onChange={e => setFormData({...formData, province_of_employment: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}>
                    {['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setShowDrawer(false)} style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Person'}
            </button>
          </div>
        </div>
      )}
      
      {showDrawer && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setShowDrawer(false)} />}
    </div>
  );
}
