'use client';
import { useEffect, useState } from 'react';
import { Activity, ArrowRight, FileText, DollarSign, MessageSquare, Users, FolderKanban } from 'lucide-react';

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

function getDateGroup(d: string) {
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return 'This Week';
  return 'Earlier';
}

function getDotClass(action: string) {
  if (action.includes('stage') || action.includes('filed') || action.includes('completed') || action.includes('assigned') || action.includes('created_engagement')) return 'stage';
  if (action.includes('document') || action.includes('engagement_letter')) return 'document';
  if (action.includes('invoice') || action.includes('payment') || action.includes('proposal')) return 'invoice';
  if (action.includes('message') || action.includes('reminder')) return 'message';
  return 'client';
}

function getIcon(action: string) {
  if (action.includes('document') || action.includes('engagement_letter')) return <FileText size={14} />;
  if (action.includes('invoice') || action.includes('payment') || action.includes('proposal')) return <DollarSign size={14} />;
  if (action.includes('message') || action.includes('reminder')) return <MessageSquare size={14} />;
  if (action.includes('onboarded') || action.includes('assigned')) return <Users size={14} />;
  return <FolderKanban size={14} />;
}

export default function ActivityPage() {
  const [data, setData] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => { fetch('/api/activity').then(r => r.json()).then(setData); }, []);
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading activity...</div>;

  const activities = (data.activities || []).filter((a: any) => {
    if (typeFilter === 'all') return true;
    return a.entity_type === typeFilter;
  });

  // Group by date
  let lastGroup = '';

  return (
    <>
      <div className="page-header">
        <div><h1>Activity Feed</h1><p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Recent actions across the firm</p></div>
        <select className="form-select" style={{ width: 180, height: 36 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Activities</option>
          <option value="engagement">Stage Changes</option>
          <option value="document">Documents</option>
          <option value="invoice">Invoices</option>
          <option value="message">Messages</option>
          <option value="client">Clients</option>
          <option value="reminder">Reminders</option>
          <option value="proposal">Proposals</option>
        </select>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="activity-timeline">
            {activities.map((a: any, i: number) => {
              const group = getDateGroup(a.created_at);
              const showGroup = group !== lastGroup;
              lastGroup = group;
              return (
                <div key={i}>
                  {showGroup && <div className="date-group">{group}</div>}
                  <div className="activity-item">
                    <div className={`activity-dot ${getDotClass(a.action)}`}>
                      {getIcon(a.action)}
                    </div>
                    <div className="activity-content">
                      <p>
                        <strong>{a.actor_name}</strong>{' '}
                        {a.details}
                      </p>
                      {a.client_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                          <span className="badge badge-gray" style={{ fontSize: '10px' }}>{a.client_name}</span>
                          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{a.entity_type}</span>
                        </div>
                      )}
                      <div className="activity-time">{timeAgo(a.created_at)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
