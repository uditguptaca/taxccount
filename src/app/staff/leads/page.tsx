'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Search, Mail, Phone, Calendar, User, Globe, Building2, ArrowRight } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function StaffLeadsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mine' | 'team'>('mine');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/leads?user_id=${user.id}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading leads...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load leads.</div>;

  const leads = tab === 'mine' ? (data.myLeads || []) : (data.teamLeads || []);

  const statusColors: Record<string, string> = {
    new: '#6366f1', contacted: '#3b82f6', qualified: '#10b981',
    proposal: '#f59e0b', converted: '#059669', lost: '#ef4444'
  };

  const statusCounts: Record<string, number> = { all: leads.length };
  leads.forEach((l: any) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });

  const filtered = leads.filter((l: any) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.name?.toLowerCase().includes(q) && !l.email?.toLowerCase().includes(q) && !l.company_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Target size={28} /> Leads</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Prospect leads assigned to you and your team (read-only)</p>
        </div>
        <div className="badge badge-yellow" style={{ padding: '6px 10px', fontSize: 'var(--font-size-xs)' }}>🔒 Read-Only</div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button className={`tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>My Leads ({data.myLeads?.length || 0})</button>
        <button className={`tab ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>Team Leads ({data.teamLeads?.length || 0})</button>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'].filter(s => s === 'all' || statusCounts[s]).map(s => (
          <button key={s} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div className="topbar-search" style={{ width: '100%' }}>
          <Search size={16} />
          <input type="text" placeholder="Search leads by name, email, or company..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Lead Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
        {filtered.map((lead: any) => (
          <div key={lead.id} className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              height: 4,
              background: statusColors[lead.status] || 'var(--color-gray-300)',
            }}></div>
            <div style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: `${statusColors[lead.status] || '#6366f1'}15`, color: statusColors[lead.status] || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                    {lead.name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{lead.name}</div>
                    {lead.company_name && <div className="text-xs text-muted">{lead.company_name}</div>}
                  </div>
                </div>
                <span className="badge" style={{ background: `${statusColors[lead.status] || '#999'}20`, color: statusColors[lead.status] || '#999', border: `1px solid ${statusColors[lead.status] || '#999'}40`, fontSize: 10 }}>
                  {lead.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {lead.email && <div className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Mail size={12} style={{ color: 'var(--color-gray-400)' }} /> {lead.email}</div>}
                {lead.phone && <div className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Phone size={12} style={{ color: 'var(--color-gray-400)' }} /> {lead.phone}</div>}
                {lead.source && <div className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Globe size={12} style={{ color: 'var(--color-gray-400)' }} /> Source: {lead.source}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-gray-100)' }}>
                <div className="text-xs text-muted"><Calendar size={11} style={{ marginRight: 4 }} />{formatDate(lead.created_at)}</div>
                {tab === 'team' && <div className="text-xs" style={{ fontWeight: 500, color: 'var(--color-primary)' }}><User size={11} /> {lead.assigned_name}</div>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
            <Target size={40} style={{ marginBottom: 8 }} />
            <h3>No leads found</h3>
            <p className="text-sm">{tab === 'mine' ? 'No leads assigned to you yet.' : 'No team leads to display.'}</p>
          </div>
        )}
      </div>
    </>
  );
}
