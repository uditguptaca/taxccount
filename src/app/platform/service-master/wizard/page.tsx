'use client';
import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ServiceMasterWizard() {
  const [step, setStep] = useState(1);
  const [heads, setHeads] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  
  // Data payload
  const [data, setData] = useState<any>({
    head_id: '',
    name: '', short_name: '', description: '', brief: '',
    has_compliance_date: true,
    dependency_type: 'financial_year_corporate_tax', dependency_label: '',
    period_type: 'yearly', period_value: 1,
    grace_value: 0, grace_unit: 'months',
    is_compulsory: false, undertaking_required: false, undertaking_text: '',
    rules: [],
    questions: [],
    infoForms: [],
    penalties: []
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/platform/service-master/compliance-heads').then(r=>r.json()).then(setHeads);
    fetch('/api/platform/service-master/countries').then(r=>r.json()).then(setCountries);
    fetch('/api/platform/service-master/entity-types').then(r=>r.json()).then(setEntityTypes);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/platform/service-master/wizard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Compliance fully created!');
      window.location.href = '/platform/service-master/sub-compliances';
    } catch (e: any) {
      alert('Error: ' + e.message);
      setSaving(false);
    }
  };

  const addRule = () => setData({ ...data, rules: [...data.rules, { country_id: '', entity_type_id: '' }] });
  const addQuestion = () => setData({ ...data, questions: [...data.questions, { _tempId: Date.now().toString(), question_text: '', question_type: 'yes_no', is_compulsory_trigger: false, trigger_value: 'yes' }] });
  const addInfoForm = () => setData({ ...data, infoForms: [...data.infoForms, { field_label: '', field_type: 'text', is_required: false }] });

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1>✨ Service Master Wizard Builder</h1>
        <p style={{ color: '#6b7280' }}>Author an entire compliance definition in a single flow.</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[1,2,3,4].map(s => (
          <div key={s} style={{ flex: 1, height: 6, background: step >= s ? '#4f46e5' : '#e5e7eb', borderRadius: 3 }} />
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        
        {step === 1 && (
          <div>
            <h2 style={h2}>1. Core Details</h2>
            <div style={grid}>
              <div><label style={lbl}>Compliance Head *</label>
                <select style={inp} value={data.head_id} onChange={e=>setData({...data, head_id: e.target.value})}>
                  <option value="">Select...</option>
                  {heads.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
                </select></div>
              <div><label style={lbl}>Name *</label>
                <input style={inp} value={data.name} onChange={e=>setData({...data, name: e.target.value})} placeholder="e.g. GST Annual Return" /></div>
              <div><label style={lbl}>Brief (Full Undertaking Description)</label>
                <textarea style={{...inp, gridColumn:'1/-1', minHeight: 80}} value={data.brief} onChange={e=>setData({...data, brief: e.target.value})} /></div>
              
              <div style={{gridColumn:'1/-1', display:'flex', gap:16, marginTop: 12}}>
                <label style={{display:'flex', gap:8, alignItems:'center', fontSize:13}}>
                  <input type="checkbox" checked={data.is_compulsory} onChange={e=>setData({...data, is_compulsory: e.target.checked})} /> Is Compulsory Auto-Apply?
                </label>
                <label style={{display:'flex', gap:8, alignItems:'center', fontSize:13}}>
                  <input type="checkbox" checked={data.undertaking_required} onChange={e=>setData({...data, undertaking_required: e.target.checked})} /> Require Confirm Undertaking?
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={h2}>2. Date Formula (Dependency)</h2>
            <label style={{display:'flex', gap:8, alignItems:'center', fontSize:14, marginBottom:16}}>
              <input type="checkbox" checked={data.has_compliance_date} onChange={e=>setData({...data, has_compliance_date: e.target.checked})} /> This compliance has a calculated due date (Section A)
            </label>
            
            {data.has_compliance_date ? (
              <div style={grid}>
                <div><label style={lbl}>Base Date / Dependency Type</label>
                  <select style={inp} value={data.dependency_type} onChange={e=>setData({...data, dependency_type: e.target.value})}>
                    <option value="financial_year_corporate_tax">Financial Year (Corp Tax)</option>
                    <option value="financial_year_gst">Financial Year (GST)</option>
                    <option value="financial_year_payroll">Financial Year (Payroll)</option>
                    <option value="incorporation_date_federal">Incorporation Date (Federal)</option>
                    <option value="incorporation_date_provincial">Incorporation Date (Provincial)</option>
                    <option value="calendar_year_fixed">Calendar Year Fixed (e.g. Mar 31)</option>
                    <option value="specific_event">Specific Event Input</option>
                  </select></div>
                <div><label style={lbl}>Period Type</label>
                  <select style={inp} value={data.period_type} onChange={e=>setData({...data, period_type: e.target.value})}>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="renewal">Renewal (Years)</option>
                  </select></div>
                <div><label style={lbl}>Grace Value</label>
                  <input style={inp} type="number" value={data.grace_value} onChange={e=>setData({...data, grace_value: Number(e.target.value)})} /></div>
                <div><label style={lbl}>Grace Unit</label>
                  <select style={inp} value={data.grace_unit} onChange={e=>setData({...data, grace_unit: e.target.value})}>
                    <option value="days">Days</option><option value="months">Months</option><option value="years">Years</option>
                  </select></div>
              </div>
            ) : (
             <p style={{color:'#6b7280', fontSize:13}}>This falls under Section B (Advisory, Litigation, Health Check). No dates required.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={h2}>3. Rules & Suggestions</h2>
            
            <h3 style={h3}>Jurisdiction Rules <button onClick={addRule} style={smBtn}><Plus size={14}/> Add</button></h3>
            {data.rules.map((r: any, idx: number) => (
              <div key={idx} style={{display:'flex', gap:12, marginBottom:8}}>
                <select style={inp} value={r.country_id} onChange={e => { const nr = [...data.rules]; nr[idx].country_id = e.target.value; setData({...data, rules: nr}); }}>
                  <option value="">All Countries</option>
                  {countries.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select style={inp} value={r.entity_type_id} onChange={e => { const nr = [...data.rules]; nr[idx].entity_type_id = e.target.value; setData({...data, rules: nr}); }}>
                  <option value="">All Entity Types</option>
                  {entityTypes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            ))}

            <h3 style={{...h3, marginTop:24}}>Applicability Questions <button onClick={addQuestion} style={smBtn}><Plus size={14}/> Add Question</button></h3>
            <p style={{fontSize:12, color:'#6b7280', marginBottom:12}}>These dynamically ask the user if this applies to them.</p>
            {data.questions.map((q: any, idx: number) => (
              <div key={idx} style={{padding:12, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, marginBottom:12}}>
                <input style={{...inp, width:'100%', marginBottom:8}} placeholder="e.g. Do you have a GST number?" value={q.question_text} onChange={e => { const nq = [...data.questions]; nq[idx].question_text = e.target.value; setData({...data, questions: nq}); }} />
                <label style={{display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#4f46e5', fontWeight:600}}>
                  <input type="checkbox" checked={q.is_compulsory_trigger} onChange={e => { const nq = [...data.questions]; nq[idx].is_compulsory_trigger = e.target.checked; setData({...data, questions: nq}); }} />
                  Answering "Yes" automatically triggers this compliance
                </label>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
             <h2 style={h2}>4. Information Requisition Forms</h2>
             <p style={{fontSize:13, color:'#6b7280', marginBottom:16}}>What documents or data fields do you need to collect from the individual?</p>
             
             <button onClick={addInfoForm} style={{...smBtn, marginBottom:12}}><Plus size={14}/> Add Field</button>
             {data.infoForms.map((f: any, idx: number) => (
               <div key={idx} style={{display:'flex', gap:12, marginBottom:8, alignItems:'center'}}>
                 <input style={{...inp, flex:2}} placeholder="Field Label (e.g. Sales in CAD)" value={f.field_label} onChange={e => { const nf = [...data.infoForms]; nf[idx].field_label = e.target.value; setData({...data, infoForms: nf}); }} />
                 <select style={{...inp, flex:1}} value={f.field_type} onChange={e => { const nf = [...data.infoForms]; nf[idx].field_type = e.target.value; setData({...data, infoForms: nf}); }}>
                   <option value="text">Text</option>
                   <option value="number">Number</option>
                   <option value="attachment">Attachment</option>
                   <option value="textarea">Text Area</option>
                   <option value="undertaking">Undertaking Checkbox</option>
                 </select>
                 <label style={{display:'flex', gap:8, alignItems:'center', fontSize:12}}>
                   <input type="checkbox" checked={f.is_required} onChange={e => { const nf = [...data.infoForms]; nf[idx].is_required = e.target.checked; setData({...data, infoForms: nf}); }} /> Required
                 </label>
               </div>
             ))}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', marginTop: 32, paddingTop: 16, borderTop:'1px solid #e5e7eb' }}>
          {step > 1 ? <button onClick={() => setStep(step-1)} style={btn}><ArrowLeft size={16}/> Back</button> : <div/>}
          
          {step < 4 ? (
            <button onClick={() => { if(step===1 && (!data.head_id || !data.name)) return alert('Fill required fields'); setStep(step+1); }} style={{...btn, background:'#4f46e5', color:'#fff'}}>Next <ArrowRight size={16}/></button>
          ) : (
            <button onClick={save} disabled={saving} style={{...btn, background:'#059669', color:'#fff'}}><Save size={16}/> {saving ? 'Saving...' : 'Finish & Create'}</button>
          )}
        </div>

      </div>
    </div>
  );
}

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 16 };
const h3: React.CSSProperties = { display:'flex', alignItems:'center', gap:12, fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inp: React.CSSProperties = { width:'100%', padding:'8px 12px', borderRadius: 6, border:'1px solid #d1d5db', fontSize: 13, outline: 'none' };
const btn: React.CSSProperties = { display:'flex', alignItems:'center', gap: 6, padding:'10px 20px', borderRadius: 8, border:'1px solid #d1d5db', background:'#fff', cursor:'pointer', fontSize: 14, fontWeight: 500 };
const smBtn: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius: 6, border:'1px solid #e5e7eb', background:'#f9fafb', fontSize: 12, cursor:'pointer' };
