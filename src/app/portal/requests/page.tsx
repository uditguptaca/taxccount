'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, Circle, AlertCircle, MessageSquare, Clock, Plus, BellRing } from 'lucide-react';

export default function PortalRequests() {
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
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1><ClipboardList size={28} /> Tasks & Reminders</h1>
          <p className="text-muted">Manage firm requests and your personal compliance reminders.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[#e2e8f0] mb-6">
        <button 
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-[#2563eb] text-[#1e293b]' : 'border-transparent text-[#64748b] hover:text-[#0f172a]'}`}
          onClick={() => setActiveTab('tasks')}
        >
          Firm Requests ({pendingTasks.length} pending)
        </button>
        <button 
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'reminders' ? 'border-[#2563eb] text-[#1e293b]' : 'border-transparent text-[#64748b] hover:text-[#0f172a]'}`}
          onClick={() => setActiveTab('reminders')}
        >
          My Private Reminders ({reminders.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
          <div className="portal-tasks-stats">
            <div className="portal-tasks-stat" onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }}>
              <div className="portal-tasks-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Circle size={20} />
              </div>
              <div>
                <div className="portal-tasks-stat-value">{pendingTasks.length}</div>
                <div className="portal-tasks-stat-label">Pending</div>
              </div>
            </div>
            <div className="portal-tasks-stat" onClick={() => setFilter('completed')} style={{ cursor: 'pointer' }}>
              <div className="portal-tasks-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="portal-tasks-stat-value">{completedTasks.length}</div>
                <div className="portal-tasks-stat-label">Completed</div>
              </div>
            </div>
            <div className="portal-tasks-stat" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
              <div className="portal-tasks-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <div className="portal-tasks-stat-value">{tasks.length}</div>
                <div className="portal-tasks-stat-label">Total</div>
              </div>
            </div>
          </div>

          <div className="portal-doc-tabs" style={{ marginBottom: 'var(--space-6)' }}>
            <button className={`portal-doc-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
              Pending {pendingTasks.length > 0 && <span className="portal-doc-tab-badge">{pendingTasks.length}</span>}
            </button>
            <button className={`portal-doc-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
              Completed ({completedTasks.length})
            </button>
            <button className={`portal-doc-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All
            </button>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="portal-doc-empty">
              <CheckCircle2 size={48} />
              <h3>{filter === 'pending' ? 'No pending tasks!' : 'No tasks found'}</h3>
              <p>{filter === 'pending' ? 'You\'re all caught up. We\'ll notify you when new tasks arrive.' : 'Try changing the filter.'}</p>
            </div>
          ) : (
            <div className="portal-task-list-full">
              {displayedTasks.map((task: any) => (
                <div key={task.id} className={`portal-task-card ${task.is_completed ? 'completed' : ''}`}>
                  <button
                    className={`portal-task-check ${task.is_completed ? 'checked' : ''}`}
                    onClick={() => toggleTask(task.id, !task.is_completed)}
                  >
                    {task.is_completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <div className="portal-task-card-info">
                    <span className={`portal-task-card-name ${task.is_completed ? 'done' : ''}`}>{task.task_name}</span>
                    <span className="portal-task-card-meta">
                      {task.thread_subject && <><MessageSquare size={12} /> {task.thread_subject}</>}
                      {task.template_name && <> · {task.template_name}</>}
                      {task.financial_year && <> · FY {task.financial_year}</>}
                    </span>
                  </div>
                  {!task.is_completed && <span className="badge badge-yellow">Pending</span>}
                  {task.is_completed && <span className="badge badge-green">Done</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#0f172a]">Private Reminders</h2>
            <button 
              onClick={() => setIsCreatingReminder(true)}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 500 }}
            >
              <Plus size={16} style={{ marginRight: '0.5rem' }} /> New Reminder
            </button>
          </div>
          <p className="text-sm text-[#64748b]">Set personal reminders for tax deductions, missing receipts, etc. The firm cannot see these.</p>

          {isCreatingReminder && (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">Reminder Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newReminder.title}
                  onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                  placeholder="E.g., Track down Amazon receipt for laptop"
                  className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563eb] outline-none"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#334155] mb-1">Trigger Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={newReminder.trigger_date}
                    onChange={e => setNewReminder({...newReminder, trigger_date: e.target.value})}
                    className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563eb] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">Notes (Optional)</label>
                <textarea 
                  value={newReminder.message}
                  onChange={e => setNewReminder({...newReminder, message: e.target.value})}
                  rows={2}
                  className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563eb] outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={createReminder}
                  className="bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1e293b]"
                >
                  Save Reminder
                </button>
                <button 
                  onClick={() => setIsCreatingReminder(false)}
                  className="bg-white border border-[#cbd5e1] text-[#334155] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f1f5f9]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {reminders.length === 0 && !isCreatingReminder ? (
             <div className="portal-doc-empty">
              <BellRing size={48} />
              <h3>No private reminders</h3>
              <p>Create personal trackers for expenses, receipts, or other tax items.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reminders.map(r => (
                <div key={r.id} className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm flex items-start gap-4">
                  <div className="bg-[#eff6ff] text-[#2563eb] p-3 rounded-lg mt-1">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0f172a] text-base">{r.title}</h4>
                    <p className="text-sm text-[#64748b] mt-1">{r.message}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="bg-[#f1f5f9] text-[#475569] text-xs font-medium px-2.5 py-1 rounded">
                        Due: {new Date(r.trigger_date).toLocaleDateString()}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded ${r.status === 'pending' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-[#d1fae5] text-[#059669]'}`}>
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
