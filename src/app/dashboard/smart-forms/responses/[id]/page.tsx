'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Download, Check, X, Search, ShieldAlert, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SmartFormReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/smart-forms/responses/${id}`);
      if (!res.ok) throw new Error('Failed to load responses');
      const data = await res.json();
      
      setAssignment(data.assignment);
      setQuestions(data.questions || []);
      setResponses(data.responses || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getResponseValue = (qId: string) => {
    const r = responses.find(r => r.question_id === qId);
    if (!r) return { value: null, response: null };
    let val = r.response_value;
    try { val = JSON.parse(val); } catch { /* ignore */ }
    return { value: val, response: r };
  };

  const handleReview = async (responseId: string, isApproved: boolean) => {
    try {
      await fetch(`/api/smart-forms/responses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'review_response', 
          response_id: responseId, 
          is_approved: isApproved,
          staff_notes: reviewNotes[responseId] || ''
        })
      });
      fetchData(); // Refresh UI
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/smart-forms/responses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', status: newStatus })
      });
      setAssignment({ ...assignment, status: newStatus });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading review...</div>;
  if (!assignment) return <div className="p-8 text-center text-red-500">Assignment not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href={`/dashboard/projects/${assignment.project_id}`} className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-gray-900">
        <ArrowLeft size={16} /> Back to Project
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{assignment.form_name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              assignment.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
              assignment.status === 'Needs revision' ? 'bg-red-100 text-red-800' :
              assignment.status === 'Under review' ? 'bg-amber-100 text-amber-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {assignment.status}
            </span>
          </div>
          <p className="text-gray-500">Client: <span className="font-medium text-gray-900">{assignment.client_name}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleStatusChange('Needs revision')}
            disabled={updating}
            className="px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition flex items-center gap-2"
          >
            <XCircle size={18} /> Request Revisions
          </button>
          <button 
            onClick={() => handleStatusChange('Completed')}
            disabled={updating}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <CheckCircle2 size={18} /> Mark as Complete
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const { value, response } = getResponseValue(q.id);
          const hasResponse = response !== null;
          
          return (
            <div key={q.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex">
              <div className="p-6 flex-1 border-r border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{q.question_type}</span>
                  {q.is_ai_assisted && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">AI Extracted</span>}
                </div>
                <h3 className="font-medium text-gray-900 mb-4">{idx + 1}. {q.question_text}</h3>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[60px]">
                  {!hasResponse ? (
                    <span className="text-gray-400 italic">No response provided</span>
                  ) : q.question_type === 'file' ? (
                    <div className="flex items-center gap-3">
                      <FileText className="text-primary" size={24} />
                      <span className="font-medium text-gray-900">Uploaded Document</span>
                      <button className="text-primary hover:underline text-sm ml-auto flex items-center gap-1"><Download size={14}/> Download</button>
                    </div>
                  ) : typeof value === 'boolean' || value === 'true' || value === 'false' ? (
                    <span className="font-medium text-gray-900">{String(value) === 'true' ? 'Yes' : 'No'}</span>
                  ) : (
                    <span className="font-medium text-gray-900 whitespace-pre-wrap">{String(value)}</span>
                  )}
                </div>
              </div>
              
              <div className="w-80 p-6 bg-gray-50 flex flex-col">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Staff Review</h4>
                
                {!hasResponse ? (
                  <div className="text-sm text-gray-400 text-center py-8">Awaiting response</div>
                ) : (
                  <div className="flex-1 flex flex-col gap-3">
                    {response.is_approved === 1 && (
                      <div className="bg-emerald-100 text-emerald-800 text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
                        <Check size={16} /> Approved
                      </div>
                    )}
                    {response.is_approved === 0 && (
                      <div className="bg-red-100 text-red-800 text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
                        <X size={16} /> Rejected
                      </div>
                    )}

                    <textarea 
                      placeholder="Add review notes (visible to client if rejected)..."
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none flex-1 resize-none"
                      value={reviewNotes[response.id] ?? (response.staff_notes || '')}
                      onChange={e => setReviewNotes({ ...reviewNotes, [response.id]: e.target.value })}
                    />
                    
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => handleReview(response.id, false)}
                        className="flex-1 py-2 bg-white border border-gray-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-1"
                      >
                        <X size={16} /> Reject
                      </button>
                      <button 
                        onClick={() => handleReview(response.id, true)}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-1"
                      >
                        <Check size={16} /> Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
