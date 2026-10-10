'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, CheckCircle2, AlertCircle, HelpCircle, Shield, 
  ChevronRight, ChevronLeft, Plus, Trash2, Upload, Lock, 
  Save, Eye, EyeOff, Check, MapPin, Calendar, Sparkles, MessageSquare, Info
} from 'lucide-react';
import { TAX_INTAKE_MODULES, SCREENING_CATEGORIES } from '@/lib/tax-intake-questions';
import { QUEBEC_MODULE } from '@/lib/tax-intake-quebec';
import { PROVINCIAL_MODULES } from '@/lib/tax-intake-provincial';
import { validateTaxIntakeForm } from '@/lib/tax-intake-validation';
import { PROVINCE_NAMES, TaxIntakeModule, TaxIntakeQuestion, TaxIntakeSection } from '@/lib/tax-intake-types';

export default function ClientTaxIntakePortal() {
  const params = useParams();
  const engagementId = params?.engagementId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, { value: any; flag?: string; flagNote?: string }>>({});
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSin, setShowSin] = useState<Record<string, boolean>>({});
  const [activeFlagPopover, setActiveFlagPopover] = useState<string | null>(null);
  const [flagNoteInput, setFlagNoteInput] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);

  // Selected active modules based on provincial rules & screening answers
  const activeModules = useMemo<TaxIntakeModule[]>(() => {
    if (!engagement) return TAX_INTAKE_MODULES;

    const list = [...TAX_INTAKE_MODULES];

    // If province is QC, inject Quebec TP-1 module right after Provincial
    if (engagement.province === 'QC') {
      list.push(QUEBEC_MODULE);
    } else {
      // Add general provincial module
      list.push(PROVINCIAL_MODULES);
    }

    return list;
  }, [engagement]);

  useEffect(() => {
    if (engagementId) {
      loadIntakeData();
    }
  }, [engagementId]);

  const loadIntakeData = async () => {
    setLoading(true);
    try {
      const [resEng, resResp, resDocs] = await Promise.all([
        fetch(`/api/tax-intake/${engagementId}`),
        fetch(`/api/tax-intake/${engagementId}/responses`),
        fetch(`/api/tax-intake/${engagementId}/documents`),
      ]);

      if (resEng.ok) {
        const engData = (await resEng.json()).engagement;
        setEngagement(engData);
        if (engData.status === 'submitted' || engData.status === 'reviewed') {
          setSubmitted(true);
        }
      }

      if (resResp.ok) {
        const respList = (await resResp.json()).responses || [];
        const respMap: Record<string, { value: any; flag?: string; flagNote?: string }> = {};
        respList.forEach((r: any) => {
          respMap[`${r.question_id}_${r.record_index || 0}`] = {
            value: r.value,
            flag: r.flag || undefined,
            flagNote: r.flag_note || undefined,
          };
        });
        setResponses(respMap);
      }

      if (resDocs.ok) {
        setDocuments((await resDocs.json()).documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentModule = activeModules[activeModuleIndex] || activeModules[0];

  const handleValueChange = (questionId: string, value: any, recordIndex = 0) => {
    const key = `${questionId}_${recordIndex}`;
    setResponses(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  const handleSetFlag = (questionId: string, flag: 'unsure' | 'provide_later' | 'ask_preparer' | null, recordIndex = 0) => {
    const key = `${questionId}_${recordIndex}`;
    setResponses(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        flag: flag || undefined,
        flagNote: flag ? flagNoteInput : undefined,
      },
    }));
    setActiveFlagPopover(null);
    setFlagNoteInput('');
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      const formattedResponses = Object.entries(responses).map(([key, data]) => {
        const parts = key.split('_');
        const recordIndex = parseInt(parts.pop() || '0', 10);
        const questionId = parts.join('_');
        return {
          questionId,
          recordIndex,
          value: data.value,
          flag: data.flag,
          flagNote: data.flagNote,
        };
      });

      await fetch(`/api/tax-intake/${engagementId}/responses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: formattedResponses }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitIntake = async () => {
    await handleSaveProgress();
    setSaving(true);
    try {
      const res = await fetch(`/api/tax-intake/${engagementId}/submit`, {
        method: 'POST',
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Compute form validation status
  const validationResult = useMemo(() => {
    return validateTaxIntakeForm(responses, engagement?.province || 'ON', engagement?.tax_year || '2025');
  }, [responses, engagement]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Canadian T1 Tax Intake Organizer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base">Canadian Personal Tax Intake</h1>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Tax Year {engagement?.tax_year || '2025'}
                </span>
                {engagement?.province === 'QC' && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Québec TP-1 Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Taxpayer: <span className="text-slate-200 font-semibold">{engagement?.client_name}</span> • CRA & Revenu Québec Compliant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {submitted ? (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Submitted to Tax Preparer
              </span>
            ) : (
              <>
                <button
                  onClick={handleSaveProgress}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  onClick={handleSubmitIntake}
                  disabled={saving || !validationResult.isValid}
                  className={`px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition flex items-center gap-1.5 ${
                    validationResult.isValid
                      ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit to Preparer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${((activeModuleIndex + 1) / activeModules.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Module Navigation */}
        <div className="space-y-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 h-fit max-h-[80vh] overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex justify-between items-center">
            <span>Intake Modules</span>
            <span className="text-[10px] text-indigo-400 font-mono">{activeModuleIndex + 1}/{activeModules.length}</span>
          </div>

          {activeModules.map((m, idx) => {
            const isActive = idx === activeModuleIndex;
            return (
              <button
                key={m.code}
                onClick={() => setActiveModuleIndex(idx)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white border border-indigo-500/40 font-semibold shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center font-mono ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{m.title}</span>
                </div>
                {m.code === 'AB_QUEBEC' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    QC
                  </span>
                )}
              </button>
            );
          })}

          {/* Validation Warnings Summary */}
          {validationResult.missingItems.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{validationResult.missingItems.length} Required Field(s)</span>
              </div>
              <p className="text-[11px] text-rose-400/80">Please complete highlighted fields before final submission.</p>
            </div>
          )}
        </div>

        {/* Central Questionnaire Card */}
        <div className="md:col-span-3 space-y-6">
          {/* Module Title Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Module {currentModule.code}</span>
                <h2 className="text-xl font-bold text-white mt-1">{currentModule.title}</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{currentModule.description}</p>
              </div>
            </div>
          </div>

          {/* Module Question Sections */}
          <div className="space-y-6">
            {currentModule.sections.map(section => (
              <div key={section.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {section.title}
                  </h3>
                  {section.isRepeatable && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Multi-record Section
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {currentModule.questions
                    .filter(q => q.sectionId === section.id)
                    .map(q => {
                      const responseKey = `${q.id}_0`;
                      const currentResp = responses[responseKey] || { value: '' };

                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700/80 transition space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{q.text}</span>
                              {q.inputType === 'sin' && (
                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                  Protected SIN Field
                                </span>
                              )}
                            </label>

                            {/* Response Flag Buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleSetFlag(q.id, currentResp.flag === 'unsure' ? null : 'unsure')}
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 border ${
                                  currentResp.flag === 'unsure'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                                title="Flag if unsure of exact answer"
                              >
                                <HelpCircle className="w-3 h-3 text-rose-400" />
                                Unsure
                              </button>

                              <button
                                onClick={() => handleSetFlag(q.id, currentResp.flag === 'provide_later' ? null : 'provide_later')}
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 border ${
                                  currentResp.flag === 'provide_later'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                              >
                                <Plus className="w-3 h-3 text-amber-400" />
                                Provide Later
                              </button>

                              <button
                                onClick={() => handleSetFlag(q.id, currentResp.flag === 'ask_preparer' ? null : 'ask_preparer')}
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 border ${
                                  currentResp.flag === 'ask_preparer'
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                              >
                                <MessageSquare className="w-3 h-3 text-indigo-400" />
                                Ask Preparer
                              </button>
                            </div>
                          </div>

                          {q.helpText && (
                            <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                              {q.helpText}
                            </p>
                          )}

                          {/* Dynamic Input Controls */}
                          <div>
                            {q.inputType === 'radio' && q.options ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.options.map((opt: any) => {
                                  const val = typeof opt === 'object' ? opt.value : opt;
                                  const lbl = typeof opt === 'object' ? opt.label : opt;
                                  return (
                                    <label
                                      key={val}
                                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                                        currentResp.value === val
                                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={q.id}
                                        value={val}
                                        checked={currentResp.value === val}
                                        onChange={() => handleValueChange(q.id, val)}
                                        className="accent-indigo-500 w-4 h-4"
                                        disabled={submitted}
                                      />
                                      <span>{lbl}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : q.inputType === 'select' && q.options ? (
                              <select
                                value={currentResp.value || ''}
                                onChange={e => handleValueChange(q.id, e.target.value)}
                                disabled={submitted}
                                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                              >
                                <option value="">-- Select Option --</option>
                                {q.options.map((opt: any) => {
                                  const val = typeof opt === 'object' ? opt.value : opt;
                                  const lbl = typeof opt === 'object' ? opt.label : opt;
                                  return <option key={val} value={val}>{lbl}</option>;
                                })}
                              </select>
                            ) : q.inputType === 'currency' ? (
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={currentResp.value || ''}
                                  onChange={e => handleValueChange(q.id, parseFloat(e.target.value) || 0)}
                                  disabled={submitted}
                                  className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            ) : q.inputType === 'sin' ? (
                              <div className="relative">
                                <input
                                  type={showSin[q.id] ? 'text' : 'password'}
                                  placeholder="9-digit Social Insurance Number"
                                  maxLength={11}
                                  value={currentResp.value || ''}
                                  onChange={e => handleValueChange(q.id, e.target.value)}
                                  disabled={submitted}
                                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSin(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                  {showSin[q.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            ) : q.inputType === 'long_text' ? (
                              <textarea
                                rows={3}
                                placeholder="Enter detailed explanation..."
                                value={currentResp.value || ''}
                                onChange={e => handleValueChange(q.id, e.target.value)}
                                disabled={submitted}
                                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            ) : (
                              <input
                                type={q.inputType === 'number' ? 'number' : q.inputType === 'date' ? 'date' : 'text'}
                                placeholder="Enter answer..."
                                value={currentResp.value || ''}
                                onChange={e => handleValueChange(q.id, e.target.value)}
                                disabled={submitted}
                                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Module Pagination Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              onClick={() => setActiveModuleIndex(prev => Math.max(0, prev - 1))}
              disabled={activeModuleIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Module
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Module {activeModuleIndex + 1} of {activeModules.length}
            </span>

            <button
              onClick={() => setActiveModuleIndex(prev => Math.min(activeModules.length - 1, prev + 1))}
              disabled={activeModuleIndex === activeModules.length - 1}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Module
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
