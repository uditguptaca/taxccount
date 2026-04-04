'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCheck, Search, Users, Building2, User, Mail, Phone, MapPin, ExternalLink, FolderKanban, DollarSign } from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }

export default function StaffClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/clients?user_id=${user.id}`).then(r => r.json()).then(d => {
      setClients(d.clients || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading clients...</div>;

  const typeCounts: Record<string, number> = { all: clients.length };
  clients.forEach(c => { typeCounts[c.client_type] = (typeCounts[c.client_type] || 0) + 1; });

  const filtered = clients.filter(c => {
    if (typeFilter !== 'all' && c.client_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.display_name?.toLowerCase().includes(q) && !c.client_code?.toLowerCase().includes(q) && !c.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const typeColors: Record<string, string> = { individual: '#6366f1', business: '#10b981', trust: '#f59e0b', sole_proprietor: '#8b5cf6' };

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><UserCheck size={28} /> My Clients</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Clients where you have assigned compliance work (read-only)</p>
        </div>
        <span className="badge badge-blue" style={{ padding: '6px 12px' }}>{clients.length} Clients</span>
      </div>

      {/* Type Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'business', label: 'Business' },
          { key: 'individual', label: 'Individual' },
          { key: 'sole_proprietor', label: 'Sole Proprietor' },
          { key: 'trust', label: 'Trust' },
        ].filter(t => t.key === 'all' || typeCounts[t.key]).map(t => (
          <button key={t.key} className={`btn ${typeFilter === t.key ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTypeFilter(t.key)}>
            {t.label} ({typeCounts[t.key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div className="topbar-search" style={{ width: '100%' }}>
          <Search size={16} />
          <input type="text" placeholder="Search by name, code, or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Client Table */}
      <div className="data-table-wrapper">
        <table className="data-table text-sm">
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Location</th>
              <th>My Projects</th>
              <th>Pending Tasks</th>
              <th>Total Billed</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/staff/clients/${c.id}`)}>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.display_name}</div>
                  <div className="text-xs text-muted">{c.client_code}</div>
                </td>
                <td>
                  <span className="badge" style={{ background: `${typeColors[c.client_type] || '#6366f1'}15`, color: typeColors[c.client_type] || '#6366f1', border: `1px solid ${typeColors[c.client_type] || '#6366f1'}30` }}>
                    {c.client_type?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <div className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} /> {c.email || '—'}</div>
                  {c.phone && <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {c.phone}</div>}
                </td>
                <td className="text-xs">{c.city && c.province ? `${c.city}, ${c.province}` : '—'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-blue">{c.my_projects}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${c.pending_tasks > 0 ? 'badge-yellow' : 'badge-green'}`}>{c.pending_tasks}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(c.total_billed)}</td>
                <td>
                  <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    <span className="badge-dot"></span>{c.status}
                  </span>
                </td>
                <td><ExternalLink size={14} style={{ color: 'var(--color-gray-400)' }} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>
                <UserCheck size={40} style={{ marginBottom: 8 }} />
                <h3>No clients found</h3>
                <p className="text-sm">You don't have any assigned compliance work yet.</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
