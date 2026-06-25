'use client';

import React, { useState, useEffect } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Plus, Calendar, Clock, MoreVertical, RefreshCw } from 'lucide-react';

export default function PayGroupsPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  
  const [payGroups, setPayGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'Bi-weekly',
    auto_run: false,
    cutoff_time: '12:00',
    cutoff_timezone: 'ET'
  });

  const fetchPayGroups = () => {
    fetch(`/api/payroll/${clientId}/pay-groups`)
      .then(res => res.json())
      .then(data => {
        if (data.groups) setPayGroups(data.groups);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!clientId) return;
    fetchPayGroups();
  }, [clientId]);

  const handleSave = async () => {
    if (!formData.name) return alert('Name is required');
    setSaving(true);
    try {
      const res = await fetch(`/api/payroll/${clientId}/pay-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save pay group');
      setShowDrawer(false);
      fetchPayGroups();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSchedule = async (groupId: string) => {
    try {
      const res = await fetch(`/api/payroll/${clientId}/pay-groups/${groupId}/generate-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: new Date().getFullYear(),
          firstPeriodStart: '2026-01-01',
          firstPayDate: '2026-01-15'
        })
      });
      if (!res.ok) throw new Error('Failed to generate schedule');
      alert('Schedule generated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (clientLoading || loading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading pay groups...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Pay Groups</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Define how often people are paid and manage schedules.</p>
        </div>
        <button 
          onClick={() => setShowDrawer(true)}
          style={{ 
            background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', 
            borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={16} /> Create pay group
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Pay Group</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Frequency</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Auto-run</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payGroups.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  No pay groups configured yet.
                </td>
              </tr>
            ) : payGroups.map(group => (
              <tr key={group.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{group.name}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: '#94A3B8' }} /> {group.frequency}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                  <div style={{ 
                    display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                    background: group.auto_run ? '#D1FAE5' : '#F1F5F9', color: group.auto_run ? '#059669' : '#64748B'
                  }}>
                    {group.auto_run ? 'ON' : 'OFF'}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleGenerateSchedule(group.id)}
                    style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}
                  >
                    <Calendar size={14} /> Schedule
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
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: 'white', boxShadow: '-4px 0 15px rgba(0,0,0,0.05)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Create Pay Group</h2>
            <button onClick={() => setShowDrawer(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#64748B' }}>&times;</button>
          </div>
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Group Name</label>
              <input 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Salaried Employees"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Pay Frequency</label>
              <select 
                value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Semi-monthly">Semi-monthly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.auto_run} 
                  onChange={e => setFormData({...formData, auto_run: e.target.checked})}
                  style={{ width: '16px', height: '16px' }}
                />
                Enable Auto-run
              </label>
              <p style={{ margin: '4px 0 0 24px', fontSize: '12px', color: '#64748B' }}>Automatically process payroll using default hours on the processing date.</p>
            </div>
          </div>
          <div style={{ padding: '24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setShowDrawer(false)} style={{ background: 'white', border: '1px solid #CBD5E1', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Create Group'}
            </button>
          </div>
        </div>
      )}
      
      {showDrawer && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setShowDrawer(false)} />}
    </div>
  );
}
