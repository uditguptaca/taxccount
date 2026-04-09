'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Plus, CheckCircle2, Clock, AlertCircle, Calendar, X,
  FileText, Heart, Building2, Users, User, Briefcase, ChevronDown,
  ChevronRight, Edit3, Trash2, UserPlus, FolderKanban, RefreshCw,
  Phone, Mail, MapPin, Stethoscope, GraduationCap, Home, Car,
  CircleDollarSign, Scale, Globe, Landmark, Star, Network, ClipboardCheck
} from 'lucide-react';
import FulfillmentModal from '@/components/portal/FulfillmentModal';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function daysUntil(d: string) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

const CATEGORIES = [
  { value: 'tax_filing', label: 'Tax Filing', icon: CircleDollarSign, color: '#dc2626' },
  { value: 'documents_ids', label: 'Documents & IDs', icon: FileText, color: '#2563eb' },
  { value: 'insurance', label: 'Insurance', icon: Shield, color: '#7c3aed' },
  { value: 'property', label: 'Property', icon: Home, color: '#059669' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: '#d97706' },
  { value: 'medical', label: 'Medical', icon: Stethoscope, color: '#0891b2' },
  { value: 'financial', label: 'Financial', icon: Landmark, color: '#6366f1' },
  { value: 'custom', label: 'Custom', icon: Star, color: '#64748b' },
];

const SPECIALTIES: Record<string, string> = {
  tax_advisor: 'Tax Advisor',
  legal_expert: 'Legal Expert',
  immigration_lawyer: 'Immigration Lawyer',
  financial_planner: 'Financial Planner',
  insurance_agent: 'Insurance Agent',
  general: 'General',
  other: 'Other',
};

const RELATIONSHIPS: Record<string, string> = {
  spouse: 'Spouse',
  child: 'Child',
  parent: 'Parent',
  grandparent: 'Grandparent',
  sibling: 'Sibling',
  other: 'Other',
};

const ENTITY_TYPES: Record<string, string> = {
  business: 'Business',
  partnership: 'Partnership',
  trust: 'Trust',
  sole_proprietorship: 'Sole Proprietorship',
  other: 'Other',
};

function UrgencyBadge({ urgency, dueDate }: { urgency: string; dueDate?: string }) {
  const days = dueDate ? daysUntil(dueDate) : null;
  const colorMap: Record<string, { bg: string; text: string; label: string }> = {
    red: { bg: '#fef2f2', text: '#dc2626', label: days !== null && days < 0 ? `${Math.abs(days)}d overdue` : days !== null ? `${days}d left` : 'Urgent' },
    yellow: { bg: '#fffbeb', text: '#d97706', label: days !== null ? `${days}d left` : 'Upcoming' },
    green: { bg: '#f0fdf4', text: '#059669', label: 'Completed' },
    gray: { bg: '#f9fafb', text: '#6b7280', label: 'No deadline' },
  };
  const c = colorMap[urgency] || colorMap.gray;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.text }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: c.text }} />{c.label}</span>;
}

