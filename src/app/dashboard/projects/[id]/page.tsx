'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, Clock, PlayCircle, AlertTriangle, FileText, Upload, RotateCcw, Pencil, Trash2, Settings } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const _router = useRouter();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('stages');
  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [showSendBackModal, setShowSendBackModal] = useState<string | null>(null);
  const [sendBackNote, setSendBackNote] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [teams, setTeams] = useState<any[]>([]);
  const [smartForms, setSmartForms] = useState<any[]>([]);

  function loadProject() {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(setData).catch(console.error);
  }

  useEffect(() => { loadProject(); }, [id]);
  useEffect(() => { 
    fetch('/api/teams').then(r => r.json()).then(d => setTeams(d.teams || [])).catch(() => {}); 
    fetch('/api/smart-forms').then(r => r.json()).then(d => setSmartForms(d || [])).catch(() => {});
  }, []);

  function openEditModal() {
    const p = data?.project;
    const currentAssignments = data?.assignments || [];
    if (!p) return;
    setEditForm({ 
      due_date: p.due_date?.split('T')[0] || '', 
      price: p.price || 0, 
      priority: p.priority || 'medium', 
      financial_year: p.financial_year || '', 
      assigned_team_id: p.assigned_team_id || '', 
      notes: p.notes || '',
      smart_form_ids: currentAssignments.map((a: any) => a.form_id)
    });
    setShowEditModal(true);
  }

  async function handleEditProject(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit_metadata', ...editForm }),
    });
    setShowEditModal(false);
    loadProject();
  }

  async function handleArchiveProject() {
    if (!confirm('Are you sure you want to archive this project? This action can be undone by an admin.')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    _router.push('/dashboard/projects');
  }

  async function transitionStage(stageId: string, newStatus: string) {
    setTransitioning(stageId);
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transition_stage', stage_id: stageId, new_status: newStatus }),
    });
    loadProject();
    setTransitioning(null);
  }

  async function submitSendBack(e: React.FormEvent) {
    e.preventDefault();
    if (!showSendBackModal || !sendBackNote.trim()) return;
    setTransitioning(showSendBackModal);
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transition_stage', stage_id: showSendBackModal, new_status: 'send_back', note: sendBackNote }),
    });
    setShowSendBackModal(null);
    setSendBackNote('');
    loadProject();
    setTransitioning(null);
  }

  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading project...</div>;

  const { project, stages, documents, checklist, assignments = [] } = data;
  const completedStages = stages.filter((s: any) => s.status === 'completed').length;
  const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;


  function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

  const stageIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />;
    if (status === 'in_progress') return <PlayCircle size={20} style={{ color: 'var(--color-primary)' }} />;
    if (status === 'blocked') return <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />;
    return <Circle size={20} style={{ color: 'var(--color-gray-300)' }} />;
  };

  const _groupLabels: Record<string, string> = {
    onboarding: 'Onboarding',
    work_in_progress: 'Work in Progress',
    invoicing: 'Invoicing',
    completed: 'Completion',
  };

  return (
    <>
      <Link href="/dashboard/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Project Header */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{project.template_name}</h1>
                <span className={`badge ${project.status === 'completed' ? 'badge-green' : project.status === 'new' ? 'badge-gray' : 'badge-blue'}`}>
                  <span className="badge-dot"></span>{project.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-muted">
                <Link href={`/dashboard/clients/${project.client_id}`} style={{ color: 'var(--color-primary)' }}>{project.client_name}</Link>
                {' '} · {project.engagement_code} · FY {project.financial_year}
              </p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
              <div>
                <div className="text-sm text-muted">Due Date</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{formatDate(project.due_date)}</div>
                <div className="text-sm text-muted" style={{ marginTop: 'var(--space-1)' }}>Price: {formatCurrency(project.price || 0)}</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-secondary btn-sm" onClick={openEditModal}><Pencil size={14} /> Edit</button>
                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} onClick={handleArchiveProject}><Trash2 size={14} /> Archive</button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="text-sm text-muted">Progress</span>
            <div style={{ flex: 1, height: 8, background: 'var(--color-gray-200)', borderRadius: 4 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)', borderRadius: 4, transition: 'width 0.5s ease' }}></div>
            </div>
            <span className="text-sm" style={{ fontWeight: 600 }}>{progress}%</span>
            <span className="text-xs text-muted">({completedStages}/{stages.length} stages)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['stages', 'documents', 'forms', 'activity'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'stages' ? 'Workflow Stages' : t === 'documents' ? `Documents (${documents.length})` : t === 'forms' ? `Smart Forms (${assignments.length})` : 'Activity'}
          </button>
        ))}
      </div>

      {/* Stages Tab */}
      {tab === 'stages' && (
        <div className="card" style={{ padding: 0 }}>
          {/* Visual Stage Pipeline */}
          <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div className="text-xs text-muted" style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>STAGE PIPELINE</div>
            <div style={{ display: 'flex', gap: 2, height: 8, borderRadius: 4, overflow: 'hidden' }}>
              {[...stages].sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((s: any) => (
                <div key={s.id} title={`${s.stage_name}: ${s.status}`} style={{
                  flex: 1, height: '100%',
                  background: s.status === 'completed' ? 'var(--color-success)' : s.status === 'in_progress' ? '#6366f1' :
                    (s.due_date && new Date(s.due_date) < new Date() && s.status !== 'completed') ? 'var(--color-danger)' : 'var(--color-gray-200)',
                }}></div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {[...stages].sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((s: any) => (
                <span key={s.id} className="text-xs" style={{
                  flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 500,
                  color: s.status === 'completed' ? 'var(--color-success)' : s.status === 'in_progress' ? '#6366f1' : 'var(--color-gray-400)'
                }}>{s.stage_name}</span>
              ))}
            </div>
          </div>

          {/* Stages Table */}
          <div className="data-table-wrapper" style={{ border: 'none', margin: 0 }}>
            <table className="data-table text-sm">
              <thead><tr><th>#</th><th>Stage</th><th>Assigned</th><th>Status</th><th>Dates</th><th>Actions</th></tr></thead>
              <tbody>
                {[...stages].sort((a: any, b: any) => a.sequence_order - b.sequence_order).map((stage: any, i: number) => {
                  return (
                    <tr key={stage.id} style={{ background: stage.status === 'in_progress' ? 'rgba(99,102,241,0.03)' : 'transparent' }}>
                      <td className="text-xs text-muted">{stage.sequence_order || i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{stage.stage_name}</td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{stage.assigned_name || 'Unassigned'}</span>
                      </td>
                      <td>
                        <span className={`badge ${stage.status === 'completed' ? 'badge-green' : stage.status === 'in_progress' ? 'badge-blue' : stage.status === 'blocked' ? 'badge-red' : 'badge-gray'}`}>
                          <span className="badge-dot"></span>{stage.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs text-muted">{stage.started_at ? `Started: ${formatDate(stage.started_at)}` : '—'}</div>
                        {stage.completed_at && <div className="text-xs text-muted">Done: {formatDate(stage.completed_at)}</div>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          {stage.status === 'pending' && i > 0 && [...stages].sort((a: any, b: any) => a.sequence_order - b.sequence_order)[i - 1]?.status === 'completed' && (
                            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); transitionStage(stage.id, 'in_progress'); }}
                              disabled={transitioning === stage.id}>
                              {transitioning === stage.id ? '...' : 'Start'}
                            </button>
                          )}
                          {stage.status === 'in_progress' && (
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                              {i > 0 && (
                                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); setShowSendBackModal(stage.id); }} disabled={transitioning === stage.id}>
                                  <RotateCcw size={14} style={{ marginRight: 4 }} /> Send Back
                                </button>
                              )}
                              <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); transitionStage(stage.id, 'completed'); }} disabled={transitioning === stage.id}>
                                {transitioning === stage.id ? '...' : 'Complete'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {tab === 'documents' && (
        <div className="card">
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Document Checklist</h3>
              <button className="btn btn-primary btn-sm" onClick={() => _router.push('/dashboard/documents')}><Upload size={16} /> Upload</button>
            </div>
            {checklist.length > 0 && (() => {
              const total = checklist.length;
              const required = checklist.filter((d: any) => d.is_mandatory).length;
              const uploaded = documents.length;
              const approvedOrNA = checklist.filter((d: any) => {
                const doc = documents.find((dd: any) => dd.template_doc_id === d.id);
                return doc && ['approved', 'not_applicable'].includes(doc.status);
              }).length;
              const requiredDone = checklist.filter((d: any) => {
                if (!d.is_mandatory) return true;
                const doc = documents.find((dd: any) => dd.template_doc_id === d.id);
                return doc && ['approved', 'not_applicable'].includes(doc.status);
              }).length;
              const pct = total > 0 ? Math.round((approvedOrNA / total) * 100) : 0;
              return (
                <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span className="text-sm" style={{ fontWeight: 500 }}>Documents: {approvedOrNA} of {total} completed</span>
                    <span className="text-sm" style={{ fontWeight: 500 }}>Required: {requiredDone} of {required} approved</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-gray-200)', borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary)', borderRadius: 3, transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {checklist.length > 0 ? (
              <div>
                {checklist.map((doc: any) => {
                  const uploaded = documents.find((d: any) => d.template_doc_id === doc.id);
                  const status = uploaded?.status || 'pending';
                  const statusColors: Record<string, string> = {
                    pending: 'badge-gray', uploaded: 'badge-blue', reviewed: 'badge-cyan',
                    approved: 'badge-green', rejected: 'badge-red', not_applicable: 'badge-gray'
                  };
                  const statusLabels: Record<string, string> = {
                    pending: 'Pending', uploaded: 'Uploaded', reviewed: 'Reviewed',
                    approved: 'Approved', rejected: 'Rejected', not_applicable: 'N/A'
                  };
                  return (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-gray-100)' }}>
                      {status === 'approved' ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      ) : status === 'not_applicable' ? (
                        <Circle size={18} style={{ color: 'var(--color-gray-300)', flexShrink: 0 }} />
                      ) : status === 'rejected' ? (
                        <AlertTriangle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                      ) : status === 'uploaded' || status === 'reviewed' ? (
                        <FileText size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      ) : (
                        <Circle size={18} style={{ color: doc.is_mandatory ? 'var(--color-danger)' : 'var(--color-gray-300)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{doc.document_name}</div>
                        <div className="text-xs text-muted">
                          {doc.document_category?.replace(/_/g, ' ')} · {doc.is_mandatory ? 'Required' : 'Optional'} · Upload by: {doc.upload_by}
                          {doc.linked_stage_code && ` · Stage: ${doc.linked_stage_code}`}
                        </div>
                      </div>
                      <span className={`badge ${statusColors[status] || 'badge-gray'}`}>
                        {statusLabels[status] || status}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        {status === 'pending' && (
                          <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={async () => {
                              if (!uploaded?.id) return;
                              await fetch(`/api/projects/${id}/documents`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_id: uploaded.id, status: 'uploaded' }) });
                              loadProject();
                            }}>Mark Uploaded</button>
                        )}
                        {status === 'uploaded' && (
                          <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={async () => {
                              await fetch(`/api/projects/${id}/documents`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_id: uploaded.id, status: 'reviewed' }) });
                              loadProject();
                            }}>Review</button>
                        )}
                        {(status === 'reviewed' || status === 'uploaded') && (
                          <>
                            <button className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: '2px 8px', background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                              onClick={async () => {
                                await fetch(`/api/projects/${id}/documents`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_id: uploaded.id, status: 'approved' }) });
                                loadProject();
                              }}>Approve</button>
                            <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '2px 8px', color: 'var(--color-danger)' }}
                              onClick={async () => {
                                await fetch(`/api/projects/${id}/documents`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_id: uploaded.id, status: 'rejected' }) });
                                loadProject();
                              }}>Reject</button>
                          </>
                        )}
                        {status !== 'not_applicable' && status !== 'approved' && (
                          <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={async () => {
                              const docId = uploaded?.id;
                              if (!docId) return;
                              await fetch(`/api/projects/${id}/documents`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_id: docId, status: 'not_applicable' }) });
                              loadProject();
                            }}>N/A</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <FileText size={48} />
                <h3>No document checklist</h3>
                <p>This compliance template has no document requirements defined.</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Smart Forms Tab */}
      {tab === 'forms' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Assigned Smart Forms</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {assignments.length > 0 ? (
              <div className="data-table-wrapper" style={{ border: 'none', margin: 0 }}>
                <table className="data-table text-sm">
                  <thead>
                    <tr>
                      <th>Form Name</th>
                      <th>Status</th>
                      <th>Assigned Date</th>
                      <th>Completed Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a: any) => {
                      return (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600 }}>{a.form_name}</td>
                          <td>
                            <span className={`badge ${
                              a.status === 'Completed' ? 'badge-green' :
                              a.status === 'Under review' ? 'badge-blue' :
                              a.status === 'Needs revision' ? 'badge-red' :
                              a.status === 'In progress' ? 'badge-yellow' : 'badge-gray'
                            }`}>
                              <span className="badge-dot"></span>{a.status}
                            </span>
                          </td>
                          <td>{formatDate(a.assigned_at)}</td>
                          <td>{a.completed_at ? formatDate(a.completed_at) : '—'}</td>
                          <td>
                            {a.status === 'Not started' ? (
                              <span className="text-muted text-xs">Awaiting client start</span>
                            ) : (
                              <Link href={`/dashboard/smart-forms/responses/${a.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                Review Answers <ArrowRight size={14} />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <FileText size={48} />
                <h3>No assigned smart forms</h3>
                <p>There are no smart forms assigned to this compliance project.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {tab === 'activity' && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <Clock size={48} />
              <h3>Activity Log</h3>
              <p>Stage transitions and actions will be logged here.</p>
            </div>
          </div>
        </div>
      )}

      {/* Send Back Modal */}
      {showSendBackModal && (
        <div className="modal-overlay" onClick={() => setShowSendBackModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Send Back to Previous Stage</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSendBackModal(null)}>✕</button>
            </div>
            <form onSubmit={submitSendBack}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-danger)' }}>Mandatory Note *</label>
                  <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-2)' }}>Please explain why this stage is being sent back to the previous assignee.</p>
                  <textarea className="form-input" required rows={3} value={sendBackNote} onChange={e => setSendBackNote(e.target.value)} placeholder="e.g., Missing forms, corrections needed..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSendBackModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} disabled={transitioning === showSendBackModal}>Confirm Send Back</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2><Settings size={20} /> Edit Project Settings</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditProject}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input className="form-input" type="date" value={editForm.due_date} onChange={e => setEditForm({...editForm, due_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input className="form-input" type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Financial Year</label>
                    <input className="form-input" value={editForm.financial_year} onChange={e => setEditForm({...editForm, financial_year: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Team</label>
                  <select className="form-select" value={editForm.assigned_team_id} onChange={e => setEditForm({...editForm, assigned_team_id: e.target.value})}>
                    <option value="">No Team</option>
                    {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label mb-2">Data Collection (Smart Forms)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-gray-200)', borderRadius: '6px', padding: '10px' }}>
                    {smartForms.map(sf => {
                      const isSelected = (editForm.smart_form_ids || []).includes(sf.id);
                      return (
                        <label key={sf.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const currentIds = editForm.smart_form_ids || [];
                              if (checked) {
                                setEditForm({...editForm, smart_form_ids: [...currentIds, sf.id]});
                              } else {
                                setEditForm({...editForm, smart_form_ids: currentIds.filter((id: string) => id !== sf.id)});
                              }
                            }}
                          />
                          <span>{sf.name} <span className="text-muted text-xs">({sf.country || 'Global'})</span></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows={2} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} placeholder="Internal notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
