'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GripVertical, Plus, Save, Trash2, Settings, Bell, HelpCircle, Users, User, CalendarClock, Repeat } from 'lucide-react';

export default function TemplateBuilderPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);

  const [reminderRules, setReminderRules] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [assignables, setAssignables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('stages');

  // Settings form
  const [settings, setSettings] = useState({
    assignee_type: 'unassigned',
    default_assignee_id: '',
    is_recurring_default: false,
    default_recurrence_rule: '',
    default_due_rule: 'manual',
    default_due_offset_days: '',
    default_price: '',
    description: '',
  });

  // Recurrence builder form
  const [recFreq, setRecFreq] = useState('yearly');
  const [recInterval, setRecInterval] = useState(1);

  // New stage modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStage, setNewStage] = useState({ stage_name: '', stage_code: '', stage_group: 'work_in_progress', default_assignee_role: '', auto_advance: false });

  // New reminder rule
  const [newRule, setNewRule] = useState({ offset_value: 30, offset_unit: 'days', channel: 'both', recipient_scope: 'client' });

  // New question
  const [newQuestion, setNewQuestion] = useState({ question_text: '', question_type: 'text', is_required: false, options: '' });

  // Drag and drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then(r => r.json())
      .then(d => {
        setTemplate(d.template);
        setStages(d.stages || []);
        setReminderRules(d.reminderRules || []);
        setQuestions(d.questions || []);
        if (d.template) {
          setSettings({
            assignee_type: d.template.assignee_type || 'unassigned',
            default_assignee_id: d.template.default_assignee_id || '',
            is_recurring_default: !!d.template.is_recurring_default,
            default_recurrence_rule: d.template.default_recurrence_rule || '',
            default_due_rule: d.template.default_due_rule || 'manual',
            default_due_offset_days: d.template.default_due_offset_days?.toString() || '',
            default_price: d.template.default_price?.toString() || '',
            description: d.template.description || '',
          });
          // Parse recurrence rule if exists
          if (d.template.default_recurrence_rule) {
            const match = d.template.default_recurrence_rule.match(/FREQ=(\w+)/);
            if (match) setRecFreq(match[1].toLowerCase());
            const intMatch = d.template.default_recurrence_rule.match(/INTERVAL=(\d+)/);
            if (intMatch) setRecInterval(parseInt(intMatch[1]));
          }
        }
        setLoading(false);
      });
    fetch('/api/teams/assignables').then(r => r.json()).then(d => setAssignables(d.assignables || []));
  }, [id]);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _stages = [...stages];
    const dragged = _stages.splice(dragItem.current, 1)[0];
    _stages.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setStages(_stages);
  };

  const showSave = (msg: string) => { setSaveSuccess(msg); setTimeout(() => setSaveSuccess(''), 3000); };

  const saveStages = async () => {
    setSaving(true);
    await fetch(`/api/templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_stages', stages }) });
    showSave('Workflow stages saved');
    setSaving(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    const rrule = settings.is_recurring_default ? `FREQ=${recFreq.toUpperCase()};INTERVAL=${recInterval}` : null;
    await fetch(`/api/templates/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_settings', ...settings,
        default_recurrence_rule: rrule,
        default_price: settings.default_price ? parseFloat(settings.default_price) : null,
        default_due_offset_days: settings.default_due_offset_days ? parseInt(settings.default_due_offset_days) : null,
      }),
    });
    showSave('Template settings saved');
    setSaving(false);
  };

  const saveReminderRules = async () => {
    setSaving(true);
    await fetch(`/api/templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_reminder_rules', rules: reminderRules }) });
    showSave('Reminder rules saved');
    setSaving(false);
  };

  const saveQuestions = async () => {
    setSaving(true);
    await fetch(`/api/templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_questions', questions }) });
    showSave('Client questions saved');
    setSaving(false);
  };

  const addStage = (e: React.FormEvent) => {
    e.preventDefault();
    setStages([...stages, { ...newStage, id: null }]);
    setShowAddModal(false);
    setNewStage({ stage_name: '', stage_code: '', stage_group: 'work_in_progress', default_assignee_role: '', auto_advance: false });
  };

  if (loading) return <div style={{ padding: 'var(--space-8)' }}>Loading template builder...</div>;
  if (!template) return <div style={{ padding: 'var(--space-8)' }}>Template not found.</div>;

  const tabs = [
    { key: 'stages', label: 'Workflow Stages', icon: <GripVertical size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    { key: 'reminders', label: 'Reminder Defaults', icon: <Bell size={16} /> },
    { key: 'questions', label: 'Client Questions', icon: <HelpCircle size={16} /> },
  ];

  const filteredAssignables = assignables.filter(a =>
    settings.assignee_type === 'team' ? a.type === 'team' : settings.assignee_type === 'member' ? a.type === 'member' : false
  );

  return (
    <>
      <Link href="/dashboard/templates" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> Back to Templates
      </Link>

      <div className="page-header">
        <div>
          <h1>{template.name}</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>
            <span className="badge badge-gray" style={{ marginRight: 8 }}>{template.code}</span>
            <span className="badge badge-blue" style={{ marginRight: 8 }}>v{template.version}</span>
            Configure this compliance template
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-success)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontWeight: 500 }}>
          ✓ {saveSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {tabs.map(t => (
          <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ========== STAGES TAB ========== */}
      {activeTab === 'stages' && (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Stage</button>
            <button className="btn btn-primary" onClick={saveStages} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Stages'}</button>
          </div>

          <div className="card" style={{ maxWidth: 800 }}>
            <div className="card-header"><h3>Workflow Stages ({stages.length})</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {stages.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}><p>No stages. Add a stage to build the workflow.</p></div>
              ) : (
                <div className="dnd-list">
                  {stages.map((stage, index) => (
                    <div key={index} draggable
                      onDragStart={() => (dragItem.current = index)}
                      onDragEnter={() => (dragOverItem.current = index)}
                      onDragEnd={handleSort}
                      onDragOver={e => e.preventDefault()}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)', background: 'white', borderBottom: '1px solid var(--color-gray-100)', cursor: 'grab' }}
                    >
                      <GripVertical size={20} style={{ color: 'var(--color-gray-400)' }} />
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>{index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{stage.stage_name}</div>
                        <div className="text-xs text-muted" style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4 }}>
                          <span>Code: {stage.stage_code}</span>
                          <span>Phase: {stage.stage_group?.replace(/_/g, ' ')}</span>
                          {stage.default_assignee_role && <span className="badge badge-blue">Auto: {stage.default_assignee_role.replace('_', ' ')}</span>}
                          {stage.auto_advance === 1 && <span className="badge badge-cyan">Auto-Advance</span>}
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => { const s = [...stages]; s.splice(index, 1); setStages(s); }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========== SETTINGS TAB ========== */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: 700 }}>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Users size={18} /> Default Assignment</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Assign work to</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  {(['unassigned', 'team', 'member'] as const).map(t => (
                    <button key={t} className={`btn ${settings.assignee_type === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setSettings({ ...settings, assignee_type: t, default_assignee_id: '' })}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t === 'team' ? <Users size={14} /> : t === 'member' ? <User size={14} /> : null}
                      {t === 'unassigned' ? 'Unassigned' : t === 'team' ? 'Team' : 'Individual'}
                    </button>
                  ))}
                </div>
              </div>
              {settings.assignee_type !== 'unassigned' && (
                <div className="form-group">
                  <label className="form-label">Default {settings.assignee_type === 'team' ? 'Team' : 'Team Member'}</label>
                  <select className="form-select" value={settings.default_assignee_id} onChange={e => setSettings({ ...settings, default_assignee_id: e.target.value })}>
                    <option value="">Select {settings.assignee_type}...</option>
                    {filteredAssignables.map(a => (
                      <option key={a.id} value={a.id}>{a.display_name} {!a.active ? '(Inactive)' : ''} — {a.detail}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Repeat size={18} /> Recurrence Defaults</h3></div>
            <div className="card-body">
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="rec_default" checked={settings.is_recurring_default} onChange={e => setSettings({ ...settings, is_recurring_default: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                <label htmlFor="rec_default" style={{ fontWeight: 500, cursor: 'pointer' }}>This compliance is recurring by default</label>
              </div>
              {settings.is_recurring_default && (
                <div className="form-row" style={{ marginTop: 'var(--space-3)' }}>
                  <div className="form-group">
                    <label className="form-label">Repeat every</label>
                    <input className="form-input" type="number" min="1" value={recInterval} onChange={e => setRecInterval(parseInt(e.target.value) || 1)} style={{ width: 80 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select className="form-select" value={recFreq} onChange={e => setRecFreq(e.target.value)}>
                      <option value="daily">Day(s)</option>
                      <option value="weekly">Week(s)</option>
                      <option value="monthly">Month(s)</option>
                      <option value="yearly">Year(s)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CalendarClock size={18} /> Due Date Rule</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">How are due dates set?</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  {(['manual', 'offset'] as const).map(r => (
                    <button key={r} className={`btn ${settings.default_due_rule === r ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setSettings({ ...settings, default_due_rule: r })}>
                      {r === 'manual' ? 'Manual (user picks)' : 'Offset from start'}
                    </button>
                  ))}
                </div>
              </div>
              {settings.default_due_rule === 'offset' && (
                <div className="form-group">
                  <label className="form-label">Default offset (days from start)</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g., 14" value={settings.default_due_offset_days} onChange={e => setSettings({ ...settings, default_due_offset_days: e.target.value })} style={{ width: 120 }} />
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Default Price (CAD)</label>
              <input className="form-input" type="number" step="0.01" value={settings.default_price} onChange={e => setSettings({ ...settings, default_price: e.target.value })} placeholder="500.00" />
            </div>
          </div>

          <button className="btn btn-primary" onClick={saveSettings} disabled={saving} style={{ marginTop: 'var(--space-4)' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* ========== REMINDERS TAB ========== */}
      {activeTab === 'reminders' && (
        <div style={{ maxWidth: 700 }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Bell size={18} /> Due-Date Reminder Rules</h3>
            </div>
            <div className="card-body">
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                Define when notifications are sent before a compliance due date. These become defaults when adding a new compliance to a client.
              </p>
              {reminderRules.map((rule, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }}>
                  <Bell size={16} style={{ color: 'var(--color-warning)' }} />
                  <span style={{ fontWeight: 500 }}>{rule.offset_value} {rule.offset_unit}</span>
                  <span className="text-sm text-muted">before due date</span>
                  <span className={`badge ${rule.channel === 'email' ? 'badge-blue' : rule.channel === 'in_app' ? 'badge-cyan' : 'badge-green'}`}>{rule.channel.replace('_', ' ')}</span>
                  <span className="badge badge-gray">{rule.recipient_scope}</span>
                  <div style={{ flex: 1 }} />
                  <button className="btn btn-ghost btn-sm" onClick={() => { const r = [...reminderRules]; r.splice(i, 1); setReminderRules(r); }} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                </div>
              ))}

              <div style={{ padding: 'var(--space-4)', border: '1px dashed var(--color-gray-300)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>Add Reminder Rule</h4>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label text-xs">Offset</label>
                    <input className="form-input" type="number" min="1" value={newRule.offset_value} onChange={e => setNewRule({ ...newRule, offset_value: parseInt(e.target.value) || 1 })} style={{ width: 70 }} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label text-xs">Unit</label>
                    <select className="form-select" value={newRule.offset_unit} onChange={e => setNewRule({ ...newRule, offset_unit: e.target.value })} style={{ width: 100 }}>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label text-xs">Channel</label>
                    <select className="form-select" value={newRule.channel} onChange={e => setNewRule({ ...newRule, channel: e.target.value })} style={{ width: 120 }}>
                      <option value="email">Email</option>
                      <option value="in_app">In-App</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label text-xs">Who</label>
                    <select className="form-select" value={newRule.recipient_scope} onChange={e => setNewRule({ ...newRule, recipient_scope: e.target.value })} style={{ width: 100 }}>
                      <option value="client">Client</option>
                      <option value="staff">Staff</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    setReminderRules([...reminderRules, { ...newRule }]);
                    setNewRule({ offset_value: 7, offset_unit: 'days', channel: 'both', recipient_scope: 'client' });
                  }}>+ Add</button>
                </div>
              </div>
              <button className="btn btn-primary" onClick={saveReminderRules} disabled={saving} style={{ marginTop: 'var(--space-4)' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Reminder Rules'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== QUESTIONS TAB ========== */}
      {activeTab === 'questions' && (
        <div style={{ maxWidth: 700 }}>
          <div className="card">
            <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><HelpCircle size={18} /> Client Information Questions</h3></div>
            <div className="card-body">
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                Define one-time questions to ask when this compliance is added to a client. Answers are captured during the Add Compliance wizard.
              </p>
              {questions.map((q, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-gray-400)', width: 24, textAlign: 'center' }}>{i + 1}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{q.question_text}</span>
                  <span className="badge badge-gray">{q.question_type}</span>
                  {q.is_required ? <span className="badge badge-red">Required</span> : null}
                  <button className="btn btn-ghost btn-sm" onClick={() => { const qs = [...questions]; qs.splice(i, 1); setQuestions(qs); }} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                </div>
              ))}

              <div style={{ padding: 'var(--space-4)', border: '1px dashed var(--color-gray-300)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>Add Question</h4>
                <div className="form-group">
                  <input className="form-input" placeholder="Question text..." value={newQuestion.question_text} onChange={e => setNewQuestion({ ...newQuestion, question_text: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <select className="form-select" value={newQuestion.question_type} onChange={e => setNewQuestion({ ...newQuestion, question_type: e.target.value })} style={{ width: 140 }}>
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="file_upload">File Upload</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={newQuestion.is_required} onChange={e => setNewQuestion({ ...newQuestion, is_required: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                    Required
                  </label>
                  <button className="btn btn-primary btn-sm" disabled={!newQuestion.question_text} onClick={() => {
                    setQuestions([...questions, { ...newQuestion, sequence_order: questions.length + 1 }]);
                    setNewQuestion({ question_text: '', question_type: 'text', is_required: false, options: '' });
                  }}>+ Add</button>
                </div>
              </div>
              <button className="btn btn-primary" onClick={saveQuestions} disabled={saving} style={{ marginTop: 'var(--space-4)' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Questions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Add New Stage</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={addStage}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Stage Name *</label><input className="form-input" required value={newStage.stage_name} onChange={e => setNewStage({ ...newStage, stage_name: e.target.value })} placeholder="e.g., Final Review" /></div>
                <div className="form-group"><label className="form-label">Internal Code *</label><input className="form-input" required value={newStage.stage_code} onChange={e => setNewStage({ ...newStage, stage_code: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="e.g., final_review" /></div>
                <div className="form-group"><label className="form-label">Pipeline Phase</label>
                  <select className="form-select" value={newStage.stage_group} onChange={e => setNewStage({ ...newStage, stage_group: e.target.value })}>
                    <option value="onboarding">Onboarding</option><option value="work_in_progress">Work in Progress</option><option value="invoicing">Invoicing</option><option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Workflow</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