function CategoryIcon({ category, size = 16 }: { category: string; size?: number }) {
  const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = cat.icon;
  return <div style={{ width: size + 12, height: size + 12, borderRadius: '6px', background: cat.color + '15', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size} /></div>;
}

// ═══════════════════════════════════════════
// PERSONAL VAULT TAB
// ═══════════════════════════════════════════
export function VaultTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [includeFamily, setIncludeFamily] = useState(false);
  const [includeEntities, setIncludeEntities] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({ title: '', category: 'custom', description: '', due_date: '', recurrence_label: '', notes: '' });
  const [editForm, setEditForm] = useState<any>(null);
  const [fulfillItem, setFulfillItem] = useState<any>(null);
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, string>>({});
  const router = useRouter();

  // Check fulfillment status for linked items
  const checkFulfillmentStatus = async (items: any[]) => {
    const statuses: Record<string, string> = {};
    for (const item of items) {
      try {
        const res = await fetch(`/api/portal/fulfillment?compliance_item_id=${item.id}`);
        const d = await res.json();
        if (d.existingSubmission) {
          statuses[item.id] = d.existingSubmission.status;
        } else if (d.selectedCompliance) {
          statuses[item.id] = 'available';
        }
      } catch { /* ignore */ }
    }
    setSubmissionStatus(statuses);
  };

  const fetchData = () => {
    fetch('/api/portal/vault').then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
      // Check fulfillment status for personal items
      if (d.personalItems) checkFulfillmentStatus(d.personalItems);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!form.title) return;
    await fetch('/api/portal/vault', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowAdd(false);
    setForm({ title: '', category: 'custom', description: '', due_date: '', recurrence_label: '', notes: '' });
    fetchData();
  };

  const handleEdit = async () => {
    if (!editForm || !editForm.title) return;
    await fetch('/api/portal/vault', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      id: editForm.id, title: editForm.title, category: editForm.category, description: editForm.description,
      due_date: editForm.due_date, recurrence_label: editForm.recurrence_label, notes: editForm.notes
    }) });
    setEditForm(null);
    fetchData();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await fetch('/api/portal/vault', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: newStatus }) });
    fetchData();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this compliance item?')) return;
    await fetch(`/api/portal/vault?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading your compliance vault...</p></div>;

  const baseItems = [...(data?.personalItems || []).map((i: any) => ({...i, vault_source: 'Personal'}))];
  
  if (includeFamily) {
    (data?.familyMembers || []).forEach((fm: any) => {
      (fm.compliance || []).forEach((c: any) => baseItems.push({...c, vault_source: `Family: ${fm.name}`}));
    });
  }
  if (includeEntities) {
    (data?.entities || []).forEach((e: any) => {
      (e.compliance || []).forEach((c: any) => baseItems.push({...c, vault_source: `Entity: ${e.name}`}));
    });
  }
  
  // Sort primarily by date and status
  baseItems.sort((a,b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    return new Date(a.due_date || '2099-01-01').getTime() - new Date(b.due_date || '2099-01-01').getTime();
  });

  const summary = {
    total: baseItems.length,
    pending: baseItems.filter(i => i.status !== 'completed').length,
    overdue: baseItems.filter(i => i.urgency === 'red' && i.status !== 'completed').length,
    completed: baseItems.filter(i => i.status === 'completed').length,
    upcoming_30: baseItems.filter(i => {
      if (!i.due_date || i.status === 'completed') return false;
      const d = new Date(i.due_date);
      const now = new Date();
      return d > now && d < new Date(now.getTime() + 30 * 86400000);
    }).length,
  };

  const filtered = filter === 'all' ? baseItems : filter === 'active' ? baseItems.filter((i: any) => i.status !== 'completed') : filter === 'completed' ? baseItems.filter((i: any) => i.status === 'completed') : filter === 'overdue' ? baseItems.filter((i: any) => i.urgency === 'red' && i.status !== 'completed') : baseItems.filter((i: any) => i.category === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={22} style={{ color: 'var(--color-primary)' }} /> Personal Compliance Vault</h2>
          <p className="text-sm text-muted" style={{ margin: '4px 0 0' }}>Track all your personal compliance tasks, deadlines, and renewals in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Compliance</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div className="kpi-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer', borderBottom: filter === 'all' ? '3px solid var(--color-primary)' : undefined }}><div className="kpi-icon blue"><FolderKanban size={20} /></div><div className="kpi-label">Total Items</div><div className="kpi-value">{summary.total || 0}</div></div>
        <div className="kpi-card" onClick={() => setFilter('active')} style={{ cursor: 'pointer', borderBottom: filter === 'active' ? '3px solid #d97706' : undefined }}><div className="kpi-icon yellow"><Clock size={20} /></div><div className="kpi-label">Active</div><div className="kpi-value">{summary.pending || 0}</div></div>
        <div className="kpi-card" onClick={() => setFilter('overdue')} style={{ cursor: 'pointer', borderBottom: filter === 'overdue' ? '3px solid #dc2626' : undefined }}><div className="kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertCircle size={20} /></div><div className="kpi-label">Overdue</div><div className="kpi-value" style={{ color: summary.overdue > 0 ? '#dc2626' : undefined }}>{summary.overdue || 0}</div></div>
        <div className="kpi-card" onClick={() => setFilter('completed')} style={{ cursor: 'pointer', borderBottom: filter === 'completed' ? '3px solid #059669' : undefined }}><div className="kpi-icon green"><CheckCircle2 size={20} /></div><div className="kpi-label">Completed</div><div className="kpi-value">{summary.completed || 0}</div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><Calendar size={20} /></div><div className="kpi-label">Due in 30d</div><div className="kpi-value">{summary.upcoming_30 || 0}</div></div>
      </div>

      {/* Filters and Toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilter(filter === c.value ? 'all' : c.value)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: filter === c.value ? `2px solid ${c.color}` : '1px solid var(--color-gray-200)', background: filter === c.value ? c.color + '10' : 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, color: filter === c.value ? c.color : 'var(--color-gray-600)' }}>
              <c.icon size={14} />{c.label}
            </button>
          ))}
        </div>
        
        {/* Connection toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--color-gray-200)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Include:</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeFamily} onChange={e => setIncludeFamily(e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} />
            Family Items
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeEntities} onChange={e => setIncludeEntities(e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} />
            Entity Items
          </label>
        </div>
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '12px', color: 'var(--color-gray-400)' }}>
          <Shield size={48} style={{ marginBottom: 12 }} /><h3>No compliance items found</h3>
          <p className="text-sm">Add your first compliance item to start tracking deadlines.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'white', border: `1px solid ${item.urgency === 'red' && item.status !== 'completed' ? '#fecaca' : 'var(--color-gray-200)'}`, borderLeft: `4px solid ${item.urgency === 'red' ? '#dc2626' : item.urgency === 'yellow' ? '#d97706' : item.urgency === 'green' ? '#059669' : '#d1d5db'}`, borderRadius: '10px', opacity: item.status === 'completed' ? 0.7 : 1, transition: 'all 0.15s' }}>
              <button onClick={() => toggleStatus(item.id, item.status)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: item.status === 'completed' ? '#059669' : 'var(--color-gray-400)', flexShrink: 0 }}>
                {item.status === 'completed' ? <CheckCircle2 size={22} /> : <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid currentColor' }} />}
              </button>
              <CategoryIcon category={item.category} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div onClick={() => router.push(`/portal/compliance/${item.id}`)} style={{ fontWeight: 600, textDecoration: item.status === 'completed' ? 'line-through' : 'none', marginBottom: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} className="hover:text-indigo-600 transition-colors">
                  {item.title} <ChevronRight size={14} className="text-gray-400" />
                </div>
                <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {item.description && <span>{item.description}</span>}
                  {item.vault_source !== 'Personal' && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: item.vault_source.startsWith('Family') ? '#db2777' : '#059669', fontWeight: 600 }}><Network size={10} />{item.vault_source}</span>}
                  {item.recurrence_label && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><RefreshCw size={10} />{item.recurrence_label}</span>}
                  {item.consultant_name && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><User size={10} />{item.consultant_name}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {item.due_date && <span className="text-xs text-muted">{formatDate(item.due_date)}</span>}
                <UrgencyBadge urgency={item.status === 'completed' ? 'green' : item.urgency} dueDate={item.status === 'completed' ? undefined : item.due_date} />
                {/* Fulfill Now / Submitted Badge */}
                {item.vault_source === 'Personal' && submissionStatus[item.id] === 'available' && item.status !== 'completed' && (
                  <button onClick={(e) => { e.stopPropagation(); setFulfillItem(item); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px',
                      borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white',
                      fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                  >
                    <ClipboardCheck size={12} /> Fulfill Now
                  </button>
                )}
                {item.vault_source === 'Personal' && submissionStatus[item.id] === 'pending_review' && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px',
                    borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0',
                    color: '#059669', fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap'
                  }}>
                    <CheckCircle2 size={11} /> Submitted
                  </span>
                )}
                {item.vault_source === 'Personal' && (submissionStatus[item.id] === 'accepted') && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px',
                    borderRadius: '8px', background: '#d1fae5', border: '1px solid #6ee7b7',
                    color: '#047857', fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap'
                  }}>
                    <CheckCircle2 size={11} /> Accepted
                  </span>
                )}
                {item.vault_source === 'Personal' && submissionStatus[item.id] === 'rejected' && (
                  <button onClick={(e) => { e.stopPropagation(); setFulfillItem(item); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px',
                      borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: 'white',
                      fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                  >
                    <AlertCircle size={12} /> Resubmit
                  </button>
                )}
                {item.vault_source === 'Personal' && !item.sm_compliance_id && (
                  <button onClick={() => setEditForm(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: '4px' }} title="Edit Custom Item"><Edit3 size={14} /></button>
                )}
                <button onClick={() => deleteItem(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: '4px' }} title="Delete Item"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {/* Fulfillment Modal */}
      {fulfillItem && (
        <FulfillmentModal
          complianceItemId={fulfillItem.id}
          itemTitle={fulfillItem.title}
          onClose={() => setFulfillItem(null)}
          onSubmitted={() => {
            setFulfillItem(null);
            fetchData();
          }}
        />
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header"><h3>Add Compliance Item</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Title <span style={{ color: 'red' }}>*</span></label>
                <input type="text" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Passport Renewal" /></div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Additional details..." /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Recurrence (optional)</label>
                <input type="text" className="form-input" value={form.recurrence_label} onChange={e => setForm({ ...form, recurrence_label: e.target.value })} placeholder="e.g., Pay every June, Renew every January" /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editForm && (
        <div className="modal-overlay" onClick={() => setEditForm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header"><h3>Edit Verification Item</h3><button className="btn btn-ghost btn-sm" onClick={() => setEditForm(null)}><X size={18} /></button></div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="form-label">Title</label><input type="text" className="form-input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
              <div><label className="form-label">Description</label><input type="text" className="form-input" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Optional" /></div>
              <div><label className="form-label">Due Date</label><input type="date" className="form-input" value={editForm.due_date || ''} onChange={e => setEditForm({...editForm, due_date: e.target.value})} /></div>
              <div>
                <label className="form-label">Category</label>
                <select className="form-input" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  <option value="custom">Other / Custom</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditForm(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// FAMILY TAB
// ═══════════════════════════════════════════
export function FamilyTab() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddCompliance, setShowAddCompliance] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<any>({ name: '', relationship: 'spouse', date_of_birth: '', email: '', phone: '', notes: '' });
  const [compForm, setCompForm] = useState<any>({ title: '', category: 'custom', description: '', due_date: '', recurrence_label: '', notes: '' });

  const fetchData = () => { fetch('/api/portal/vault/family').then(r => r.json()).then(d => { setMembers(d.members || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const addMember = async () => {
    if (!memberForm.name) return;
    await fetch('/api/portal/vault/family', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(memberForm) });
    setShowAddMember(false);
    setMemberForm({ name: '', relationship: 'spouse', date_of_birth: '', email: '', phone: '', notes: '' });
    fetchData();
  };

  const addCompliance = async (familyMemberId: string) => {
    if (!compForm.title) return;
    await fetch('/api/portal/vault/family', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...compForm, family_member_id: familyMemberId, action: 'add_compliance' }) });
    setShowAddCompliance(null);
    setCompForm({ title: '', category: 'custom', description: '', due_date: '', recurrence_label: '', notes: '' });
    fetchData();
  };

  const toggleCompliance = async (complianceId: string, currentStatus: string, dueDate: string) => {
    await fetch('/api/portal/vault/family', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ compliance_id: complianceId, status: currentStatus === 'completed' ? 'pending' : 'completed', due_date: dueDate }) });
    fetchData();
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Delete this family member and all their compliance items?')) return;
    await fetch(`/api/portal/vault/family?id=${id}&type=member`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading family...</p></div>;

  const relIcon: Record<string, any> = { spouse: Heart, child: Users, parent: User, grandparent: User, sibling: Users, other: User };
  const relColors: Record<string, string> = { spouse: '#ec4899', child: '#3b82f6', parent: '#059669', grandparent: '#8b5cf6', sibling: '#f59e0b', other: '#6b7280' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={22} style={{ color: '#ec4899' }} /> Family Compliance</h2>
          <p className="text-sm text-muted" style={{ margin: '4px 0 0' }}>Manage compliance tasks for your family members.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddMember(true)}><UserPlus size={16} /> Add Family Member</button>
      </div>

      {members.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '12px', color: 'var(--color-gray-400)' }}>
          <Users size={48} style={{ marginBottom: 12 }} /><h3>No family members added</h3>
          <p className="text-sm">Add your spouse, children, parents, or grandparents to track their compliance.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {members.map((m: any) => {
            const Icon = relIcon[m.relationship] || User;
            const color = relColors[m.relationship] || '#6b7280';
            const isOpen = expanded === m.id;
            const pendingCount = (m.compliance || []).filter((c: any) => c.status !== 'completed').length;
            return (
              <div key={m.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
                <div onClick={() => setExpanded(isOpen ? null : m.id)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', cursor: 'pointer', background: isOpen ? 'var(--color-gray-50)' : 'white', transition: 'background 0.2s' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={22} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{m.name}</div>
                    <div className="text-xs text-muted" style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <span style={{ textTransform: 'capitalize', color }}>{RELATIONSHIPS[m.relationship]}</span>
                      {m.date_of_birth && <span>Born: {formatDate(m.date_of_birth)}</span>}
                      {m.email && <span><Mail size={10} style={{ marginRight: 2 }} />{m.email}</span>}
                      {m.phone && <span><Phone size={10} style={{ marginRight: 2 }} />{m.phone}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {pendingCount > 0 && <span className="badge badge-yellow">{pendingCount} pending</span>}
                    <span className="badge badge-gray">{(m.compliance || []).length} tasks</span>
                    <button onClick={e => { e.stopPropagation(); deleteMember(m.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: '4px' }}><Trash2 size={14} /></button>
                    <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', color: 'var(--color-gray-400)' }} />
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-gray-100)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="text-sm" style={{ fontWeight: 600 }}>Compliance Tasks</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCompliance(m.id)}><Plus size={14} /> Add Task</button>
                    </div>
                    {(m.compliance || []).length === 0 ? (
                      <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '16px' }}>No compliance tasks for {m.name} yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(m.compliance || []).map((c: any) => (
                          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-gray-100)', borderLeft: `3px solid ${c.urgency === 'red' ? '#dc2626' : c.urgency === 'yellow' ? '#d97706' : '#059669'}`, opacity: c.status === 'completed' ? 0.6 : 1 }}>
                            <button onClick={() => toggleCompliance(c.id, c.status, c.due_date)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: c.status === 'completed' ? '#059669' : 'var(--color-gray-400)' }}>
                              {c.status === 'completed' ? <CheckCircle2 size={18} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor' }} />}
                            </button>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 500, fontSize: '0.875rem', textDecoration: c.status === 'completed' ? 'line-through' : 'none' }}>{c.title}</span>
                              {c.description && <div className="text-xs text-muted">{c.description}</div>}
                            </div>
                            {c.due_date && <span className="text-xs text-muted">{formatDate(c.due_date)}</span>}
                            <UrgencyBadge urgency={c.status === 'completed' ? 'green' : c.urgency} dueDate={c.status === 'completed' ? undefined : c.due_date} />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Inline add compliance form */}
                    {showAddCompliance === m.id && (
                      <div style={{ marginTop: '12px', padding: '16px', background: 'var(--color-gray-50)', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                        <div className="form-group"><label className="form-label">Task Title <span style={{ color: 'red' }}>*</span></label>
                          <input type="text" className="form-input" value={compForm.title} onChange={e => setCompForm({ ...compForm, title: e.target.value })} placeholder="e.g., Passport Renewal" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                          <div className="form-group"><label className="form-label">Category</label>
                            <select className="form-input" value={compForm.category} onChange={e => setCompForm({ ...compForm, category: e.target.value })}>
                              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select></div>
                          <div className="form-group"><label className="form-label">Due Date</label>
                            <input type="date" className="form-input" value={compForm.due_date} onChange={e => setCompForm({ ...compForm, due_date: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => addCompliance(m.id)} disabled={!compForm.title}>Add</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCompliance(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3>Add Family Member</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowAddMember(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Name <span style={{ color: 'red' }}>*</span></label>
                <input type="text" className="form-input" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="Full name" /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Relationship <span style={{ color: 'red' }}>*</span></label>
                <select className="form-input" value={memberForm.relationship} onChange={e => setMemberForm({ ...memberForm, relationship: e.target.value })}>
                  {Object.entries(RELATIONSHIPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 12 }}>
                <div className="form-group"><label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" value={memberForm.date_of_birth} onChange={e => setMemberForm({ ...memberForm, date_of_birth: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} /></div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Email</label>
                <input type="email" className="form-input" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={memberForm.notes} onChange={e => setMemberForm({ ...memberForm, notes: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={addMember} disabled={!memberForm.name}>Add Member</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ENTITIES TAB
// ═══════════════════════════════════════════
export function EntitiesVaultTab() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCompliance, setShowAddCompliance] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ name: '', entity_type: 'business', registration_number: '', description: '' });
  const [compForm, setCompForm] = useState<any>({ title: '', category: 'custom', description: '', due_date: '', recurrence_label: '', notes: '' });

  const fetchData = () => { fetch('/api/portal/vault/entities').then(r => r.json()).then(d => { setEntities(d.entities || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const addEntity = async () => {
    if (!form.name) return;
    await fetch('/api/portal/vault/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowAdd(false);
    setForm({ name: '', entity_type: 'business', registration_number: '', description: '' });
    fetchData();
  };

  const addCompliance = async (entityId: string) => {
    if (!compForm.title) return;
    await fetch('/api/portal/vault/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...compForm, entity_id: entityId, action: 'add_compliance' }) });
    setShowAddCompliance(null);
    setCompForm({ title: '', category: 'custom', description: '', due_date: '', recurrence_label: '', notes: '' });
    fetchData();
  };

  const toggleCompliance = async (complianceId: string, currentStatus: string, dueDate: string) => {
    await fetch('/api/portal/vault/entities', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ compliance_id: complianceId, status: currentStatus === 'completed' ? 'pending' : 'completed', due_date: dueDate }) });
    fetchData();
  };

  const deleteEntity = async (id: string) => {
    if (!confirm('Delete this entity and all its compliance items?')) return;
    await fetch(`/api/portal/vault/entities?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading entities...</p></div>;

  const typeIcons: Record<string, any> = { business: Building2, partnership: Users, trust: Shield, sole_proprietorship: Briefcase, other: FolderKanban };
  const typeColors: Record<string, string> = { business: '#3b82f6', partnership: '#8b5cf6', trust: '#059669', sole_proprietorship: '#d97706', other: '#6b7280' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Building2 size={22} style={{ color: '#3b82f6' }} /> My Entities</h2>
          <p className="text-sm text-muted" style={{ margin: '4px 0 0' }}>Manage compliance for your businesses, partnerships, and trusts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Entity</button>
      </div>

      {entities.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '12px', color: 'var(--color-gray-400)' }}>
          <Building2 size={48} style={{ marginBottom: 12 }} /><h3>No entities added</h3>
          <p className="text-sm">Add your businesses, partnerships, or trusts to track their compliance.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entities.map((e: any) => {
            const Icon = typeIcons[e.entity_type] || Building2;
            const color = typeColors[e.entity_type] || '#6b7280';
            const isOpen = expanded === e.id;
            const pendingCount = (e.compliance || []).filter((c: any) => c.status !== 'completed').length;
            return (
              <div key={e.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
                <div onClick={() => setExpanded(isOpen ? null : e.id)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', cursor: 'pointer', background: isOpen ? 'var(--color-gray-50)' : 'white' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '10px', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={22} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{e.name}</div>
                    <div className="text-xs text-muted" style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <span style={{ color }}>{ENTITY_TYPES[e.entity_type]}</span>
                      {e.registration_number && <span>Reg#: {e.registration_number}</span>}
                      {e.description && <span>{e.description}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {pendingCount > 0 && <span className="badge badge-yellow">{pendingCount} pending</span>}
                    <span className={`badge ${e.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{e.status}</span>
                    <button onClick={ev => { ev.stopPropagation(); deleteEntity(e.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: '4px' }}><Trash2 size={14} /></button>
                    <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', color: 'var(--color-gray-400)' }} />
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-gray-100)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="text-sm" style={{ fontWeight: 600 }}>Compliance Tasks</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCompliance(e.id)}><Plus size={14} /> Add Task</button>
                    </div>
                    {(e.compliance || []).length === 0 ? (
                      <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '16px' }}>No compliance tasks for {e.name} yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(e.compliance || []).map((c: any) => (
                          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-gray-100)', borderLeft: `3px solid ${c.urgency === 'red' ? '#dc2626' : c.urgency === 'yellow' ? '#d97706' : '#059669'}`, opacity: c.status === 'completed' ? 0.6 : 1 }}>
                            <button onClick={() => toggleCompliance(c.id, c.status, c.due_date)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: c.status === 'completed' ? '#059669' : 'var(--color-gray-400)' }}>
                              {c.status === 'completed' ? <CheckCircle2 size={18} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor' }} />}
                            </button>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 500, fontSize: '0.875rem', textDecoration: c.status === 'completed' ? 'line-through' : 'none' }}>{c.title}</span>
                              {c.recurrence_label && <div className="text-xs text-muted"><RefreshCw size={10} style={{ display: 'inline', marginRight: 4 }} />{c.recurrence_label}</div>}
                            </div>
                            {c.due_date && <span className="text-xs text-muted">{formatDate(c.due_date)}</span>}
                            <UrgencyBadge urgency={c.status === 'completed' ? 'green' : c.urgency} dueDate={c.status === 'completed' ? undefined : c.due_date} />
                          </div>
                        ))}
                      </div>
                    )}
                    {showAddCompliance === e.id && (
                      <div style={{ marginTop: '12px', padding: '16px', background: 'var(--color-gray-50)', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                        <div className="form-group"><label className="form-label">Task Title <span style={{ color: 'red' }}>*</span></label>
                          <input type="text" className="form-input" value={compForm.title} onChange={ev => setCompForm({ ...compForm, title: ev.target.value })} placeholder="e.g., HST Return Filing" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                          <div className="form-group"><label className="form-label">Category</label>
                            <select className="form-input" value={compForm.category} onChange={ev => setCompForm({ ...compForm, category: ev.target.value })}>
                              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select></div>
                          <div className="form-group"><label className="form-label">Due Date</label>
                            <input type="date" className="form-input" value={compForm.due_date} onChange={ev => setCompForm({ ...compForm, due_date: ev.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => addCompliance(e.id)} disabled={!compForm.title}>Add</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCompliance(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Entity Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={ev => ev.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3>Add Entity</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Entity Name <span style={{ color: 'red' }}>*</span></label>
                <input type="text" className="form-input" value={form.name} onChange={ev => setForm({ ...form, name: ev.target.value })} placeholder="e.g., ABC Holdings Ltd." /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Type <span style={{ color: 'red' }}>*</span></label>
                <select className="form-input" value={form.entity_type} onChange={ev => setForm({ ...form, entity_type: ev.target.value })}>
                  {Object.entries(ENTITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Registration / Business Number</label>
                <input type="text" className="form-input" value={form.registration_number} onChange={ev => setForm({ ...form, registration_number: ev.target.value })} /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={ev => setForm({ ...form, description: ev.target.value })} /></div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={addEntity} disabled={!form.name}>Add Entity</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// CONSULTANTS TAB
// ═══════════════════════════════════════════
export function ConsultantsTab() {
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({ name: '', specialty: 'tax_advisor', email: '', phone: '', company: '', notes: '' });

  const fetchData = () => { fetch('/api/portal/vault/consultants').then(r => r.json()).then(d => { setConsultants(d.consultants || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const addConsultant = async () => {
    if (!form.name) return;
    await fetch('/api/portal/vault/consultants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowAdd(false);
    setForm({ name: '', specialty: 'tax_advisor', email: '', phone: '', company: '', notes: '' });
    fetchData();
  };

  const deleteConsultant = async (id: string) => {
    if (!confirm('Delete this consultant?')) return;
    await fetch(`/api/portal/vault/consultants?id=${id}&type=consultant`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading consultants...</p></div>;

  const specIcons: Record<string, any> = { tax_advisor: CircleDollarSign, legal_expert: Scale, immigration_lawyer: Globe, financial_planner: Landmark, insurance_agent: Shield, general: Briefcase, other: User };
  const specColors: Record<string, string> = { tax_advisor: '#dc2626', legal_expert: '#7c3aed', immigration_lawyer: '#0891b2', financial_planner: '#059669', insurance_agent: '#d97706', general: '#3b82f6', other: '#6b7280' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Briefcase size={22} style={{ color: '#7c3aed' }} /> My Consultants</h2>
          <p className="text-sm text-muted" style={{ margin: '4px 0 0' }}>Manage your professional advisors and their task assignments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Consultant</button>
      </div>

      {consultants.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '12px', color: 'var(--color-gray-400)' }}>
          <Briefcase size={48} style={{ marginBottom: 12 }} /><h3>No consultants added</h3>
          <p className="text-sm">Add your tax advisors, lawyers, and financial planners.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {consultants.map((c: any) => {
            const Icon = specIcons[c.specialty] || Briefcase;
            const color = specColors[c.specialty] || '#6b7280';
            return (
              <div key={c.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', background: 'white', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: (c.assignments || []).length > 0 ? '1px solid var(--color-gray-100)' : 'none' }}>
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: `linear-gradient(135deg, ${color}15, ${color}25)`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={24} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{c.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600, background: `${color}15`, color }}>{SPECIALTIES[c.specialty]}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteConsultant(c.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: '4px', alignSelf: 'flex-start' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>
                    {c.company && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={13} />{c.company}</div>}
                    {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={13} />{c.email}</div>}
                    {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={13} />{c.phone}</div>}
                    {c.notes && <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-gray-400)', fontStyle: 'italic' }}>{c.notes}</div>}
                  </div>
                </div>
                {(c.assignments || []).length > 0 && (
                  <div style={{ padding: '12px 20px', background: 'var(--color-gray-50)' }}>
                    <div className="text-xs" style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Tasks</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(c.assignments || []).map((a: any) => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                          <ChevronRight size={12} style={{ color: 'var(--color-gray-400)' }} />
                          <span>{a.task_title || 'Unknown task'}</span>
                          <span className="badge badge-gray" style={{ fontSize: 9 }}>{a.compliance_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={ev => ev.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3>Add Consultant</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Name <span style={{ color: 'red' }}>*</span></label>
                <input type="text" className="form-input" value={form.name} onChange={ev => setForm({ ...form, name: ev.target.value })} placeholder="e.g., John Smith, CPA" /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Specialty</label>
                <select className="form-input" value={form.specialty} onChange={ev => setForm({ ...form, specialty: ev.target.value })}>
                  {Object.entries(SPECIALTIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 12 }}>
                <div className="form-group"><label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={ev => setForm({ ...form, email: ev.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={form.phone} onChange={ev => setForm({ ...form, phone: ev.target.value })} /></div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Company / Firm</label>
                <input type="text" className="form-input" value={form.company} onChange={ev => setForm({ ...form, company: ev.target.value })} /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={ev => setForm({ ...form, notes: ev.target.value })} /></div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={addConsultant} disabled={!form.name}>Add Consultant</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
