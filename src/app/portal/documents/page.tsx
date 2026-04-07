'use client';
import { useEffect, useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { FileText, Shield, Clock, CheckCircle2, AlertCircle, ChevronDown, Upload, Download, FolderOpen, X } from 'lucide-react';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function DocumentsPage() {
  const { data, loading, refresh } = usePortal();
  const [docData, setDocData] = useState<any>(null);
  const [docExpandedYear, setDocExpandedYear] = useState<string | null>(null);
  const [docExpandedFolder, setDocExpandedFolder] = useState<string | null>(null);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [docUploadTarget, setDocUploadTarget] = useState<any>({ category: 'permanent', year: 'Permanent', label: 'Permanent Documents' });
  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);

  useEffect(() => {
    if (data?.client?.id && !docData) {
      fetch(`/api/clients/${data.client.id}/documents`)
        .then(r => r.json())
        .then(setDocData)
        .catch(() => {});
    }
  }, [data]);

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
    fetch(`/api/clients/${data.client.id}/documents`).then(r => r.json()).then(setDocData);
    refresh();
  };

  if (loading) return <div className="portal-loading"><div className="portal-loading-spinner" /></div>;
  if (!data?.client) return <div className="portal-error"><AlertCircle size={48} /><h2>Unable to load documents</h2></div>;

  const docSummary = data.docSummary || {};

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-gray-200)' }}>
      <div className="portal-page-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}><FileText size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Document Center</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Securely view and upload files for your firm.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div className="kpi-card"><div className="kpi-icon blue"><FileText size={18} /></div><div className="kpi-label">Total</div><div className="kpi-value">{docSummary?.total_docs || 0}</div></div>
        <div className="kpi-card"><div className="kpi-icon green"><Shield size={18} /></div><div className="kpi-label">Permanent</div><div className="kpi-value">{docSummary?.permanent_count || 0}</div></div>
        <div className="kpi-card"><div className="kpi-icon yellow"><Clock size={18} /></div><div className="kpi-label">Pending</div><div className="kpi-value">{docSummary?.pending_approval || 0}</div></div>
        <div className="kpi-card"><div className="kpi-icon green"><CheckCircle2 size={18} /></div><div className="kpi-label">Approved</div><div className="kpi-value">{docSummary?.approved || 0}</div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertCircle size={18} /></div><div className="kpi-label">Rejected</div><div className="kpi-value">{docSummary?.rejected || 0}</div></div>
      </div>

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
    </div>
  );
}
