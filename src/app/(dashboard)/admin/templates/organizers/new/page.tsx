"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Save } from 'lucide-react';

export default function OrganizerBuilder() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([{ title: '', questions: [{ question_text: '', question_type: 'text', is_required: false }] }]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleAddSection = () => {
    setSections([...sections, { title: '', questions: [{ question_text: '', question_type: 'text', is_required: false }] }]);
  };

  const handleAddQuestion = (sIdx: number) => {
    const newSections = [...sections];
    newSections[sIdx].questions.push({ question_text: '', question_type: 'text', is_required: false });
    setSections(newSections);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/organizers/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, sections })
      });
      if (res.ok) {
        alert('Organizer Template Saved!');
        router.push('/admin/templates');
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Build Organizer Template</h1>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          {saving ? 'Saving...' : <><Save size={18} /> Save Template</>}
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <input 
          className="w-full text-xl font-bold p-3 border rounded shadow-sm" 
          placeholder="Organizer Name (e.g., T1 Personal Tax 2025)" 
          value={name} onChange={e => setName(e.target.value)} 
        />
        <textarea 
          className="w-full p-3 border rounded shadow-sm text-gray-700" 
          placeholder="Instructions for the client..." 
          value={description} onChange={e => setDescription(e.target.value)}
        />
      </div>

      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="bg-white border rounded shadow-sm p-4 mb-6">
          <input 
            className="w-full text-lg font-semibold border-b pb-2 mb-4 focus:outline-none" 
            placeholder="Section Title (e.g., Personal Information)" 
            value={sec.title} onChange={e => {
              const newSecs = [...sections];
              newSecs[sIdx].title = e.target.value;
              setSections(newSecs);
            }} 
          />
          
          {sec.questions.map((q, qIdx) => (
            <div key={qIdx} className="flex flex-wrap gap-4 items-center mb-3 bg-gray-50 p-3 rounded border">
              <input 
                className="flex-1 p-2 border rounded" 
                placeholder="Question text..." 
                value={q.question_text} onChange={e => {
                  const newSecs = [...sections];
                  newSecs[sIdx].questions[qIdx].question_text = e.target.value;
                  setSections(newSecs);
                }} 
              />
              <select 
                className="p-2 border rounded bg-white" 
                value={q.question_type} onChange={e => {
                  const newSecs = [...sections];
                  newSecs[sIdx].questions[qIdx].question_type = e.target.value;
                  setSections(newSecs);
                }}
              >
                <option value="text">Short Text</option>
                <option value="yes_no">Yes / No</option>
                <option value="date">Date</option>
                <option value="document">File Upload</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={q.is_required} 
                  onChange={e => {
                    const newSecs = [...sections];
                    newSecs[sIdx].questions[qIdx].is_required = e.target.checked;
                    setSections(newSecs);
                  }} 
                /> Required
              </label>
              <button onClick={() => {
                const newSecs = [...sections];
                newSecs[sIdx].questions.splice(qIdx, 1);
                setSections(newSecs);
              }} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash size={16} /></button>
            </div>
          ))}

          <button onClick={() => handleAddQuestion(sIdx)} className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-2">
            <Plus size={16} /> Add Question
          </button>
        </div>
      ))}

      <button onClick={handleAddSection} className="w-full py-4 border-2 border-dashed border-gray-300 rounded text-gray-500 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors">
        <Plus size={20} /> Add New Section
      </button>
    </div>
  );
}
