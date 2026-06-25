'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Settings, FileText, CheckSquare, Type, Calendar, Hash, Paperclip, ShieldAlert, Cpu, Eye, Trash2, GripVertical, FileImage } from 'lucide-react';

export default function SmartFormBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [form, setForm] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/smart-forms/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setForm(data.form);
      setSections(data.sections || []);
      setQuestions(data.questions || []);
      setDocuments(data.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showSave = (msg: string) => { setSaveSuccess(msg); setTimeout(() => setSaveSuccess(''), 3000); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/smart-forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_builder',
          versionId: form.current_version,
          sections,
          questions,
          documents,
          conditions: [],
          ocrMaps: [],
          aiRules: []
        })
      });
      showSave('Draft saved successfully');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type: string) => {
    const newQ = {
      id: crypto.randomUUID(),
      question_text: 'New Question',
      question_type: type,
      section_id: sections[0]?.id || null,
      is_required: false,
      is_ai_assisted: false,
    };
    setQuestions([...questions, newQ]);
    setSelectedQuestion(newQ);
  };

  const updateSelectedQuestion = (field: string, value: any) => {
    if (!selectedQuestion) return;
    const updated = { ...selectedQuestion, [field]: value };
    setSelectedQuestion(updated);
    setQuestions(questions.map(q => q.id === selectedQuestion.id ? updated : q));
  };

  const deleteQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
    if (selectedQuestion?.id === qId) setSelectedQuestion(null);
  };

  if (loading) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-500)' }}>Loading builder...</div>;
  if (!form) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-danger)' }}>Form not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--color-gray-50)', margin: 'calc(-1 * var(--space-6))' }}>
      
      {/* Topbar */}
      <div style={{ 
        height: '64px', background: 'white', borderBottom: '1px solid var(--color-gray-200)', 
        padding: '0 var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', shrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button onClick={() => router.push('/dashboard/smart-forms')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-gray-500)' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>{form.name}</h1>
            <span className="badge badge-gray">v1.0 (Draft)</span>
          </div>
        </div>
        <div style={{ display: 'flex', itemsCenter: 'center', gap: 'var(--space-3)' }}>
          {saveSuccess && <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: 500, alignSelf: 'center' }}>✓ {saveSuccess}</span>}
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Eye size={16} /> Preview
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar - Blocks */}
        <div style={{ width: '280px', background: 'white', borderRight: '1px solid var(--color-gray-200)', padding: 'var(--space-4)', overflowY: 'auto', shrink: 0 }}>
          <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-500)', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>Form Blocks</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('text')}>
              <Type size={16} style={{ color: 'var(--color-gray-400)' }} /> Short Text
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('long_text')}>
              <FileText size={16} style={{ color: 'var(--color-gray-400)' }} /> Long Text
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('number')}>
              <Hash size={16} style={{ color: 'var(--color-gray-400)' }} /> Number
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('date')}>
              <Calendar size={16} style={{ color: 'var(--color-gray-400)' }} /> Date
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('checkbox')}>
              <CheckSquare size={16} style={{ color: 'var(--color-gray-400)' }} /> Checkbox
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('file')}>
              <Paperclip size={16} style={{ color: 'var(--color-gray-400)' }} /> File Upload
            </button>
          </div>

          <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>AI Features</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)', width: '100%' }}>
              <Cpu size={16} /> OCR Mapping
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)', width: '100%' }}>
              <ShieldAlert size={16} /> Auto Anomaly Check
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)', position: 'relative' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '120px' }}>
            
            {/* Main Form Info */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-body">
                <h2 
                  style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)', outline: 'none' }} 
                  contentEditable suppressContentEditableWarning
                >
                  {form.name}
                </h2>
                <p 
                  className="text-muted" 
                  style={{ outline: 'none' }} 
                  contentEditable suppressContentEditableWarning
                >
                  {form.description || 'Add a description for the client...'}
                </p>
              </div>
            </div>

            {/* Questions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {questions.map((q, i) => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <div 
                    key={q.id} 
                    onClick={() => setSelectedQuestion(q)}
                    className="card"
                    style={{ 
                      cursor: 'pointer', 
                      position: 'relative',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div className="card-body" style={{ paddingLeft: 'var(--space-8)' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', cursor: 'grab' }}>
                        <GripVertical size={20} />
                      </div>
                      <div style={{ position: 'absolute', right: '16px', top: '16px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }} style={{ color: 'var(--color-danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {q.question_type.replace('_', ' ')}
                        </span>
                        {q.is_required && <span className="badge badge-red">Required</span>}
                        {q.is_ai_assisted && (
                          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Cpu size={12}/> AI Assisted
                          </span>
                        )}
                      </div>
                      
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
                        {q.question_text || 'Untitled Question'}
                      </h3>
                      {q.description && <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>{q.description}</p>}
                      
                      {/* Fake input display */}
                      <div style={{ marginTop: 'var(--space-4)', pointerEvents: 'none' }}>
                        {q.question_type === 'text' && <input className="form-control" disabled placeholder="Text input..." />}
                        {q.question_type === 'long_text' && <textarea className="form-control" disabled rows={3} placeholder="Long text input..." />}
                        {q.question_type === 'number' && <input className="form-control" disabled placeholder="Number input..." type="number" />}
                        {q.question_type === 'date' && <input className="form-control" disabled placeholder="Date input..." type="date" />}
                        {q.question_type === 'checkbox' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" disabled style={{ width: 16, height: 16 }} /> <span className="text-muted">Option</span>
                          </label>
                        )}
                        {q.question_type === 'file' && (
                          <div style={{ width: '100%', height: '100px', border: '2px dashed var(--color-gray-300)', borderRadius: 'var(--radius-md)', background: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)' }}>
                            <FileImage size={24}/>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {questions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--color-gray-300)', borderRadius: 'var(--radius-lg)', background: 'var(--color-gray-50)' }}>
                  <p className="text-muted">Drag and drop blocks here or click to add.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div style={{ width: '320px', background: 'white', borderLeft: '1px solid var(--color-gray-200)', padding: 'var(--space-5)', overflowY: 'auto', shrink: 0 }}>
          {selectedQuestion ? (
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-900)', letterSpacing: '0.05em', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Settings size={16} /> Question Properties
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <textarea 
                    value={selectedQuestion.question_text}
                    onChange={(e) => updateSelectedQuestion('question_text', e.target.value)}
                    className="form-control"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea 
                    value={selectedQuestion.description || ''}
                    onChange={(e) => updateSelectedQuestion('description', e.target.value)}
                    className="form-control"
                    rows={2}
                  />
                </div>
                
                <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--color-gray-50)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedQuestion.is_required}
                      onChange={(e) => updateSelectedQuestion('is_required', e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Required Field</span>
                  </label>
                </div>

                <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Cpu size={16} style={{ color: 'var(--color-primary)' }} /> AI Features
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-primary-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--color-primary-light)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedQuestion.is_ai_assisted}
                      onChange={(e) => updateSelectedQuestion('is_ai_assisted', e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-primary)' }}>Enable AI Auto-Fill / OCR</span>
                  </label>
                  
                  {selectedQuestion.is_ai_assisted && (
                    <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>OCR Mapping Key (Source Document)</label>
                        <input 
                          type="text"
                          value={selectedQuestion.ocr_mapping_key || ''}
                          onChange={(e) => updateSelectedQuestion('ocr_mapping_key', e.target.value)}
                          placeholder="e.g. 'T4 Box 14'"
                          className="form-control"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-gray-400)' }}>
              <Settings style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} size={32} />
              <p className="text-sm">Select a question to edit its properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
