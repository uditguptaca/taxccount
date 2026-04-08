'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function ComplianceHeadsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', short_name: '', description: '', icon: '', color_code: '#3b82f6' });

  const load = () => fetch('/api/platform/service-master/compliance-heads').then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);
  const openNew = () => { setForm({ name: '', short_name: '', description: '', icon: '', color_code: '#3b82f6' }); setEditItem(null); setShowForm(true); };
  const openEdit = (i: any) => { setForm({ name: i.name, short_name: i.short_name||'', description: i.description||'', icon: i.icon||'', color_code: i.color_code||'#3b82f6' }); setEditItem(i); setShowForm(true); };
  const save = async () => {
    const url = editItem ? `/api/platform/service-master/compliance-heads/${editItem.id}` : '/api/platform/service-master/compliance-heads';
    await fetch(url, { method: editItem?'PUT':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setShowForm(false); load();
  };
  const del = async (id: string) => { if(!confirm('Delete?'))return; await fetch(`/api/platform/service-master/compliance-heads/${id}`,{method:'DELETE'}); load(); };

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header" style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h1>📑 Compliance Heads</h1>
        <button onClick={openNew} style={btn}><Plus size={16}/> Add Head</button>
      </div>
      {showForm && (
        <div className="card" style={{ padding:20,marginBottom:16,border:'2px solid #4f46e5' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 100px 2fr 60px 100px',gap:12 }}>
            <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp}/>
            <input placeholder="Short" value={form.short_name} onChange={e=>setForm({...form,short_name:e.target.value})} style={inp}/>
            <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={inp}/>
            <input placeholder="Icon" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} style={inp}/>
            <input type="color" value={form.color_code} onChange={e=>setForm({...form,color_code:e.target.value})} style={{...inp,padding:2,height:36}}/>
          </div>
          <div style={{ marginTop:12,display:'flex',gap:8 }}>
            <button onClick={save} style={{...btn,background:'#4f46e5',color:'#fff'}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={btn}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card">
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr style={thr}><th style={th}>Icon</th><th style={th}>Name</th><th style={th}>Short</th><th style={th}>Description</th><th style={th}>Sub-Compliances</th><th style={th}>Actions</th></tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={td}><span style={{ fontSize:20 }}>{i.icon||'📄'}</span></td>
              <td style={{...td,fontWeight:600}}><span style={{ borderLeft:`3px solid ${i.color_code||'#ccc'}`, paddingLeft:8 }}>{i.name}</span></td>
              <td style={td}>{i.short_name||'—'}</td>
              <td style={{...td,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{i.description||'—'}</td>
              <td style={td}><span style={{ fontWeight:600 }}>{i.sub_compliance_count}</span></td>
              <td style={td}><button onClick={()=>openEdit(i)} style={ib}><Pencil size={14}/></button><button onClick={()=>del(i.id)} style={{...ib,color:'#ef4444'}}><Trash2 size={14}/></button></td>
            </tr>
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
