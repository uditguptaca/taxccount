'use client';
import { useEffect, useState } from 'react';
import { List, LayoutGrid, FolderKanban, ChevronDown, ExternalLink, ArrowRight } from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function daysUntil(d: string) { if (!d) return null; return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // New Project Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [projectForm, setProjectForm] = useState({ client_id: '', template_id: '', financial_year: new Date().getFullYear().toString(), due_date: '', priority: 'medium', assigned_team_id: '', notes: '' });

  const loadData = () => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => { 
        setProjects(d.projects || []); 
        setClients(d.clients || []);
        setTeams(d.teams || []);
        setLoading(false); 
      })
      .catch(err => {
        console.error("Failed to load projects:", err);
        setLoading(false);
      });

    fetch('/api/templates')
      .then(r => r.json())
      .then(d => {
        setTemplates(Array.isArray(d.templates) ? d.templates : []);
      })
      .catch(err => {
        console.error("Failed to load templates:", err);
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

  const handleDragStart = (e: React.DragEvent, project: any) => {
    setDraggedItem(project);
    e.dataTransfer.effectAllowed = 'move';
    // Small timeout to allow the drag image to generate before setting dragging state
    setTimeout(() => {
      const el = e.target as HTMLElement;
      el.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.target as HTMLElement;
    el.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Optimistic update
    const updatedProjects = projects.map(p => {
      if (p.id === draggedItem.id) {
        // Simple mapping for high-level groups
        let newStatus = p.status;
        if (templateFilter === 'all') {
             if (columnKey === 'completed') newStatus = 'completed';
             else if (columnKey === 'onboarding') newStatus = 'new';
             else newStatus = 'in_progress';
        }
        return { ...p, current_stage_code: columnKey, status: newStatus };
      }
      return p;
    });
    setProjects(updatedProjects);

    // Call API
    try {
      await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: draggedItem.id, new_stage: columnKey, template_filter: templateFilter })
      });
      loadData(); // Re-sync with server
    } catch (error) {
      console.error("Drop save failed", error);
      loadData(); // Rollback on error
    }
  };


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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
              <FolderKanban size={40} style={{ marginBottom: 8, marginInline: 'auto' }} />
              <h3>No projects found</h3>
              <p className="text-sm">There are no projects matching your current filters.</p>
            </div>
          ) : (
            filtered.map((p: any) => {
              const overdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'completed';
              const daysLeft = p.due_date ? Math.ceil((new Date(p.due_date).getTime() - new Date().getTime()) / 86400000) : null;
              const progress = p.stages_total > 0 ? Math.round((p.stages_completed / p.stages_total) * 100) : 0;
              const priorityColor: Record<string, string> = { urgent: 'var(--color-danger)', high: '#f59e0b', medium: 'var(--color-primary)', low: 'var(--color-gray-400)' };
              const isExpanded = expandedProject === p.id;
              
              return (
                <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setExpandedProject(isExpanded ? null : p.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: overdue ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', color: overdue ? 'var(--color-danger)' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FolderKanban size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {p.template_name}
                          <span className="badge" style={{ fontSize: 9, background: `${priorityColor[p.priority] || priorityColor.medium}15`, color: priorityColor[p.priority] || priorityColor.medium, border: `1px solid ${priorityColor[p.priority] || priorityColor.medium}30` }}>{p.priority}</span>
                        </div>
                        <div className="text-xs text-muted">
                          <span style={{ color: 'var(--color-primary)' }}>{p.client_name}</span> · {p.engagement_code} · FY {p.financial_year}
                        </div>
                        <div className="text-xs" style={{ color: '#6366f1', fontWeight: 500, marginTop: 2 }}>Current: {p.current_stage || 'Not started'}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexShrink: 0 }}>
                      <div style={{ width: 140 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span className="text-xs text-muted">Progress</span>
                          <span className="text-xs" style={{ fontWeight: 600 }}>{progress}%</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: progress >= 100 ? 'var(--color-success)' : '#6366f1', borderRadius: 3, transition: 'width 0.5s' }}></div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right', width: 90 }}>
                        <div className="text-xs" style={{ fontWeight: 600, color: overdue ? 'var(--color-danger)' : daysLeft !== null && daysLeft <= 14 ? 'var(--color-warning)' : 'var(--color-gray-500)' }}>
                          {overdue ? 'OVERDUE' : daysLeft !== null && daysLeft === 0 ? 'Due Today' : daysLeft !== null ? `${daysLeft}d left` : '—'}
                        </div>
                        <div className="text-xs text-muted">{formatDate(p.due_date)}</div>
                      </div>
                      
                      <div style={{ width: 100, textAlign: 'center' }}>
                        <span className={`badge ${p.status === 'completed' ? 'badge-green' : p.status === 'blocked' ? 'badge-red' : p.status === 'new' ? 'badge-gray' : 'badge-blue'}`}>
                          <span className="badge-dot"></span>{p.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)', flexShrink: 0 }} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--color-gray-200)', background: 'var(--color-gray-50)' }}>
                      <div style={{ padding: 'var(--space-3) var(--space-5)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', borderBottom: '1px solid var(--color-gray-100)' }}>
                        <div><span className="text-xs text-muted">Client Account</span><div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/clients/${p.client_id}`}>{p.client_name} &rarr;</div><div className="text-xs text-muted">{p.client_code}</div></div>
                        <div><span className="text-xs text-muted">Total Value</span><div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{formatCurrency(p.price)}</div></div>
                        <div><span className="text-xs text-muted">Assigned Team</span><div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{p.team_name || '—'}</div></div>
                        <div><span className="text-xs text-muted">Current Assignee</span><div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{p.assigned_to || '—'}</div></div>
                        <div>
                          <span className="text-xs text-muted">Manage Setup</span><br />
                          <button className="btn btn-primary btn-sm" onClick={() => window.location.href = `/dashboard/projects/${p.id}`} style={{ marginTop: 2, padding: '4px 12px' }}>
                            View Project
                          </button>
                        </div>
                      </div>

                      {/* Visual Stage Pipeline */}
                      {p.stages && p.stages.length > 0 && (
                        <div style={{ padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--color-gray-100)' }}>
                          <div className="text-xs text-muted" style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>STAGE PIPELINE</div>
                          <div style={{ display: 'flex', gap: 2, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                            {[...p.stages].sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((s: any) => (
                              <div key={s.id} title={`${s.stage_name}: ${s.status}`} style={{
                                flex: 1, height: '100%',
                                background: s.status === 'completed' ? 'var(--color-success)' : s.status === 'in_progress' ? '#6366f1' :
                                  (s.due_date && new Date(s.due_date) < new Date() && s.status !== 'completed') ? 'var(--color-danger)' : 'var(--color-gray-200)',
                              }}></div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            {[...p.stages].sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((s: any) => (
                              <span key={s.id} className="text-xs" style={{
                                flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 500,
                                color: s.status === 'completed' ? 'var(--color-success)' : s.status === 'in_progress' ? '#6366f1' : 'var(--color-gray-400)'
                              }}>{s.stage_name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stages Mini-Table */}
                      {p.stages && p.stages.length > 0 && (
                        <div className="data-table-wrapper" style={{ border: 'none', margin: 0 }}>
                          <table className="data-table text-sm">
                            <thead><tr><th>#</th><th>Stage</th><th>Status</th><th>Started</th><th>Completed</th></tr></thead>
                            <tbody>
                              {[...p.stages].sort((a: any, b: any) => a.sequence_order - b.sequence_order).slice(0, 5).map((s: any) => (
                                <tr key={s.id} style={{ background: s.status === 'in_progress' ? 'rgba(99,102,241,0.03)' : 'transparent' }}>
                                  <td className="text-xs text-muted">{s.sequence_order}</td>
                                  <td style={{ fontWeight: 600 }}>{s.stage_name}</td>
                                  <td>
                                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: s.status === 'completed' ? 'var(--color-success-light)' : s.status === 'in_progress' ? 'var(--color-primary-light)' : 'var(--color-gray-100)', color: s.status === 'completed' ? 'var(--color-success)' : s.status === 'in_progress' ? 'var(--color-primary)' : 'var(--color-gray-600)' }}>
                                      {s.status.replace(/_/g, ' ')}
                                    </span>
                                  </td>
                                  <td className="text-xs">{formatDate(s.started_at)}</td>
                                  <td className="text-xs">{formatDate(s.completed_at)}</td>
                                </tr>
                              ))}
                              {p.stages.length > 5 && (
                                <tr>
                                  <td colSpan={5} className="text-center">
                                    <span className="text-xs text-muted">+{p.stages.length - 5} more stages. <a href={`/dashboard/projects/${p.id}`}>View full project</a></span>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="kanban-board">
          {kanbanColumns.map((col: any) => {
            const items = filtered.filter(p => getStageKey(p) === col.key);
            return (
              <div key={col.key} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.key)}>
                <div className="kanban-header">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }}></span>
                    {col.label}
                  </h4>
                  <span className="kanban-count">{items.length}</span>
                </div>
                <div className="kanban-cards">
                  {items.map((p: any) => {
                    const days = daysUntil(p.due_date);
                    return (
                      <div 
                        key={p.id} 
                        className="kanban-card" 
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, p)}
                        onDragEnd={handleDragEnd}
                        onClick={() => window.location.href = `/dashboard/projects/${p.id}`}
                      >
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
