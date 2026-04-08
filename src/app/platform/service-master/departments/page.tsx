'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = () => fetch('/api/platform/service-master/departments').then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);
  const openNew = () => { setForm({ name: '', description: '' }); setEditItem(null); setShowForm(true); };
  const openEdit = (i: any) => { setForm({ name: i.name, description: i.description || '' }); setEditItem(i); setShowForm(true); };
  const save = async () => {
    const url = editItem ? `/api/platform/service-master/departments/${editItem.id}` : '/api/platform/service-master/departments';
    await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false); load();
  };
  const del = async (id: string) => { if (!confirm('Delete?')) return; await fetch(`/api/platform/service-master/departments/${id}`, { method: 'DELETE' }); load(); };

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏢 Departments</h1>
        <button onClick={openNew} style={btn}><Plus size={16} /> Add Department</button>
      </div>
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 16, border: '2px solid #4f46e5' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} />
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inp} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={save} style={{ ...btn, background: '#4f46e5', color: '#fff' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={btn}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={thr}><th style={th}>Name</th><th style={th}>Description</th><th style={th}>Actions</th></tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}><td style={{ ...td, fontWeight: 600 }}>{i.name}</td><td style={td}>{i.description || '—'}</td>
            <td style={td}><button onClick={() => openEdit(i)} style={ib}><Pencil size={14}/></button><button onClick={() => del(i.id)} style={{...ib,color:'#ef4444'}}><Trash2 size={14}/></button></td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
const btn: React.CSSProperties = { display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:6,border:'1px solid #d1d5db',background:'#fff',cursor:'pointer',fontSize:13,fontWeight:500 };
const inp: React.CSSProperties = { padding:'8px 12px',borderRadius:6,border:'1px solid #d1d5db',fontSize:13 };
const thr: React.CSSProperties = { background:'#f9fafb',borderBottom:'2px solid #e5e7eb' };
const th: React.CSSProperties = { padding:'10px 12px',textAlign:'left',fontSize:12,fontWeight:600,color:'#6b7280',textTransform:'uppercase' };
const td: React.CSSProperties = { padding:'10px 12px',fontSize:13,borderBottom:'1px solid #f3f4f6' };
const ib: React.CSSProperties = { background:'none',border:'none',cursor:'pointer',padding:4,color:'#6b7280' };
