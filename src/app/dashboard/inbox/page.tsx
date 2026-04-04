'use client';
import { useEffect, useState } from 'react';
import { Inbox, FileText, DollarSign, CheckSquare, MessageSquare, AlertTriangle, ClipboardCheck, Archive } from 'lucide-react';

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

const typeConfig: Record<string, { icon: any; iconClass: string }> = {
  document_uploaded: { icon: FileText, iconClass: 'document' },
  invoice_paid: { icon: DollarSign, iconClass: 'invoice' },
  task_completed: { icon: CheckSquare, iconClass: 'task' },
  message_received: { icon: MessageSquare, iconClass: 'message' },
  deadline_approaching: { icon: AlertTriangle, iconClass: 'deadline' },
  organizer_completed: { icon: ClipboardCheck, iconClass: 'organizer' },
};

export default function InboxPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('todo');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadData = () => fetch('/api/inbox').then(r => r.json()).then(setData).catch(console.error);
  useEffect(() => { loadData(); }, []);

  async function handleAction(id: string, action: 'read' | 'unread' | 'archive') {
    await fetch(`/api/inbox/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    loadData();
  }

  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading inbox...</div>;

  const items = (data.items || []).filter((i: any) => {
    const tabMatch = tab === 'todo' ? !i.is_archived : i.is_archived;
    const typeMatch = typeFilter === 'all' || i.item_type === typeFilter;
    return tabMatch && typeMatch;
  });

  const todoCount = (data.items || []).filter((i: any) => !i.is_archived).length;
  const archivedCount = (data.items || []).filter((i: any) => i.is_archived).length;

  return (
    <>
      <div className="page-header">
        <div><h1>Inbox</h1><p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Notifications and action items — {data.unreadCount || 0} unread</p></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button className={`tab ${tab === 'todo' ? 'active' : ''}`} onClick={() => setTab('todo')}>To-do ({todoCount})</button>
          <button className={`tab ${tab === 'archived' ? 'active' : ''}`} onClick={() => setTab('archived')}>Archived ({archivedCount})</button>
        </div>
        <select className="form-select" style={{ width: 200, height: 34 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="document_uploaded">Documents</option>
          <option value="invoice_paid">Payments</option>
          <option value="task_completed">Tasks</option>
          <option value="message_received">Messages</option>
          <option value="deadline_approaching">Deadlines</option>
          <option value="organizer_completed">Organizers</option>
        </select>
      </div>

      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state"><Inbox size={48} /><h3>{tab === 'todo' ? 'All caught up!' : 'No archived items'}</h3><p>No items to show</p></div>
        ) : (
          items.map((item: any) => {
            const config = typeConfig[item.item_type] || { icon: Inbox, iconClass: 'document' };
            const Icon = config.icon;
            return (
              <div key={item.id} className={`inbox-item ${!item.is_read ? 'unread' : ''}`}>
                <div className={`inbox-item-icon ${config.iconClass}`}><Icon size={20} /></div>
                <div className="inbox-item-content">
                  <div className="inbox-item-title">{item.title}</div>
                  <div className="inbox-item-subtitle">{item.message}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className="inbox-item-time">{timeAgo(item.created_at)}</span>
                  {!item.is_read ? (
                    <button className="btn btn-ghost btn-sm" title="Mark as Read" onClick={() => handleAction(item.id, 'read')}><CheckSquare size={14} /></button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" title="Mark as Unread" onClick={() => handleAction(item.id, 'unread')}><Inbox size={14} /></button>
                  )}
                  {!item.is_archived && (
                    <button className="btn btn-ghost btn-sm text-danger" title="Archive" onClick={() => handleAction(item.id, 'archive')}><Archive size={14} /></button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
