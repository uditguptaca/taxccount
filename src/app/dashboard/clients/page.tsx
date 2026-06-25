'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [form, setForm] = useState({ 
    display_name: '', client_type_id: '', primary_email: '', tax_id: '', primary_phone: '', city: '', province: '', postal_code: '', send_invitation: false,
    secretarial_data: {
      directors: [] as { name: string, address: string, is_owner: boolean, share_amount: string }[],
    },
    enrolled_compliances: [] as string[]
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const loadClientTypes = useCallback(() => {
    fetch('/api/settings/client-types').then(r => r.json()).then(d => {
      if (d.types) {
        setClientTypes(d.types);
        if (d.types.length > 0) setForm(f => ({ ...f, client_type_id: d.types[0].id }));
      }
    }).catch(console.error);
  }, []);

  const loadClients = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    fetch(`/api/clients?${params}`)
      .then(r => r.json())
      .then(d => { setClients(d.clients || []); setLoading(false); });
  }, [search, typeFilter]);

  useEffect(() => { 
    loadClients(); 
    loadClientTypes();
  }, [loadClients, loadClientTypes]);

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, created_by: user.id || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create client');
        setSaving(false);
        return;
      }
      setShowModal(false);
      setModalStep(1);
      setForm({ 
        display_name: '', client_type_id: clientTypes.length > 0 ? clientTypes[0].id : '', primary_email: '', tax_id: '', primary_phone: '', city: '', province: '', postal_code: '', send_invitation: false,
        secretarial_data: { directors: [] },
        enrolled_compliances: []
      });
      loadClients();
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleFavorite(e: React.MouseEvent, clientId: string, currentFav: number) {
    e.stopPropagation();
    await fetch('/api/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: clientId, is_favorite: currentFav ? 0 : 1 }),
    });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, is_favorite: currentFav ? 0 : 1 } : c));
  }



  const typeCounts = {
    all: clients.length
  };
  clientTypes.forEach(t => {
    (typeCounts as any)[t.id] = clients.filter(c => c.client_type_id === t.id).length;
  });

  // Sort: favorites first, then alphabetical
  const sortedClients = [...clients].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return 0;
  });

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading clients...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>{clients.length} total clients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Client
        </button>
      </div>

      {/* Type Filter Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <button className={`tab ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>
          All ({typeCounts.all})
        </button>
        {clientTypes.map(ct => (
          <button key={ct.id} className={`tab ${typeFilter === ct.id ? 'active' : ''}`} onClick={() => setTypeFilter(ct.id)}>
            {ct.name} ({(typeCounts as any)[ct.id] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="topbar-search" style={{ flex: 1 }}>
          <Search />
          <input type="text" placeholder="Search by name, code, or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Client Table */}
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Client</th>
                <th>Type</th>
                <th>Tags</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Active Projects</th>
                <th>Total Billed</th>
                <th>Net Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((c: any) => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/clients/${c.id}`}>
                  <td>
                    <button className={`star-btn ${c.is_favorite ? 'active' : ''}`} onClick={(e) => toggleFavorite(e, c.id, c.is_favorite)} title={c.is_favorite ? 'Unfavorite' : 'Favorite'}>
                      <Star size={16} fill={c.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <span className="client-name">{c.display_name}</span>
                    <br /><span className="text-xs text-muted">{c.client_code}</span>
                  </td>
                  <td><span className="badge badge-gray">{c.client_type_name || c.client_type}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {(c.tags || []).slice(0, 3).map((tag: any, i: number) => (
                        <span key={i} className="tag" style={{ background: tag.color + '20', color: tag.color }}>{tag.name}</span>
                      ))}
                      {(c.tags || []).length > 3 && <span className="tag" style={{ background: 'var(--color-gray-100)', color: 'var(--color-gray-500)' }}>+{c.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{c.primary_email || '—'}</div>
                    <div className="text-xs text-muted">{c.primary_phone || ''}</div>
                  </td>
                  <td className="text-sm">{[c.city, c.province].filter(Boolean).join(', ') || '—'}</td>
                  <td><span className="badge badge-blue">{c.active_projects}</span></td>
                  <td className="text-sm">{formatCurrency(c.total_billed)}</td>
                  <td className="text-sm" style={{ fontWeight: 600, color: c.net_due > 0 ? 'var(--color-danger)' : 'var(--color-gray-400)' }}>
                    {formatCurrency(c.net_due)}
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'archived' ? 'badge-gray' : 'badge-yellow'}`}>
                      <span className="badge-dot"></span>{c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && !loading && (
                <tr><td colSpan={10} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No clients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Client {modalStep === 2 && '- Setup Compliances'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createClient}>
              <div className="modal-body">
                {errorMsg && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{errorMsg}</div>}
                
                {modalStep === 1 && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Client Name *</label>
                      <input className="form-input" required value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} placeholder="Full name or business name" />
                    </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Client Type</label>
                    <select className="form-select" value={form.client_type_id} onChange={e => setForm({...form, client_type_id: e.target.value})}>
                      {clientTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax ID (SSN/SIN/BN)</label>
                    <input className="form-input" value={form.tax_id} onChange={e => setForm({...form, tax_id: e.target.value})} placeholder="Unique Tax ID" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <select className="form-select" value={form.province} onChange={e => setForm({...form, province: e.target.value})}>
                      <option value="">Select Province</option>
                      <option value="Ontario">Ontario</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Alberta">Alberta</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.primary_email} onChange={e => setForm({...form, primary_email: e.target.value})} placeholder="client@email.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.primary_phone} onChange={e => setForm({...form, primary_phone: e.target.value})} placeholder="416-555-0100" />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '16px' }}>
                  <input type="checkbox" id="send_invitation" checked={form.send_invitation} onChange={e => setForm({...form, send_invitation: e.target.checked})} style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                  <label htmlFor="send_invitation" style={{ margin: 0, cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Send Portal Invitation Email (Automated Onboarding)</label>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input className="form-input" value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} placeholder="M5V 2T6" />
                  </div>
                </div>
              </>
            )}

            {modalStep === 2 && (
              <>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1E293B' }}>Compliances Enrollment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  {['GST', 'HST', 'Payroll', 'Corporate Secretary', 'Direct Tax', 'Annual Return'].map(comp => (
                    <label key={comp} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: form.enrolled_compliances.includes(comp) ? '#EEF2FF' : 'white' }}>
                      <input 
                        type="checkbox" 
                        checked={form.enrolled_compliances.includes(comp)}
                        onChange={(e) => {
                          const newComps = e.target.checked 
                            ? [...form.enrolled_compliances, comp]
                            : form.enrolled_compliances.filter(c => c !== comp);
                          setForm({...form, enrolled_compliances: newComps});
                        }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{comp}</span>
                    </label>
                  ))}
                </div>

                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Corporate Directors / Owners
                  <button type="button" onClick={() => setForm({...form, secretarial_data: { ...form.secretarial_data, directors: [...form.secretarial_data.directors, { name: '', address: '', is_owner: false, share_amount: '' }]}})} className="btn btn-ghost btn-sm" style={{ color: '#6366f1' }}>+ Add Person</button>
                </h3>
                
                {form.secretarial_data.directors.length === 0 && (
                  <p style={{ color: '#64748B', fontSize: '13px', fontStyle: 'italic', marginBottom: '24px' }}>No directors added. Click "+ Add Person" to configure.</p>
                )}

                {form.secretarial_data.directors.map((director, i) => (
                  <div key={i} style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '16px' }}>
                    <div className="form-row" style={{ marginBottom: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={director.name} onChange={e => {
                          const newD = [...form.secretarial_data.directors];
                          newD[i].name = e.target.value;
                          setForm({...form, secretarial_data: {...form.secretarial_data, directors: newD}});
                        }} placeholder="Jane Doe" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Address</label>
                        <input className="form-input" value={director.address} onChange={e => {
                          const newD = [...form.secretarial_data.directors];
                          newD[i].address = e.target.value;
                          setForm({...form, secretarial_data: {...form.secretarial_data, directors: newD}});
                        }} placeholder="123 Main St" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={director.is_owner} onChange={e => {
                          const newD = [...form.secretarial_data.directors];
                          newD[i].is_owner = e.target.checked;
                          setForm({...form, secretarial_data: {...form.secretarial_data, directors: newD}});
                        }} /> Is Owner/Shareholder
                      </label>
                      {director.is_owner && (
                        <input className="form-input" style={{ width: '150px', padding: '4px 8px', fontSize: '13px' }} placeholder="Share % or amount" value={director.share_amount} onChange={e => {
                          const newD = [...form.secretarial_data.directors];
                          newD[i].share_amount = e.target.value;
                          setForm({...form, secretarial_data: {...form.secretarial_data, directors: newD}});
                        }} />
                      )}
                      <button type="button" onClick={() => {
                        const newD = [...form.secretarial_data.directors];
                        newD.splice(i, 1);
                        setForm({...form, secretarial_data: {...form.secretarial_data, directors: newD}});
                      }} className="btn btn-ghost btn-sm" style={{ color: '#EF4444', marginLeft: 'auto' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </>
            )}

              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                {modalStep === 1 ? (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => setModalStep(2)}>Next Step ➔</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => setModalStep(1)} disabled={saving}>← Back</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Creating...' : 'Create Client & Enroll'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
