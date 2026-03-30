"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Save, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ClientOrganizerView({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/organizers/instances/${params.id}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [params.id]);

  if (!data) return <div className="p-8">Loading...</div>;

  const handleSave = async (isFinalSubmit = false) => {
    setSaving(true);
    // Flatten all answers from current state
    const answersToSave = data.sections.flatMap((sec: any) => 
      sec.questions.map((q: any) => ({
        question_id: q.id,
        answer_text: q.answer
      }))
    );

    try {
      await fetch(`/api/organizers/instances/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: answersToSave,
          status: isFinalSubmit ? 'completed' : 'in_progress'
        })
      });

      if (isFinalSubmit) {
        alert("Organizer Submitted Successfully!");
        router.push('/client/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleNext = () => {
    if (currentStep < data.sections.length - 1) {
      handleSave(false); // Auto-save on next
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const updateAnswer = (qIdx: number, val: string) => {
    const newData = { ...data };
    newData.sections[currentStep].questions[qIdx].answer = val;
    setData(newData);
  };

  const currentSection = data.sections[currentStep];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{data.template_name}</h1>
        <p className="text-gray-600">{data.template_description}</p>
        <div className="mt-4 flex gap-2">
          {data.sections.map((sec: any, idx: number) => (
            <div key={idx} className={`flex-1 h-2 rounded-full ${idx <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2 font-medium">Step {currentStep + 1} of {data.sections.length}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6 border">
        <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">{currentSection.title}</h2>
        
        <div className="space-y-6">
          {currentSection.questions.map((q: any, qIdx: number) => (
            <div key={q.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {q.question_text} {q.is_required && <span className="text-red-500">*</span>}
              </label>
              
              {q.question_type === 'text' && (
                <input 
                  type="text" 
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={q.answer || ''} 
                  onChange={e => updateAnswer(qIdx, e.target.value)} 
                />
              )}

              {q.question_type === 'yes_no' && (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 bg-gray-50 px-4 py-2 border rounded cursor-pointer">
                    <input type="radio" checked={q.answer === 'yes'} onChange={() => updateAnswer(qIdx, 'yes')} /> Yes
                  </label>
                  <label className="flex items-center gap-2 bg-gray-50 px-4 py-2 border rounded cursor-pointer">
                    <input type="radio" checked={q.answer === 'no'} onChange={() => updateAnswer(qIdx, 'no')} /> No
                  </label>
                </div>
              )}

              {q.question_type === 'date' && (
                <input 
                  type="date" 
                  className="p-3 border rounded w-full md:w-auto focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={q.answer || ''} 
                  onChange={e => updateAnswer(qIdx, e.target.value)} 
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl shadow-sm border">
        <button 
          onClick={handlePrev} 
          disabled={currentStep === 0}
          className={`px-4 py-2 font-medium flex items-center gap-1 ${currentStep === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50 rounded'}`}
        >
          <ChevronLeft size={18} /> Back
        </button>

        <button 
          onClick={() => handleSave(false)} 
          className="text-gray-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
        >
          {saving ? '⏳ Saving...' : <><Save size={16} /> Save Progress</>}
        </button>

        {currentStep === data.sections.length - 1 ? (
          <button 
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium shadow flex items-center gap-2 hover:bg-green-700 transition"
          >
            <CheckCircle size={18} /> Submit Finally
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow flex items-center gap-1 hover:bg-blue-700 transition"
          >
            Next Section <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
