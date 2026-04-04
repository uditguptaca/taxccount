'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, Send, Bold, Italic, Paperclip, Smile, CheckSquare } from 'lucide-react';

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<any>(null);
  const [chatTab, setChatTab] = useState('client');
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [newThreadForm, setNewThreadForm] = useState({ client_id: '', subject: '', message: '', thread_type: 'client_facing' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => { 
    fetch('/api/messages').then(r => r.json()).then(d => { 
      setThreads(d.threads || []); 
      if (d.threads?.length && !selectedThread) setSelectedThread(d.threads[0].id); 
    });
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedThread) fetch(`/api/messages/${selectedThread}`).then(r => r.json()).then(setThreadData).catch(console.error);
  }, [selectedThread]);

  async function handleSendMessage(e: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await fetch(`/api/messages/${selectedThread}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: user.id || 'system', content: newMessage, is_internal: isInternalNote ? 1 : 0 })
    });
    setNewMessage('');
    fetch(`/api/messages/${selectedThread}`).then(r => r.json()).then(setThreadData).catch(console.error);
  }

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newThreadForm, sender_id: user.id || 'system' })
    });
    const data = await res.json();
    if (data.success) {
      setShowNewModal(false);
      setNewThreadForm({ client_id: '', subject: '', message: '', thread_type: 'client_facing' });
      fetch('/api/messages').then(r => r.json()).then(d => {
        setThreads(d.threads || []);
        setSelectedThread(data.thread_id);
      });
    }
  }

  const filteredThreads = threads.filter(t => chatTab === 'client' ? t.thread_type === 'client_facing' : t.thread_type === 'internal');

  return (
    <>
      <div className="page-header">
        <div><h1>Messages</h1><p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Client and internal team communication</p></div>
        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}><MessageSquare size={16} /> New Conversation</button>
      </div>

      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button className={`tab ${chatTab === 'client' ? 'active' : ''}`} onClick={() => setChatTab('client')}>Client Chats</button>
        <button className={`tab ${chatTab === 'team' ? 'active' : ''}`} onClick={() => setChatTab('team')}>Team Chat</button>
      </div>

      <div className="two-panel">
        {/* Thread List */}
        <div className="two-panel-sidebar">
          <div className="two-panel-sidebar-list">
            {filteredThreads.map(t => (
              <div key={t.id} className={`chat-list-item ${selectedThread === t.id ? 'active' : ''}`} onClick={() => setSelectedThread(t.id)}>
                <div className="chat-avatar">{t.client_name?.charAt(0) || '?'}</div>
                <div className="chat-meta">
                  <div className="chat-subject">{t.subject}</div>
                  <div className="chat-preview">{t.client_name} • {t.last_message?.slice(0, 40)}...</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                    <span className="chat-time">{timeAgo(t.last_message_at)}</span>
                    {t.unread_count > 0 && <span className="chat-unread">{t.unread_count}</span>}
                    {t.pending_tasks > 0 && <span className="badge badge-yellow" style={{ fontSize: '10px' }}><CheckSquare size={10} /> {t.pending_tasks}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="two-panel-main">
          {threadData ? (
            <>
              <div className="two-panel-main-header">
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{threadData.thread?.subject || 'Chat'}</h3>
                  <span className="text-xs text-muted">{threadData.thread?.client_name}</span>
                </div>
                {threadData.thread?.thread_type === 'internal' && <span className="badge badge-yellow">Internal Only</span>}
              </div>
              <div className="chat-messages">
                {(threadData.messages || []).map((m: any, i: number) => (
                  <div key={i} className={`chat-bubble ${m.sender_role !== 'client' ? 'own' : 'other'} ${m.is_internal || threadData.thread?.thread_type === 'internal' ? 'internal-chat-bubble' : ''}`} style={m.is_internal && threadData.thread?.thread_type !== 'internal' ? { backgroundColor: 'var(--color-yellow-50)', borderColor: 'var(--color-yellow-200)' } : {}}>
                    <div className="chat-sender">
                       {m.sender_name} {m.is_internal === 1 && threadData.thread?.thread_type !== 'internal' && <span className="badge badge-yellow" style={{ fontSize: '10px', marginLeft: 4 }}>Internal Note</span>}
                    </div>
                    {m.content}
                    <div className="chat-bubble-time">{formatTime(m.created_at)}</div>
                  </div>
                ))}
              </div>

              {/* Tasks panel */}
              {threadData.tasks && threadData.tasks.length > 0 && (
                <div className="chat-tasks">
                  <h4>Client Tasks ({threadData.tasks.filter((t: any) => !t.is_completed).length} pending)</h4>
                  {threadData.tasks.map((t: any) => (
                    <div key={t.id} className={`task-checkbox ${t.is_completed ? 'completed' : ''}`}>
                      <input type="checkbox" checked={!!t.is_completed} readOnly />
                      <span>{t.task_name}</span>
                    </div>
                  ))}
                </div>
              )}

              <form className="chat-input-bar" onSubmit={handleSendMessage} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <div className="chat-input-toolbar">
                  <button type="button" title="Bold" onClick={() => setNewMessage(m => m + '**bold text** ')}><Bold size={16} /></button>
                  <button type="button" title="Italic" onClick={() => setNewMessage(m => m + '_italic text_ ')}><Italic size={16} /></button>
                  <button type="button" title="Attach" onClick={() => document.getElementById('chat-file-upload')?.click()}><Paperclip size={16} /></button>
                  <button type="button" title="Emoji" onClick={() => setNewMessage(m => m + '😊 ')}><Smile size={16} /></button>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontSize: '12px', cursor: 'pointer', background: isInternalNote ? 'var(--color-yellow-100)' : 'transparent', padding: '2px 8px', borderRadius: '4px' }}>
                    <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} />
                    Internal Only
                  </label>
                  <input type="file" id="chat-file-upload" style={{ display: 'none' }} onChange={(e) => { if(e.target.files && e.target.files.length > 0) showToast(`File ${e.target.files[0].name} attached!`); }} />
                </div>
                <input type="text" placeholder={isInternalNote ? "Type an internal staff note..." : "Type a message..."} value={newMessage} onChange={e => setNewMessage(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary btn-sm"><Send size={14} /></button>
              </form>
            </>
          ) : (
            <div className="empty-state"><MessageSquare size={48} /><h3>Select a conversation</h3><p>Choose a chat thread from the sidebar to start messaging</p></div>
          )}
        </div>
      </div>
      {/* New Conversation Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>New Conversation</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateThread}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select className="form-select" required value={newThreadForm.client_id} onChange={e => setNewThreadForm({...newThreadForm, client_id: e.target.value})}>
                    <option value="">Select a client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.display_name} ({c.client_code})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={newThreadForm.thread_type} onChange={e => setNewThreadForm({...newThreadForm, thread_type: e.target.value})}>
                      <option value="client_facing">Client Facing</option>
                      <option value="internal">Internal Team Only</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input className="form-input" required value={newThreadForm.subject} onChange={e => setNewThreadForm({...newThreadForm, subject: e.target.value})} placeholder="E.g., Missing T4 documents" />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Message *</label>
                  <textarea className="form-input" required value={newThreadForm.message} onChange={e => setNewThreadForm({...newThreadForm, message: e.target.value})} placeholder="Type your first message here..." style={{ minHeight: 100 }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start Conversation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckSquare size={18} style={{ color: 'var(--color-primary)' }} />
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}
