"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ChevronRight, ChevronLeft, Check, CreditCard, FileSignature } from 'lucide-react';
import SignatureCanvas from '@/components/SignatureCanvas';

export default function EngagementWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    templateId: '',
    introText: 'We are pleased to offer our tax and accounting services to you for the upcoming year...',
    termsText: '1. Services Provided\n2. Fees and Payment\n3. Client Responsibilities\n4. Confidentiality\n5. Limitation of Liability',
    services: [{ description: 'Corporate Tax Return (T2)', price: 1500 }],
    paymentMethod: 'auto_pay',
    signatureBase64: ''
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const updateForm = (key: string, val: any) => setFormData(p => ({ ...p, [key]: val }));

  const handleServiceChange = (idx: number, key: string, val: any) => {
    const newServices = [...formData.services];
    newServices[idx] = { ...newServices[idx], [key]: val };
    updateForm('services', newServices);
  };

  const handleSaveProposal = async () => {
    setSaving(true);
    try {
      // In reality, this posts to /api/engagements
      // Mocking 1 second network request
      await new Promise(r => setTimeout(r, 1000));
      alert("Engagement Proposal Generated Successfully!");
      router.push('/admin/billing');
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create Engagement Letter Proposal</h1>

      {/* Stepper Header */}
      <div className="flex border-b mb-8 pb-4 gap-4 overflow-x-auto">
        {['General', 'Introduction', 'Terms', 'Services & Invoices', 'Payment & Sign'].map((label, idx) => (
          <div key={label} className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${step === idx + 1 ? 'bg-blue-600 text-white' : step > idx + 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
            {step > idx + 1 ? <Check size={16} /> : <span>{idx + 1}.</span>} {label}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[400px]">
        {/* Step 1: General */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-800">General Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
              <select 
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                value={formData.clientId} onChange={e => updateForm('clientId', e.target.value)}
              >
                <option value="">-- Choose a Client --</option>
                <option value="c_1">The Shield (Corporate)</option>
                <option value="c_2">Frank Smith (Personal)</option>
                <option value="c_3">Acme Corp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Template</label>
              <select className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">None (Custom Engagement)</option>
                <option value="t_1">T2 Corporate Return 2025</option>
                <option value="t_2">Monthly Bookkeeping</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Introduction */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-800">Cover Letter Introduction</h2>
            <textarea 
              className="w-full p-3 border rounded h-48 focus:ring-2 focus:ring-blue-500"
              value={formData.introText} onChange={e => updateForm('introText', e.target.value)}
              placeholder="Dear Client..."
            />
            <p className="text-xs text-gray-500">Tip: Use variables like [NAME] or [LAST_YEAR] to automatically customize text.</p>
          </div>
        )}

        {/* Step 3: Terms */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-800">Legal Terms & Conditions</h2>
            <textarea 
              className="w-full p-3 border rounded h-64 font-mono text-sm focus:ring-2 focus:ring-blue-500"
              value={formData.termsText} onChange={e => updateForm('termsText', e.target.value)}
            />
          </div>
        )}

        {/* Step 4: Services */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-800">Services & Pricing</h2>
            {formData.services.map((svc, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded border">
                <input 
                  type="text" className="flex-1 p-2 border rounded" placeholder="Service description..."
                  value={svc.description} onChange={e => handleServiceChange(idx, 'description', e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-500">$</span>
                  <input 
                    type="number" className="w-32 p-2 border rounded" 
                    value={svc.price} onChange={e => handleServiceChange(idx, 'price', Number(e.target.value))}
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={() => updateForm('services', [...formData.services, { description: '', price: 0 }])}
              className="text-blue-600 font-medium text-sm"
            >+ Add Line Item</button>

            <div className="mt-8 border-t pt-4 text-right">
              <span className="text-gray-500 font-medium mr-4">Total Proposal Amount:</span>
              <span className="text-2xl font-bold text-green-700">
                ${formData.services.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Step 5: Payment & Sign */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in">
             <h2 className="text-xl font-bold text-gray-800">Payment Authorization & Auto-Sign Options</h2>
             
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold flex items-center gap-2 text-blue-900 mb-3"><CreditCard size={18} /> Payment Collection</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-white border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" value="auto_pay" checked={formData.paymentMethod === 'auto_pay'} onChange={e => updateForm('paymentMethod', e.target.value)} className="mt-1" />
                    <div>
                      <p className="font-bold text-sm">Require Automatic Payment Setup (Best Practice) ⭐</p>
                      <p className="text-xs text-gray-500">Client securely vaults their credit card via Stripe upon signing to allow you to auto-collect recurring tracking.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-white border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" value="manual" checked={formData.paymentMethod === 'manual'} onChange={e => updateForm('paymentMethod', e.target.value)} className="mt-1" />
                    <div>
                      <p className="font-bold text-sm">Standard Invoice Generation</p>
                      <p className="text-xs text-gray-500">Generate a standard invoice for the client to pay manually whenever they wish.</p>
                    </div>
                  </label>
                </div>
             </div>

             <div className="bg-gray-50 p-4 rounded-lg border">
                 <h3 className="font-bold flex items-center gap-2 text-gray-800 mb-3"><FileSignature size={18} /> Firm Partner Countersignature</h3>
                 <p className="text-sm text-gray-600 mb-4">You can pre-sign this document now so it is fully executed immediately when the client signs.</p>
                 <SignatureCanvas 
                    width={400} height={150} 
                    onSign={(base64) => updateForm('signatureBase64', base64)} 
                 />
                 {formData.signatureBase64 && <p className="text-green-600 text-sm font-bold flex items-center gap-1 mt-2"><Check size={16}/> Signature Captured</p>}
             </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <button 
          onClick={handlePrev} disabled={step === 1}
          className={`flex items-center gap-1 px-4 py-2 font-medium ${step === 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'} rounded`}
        >
          <ChevronLeft size={18} /> Back
        </button>

        {step < 5 ? (
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-blue-700 transition"
          >
            Next Step <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            onClick={handleSaveProposal} disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-8 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition"
          >
            {saving ? '⏳ Processing...' : <><Save size={18} /> Generate & Send to Client</>}
          </button>
        )}
      </div>

    </div>
  );
}
