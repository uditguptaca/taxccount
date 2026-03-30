'use client';
import { useEffect, useState } from 'react';
import { FileText, UploadCloud, CheckCircle2, AlertCircle, Download, FolderOpen, Search, Shield, Clock, ChevronDown, Upload, History, XCircle } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function fileSize(b: number) { return b > 1000000 ? `${(b / 1000000).toFixed(1)} MB` : `${Math.round(b / 1000)} KB`; }

export default function PortalDocuments() {
  const [data, setData] = useState<any>(null);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'folders' | 'required' | 'all'>('folders');
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ category: string; year: string; label: string }>({ category: 'client_supporting', year: 'Permanent', label: 'Permanent Documents' });
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    Promise.all([
      fetch('/api/portal/documents').then(r => r.json()),
      // We need the client ID to fetch structured docs. Get it from portal docs first.
    ]).then(([portalData]) => {
      setData(portalData);
      // Fetch structured data using client_id from the portal documents
      const clientId = portalData?.documents?.[0]?.client_id || portalData?.requiredDocs?.[0]?.client_id;
      if (clientId) {
        fetch(`/api/clients/${clientId}/documents`).then(r => r.json()).then(setStructuredData);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleUpload = async () => {
    if (!activeFile) return;
    setUploading(true);
    const clientId = data?.documents?.[0]?.client_id || data?.requiredDocs?.[0]?.client_id;
    if (!clientId) { setUploading(false); return; }

    const formData = new FormData();
    formData.append('file', activeFile);
    formData.append('client_id', clientId);
    formData.append('document_category', uploadTarget.category);
    formData.append('financial_year', uploadTarget.year);
    formData.append('uploaded_by', 'client_portal');

    await fetch('/api/documents', { method: 'POST', body: formData });
    setUploading(false);
    setShowUploadModal(false);
    setActiveFile(null);
    loadData();
  };

  const handleRequiredUpload = (doc: any) => {
    setUploadTarget({
      category: doc.document_category || 'client_supporting',
      year: doc.financial_year || new Date().getFullYear().toString(),
      label: `${doc.document_name} — ${doc.template_name || ''} FY ${doc.financial_year || ''}`
    });
    setShowUploadModal(true);
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /><p>Loading documents...</p></div>;
  if (!data) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load documents</h2></div>;

  const { documents, requiredDocs } = data;
  const pendingDocs = requiredDocs?.filter((d: any) => !d.is_uploaded) || [];
  const uploadedDocs = requiredDocs?.filter((d: any) => d.is_uploaded) || [];

  const filteredDocs = (documents || []).filter((d: any) => {
    if (searchTerm && !d.file_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1><FileText size={28} /> Document Center</h1>
          <p className="text-muted">Organize, upload, and track all your documents in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setUploadTarget({ category: 'client_supporting', year: new Date().getFullYear().toString(), label: 'General Upload' });
          setShowUploadModal(true);
        }}>
          <UploadCloud size={18} /> Upload Document
        </button>
      </div>

      {/* Pending Documents Banner */}
      {pendingDocs.length > 0 && (
        <div className="portal-doc-banner">
          <AlertCircle size={20} />
          <span><strong>{pendingDocs.length} document{pendingDocs.length > 1 ? 's' : ''}</strong> still needed from you</span>
          <button className="btn btn-sm btn-primary" onClick={() => setActiveView('required')}>View Required</button>
        </div>
      )}

      {/* View Tabs */}
      <div className="portal-doc-tabs">
        <button className={`portal-doc-tab ${activeView === 'folders' ? 'active' : ''}`} onClick={() => setActiveView('folders')}>
          <FolderOpen size={16} /> Document Vault
        </button>
        <button className={`portal-doc-tab ${activeView === 'required' ? 'active' : ''}`} onClick={() => setActiveView('required')}>
          Required Documents
          {pendingDocs.length > 0 && <span className="portal-doc-tab-badge">{pendingDocs.length}</span>}
        </button>
        <button className={`portal-doc-tab ${activeView === 'all' ? 'active' : ''}`} onClick={() => setActiveView('all')}>
          All Files ({documents?.length || 0})
        </button>
      </div>

      {/* ═══════════════════ FOLDER VIEW ═══════════════════ */}
      {activeView === 'folders' && structuredData && (
        <div>
          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <div style={{ padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{structuredData.summary?.totalDocs || 0}</div>
              <div className="text-xs text-muted">Total Documents</div>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#8b5cf6' }}>{structuredData.summary?.permanentCount || 0}</div>
              <div className="text-xs text-muted">Permanent</div>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)' }}>{structuredData.summary?.approved || 0}</div>
              <div className="text-xs text-muted">Approved</div>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-warning)' }}>{structuredData.summary?.pendingApproval || 0}</div>
              <div className="text-xs text-muted">Pending Review</div>
            </div>
          </div>

          {/* ── PERMANENT DOCUMENTS ── */}
          <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))', cursor: 'pointer' }}
              onClick={() => setExpandedYear(expandedYear === 'Permanent' ? null : 'Permanent')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>Permanent Documents</div>
                  <div className="text-xs text-muted">Government IDs, Business Registration, SIN & Non-Year-Specific Files</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="badge badge-blue">{structuredData.permanentDocs?.length || 0} files</span>
                <button className="btn btn-sm btn-primary" onClick={(e) => {
                  e.stopPropagation();
                  setUploadTarget({ category: 'permanent', year: 'Permanent', label: 'Permanent Documents' });
                  setShowUploadModal(true);
                }}><Upload size={14} /> Upload</button>
                <ChevronDown size={18} style={{ transform: expandedYear === 'Permanent' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
              </div>
            </div>
            {expandedYear === 'Permanent' && (
              <div style={{ padding: 0 }}>
                {(!structuredData.permanentDocs || structuredData.permanentDocs.length === 0) ? (
                  <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                    <Shield size={36} style={{ marginBottom: 'var(--space-2)' }} />
                    <p style={{ margin: 0 }}>No permanent documents yet.</p>
                    <p className="text-xs">Upload your Government IDs, SIN, or Business Registration.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {structuredData.permanentDocs.filter((d: any) => !d.is_internal_only).map((d: any) => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--color-gray-100)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{d.file_name}</div>
                            <div className="text-xs text-muted">{fileSize(d.file_size_bytes)} · {formatDate(d.created_at)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {d.approval_status === 'APPROVED' && <span className="badge badge-green"><CheckCircle2 size={12} /> Approved</span>}
                          {d.approval_status === 'REJECTED' && <span className="badge badge-red" style={{ color: 'var(--color-danger)' }}><XCircle size={12} /> Rejected</span>}
                          {(!d.approval_status || d.approval_status === 'PENDING') && <span className="badge badge-yellow"><Clock size={12} /> Pending Review</span>}
                          <a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-sm"><Download size={14} /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── YEAR-WISE FOLDERS ── */}
          {(structuredData.yearFolders || []).map((yf: any) => (
            <div key={yf.year} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', cursor: 'pointer' }}
                onClick={() => setExpandedYear(expandedYear === yf.year ? null : yf.year)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>
                    {yf.year.slice(-2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>FY {yf.year}</div>
                    <div className="text-xs text-muted">Compliance documents for financial year {yf.year}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className="badge badge-gray">{yf.total} files</span>
                  <ChevronDown size={18} style={{ transform: expandedYear === yf.year ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                </div>
              </div>

              {expandedYear === yf.year && (
                <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', borderTop: '1px solid var(--color-gray-100)' }}>
                  {Object.entries(yf.subfolders).map(([key, sf]: [string, any]) => (
                    <div key={key} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', cursor: 'pointer' }}
                        onClick={() => setExpandedFolder(expandedFolder === `${yf.year}-${key}` ? null : `${yf.year}-${key}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <FolderOpen size={16} style={{ color: key === 'onboarding' ? '#f59e0b' : key === 'client_provided' ? '#3b82f6' : '#10b981' }} />
                          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{sf.label}</span>
                          <span className="badge badge-gray" style={{ fontSize: 10 }}>{sf.docs.length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {key === 'client_provided' && (
                            <button className="btn btn-ghost btn-sm" onClick={(e) => {
                              e.stopPropagation();
                              setUploadTarget({ category: 'client_supporting', year: yf.year, label: `${sf.label} — FY ${yf.year}` });
                              setShowUploadModal(true);
                            }}><Upload size={14} /> Upload</button>
                          )}
                          <ChevronDown size={16} style={{ transform: expandedFolder === `${yf.year}-${key}` ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--color-gray-400)' }} />
                        </div>
                      </div>

                      {expandedFolder === `${yf.year}-${key}` && (
                        <div>
                          {sf.docs.filter((d: any) => !d.is_internal_only).length === 0 ? (
                            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
                              No documents in this folder yet.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {sf.docs.filter((d: any) => !d.is_internal_only).map((d: any) => (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--color-gray-100)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <FileText size={16} style={{ color: 'var(--color-primary)' }} />
                                    <div>
                                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{d.file_name}</div>
                                      <div className="text-xs text-muted">
                                        {fileSize(d.file_size_bytes)} · {formatDate(d.created_at)}
                                        {d.engagement_code && <> · <span style={{ fontWeight: 500 }}>{d.engagement_code}</span></>}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    {d.approval_status === 'APPROVED' && <span className="badge badge-green"><CheckCircle2 size={11} /> Approved</span>}
                                    {d.approval_status === 'REJECTED' && <span className="badge badge-red" style={{ color: 'var(--color-danger)' }}><XCircle size={11} /> Rejected</span>}
                                    {(!d.approval_status || d.approval_status === 'PENDING') && <span className="badge badge-yellow"><Clock size={11} /> Pending</span>}
                                    <a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-sm"><Download size={14} /></a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Audit Trail */}
                  <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', cursor: 'pointer' }}
                      onClick={() => setExpandedFolder(expandedFolder === `${yf.year}-audit` ? null : `${yf.year}-audit`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <History size={16} style={{ color: '#8b5cf6' }} />
                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Audit Trail</span>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{yf.auditTrail?.length || 0}</span>
                      </div>
                      <ChevronDown size={16} style={{ transform: expandedFolder === `${yf.year}-audit` ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--color-gray-400)' }} />
                    </div>
                    {expandedFolder === `${yf.year}-audit` && (
                      <div style={{ padding: 'var(--space-4)', maxHeight: 350, overflowY: 'auto' }}>
                        {(!yf.auditTrail || yf.auditTrail.length === 0) ? (
                          <div style={{ textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-3)' }}>No audit entries for this year yet.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {yf.auditTrail.map((a: any, i: number) => {
                              let details: any = {};
                              try { details = JSON.parse(a.details || '{}'); } catch {}
                              const actionLabel = (a.action || '').replace('DOCUMENT_', '').replace(/_/g, ' ');
                              const actionColor = a.action?.includes('APPROVED') ? 'var(--color-success)' : a.action?.includes('REJECTED') ? 'var(--color-danger)' : a.action?.includes('UPLOADED') ? 'var(--color-primary)' : 'var(--color-gray-500)';
                              return (
                                <div key={a.id || i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: i < yf.auditTrail.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: actionColor, marginTop: 6, flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                      <span style={{ fontWeight: 600, color: actionColor, textTransform: 'capitalize' }}>{actionLabel}</span>
                                      {details.file_name && <span className="text-muted"> — {details.file_name}</span>}
                                    </div>
                                    <div className="text-xs text-muted">
                                      {a.actor_name || 'System'} · {formatDate(a.created_at)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Empty state when no structured data */}
          {structuredData && !structuredData.permanentDocs?.length && !structuredData.yearFolders?.length && (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
              <FolderOpen size={48} style={{ marginBottom: 'var(--space-3)' }} />
              <h3>No Documents Yet</h3>
              <p className="text-sm text-muted">Upload your permanent documents or wait for your accountant to assign compliance tasks.</p>
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => {
                setUploadTarget({ category: 'permanent', year: 'Permanent', label: 'Permanent Documents' });
                setShowUploadModal(true);
              }}><Upload size={16} /> Upload Permanent Document</button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ REQUIRED DOCUMENTS VIEW ═══════════════════ */}
      {activeView === 'required' && (
        <div className="portal-doc-required-section">
          {pendingDocs.length === 0 && uploadedDocs.length === 0 ? (
            <div className="portal-doc-empty">
              <CheckCircle2 size={48} />
              <h3>No documents required right now</h3>
              <p>We&apos;ll notify you when we need anything.</p>
            </div>
          ) : (
            <>
              {pendingDocs.length > 0 && (
                <div className="portal-doc-group">
                  <h3 className="portal-doc-group-title">
                    <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} /> Pending from You ({pendingDocs.length})
                  </h3>
                  {pendingDocs.map((doc: any, i: number) => (
                    <div key={i} className="portal-doc-req-card pending">
                      <div className="portal-doc-req-icon pending">
                        <UploadCloud size={20} />
                      </div>
                      <div className="portal-doc-req-info">
                        <span className="portal-doc-req-name">{doc.document_name}</span>
                        <span className="portal-doc-req-meta">
                          {doc.template_name} · FY {doc.financial_year}
                          {doc.is_mandatory ? <span className="badge badge-red" style={{ marginLeft: 8 }}>Required</span> : <span className="badge badge-gray" style={{ marginLeft: 8 }}>Optional</span>}
                        </span>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleRequiredUpload(doc)}>
                        <UploadCloud size={14} /> Upload
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedDocs.length > 0 && (
                <div className="portal-doc-group">
                  <h3 className="portal-doc-group-title">
                    <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> Uploaded ({uploadedDocs.length})
                  </h3>
                  {uploadedDocs.map((doc: any, i: number) => (
                    <div key={i} className="portal-doc-req-card uploaded">
                      <div className="portal-doc-req-icon uploaded">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="portal-doc-req-info">
                        <span className="portal-doc-req-name">{doc.document_name}</span>
                        <span className="portal-doc-req-meta">{doc.template_name} · FY {doc.financial_year}</span>
                      </div>
                      <span className="badge badge-green">Uploaded</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════ ALL FILES VIEW ═══════════════════ */}
      {activeView === 'all' && (
        <div>
          <div className="portal-doc-toolbar">
            <div className="portal-doc-search">
              <Search size={16} />
              <input type="text" placeholder="Search documents..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="portal-doc-empty">
              <FolderOpen size={48} />
              <h3>No documents found</h3>
              <p>Try changing your search or upload a new document.</p>
            </div>
          ) : (
            <div className="portal-doc-file-list">
              {filteredDocs.map((doc: any) => (
                <div key={doc.id} className="portal-doc-file-row">
                  <div className="portal-doc-file-icon">
                    <FileText size={20} />
                  </div>
                  <div className="portal-doc-file-info">
                    <span className="portal-doc-file-name">{doc.file_name}</span>
                    <span className="portal-doc-file-meta">
                      {doc.document_category?.replace(/_/g, ' ')} · {fileSize(doc.file_size_bytes)} · {doc.uploaded_by_name}
                      {doc.financial_year && <> · FY {doc.financial_year}</>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {doc.approval_status === 'APPROVED' && <span className="badge badge-green">Approved</span>}
                    {doc.approval_status === 'REJECTED' && <span className="badge badge-red" style={{ color: 'var(--color-danger)' }}>Rejected</span>}
                    {(!doc.approval_status || doc.approval_status === 'PENDING') && <span className="badge badge-yellow">Pending</span>}
                    <span className={`badge ${doc.status === 'signed' ? 'badge-green' : doc.status === 'viewed' ? 'badge-blue' : 'badge-gray'}`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="portal-doc-file-actions">
                    <a href={`/api/documents/${doc.id}/download`} target="_blank" className="btn btn-ghost btn-sm" title="Download"><Download size={16} /></a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ UPLOAD MODAL ═══════════════════ */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)' }}>
                <div className="text-xs text-muted">Uploading to</div>
                <strong>{uploadTarget.label}</strong>
              </div>
              <div className="portal-upload-area">
                <UploadCloud size={40} style={{ color: 'var(--color-gray-400)' }} />
                <p style={{ marginTop: 'var(--space-3)', fontWeight: 500 }}>{activeFile ? activeFile.name : 'Drag & drop files here or click to browse'}</p>
                <p className="text-muted text-sm">Supported: PDF, JPG, PNG, XLSX (Max 25MB)</p>
                <input type="file" style={{ display: 'none' }} id="portal-file-upload" onChange={e => setActiveFile(e.target.files?.[0] || null)} />
                <label htmlFor="portal-file-upload" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)', cursor: 'pointer' }}>{activeFile ? 'Change File' : 'Choose File'}</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowUploadModal(false); setActiveFile(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={!activeFile || uploading}>
                {uploading ? 'Uploading...' : <><UploadCloud size={16} /> Upload</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
