'use client';
import { useEffect, useState } from 'react';
import { FileStack, Plus, Layers, FileText, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', category: '', default_price: '', description: '' });

  function load() {
    fetch('/api/templates').then(r => r.json()).then(d => {
      setTemplates(d.templates || []);
      setCategories(d.categories || []);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    const defaultStages = [
      { stage_name: 'Lead', stage_code: 'lead', stage_group: 'onboarding' },
      { stage_name: 'Onboarding', stage_code: 'onboarding', stage_group: 'onboarding' },
      { stage_name: 'Data Collection', stage_code: 'data_collection', stage_group: 'work_in_progress' },
      { stage_name: 'Prepared By', stage_code: 'prepared_by', stage_group: 'work_in_progress' },
      { stage_name: 'First Check', stage_code: 'first_check', stage_group: 'work_in_progress' },
      { stage_name: 'Second Check', stage_code: 'second_check', stage_group: 'work_in_progress' },
      { stage_name: 'Sent to Client', stage_code: 'sent_to_client', stage_group: 'work_in_progress' },
      { stage_name: 'Billing', stage_code: 'billing', stage_group: 'invoicing' },
      { stage_name: 'Completed', stage_code: 'completed', stage_group: 'completed' }
    ];

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...form, 
        default_price: form.default_price ? parseFloat(form.default_price) : null, 
        created_by: user.id,
        stages: defaultStages
      }),
    });
    setShowModal(false);
    setForm({ name: '', code: '', category: '', default_price: '', description: '' });
    load();
  }

  function formatCurrency(n: number) { return n ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n) : '—'; }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Compliance Templates</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Define your products — each template becomes a reusable compliance workflow</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Template
        </button>
      </div>

      {/* Template Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
        {templates.map((t: any) => (
          <div className="card" key={t.id} onClick={() => router.push(`/dashboard/templates/${t.id}`)} style={{ cursor: 'pointer', transition: 'all var(--transition-base)' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>{t.name}</h3>
                  <span className="badge badge-gray" style={{ marginRight: 'var(--space-2)' }}>{t.code}</span>
                  {t.category && <span className="badge badge-cyan">{t.category}</span>}
                </div>
                <span className={`badge ${t.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {t.description && <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>{t.description}</p>}
              <div style={{ display: 'flex', gap: 'var(--space-6)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <Layers size={14} style={{ color: 'var(--color-gray-400)' }} />
                  <span className="text-sm">{t.stage_count} stages</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <FileText size={14} style={{ color: 'var(--color-gray-400)' }} />
                  <span className="text-sm">{t.doc_count} documents</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <DollarSign size={14} style={{ color: 'var(--color-gray-400)' }} />
                  <span className="text-sm">{formatCurrency(t.default_price)}</span>
                </div>
              </div>
              <div className="text-xs text-muted" style={{ marginTop: 'var(--space-3)' }}>
                Used in {t.usage_count} project{t.usage_count !== 1 ? 's' : ''} · v{t.version}
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div className="card">
          <div className="empty-state">
            <FileStack size={48} />
            <h3>No templates yet</h3>
            <p>Create your first compliance template to start managing projects.</p>
          </div>
        </div>
      )}

      {/* New Template Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Compliance Template</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createTemplate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Template Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., T1 Personal Tax Return" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Internal Code *</label>
                    <input className="form-input" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g., T1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Default Price (CAD)</label>
                  <input className="form-input" type="number" step="0.01" value={form.default_price} onChange={e => setForm({...form, default_price: e.target.value})} placeholder="500.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description of this compliance type"></textarea>
                </div>
                <p className="text-xs text-muted" style={{ marginTop: 'var(--space-2)' }}>
                  A default 12-stage workflow will be created automatically. You can customize stages after creation.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
