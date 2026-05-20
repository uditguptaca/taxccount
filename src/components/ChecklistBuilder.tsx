'use client';
import { useState } from 'react';
import { GripVertical, Trash2, Edit2, Plus, Copy } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export interface ChecklistItem {
  id?: string; // DB ID if saved
  temp_id: string; // for React key and DnD
  document_name: string;
  document_code?: string;
  description?: string;
  document_category: string;
  is_mandatory: number;
  upload_required: number;
  upload_by: string; // 'client' | 'staff' | 'either'
  suggested_stage?: string;
  client_visible: number;
  staff_only: number;
  accepted_file_types?: string;
  notes?: string;
  sort_order?: number;
}

interface ChecklistBuilderProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export default function ChecklistBuilder({ items, onChange }: ChecklistBuilderProps) {
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    // Update sort_order
    newItems.forEach((item, i) => { item.sort_order = i + 1; });
    
    onChange(newItems);
  };

  const handleDelete = (temp_id: string) => {
    if (confirm('Delete this document from the checklist?')) {
      onChange(items.filter(i => i.temp_id !== temp_id));
    }
  };

  const handleDuplicate = (item: ChecklistItem) => {
    const newItem = { ...item, temp_id: uuidv4(), document_name: item.document_name + ' (Copy)' };
    delete newItem.id;
    onChange([...items, newItem]);
  };

  const openNewItem = () => {
    setEditingItem({
      temp_id: uuidv4(),
      document_name: '',
      document_category: 'client_supporting',
      is_mandatory: 1,
      upload_required: 1,
      upload_by: 'client',
      client_visible: 1,
      staff_only: 0,
      suggested_stage: 'Data Collection'
    });
  };

  const saveEditingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const exists = items.some(i => i.temp_id === editingItem.temp_id);
    if (exists) {
      onChange(items.map(i => i.temp_id === editingItem.temp_id ? editingItem : i));
    } else {
      onChange([...items, { ...editingItem, sort_order: items.length + 1 }]);
    }
    setEditingItem(null);
  };

  return (
    <div className="checklist-builder">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h4 style={{ margin: 0 }}>Checklist Documents ({items.length})</h4>
        <button type="button" className="btn btn-outline btn-sm" onClick={openNewItem}>
          <Plus size={16} style={{ marginRight: 4 }} /> Add Document
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
          <p className="text-muted text-sm">No documents added yet. Start adding documents to this checklist.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {items.map((item, index) => (
            <div 
              key={item.temp_id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-3)',
                background: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                gap: 'var(--space-3)',
                cursor: 'grab'
              }}
            >
              <div style={{ color: 'var(--text-muted)' }}><GripVertical size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                  {item.document_name}
                  {item.is_mandatory ? <span style={{ marginLeft: 8, color: 'var(--color-danger)', fontSize: 11, background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>Required</span> : null}
                  {item.staff_only ? <span style={{ marginLeft: 8, color: 'var(--color-warning)', fontSize: 11, background: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>Staff Only</span> : null}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                  Stage: {item.suggested_stage || 'Any'} &bull; Category: {item.document_category === 'firm_working_paper' ? 'Firm Working Paper' : 'Client Supporting'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button type="button" className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEditingItem(item)}><Edit2 size={16} /></button>
                <button type="button" className="btn btn-ghost btn-sm" title="Duplicate" onClick={() => handleDuplicate(item)}><Copy size={16} /></button>
                <button type="button" className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(item.temp_id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{items.some(i => i.temp_id === editingItem.temp_id) ? 'Edit Document' : 'Add Document'}</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingItem(null)}>✕</button>
            </div>
            <form onSubmit={saveEditingItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Document Name *</label>
                  <input type="text" className="form-input" required value={editingItem.document_name} onChange={e => setEditingItem({...editingItem, document_name: e.target.value})} placeholder="e.g. Notice of Assessment" />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={editingItem.document_category} onChange={e => setEditingItem({...editingItem, document_category: e.target.value})}>
                      <option value="client_supporting">Client Supporting Document</option>
                      <option value="firm_working_paper">Firm Working Paper</option>
                      <option value="government_correspondence">Government Correspondence</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Workflow Stage</label>
                    <select className="form-input" value={editingItem.suggested_stage || ''} onChange={e => setEditingItem({...editingItem, suggested_stage: e.target.value})}>
                      <option value="">-- Any Stage --</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Data Collection">Data Collection</option>
                      <option value="Preparation">Preparation</option>
                      <option value="Review">Review</option>
                      <option value="Sent to Client">Sent to Client</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="checkbox" checked={editingItem.is_mandatory === 1} onChange={e => setEditingItem({...editingItem, is_mandatory: e.target.checked ? 1 : 0})} />
                      Required for completion
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="checkbox" checked={editingItem.staff_only === 1} onChange={e => setEditingItem({...editingItem, staff_only: e.target.checked ? 1 : 0, client_visible: e.target.checked ? 0 : 1})} />
                      Staff Only (Hidden from client)
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Accepted File Types (Optional)</label>
                  <input type="text" className="form-input" value={editingItem.accepted_file_types || ''} onChange={e => setEditingItem({...editingItem, accepted_file_types: e.target.value})} placeholder="e.g. .pdf, .jpg, .png" />
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>Leave blank to accept any file type</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes / Instructions</label>
                  <textarea className="form-input" rows={2} value={editingItem.notes || ''} onChange={e => setEditingItem({...editingItem, notes: e.target.value})} placeholder="Instructions for the client or staff..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
