'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

export default function SubCompliancesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [heads, setHeads] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [filterHead, setFilterHead] = useState('');
  const [form, setForm] = useState<any>({ compliance_head_id:'',name:'',short_name:'',description:'',brief:'',has_compliance_date:true,dependency_type:'',dependency_label:'',period_type:'yearly',period_value:1,grace_value:0,grace_unit:'months',is_compulsory:false,undertaking_required:false,undertaking_text:'' });

  const load = () => {
    const url = filterHead ? `/api/platform/service-master/sub-compliances?headId=${filterHead}` : '/api/platform/service-master/sub-compliances';
    fetch(url).then(r=>r.json()).then(setItems);
  };
  useEffect(() => { load(); }, [filterHead]);
  useEffect(() => { fetch('/api/platform/service-master/compliance-heads').then(r=>r.json()).then(setHeads); }, []);

  const openNew = () => { setForm({ compliance_head_id:filterHead||'',name:'',short_name:'',description:'',brief:'',has_compliance_date:true,dependency_type:'financial_year_corporate_tax',dependency_label:'',period_type:'yearly',period_value:1,grace_value:0,grace_unit:'months',is_compulsory:false,undertaking_required:false,undertaking_text:'' }); setEditItem(null); setShowForm(true); };
  const openEdit = (i: any) => { setForm({ compliance_head_id:i.compliance_head_id,name:i.name,short_name:i.short_name||'',description:i.description||'',brief:i.brief||'',has_compliance_date:!!i.has_compliance_date,dependency_type:i.dependency_type||'',dependency_label:i.dependency_label||'',period_type:i.period_type||'yearly',period_value:i.period_value||1,grace_value:i.grace_value||0,grace_unit:i.grace_unit||'months',is_compulsory:!!i.is_compulsory,undertaking_required:!!i.undertaking_required,undertaking_text:i.undertaking_text||'' }); setEditItem(i); setShowForm(true); };

  const save = async () => {
    const url = editItem ? `/api/platform/service-master/sub-compliances/${editItem.id}` : '/api/platform/service-master/sub-compliances';
    await fetch(url, { method: editItem?'PUT':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setShowForm(false); load();
  };
  const del = async (id: string) => { if(!confirm('Delete?'))return; await fetch(`/api/platform/service-master/sub-compliances/${id}`,{method:'DELETE'}); load(); };

  const depTypes = ['financial_year_corporate_tax','financial_year_gst','financial_year_payroll','incorporation_date_federal','incorporation_date_provincial','calendar_year_fixed','specific_event','none'];
  const periodTypes = ['yearly','semi_annual','quarterly','monthly','custom_days','renewal'];
  const graceUnits = ['days','months','quarters','years'];

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header" style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h1>📄 Sub-Compliances</h1>
        <div style={{ display:'flex',gap:8 }}>
          <select value={filterHead} onChange={e=>setFilterHead(e.target.value)} style={inp}>
            <option value="">All Heads</option>
            {heads.map(h=><option key={h.id} value={h.id}>{h.icon} {h.name}</option>)}
          </select>
          <button onClick={openNew} style={btn}><Plus size={16}/> Add</button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ padding:20,marginBottom:16,border:'2px solid #4f46e5',maxHeight:'70vh',overflowY:'auto' }}>
          <h3 style={{ marginBottom:16 }}>{editItem?'Edit':'Add'} Sub-Compliance</h3>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div><label style={lbl}>Compliance Head *</label>
              <select value={form.compliance_head_id} onChange={e=>setForm({...form,compliance_head_id:e.target.value})} style={{...inp,width:'100%'}}>
                <option value="">Select...</option>{heads.map(h=><option key={h.id} value={h.id}>{h.icon} {h.name}</option>)}
              </select></div>
            <div><label style={lbl}>Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{...inp,width:'100%'}}/></div>
            <div><label style={lbl}>Short Name</label><input value={form.short_name} onChange={e=>setForm({...form,short_name:e.target.value})} style={{...inp,width:'100%'}}/></div>
            <div><label style={lbl}>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...inp,width:'100%'}}/></div>
          </div>

          <div style={{ marginTop:12 }}><label style={lbl}>Brief (Step 11)</label>
            <textarea value={form.brief} onChange={e=>setForm({...form,brief:e.target.value})} style={{...inp,width:'100%',minHeight:80}} placeholder="Detailed description shown to users..."/></div>

          <div style={{ display:'flex',gap:16,marginTop:16 }}>
            <label style={{ display:'flex',alignItems:'center',gap:6,fontSize:13 }}><input type="checkbox" checked={form.has_compliance_date} onChange={e=>setForm({...form,has_compliance_date:e.target.checked})}/> Has Compliance Date</label>
            <label style={{ display:'flex',alignItems:'center',gap:6,fontSize:13 }}><input type="checkbox" checked={form.is_compulsory} onChange={e=>setForm({...form,is_compulsory:e.target.checked})}/> Compulsory</label>
            <label style={{ display:'flex',alignItems:'center',gap:6,fontSize:13 }}><input type="checkbox" checked={form.undertaking_required} onChange={e=>setForm({...form,undertaking_required:e.target.checked})}/> Undertaking Required</label>
          </div>

          {form.has_compliance_date && (
            <div style={{ marginTop:16,padding:16,background:'#f0fdf4',borderRadius:8,border:'1px solid #bbf7d0' }}>
              <h4 style={{ fontSize:14,fontWeight:600,color:'#166534',marginBottom:12 }}>📅 Date Calculation Settings (Steps 7-9)</h4>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12 }}>
                <div><label style={lbl}>Dependency Type (Step 9)</label>
                  <select value={form.dependency_type} onChange={e=>setForm({...form,dependency_type:e.target.value})} style={{...inp,width:'100%'}}>
                    {depTypes.map(d=><option key={d} value={d}>{d.replace(/_/g,' ')}</option>)}
                  </select></div>
                <div><label style={lbl}>Period Type (Step 7)</label>
                  <select value={form.period_type} onChange={e=>setForm({...form,period_type:e.target.value})} style={{...inp,width:'100%'}}>
                    {periodTypes.map(p=><option key={p} value={p}>{p.replace(/_/g,' ')}</option>)}
                  </select></div>
                <div><label style={lbl}>Grace Value (Step 8)</label>
                  <input type="number" value={form.grace_value} onChange={e=>setForm({...form,grace_value:parseInt(e.target.value)||0})} style={{...inp,width:'100%'}}/></div>
                <div><label style={lbl}>Grace Unit</label>
                  <select value={form.grace_unit} onChange={e=>setForm({...form,grace_unit:e.target.value})} style={{...inp,width:'100%'}}>
                    {graceUnits.map(u=><option key={u} value={u}>{u}</option>)}
                  </select></div>
              </div>
              <div style={{ marginTop:8 }}><label style={lbl}>Dependency Label</label>
                <input value={form.dependency_label} onChange={e=>setForm({...form,dependency_label:e.target.value})} placeholder="e.g., Financial Year End (Corporate Tax)" style={{...inp,width:'100%'}}/></div>
            </div>
          )}

          <div style={{ marginTop:12,display:'flex',gap:8 }}>
            <button onClick={save} style={{...btn,background:'#4f46e5',color:'#fff'}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={btn}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',minWidth:900 }}>
          <thead><tr style={thr}><th style={th}>Head</th><th style={th}>Name</th><th style={th}>Has Date</th><th style={th}>Dep. Type</th><th style={th}>Period</th><th style={th}>Grace</th><th style={th}>Compulsory</th><th style={th}>Actions</th></tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{...td,fontSize:12,color:'#6b7280'}}>{i.compliance_head_name}</td>
              <td style={{...td,fontWeight:600}}>{i.name}</td>
              <td style={td}>{i.has_compliance_date?'✅':'❌'}</td>
              <td style={{...td,fontSize:11}}>{i.dependency_type?.replace(/_/g,' ')||'—'}</td>
              <td style={td}>{i.period_type||'—'}</td>
              <td style={td}>{i.grace_value?`${i.grace_value} ${i.grace_unit||''}`:'—'}</td>
              <td style={td}>{i.is_compulsory?'🔒 Yes':'—'}</td>
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
const lbl: React.CSSProperties = { display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:4 };
const thr: React.CSSProperties = { background:'#f9fafb',borderBottom:'2px solid #e5e7eb' };
const th: React.CSSProperties = { padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:600,color:'#6b7280',textTransform:'uppercase' };
const td: React.CSSProperties = { padding:'10px 12px',fontSize:13,borderBottom:'1px solid #f3f4f6' };
const ib: React.CSSProperties = { background:'none',border:'none',cursor:'pointer',padding:4,color:'#6b7280' };
