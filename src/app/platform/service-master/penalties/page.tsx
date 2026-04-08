'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function PenaltiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [subComps, setSubComps] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ sub_compliance_id:'',description:'',penalty_type:'fixed',amount:'',rate:'',details:'' });

  const load = () => fetch('/api/platform/service-master/penalties').then(r=>r.json()).then(setItems);
  useEffect(() => { load(); fetch('/api/platform/service-master/sub-compliances').then(r=>r.json()).then(setSubComps); }, []);
  const save = async () => {
    await fetch('/api/platform/service-master/penalties', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setShowForm(false); load();
  };
  const del = async (id: string) => { if(!confirm('Delete?'))return; await fetch(`/api/platform/service-master/penalties/${id}`,{method:'DELETE'}); load(); };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="page-header" style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h1>⚠️ Penalties</h1>
        <button onClick={()=>{setForm({sub_compliance_id:'',description:'',penalty_type:'fixed',amount:'',rate:'',details:''});setShowForm(true);}} style={btn}><Plus size={16}/> Add Penalty</button>
      </div>
      {showForm && (
        <div className="card" style={{ padding:20,marginBottom:16,border:'2px solid #4f46e5' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12 }}>
            <div><label style={lbl}>Sub-Compliance</label><select value={form.sub_compliance_id} onChange={e=>setForm({...form,sub_compliance_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">Select...</option>{subComps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label style={lbl}>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...inp,width:'100%'}}/></div>
            <div><label style={lbl}>Type</label><select value={form.penalty_type} onChange={e=>setForm({...form,penalty_type:e.target.value})} style={{...inp,width:'100%'}}><option value="fixed">Fixed</option><option value="percentage">Percentage</option><option value="per_day">Per Day</option><option value="progressive">Progressive</option></select></div>
          </div>
          <div style={{ marginTop:8 }}><label style={lbl}>Details</label><textarea value={form.details} onChange={e=>setForm({...form,details:e.target.value})} style={{...inp,width:'100%',minHeight:60}} placeholder="Full penalty description..."/></div>
          <div style={{ marginTop:12,display:'flex',gap:8 }}>
            <button onClick={save} style={{...btn,background:'#4f46e5',color:'#fff'}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={btn}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr style={thr}><th style={th}>Sub-Compliance</th><th style={th}>Description</th><th style={th}>Type</th><th style={th}>Details</th><th style={th}>Actions</th></tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{...td,fontSize:12,color:'#6b7280'}}>{i.sub_compliance_name}</td>
              <td style={{...td,fontWeight:500}}>{i.description}</td>
              <td style={td}><span style={{ background:i.penalty_type==='percentage'?'#fef2f2':'#f0fdf4',color:i.penalty_type==='percentage'?'#dc2626':'#166534',padding:'2px 6px',borderRadius:4,fontSize:11 }}>{i.penalty_type}</span></td>
              <td style={{...td,fontSize:12,maxWidth:300}}>{i.details||'—'}</td>
              <td style={td}><button onClick={()=>del(i.id)} style={{...ib,color:'#ef4444'}}><Trash2 size={14}/></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
const btn: React.CSSProperties = { display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:6,border:'1px solid #d1d5db',background:'#fff',cursor:'pointer',fontSize:13,fontWeight:500 };
const inp: React.CSSProperties = { padding:'8px 12px',borderRadius:6,border:'1px solid #d1d5db',fontSize:13 };
const lbl: React.CSSProperties = { display:'block',fontSize:11,fontWeight:600,color:'#374151',marginBottom:4 };
const thr: React.CSSProperties = { background:'#f9fafb',borderBottom:'2px solid #e5e7eb' };
const th: React.CSSProperties = { padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:600,color:'#6b7280',textTransform:'uppercase' };
const td: React.CSSProperties = { padding:'10px 12px',fontSize:13,borderBottom:'1px solid #f3f4f6' };
const ib: React.CSSProperties = { background:'none',border:'none',cursor:'pointer',padding:4,color:'#6b7280' };
