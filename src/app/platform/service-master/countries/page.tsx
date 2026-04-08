'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export default function CountriesPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'country' | 'state'>('country');
  const [parentCountryId, setParentCountryId] = useState('');
  const [form, setForm] = useState({ name: '', iso_code: '', financial_year_end_default: '', fy_is_fixed: false, code: '', sort_order: 0 });

  const load = () => {
    fetch('/api/platform/service-master/countries').then(r => r.json()).then(setCountries);
  };
  useEffect(() => { load(); }, []);

  const loadStates = (countryId: string) => {
    fetch(`/api/platform/service-master/states?countryId=${countryId}`).then(r => r.json()).then(setStates);
  };

  const toggleExpand = (id: string) => {
    if (expanded === id) { setExpanded(null); } else { setExpanded(id); loadStates(id); }
  };

  const openNew = (type: 'country' | 'state', countryId = '') => {
    setFormType(type); setParentCountryId(countryId);
    setForm({ name: '', iso_code: '', financial_year_end_default: '', fy_is_fixed: false, code: '', sort_order: 0 });
    setEditItem(null); setShowForm(true);
  };

  const openEdit = (item: any, type: 'country' | 'state') => {
    setFormType(type);
    setForm({ name: item.name, iso_code: item.iso_code || '', financial_year_end_default: item.financial_year_end_default || '', fy_is_fixed: !!item.fy_is_fixed, code: item.code || '', sort_order: item.sort_order || 0 });
    setEditItem(item); setParentCountryId(item.country_id || ''); setShowForm(true);
  };

  const save = async () => {
    if (formType === 'country') {
      const url = editItem ? `/api/platform/service-master/countries/${editItem.id}` : '/api/platform/service-master/countries';
      await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      const url = editItem ? `/api/platform/service-master/states/${editItem.id}` : '/api/platform/service-master/states';
      await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, country_id: parentCountryId }) });
      if (expanded) loadStates(expanded);
    }
    setShowForm(false); load();
  };

  const del = async (id: string, type: 'country' | 'state') => {
    if (!confirm('Delete this item?')) return;
    const base = type === 'country' ? 'countries' : 'states';
    await fetch(`/api/platform/service-master/${base}/${id}`, { method: 'DELETE' });
    load(); if (expanded) loadStates(expanded);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🌍 Countries & States</h1>
        <button className="btn-primary" onClick={() => openNew('country')} style={btnStyle}><Plus size={16} /> Add Country</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 16, border: '2px solid #4f46e5' }}>
          <h3 style={{ marginBottom: 12 }}>{editItem ? 'Edit' : 'Add'} {formType === 'country' ? 'Country' : 'State'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: formType === 'country' ? '1fr 100px 120px auto' : '1fr 100px auto', gap: 12 }}>
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            {formType === 'country' ? (
              <>
                <input placeholder="ISO Code" value={form.iso_code} onChange={e => setForm({ ...form, iso_code: e.target.value })} style={inputStyle} />
                <input placeholder="FY End (MM-DD)" value={form.financial_year_end_default} onChange={e => setForm({ ...form, financial_year_end_default: e.target.value })} style={inputStyle} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={form.fy_is_fixed} onChange={e => setForm({ ...form, fy_is_fixed: e.target.checked })} /> Fixed FY
                </label>
              </>
            ) : (
              <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} style={inputStyle} />
            )}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={save} style={{ ...btnStyle, background: '#4f46e5', color: '#fff' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={btnStyle}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={thRow}>
            <th style={th}></th><th style={th}>Name</th><th style={th}>ISO</th><th style={th}>FY End</th><th style={th}>FY Fixed</th><th style={th}>States</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>
            {countries.map(c => (
              <>
                <tr key={c.id} style={trStyle}>
                  <td style={td}><button onClick={() => toggleExpand(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    {expanded === c.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button></td>
                  <td style={{ ...td, fontWeight: 600 }}>{c.name}</td>
                  <td style={td}><span style={{ background: '#eef2ff', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{c.iso_code}</span></td>
                  <td style={td}>{c.financial_year_end_default || '—'}</td>
                  <td style={td}>{c.fy_is_fixed ? '✅ Yes' : '—'}</td>
                  <td style={td}><span style={{ fontWeight: 600 }}>{c.state_count}</span></td>
                  <td style={td}>
                    <button onClick={() => openEdit(c, 'country')} style={iconBtn}><Pencil size={14} /></button>
                    <button onClick={() => del(c.id, 'country')} style={{ ...iconBtn, color: '#ef4444' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
                {expanded === c.id && (
                  <tr key={`${c.id}-states`}><td colSpan={7} style={{ padding: '0 0 0 40px', background: '#f9fafb' }}>
                    <div style={{ padding: '12px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>States / Provinces</span>
                        <button onClick={() => openNew('state', c.id)} style={{ ...btnStyle, fontSize: 12, padding: '4px 10px' }}><Plus size={14} /> Add State</button>
                      </div>
                      {states.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No states added yet</div> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                          {states.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '6px 8px', fontSize: 13 }}>{s.name}</td>
                              <td style={{ padding: '6px 8px', fontSize: 12, color: '#6b7280' }}>{s.code}</td>
                              <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                <button onClick={() => openEdit(s, 'state')} style={iconBtn}><Pencil size={12} /></button>
                                <button onClick={() => del(s.id, 'state')} style={{ ...iconBtn, color: '#ef4444' }}><Trash2 size={12} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody></table>
                      )}
                    </div>
                  </td></tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 };
const thRow: React.CSSProperties = { background: '#f9fafb', borderBottom: '2px solid #e5e7eb' };
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6' };
const trStyle: React.CSSProperties = { cursor: 'default' };
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280' };
