'use client';
import { useEffect, useState, useRef } from 'react';
import CalendarView, { ComplianceTask } from '@/components/CalendarView';
import { VaultTab, FamilyTab, EntitiesVaultTab, ConsultantsTab } from '@/components/VaultTabs';
import {
  CheckCircle2, AlertCircle, Clock, FileText, MessageSquare,
  UploadCloud, CreditCard, ChevronDown, Calendar,
  ClipboardList, Shield, X, Circle,
  Mail, Phone, MapPin, Users, User, Building2, Network,
  ExternalLink, FolderOpen, Upload, Download, DollarSign,
  Send, Paperclip, CheckCheck, ChevronLeft,
  FolderKanban, Plus
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function timeAgo(d: string) { const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (mins < 1) return 'now'; if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; }

export default function PortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (t) setTab(t);
  }, []);

  // Chat state
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatTasks, setChatTasks] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Invoice state
  const [payModal, setPayModal] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState<any>(null);
  const [invFilter, setInvFilter] = useState('all');
  const [expandedInv, setExpandedInv] = useState<string | null>(null);
  // Doc state
  const [docData, setDocData] = useState<any>(null);
  const [docExpandedYear, setDocExpandedYear] = useState<string | null>(null);
  const [docExpandedFolder, setDocExpandedFolder] = useState<string | null>(null);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [docUploadTarget, setDocUploadTarget] = useState<any>({ category: 'permanent', year: 'Permanent', label: 'Permanent Documents' });
  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);

  const fetchDashboard = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('client_id');
    const url = cid ? `/api/portal/dashboard?client_id=${cid}` : '/api/portal/dashboard';
    fetch(url).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserId(user.id || '');
    fetchDashboard();
  }, []);

  useEffect(() => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const loadChats = () => { fetch('/api/portal/chats').then(r => r.json()).then(d => setChatThreads(d.threads || [])); };
  const openThread = async (thread: any) => {
    setActiveThread(thread);
    const res = await fetch(`/api/portal/chats/messages?threadId=${thread.id}`);
    const d = await res.json();
    setChatMessages(d.messages || []);
    setChatTasks(d.tasks || []);
    setChatThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_count: 0 } : t));
  };
  const sendMsg = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    await fetch('/api/portal/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threadId: activeThread.id, content: newMessage.trim() }) });
    setChatMessages(prev => [...prev, { id: 'temp-' + Date.now(), sender_id: userId, sender_name: 'You', sender_role: 'client', content: newMessage.trim(), created_at: new Date().toISOString() }]);
    setNewMessage('');
    setSending(false);
  };

  const loadDocData = () => { if (data?.client?.id) fetch(`/api/clients/${data.client.id}/documents`).then(r => r.json()).then(setDocData).catch(() => {}); };
  useEffect(() => { if (tab === 'documents' && !docData && data?.client?.id) loadDocData(); }, [tab, data]);
  useEffect(() => { if (tab === 'communications' && chatThreads.length === 0) loadChats(); }, [tab]);

  const handleDocUpload = async () => {
    if (!docUploadFile || !data?.client?.id) return;
    setDocUploading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fd = new FormData();
    fd.append('file', docUploadFile);
    fd.append('client_id', data.client.id);
    fd.append('document_category', docUploadTarget.category);
    fd.append('financial_year', docUploadTarget.year);
    fd.append('uploaded_by', user.id || 'system');
    await fetch('/api/documents', { method: 'POST', body: fd });
    setDocUploading(false); setShowDocUpload(false); setDocUploadFile(null);
    loadDocData(); fetchDashboard();
  };

  const handlePay = async () => {
    if (!payModal || !payAmount) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;
    setPaying(true);
    try {
      const res = await fetch('/api/portal/invoices/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice_id: payModal.id, amount }) });
      const result = await res.json();
      setPayResult(res.ok ? { success: true, ...result } : { success: false, error: result.error });
      if (res.ok) fetchDashboard();
    } catch (err: any) { setPayResult({ success: false, error: err.message }); }
    finally { setPaying(false); }
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading your portal...</p></div>;
  if (!data || data.error) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load portal</h2><p>Please try refreshing the page or contact the firm.</p></div>;

  const { client, compliances, tasks, docRequests, billing, invoices, linkedEntities, docSummary, contacts, personalInfo, tags, reminders, activity, statusSummary, unreadChats } = data;
  const pendingDocs = (docRequests || []).filter((d: any) => d.uploaded_count === 0);

  const tabItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'compliances', label: 'Compliances' },
    { key: 'entities', label: 'Linked Entities' },
    { key: 'communications', label: 'Communications' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'invoices', label: 'Invoices', badge: invoices?.length },
    { key: 'documents', label: 'Documents', badge: docSummary?.total_docs },
    { key: 'requests', label: 'Action Requests', badge: statusSummary?.pending_actions },
    { key: 'other_info', label: 'Other Info' },
    { key: '_separator', label: 'COMPLIANCE VAULT' },
    { key: 'vault', label: '🔒 Personal Vault' },
    { key: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { key: 'my_entities', label: '🏢 My Entities' },
    { key: 'consultants', label: '👤 Consultants' },
  ];

  return (
    <div className="portal-page" style={{ paddingTop: '24px' }}>
      {/* ── MAIN LAYOUT WITH SIDEBAR ── */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* ── LEFT SIDEBAR TABS ── */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '24px' }}>
          <div style={{ padding: '0 12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-500)' }}>Portal Menu</span>
          </div>
          {tabItems.map(t => {
            if (t.key === '_separator') {
              return (
                <div key={t.key} style={{ padding: '16px 12px 6px', marginTop: '8px', borderTop: '1px solid var(--color-gray-200)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>🔐 {t.label}</span>
                </div>
              );
            }
            return (
            <button key={t.key} 
                style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: tab === t.key ? (['vault','family','my_entities','consultants'].includes(t.key) ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))' : 'var(--color-primary-50)') : 'transparent',
                    color: tab === t.key ? (['vault','family','my_entities','consultants'].includes(t.key) ? '#059669' : 'var(--color-primary)') : 'var(--color-gray-600)',
                    fontWeight: tab === t.key ? 600 : 500,
                    fontSize: '0.875rem',
                    textAlign: 'left', transition: 'all 0.15s', width: '100%'
                }}
                onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && <span className="badge" style={{ fontSize: 10, background: tab === t.key ? 'var(--color-primary)' : 'var(--color-gray-200)', color: tab === t.key ? 'white' : 'var(--color-gray-700)' }}>{t.badge}</span>}
            </button>
            );
          })}
        </div>

        {/* ── CONTENT AREA ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ── CLIENT HEADER ── */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{client.display_name}</h1>
                  <span className={`badge ${client.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{client.status}</span>
                  <span className="badge badge-gray">{client.client_type}</span>
                </div>
                <div style={{ display: 'flex', gap: '24px', color: 'var(--color-gray-500)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> {client.client_code}</span>
                  {client.primary_email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {client.primary_email}</span>}
                  {client.primary_phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {client.primary_phone}</span>}
                  {client.city && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {[client.city, client.province].filter(Boolean).join(', ')}</span>}
                </div>
                {tags?.length > 0 && <div style={{ display: 'flex', gap: '4px', marginTop: '12px', flexWrap: 'wrap' }}>{tags.map((t: any, i: number) => <span key={i} className="tag" style={{ background: t.color + '20', color: t.color }}>{t.name}</span>)}</div>}
              </div>
            </div>
          </div>

          {/* ── LINKED ACCOUNTS BANNER ── */}
          {linkedEntities?.length > 0 && (
            <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Network size={14} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>Linked Accounts</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {linkedEntities.map((r: any) => {
                  const isTrust = (r.client_type || '').toLowerCase().includes('trust');
                  const isBiz = (r.client_type || '').toLowerCase().includes('corp') || (r.client_type || '').toLowerCase().includes('business');
                  return (
                    <div key={r.link_id} onClick={() => { window.location.href = `/portal?client_id=${r.client_id}`; }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isBiz ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : isTrust ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'linear-gradient(135deg,#10b981,#059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isBiz ? <Building2 size={14} /> : isTrust ? <Shield size={14} /> : <User size={14} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.display_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-500)' }}>{r.role} · {r.client_type}</div>
                      </div>
                      <ExternalLink size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════ OVERVIEW TAB ════════ */}
          {tab === 'overview' && <OverviewTab data={data} pendingDocs={pendingDocs} setTab={setTab} />}

          {/* ════════ COMPLIANCES TAB ════════ */}
          {tab === 'compliances' && <CompliancesTab compliances={compliances} linkedEntities={linkedEntities} client={client} statusSummary={statusSummary} />}

          {/* ════════ LINKED ENTITIES TAB ════════ */}
          {tab === 'entities' && <EntitiesTab linkedEntities={linkedEntities} />}

          {/* ════════ COMMUNICATIONS TAB ════════ */}
          {tab === 'communications' && (
            <div className="portal-chat-container" style={{ minHeight: 500 }}>
              <div className={`portal-chat-sidebar ${activeThread ? 'hidden-mobile' : ''}`}>
                <div className="portal-chat-sidebar-header"><h3>Conversations</h3><span className="badge badge-blue">{chatThreads.length}</span></div>
                <div className="portal-chat-thread-list">
                  {chatThreads.length === 0 ? <div className="portal-doc-empty" style={{ padding: '32px' }}><MessageSquare size={36} /><h3>No conversations</h3><p>Your firm will start a conversation when needed.</p></div>
                  : chatThreads.map(thread => (
                    <div key={thread.id} className={`portal-chat-thread-item ${activeThread?.id === thread.id ? 'active' : ''}`} onClick={() => openThread(thread)}>
                      <div className="portal-chat-thread-avatar">{thread.subject?.substring(0, 2).toUpperCase()}</div>
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
              <div className={`portal-chat-main ${!activeThread ? 'hidden-mobile' : ''}`}>
                {!activeThread ? <div className="portal-chat-empty"><MessageSquare size={48} style={{ color: 'var(--color-gray-300)' }} /><h3>Select a conversation</h3></div> : (<>
                  <div className="portal-chat-main-header"><button className="portal-chat-back-btn" onClick={() => setActiveThread(null)}><ChevronLeft size={20} /></button><h3 style={{ margin: 0 }}>{activeThread.subject}</h3></div>
                  {chatTasks.length > 0 && <div className="portal-chat-tasks-bar"><ClipboardList size={14} /><span className="portal-chat-tasks-label">Tasks ({chatTasks.filter((t: any) => !t.is_completed).length} pending)</span></div>}
                  <div className="portal-chat-messages">
                    {chatMessages.map((msg: any) => {
                      const isOwn = msg.sender_id === userId;
                      return (<div key={msg.id} className={`portal-chat-bubble-wrap ${isOwn ? 'own' : 'other'}`}>
                        {!isOwn && <div className="portal-chat-bubble-sender">{msg.sender_name}</div>}
                        <div className={`portal-chat-bubble ${isOwn ? 'own' : 'other'}`}><p>{msg.content}</p>
                          <span className="portal-chat-bubble-time">{new Date(msg.created_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}{isOwn && <CheckCheck size={12} style={{ marginLeft: 4 }} />}</span>
                        </div></div>);
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="portal-chat-input-bar">
                    <button className="portal-chat-attach-btn"><Paperclip size={18} /></button>
                    <input type="text" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }} disabled={sending} />
                    <button className="portal-chat-send-btn" onClick={sendMsg} disabled={sending || !newMessage.trim()}><Send size={18} /></button>
                  </div>
                </>)}
              </div>
            </div>
          )}

          {/* ════════ CALENDAR TAB ════════ */}
          {tab === 'calendar' && <ClientCalendarTab />}

          {/* ════════ INVOICES TAB ════════ */}
          {tab === 'invoices' && <InvoicesTab invoices={invoices} billing={billing} invFilter={invFilter} setInvFilter={setInvFilter} expandedInv={expandedInv} setExpandedInv={setExpandedInv} payModal={payModal} setPayModal={setPayModal} payAmount={payAmount} setPayAmount={setPayAmount} paying={paying} payResult={payResult} handlePay={handlePay} setPayResult={setPayResult} />}

          {/* ════════ DOCUMENTS TAB ════════ */}
          {tab === 'documents' && <DocumentsTab docData={docData} docSummary={docSummary} docExpandedYear={docExpandedYear} setDocExpandedYear={setDocExpandedYear} docExpandedFolder={docExpandedFolder} setDocExpandedFolder={setDocExpandedFolder} showDocUpload={showDocUpload} setShowDocUpload={setShowDocUpload} docUploadTarget={docUploadTarget} setDocUploadTarget={setDocUploadTarget} docUploadFile={docUploadFile} setDocUploadFile={setDocUploadFile} docUploading={docUploading} handleDocUpload={handleDocUpload} />}

          {/* ════════ REQUESTS TAB ════════ */}
          {tab === 'requests' && <RequestsTab />}

          {/* ════════ VAULT TABS ════════ */}
          {tab === 'vault' && <VaultTab />}
          {tab === 'family' && <FamilyTab />}
          {tab === 'my_entities' && <EntitiesVaultTab />}
          {tab === 'consultants' && <ConsultantsTab />}

          {/* ════════ OTHER INFO TAB ════════ */}
          {tab === 'other_info' && <OtherInfoTab client={client} personalInfo={personalInfo} contacts={contacts} />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════

function RequestsTab() {
  const [data, setData] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [activeTab, setActiveTab] = useState<'tasks' | 'reminders'>('tasks');
  const [isCreatingReminder, setIsCreatingReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', message: '', trigger_date: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/tasks').then(r => r.json()),
      fetch('/api/portal/reminders').then(r => r.json())
    ])
    .then(([taskData, reminderData]) => {
      setData(taskData);
      setReminders(reminderData.reminders || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await fetch('/api/portal/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed }),
      });
      setData((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, is_completed: completed ? 1 : 0 } : t),
      }));
    } catch { /* ignore */ }
  };

  const createReminder = async () => {
    if (!newReminder.title || !newReminder.trigger_date) return;
    try {
      const res = await fetch('/api/portal/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder)
      });
      if (res.ok) {
        setIsCreatingReminder(false);
        setNewReminder({ title: '', message: '', trigger_date: '' });
        const fresh = await fetch('/api/portal/reminders').then(r => r.json());
        setReminders(fresh.reminders || []);
      }
    } catch { /* ignore */ }
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading tasks...</p></div>;
  if (!data) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load tasks</h2></div>;

  const { tasks } = data;
  const pendingTasks = tasks.filter((t: any) => !t.is_completed);
  const completedTasks = tasks.filter((t: any) => t.is_completed);
  const displayedTasks = filter === 'pending' ? pendingTasks : filter === 'completed' ? completedTasks : tasks;

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-gray-200)' }}>
      <div className="portal-page-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}><ClipboardList size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Tasks & Reminders</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Manage firm requests and your personal compliance reminders.</p>
        </div>
      </div>

      <div className="portal-doc-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid var(--color-gray-200)' }}>
        <button 
          className={`portal-doc-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Firm Requests ({pendingTasks.length} pending)
        </button>
        <button 
          className={`portal-doc-tab ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          My Private Reminders ({reminders.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
          <div className="portal-tasks-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="portal-tasks-stat" onClick={() => setFilter('pending')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', background: 'var(--color-gray-50)', border: filter === 'pending' ? '2px solid var(--color-primary)' : '1px solid transparent' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pendingTasks.length}</div>
                <div className="text-xs text-muted">Pending</div>
              </div>
            </div>
            <div className="portal-tasks-stat" onClick={() => setFilter('completed')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', background: 'var(--color-gray-50)', border: filter === 'completed' ? '2px solid var(--color-success)' : '1px solid transparent' }}>
              <div style={{ background: '#d1fae5', color: '#059669', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedTasks.length}</div>
                <div className="text-xs text-muted">Completed</div>
              </div>
            </div>
            <div className="portal-tasks-stat" onClick={() => setFilter('all')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', background: 'var(--color-gray-50)', border: filter === 'all' ? '2px solid var(--color-gray-400)' : '1px solid transparent' }}>
              <div style={{ background: '#dbeafe', color: '#2563eb', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{tasks.length}</div>
                <div className="text-xs text-muted">Total</div>
              </div>
            </div>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="portal-doc-empty" style={{ padding: '48px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 16px', color: 'var(--color-gray-400)' }} />
              <h3>{filter === 'pending' ? 'No pending tasks!' : 'No tasks found'}</h3>
              <p className="text-muted">{filter === 'pending' ? 'You\'re all caught up. We\'ll notify you when new tasks arrive.' : 'Try changing the filter.'}</p>
            </div>
          ) : (
            <div className="portal-task-list-full" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayedTasks.map((task: any) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--color-gray-200)', borderRadius: '8px', opacity: task.is_completed ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      onClick={() => toggleTask(task.id, !task.is_completed)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: task.is_completed ? 'var(--color-success)' : 'var(--color-gray-400)' }}
                    >
                      {task.is_completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div>
                      <div style={{ fontWeight: 600, textDecoration: task.is_completed ? 'line-through' : 'none' }}>{task.task_name}</div>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        {task.thread_subject && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={12} /> {task.thread_subject}</span>}
                        {task.template_name && <span> · {task.template_name}</span>}
                        {task.financial_year && <span> · FY {task.financial_year}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    {!task.is_completed && <span className="badge badge-yellow">Pending</span>}
                    {task.is_completed && <span className="badge badge-green">Done</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'reminders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="text-sm text-muted">Set personal reminders for tax deductions, missing receipts, etc. The firm cannot see these.</p>
            <button 
              onClick={() => setIsCreatingReminder(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} /> New Reminder
            </button>
          </div>

          {isCreatingReminder && (
            <div style={{ background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', padding: '20px', borderRadius: '12px' }}>
              <div className="form-group"><label className="form-label">Reminder Title <span style={{ color: 'red' }}>*</span></label>
                <input type="text" className="form-input" value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} placeholder="E.g., Track down Amazon receipt for laptop" />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}><label className="form-label">Trigger Date <span style={{ color: 'red' }}>*</span></label>
                <input type="date" className="form-input" value={newReminder.trigger_date} onChange={e => setNewReminder({...newReminder, trigger_date: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}><label className="form-label">Notes (Optional)</label>
                <textarea className="form-input" value={newReminder.message} onChange={e => setNewReminder({...newReminder, message: e.target.value})} rows={2} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={createReminder} className="btn btn-primary" disabled={!newReminder.title || !newReminder.trigger_date}>Save Reminder</button>
                <button onClick={() => setIsCreatingReminder(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          )}

          {reminders.length === 0 && !isCreatingReminder ? (
             <div className="portal-doc-empty" style={{ padding: '48px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
               <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--color-gray-400)' }} />
              <h3>No private reminders</h3>
              <p className="text-muted">Create personal trackers for expenses, receipts, or other tax items.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reminders.map(r => (
                <div key={r.id} style={{ background: 'white', border: '1px solid var(--color-gray-200)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '16px' }}>
                  <div style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', width: 40, height: 40, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{r.title}</h4>
                    <p className="text-sm text-muted" style={{ margin: '0 0 12px' }}>{r.message}</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge badge-gray">Due: {new Date(r.trigger_date).toLocaleDateString()}</span>
                      <span className={`badge ${r.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════

function ClientCalendarTab() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/calendar/client');
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (e) {
        console.error('Failed to fetch calendar tasks', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading calendar...</div>;

  return (
    <div style={{ minHeight: '600px', backgroundColor: 'var(--color-gray-50)', padding: '16px', borderRadius: '12px' }}>
      <CalendarView tasks={tasks} isAdmin={false} />
    </div>
  );
}

function OverviewTab({ data, pendingDocs, setTab }: any) {
  const { client, compliances, tasks, billing, invoices, statusSummary, activity, unreadChats, reminders } = data;
  return (<>
    {/* KPI Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      <div className="kpi-card"><div className="kpi-icon blue"><FolderKanban size={22} /></div><div className="kpi-label">Active Projects</div><div className="kpi-value" style={{ fontSize: '1.5rem' }}>{statusSummary?.active_projects || 0}</div></div>
      <div className="kpi-card"><div className="kpi-icon green"><DollarSign size={22} /></div><div className="kpi-label">Total Billed</div><div className="kpi-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(statusSummary?.total_billed)}</div></div>
      <div className="kpi-card"><div className="kpi-icon yellow"><DollarSign size={22} /></div><div className="kpi-label">Outstanding</div><div className="kpi-value" style={{ fontSize: '1.5rem', color: billing?.outstanding > 0 ? 'var(--color-danger)' : 'inherit' }}>{formatCurrency(billing?.outstanding)}</div></div>
      <div className="kpi-card"><div className="kpi-icon blue"><FileText size={22} /></div><div className="kpi-label">Documents</div><div className="kpi-value" style={{ fontSize: '1.5rem' }}>{data.docSummary?.total_docs || 0}</div></div>
    </div>

    {/* Action Required */}
    {(pendingDocs.length > 0 || tasks?.length > 0 || billing?.outstanding > 0) && (
      <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #d97706' }}>
        <div className="card-header"><h3><AlertCircle size={18} style={{ color: '#d97706' }} /> Action Required</h3><span className="badge badge-yellow">{statusSummary?.pending_actions} items</span></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingDocs.length > 0 && pendingDocs.slice(0, 3).map((doc: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UploadCloud size={16} style={{ color: '#d97706' }} /><span style={{ fontSize: '0.875rem' }}>{doc.document_name} <span style={{ color: '#92400e' }}>· {doc.template_name} · FY {doc.financial_year}</span></span></div>
              <button className="btn btn-sm btn-primary" onClick={() => setTab('documents')}>Upload</button>
            </div>
          ))}
          {billing?.outstanding > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fee2e2', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={16} style={{ color: '#dc2626' }} /><span style={{ fontSize: '0.875rem' }}>Outstanding balance: <strong>{formatCurrency(billing.outstanding)}</strong></span></div>
              <button className="btn btn-sm btn-primary" onClick={() => setTab('invoices')}>Pay Now</button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Compliance Engagements Table */}
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header"><h3>Compliance Engagements</h3><button className="btn btn-ghost btn-sm" onClick={() => setTab('compliances')}>View All</button></div>
      <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Compliance</th><th>Year</th><th>Stage</th><th>Due Date</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>{(compliances || []).slice(0, 5).map((e: any) => (
          <tr key={e.id}><td><span className="client-name">{e.template_name}</span><br /><span className="text-xs text-muted">{e.engagement_code}</span></td>
            <td className="text-sm">{e.financial_year}</td><td className="text-sm">{e.current_stage_name || '—'}</td><td className="text-sm">{formatDate(e.due_date)}</td>
            <td className="text-sm">{formatCurrency(e.price)}</td>
            <td><span className={`badge ${e.status === 'completed' ? 'badge-green' : e.status === 'new' ? 'badge-gray' : 'badge-blue'}`}><span className="badge-dot"></span>{e.client_status}</span></td>
          </tr>
        ))}</tbody></table></div>
    </div>

    {/* Recent Invoices */}
    {invoices?.length > 0 && (
      <div className="card"><div className="card-header"><h3>Recent Invoices</h3><button className="btn btn-ghost btn-sm" onClick={() => setTab('invoices')}>View all</button></div>
        <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Invoice</th><th>Status</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead>
          <tbody>{invoices.slice(0, 3).map((inv: any) => (
            <tr key={inv.id}><td><span className="client-name">{inv.invoice_number}</span><br /><span className="text-xs text-muted">{formatDate(inv.issued_date)}</span></td>
              <td><span className={`badge ${inv.status === 'paid' ? 'badge-green' : inv.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}><span className="badge-dot"></span>{inv.status}</span></td>
              <td className="text-sm">{formatCurrency(inv.total_amount)}</td><td className="text-sm">{formatCurrency(inv.paid_amount)}</td>
              <td className="text-sm" style={{ fontWeight: 600, color: inv.total_amount - inv.paid_amount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatCurrency(inv.total_amount - inv.paid_amount)}</td>
            </tr>
          ))}</tbody></table></div>
      </div>
    )}

    {/* Recent Activity */}
    {activity?.length > 0 && (
      <div className="card" style={{ marginTop: '24px' }}><div className="card-header"><h3><Clock size={18} /> Recent Activity</h3></div>
        <div className="card-body">{activity.map((act: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: i < activity.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', marginTop: 6, flexShrink: 0 }} />
            <div><span style={{ fontSize: '0.875rem' }}><strong>{act.actor_name}</strong> {act.details}</span><br /><span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{timeAgo(act.created_at)}</span></div>
          </div>
        ))}</div>
      </div>
    )}
  </>);
}

function CompliancesTab({ compliances, linkedEntities, client, statusSummary }: any) {
  const currentYear = new Date().getFullYear();
  const now = new Date();
  const allEngs = compliances || [];
  const completedCount = allEngs.filter((e: any) => e.status === 'completed').length;
  const activeCount = allEngs.filter((e: any) => e.status !== 'completed').length;
  const overdueCount = allEngs.filter((e: any) => e.due_date && new Date(e.due_date) < now && e.status !== 'completed').length;
  const totalPrice = allEngs.reduce((s: number, e: any) => s + (e.price || 0), 0);

  const groupByYear = (engs: any[]) => {
    const years: Record<string, any[]> = {};
    engs.forEach(e => { const y = e.financial_year || 'Unknown'; if (!years[y]) years[y] = []; years[y].push(e); });
    return Object.entries(years).sort(([a], [b]) => parseInt(b) - parseInt(a));
  };
  const getTimePeriod = (year: string) => { const y = parseInt(year); if (isNaN(y)) return 'current'; if (y > currentYear) return 'future'; if (y === currentYear) return 'current'; return 'past'; };

  const ownYears = groupByYear(allEngs);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Entity Header */}
      <div className="card"><div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>
          <div><h3 style={{ margin: 0 }}>{client.display_name}</h3><span className="text-sm text-muted">{client.client_type} · {client.client_code}</span></div>
        </div>
      </div></div>

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div style={{ padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{allEngs.length}</div><div className="text-xs text-muted">Total Tasks</div></div>
        <div style={{ padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{activeCount}</div><div className="text-xs text-muted">Active</div></div>
        <div style={{ padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>{completedCount}</div><div className="text-xs text-muted">Completed</div></div>
        <div style={{ padding: '12px', background: overdueCount > 0 ? 'rgba(239,68,68,0.05)' : 'var(--color-gray-50)', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '1.25rem', fontWeight: 700, color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-gray-400)' }}>{overdueCount}</div><div className="text-xs text-muted">Overdue</div></div>
        <div style={{ padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(totalPrice)}</div><div className="text-xs text-muted">Total Value</div></div>
      </div>

      {/* Year Sections */}
      {ownYears.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-400)', background: 'var(--color-gray-50)', borderRadius: '12px' }}><FolderKanban size={40} style={{ marginBottom: 8 }} /><h3>No Compliance Tasks</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ownYears.map(([year, engs]) => <YearSection key={year} year={year} engs={engs} defaultExpanded={getTimePeriod(year) !== 'past'} currentYear={currentYear} now={now} />)}
        </div>
      )}

      {/* Linked Entity Compliances */}
      {(linkedEntities || []).filter((le: any) => le.engagements?.length > 0).map((lc: any) => {
        const isBiz = (lc.client_type || '').toLowerCase().includes('corp') || (lc.client_type || '').toLowerCase().includes('business');
        const isTrust = (lc.client_type || '').toLowerCase().includes('trust');
        const lcYears = groupByYear(lc.engagements);
        return (
          <div key={lc.client_id} style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--color-gray-50)', borderRadius: '12px 12px 0 0', border: '1px solid var(--color-gray-200)', borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isBiz ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : isTrust ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isBiz ? <Building2 size={16} /> : isTrust ? <Shield size={16} /> : <Users size={16} />}
                </div>
                <div><h3 style={{ margin: 0, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{lc.display_name}<span className="badge badge-gray" style={{ fontSize: 10 }}>{lc.role}</span></h3><span className="text-xs text-muted">{lc.client_type} · {lc.client_code}</span></div>
              </div>
              <div onClick={() => window.location.href = `/portal?client_id=${lc.client_id}`} className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={14} /> View Account</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--color-gray-200)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '12px' }}>
              {lcYears.map(([year, engs]) => <YearSection key={year} year={year} engs={engs} defaultExpanded={getTimePeriod(year) === 'current'} currentYear={currentYear} now={now} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function YearSection({ year, engs, defaultExpanded, currentYear, now }: any) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const y = parseInt(year);
  const period = isNaN(y) ? 'current' : y > currentYear ? 'future' : y === currentYear ? 'current' : 'past';
  const periodLabel = period === 'past' ? 'Completed' : period === 'future' ? 'Upcoming' : 'Active';
  const yearTotal = engs.reduce((s: number, e: any) => s + (e.price || 0), 0);

  return (
    <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: period === 'past' ? 'var(--color-gray-50)' : period === 'future' ? 'rgba(139,92,246,0.05)' : 'rgba(99,102,241,0.05)', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: period === 'past' ? 'var(--color-gray-200)' : period === 'future' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, var(--color-primary), #4f46e5)', color: period === 'past' ? 'var(--color-gray-600)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>{year === 'Unknown' ? '?' : year.slice(-2)}</div>
          <div><div style={{ fontWeight: 700 }}>FY {year}</div><div className="text-xs text-muted">{engs.length} compliance task{engs.length !== 1 ? 's' : ''} · {formatCurrency(yearTotal)}</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${period === 'past' ? 'badge-gray' : period === 'future' ? 'badge-cyan' : 'badge-blue'}`} style={{ fontSize: 10 }}>{periodLabel}</span>
          <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
        </div>
      </div>
      {expanded && (
        <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table text-sm"><thead><tr><th>Compliance</th><th>Stage</th><th>Due Date</th><th>Price</th><th>Status</th><th style={{ width: 60 }}>Links</th></tr></thead>
            <tbody>{engs.map((e: any) => {
              const overdue = e.due_date && new Date(e.due_date) < now && e.status !== 'completed';
              return (
                <tr key={e.id} style={{ background: overdue ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                  <td><span className="client-name">{e.template_name}</span><br /><span className="text-xs text-muted">{e.engagement_code}</span></td>
                  <td className="text-sm">{e.current_stage || '—'}</td>
                  <td className="text-sm">{formatDate(e.due_date)}{overdue && <><br /><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-danger)' }}>OVERDUE</span></>}</td>
                  <td className="text-sm" style={{ fontWeight: 600 }}>{formatCurrency(e.price || 0)}</td>
                  <td><span className={`badge ${e.status === 'completed' ? 'badge-green' : e.status === 'new' ? 'badge-gray' : overdue ? 'badge-red' : 'badge-blue'}`}><span className="badge-dot"></span>{e.client_status || e.status}</span></td>
                  <td><ExternalLink size={14} style={{ color: 'var(--color-gray-400)' }} /></td>
                </tr>);
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EntitiesTab({ linkedEntities }: any) {
  if (!linkedEntities?.length) return (
    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)', background: 'var(--color-gray-50)', borderRadius: '12px' }}>
      <Network size={48} style={{ marginBottom: 12 }} /><h3>No Linked Entities</h3><p className="text-sm">No linked accounts or family members are associated with your profile.</p>
    </div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {linkedEntities.map((le: any) => {
        const isTrust = (le.client_type || '').toLowerCase().includes('trust');
        const isBiz = (le.client_type || '').toLowerCase().includes('corp') || (le.client_type || '').toLowerCase().includes('business');
        const activeEngs = (le.engagements || []).filter((e: any) => e.status !== 'completed').length;
        return (
          <div key={le.link_id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => window.location.href = `/portal?client_id=${le.client_id}`}>
            <div className="card-body" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: isBiz ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : isTrust ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'linear-gradient(135deg,#10b981,#059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isBiz ? <Building2 size={22} /> : isTrust ? <Shield size={22} /> : <User size={22} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{le.display_name}</h3>
                <span className="text-sm text-muted">{le.role} · {le.client_type}</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <span className="badge badge-gray">{le.client_code}</span>
                  {activeEngs > 0 && <span className="badge badge-blue">{activeEngs} active</span>}
                  <span className={`badge ${le.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{le.status}</span>
                </div>
              </div>
              <ExternalLink size={16} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InvoicesTab({ invoices, billing, invFilter, setInvFilter, expandedInv, setExpandedInv, payModal, setPayModal, payAmount, setPayAmount, paying, payResult, handlePay, setPayResult }: any) {
  const filtered = invFilter === 'all' ? invoices : (invoices || []).filter((i: any) => {
    if (invFilter === 'unpaid') return ['sent', 'overdue', 'partially_paid'].includes(i.status);
    return i.status === invFilter;
  });
  const unpaidCount = (invoices || []).filter((i: any) => ['sent', 'overdue', 'partially_paid'].includes(i.status)).length;
  const paidCount = (invoices || []).filter((i: any) => i.status === 'paid').length;
  const overdueCount = (invoices || []).filter((i: any) => i.status === 'overdue').length;

  return (<>
    {/* Summary Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      <div className="kpi-card"><div className="kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><AlertCircle size={22} /></div><div className="kpi-label">Outstanding</div><div className="kpi-value" style={{ color: billing?.outstanding > 0 ? '#dc2626' : '#059669' }}>{formatCurrency(billing?.outstanding)}</div></div>
      <div className="kpi-card"><div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={22} /></div><div className="kpi-label">Overdue</div><div className="kpi-value">{formatCurrency(billing?.overdue)}</div></div>
      <div className="kpi-card"><div className="kpi-icon" style={{ background: '#d1fae5', color: '#059669' }}><CheckCircle2 size={22} /></div><div className="kpi-label">Total Paid</div><div className="kpi-value">{formatCurrency(billing?.total_paid)}</div></div>
      <div className="kpi-card"><div className="kpi-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FileText size={22} /></div><div className="kpi-label">Total Invoices</div><div className="kpi-value">{(invoices || []).length}</div></div>
    </div>

    {/* Filter Tabs */}
    <div className="portal-doc-tabs" style={{ marginBottom: '16px' }}>
      {[{ key: 'all', label: `All (${(invoices || []).length})` }, { key: 'unpaid', label: `Unpaid (${unpaidCount})` }, { key: 'paid', label: `Paid (${paidCount})` }, { key: 'overdue', label: `Overdue (${overdueCount})` }].map(t => (
        <button key={t.key} className={`portal-doc-tab ${invFilter === t.key ? 'active' : ''}`} onClick={() => setInvFilter(t.key)}>{t.label}</button>
      ))}
    </div>

    {/* Invoice List */}
    {(filtered || []).length === 0 ? (
      <div className="portal-doc-empty"><CheckCircle2 size={48} /><h3>No invoices found</h3></div>
    ) : (
      <div className="portal-invoice-list">
        {filtered.map((inv: any) => {
          const remaining = inv.total_amount - inv.paid_amount;
          const isExp = expandedInv === inv.id;
          return (
            <div key={inv.id} className={`portal-invoice-card ${inv.status === 'overdue' ? 'overdue' : ''}`}>
              <div className="portal-invoice-card-main" onClick={() => setExpandedInv(isExp ? null : inv.id)}>
                <div className="portal-invoice-card-left">
                  <div className="portal-invoice-number">#{inv.invoice_number}</div>
                  <div className="portal-invoice-desc">{inv.template_name || 'Professional services'}</div>
                  <div className="portal-invoice-meta">FY {inv.financial_year}</div>
                </div>
                <div className="portal-invoice-card-right">
                  <div className="portal-invoice-amount">{formatCurrency(inv.total_amount)}</div>
                  <span className={`badge ${inv.status === 'paid' ? 'badge-green' : inv.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>{inv.status}</span>
                  <ChevronDown size={16} style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </div>
              </div>
              {isExp && (
                <div className="portal-invoice-details">
                  <div className="portal-invoice-detail-grid">
                    <div><span className="text-muted">Amount</span><br />{formatCurrency(inv.amount)}</div>
                    <div><span className="text-muted">Tax</span><br />{formatCurrency(inv.tax_amount)}</div>
                    <div><span className="text-muted">Total</span><br /><strong>{formatCurrency(inv.total_amount)}</strong></div>
                    <div><span className="text-muted">Paid</span><br />{formatCurrency(inv.paid_amount)}</div>
                    <div><span className="text-muted">Balance</span><br /><strong style={{ color: remaining > 0 ? '#dc2626' : '#059669' }}>{formatCurrency(remaining)}</strong></div>
                    <div><span className="text-muted">Issued</span><br />{formatDate(inv.issued_date)}</div>
                    <div><span className="text-muted">Due</span><br />{formatDate(inv.due_date)}</div>
                  </div>
                  <div className="portal-invoice-detail-actions">
                    <button className="btn btn-ghost btn-sm"><Download size={14} /> Download PDF</button>
                    {['sent', 'overdue', 'partially_paid'].includes(inv.status) && (
                      <button className="btn btn-primary btn-sm" onClick={() => { setPayModal(inv); setPayAmount(remaining.toFixed(2)); setPayResult(null); }}>
                        <DollarSign size={14} /> Pay {formatCurrency(remaining)}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* Pay Modal */}
    {payModal && (
      <div className="modal-overlay" onClick={() => !paying && setPayModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
          <div className="modal-header"><h3>Make a Payment</h3><button className="btn btn-ghost btn-sm" onClick={() => !paying && setPayModal(null)}><X size={18} /></button></div>
          <div className="modal-body">
            {payResult?.success ? (
              <div style={{ textAlign: 'center', padding: '24px' }}><CheckCircle2 size={48} color="#059669" /><h3 style={{ marginTop: '12px', color: '#059669' }}>Payment Successful!</h3>
                <p className="text-muted">{formatCurrency(payResult.amount_paid)} applied to Invoice #{payModal.invoice_number}.</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setPayModal(null)}>Done</button>
              </div>
            ) : (<>
              <div style={{ marginBottom: '16px' }}><div className="text-sm text-muted">Invoice</div><div style={{ fontWeight: 600 }}>#{payModal.invoice_number}</div>
                <div className="text-sm" style={{ marginTop: '4px' }}><span className="text-muted">Remaining:</span> <strong style={{ color: '#dc2626' }}>{formatCurrency(payModal.total_amount - payModal.paid_amount)}</strong></div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}><label className="form-label">Payment Amount (CAD)</label>
                <input type="number" className="form-input" value={payAmount} onChange={e => setPayAmount(e.target.value)} min="0.01" step="0.01" style={{ fontSize: '18px', fontWeight: 600 }} disabled={paying} />
              </div>
              {payResult?.error && <div className="badge badge-red" style={{ display: 'block', padding: '8px', marginBottom: '12px', textAlign: 'center' }}>{payResult.error}</div>}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setPayModal(null)} disabled={paying}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePay} disabled={paying || !payAmount || parseFloat(payAmount) <= 0}>{paying ? 'Processing...' : `Pay ${formatCurrency(parseFloat(payAmount) || 0)}`}</button>
              </div>
            </>)}
          </div>
        </div>
      </div>
    )}
  </>);
}

function DocumentsTab({ docData, docSummary, docExpandedYear, setDocExpandedYear, docExpandedFolder, setDocExpandedFolder, showDocUpload, setShowDocUpload, docUploadTarget, setDocUploadTarget, docUploadFile, setDocUploadFile, docUploading, handleDocUpload }: any) {
  return (<>
    {/* Doc Summary KPIs */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
      <div className="kpi-card"><div className="kpi-icon blue"><FileText size={18} /></div><div className="kpi-label">Total</div><div className="kpi-value">{docSummary?.total_docs || 0}</div></div>
      <div className="kpi-card"><div className="kpi-icon green"><Shield size={18} /></div><div className="kpi-label">Permanent</div><div className="kpi-value">{docSummary?.permanent_count || 0}</div></div>
      <div className="kpi-card"><div className="kpi-icon yellow"><Clock size={18} /></div><div className="kpi-label">Pending</div><div className="kpi-value">{docSummary?.pending_approval || 0}</div></div>
      <div className="kpi-card"><div className="kpi-icon green"><CheckCircle2 size={18} /></div><div className="kpi-label">Approved</div><div className="kpi-value">{docSummary?.approved || 0}</div></div>
      <div className="kpi-card"><div className="kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertCircle size={18} /></div><div className="kpi-label">Rejected</div><div className="kpi-value">{docSummary?.rejected || 0}</div></div>
    </div>

    {/* Permanent Documents */}
    <div className="card" style={{ marginBottom: '16px' }}>
      <div className="card-header" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))' }} onClick={() => setDocExpandedYear(docExpandedYear === 'Permanent' ? null : 'Permanent')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} /></div>
          <div><h3 style={{ margin: 0 }}>Permanent Documents</h3><span className="text-xs text-muted">IDs, Registration Certificates, &amp; Non-Year-Specific Files</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-blue">{docData?.permanentDocs?.length || 0} files</span>
          <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setDocUploadTarget({ category: 'permanent', year: 'Permanent', label: 'Permanent Documents' }); setShowDocUpload(true); }}><Upload size={14} /> Upload</button>
          <ChevronDown size={18} style={{ transform: docExpandedYear === 'Permanent' ? 'rotate(180deg)' : 'none', transition: '0.2s', color: 'var(--color-gray-400)' }} />
        </div>
      </div>
      {docExpandedYear === 'Permanent' && (
        <div className="card-body" style={{ padding: 0 }}>
          {(!docData?.permanentDocs?.length) ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-400)' }}><Shield size={36} style={{ marginBottom: 8 }} /><p>No permanent documents uploaded yet.</p></div>
          ) : (
            <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}><table className="data-table"><thead><tr><th>Document</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{docData.permanentDocs.map((d: any) => (
                <tr key={d.id}><td><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} style={{ color: 'var(--color-primary)' }} />{d.file_name}</div></td>
                  <td className="text-sm">{formatDate(d.created_at)}</td>
                  <td>{d.approval_status === 'APPROVED' ? <span className="badge badge-green">Approved</span> : d.approval_status === 'REJECTED' ? <span className="badge badge-red">Rejected</span> : <span className="badge badge-yellow">Pending</span>}</td>
                  <td><a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-icon"><Download size={14} /></a></td>
                </tr>
              ))}</tbody></table></div>
          )}
        </div>
      )}
    </div>

    {/* Year-wise Folders */}
    {(docData?.yearFolders || []).map((yf: any) => (
      <div key={yf.year} className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setDocExpandedYear(docExpandedYear === yf.year ? null : yf.year)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{yf.year.slice(-2)}</div>
            <div><h3 style={{ margin: 0 }}>FY {yf.year}</h3><span className="text-xs text-muted">Compliance documents for financial year {yf.year}</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-gray">{yf.total} files</span>
            <ChevronDown size={18} style={{ transform: docExpandedYear === yf.year ? 'rotate(180deg)' : 'none', transition: '0.2s', color: 'var(--color-gray-400)' }} />
          </div>
        </div>
        {docExpandedYear === yf.year && (
          <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(yf.subfolders).map(([key, sf]: [string, any]) => (
              <div key={key} style={{ border: '1px solid var(--color-gray-200)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--color-gray-50)', cursor: 'pointer' }} onClick={() => setDocExpandedFolder(docExpandedFolder === `${yf.year}-${key}` ? null : `${yf.year}-${key}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FolderOpen size={16} style={{ color: key === 'onboarding' ? '#f59e0b' : key === 'client_provided' ? '#3b82f6' : '#10b981' }} /><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sf.label}</span><span className="badge badge-gray" style={{ fontSize: 10 }}>{sf.docs.length}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setDocUploadTarget({ category: key === 'onboarding' ? 'onboarding' : key === 'client_provided' ? 'client_supporting' : 'final_document', year: yf.year, label: `${sf.label} — FY ${yf.year}` }); setShowDocUpload(true); }}><Upload size={14} /> Upload</button>
                    <ChevronDown size={16} style={{ transform: docExpandedFolder === `${yf.year}-${key}` ? 'rotate(180deg)' : 'none', transition: '0.15s', color: 'var(--color-gray-400)' }} />
                  </div>
                </div>
                {docExpandedFolder === `${yf.year}-${key}` && (
                  sf.docs.length === 0 ? <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '0.875rem' }}>No documents in this folder yet.</div>
                  : <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}><table className="data-table text-sm"><thead><tr><th>Document</th><th>Uploaded</th><th>Approval</th><th>Actions</th></tr></thead>
                      <tbody>{sf.docs.map((d: any) => (
                        <tr key={d.id}><td><div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={14} style={{ color: 'var(--color-primary)' }} />{d.file_name}</div></td>
                          <td className="text-sm">{formatDate(d.created_at)}</td>
                          <td>{d.approval_status === 'APPROVED' ? <span className="badge badge-green">Approved</span> : d.approval_status === 'REJECTED' ? <span className="badge badge-red">Rejected</span> : <span className="badge badge-yellow">Pending</span>}</td>
                          <td><a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-icon"><Download size={14} /></a></td>
                        </tr>
                      ))}</tbody></table></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ))}

    {/* Upload Modal */}
    {showDocUpload && (
      <div className="modal-overlay" onClick={() => !docUploading && setShowDocUpload(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
          <div className="modal-header"><h3>Upload Document</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowDocUpload(false)}><X size={18} /></button></div>
          <div className="modal-body">
            <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>Uploading to: <strong>{docUploadTarget.label}</strong></p>
            <div className="form-group"><label className="form-label">Select File</label>
              <input type="file" className="form-input" onChange={e => setDocUploadFile(e.target.files?.[0] || null)} />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-ghost" onClick={() => setShowDocUpload(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDocUpload} disabled={!docUploadFile || docUploading}>{docUploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>);
}

function OtherInfoTab({ client, personalInfo, contacts }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {/* Contact Info */}
      <div className="card"><div className="card-body">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Mail size={18} /> Contact Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Mail size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">Email</div><div>{client.primary_email || '—'}</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Phone size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">Phone</div><div>{client.primary_phone || '—'}</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><MapPin size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">Address</div><div>{client.city && client.province ? `${client.city}, ${client.province} ${client.postal_code || ''}` : '—'}</div></div></div>
        </div>
      </div></div>

      {/* Personal Details */}
      <div className="card"><div className="card-body">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Shield size={18} /> Personal Details</h3>
        {personalInfo?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {personalInfo.map((info: any) => (
              <div key={info.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Calendar size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">{info.info_key}</div><div>{info.info_value}</div></div></div>
            ))}
          </div>
        ) : <p className="text-muted text-sm">No personal details on file.</p>}
      </div></div>

      {/* Associated Contacts */}
      {contacts?.length > 0 && (
        <div className="card" style={{ gridColumn: 'span 2' }}><div className="card-body">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Users size={18} /> Associated Contacts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contacts.map((c: any) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>{c.contact_name?.substring(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.contact_name} {c.is_primary ? <span className="badge badge-blue" style={{ marginLeft: 4 }}>Primary</span> : null}</div>
                  <div className="text-sm text-muted">{c.relationship && `${c.relationship} · `}{c.email || ''}{c.phone && ` · ${c.phone}`}</div>
                </div>
                {c.can_login && <span className="badge badge-green">Can Login</span>}
              </div>
            ))}
          </div>
        </div></div>
      )}

      {/* Firm Contact */}
      <div className="card" style={{ gridColumn: 'span 2' }}><div className="card-body">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Building2 size={18} /> Your Firm</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Building2 size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">Firm Name</div><div>Taxccount Advisory</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Phone size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">Phone</div><div>(555) 123-4567</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Mail size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">Email</div><div>contact@taxccount.ca</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><MapPin size={16} style={{ color: 'var(--color-gray-400)' }} /><div><div className="text-xs text-muted">Address</div><div>123 Finance Way, Suite 400, Toronto, ON M5V 3L9</div></div></div>
        </div>
      </div></div>
    </div>
  );
}
