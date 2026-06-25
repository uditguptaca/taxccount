'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Settings, ShieldAlert, FileText, Bot } from 'lucide-react';

export default function SmartFormsSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully');
    }, 1000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard/smart-forms" className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-gray-900">
        <ArrowLeft size={16} /> Back to Smart Forms
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Form Settings</h1>
          <p className="text-gray-500">Configure AI models, OCR mappings, and form taxonomies.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary rounded-xl text-white font-medium hover:opacity-90 flex items-center gap-2"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="flex gap-8">
        <div className="w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 font-medium transition ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Settings size={18} /> General Settings
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 font-medium transition ${activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileText size={18} /> Categories
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 font-medium transition ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Bot size={18} /> AI & OCR Engines
          </button>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">General Configuration</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Form Privacy</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg">
                    <option>Internal Only (Staff)</option>
                    <option>Public (Client Portal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention Policy</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg">
                    <option>Keep indefinitely</option>
                    <option>Delete 30 days after project completion</option>
                    <option>Archive after 1 year</option>
                  </select>
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300" defaultChecked />
                    <span className="font-medium text-gray-900">Enable automatic notifications on submission</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Form Taxonomy</h2>
              <p className="text-gray-500 mb-6">Manage the categories used to organize your Smart Forms.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div>
                    <h4 className="font-bold text-gray-900">Tax Compliance</h4>
                    <p className="text-sm text-gray-500">Corporate and personal tax data collection</p>
                  </div>
                  <button className="text-sm text-primary font-medium">Edit</button>
                </div>
                <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div>
                    <h4 className="font-bold text-gray-900">Onboarding</h4>
                    <p className="text-sm text-gray-500">KYC and initial client intake</p>
                  </div>
                  <button className="text-sm text-primary font-medium">Edit</button>
                </div>
                <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition">
                  + Add New Category
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h2 className="text-xl font-bold text-indigo-900 mb-6 border-b pb-4 flex items-center gap-2">
                <Bot size={24} /> AI Engine Settings
              </h2>
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <label className="block text-sm font-medium text-indigo-900 mb-2">OCR Processing Engine</label>
                  <select className="w-full p-2.5 border border-indigo-200 rounded-lg">
                    <option>AWS Textract (Default)</option>
                    <option>Google Cloud Vision</option>
                    <option>Azure Document Intelligence</option>
                  </select>
                  <p className="text-xs text-indigo-700 mt-2">Determines the backend used to extract data from client uploads.</p>
                </div>
                
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <label className="block text-sm font-medium text-indigo-900 mb-2">Anomaly Detection Strictness</label>
                  <select className="w-full p-2.5 border border-indigo-200 rounded-lg">
                    <option>Low (Fewer false positives)</option>
                    <option>Medium (Balanced)</option>
                    <option>High (Strict validation)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 mb-2">
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300" defaultChecked />
                    <span className="font-medium text-gray-900">Enable AI Auto-Categorization of Uploads</span>
                  </label>
                  <p className="text-sm text-gray-500 pl-8">When a client uploads a raw document, the AI will attempt to automatically link it to the appropriate form fields.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
