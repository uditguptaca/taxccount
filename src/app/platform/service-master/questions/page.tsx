'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function QuestionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [subComps, setSubComps] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [compHeads, setCompHeads] = useState<any[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  const defaultForm = { sub_compliance_id:'', country_id:'', state_id:'', entity_type_id:'', department_id:'', compliance_head_id:'', question_text:'',question_type:'yes_no',description:'',is_compulsory_trigger:true,trigger_value:'yes',parent_question_id:'',triggers_sub_compliance_id:'',threshold_context:'' };
  const [form, setForm] = useState<any>(defaultForm);

  const load = () => fetch('/api/platform/service-master/questions').then(r=>r.json()).then(setItems);
  useEffect(() => { 
    load(); 
    fetch('/api/platform/service-master/sub-compliances').then(r=>r.json()).then(setSubComps);
    fetch('/api/platform/service-master/countries').then(r=>r.json()).then(setCountries);
    fetch('/api/platform/service-master/entity-types').then(r=>r.json()).then(setEntityTypes);
    fetch('/api/platform/service-master/departments').then(r=>r.json()).then(setDepartments);
    fetch('/api/platform/service-master/compliance-heads').then(r=>r.json()).then(setCompHeads);
  }, []);
  
  useEffect(() => {
    if (form.country_id) {
      fetch(`/api/platform/service-master/states?countryId=${form.country_id}`).then(r=>r.json()).then(setStates);
    } else {
      setStates([]);
    }
  }, [form.country_id]);

  const openEdit = (i: any) => { 
    setForm({ 
      sub_compliance_id:i.sub_compliance_id||'', 
      country_id:i.country_id||'', 
      state_id:i.state_id||'', 
      entity_type_id:i.entity_type_id||'', 
      department_id:i.department_id||'', 
      compliance_head_id:i.compliance_head_id||'', 
      question_text:i.question_text,
      question_type:i.question_type,
      description:i.description||'',
      is_compulsory_trigger:!!i.is_compulsory_trigger,
      trigger_value:i.trigger_value||'yes',
      parent_question_id:i.parent_question_id||'',
      triggers_sub_compliance_id:i.triggers_sub_compliance_id||'',
      threshold_context:i.threshold_context||'' 
    }); 
    setEditItem(i); setShowForm(true); 
  };
  
  const save = async () => {
    const url = editItem ? `/api/platform/service-master/questions/${editItem.id}` : '/api/platform/service-master/questions';
    await fetch(url, { method: editItem?'PUT':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setShowForm(false); load();
  };
  const del = async (id: string) => { if(!confirm('Delete?'))return; await fetch(`/api/platform/service-master/questions/${id}`,{method:'DELETE'}); load(); };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header" style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h1>❓ Applicability Questions</h1>
        <button onClick={()=>{setForm(defaultForm);setEditItem(null);setShowForm(true);}} style={btn}><Plus size={16}/> Add Question</button>
      </div>
      <p style={{ color:'#6b7280',fontSize:13,marginBottom:16 }}>These questions drive the auto-suggestion engine. You can now define dependencies natively on Country, State, Entity Type, and Department levels.</p>

      {showForm && (
        <div className="card" style={{ padding:20,marginBottom:16,border:'2px solid #4f46e5' }}>
          
          <h3 style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:12, borderBottom:'1px solid #e5e7eb', paddingBottom:6 }}>Dependency Mapping</h3>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:12, marginBottom: 16 }}>
            <div><label style={lbl}>Country</label><select value={form.country_id} onChange={e=>setForm({...form,country_id:e.target.value, state_id:''})} style={{...inp,width:'100%'}}><option value="">Any</option>{countries.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label style={lbl}>State</label><select value={form.state_id} onChange={e=>setForm({...form,state_id:e.target.value})} style={{...inp,width:'100%'}} disabled={!form.country_id}><option value="">Any</option>{states.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label style={lbl}>Entity Type</label><select value={form.entity_type_id} onChange={e=>setForm({...form,entity_type_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">Any</option>{entityTypes.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
            <div><label style={lbl}>Department</label><select value={form.department_id} onChange={e=>setForm({...form,department_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">Any</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label style={lbl}>Compliance Head</label><select value={form.compliance_head_id} onChange={e=>setForm({...form,compliance_head_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">Any</option>{compHeads.map(ch=><option key={ch.id} value={ch.id}>{ch.name}</option>)}</select></div>
            <div><label style={lbl}>Sub-Compliance</label><select value={form.sub_compliance_id} onChange={e=>setForm({...form,sub_compliance_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">Any</option>{subComps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>

          <h3 style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:12, borderBottom:'1px solid #e5e7eb', paddingBottom:6 }}>Question Detail</h3>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div><label style={lbl}>Question Type</label><select value={form.question_type} onChange={e=>setForm({...form,question_type:e.target.value})} style={{...inp,width:'100%'}}><option value="yes_no">Yes/No</option><option value="text">Text</option><option value="number">Number</option><option value="select">Select</option></select></div>
            <div style={{ gridColumn:'1/3' }}><label style={lbl}>Question Text *</label><input value={form.question_text} onChange={e=>setForm({...form,question_text:e.target.value})} style={{...inp,width:'100%'}} placeholder="e.g., Is the company having GST Registration?"/></div>
            <div><label style={lbl}>Trigger Value</label><input value={form.trigger_value} onChange={e=>setForm({...form,trigger_value:e.target.value})} style={{...inp,width:'100%'}} placeholder="yes"/></div>
            <div><label style={lbl}>Parent Question (for nesting)</label><select value={form.parent_question_id} onChange={e=>setForm({...form,parent_question_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">None (root)</option>{items.map(q=><option key={q.id} value={q.id}>{q.question_text?.substring(0,60)}</option>)}</select></div>
            <div><label style={lbl}>Triggers Different Sub-Compliance</label><select value={form.triggers_sub_compliance_id} onChange={e=>setForm({...form,triggers_sub_compliance_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">Same as above</option>{subComps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label style={lbl}>Threshold Context</label><input value={form.threshold_context} onChange={e=>setForm({...form,threshold_context:e.target.value})} style={{...inp,width:'100%'}} placeholder="e.g., If turnover >$30,000 = Annual"/></div>
          </div>
          <div style={{ marginTop:16,display:'flex',gap:8 }}>
            <button onClick={save} style={{...btn,background:'#4f46e5',color:'#fff'}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={btn}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse', minWidth:800 }}>
          <thead><tr style={thr}><th style={th}>Dependencies</th><th style={th}>Question</th><th style={th}>Type</th><th style={th}>Trigger</th><th style={th}>Actions</th></tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{...td,fontSize:11,color:'#6b7280',maxWidth:200}}>
                <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                  {i.country_name && <span style={badge}>🇨🇦 {i.country_name}</span>}
                  {i.state_name && <span style={badge}>📍 {i.state_name}</span>}
                  {i.entity_type_name && <span style={badge}>🏢 {i.entity_type_name}</span>}
                  {i.department_name && <span style={badge}>🏛️ {i.department_name}</span>}
                  {i.compliance_head_name && <span style={badge}>🎯 {i.compliance_head_name}</span>}
                  {i.sub_compliance_name && <span style={badge}>⚙️ {i.sub_compliance_name}</span>}
                  {!i.country_name && !i.state_name && !i.entity_type_name && !i.department_name && !i.compliance_head_name && !i.sub_compliance_name && <span style={badge}>Global</span>}
                </div>
              </td>
              <td style={{...td,fontWeight:500}}>{i.parent_question_id?'↳ ':''}{i.question_text}</td>
              <td style={td}><span style={{ background:'#eef2ff',padding:'2px 6px',borderRadius:4,fontSize:11 }}>{i.question_type}</span></td>
              <td style={td}>{i.trigger_value||'—'}</td>
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
const lbl: React.CSSProperties = { display:'block',fontSize:11,fontWeight:600,color:'#374151',marginBottom:4 };
const thr: React.CSSProperties = { background:'#f9fafb',borderBottom:'2px solid #e5e7eb' };
const th: React.CSSProperties = { padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:600,color:'#6b7280',textTransform:'uppercase' };
const td: React.CSSProperties = { padding:'10px 12px',fontSize:13,borderBottom:'1px solid #f3f4f6' };
const ib: React.CSSProperties = { background:'none',border:'none',cursor:'pointer',padding:4,color:'#6b7280' };
const badge: React.CSSProperties = { display:'inline-block',backgroundColor:'#f3f4f6',padding:'2px 6px',borderRadius:4,border:'1px solid #e5e7eb', whiteSpace:'nowrap' };
