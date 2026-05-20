'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Plus, Save, Trash2, ChevronUp, ChevronDown,
  FileText, Users, User, CalendarClock, Repeat, DollarSign, ClipboardList,
  CheckCircle2, Circle, X, Eye, Layers, Settings, Upload, FolderOpen
} from 'lucide-react';

/* ───────── Default stages ───────── */
const DEFAULT_STAGES = [
  { stage_name: 'Lead', stage_code: 'lead', stage_group: 'onboarding', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'Onboarding', stage_code: 'onboarding', stage_group: 'onboarding', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'Data Collection', stage_code: 'data_collection', stage_group: 'work_in_progress', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'Prepared By', stage_code: 'prepared_by', stage_group: 'work_in_progress', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'First Check', stage_code: 'first_check', stage_group: 'work_in_progress', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'Second Check', stage_code: 'second_check', stage_group: 'work_in_progress', is_required: false, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'Sent to Client', stage_code: 'sent_to_client', stage_group: 'work_in_progress', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'Billing', stage_code: 'billing', stage_group: 'invoicing', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
  { stage_name: 'Completed', stage_code: 'completed', stage_group: 'completed', is_required: true, default_assignee_id: '', default_assignee_type: 'unassigned' },
];

const COUNTRIES = ['Canada', 'India', 'USA', 'UK', 'Australia', 'Other'];
const CURRENCIES = ['CAD', 'USD', 'INR', 'GBP', 'AUD', 'EUR'];
const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'per_filing', label: 'Per Filing' },
  { value: 'custom', label: 'Custom' },
];
const DUE_RULE_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'offset_start', label: 'Offset from start' },
  { value: 'offset_fiscal_ye', label: 'Offset from fiscal year-end' },
  { value: 'offset_period_end', label: 'Offset from period end' },
  { value: 'fixed_annual', label: 'Fixed annual date' },
  { value: 'custom', label: 'Custom' },
];
const RECURRENCE_FREQ = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One-time' },
  { value: 'custom', label: 'Custom' },
];
const DOC_CATEGORIES = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'client_supporting', label: 'Client Supporting' },
  { value: 'client_signed', label: 'Client Signed' },
  { value: 'final_document', label: 'Final Document' },
];

interface StageRow {
  stage_name: string; stage_code: string; stage_group: string; is_required: boolean;
  default_assignee_id: string; default_assignee_type: string;
}
interface DocRow {
  document_name: string; document_code: string; description: string; document_category: string;
  is_mandatory: boolean; upload_required: boolean; upload_by: string; linked_stage_code: string;
  sort_order: number; accepted_file_types: string; client_visible: boolean; staff_only: boolean; notes: string;
}
interface NewCategory {
  name: string; code: string; description: string; country: string; colour: string; status: string;
}

const STEPS = [
  { key: 'basic', label: 'Basic Details', icon: FileText },
  { key: 'stages', label: 'Workflow Stages', icon: Layers },
  { key: 'team', label: 'Team Assignment', icon: Users },
  { key: 'recurrence', label: 'Recurrence & Due Date', icon: CalendarClock },
  { key: 'pricing', label: 'Pricing & Category', icon: DollarSign },
  { key: 'documents', label: 'Document Checklist', icon: ClipboardList },
  { key: 'review', label: 'Review & Create', icon: CheckCircle2 },
];

