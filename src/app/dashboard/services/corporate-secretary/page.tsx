'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Search, MapPin, ChevronRight, CheckCircle2, 
  ShieldAlert, Clock, ArrowUpRight, Activity, Calendar, AlertCircle, FileText, ArrowRight
} from 'lucide-react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { format } from 'date-fns';

function parseLocalDate(dateStr: string | null | undefined) {
  if (!dateStr) return new Date();
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return new Date(datePart + 'T00:00:00');
}

export default function CorporateSecretaryCommandCenter() {
  const { clients, selectedClientId, setSelectedClientId } = useCorporateSecretary();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [projectsData, setProjectsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedClientId) {
      router.push(`/dashboard/services/corporate-secretary/overview?clientId=${selectedClientId}`);
    }
  }, [selectedClientId, router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/services/corporate-secretary/projects`);
      const d = await res.json();
      setProjectsData(d);
    } catch (e) {
      console.error('Error fetching projects:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredClients = React.useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.client_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProv = selectedProvince === '' || c.state_province === selectedProvince;
      return matchesSearch && matchesProv;
    });
  }, [clients, searchTerm, selectedProvince]);

  const uniqueProvinces = React.useMemo(() => {
    return Array.from(new Set(clients.map(c => c.state_province).filter(Boolean))).sort() as string[];
  }, [clients]);

  // Mock static events/tasks for Command Center dashboard to match the Payroll theme
  const pendingFilings = [
    {
      id: 'f-1',
      clientId: 'e4e4bae9-8d64-434c-8ff7-21f63c455814',
      clientName: 'Maple Leaf Consulting Inc.',
      type: 'Annual Return Filing',
      dueDate: '2026-07-15',
      status: 'Draft Resolution'
    },
    {
      id: 'f-2',
      clientId: 'cd99b82a-e48d-4596-a6df-d7854c4d1932',
      clientName: 'Pacific Coast Holdings Ltd.',
      type: 'Articles of Amendment',
      dueDate: '2026-08-01',
      status: 'Pending Signatures'
    }
  ];

  const pendingApprovals = [
    {
      id: 'a-1',
      clientId: 'e4e4bae9-8d64-434c-8ff7-21f63c455814',
      clientName: 'Maple Leaf Consulting Inc.',
      title: 'Appoint Board Director (Harpreet Singh)',
      dueDate: '2026-07-05',
      amount: 'Resolution Signature'
    }
  ];

  const recentActivities = [
    {
      id: 'act-1',
      clientName: 'Prairie Grain Cooperative',
      event: 'finalized director appointment (Harpreet Singh)',
      time: 'Jun 28, 2026 8:50 PM'
    },
    {
      id: 'act-2',
      clientName: 'Northern Lights Energy Corp.',
      event: 'submitted Registered Address change to registry',
      time: 'Jun 27, 2026 2:15 PM'
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div className="cs-skeleton" style={{ width: '42px', height: '42px', borderRadius: '50%', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--cs-text-secondary)', fontSize: '15px' }}>Loading Command Center...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--cs-text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.025em' }}>
            Corporate Secretary Command Center
          </h1>
          <p style={{ color: 'var(--cs-text-secondary)', fontSize: '15px', margin: 0 }}>
            Firm-wide portal for corporate secretary registry, minute book reviews, filings, and compliance.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Corp Clients</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-text-primary)' }}>{clients.length} / 32</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Pending Filings</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-text-primary)' }}>{projectsData?.stats?.total - projectsData?.stats?.completed || 2}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF7ED', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Overdue Reviews</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-red)' }}>{projectsData?.stats?.overdue || 1}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Completed (Month)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-text-primary)' }}>{projectsData?.stats?.completed || 10}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: To-Dos on Left, Directory on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Tasks / Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Filings To-Do List */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#EA580C' }} /> Filings To-Do
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingFilings.map(filing => (
                <div key={filing.id} style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#9A3412' }}>{filing.clientName}</span>
                      <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 500 }}>{filing.type} ({filing.status})</div>
                    </div>
                    <button 
                      onClick={() => { setSelectedClientId(filing.clientId); router.push(`/dashboard/services/corporate-secretary/overview?clientId=${filing.clientId}`); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F97316', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      File <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#7C2D12' }}>
                    Due Date: {format(parseLocalDate(filing.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: '#4F46E5' }} /> Resolutions Pending Approval
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingApprovals.map(approval => (
                <div key={approval.id} style={{ background: '#EEF2FF', border: '1px solid #E0E7FF', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#3730A3' }}>{approval.clientName}</span>
                    <div style={{ fontSize: '11px', color: '#4338CA', textTransform: 'uppercase', fontWeight: 600 }}>{approval.title}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => { setSelectedClientId(approval.clientId); router.push(`/dashboard/services/corporate-secretary/documents?clientId=${approval.clientId}`); }}
                      style={{ color: '#4F46E5', background: 'transparent', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0, marginTop: '2px' }}
                    >
                      View Resolve →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: 'var(--cs-emerald)' }} /> Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentActivities.map(act => (
                <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cs-emerald)', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ fontSize: '13px' }}>
                    <strong style={{ color: 'var(--cs-text-primary)' }}>{act.clientName}</strong> {act.event}.
                    <div style={{ fontSize: '11px', color: 'var(--cs-text-muted)', marginTop: '2px' }}>
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Client Directory */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--cs-border)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--cs-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cs-text-primary)', margin: '0 0 16px 0' }}>Client Registry Directory</h3>
            
            {/* Search Filters */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--cs-text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search client name or code..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 38px', borderRadius: '8px', border: '1px solid var(--cs-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--cs-border)', fontSize: '14px', outline: 'none', background: 'white' }}
              >
                <option value="">All Provinces</option>
                {uniqueProvinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--cs-surface-hover)', borderBottom: '1px solid var(--cs-border)' }}>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase' }}>Client Company</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Jurisdiction</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Registry Status</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--cs-border-light)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-primary)' }}>{c.display_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cs-text-muted)', fontSize: '12px', marginTop: '2px' }}>
                      <span>{c.client_code}</span>
                      <span style={{ color: 'var(--cs-border)' }}>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={11} /> {c.state_province}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--cs-text-secondary)' }}>
                    Federal
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      Compliant
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => { setSelectedClientId(c.id); router.push(`/dashboard/services/corporate-secretary/overview?clientId=${c.id}`); }}
                      className="cs-btn cs-btn-primary cs-btn-sm"
                    >
                      Open Portal <ChevronRight size={13} style={{ marginLeft: '2px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
