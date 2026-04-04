'use client';
import { useEffect, useState } from 'react';
import { FileText, Upload, Search, Eye, PenTool, CheckCircle, XCircle, FolderOpen, Tag, Download, Check, X, Shield, Clock, ChevronDown, History, UploadCloud, Trash2 } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function fileSize(b: number) { return b > 1000000 ? `${(b / 1000000).toFixed(1)} MB` : `${Math.round(b / 1000)} KB`; }

export default function DocumentsPage() {
  const [data, setData] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Structured doc data for selected client
  const [structuredData, setStructuredData] = useState<any>(null);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);

  // Filters for recent view
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [clientEngagements, setClientEngagements] = useState<any[]>([]);
  const [uploadForm, setUploadForm] = useState({
    client_id: '',
    engagement_id: '',
    document_category: 'client_supporting',
    financial_year: new Date().getFullYear().toString(),
    is_internal_only: false
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Folder-targeted upload
  const [folderUploadTarget, setFolderUploadTarget] = useState<{ category: string; year: string; label: string } | null>(null);
  const [folderUploadFile, setFolderUploadFile] = useState<File | null>(null);
  const [folderUploading, setFolderUploading] = useState(false);

  const loadData = () => fetch('/api/documents').then(r => r.json()).then(setData).catch(console.error);

  useEffect(() => {
    loadData();
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || [])).catch(console.error);
  }, []);

  // Load structured data when a client is selected
  useEffect(() => {
    if (selectedClient) {
      fetch(`/api/clients/${selectedClient}/documents`).then(r => r.json()).then(setStructuredData).catch(console.error);
    } else {
      setStructuredData(null);
      setExpandedYear(null);
      setExpandedFolder(null);
    }
  }, [selectedClient]);

  // Fetch engagements when client changes in upload modal
  useEffect(() => {
    if (uploadForm.client_id) {
      fetch(`/api/clients/${uploadForm.client_id}`).then(r => r.json()).then(d => setClientEngagements(d.engagements || [])).catch(console.error);
    } else {
      setClientEngagements([]);
    }
  }, [uploadForm.client_id]);

  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>Loading documents...</div>;

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { 'new': 'badge-blue', 'uploaded': 'badge-blue', 'viewed': 'badge-gray', 'signed': 'badge-green', 'archived': 'badge-gray' };
    const icon = s === 'signed' ? <PenTool size={12} /> : s === 'viewed' ? <Eye size={12} /> : <FileText size={12} />;
    return <span className={`badge ${m[s] || 'badge-gray'}`}>{icon} {s}</span>;
  };

  const approvalBadge = (a: string) => {
    if (a === 'APPROVED') return <span className="badge badge-green"><CheckCircle size={12} /> Approved</span>;
    if (a === 'REJECTED') return <span className="badge badge-red" style={{ color: 'var(--color-danger)', background: 'var(--color-red-50, #fef2f2)' }}><XCircle size={12} /> Rejected</span>;
    return <span className="badge badge-yellow"><Clock size={12} /> Pending</span>;
  };

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadForm.client_id) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('client_id', uploadForm.client_id);
    if (uploadForm.engagement_id) formData.append('engagement_id', uploadForm.engagement_id);
    formData.append('document_category', uploadForm.document_category);
    formData.append('financial_year', uploadForm.financial_year);
    formData.append('uploaded_by', user.id || 'system');
    formData.append('is_internal_only', uploadForm.is_internal_only ? '1' : '0');

    await fetch('/api/documents', { method: 'POST', body: formData });
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadForm({ client_id: '', engagement_id: '', document_category: 'client_supporting', financial_year: new Date().getFullYear().toString(), is_internal_only: false });
    loadData();
    if (selectedClient) {
      fetch(`/api/clients/${selectedClient}/documents`).then(r => r.json()).then(setStructuredData).catch(console.error);
    }
  }

  async function handleFolderUpload() {
    if (!folderUploadFile || !selectedClient || !folderUploadTarget) return;
    setFolderUploading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const formData = new FormData();
    formData.append('file', folderUploadFile);
    formData.append('client_id', selectedClient);
    formData.append('document_category', folderUploadTarget.category);
    formData.append('financial_year', folderUploadTarget.year);
    formData.append('uploaded_by', user.id || 'system');

    await fetch('/api/documents', { method: 'POST', body: formData });
    setFolderUploading(false);
    setFolderUploadTarget(null);
    setFolderUploadFile(null);
    loadData();
    fetch(`/api/clients/${selectedClient}/documents`).then(r => r.json()).then(setStructuredData).catch(console.error);
  }

  async function handleApproveReject(id: string, approval_status: string) {
    if (!confirm(`Mark this document as ${approval_status}?`)) return;
    await fetch(`/api/documents/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approval_status }) });
    loadData();
    if (selectedClient) {
      fetch(`/api/clients/${selectedClient}/documents`).then(r => r.json()).then(setStructuredData).catch(console.error);
    }
  }

  async function handleDeleteDocument(docId: string, fileName: string) {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
    loadData();
    if (selectedClient) {
      fetch(`/api/clients/${selectedClient}/documents`).then(r => r.json()).then(setStructuredData).catch(console.error);
    }
  }

  // Filter documents for the recent view
  const allDocs = (data.documents || []).filter((d: any) => {
    if (search && !d.file_name.toLowerCase().includes(search.toLowerCase()) && !d.client_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && (d.approval_status || 'PENDING') !== statusFilter) return false;
    if (yearFilter !== 'all' && d.financial_year !== yearFilter) return false;
    return true;
  });

  // Get unique years for filter
  const uniqueYears = Array.from(new Set((data.documents || []).map((d: any) => d.financial_year).filter(Boolean))).sort((a: any, b: any) => b.localeCompare(a));

  const selectedClientName = selectedClient ? (data.clientsWithDocs || []).find((c: any) => c.id === selectedClient)?.display_name : null;

  // Document row renderer for tables inside folders
  const DocRow = ({ d, showCompliance = true }: { d: any; showCompliance?: boolean }) => (
    <tr key={d.id}>
      <td>
        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FileText size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          {d.file_name}
          {d.is_internal_only === 1 && <span className="badge badge-gray" style={{ fontSize: 9 }}>Internal</span>}
        </div>
        <span className="text-xs text-muted">{fileSize(d.file_size_bytes)} · {d.mime_type}</span>
      </td>
      <td className="text-sm">{d.financial_year || '—'}</td>
      {showCompliance && (
        <td className="text-xs">{d.engagement_code ? <><span style={{ fontWeight: 500 }}>{d.engagement_code}</span><br /><span className="text-muted">{d.template_name}</span></> : <span className="text-muted">—</span>}</td>
      )}
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
          {statusBadge(d.status)}
          {approvalBadge(d.approval_status || 'PENDING')}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-icon" title="Download"><Download size={14} /></a>
          {d.approval_status !== 'APPROVED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-success)' }} title="Approve" onClick={() => handleApproveReject(d.id, 'APPROVED')}><Check size={14} /></button>}
          {d.approval_status !== 'REJECTED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} title="Reject" onClick={() => handleApproveReject(d.id, 'REJECTED')}><X size={14} /></button>}
          <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} title="Delete" onClick={() => handleDeleteDocument(d.id, d.file_name)}><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1>Documents</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Browse, categorize, and manage client documents across all compliance tasks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}><Upload size={18} /> Upload Document</button>
      </div>

      <div className="two-panel">
        {/* ═══════ SIDEBAR — Client Directory ═══════ */}
        <div className="two-panel-sidebar">
          <div className="two-panel-sidebar-header">
            <div className="topbar-search" style={{ width: '100%' }}>
              <Search />
              <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div className="two-panel-sidebar-list">
            <div className={`chat-list-item ${!selectedClient ? 'active' : ''}`} onClick={() => setSelectedClient(null)}>
              <div className="chat-avatar" style={{ background: 'var(--color-gray-200)', color: 'var(--color-gray-600)' }}><FileText size={18} /></div>
              <div className="chat-meta">
                <div className="chat-subject">Recent Uploads</div>
                <div className="chat-preview">All clients — {(data.documents || []).length} files</div>
              </div>
            </div>
            <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Client Directory
            </div>
            {(data.clientsWithDocs || []).filter((c: any) =>
              !search || c.display_name.toLowerCase().includes(search.toLowerCase()) || c.client_code.toLowerCase().includes(search.toLowerCase())
            ).map((c: any) => (
              <div key={c.id} className={`chat-list-item ${selectedClient === c.id ? 'active' : ''}`} onClick={() => setSelectedClient(c.id)}>
                <div className="chat-avatar">{c.display_name.charAt(0)}</div>
                <div className="chat-meta">
                  <div className="chat-subject">{c.display_name}</div>
                  <div className="chat-preview">{c.client_code} — {c.doc_count} files</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ MAIN PANEL ═══════ */}
        <div className="two-panel-main">
          <div className="two-panel-main-header">
            <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {selectedClient ? <FolderOpen size={20} className="text-muted" /> : <FileText size={20} className="text-muted" />}
              {selectedClientName || 'Recent Firm Uploads'}
            </h3>
            {selectedClient && (
              <button className="btn btn-primary btn-sm" onClick={() => {
                setUploadForm({ ...uploadForm, client_id: selectedClient });
                setShowUploadModal(true);
              }}><Upload size={14} /> Upload</button>
            )}
            {!selectedClient && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <select className="form-select" style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', minWidth: 100 }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                  <option value="all">All Years</option>
                  {uniqueYears.map((y: any) => <option key={y} value={y}>FY {y}</option>)}
                </select>
                <span className="badge badge-gray">{allDocs.length} files</span>
              </div>
            )}
          </div>

          <div className="two-panel-main-body" style={{ padding: 0 }}>
            {!selectedClient ? (
              /* ═══════ RECENT UPLOADS — FILTERED TABLE ═══════ */
              <div className="data-table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                <table className="data-table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr><th>File</th><th>Client / Link</th><th>Category</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {allDocs.slice(0, 50).map((d: any) => (
                      <tr key={d.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <FileText size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 500 }}>{d.file_name}</div>
                              <div className="text-xs text-muted">{fileSize(d.file_size_bytes)}</div>
                            </div>
                            {d.is_internal_only === 1 && <span className="badge badge-gray" style={{ fontSize: 9 }}>Internal</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--color-primary)' }} onClick={() => setSelectedClient(d.client_id)}>{d.client_name}</div>
                          {d.engagement_code && <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Tag size={10} /> {d.template_name}</div>}
                        </td>
                        <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{d.document_category?.replace(/_/g, ' ')}</span></td>
                        <td className="text-sm">{formatDate(d.created_at)}<br /><span className="text-xs text-muted">{d.uploaded_by_name}</span></td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                            {statusBadge(d.status)}
                            {approvalBadge(d.approval_status || 'PENDING')}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <a href={`/api/documents/${d.id}/download`} target="_blank" className="btn btn-ghost btn-icon" title="Download"><Download size={14} /></a>
                            {(d.approval_status || 'PENDING') !== 'APPROVED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-success)' }} title="Approve" onClick={() => handleApproveReject(d.id, 'APPROVED')}><Check size={14} /></button>}
                            {(d.approval_status || 'PENDING') !== 'REJECTED' && <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} title="Reject" onClick={() => handleApproveReject(d.id, 'REJECTED')}><X size={14} /></button>}
                            <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} title="Delete" onClick={() => handleDeleteDocument(d.id, d.file_name)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allDocs.length === 0 && <div className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No documents match the current filters.</div>}
              </div>
            ) : structuredData ? (
              /* ═══════ CLIENT-SPECIFIC HIERARCHICAL FOLDER VIEW ═══════ */
              <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                {/* KPI Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{structuredData.summary?.totalDocs || 0}</div>
                    <div className="text-xs text-muted">Total</div>
                  </div>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: '#8b5cf6' }}>{structuredData.summary?.permanentCount || 0}</div>
                    <div className="text-xs text-muted">Permanent</div>
                  </div>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-warning)' }}>{structuredData.summary?.pendingApproval || 0}</div>
                    <div className="text-xs text-muted">Pending</div>
                  </div>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-success)' }}>{structuredData.summary?.approved || 0}</div>
                    <div className="text-xs text-muted">Approved</div>
                  </div>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-danger)' }}>{structuredData.summary?.rejected || 0}</div>
                    <div className="text-xs text-muted">Rejected</div>
                  </div>
                </div>

                {/* ── PERMANENT DOCUMENTS ── */}
                <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))', cursor: 'pointer' }}
                    onClick={() => setExpandedYear(expandedYear === 'Permanent' ? null : 'Permanent')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Permanent Documents</div>
                        <div className="text-xs text-muted">IDs, Registration Certificates, & Non-Year-Specific Files</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className="badge badge-blue">{structuredData.permanentDocs?.length || 0} files</span>
                      <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setFolderUploadTarget({ category: 'permanent', year: 'Permanent', label: `${selectedClientName} › Permanent Documents` }); }}><Upload size={12} /> Upload</button>
                      <ChevronDown size={16} style={{ transform: expandedYear === 'Permanent' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                    </div>
                  </div>
                  {expandedYear === 'Permanent' && (
                    <div>
                      {(!structuredData.permanentDocs || structuredData.permanentDocs.length === 0) ? (
                        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                          <Shield size={32} style={{ marginBottom: 8 }} /><p style={{ margin: 0 }}>No permanent documents uploaded yet.</p>
                        </div>
                      ) : (
                        <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                          <table className="data-table text-sm">
                            <thead><tr><th>Document</th><th>Year</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
                            <tbody>
                              {structuredData.permanentDocs.map((d: any) => <DocRow key={d.id} d={d} showCompliance={false} />)}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── YEAR-WISE COMPLIANCE FOLDERS ── */}
                {(structuredData.yearFolders || []).map((yf: any) => (
                  <div key={yf.year} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', cursor: 'pointer' }}
                      onClick={() => setExpandedYear(expandedYear === yf.year ? null : yf.year)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                          {yf.year.slice(-2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>FY {yf.year}</div>
                          <div className="text-xs text-muted">Compliance documents for financial year {yf.year}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span className="badge badge-gray">{yf.total} files</span>
                        {yf.auditTrail?.length > 0 && <span className="badge badge-cyan" style={{ fontSize: 10 }}>{yf.auditTrail.length} audit</span>}
                        <ChevronDown size={16} style={{ transform: expandedYear === yf.year ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-gray-400)' }} />
                      </div>
                    </div>

                    {expandedYear === yf.year && (
                      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', borderTop: '1px solid var(--color-gray-100)' }}>
                        {/* Subfolders */}
                        {Object.entries(yf.subfolders).map(([key, sf]: [string, any]) => (
                          <div key={key} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-gray-50)', cursor: 'pointer' }}
                              onClick={() => setExpandedFolder(expandedFolder === `${yf.year}-${key}` ? null : `${yf.year}-${key}`)}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FolderOpen size={14} style={{ color: key === 'onboarding' ? '#f59e0b' : key === 'client_provided' ? '#3b82f6' : '#10b981' }} />
                                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{sf.label}</span>
                                <span className="badge badge-gray" style={{ fontSize: 10 }}>{sf.docs.length}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--font-size-xs)' }} onClick={(e) => {
                                  e.stopPropagation();
                                  setFolderUploadTarget({ category: key === 'onboarding' ? 'onboarding' : key === 'client_provided' ? 'client_supporting' : 'final_document', year: yf.year, label: `${selectedClientName} › FY ${yf.year} › ${sf.label}` });
                                }}><Upload size={12} /> Upload</button>
                                <ChevronDown size={14} style={{ transform: expandedFolder === `${yf.year}-${key}` ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--color-gray-400)' }} />
                              </div>
                            </div>

                            {expandedFolder === `${yf.year}-${key}` && (
                              <div>
                                {sf.docs.length === 0 ? (
                                  <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>No documents in this folder yet.</div>
                                ) : (
                                  <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                                    <table className="data-table text-sm">
                                      <thead><tr><th>Document</th><th>Year</th><th>Compliance</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr></thead>
                                      <tbody>{sf.docs.map((d: any) => <DocRow key={d.id} d={d} />)}</tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Audit Trail */}
                        <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-gray-50)', cursor: 'pointer' }}
                            onClick={() => setExpandedFolder(expandedFolder === `${yf.year}-audit` ? null : `${yf.year}-audit`)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              <History size={14} style={{ color: '#8b5cf6' }} />
                              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Audit Trail</span>
                              <span className="badge badge-gray" style={{ fontSize: 10 }}>{yf.auditTrail?.length || 0}</span>
                            </div>
                            <ChevronDown size={14} style={{ transform: expandedFolder === `${yf.year}-audit` ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--color-gray-400)' }} />
                          </div>
                          {expandedFolder === `${yf.year}-audit` && (
                            <div style={{ padding: 'var(--space-3)', maxHeight: 350, overflowY: 'auto' }}>
                              {(!yf.auditTrail || yf.auditTrail.length === 0) ? (
                                <div style={{ textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-3)' }}>No audit entries for this year.</div>
                              ) : yf.auditTrail.map((a: any, i: number) => {
                                let details: any = {};
                                try { details = JSON.parse(a.details || '{}'); } catch {}
                                const actionLabel = (a.action || '').replace('DOCUMENT_', '').replace(/_/g, ' ');
                                const actionColor = a.action?.includes('APPROVED') ? 'var(--color-success)' : a.action?.includes('REJECTED') ? 'var(--color-danger)' : a.action?.includes('UPLOADED') ? 'var(--color-primary)' : 'var(--color-gray-500)';
                                return (
                                  <div key={a.id || i} style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-2) 0', borderBottom: i < yf.auditTrail.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: actionColor, marginTop: 5, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 'var(--font-size-xs)' }}>
                                        <span style={{ fontWeight: 600, color: actionColor, textTransform: 'capitalize' }}>{actionLabel}</span>
                                        {details.file_name && <span className="text-muted"> — {details.file_name}</span>}
                                      </div>
                                      <div className="text-xs text-muted">{a.actor_name || 'System'} · {formatDate(a.created_at)}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {!structuredData.permanentDocs?.length && !structuredData.yearFolders?.length && (
                  <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                    <FolderOpen size={48} style={{ marginBottom: 'var(--space-3)' }} />
                    <h3>No Documents Yet</h3>
                    <p className="text-sm">Upload permanent documents or link compliance engagements to organize this client's files.</p>
                    <button className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={() => setFolderUploadTarget({ category: 'permanent', year: 'Permanent', label: `${selectedClientName} › Permanent Documents` })}><Upload size={16} /> Upload Permanent Document</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)' }}>Loading client documents...</div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ FOLDER UPLOAD MODAL ═══════ */}
      {folderUploadTarget && (
        <div className="modal-overlay" onClick={() => { setFolderUploadTarget(null); setFolderUploadFile(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><UploadCloud size={20} /> Upload to Folder</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setFolderUploadTarget(null); setFolderUploadFile(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                <div className="text-xs text-muted">Uploading to</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{folderUploadTarget.label}</div>
              </div>
              <div style={{ border: '2px dashed var(--color-gray-300)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', textAlign: 'center', background: 'var(--color-gray-50)' }}>
                <UploadCloud size={32} style={{ color: 'var(--color-gray-400)' }} />
                <p style={{ marginTop: 'var(--space-2)', fontWeight: 500 }}>{folderUploadFile ? folderUploadFile.name : 'Choose a file to upload'}</p>
                <p className="text-xs text-muted">PDF, JPEG, PNG, XLSX, DOCX (Max 20MB)</p>
                <input type="file" id="folder-doc-upload" style={{ display: 'none' }} onChange={e => setFolderUploadFile(e.target.files?.[0] || null)} />
                <label htmlFor="folder-doc-upload" className="btn btn-secondary" style={{ marginTop: 'var(--space-3)', cursor: 'pointer' }}>{folderUploadFile ? 'Change File' : 'Browse Files'}</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setFolderUploadTarget(null); setFolderUploadFile(null); }}>Cancel</button>
              <button className="btn btn-primary" disabled={!folderUploadFile || folderUploading} onClick={handleFolderUpload}>
                {folderUploading ? 'Uploading...' : <><Upload size={16} /> Upload</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ GENERAL UPLOAD MODAL ═══════ */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Client *</label>
                  <select className="form-select" required value={uploadForm.client_id} onChange={e => setUploadForm({...uploadForm, client_id: e.target.value, engagement_id: ''})}>
                    <option value="">Choose a client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.display_name} ({c.client_code})</option>)}
                  </select>
                </div>

                {uploadForm.client_id && clientEngagements.length > 0 && (
                  <div className="form-group" style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)' }}>
                    <label className="form-label">Link to Compliance Task (Optional)</label>
                    <select className="form-select" value={uploadForm.engagement_id} onChange={e => setUploadForm({...uploadForm, engagement_id: e.target.value})}>
                      <option value="">No Link — Global File</option>
                      {clientEngagements.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.template_name} {e.period_label ? `(${e.period_label})` : e.financial_year} — {e.engagement_code}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Document Category *</label>
                    <select className="form-select" required value={uploadForm.document_category} onChange={e => setUploadForm({...uploadForm, document_category: e.target.value})}>
                      <option value="permanent">Permanent Document</option>
                      <option value="onboarding">Onboarding Document</option>
                      <option value="client_supporting">Client Supporting Document</option>
                      <option value="final_document">Tax Filing / Final Document</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax / Financial Year</label>
                    <input className="form-input" type="text" value={uploadForm.financial_year} onChange={e => setUploadForm({...uploadForm, financial_year: e.target.value})} placeholder="e.g. 2025 or Permanent" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">File Attachment *</label>
                  <input className="form-input" type="file" required onChange={e => setUploadFile(e.target.files?.[0] || null)} style={{ padding: 'var(--space-3)', background: 'var(--color-gray-50)', border: '2px dashed var(--color-gray-300)' }} />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  <input type="checkbox" id="is_internal_only" checked={uploadForm.is_internal_only} onChange={e => setUploadForm({...uploadForm, is_internal_only: e.target.checked})} style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }} />
                  <label htmlFor="is_internal_only" style={{ margin: 0, cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-gray-800)' }}>
                    Internal Note Only (Hide from Client Portal)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Upload size={16} /> Upload & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