export default function NewTemplateWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /* ── Data from API ── */
  const [categories, setCategories] = useState<any[]>([]);
  const [assignables, setAssignables] = useState<any[]>([]);

  /* ── Step 1: Basic Details ── */
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [country, setCountry] = useState('Canada');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  /* ── Step 2: Stages ── */
  const [stages, setStages] = useState<StageRow[]>(() => DEFAULT_STAGES.map(s => ({ ...s })));
  const [showAddStage, setShowAddStage] = useState(false);
  const [newStage, setNewStage] = useState<StageRow>({ stage_name: '', stage_code: '', stage_group: 'work_in_progress', is_required: false, default_assignee_id: '', default_assignee_type: 'unassigned' });

  /* ── Step 3: Team ── */
  const [assigneeType, setAssigneeType] = useState('unassigned');
  const [defaultAssigneeId, setDefaultAssigneeId] = useState('');

  /* ── Step 4: Recurrence & Due Date ── */
  const [isRecurring, setIsRecurring] = useState(false);
  const [recFreq, setRecFreq] = useState('yearly');
  const [recInterval, setRecInterval] = useState(1);
  const [autoCreateNext, setAutoCreateNext] = useState(false);
  const [dueRule, setDueRule] = useState('manual');
  const [dueOffsetDays, setDueOffsetDays] = useState('');
  const [dueOffsetUnit, setDueOffsetUnit] = useState('days');
  const [dueOffsetDir, setDueOffsetDir] = useState('after');
  const [dueBaseDate, setDueBaseDate] = useState('start_date');
  const [dueFixedDate, setDueFixedDate] = useState('');
  const [dueNotes, setDueNotes] = useState('');

  /* ── Step 5: Pricing ── */
  const [defaultPrice, setDefaultPrice] = useState('');
  const [currency, setCurrency] = useState('CAD');
  const [priceType, setPriceType] = useState('fixed');
  const [newCat, setNewCat] = useState<NewCategory>({ name: '', code: '', description: '', country: 'Canada', colour: '#6366f1', status: 'active' });

  /* ── Step 6: Documents ── */
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [libraryChecklists, setLibraryChecklists] = useState<any[]>([]);
  const [selectedLibraryChecklist, setSelectedLibraryChecklist] = useState('');
  const [editingDocIdx, setEditingDocIdx] = useState<number | null>(null);
  const [docForm, setDocForm] = useState<DocRow>({
    document_name: '', document_code: '', description: '', document_category: 'client_supporting',
    is_mandatory: false, upload_required: false, upload_by: 'either', linked_stage_code: '',
    sort_order: 1, accepted_file_types: '', client_visible: true, staff_only: false, notes: '',
  });

  /* ── Load data ── */
  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(console.error);
    fetch('/api/teams/assignables').then(r => r.json()).then(d => setAssignables(d.assignables || [])).catch(console.error);
    fetch('/api/settings/checklists').then(r => r.json()).then(d => { if (Array.isArray(d)) setLibraryChecklists(d); }).catch(console.error);
  }, []);

  /* ── Helpers ── */
  const filteredAssignables = assignables.filter(a =>
    assigneeType === 'team' ? a.type === 'team' : assigneeType === 'member' ? a.type === 'member' : false
  );

  function moveStage(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= stages.length) return;
    const s = [...stages];
    [s[idx], s[target]] = [s[target], s[idx]];
    setStages(s);
  }
  function deleteStage(idx: number) { setStages(stages.filter((_, i) => i !== idx)); }
  function addStage() {
    if (!newStage.stage_name || !newStage.stage_code) return;
    setStages([...stages, { ...newStage }]);
    setNewStage({ stage_name: '', stage_code: '', stage_group: 'work_in_progress', is_required: false, default_assignee_id: '', default_assignee_type: 'unassigned' });
    setShowAddStage(false);
  }

  function moveDoc(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= documents.length) return;
    const d = [...documents];
    [d[idx], d[target]] = [d[target], d[idx]];
    setDocuments(d);
  }
  function deleteDoc(idx: number) { setDocuments(documents.filter((_, i) => i !== idx)); }

  function addOrUpdateDoc() {
    if (!docForm.document_name) return;
    if (editingDocIdx !== null) {
      const d = [...documents];
      d[editingDocIdx] = { ...docForm };
      setDocuments(d);
      setEditingDocIdx(null);
    } else {
      setDocuments([...documents, { ...docForm, sort_order: documents.length + 1 }]);
    }
    resetDocForm();
  }
  function resetDocForm() {
    setDocForm({
      document_name: '', document_code: '', description: '', document_category: 'client_supporting',
      is_mandatory: false, upload_required: false, upload_by: 'either', linked_stage_code: '',
      sort_order: 1, accepted_file_types: '', client_visible: true, staff_only: false, notes: '',
    });
    setShowAddDoc(false);
    setEditingDocIdx(null);
  }
  function editDoc(idx: number) {
    setDocForm({ ...documents[idx] });
    setEditingDocIdx(idx);
    setShowAddDoc(true);
  }

  function canProceed(): boolean {
    if (currentStep === 0) return name.trim() !== '' && code.trim() !== '';
    return true;
  }

  /* ── Submit ── */
  async function handleCreate() {
    setSaving(true);
    setError('');
    try {
      const rrule = isRecurring ? `FREQ=${recFreq.toUpperCase()};INTERVAL=${recInterval}` : null;
      const payload = {
        name, code, description, country, currency, price_type: priceType,
        category: isNewCategory ? newCat.name : categoryName,
        category_id: isNewCategory ? null : categoryId,
        default_price: defaultPrice ? parseFloat(defaultPrice) : 0,
        is_recurring_default: isRecurring,
        default_recurrence_rule: rrule,
        recurrence_interval_value: isRecurring ? recInterval : null,
        recurrence_interval_unit: isRecurring ? (recFreq === 'quarterly' ? 'months' : recFreq === 'yearly' ? 'years' : 'months') : 'months',
        auto_create_next: autoCreateNext,
        default_due_rule: dueRule,
        default_due_offset_days: dueOffsetDays ? parseInt(dueOffsetDays) : null,
        due_date_offset_unit: dueOffsetUnit,
        due_date_offset_direction: dueOffsetDir,
        due_date_base_date: dueBaseDate,
        due_date_fixed_date: dueFixedDate || null,
        due_date_notes: dueNotes || null,
        assignee_type: assigneeType,
        default_assignee_id: defaultAssigneeId || null,
        stages: stages.map((s, i) => ({ ...s, sequence_order: i + 1 })),
        documents: documents.map((d, i) => ({ ...d, sort_order: i + 1 })),
      };

      const r = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to create template');
      router.push('/dashboard/templates');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* ════════════════ STYLES ════════════════ */
  const styles = {
    wrapper: { display: 'flex', gap: 'var(--space-8)', minHeight: 'calc(100vh - 200px)' } as React.CSSProperties,
    sidebar: {
      width: 240, flexShrink: 0, position: 'sticky' as const, top: 100, alignSelf: 'flex-start',
    } as React.CSSProperties,
    sidebarItem: (active: boolean, completed: boolean) => ({
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)',
      borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: active ? 600 : 400,
      fontSize: 'var(--font-size-sm)', marginBottom: 2,
      background: active ? 'var(--color-primary-light)' : 'transparent',
      color: active ? 'var(--color-primary)' : completed ? 'var(--color-gray-700)' : 'var(--color-gray-500)',
      transition: 'all var(--transition-fast)',
    } as React.CSSProperties),
    sidebarDot: (active: boolean, completed: boolean) => ({
      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
      background: active ? 'var(--color-primary)' : completed ? 'var(--color-success)' : 'var(--color-gray-200)',
      color: active || completed ? 'white' : 'var(--color-gray-500)',
    } as React.CSSProperties),
    main: { flex: 1, minWidth: 0 } as React.CSSProperties,
    stepIndicator: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
      marginBottom: 'var(--space-8)', padding: 'var(--space-4) 0',
    } as React.CSSProperties,
    stepCircle: (active: boolean, completed: boolean) => ({
      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: 600, flexShrink: 0,
      background: active ? 'var(--color-primary)' : completed ? 'var(--color-success)' : 'var(--color-gray-200)',
      color: active || completed ? 'white' : 'var(--color-gray-500)',
    } as React.CSSProperties),
    stepLine: (completed: boolean) => ({
      width: 40, height: 2, flexShrink: 0,
      background: completed ? 'var(--color-success)' : 'var(--color-gray-200)',
    } as React.CSSProperties),
    footer: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: 'var(--space-5) 0', marginTop: 'var(--space-6)',
      borderTop: '1px solid var(--color-gray-200)',
    } as React.CSSProperties,
    stageRow: {
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)',
      background: 'white',
    } as React.CSSProperties,
    summaryCard: {
      marginBottom: 'var(--space-5)',
    } as React.CSSProperties,
    inlineForm: {
      padding: 'var(--space-5)', border: '1px dashed var(--color-gray-300)',
      borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)', background: 'var(--color-gray-25)',
    } as React.CSSProperties,
    toggleTrack: (on: boolean) => ({
      width: 44, height: 24, borderRadius: 12, background: on ? 'var(--color-primary)' : 'var(--color-gray-300)',
      cursor: 'pointer', position: 'relative' as const, transition: 'background var(--transition-fast)',
      flexShrink: 0,
    } as React.CSSProperties),
    toggleThumb: (on: boolean) => ({
      width: 20, height: 20, borderRadius: '50%', background: 'white',
      position: 'absolute' as const, top: 2, left: on ? 22 : 2,
      transition: 'left var(--transition-fast)', boxShadow: 'var(--shadow-xs)',
    } as React.CSSProperties),
  };

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <div style={styles.toggleTrack(value)} onClick={() => onChange(!value)}>
        <div style={styles.toggleThumb(value)} />
      </div>
      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{label}</span>
    </div>
  );

  /* ════════════════ STEP RENDERERS ════════════════ */

  function renderStep1() {
    return (
      <div className="card">
        <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><FileText size={18} /> Basic Details</h3></div>
        <div className="card-body" style={{ maxWidth: 700 }}>
          <div className="form-group">
            <label className="form-label">Template Name *</label>
            <input className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g., T1 Personal Tax Return" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Internal Code *</label>
              <input className="form-input" required value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g., T1" />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <select className="form-select" value={country} onChange={e => setCountry(e.target.value)}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <select className="form-select" value={isNewCategory ? '__new__' : categoryId}
                onChange={e => {
                  if (e.target.value === '__new__') { setIsNewCategory(true); setCategoryId(''); setCategoryName(''); }
                  else {
                    setIsNewCategory(false); setCategoryId(e.target.value);
                    const found = categories.find(c => c.id === e.target.value);
                    setCategoryName(found?.name || '');
                  }
                }}>
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__new__">+ Create New Category</option>
              </select>
            </div>
            {isNewCategory && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                <input className="form-input" placeholder="New category name" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} style={{ marginBottom: 'var(--space-2)' }} />
                <p className="text-xs text-muted">Full category details in Step 5</p>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this compliance type" />
          </div>
          <div className="form-group">
            <Toggle value={isActive} onChange={setIsActive} label={isActive ? 'Active' : 'Inactive'} />
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <button className="btn btn-secondary" onClick={() => setShowAddStage(true)}><Plus size={16} /> Add Stage</button>
        </div>
        <div className="card" style={{ maxWidth: 900 }}>
          <div className="card-header"><h3>Workflow Stages ({stages.length})</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {stages.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}><p>No stages. Add a stage to build the workflow.</p></div>
            ) : (
              <div>
                {/* Header row */}
                <div style={{ ...styles.stageRow, background: 'var(--color-gray-50)', fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                  <span style={{ width: 36, textAlign: 'center' }}>#</span>
                  <span style={{ flex: 2 }}>Name</span>
                  <span style={{ flex: 1 }}>Code</span>
                  <span style={{ flex: 1 }}>Phase</span>
                  <span style={{ width: 80, textAlign: 'center' }}>Required</span>
                  <span style={{ width: 96 }}></span>
                </div>
                {stages.map((stage, idx) => (
                  <div key={idx} style={styles.stageRow}>
                    <div style={{ width: 36, height: 28, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem', flexShrink: 0 }}>{idx + 1}</div>
                    <span style={{ flex: 2, fontWeight: 500 }}>{stage.stage_name}</span>
                    <span className="text-sm text-muted" style={{ flex: 1 }}>{stage.stage_code}</span>
                    <span style={{ flex: 1 }}><span className={`badge ${stage.stage_group === 'completed' ? 'badge-green' : stage.stage_group === 'onboarding' ? 'badge-blue' : stage.stage_group === 'invoicing' ? 'badge-yellow' : 'badge-cyan'}`}>{stage.stage_group.replace(/_/g, ' ')}</span></span>
                    <span style={{ width: 80, textAlign: 'center' }}>
                      <input type="checkbox" checked={stage.is_required} onChange={e => { const s = [...stages]; s[idx] = { ...s[idx], is_required: e.target.checked }; setStages(s); }} style={{ accentColor: 'var(--color-primary)' }} />
                    </span>
                    <span style={{ display: 'flex', gap: 'var(--space-1)', width: 96, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => moveStage(idx, -1)} style={{ padding: 4 }}><ChevronUp size={14} /></button>
                      <button className="btn btn-ghost btn-sm" disabled={idx === stages.length - 1} onClick={() => moveStage(idx, 1)} style={{ padding: 4 }}><ChevronDown size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteStage(idx)} style={{ color: 'var(--color-danger)', padding: 4 }}><Trash2 size={14} /></button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inline Add Stage */}
        {showAddStage && (
          <div style={styles.inlineForm}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>Add New Stage</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stage Name *</label>
                <input className="form-input" value={newStage.stage_name} onChange={e => setNewStage({ ...newStage, stage_name: e.target.value })} placeholder="e.g., Final Review" />
              </div>
              <div className="form-group">
                <label className="form-label">Internal Code *</label>
                <input className="form-input" value={newStage.stage_code} onChange={e => setNewStage({ ...newStage, stage_code: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="e.g., final_review" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phase</label>
                <select className="form-select" value={newStage.stage_group} onChange={e => setNewStage({ ...newStage, stage_group: e.target.value })}>
                  <option value="onboarding">Onboarding</option>
                  <option value="work_in_progress">Work in Progress</option>
                  <option value="invoicing">Invoicing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer', paddingBottom: 'var(--space-2)' }}>
                  <input type="checkbox" checked={newStage.is_required} onChange={e => setNewStage({ ...newStage, is_required: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                  Required
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button className="btn btn-primary btn-sm" onClick={addStage} disabled={!newStage.stage_name || !newStage.stage_code}>Add to Workflow</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddStage(false)}>Cancel</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function renderStep3() {
    return (
      <div style={{ maxWidth: 800 }}>
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Users size={18} /> Default Assignee</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Assign work to</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                {(['unassigned', 'team', 'member'] as const).map(t => (
                  <button key={t} className={`btn ${assigneeType === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => { setAssigneeType(t); setDefaultAssigneeId(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t === 'team' ? <Users size={14} /> : t === 'member' ? <User size={14} /> : null}
                    {t === 'unassigned' ? 'Unassigned' : t === 'team' ? 'Team' : 'Individual'}
                  </button>
                ))}
              </div>
            </div>
            {assigneeType !== 'unassigned' && (
              <div className="form-group">
                <label className="form-label">Default {assigneeType === 'team' ? 'Team' : 'Team Member'}</label>
                <select className="form-select" value={defaultAssigneeId} onChange={e => setDefaultAssigneeId(e.target.value)}>
                  <option value="">Select {assigneeType}...</option>
                  {filteredAssignables.map(a => (
                    <option key={a.id} value={a.id}>{a.display_name} {!a.active ? '(Inactive)' : ''} — {a.detail}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Per-stage overrides */}
        <div className="card">
          <div className="card-header"><h3>Per-Stage Assignment Overrides</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ ...styles.stageRow, background: 'var(--color-gray-50)', fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              <span style={{ width: 30 }}>#</span>
              <span style={{ flex: 1 }}>Stage</span>
              <span style={{ flex: 1 }}>Assignee Type</span>
              <span style={{ flex: 2 }}>Assignee</span>
            </div>
            {stages.map((stage, idx) => (
              <div key={idx} style={styles.stageRow}>
                <span className="text-sm text-muted" style={{ width: 30 }}>{idx + 1}</span>
                <span style={{ flex: 1, fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{stage.stage_name}</span>
                <span style={{ flex: 1 }}>
                  <select className="form-select" value={stage.default_assignee_type} onChange={e => {
                    const s = [...stages]; s[idx] = { ...s[idx], default_assignee_type: e.target.value, default_assignee_id: '' }; setStages(s);
                  }} style={{ height: 32, fontSize: 'var(--font-size-xs)' }}>
                    <option value="unassigned">Inherit default</option>
                    <option value="team">Team</option>
                    <option value="member">Individual</option>
                  </select>
                </span>
                <span style={{ flex: 2 }}>
                  {stage.default_assignee_type !== 'unassigned' && (
                    <select className="form-select" value={stage.default_assignee_id} onChange={e => {
                      const s = [...stages]; s[idx] = { ...s[idx], default_assignee_id: e.target.value }; setStages(s);
                    }} style={{ height: 32, fontSize: 'var(--font-size-xs)' }}>
                      <option value="">Select...</option>
                      {assignables.filter(a => stage.default_assignee_type === 'team' ? a.type === 'team' : a.type === 'member').map(a => (
                        <option key={a.id} value={a.id}>{a.display_name}</option>
                      ))}
                    </select>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderStep4() {
    const showOffset = dueRule === 'offset_start' || dueRule === 'offset_fiscal_ye' || dueRule === 'offset_period_end';
    return (
      <div style={{ maxWidth: 700 }}>
        {/* Recurrence */}
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Repeat size={18} /> Recurrence</h3></div>
          <div className="card-body">
            <div className="form-group">
              <Toggle value={isRecurring} onChange={setIsRecurring} label="This compliance is recurring by default" />
            </div>
            {isRecurring && (
              <>
                <div className="form-row" style={{ marginTop: 'var(--space-3)' }}>
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select className="form-select" value={recFreq} onChange={e => setRecFreq(e.target.value)}>
                      {RECURRENCE_FREQ.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  {recFreq === 'custom' && (
                    <div className="form-group">
                      <label className="form-label">Repeat every</label>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <input className="form-input" type="number" min="1" value={recInterval} onChange={e => setRecInterval(parseInt(e.target.value) || 1)} style={{ width: 80 }} />
                        <span className="text-sm">month(s)</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <Toggle value={autoCreateNext} onChange={setAutoCreateNext} label="Auto-create next period when current is completed" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CalendarClock size={18} /> Due Date Rule</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">How are due dates set?</label>
              <select className="form-select" value={dueRule} onChange={e => setDueRule(e.target.value)}>
                {DUE_RULE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {showOffset && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Offset Amount</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g., 14" value={dueOffsetDays} onChange={e => setDueOffsetDays(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-select" value={dueOffsetUnit} onChange={e => setDueOffsetUnit(e.target.value)}>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Direction</label>
                  <select className="form-select" value={dueOffsetDir} onChange={e => setDueOffsetDir(e.target.value)}>
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>
              </div>
            )}
            {dueRule === 'offset_start' && (
              <div className="form-group">
                <label className="form-label">Base Date</label>
                <select className="form-select" value={dueBaseDate} onChange={e => setDueBaseDate(e.target.value)}>
                  <option value="start_date">Start Date</option>
                  <option value="engagement_date">Engagement Date</option>
                  <option value="onboarding_date">Onboarding Date</option>
                </select>
              </div>
            )}
            {dueRule === 'fixed_annual' && (
              <div className="form-group">
                <label className="form-label">Fixed Date</label>
                <input className="form-input" type="date" value={dueFixedDate} onChange={e => setDueFixedDate(e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={dueNotes} onChange={e => setDueNotes(e.target.value)} placeholder="Any additional notes about the due date rule" rows={2} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep5() {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><DollarSign size={18} /> Pricing</h3></div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Default Price</label>
                <input className="form-input" type="number" step="0.01" value={defaultPrice} onChange={e => setDefaultPrice(e.target.value)} placeholder="500.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Price Type</label>
              <select className="form-select" value={priceType} onChange={e => setPriceType(e.target.value)}>
                {PRICE_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* New category detail form */}
        {isNewCategory && (
          <div className="card">
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><FolderOpen size={18} /> New Category Details</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input className="form-input" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} placeholder="e.g., Personal Tax" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category Code *</label>
                  <input className="form-input" value={newCat.code} onChange={e => setNewCat({ ...newCat, code: e.target.value.toUpperCase() })} placeholder="e.g., PERSONAL" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={newCat.description} onChange={e => setNewCat({ ...newCat, description: e.target.value })} placeholder="Describe this category" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select className="form-select" value={newCat.country} onChange={e => setNewCat({ ...newCat, country: e.target.value })}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Colour</label>
                  <input className="form-input" type="color" value={newCat.colour} onChange={e => setNewCat({ ...newCat, colour: e.target.value })} style={{ height: 38, padding: 4 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={newCat.status} onChange={e => setNewCat({ ...newCat, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderStep6() {
    return (
      <div style={{ maxWidth: 1000 }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <button className="btn btn-secondary" onClick={() => { resetDocForm(); setShowAddDoc(true); }}><Plus size={16} /> Add Document</button>
        </div>
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><ClipboardList size={18} /> Document Checklist ({documents.length})</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {documents.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <Upload size={48} />
                <h3 style={{ marginBottom: 'var(--space-2)' }}>Use Generic Document Checklist?</h3>
                <p style={{ marginBottom: 'var(--space-4)' }}>You can start from scratch or apply a pre-configured checklist from your library.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
                  <button className="btn btn-secondary" onClick={() => setShowAddDoc(true)} style={{ justifyContent: 'center' }}>No, start blank</button>
                  <div style={{ borderTop: '1px solid var(--color-gray-200)', margin: 'var(--space-2) 0' }} />
                  <label className="form-label text-center" style={{ margin: 0 }}>Select from saved checklist library</label>
                  <select className="form-select" value={selectedLibraryChecklist} onChange={e => setSelectedLibraryChecklist(e.target.value)}>
                    <option value="">-- Choose a checklist --</option>
                    {libraryChecklists.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.items?.length || 0} items)</option>
                    ))}
                  </select>
                  <button className="btn btn-primary" disabled={!selectedLibraryChecklist} onClick={() => {
                    const chk = libraryChecklists.find(c => c.id === selectedLibraryChecklist);
                    if (chk && chk.items) {
                      setDocuments(chk.items.map((item: any, idx: number) => ({
                        document_name: item.document_name,
                        document_code: item.document_code || '',
                        description: item.description || '',
                        document_category: item.document_category || 'client_supporting',
                        is_mandatory: item.is_mandatory === 1,
                        upload_required: item.upload_required === 1,
                        upload_by: item.upload_by || 'either',
                        linked_stage_code: item.suggested_stage || '',
                        sort_order: idx + 1,
                        accepted_file_types: item.accepted_file_types || '',
                        client_visible: item.client_visible === 1,
                        staff_only: item.staff_only === 1,
                        notes: item.notes || ''
                      })));
                    }
                  }} style={{ justifyContent: 'center' }}>Yes, apply checklist</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ ...styles.stageRow, background: 'var(--color-gray-50)', fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                  <span style={{ width: 30 }}>#</span>
                  <span style={{ flex: 2 }}>Name</span>
                  <span style={{ flex: 1 }}>Category</span>
                  <span style={{ flex: 1 }}>Stage</span>
                  <span style={{ width: 64, textAlign: 'center' }}>Req.</span>
                  <span style={{ width: 64, textAlign: 'center' }}>Upload</span>
                  <span style={{ width: 110 }}></span>
                </div>
                {documents.map((doc, idx) => (
                  <div key={idx} style={styles.stageRow}>
                    <span className="text-sm text-muted" style={{ width: 30 }}>{idx + 1}</span>
                    <span style={{ flex: 2 }}>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{doc.document_name}</div>
                      {doc.document_code && <div className="text-xs text-muted">{doc.document_code}</div>}
                    </span>
                    <span style={{ flex: 1 }}><span className="badge badge-gray">{doc.document_category.replace(/_/g, ' ')}</span></span>
                    <span className="text-sm" style={{ flex: 1 }}>{doc.linked_stage_code ? stages.find(s => s.stage_code === doc.linked_stage_code)?.stage_name || doc.linked_stage_code : '—'}</span>
                    <span style={{ width: 64, textAlign: 'center' }}>{doc.is_mandatory ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <Circle size={16} style={{ color: 'var(--color-gray-300)' }} />}</span>
                    <span style={{ width: 64, textAlign: 'center' }}>{doc.upload_required ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <Circle size={16} style={{ color: 'var(--color-gray-300)' }} />}</span>
                    <span style={{ display: 'flex', gap: 'var(--space-1)', width: 110, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => moveDoc(idx, -1)} style={{ padding: 4 }}><ChevronUp size={14} /></button>
                      <button className="btn btn-ghost btn-sm" disabled={idx === documents.length - 1} onClick={() => moveDoc(idx, 1)} style={{ padding: 4 }}><ChevronDown size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => editDoc(idx)} style={{ padding: 4 }}><Settings size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteDoc(idx)} style={{ color: 'var(--color-danger)', padding: 4 }}><Trash2 size={14} /></button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Document inline form */}
        {showAddDoc && (
          <div style={styles.inlineForm}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>{editingDocIdx !== null ? 'Edit Document' : 'Add Document'}</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Document Name *</label>
                <input className="form-input" value={docForm.document_name} onChange={e => setDocForm({ ...docForm, document_name: e.target.value })} placeholder="e.g., T4 Slip" />
              </div>
              <div className="form-group">
                <label className="form-label">Document Code</label>
                <input className="form-input" value={docForm.document_code} onChange={e => setDocForm({ ...docForm, document_code: e.target.value.toUpperCase() })} placeholder="e.g., T4" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} placeholder="What this document is for" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={docForm.document_category} onChange={e => setDocForm({ ...docForm, document_category: e.target.value })}>
                  {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Applicable Stage</label>
                <select className="form-select" value={docForm.linked_stage_code} onChange={e => setDocForm({ ...docForm, linked_stage_code: e.target.value })}>
                  <option value="">Any stage</option>
                  {stages.map(s => <option key={s.stage_code} value={s.stage_code}>{s.stage_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Upload By</label>
                <select className="form-select" value={docForm.upload_by} onChange={e => setDocForm({ ...docForm, upload_by: e.target.value })}>
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="either">Either</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Accepted File Types</label>
              <input className="form-input" value={docForm.accepted_file_types} onChange={e => setDocForm({ ...docForm, accepted_file_types: e.target.value })} placeholder="e.g., .pdf,.jpg,.png (leave empty for any)" />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <input type="checkbox" checked={docForm.is_mandatory} onChange={e => setDocForm({ ...docForm, is_mandatory: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                Required
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <input type="checkbox" checked={docForm.upload_required} onChange={e => setDocForm({ ...docForm, upload_required: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                Upload Required
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <input type="checkbox" checked={docForm.client_visible} onChange={e => setDocForm({ ...docForm, client_visible: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                Client Visible
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <input type="checkbox" checked={docForm.staff_only} onChange={e => setDocForm({ ...docForm, staff_only: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                Staff Only
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={docForm.notes} onChange={e => setDocForm({ ...docForm, notes: e.target.value })} placeholder="Internal notes about this document" />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-primary btn-sm" onClick={addOrUpdateDoc} disabled={!docForm.document_name}>{editingDocIdx !== null ? 'Update' : 'Add'} Document</button>
              <button className="btn btn-secondary btn-sm" onClick={resetDocForm}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderStep7() {
    const selectedCategory = isNewCategory ? newCat.name : categoryName;
    const recLabel = isRecurring ? `${RECURRENCE_FREQ.find(f => f.value === recFreq)?.label || recFreq}${recFreq === 'custom' ? ` (every ${recInterval} months)` : ''}` : 'No';
    const dueLabel = DUE_RULE_TYPES.find(r => r.value === dueRule)?.label || dueRule;
    const priceLabel = defaultPrice ? `${currency} ${parseFloat(defaultPrice).toFixed(2)}` : 'Not set';
    const priceTypeLabel = PRICE_TYPES.find(p => p.value === priceType)?.label || priceType;

    const SummarySection = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
      <div className="card" style={styles.summaryCard}>
        <div className="card-header">
          <h3 style={{ fontSize: 'var(--font-size-base)' }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentStep(step)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Settings size={14} /> Edit
          </button>
        </div>
        <div className="card-body">{children}</div>
      </div>
    );

    const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
      <div style={{ display: 'flex', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-50)' }}>
        <span className="text-sm text-muted" style={{ width: 200, flexShrink: 0 }}>{label}</span>
        <span className="text-sm" style={{ fontWeight: 500 }}>{value || '—'}</span>
      </div>
    );

    return (
      <div style={{ maxWidth: 800 }}>
        <SummarySection title="Basic Details" step={0}>
          <Row label="Template Name" value={name} />
          <Row label="Internal Code" value={code} />
          <Row label="Country" value={country} />
          <Row label="Category" value={selectedCategory || 'None'} />
          <Row label="Description" value={description || 'None'} />
          <Row label="Status" value={isActive ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>} />
        </SummarySection>

        <SummarySection title="Workflow Stages" step={1}>
          <p className="text-sm" style={{ marginBottom: 'var(--space-3)' }}>{stages.length} stage{stages.length !== 1 ? 's' : ''} configured</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {stages.map((s, i) => (
              <span key={i} className={`badge ${s.stage_group === 'completed' ? 'badge-green' : s.stage_group === 'onboarding' ? 'badge-blue' : s.stage_group === 'invoicing' ? 'badge-yellow' : 'badge-cyan'}`}>
                {i + 1}. {s.stage_name}
              </span>
            ))}
          </div>
        </SummarySection>

        <SummarySection title="Team Assignment" step={2}>
          <Row label="Default Assignee Type" value={assigneeType === 'unassigned' ? 'Unassigned' : assigneeType === 'team' ? 'Team' : 'Individual'} />
          {defaultAssigneeId && <Row label="Default Assignee" value={assignables.find(a => a.id === defaultAssigneeId)?.display_name || defaultAssigneeId} />}
          <Row label="Per-stage overrides" value={`${stages.filter(s => s.default_assignee_type !== 'unassigned').length} stage(s) with custom assignment`} />
        </SummarySection>

        <SummarySection title="Recurrence & Due Date" step={3}>
          <Row label="Recurring" value={recLabel} />
          {isRecurring && <Row label="Auto-create next" value={autoCreateNext ? 'Yes' : 'No'} />}
          <Row label="Due Date Rule" value={dueLabel} />
          {(dueRule.startsWith('offset')) && <Row label="Offset" value={`${dueOffsetDays || '—'} ${dueOffsetUnit} ${dueOffsetDir}`} />}
          {dueFixedDate && <Row label="Fixed Date" value={dueFixedDate} />}
        </SummarySection>

        <SummarySection title="Pricing" step={4}>
          <Row label="Default Price" value={priceLabel} />
          <Row label="Price Type" value={priceTypeLabel} />
          <Row label="Currency" value={currency} />
          {isNewCategory && <Row label="New Category" value={newCat.name} />}
        </SummarySection>

        <SummarySection title="Document Checklist" step={5}>
          <Row label="Documents" value={`${documents.length} document(s)`} />
          {documents.length > 0 && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              {documents.map((d, i) => (
                <div key={i} className="text-sm" style={{ padding: 'var(--space-1) 0' }}>
                  {d.is_mandatory && <span style={{ color: 'var(--color-danger)', marginRight: 4 }}>*</span>}
                  {d.document_name}
                  {d.document_code && <span className="text-muted"> ({d.document_code})</span>}
                </div>
              ))}
            </div>
          )}
        </SummarySection>

        {error && (
          <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  /* ════════════════ MAIN RENDER ════════════════ */
  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7];

  return (
    <>
      <Link href="/dashboard/templates" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> Back to Templates
      </Link>

      <div className="page-header">
        <div>
          <h1>New Compliance Template</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>
            Configure all aspects of your compliance workflow before saving
          </p>
        </div>
      </div>

      {/* Step Indicator Bar */}
      <div style={styles.stepIndicator}>
        {STEPS.map((step, i) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              onClick={() => setCurrentStep(i)}
              style={{ ...styles.stepCircle(i === currentStep, i < currentStep), cursor: 'pointer' }}
              title={step.label}
            >
              {i < currentStep ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div style={styles.stepLine(i < currentStep)} />}
          </div>
        ))}
      </div>

      <div style={styles.wrapper}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div className="card" style={{ padding: 'var(--space-3)' }}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.key} style={styles.sidebarItem(i === currentStep, i < currentStep)} onClick={() => setCurrentStep(i)}>
                  <div style={styles.sidebarDot(i === currentStep, i < currentStep)}>
                    {i < currentStep ? <CheckCircle2 size={12} /> : <Icon size={12} />}
                  </div>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div style={styles.main}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {(() => { const Icon = STEPS[currentStep].icon; return <Icon size={20} />; })()}
            Step {currentStep + 1}: {STEPS[currentStep].label}
          </h2>

          {stepRenderers[currentStep]()}

          {/* Footer nav */}
          <div style={styles.footer}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {currentStep > 0 && (
                <button className="btn btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Link href="/dashboard/templates" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center' }}>Cancel</Link>
              {currentStep < STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={handleCreate} disabled={saving || !name || !code}>
                  <Save size={18} /> {saving ? 'Creating...' : 'Create Template'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
