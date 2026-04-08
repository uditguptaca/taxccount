'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function InfoFormsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [subComps, setSubComps] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ sub_compliance_id:'',field_label:'',field_type:'text',is_required:true,placeholder:'',help_text:'' });

  const load = () => fetch('/api/platform/service-master/info-fields').then(r=>r.json()).then(setItems);
  useEffect(() => { load(); fetch('/api/platform/service-master/sub-compliances').then(r=>r.json()).then(setSubComps); }, []);

  const save = async () => {
    await fetch('/api/platform/service-master/info-fields', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setShowForm(false); load();
  };
  const del = async (id: string) => { if(!confirm('Delete?'))return; await fetch(`/api/platform/service-master/info-fields/${id}`,{method:'DELETE'}); load(); };

  const fieldTypes = ['text','number','date','date_month','attachment','checkbox','textarea','select','undertaking'];

  // Group by sub-compliance
  const grouped = items.reduce((acc: any, item: any) => {
    const key = item.sub_compliance_name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="page-header" style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h1>📝 Information Requisition Forms</h1>
        <button onClick={()=>{setForm({sub_compliance_id:'',field_label:'',field_type:'text',is_required:true,placeholder:'',help_text:''});setShowForm(true);}} style={btn}><Plus size={16}/> Add Field</button>
      </div>
      <p style={{ color:'#6b7280',fontSize:13,marginBottom:16 }}>Custom form fields per compliance (Step 10). Users fill these when adding a compliance to their vault.</p>

      {showForm && (
        <div className="card" style={{ padding:20,marginBottom:16,border:'2px solid #4f46e5' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12 }}>
            <div><label style={lbl}>Sub-Compliance</label><select value={form.sub_compliance_id} onChange={e=>setForm({...form,sub_compliance_id:e.target.value})} style={{...inp,width:'100%'}}><option value="">Select...</option>{subComps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label style={lbl}>Field Label</label><input value={form.field_label} onChange={e=>setForm({...form,field_label:e.target.value})} style={{...inp,width:'100%'}}/></div>
            <div><label style={lbl}>Field Type</label><select value={form.field_type} onChange={e=>setForm({...form,field_type:e.target.value})} style={{...inp,width:'100%'}}>{fieldTypes.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div style={{ marginTop:12,display:'flex',gap:8 }}>
            <button onClick={save} style={{...btn,background:'#4f46e5',color:'#fff'}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={btn}>Cancel</button>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([name, fields]: [string, any]) => (
        <div key={name} className="card" style={{ marginBottom:12,padding:16 }}>
          <h3 style={{ fontSize:14,fontWeight:600,marginBottom:12,borderBottom:'1px solid #e5e7eb',paddingBottom:8 }}>{name}</h3>
          {(fields as any[]).map((f: any,idx: number) => (
            <div key={f.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:idx<fields.length-1?'1px solid #f3f4f6':'none' }}>
              <div>
                <span style={{ fontWeight:500,fontSize:13 }}>{f.field_label}</span>
                <span style={{ marginLeft:8,background:'#f3f4f6',padding:'1px 6px',borderRadius:4,fontSize:11,color:'#6b7280' }}>{f.field_type}</span>
                {f.is_required ? <span style={{ marginLeft:6,color:'#ef4444',fontSize:11 }}>Required</span> : null}
              </div>
              <button onClick={()=>del(f.id)} style={{...ib,color:'#ef4444'}}><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
const btn: React.CSSProperties = { display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:6,border:'1px solid #d1d5db',background:'#fff',cursor:'pointer',fontSize:13,fontWeight:500 };
const inp: React.CSSProperties = { padding:'8px 12px',borderRadius:6,border:'1px solid #d1d5db',fontSize:13 };
const lbl: React.CSSProperties = { display:'block',fontSize:11,fontWeight:600,color:'#374151',marginBottom:4 };
const ib: React.CSSProperties = { background:'none',border:'none',cursor:'pointer',padding:4,color:'#6b7280' };
