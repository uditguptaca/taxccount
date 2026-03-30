'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, Clock, PlayCircle, AlertTriangle, FileText, Upload, RotateCcw } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const _router = useRouter();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('stages');
  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [showSendBackModal, setShowSendBackModal] = useState<string | null>(null);
  const [sendBackNote, setSendBackNote] = useState('');

  function loadProject() {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(setData);
  }

  useEffect(() => { loadProject(); }, [id]);

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

  const { project, stages, documents, checklist } = data;
  const completedStages = stages.filter((s: any) => s.status === 'completed').length;
  const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;

  function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n); }
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
            <div style={{ textAlign: 'right' }}>
              <div className="text-sm text-muted">Due Date</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{formatDate(project.due_date)}</div>
              <div className="text-sm text-muted" style={{ marginTop: 'var(--space-1)' }}>Price: {formatCurrency(project.price || 0)}</div>
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
        {['stages', 'documents', 'activity'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'stages' ? 'Workflow Stages' : t === 'documents' ? `Documents (${documents.length})` : 'Activity'}
          </button>
        ))}
      </div>

      {/* Stages Tab */}
      {tab === 'stages' && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {stages.map((stage: any, i: number) => {
              const _prevStage = i > 0 ? stages[i - 1] : null;
              const _showGroupHeader = i === 0 || stage.stage_code && stages[i]?.stage_code;
              return (
                <div key={stage.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)',
                  borderBottom: '1px solid var(--color-gray-100)',
                  background: stage.status === 'in_progress' ? 'var(--color-primary-50)' : 'transparent',
                  transition: 'background 0.2s'
                }}>
                  {/* Stage Icon */}
                  <div style={{ position: 'relative' }}>
                    {stageIcon(stage.status)}
                    {i < stages.length - 1 && (
                      <div style={{ position: 'absolute', left: '50%', top: 20, width: 2, height: 20, background: stage.status === 'completed' ? 'var(--color-success)' : 'var(--color-gray-200)', transform: 'translateX(-50%)' }}></div>
                    )}
                  </div>

                  {/* Stage Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', color: stage.status === 'pending' ? 'var(--color-gray-400)' : 'var(--color-gray-800)' }}>
                      {stage.stage_name}
                    </div>
                    <div className="text-xs text-muted">
                      {stage.assigned_name ? `Assigned: ${stage.assigned_name}` : 'Unassigned'}
                      {stage.started_at && ` · Started: ${formatDate(stage.started_at)}`}
                      {stage.completed_at && ` · Done: ${formatDate(stage.completed_at)}`}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`badge ${stage.status === 'completed' ? 'badge-green' : stage.status === 'in_progress' ? 'badge-blue' : stage.status === 'blocked' ? 'badge-red' : 'badge-gray'}`}>
                    {stage.status.replace('_', ' ')}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {stage.status === 'pending' && i > 0 && stages[i - 1]?.status === 'completed' && (
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); transitionStage(stage.id, 'in_progress'); }}
                        disabled={transitioning === stage.id}>
                        {transitioning === stage.id ? '...' : 'Start'}
                      </button>
                    )}
                    {stage.status === 'in_progress' && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {i > 0 && (
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); setShowSendBackModal(stage.id); }} disabled={transitioning === stage.id}>
                            <RotateCcw size={14} /> Send Back
                          </button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); transitionStage(stage.id, 'completed'); }} disabled={transitioning === stage.id}>
                          {transitioning === stage.id ? '...' : 'Complete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {tab === 'documents' && (
        <div className="card">
          <div className="card-header">
            <h3>Document Checklist</h3>
            <button className="btn btn-primary btn-sm" onClick={() => _router.push('/dashboard/documents')}><Upload size={16} /> Upload</button>
          </div>
          <div className="card-body">
            {checklist.length > 0 ? (
              <div>
                {checklist.map((doc: any) => {
                  const uploaded = documents.find((d: any) => d.template_doc_id === doc.id);
                  return (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                      {uploaded ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      ) : (
                        <Circle size={18} style={{ color: doc.is_mandatory ? 'var(--color-danger)' : 'var(--color-gray-300)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{doc.document_name}</div>
                        <div className="text-xs text-muted">
                          {doc.document_category.replace('_', ' ')} · {doc.is_mandatory ? 'Required' : 'Optional'} · Upload by: {doc.upload_by}
                        </div>
                      </div>
                      {uploaded ? (
                        <span className="badge badge-green">Uploaded</span>
                      ) : (
                        <span className={`badge ${doc.is_mandatory ? 'badge-red' : 'badge-gray'}`}>{doc.is_mandatory ? 'Missing' : 'Pending'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <FileText size={48} />
                <h3>No document checklist</h3>
                <p>This compliance template has no document requirements defined.</p>
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
    </>
  );
}
