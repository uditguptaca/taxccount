'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function FillSmartFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams?.get('client_id');
  const backUrl = clientId ? `/portal/smart-forms?client_id=${clientId}` : '/portal/smart-forms';
  
  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/portal/smart-forms/${id}`);
      if (!res.ok) throw new Error('Failed to load form');
      const data = await res.json();
      
      setAssignment(data.assignment);
      setSections(data.sections || []);
      setQuestions(data.questions || []);
      
      const resps: Record<string, any> = {};
      (data.responses || []).forEach((r: any) => {
        let val = r.response_value;
        try { val = JSON.parse(val); } catch { /* ignore */ }
        resps[r.question_id] = val;
      });
      setResponses(resps);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (questionId: string, val: any) => {
    setResponses(prev => ({ ...prev, [questionId]: val }));
  };

  const handleSave = async (isSubmit = false) => {
    if (isSubmit) setSubmitting(true);
    else setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/portal/smart-forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_responses', responses, is_final_submit: isSubmit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (isSubmit) {
        router.push('/portal/smart-forms');
      } else {
        setAssignment({ ...assignment, status: data.status });
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>Loading form...</div>;
  if (errorMsg && !assignment) return <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'red' }}>{errorMsg}</div>;

  const isCompleted = assignment?.status === 'Completed' || assignment?.status === 'Under review';

  return (
    <div className="portal-content-area" style={{ padding: 'var(--space-6)', maxWidth: 800, margin: '0 auto', paddingBottom: '100px' }}>
      <Link href={backUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-500)', fontSize: '14px', marginBottom: 'var(--space-6)' }}>
        <ArrowLeft size={16} /> Back to Forms
      </Link>

      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #e5e7eb', padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: 'var(--space-2)' }}>{assignment?.form_name}</h1>
        {assignment?.form_description && <p style={{ color: '#6b7280', marginBottom: 'var(--space-4)' }}>{assignment.form_description}</p>}
        
        {isCompleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: '#ecfdf5', color: '#065f46', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
            <CheckCircle2 size={20} />
            This form has been submitted and is under review. You can no longer edit it.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {questions.map((q, idx) => (
          <div key={q.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #e5e7eb', padding: 'var(--space-6)' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: 'var(--space-1)' }}>
              {idx + 1}. {q.question_text} {q.is_required ? <span style={{ color: 'red' }}>*</span> : ''}
            </label>
            {q.description && <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: 'var(--space-4)' }}>{q.description}</p>}

            <div style={{ marginTop: 'var(--space-4)' }}>
              {q.question_type === 'text' && (
                <input 
                  type="text" 
                  className="form-control" 
                  value={responses[q.id] || ''} 
                  onChange={e => handleUpdate(q.id, e.target.value)}
                  disabled={isCompleted}
                />
              )}
              {q.question_type === 'long_text' && (
                <textarea 
                  className="form-control" 
                  rows={4}
                  value={responses[q.id] || ''} 
                  onChange={e => handleUpdate(q.id, e.target.value)}
                  disabled={isCompleted}
                />
              )}
              {q.question_type === 'number' && (
                <input 
                  type="number" 
                  className="form-control" 
                  value={responses[q.id] || ''} 
                  onChange={e => handleUpdate(q.id, e.target.value)}
                  disabled={isCompleted}
                />
              )}
              {q.question_type === 'date' && (
                <input 
                  type="date" 
                  className="form-control" 
                  value={responses[q.id] || ''} 
                  onChange={e => handleUpdate(q.id, e.target.value)}
                  disabled={isCompleted}
                />
              )}
              {q.question_type === 'checkbox' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: isCompleted ? 'default' : 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={responses[q.id] === true || responses[q.id] === 'true'} 
                    onChange={e => handleUpdate(q.id, e.target.checked)}
                    disabled={isCompleted}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>Yes, I confirm</span>
                </label>
              )}
              {q.question_type === 'file' && (
                <div style={{ border: '2px dashed #d1d5db', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <input type="file" disabled={isCompleted} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isCompleted && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e5e7eb', padding: 'var(--space-4)', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ width: '100%', maxWidth: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {errorMsg && <div style={{ color: 'red', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={16}/> {errorMsg}</div>}
            {!errorMsg && <div className="text-muted text-sm">Draft auto-saves automatically.</div>}
            
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving || submitting}>
                {saving ? 'Saving...' : <><Save size={16}/> Save Draft</>}
              </button>
              <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving || submitting}>
                {submitting ? 'Submitting...' : <><Send size={16}/> Submit Form</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
