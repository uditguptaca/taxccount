'use client';
import { useState, useEffect } from 'react';
import ChecklistBuilder, { ChecklistItem } from './ChecklistBuilder';
import { Settings, FileText, Search, Plus, MoreVertical, Trash2, Edit2, Copy, Star } from 'lucide-react';

interface Checklist {
  id: string;
  name: string;
  checklist_code?: string;
  description?: string;
  category?: string;
  country?: string;
  status?: string;
  is_default?: number;
  items?: ChecklistItem[];
  updated_at?: string;
}

interface ChecklistsTabProps {
  checklists: Checklist[];
  loadChecklists: () => void;
}

export default function ChecklistsTab({ checklists, loadChecklists }: ChecklistsTabProps) {
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this checklist? If it is used in existing templates, it will be deactivated instead of deleted.')) return;
    try {
      const res = await fetch(`/api/settings/checklists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        loadChecklists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/checklists/${id}`, { method: 'POST' });
      if (res.ok) {
        loadChecklists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNew = () => {
    setEditingChecklist({
      id: '',
      name: '',
      checklist_code: '',
      description: '',
      category: 'General',
      country: 'Global',
      status: 'Active',
      is_default: 0,
      items: []
    });
    setShowModal(true);
  };

  const openEdit = async (c: Checklist) => {
    setEditingChecklist(c);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChecklist) return;

    try {
      const isNew = !editingChecklist.id;
      const url = isNew ? '/api/settings/checklists' : `/api/settings/checklists/${editingChecklist.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingChecklist)
      });
      if (res.ok) {
        setShowModal(false);
        loadChecklists();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = checklists.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.category && c.category.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Checklist Library</h3>
          <p className="text-muted text-sm" style={{ margin: 0, marginTop: 4 }}>Manage reusable document checklists that can be quickly added to your compliance templates.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} style={{ marginRight: 4 }} /> New Checklist
        </button>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-3)' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search checklists..." 
              style={{ border: 'none', background: 'transparent', padding: 'var(--space-2)', flex: 1, outline: 'none' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">No checklists found matching your search.</div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filtered.map(c => (
              <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
                <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.name}
                      {c.is_default === 1 && <span title="Default Checklist"><Star size={14} style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} /></span>}
                    </div>
                    {c.category && <div className="text-xs text-muted" style={{ marginTop: 4 }}>{c.category} &bull; {c.country}</div>}
                  </div>
                  <div className="dropdown" style={{ position: 'relative' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: 'var(--space-1)' }} onClick={(e) => {
                      const dd = e.currentTarget.nextElementSibling as HTMLElement;
                      dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
                    }}>
                      <MoreVertical size={16} />
                    </button>
                    <div className="dropdown-menu" style={{ display: 'none', position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, minWidth: 150 }}>
                      <button className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-2) var(--space-3)', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => openEdit(c)}><Edit2 size={14} /> Edit</button>
                      <button className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-2) var(--space-3)', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleDuplicate(c.id)}><Copy size={14} /> Duplicate</button>
                      <button className="dropdown-item text-danger" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-2) var(--space-3)', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }} onClick={() => handleDelete(c.id)}><Trash2 size={14} /> Delete</button>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 'var(--space-3) var(--space-4)', flex: 1 }}>
                  {c.description && <div className="text-sm text-muted mb-2">{c.description}</div>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">{c.items?.length || 0} items</span>
                    <span className={`badge ${c.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span>
                  </div>
                </div>
                <div style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-gray-50)', fontSize: 11, color: 'var(--text-muted)' }}>
                  Last updated: {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && editingChecklist && (
        <div className="modal-overlay" style={{ zIndex: 1000, overflowY: 'auto', padding: 'var(--space-8) 0' }}>
          <div className="modal" style={{ maxWidth: 900, width: '90%', margin: '0 auto' }}>
            <div className="modal-header">
              <h2>{editingChecklist.id ? 'Edit Checklist' : 'New Checklist'}</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Checklist Name *</label>
                    <input type="text" className="form-input" required value={editingChecklist.name} onChange={e => setEditingChecklist({...editingChecklist, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Checklist Code</label>
                    <input type="text" className="form-input" value={editingChecklist.checklist_code || ''} onChange={e => setEditingChecklist({...editingChecklist, checklist_code: e.target.value})} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={editingChecklist.description || ''} onChange={e => setEditingChecklist({...editingChecklist, description: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={editingChecklist.category || 'General'} onChange={e => setEditingChecklist({...editingChecklist, category: e.target.value})}>
                      <option value="General">General</option>
                      <option value="Personal Tax">Personal Tax</option>
                      <option value="Corporate Tax">Corporate Tax</option>
                      <option value="Audit">Audit</option>
                      <option value="Bookkeeping">Bookkeeping</option>
                      <option value="Payroll">Payroll</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" className="form-input" value={editingChecklist.country || 'Global'} onChange={e => setEditingChecklist({...editingChecklist, country: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={editingChecklist.status || 'Active'} onChange={e => setEditingChecklist({...editingChecklist, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={editingChecklist.is_default === 1} onChange={e => setEditingChecklist({...editingChecklist, is_default: e.target.checked ? 1 : 0})} />
                    Set as Default Checklist (Only one can be default)
                  </label>
                </div>

                <hr style={{ margin: 'var(--space-6) 0', border: 'none', borderTop: '1px solid var(--color-gray-200)' }} />
                
                <ChecklistBuilder items={editingChecklist.items || []} onChange={items => setEditingChecklist({...editingChecklist, items})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Checklist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
