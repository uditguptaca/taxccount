"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

type ReminderCascade = {
  offset_days: number;
  message: string;
};

type Template = {
  id: string;
  name: string;
  cascade_config_json: string;
  created_at: string;
};

export default function ReminderTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [cascades, setCascades] = useState<ReminderCascade[]>([{ offset_days: -3, message: "" }]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates/reminders');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const addCascade = () => {
    setCascades([...cascades, { offset_days: 0, message: "" }]);
  };

  const removeCascade = (index: number) => {
    setCascades(cascades.filter((_, i) => i !== index));
  };

  const updateCascade = (index: number, field: 'offset_days' | 'message', value: any) => {
    const updated = [...cascades];
    updated[index] = { ...updated[index], [field]: value };
    setCascades(updated);
  };

  const saveTemplate = async () => {
    if (!name.trim() || cascades.length === 0) return;

    try {
      const res = await fetch('/api/admin/templates/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cascade_config_json: JSON.stringify(cascades)
        })
      });

      if (res.ok) {
        setIsCreating(false);
        setName("");
        setCascades([{ offset_days: -3, message: "" }]);
        fetchTemplates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reminder Templates</h1>
          <p className="text-slate-500">Configure staggered reminder trees for automated workflow actions.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm"
        >
          {isCreating ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Template</>}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Unpaid Invoice Cascade"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-800">Cascade Sequence</h3>
              <button onClick={addCascade} className="text-indigo-600 font-medium text-sm flex items-center hover:text-indigo-700">
                <Plus className="w-4 h-4 mr-1" /> Add Step
              </button>
            </div>

            {cascades.map((cascade, index) => (
              <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="w-32">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Offset (Days)</label>
                  <input 
                    type="number" 
                    value={cascade.offset_days}
                    onChange={e => updateCascade(index, 'offset_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">E.g. -3 = 3 days before due, 1 = 1 day after</p>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Message Body</label>
                  <textarea 
                    value={cascade.message}
                    onChange={e => updateCascade(index, 'message', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none resize-none"
                    placeholder="Variables supported: [CLIENT_NAME], [DUE_DATE]"
                  />
                </div>
                <button 
                  onClick={() => removeCascade(index)}
                  className="mt-6 text-slate-400 hover:text-red-500 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              onClick={saveTemplate}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-lg hover:bg-slate-800 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" /> Save Reminder Template
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(t => {
          const cascadeData: ReminderCascade[] = JSON.parse(t.cascade_config_json || "[]");
          return (
            <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">{t.name}</h3>
              <div className="space-y-3">
                {cascadeData.map((c, i) => (
                  <div key={i} className="flex gap-3 items-center text-sm">
                    <span className="shrink-0 w-16 text-center font-mono py-1 px-2 bg-indigo-50 text-indigo-700 rounded-md">
                      {c.offset_days > 0 ? `+${c.offset_days}` : c.offset_days}d
                    </span>
                    <p className="text-slate-600 truncate flex-1">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {templates.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
            No templates found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
