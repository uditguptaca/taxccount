'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function RulesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [subComps, setSubComps] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ sub_compliance_id:'',country_id:'',state_id:'',entity_type_id:'',department_id:'' });

  const load = () => fetch('/api/platform/service-master/rules').then(r=>r.json()).then(setItems);
  useEffect(() => {
    load();
    fetch('/api/platform/service-master/sub-compliances').then(r=>r.json()).then(setSubComps);
    fetch('/api/platform/service-master/countries').then(r=>r.json()).then(setCountries);
    fetch('/api/platform/service-master/entity-types').then(r=>r.json()).then(setEntityTypes);
    fetch('/api/platform/service-master/departments').then(r=>r.json()).then(setDepartments);
  }, []);

  const loadStates = (cId: string) => {
    if (cId) fetch(`/api/platform/service-master/states?countryId=${cId}`).then(r=>r.json()).then(setStates);
    else setStates([]);
  };

  const save = async () => {
    await fetch('/api/platform/service-master/rules', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, country_id: form.country_id||null, state_id: form.state_id||null, entity_type_id: form.entity_type_id||null, department_id: form.department_id||null }) });
    setShowForm(false); load();
  };
  const del = async (id: string) => { if(!confirm('Delete?'))return; await fetch(`/api/platform/service-master/rules/${id}`,{method:'DELETE'}); load(); };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header" style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h1>🔗 Service Rules</h1>
        <button onClick={()=>{setForm({sub_compliance_id:'',country_id:'',state_id:'',entity_type_id:'',department_id:''});setShowForm(true);}} style={btn}><Plus size={16}/> Add Rule</button>
      </div>
      <p style={{ color:'#6b7280',fontSize:13,marginBottom:16 }}>Map sub-compliances to jurisdictions. NULL = applies to all in that dimension.</p>

      {showForm && (
        <div className="card" style={{ padding:20,marginBottom:16,border:'2px solid #4f46e5' }}>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:12 }}>
            <div><label style={lbl}>Sub-Compliance *</label>
              <select value={form.sub_compliance_id} onChange={e=>setForm({...form,sub_compliance_id:e.target.value})} style={{...inp,width:'100%'}}>
                <option value="">Select...</option>{subComps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            <div><label style={lbl}>Country (NULL=All)</label>
              <select value={form.country_id} onChange={e=>{setForm({...form,country_id:e.target.value,state_id:''});loadStates(e.target.value);}} style={{...inp,width:'100%'}}>
                <option value="">All Countries</option>{countries.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label style={lbl}>State (NULL=All)</label>
              <select value={form.state_id} onChange={e=>setForm({...form,state_id:e.target.value})} style={{...inp,width:'100%'}} disabled={!form.country_id}>
                <option value="">All States</option>{states.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            <div><label style={lbl}>Entity Type (NULL=All)</label>
              <select value={form.entity_type_id} onChange={e=>setForm({...form,entity_type_id:e.target.value})} style={{...inp,width:'100%'}}>
                <option value="">All Types</option>{entityTypes.map(e2=><option key={e2.id} value={e2.id}>{e2.name}</option>)}
              </select></div>
            <div><label style={lbl}>Department (NULL=All)</label>
              <select value={form.department_id} onChange={e=>setForm({...form,department_id:e.target.value})} style={{...inp,width:'100%'}}>
                <option value="">All Depts</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select></div>
          </div>
          <div style={{ marginTop:12,display:'flex',gap:8 }}>
            <button onClick={save} style={{...btn,background:'#4f46e5',color:'#fff'}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={btn}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr style={thr}><th style={th}>Sub-Compliance</th><th style={th}>Country</th><th style={th}>State</th><th style={th}>Entity Type</th><th style={th}>Department</th><th style={th}>Actions</th></tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{...td,fontWeight:600}}>{i.sub_compliance_name}</td>
              <td style={td}>{i.country_name||<span style={{color:'#9ca3af',fontStyle:'italic'}}>All</span>}</td>
              <td style={td}>{i.state_name||<span style={{color:'#9ca3af',fontStyle:'italic'}}>All</span>}</td>
              <td style={td}>{i.entity_type_name||<span style={{color:'#9ca3af',fontStyle:'italic'}}>All</span>}</td>
              <td style={td}>{i.department_name||<span style={{color:'#9ca3af',fontStyle:'italic'}}>All</span>}</td>
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
