'use client';
import { useEffect, useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function daysUntil(d: string) { if (!d) return null; return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [loading, setLoading] = useState(true);

  // New Project Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [projectForm, setProjectForm] = useState({ client_id: '', template_id: '', financial_year: new Date().getFullYear().toString(), due_date: '', priority: 'medium', assigned_team_id: '', notes: '' });

  const loadData = () => {
    fetch('/api/projects').then(r => r.json()).then(d => { 
      setProjects(d.projects || []); 
      setClients(d.clients || []);
      setTeams(d.teams || []);
      setLoading(false); 
    });
    fetch('/api/templates').then(r => r.json()).then(d => {
      setTemplates(Array.isArray(d) ? d : []);
    });
  };

  useEffect(() => { loadData(); }, []);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectForm)
    });
    setShowNewModal(false);
    setProjectForm({ client_id: '', template_id: '', financial_year: new Date().getFullYear().toString(), due_date: '', priority: 'medium', assigned_team_id: '', notes: '' });
    loadData();
  }

  const activeProjects = filter === 'all' ? projects : projects.filter((p: any) => p.status === filter);
  const filtered = templateFilter === 'all' ? activeProjects : activeProjects.filter((p: any) => p.template_id === templateFilter);

  const counts: any = {
    all: projects.length,
    new: projects.filter((p: any) => p.status === 'new').length,
    in_progress: projects.filter((p: any) => p.status === 'in_progress').length,
    blocked: projects.filter((p: any) => p.status === 'blocked').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
  };

  // If a specific template is selected, use its exact stages. Otherwise, use high-level groups.
  const activeTemplate = templates.find(t => t.id === templateFilter);
  
  const kanbanColumns = activeTemplate && activeTemplate.stages ? 
    activeTemplate.stages.map((s: any) => ({
      key: s.stage_code,
      label: s.stage_name,
      color: s.stage_group === 'onboarding' ? 'var(--color-info)' : 
             s.stage_group === 'invoicing' ? 'var(--color-warning)' : 
             s.stage_group === 'completed' ? 'var(--color-success)' : 'var(--color-primary)'
    })) : [
    { key: 'onboarding', label: 'Onboarding', color: 'var(--color-info)' },
    { key: 'work_in_progress', label: 'Work in Progress', color: 'var(--color-primary)' },
    { key: 'invoicing', label: 'Invoicing', color: 'var(--color-warning)' },
    { key: 'completed', label: 'Completed', color: 'var(--color-success)' },
  ];

  const getStageKey = (p: any) => {
    if (activeTemplate) {
      return p.current_stage_code || p.current_stage;
    }
    const stageCode = (p.current_stage_code || p.current_stage || '').toUpperCase();
    if (['NEW_LEAD', 'ONBOARDING', 'LEAD'].includes(stageCode)) return 'onboarding';
    if (['BILLING', 'PAYMENT_RECEIVED'].includes(stageCode)) return 'invoicing';
    if (['FINAL_FILING', 'DOC_CHECKLIST', 'COMPLETED'].includes(stageCode) || p.status === 'completed') return 'completed';
    return 'work_in_progress';
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Projects</h1><p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>All compliance engagements across clients</p></div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={14} /> List</button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><LayoutGrid size={14} /> Board</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewModal(true)}><LayoutGrid size={18} /> New Project</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'new', label: 'New' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'blocked', label: 'Blocked/Waiting' },
          { key: 'completed', label: 'Completed' },
        ].map(f => (
          <button key={f.key} className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f.key)}>
            {f.label} ({counts[f.key]})
          </button>
        ))}
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="text-sm text-muted">Pipeline:</span>
          <select className="form-select input-sm" style={{ width: 200 }} value={templateFilter} onChange={e => setTemplateFilter(e.target.value)}>
            <option value="all">High-level Groups</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {view === 'list' ? (
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Client</th><th>Compliance</th><th>Year</th><th>Progress</th><th>Current Stage</th><th>Assigned To</th><th>Team</th><th>Due Date</th><th>Price</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => {
                  const days = daysUntil(p.due_date);
                  const progress = p.stages_total > 0 ? Math.round((p.stages_completed / p.stages_total) * 100) : 0;
                  return (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/projects/${p.id}`}>
                      <td><span className="client-name">{p.client_name}</span><br /><span className="text-xs text-muted">{p.client_code}</span></td>
                      <td><span className="badge badge-cyan">{p.template_code}</span><br /><span className="text-xs text-muted">{p.engagement_code}</span></td>
                      <td className="text-sm">{p.financial_year}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--color-gray-200)', borderRadius: 3, minWidth: 60 }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }}></div>
                          </div>
                          <span className="text-xs text-muted">{progress}%</span>
                        </div>
                      </td>
                      <td className="text-sm">{p.current_stage || '—'}</td>
                      <td className="text-sm">{p.assigned_to || '—'}</td>
                      <td className="text-sm">{p.team_name || '—'}</td>
                      <td>
                        <span className="text-sm">{formatDate(p.due_date)}</span>
                        {days !== null && days < 0 && <><br /><span className="badge badge-red" style={{ fontSize: 10 }}>Overdue</span></>}
                        {days !== null && days >= 0 && days <= 7 && <><br /><span className="badge badge-yellow" style={{ fontSize: 10 }}>{days}d left</span></>}
                      </td>
                      <td className="text-sm">{formatCurrency(p.price || 0)}</td>
                      <td>
                        <span className={`badge ${p.status === 'completed' ? 'badge-green' : p.status === 'blocked' ? 'badge-yellow' : p.status === 'new' ? 'badge-gray' : 'badge-blue'}`}>
                          <span className={`badge-dot ${p.status === 'blocked' && 'bg-yellow-500'}`}></span>{p.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={10} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No projects found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="kanban-board">
          {kanbanColumns.map((col: any) => {
            const items = filtered.filter(p => getStageKey(p) === col.key);
            return (
              <div key={col.key} className="kanban-column">
                <div className="kanban-header">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }}></span>
                    {col.label}
                  </h4>
                  <span className="kanban-count">{items.length}</span>
                </div>
                <div className="kanban-cards">
                  {items.map(p => {
                    const days = daysUntil(p.due_date);
                    return (
                      <div key={p.id} className="kanban-card" onClick={() => window.location.href = `/dashboard/projects/${p.id}`}>
                        <div className="kanban-card-header">
                          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{p.template_code}</span>
                          <span className={`badge ${p.priority === 'urgent' ? 'badge-red' : p.priority === 'high' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '10px' }}>
                            {p.priority || 'medium'}
                          </span>
                          {p.status === 'blocked' && (
                            <span className="badge badge-yellow" style={{ fontSize: '10px', marginLeft: 4 }}>Blocked</span>
                          )}
                        </div>
                        <div className="kanban-card-title">{p.client_name}</div>
                        <div className="kanban-card-client">{p.current_stage || p.engagement_code}</div>
                        <div className="kanban-card-footer">
                          <span className="text-xs text-muted">
                            {days !== null && days < 0 ? <span style={{ color: 'var(--color-danger)' }}>Overdue {Math.abs(days)}d</span> :
                             days !== null ? `${days}d left` : '—'}
                          </span>
                          {p.assigned_to && (
                            <div className="kanban-avatar">{p.assigned_to.split(' ').map((n: string) => n[0]).join('')}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="client_id" className="form-label">Client *</label>
                    <select id="client_id" className="form-select" required value={projectForm.client_id} onChange={e => setProjectForm({...projectForm, client_id: e.target.value})}>
                      <option value="">Select a client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.display_name} ({c.client_code})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="financial_year" className="form-label">Tax / Financial Year *</label>
                    <input id="financial_year" className="form-input" type="number" required value={projectForm.financial_year} onChange={e => setProjectForm({...projectForm, financial_year: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="template_id" className="form-label">Compliance Template *</label>
                  <select id="template_id" className="form-select" required value={projectForm.template_id} onChange={e => setProjectForm({...projectForm, template_id: e.target.value})}>
                    <option value="">Select a template</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="due_date" className="form-label">Due Date *</label>
                    <input id="due_date" className="form-input" type="date" required value={projectForm.due_date} onChange={e => setProjectForm({...projectForm, due_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select id="priority" className="form-select" value={projectForm.priority} onChange={e => setProjectForm({...projectForm, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="assigned_team_id" className="form-label">Assigned Team</label>
                  <select id="assigned_team_id" className="form-select" value={projectForm.assigned_team_id} onChange={e => setProjectForm({...projectForm, assigned_team_id: e.target.value})}>
                    <option value="">Unassigned</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Notes</label>
                  <textarea className="form-input" value={projectForm.notes} onChange={e => setProjectForm({...projectForm, notes: e.target.value})} placeholder="Initial guidance or context..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
