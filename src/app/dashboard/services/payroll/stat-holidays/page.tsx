'use client';

import React, { useState, useEffect } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { CalendarClock, MapPin } from 'lucide-react';

export default function StatHolidaysPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [province, setProvince] = useState('ON'); // Default province, typically from company settings

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    fetch(`/api/payroll/${clientId}/stat-holidays?year=${year}`)
      .then(res => res.json())
      .then(data => {
        // Mock data if empty
        if (!data.holidays || data.holidays.length === 0) {
          setHolidays([
            { id: 1, name: 'New Year\'s Day', date: `${year}-01-01` },
            { id: 2, name: 'Family Day', date: `${year}-02-16` },
            { id: 3, name: 'Good Friday', date: `${year}-04-03` },
            { id: 4, name: 'Victoria Day', date: `${year}-05-18` },
            { id: 5, name: 'Canada Day', date: `${year}-07-01` },
            { id: 6, name: 'Labour Day', date: `${year}-09-07` },
            { id: 7, name: 'Thanksgiving Day', date: `${year}-10-12` },
            { id: 8, name: 'Christmas Day', date: `${year}-12-25` },
            { id: 9, name: 'Boxing Day', date: `${year}-12-26` }
          ]);
        } else {
          setHolidays(data.holidays);
        }
        setLoading(false);
      });
  }, [clientId, year]);

  if (clientLoading || loading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading stat holidays...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Stat Holidays</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Manage the statutory holiday calendar used for stat pay and processing cutoffs.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #CBD5E1', padding: '8px 12px', borderRadius: '6px' }}>
          <MapPin size={16} style={{ color: '#64748B' }} />
          <select 
            value={province} 
            onChange={e => setProvince(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}
          >
            {['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map(p => (
              <option key={p} value={p}>{p} Holidays</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #CBD5E1', padding: '8px 12px', borderRadius: '6px' }}>
          <CalendarClock size={16} style={{ color: '#64748B' }} />
          <select 
            value={year} 
            onChange={e => setYear(parseInt(e.target.value))}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}
          >
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Holiday Name</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map(h => {
              const d = new Date(h.date);
              return (
                <tr key={h.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{h.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
