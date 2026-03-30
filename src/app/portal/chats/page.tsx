'use client';
import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Paperclip, CheckCheck, ChevronLeft, ClipboardList } from 'lucide-react';

export default function PortalChats() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserId(user.id || '');
    fetch('/api/portal/chats')
      .then(r => r.json())
      .then(d => { setThreads(d.threads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const openThread = async (thread: any) => {
    setActiveThread(thread);
    setMsgLoading(true);
    try {
      const res = await fetch(`/api/portal/chats/messages?threadId=${thread.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTasks(data.tasks || []);
      // Update unread count locally
      setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_count: 0 } : t));
    } catch { /* ignore */ }
    setMsgLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    try {
      await fetch('/api/portal/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: activeThread.id, content: newMessage.trim() }),
      });
      // Append locally
      setMessages(prev => [...prev, {
        id: 'temp-' + Date.now(),
        sender_id: userId,
        sender_name: 'You',
        sender_role: 'client',
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      }]);
      setNewMessage('');
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading chats...</p></div>;

  return (
    <div className="portal-page portal-chats-page">
      <div className="portal-page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <h1><MessageSquare size={28} /> Chats & Tasks</h1>
      </div>

      <div className="portal-chat-container">
        {/* Thread List */}
        <div className={`portal-chat-sidebar ${activeThread ? 'hidden-mobile' : ''}`}>
          <div className="portal-chat-sidebar-header">
            <h3>Conversations</h3>
            <span className="badge badge-blue">{threads.length}</span>
          </div>
          <div className="portal-chat-thread-list">
            {threads.length === 0 ? (
              <div className="portal-doc-empty" style={{ padding: 'var(--space-8)' }}>
                <MessageSquare size={36} />
                <h3>No conversations yet</h3>
                <p>Your firm will start a conversation when needed.</p>
              </div>
            ) : threads.map(thread => (
              <div key={thread.id} className={`portal-chat-thread-item ${activeThread?.id === thread.id ? 'active' : ''}`} onClick={() => openThread(thread)}>
                <div className="portal-chat-thread-avatar">
                  {thread.subject?.substring(0, 2).toUpperCase() || 'TC'}
                </div>
                <div className="portal-chat-thread-info">
                  <div className="portal-chat-thread-subject">{thread.subject}</div>
                  <div className="portal-chat-thread-preview">{thread.last_sender}: {thread.last_message?.substring(0, 50)}</div>
                </div>
                <div className="portal-chat-thread-meta">
                  <span className="portal-chat-thread-time">{timeAgo(thread.last_message_at)}</span>
                  {thread.unread_count > 0 && <span className="portal-chat-thread-unread">{thread.unread_count}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Panel */}
        <div className={`portal-chat-main ${!activeThread ? 'hidden-mobile' : ''}`}>
          {!activeThread ? (
            <div className="portal-chat-empty">
              <MessageSquare size={48} style={{ color: 'var(--color-gray-300)' }} />
              <h3>Select a conversation</h3>
              <p>Choose a thread from the left to view messages.</p>
            </div>
          ) : (
            <>
              <div className="portal-chat-main-header">
                <button className="portal-chat-back-btn" onClick={() => setActiveThread(null)}>
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 style={{ margin: 0 }}>{activeThread.subject}</h3>
                </div>
              </div>

              {/* Tasks panel (if any) */}
              {tasks.length > 0 && (
                <div className="portal-chat-tasks-bar">
                  <ClipboardList size={14} />
                  <span className="portal-chat-tasks-label">Tasks ({tasks.filter((t: any) => !t.is_completed).length} pending)</span>
                  <div className="portal-chat-tasks-list">
                    {tasks.map((task: any) => (
                      <label key={task.id} className={`portal-chat-task-item ${task.is_completed ? 'completed' : ''}`}>
                        <input type="checkbox" checked={!!task.is_completed} readOnly />
                        <span>{task.task_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="portal-chat-messages">
                {msgLoading ? (
                  <div className="portal-loading" style={{ padding: 'var(--space-8)' }}><div className="portal-loading-spinner" /></div>
                ) : messages.length === 0 ? (
                  <div className="portal-chat-empty"><p>No messages yet in this thread.</p></div>
                ) : messages.map((msg: any) => {
                  const isOwn = msg.sender_id === userId;
                  return (
                    <div key={msg.id} className={`portal-chat-bubble-wrap ${isOwn ? 'own' : 'other'}`}>
                      {!isOwn && <div className="portal-chat-bubble-sender">{msg.sender_name}</div>}
                      <div className={`portal-chat-bubble ${isOwn ? 'own' : 'other'}`}>
                        <p>{msg.content}</p>
                        <span className="portal-chat-bubble-time">
                          {formatTime(msg.created_at)}
                          {isOwn && <CheckCheck size={12} style={{ marginLeft: 4 }} />}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="portal-chat-input-bar">
                <button className="portal-chat-attach-btn"><Paperclip size={18} /></button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button className="portal-chat-send-btn" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
