'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, CheckCircle2, Clock, AlertTriangle, HelpCircle, 
  Search, Filter, Plus, User, Calendar, MapPin, Eye, Edit3, 
  ArrowRight, RefreshCw, ChevronRight, Lock, Unlock, Download,
  Check, X, AlertCircle, ShieldAlert, Sparkles, MessageSquare,
  Paperclip, Database, Layers, ArrowLeft
} from 'lucide-react';
import { TAX_INTAKE_MODULES } from '@/lib/tax-intake-questions';
import { QUEBEC_MODULE } from '@/lib/tax-intake-quebec';
import { PROVINCIAL_MODULES } from '@/lib/tax-intake-provincial';
import { validateTaxIntakeForm } from '@/lib/tax-intake-validation';
import { PROVINCE_NAMES } from '@/lib/tax-intake-types';

export default function TaxIntakePreparerDashboard() {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal for new engagement
  const [showNewModal, setShowNewModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newTaxYear, setNewTaxYear] = useState('2025');
  const [newProvince, setNewProvince] = useState('ON');
  const [newFilingType, setNewFilingType] = useState('original');
  const [creating, setCreating] = useState(false);

  // Detail View State
  const [activeEngagementId, setActiveEngagementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'responses' | 'flags' | 'documents' | 'notes' | 'audit'>('responses');
  const [selectedModuleCode, setSelectedModuleCode] = useState<string>('A_ENGAGEMENT');
  const [engagementDetail, setEngagementDetail] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tax-intake');
      if (res.ok) {
        const data = await res.json();
        setEngagements(data.engagements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    setCreating(true);
    try {
      const res = await fetch('/api/tax-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: `CLI-${Date.now().toString().slice(-4)}`,
          client_name: newClientName,
          client_email: newClientEmail,
          tax_year: newTaxYear,
          province: newProvince,
          filing_type: newFilingType,
        }),
      });
      if (res.ok) {
        setShowNewModal(false);
        setNewClientName('');
        setNewClientEmail('');
        fetchEngagements();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const loadEngagementDetail = async (id: string) => {
    setActiveEngagementId(id);
    try {
      const [resEng, resResp, resRev, resDoc, resNot] = await Promise.all([
        fetch(`/api/tax-intake/${id}`),
        fetch(`/api/tax-intake/${id}/responses`),
        fetch(`/api/tax-intake/${id}/review`),
        fetch(`/api/tax-intake/${id}/documents`),
        fetch(`/api/tax-intake/${id}/preparer-notes`),
      ]);

      if (resEng.ok) setEngagementDetail((await resEng.json()).engagement);
      if (resResp.ok) {
        const respData = await resResp.json();
        const respMap: Record<string, any> = {};
        (respData.responses || []).forEach((r: any) => {
          respMap[`${r.question_id}_${r.record_index}`] = r;
        });
        setResponses(respMap);
      }
      if (resRev.ok) setReviewItems((await resRev.json()).reviewItems || []);
      if (resDoc.ok) setDocuments((await resDoc.json()).documents || []);
      if (resNot.ok) setNotes((await resNot.json()).notes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReviewItem = async (itemId: string, status: string, note?: string) => {
    try {
      const res = await fetch(`/api/tax-intake/${activeEngagementId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, status, preparer_note: note }),
      });
      if (res.ok) {
        loadEngagementDetail(activeEngagementId!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !activeEngagementId) return;
    try {
      const res = await fetch(`/api/tax-intake/${activeEngagementId}/preparer-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNoteText, is_internal: true }),
      });
      if (res.ok) {
        setNewNoteText('');
        loadEngagementDetail(activeEngagementId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Combine all modules for preparer lookup
  const allModulesMap = React.useMemo(() => {
    const list = [...TAX_INTAKE_MODULES, QUEBEC_MODULE, PROVINCIAL_MODULES];
    const map: Record<string, any> = {};
    list.forEach(m => { map[m.code] = m; });
    return map;
  }, []);

  const filteredEngagements = engagements.filter(e => {
    if (selectedYear !== 'all' && e.tax_year !== selectedYear) return false;
    if (selectedStatus !== 'all' && e.status !== selectedStatus) return false;
    if (selectedProvince !== 'all' && e.province !== selectedProvince) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = e.client_name?.toLowerCase().includes(q);
      const matchId = e.id?.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Canadian T1 Personal Tax Intake Center</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Professional client questionnaire management, CRA compliance validation & preparer workspace
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEngagements}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Client Tax Intake
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {!activeEngagementId && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Intakes</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">{engagements.length}</div>
              <div className="text-xs text-slate-500 mt-1">Across all tax years & provinces</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted / Under Review</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-2">
                {engagements.filter(e => ['submitted', 'under_review'].includes(e.status)).length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Ready for preparer audit</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unsure / Ask Flags</span>
                <HelpCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-2">
                {engagements.reduce((acc, curr) => acc + (curr.review_count || 0), 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Items needing clarification</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Québec TP-1 Intakes</span>
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mt-2">
                {engagements.filter(e => e.province === 'QC').length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Revenu Québec dual filings</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {!activeEngagementId ? (
          /* Engagements Table List View */
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Filters Bar */}
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by client name, email or intake ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Tax Year Filter */}
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Tax Years</option>
                  <option value="2025">2025 Tax Year</option>
                  <option value="2024">2024 Tax Year</option>
                  <option value="2023">2023 Tax Year</option>
                  <option value="2022">2022 Tax Year</option>
                </select>

                {/* Province Filter */}
                <select
                  value={selectedProvince}
                  onChange={e => setSelectedProvince(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Provinces</option>
                  <option value="ON">Ontario (ON)</option>
                  <option value="QC">Québec (QC)</option>
                  <option value="BC">British Columbia (BC)</option>
                  <option value="AB">Alberta (AB)</option>
                  <option value="SK">Saskatchewan (SK)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="reviewed">Reviewed & Locked</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Client / Taxpayer</th>
                    <th className="py-3.5 px-4">Tax Year</th>
                    <th className="py-3.5 px-4">Jurisdiction</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Progress</th>
                    <th className="py-3.5 px-4 text-center">Review Flags</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEngagements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No client tax intake engagements found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEngagements.map(e => (
                      <tr key={e.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                              {e.client_name ? e.client_name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{e.client_name || 'Taxpayer Client'}</div>
                              <div className="text-xs text-slate-400">{e.client_email || e.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            T1 — {e.tax_year}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{e.province}</span>
                            <span className="text-xs text-slate-400">({PROVINCE_NAMES[e.province as keyof typeof PROVINCE_NAMES] || e.province})</span>
                            {e.province === 'QC' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                TP-1
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            e.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            e.status === 'under_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            e.status === 'reviewed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {e.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="w-28 mx-auto">
                            <div className="flex justify-between text-xs mb-1 font-medium text-slate-400">
                              <span>{e.progress_pct || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                                style={{ width: `${e.progress_pct || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {e.review_count > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <HelpCircle className="w-3.5 h-3.5" />
                              {e.review_count} Flags
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Clear</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/portal/tax-intake/${e.id}`}
                              target="_blank"
                              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs font-medium flex items-center gap-1"
                              title="Open Client Portal View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Client Link
                            </Link>

                            <button
                              onClick={() => loadEngagementDetail(e.id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Preparer Audit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Detail Preparer Workspace View */
          <div>
            {/* Top Return Header */}
            <div className="mb-6 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveEngagementId(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Intakes
                </button>

                <div className="h-6 w-px bg-slate-800" />

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">
                      {engagementDetail?.client_name || 'Client Tax Intake'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      T1 — {engagementDetail?.tax_year} ({engagementDetail?.province})
                    </span>
                    {engagementDetail?.province === 'QC' && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Revenu Québec TP-1 Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Engagement ID: {engagementDetail?.id} • Status: <span className="font-semibold text-amber-400">{engagementDetail?.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/portal/tax-intake/${activeEngagementId}`}
                  target="_blank"
                  className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  Preview Portal
                </Link>

                <button
                  onClick={() => {
                    // Export snapshot to JSON
                    const jsonStr = JSON.stringify({ engagement: engagementDetail, responses, reviewItems }, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `T1-${engagementDetail?.tax_year}-${engagementDetail?.client_name || 'intake'}.json`;
                    a.click();
                  }}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  Export Tax Data JSON
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
              <button
                onClick={() => setActiveTab('responses')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                  activeTab === 'responses'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Client Responses by Module
              </button>

              <button
                onClick={() => setActiveTab('flags')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition relative ${
                  activeTab === 'flags'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-rose-400" />
                Review Flags & Clarifications
                {reviewItems.filter(i => i.status === 'open').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white font-bold">
                    {reviewItems.filter(i => i.status === 'open').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                Uploaded Slips & Receipts ({documents.length})
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                  activeTab === 'notes'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Preparer Internal Notes ({notes.length})
              </button>
            </div>

            {/* TAB CONTENT: RESPONSES */}
            {activeTab === 'responses' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Module Selector Sidebar */}
                <div className="space-y-1 bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-[700px] overflow-y-auto">
                  <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 px-2">Tax Intake Modules</div>
                  {TAX_INTAKE_MODULES.map(m => (
                    <button
                      key={m.code}
                      onClick={() => setSelectedModuleCode(m.code)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                        selectedModuleCode === m.code
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{m.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-2">{m.code.split('_')[0]}</span>
                    </button>
                  ))}

                  {/* Quebec Module option if QC */}
                  {engagementDetail?.province === 'QC' && (
                    <button
                      onClick={() => setSelectedModuleCode('AB_QUEBEC')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between border ${
                        selectedModuleCode === 'AB_QUEBEC'
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                          : 'bg-blue-950/20 text-blue-400 border-blue-900/40 hover:bg-blue-900/30'
                      }`}
                    >
                      <span>Québec TP-1 Module</span>
                      <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">QC</span>
                    </button>
                  )}
                </div>

                {/* Question and Response Table */}
                <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  {allModulesMap[selectedModuleCode] ? (
                    <div>
                      <div className="border-b border-slate-800 pb-4 mb-6">
                        <h3 className="text-lg font-bold text-white">{allModulesMap[selectedModuleCode].title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{allModulesMap[selectedModuleCode].description}</p>
                      </div>

                      <div className="space-y-6">
                        {allModulesMap[selectedModuleCode].sections.map((section: any) => (
                          <div key={section.id} className="border border-slate-800/80 rounded-xl bg-slate-950/40 p-4">
                            <h4 className="text-sm font-semibold text-indigo-400 mb-3 border-b border-slate-800 pb-2">
                              {section.title}
                            </h4>

                            <div className="space-y-3">
                              {allModulesMap[selectedModuleCode].questions
                                .filter((q: any) => q.sectionId === section.id)
                                .map((q: any) => {
                                  const resp = responses[`${q.id}_0`];
                                  return (
                                    <div key={q.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/40">
                                      <div className="flex-1">
                                        <div className="text-xs font-semibold text-slate-200">{q.text}</div>
                                        {q.helpText && <div className="text-[11px] text-slate-500 mt-0.5">{q.helpText}</div>}
                                      </div>

                                      <div className="flex items-center gap-3 min-w-[200px] justify-end">
                                        {resp ? (
                                          <div className="text-right">
                                            <div className="text-sm font-bold text-emerald-400 font-mono">
                                              {resp.value !== null && resp.value !== undefined ? String(resp.value) : <span className="text-slate-500 italic">No Answer</span>}
                                            </div>
                                            {resp.flag && (
                                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                                resp.flag === 'unsure' ? 'bg-rose-500/20 text-rose-400' :
                                                resp.flag === 'ask_preparer' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                                              }`}>
                                                Flagged: {resp.flag}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-xs text-slate-500 italic">Unanswered</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">Select a module to view responses.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FLAGS & REVIEW */}
            {activeTab === 'flags' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Client Flagged Items & Review Queue</h3>

                {reviewItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/40 mb-2" />
                    No review flags or client questions open for this intake.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewItems.map(item => (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {item.item_type}
                            </span>
                            <span className="text-xs font-mono text-slate-400">QID: {item.question_id}</span>
                          </div>
                          <div className="text-sm font-semibold text-white mt-2">{item.title}</div>
                          {item.description && <div className="text-xs text-slate-400 mt-1">{item.description}</div>}
                          {item.client_note && (
                            <div className="mt-2 text-xs bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-amber-300">
                              <span className="font-bold text-slate-400">Client Note: </span>"{item.client_note}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          {item.status === 'open' ? (
                            <>
                              <button
                                onClick={() => handleResolveReviewItem(item.id, 'resolved', 'Approved by preparer')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Resolve / Accept
                              </button>

                              <button
                                onClick={() => handleResolveReviewItem(item.id, 'deferred', 'Clarification requested')}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1"
                              >
                                Request Info
                              </button>
                            </>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                              {item.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Uploaded Tax Slips & Supporting Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {documents.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-slate-500">
                      No document files uploaded by client yet.
                    </div>
                  ) : (
                    documents.map(doc => (
                      <div key={doc.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-indigo-400" />
                          <div>
                            <div className="text-xs font-bold text-white">{doc.file_name}</div>
                            <div className="text-[10px] text-slate-400">{doc.slip_type || 'Receipt'} • {(doc.file_size / 1024).toFixed(0)} KB</div>
                          </div>
                        </div>
                        <button className="p-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs">
                          Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: INTERNAL NOTES */}
            {activeTab === 'notes' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Preparer Audit Notes</h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal preparer note regarding this client intake..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm"
                  >
                    Add Note
                  </button>
                </div>

                <div className="space-y-3 mt-4">
                  {notes.map(n => (
                    <div key={n.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-200">
                      <div className="font-semibold text-indigo-400 mb-1">{n.preparer_id || 'Tax Preparer'}</div>
                      <div>{n.note}</div>
                      <div className="text-[10px] text-slate-500 mt-2">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE NEW INTAKE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">New Client Tax Intake</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEngagement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jean-Luc Picard"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client Email Address</label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={newClientEmail}
                  onChange={e => setNewClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tax Year</label>
                  <select
                    value={newTaxYear}
                    onChange={e => setNewTaxYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Province Dec 31</label>
                  <select
                    value={newProvince}
                    onChange={e => setNewProvince(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.entries(PROVINCE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{code} - {name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Filing Type</label>
                <select
                  value={newFilingType}
                  onChange={e => setNewFilingType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="original">Original Return (T1 / TP-1)</option>
                  <option value="unfiled_prior_year">Unfiled Prior Year Return</option>
                  <option value="adjustment">T1-ADJ Adjustment Request</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
                >
                  {creating ? 'Creating...' : 'Initialize Tax Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
