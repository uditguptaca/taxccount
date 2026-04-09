'use client';
import { useState, useEffect, useRef } from 'react';
import {
  X, Upload, CheckCircle2, AlertCircle, FileText, Calendar,
  ChevronRight, ChevronLeft, Loader2, Shield, Paperclip, Trash2, Info
} from 'lucide-react';

interface InfoField {
  id: string;
  label: string;
  type: string;
  isRequired: boolean;
  placeholder: string | null;
  helpText: string | null;
  options: string[] | null;
}

interface FulfillmentModalProps {
  complianceItemId: string;
  itemTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
}

interface FieldResponse {
  info_field_id: string;
  value_text: string | null;
  value_file_base64: string | null;
  value_file_name: string | null;
  value_file_size: number | null;
}

export default function FulfillmentModal({ complianceItemId, itemTitle, onClose, onSubmitted }: FulfillmentModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [compData, setCompData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0 = info, 1 = fields, 2 = undertaking, 3 = review
  const [responses, setResponses] = useState<Record<string, FieldResponse>>({});
  const [undertakingAccepted, setUndertakingAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(`/api/portal/fulfillment?compliance_item_id=${complianceItemId}`)
      .then(r => r.json())
      .then(data => {
        setCompData(data);
        // Initialize responses
        const initResponses: Record<string, FieldResponse> = {};
        (data.infoFields || []).forEach((f: InfoField) => {
          // Pre-fill from existing submission data if any
          const existing = (data.submissionData || []).find((d: any) => d.infoFieldId === f.id);
          initResponses[f.id] = {
            info_field_id: f.id,
            value_text: existing?.valueText || '',
            value_file_base64: existing?.valueFileUrl || null,
            value_file_name: existing?.valueFileName || null,
            value_file_size: null,
          };
        });
        setResponses(initResponses);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load fulfillment data');
        setLoading(false);
      });
  }, [complianceItemId]);

  const infoFields: InfoField[] = compData?.infoFields || [];
  const hasUndertaking = compData?.selectedCompliance?.undertakingRequired;
  const totalSteps = 2 + (infoFields.length > 0 ? 1 : 0) + (hasUndertaking ? 1 : 0);

  const getStepLabel = (s: number) => {
    const steps = ['Overview'];
    if (infoFields.length > 0) steps.push('Information');
    if (hasUndertaking) steps.push('Undertaking');
    steps.push('Review & Submit');
    return steps[s] || '';
  };

  const getMaxStep = () => totalSteps - 1;

  const canProceed = () => {
    if (step === 0) return true;
    const fieldStepIndex = 1;
    const undertakingStepIndex = infoFields.length > 0 ? 2 : 1;

    if (infoFields.length > 0 && step === fieldStepIndex) {
      // Check required fields
      for (const f of infoFields) {
        if (f.isRequired) {
          const resp = responses[f.id];
          if (f.type === 'attachment') {
            if (!resp?.value_file_base64) return false;
          } else if (f.type === 'checkbox' || f.type === 'undertaking') {
            if (resp?.value_text !== 'true') return false;
          } else {
            if (!resp?.value_text?.trim()) return false;
          }
        }
      }
      return true;
    }
    if (hasUndertaking && step === undertakingStepIndex) {
      return undertakingAccepted;
    }
    return true;
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setResponses(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          value_file_base64: reader.result as string,
          value_file_name: file.name,
          value_file_size: file.size,
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fieldResponses = Object.values(responses).filter(r => r.value_text || r.value_file_base64);
      const res = await fetch('/api/portal/fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compliance_item_id: complianceItemId,
          field_responses: fieldResponses,
          undertaking_accepted: undertakingAccepted,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          onSubmitted();
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Submission failed');
      }
    } catch {
      setError('Network error');
    }
    setSubmitting(false);
  };

  // ── Already Submitted State ──
  if (!loading && compData?.existingSubmission?.status === 'pending_review') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, borderRadius: '16px' }}>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #d4edda, #c3e6cb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} style={{ color: '#28a745' }} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Already Submitted</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', margin: '0 0 8px' }}>
              Your fulfillment for <strong>{itemTitle}</strong> was submitted on {new Date(compData.existingSubmission.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}.
            </p>
            <span className="badge badge-yellow" style={{ fontSize: '0.8rem', padding: '4px 14px' }}>Pending Review</span>
            <div style={{ marginTop: '24px' }}>
              <button className="btn btn-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── No Service Master link ──
  if (!loading && !compData?.selectedCompliance) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, borderRadius: '16px' }}>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Info size={48} style={{ color: 'var(--color-gray-400)', marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px' }}>No Fulfillment Required</h3>
            <p className="text-sm text-muted">This is a manually-added compliance item. There are no admin-defined fields to fill.</p>
            <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: '20px' }}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success Screen ──
  if (showSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ maxWidth: 480, borderRadius: '16px' }}>
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', animation: 'pulse 1s ease-in-out infinite'
            }}>
              <CheckCircle2 size={40} style={{ color: 'white' }} />
            </div>
            <h2 style={{ margin: '0 0 8px', color: '#059669' }}>Submitted Successfully!</h2>
            <p className="text-muted">Your compliance fulfillment is now pending review.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{
        maxWidth: 640, borderRadius: '16px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--color-gray-100)',
          background: compData?.selectedCompliance?.headColor
            ? `linear-gradient(135deg, ${compData.selectedCompliance.headColor}08, ${compData.selectedCompliance.headColor}15)`
            : 'linear-gradient(135deg, #f8fafc, #eef2ff)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {compData?.selectedCompliance?.headColor && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: compData.selectedCompliance.headColor }} />
                )}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-500)' }}>
                  {compData?.selectedCompliance?.headName || 'Compliance Fulfillment'}
                </span>
              </div>
              <h3 style={{ margin: '0', fontSize: '1.15rem' }}>{itemTitle}</h3>
              {compData?.selectedCompliance?.brief && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-gray-500)', lineHeight: 1.4 }}>
                  {compData.selectedCompliance.brief}
                </p>
              )}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0 }}><X size={18} /></button>
          </div>

          {/* Step Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <div style={{
                  height: 4, borderRadius: 2, flex: 1, transition: 'all 0.3s',
                  background: i <= step
                    ? (compData?.selectedCompliance?.headColor || 'var(--color-primary)')
                    : 'var(--color-gray-200)'
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-gray-500)' }}>
              Step {step + 1} of {totalSteps}: {getStepLabel(step)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Loader2 size={32} className="portal-loading-spinner" style={{ margin: '0 auto 12px' }} />
              <p className="text-muted">Loading fulfillment form...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#dc2626' }}>
              <AlertCircle size={32} style={{ marginBottom: 8 }} />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* STEP 0: Overview */}
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f0f9ff, #e8f4fd)',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Shield size={20} style={{ color: '#0284c7' }} />
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>What you need to do</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--color-gray-600)', lineHeight: 1.8 }}>
                      {infoFields.length > 0 && (
                        <li>Fill <strong>{infoFields.length}</strong> required field{infoFields.length > 1 ? 's' : ''} ({infoFields.filter(f => f.type === 'attachment').length > 0 ? 'including document uploads' : 'text and date inputs'})</li>
                      )}
                      {hasUndertaking && <li>Read and accept the compliance <strong>undertaking agreement</strong></li>}
                      <li>Review your submission before final confirmation</li>
                    </ul>
                  </div>

                  {/* Penalties warning */}
                  {compData.penalties && compData.penalties.length > 0 && (
                    <div style={{
                      padding: '14px 16px', borderRadius: '12px',
                      background: '#fef2f2', border: '1px solid #fecaca'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <AlertCircle size={18} style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.875rem' }}>Late Penalties Accrued</span>
                      </div>
                      {compData.penalties.map((p: any) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', color: '#991b1b' }}>
                          <span>{p.description} ({p.daysLate}d late)</span>
                          <strong>${p.amount.toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)' }}>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>Compliance Type</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{compData.selectedCompliance?.subComplianceName}</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)' }}>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>Selection Method</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                        {compData.selectedCompliance?.selectionMethod?.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Fields (if any) */}
              {infoFields.length > 0 && step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {infoFields.map((field, idx) => (
                    <div key={field.id} style={{
                      padding: '16px', borderRadius: '12px', border: '1px solid var(--color-gray-200)',
                      background: 'white', transition: 'border-color 0.2s',
                    }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>
                        {field.label}
                        {field.isRequired && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
                      </label>
                      {field.helpText && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', margin: '0 0 8px' }}>{field.helpText}</p>
                      )}

                      {/* Text input */}
                      {field.type === 'text' && (
                        <input type="text" className="form-input"
                          placeholder={field.placeholder || ''}
                          value={responses[field.id]?.value_text || ''}
                          onChange={e => setResponses(prev => ({ ...prev, [field.id]: { ...prev[field.id], value_text: e.target.value } }))}
                        />
                      )}

                      {/* Number input */}
                      {field.type === 'number' && (
                        <input type="number" className="form-input"
                          placeholder={field.placeholder || ''}
                          value={responses[field.id]?.value_text || ''}
                          onChange={e => setResponses(prev => ({ ...prev, [field.id]: { ...prev[field.id], value_text: e.target.value } }))}
                        />
                      )}

                      {/* Date input */}
                      {(field.type === 'date' || field.type === 'date_month') && (
                        <input type="date" className="form-input"
                          value={responses[field.id]?.value_text || ''}
                          onChange={e => setResponses(prev => ({ ...prev, [field.id]: { ...prev[field.id], value_text: e.target.value } }))}
                        />
                      )}

                      {/* Textarea */}
                      {field.type === 'textarea' && (
                        <textarea className="form-input" rows={3}
                          placeholder={field.placeholder || ''}
                          value={responses[field.id]?.value_text || ''}
                          onChange={e => setResponses(prev => ({ ...prev, [field.id]: { ...prev[field.id], value_text: e.target.value } }))}
                        />
                      )}

                      {/* Select */}
                      {field.type === 'select' && (
                        <select className="form-input"
                          value={responses[field.id]?.value_text || ''}
                          onChange={e => setResponses(prev => ({ ...prev, [field.id]: { ...prev[field.id], value_text: e.target.value } }))}
                        >
                          <option value="">Select...</option>
                          {(field.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}

                      {/* Checkbox */}
                      {field.type === 'checkbox' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox"
                            checked={responses[field.id]?.value_text === 'true'}
                            onChange={e => setResponses(prev => ({ ...prev, [field.id]: { ...prev[field.id], value_text: e.target.checked ? 'true' : 'false' } }))}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span style={{ fontSize: '0.875rem' }}>I confirm</span>
                        </label>
                      )}

                      {/* Undertaking */}
                      {field.type === 'undertaking' && (
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox"
                            checked={responses[field.id]?.value_text === 'true'}
                            onChange={e => setResponses(prev => ({ ...prev, [field.id]: { ...prev[field.id], value_text: e.target.checked ? 'true' : 'false' } }))}
                            style={{ accentColor: 'var(--color-primary)', marginTop: '3px' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
                            I acknowledge and accept this undertaking
                          </span>
                        </label>
                      )}

                      {/* File Attachment */}
                      {field.type === 'attachment' && (
                        <div>
                          {responses[field.id]?.value_file_name ? (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                              borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0'
                            }}>
                              <Paperclip size={16} style={{ color: '#059669' }} />
                              <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500 }}>{responses[field.id]?.value_file_name}</span>
                              <button onClick={() => setResponses(prev => ({
                                ...prev, [field.id]: { ...prev[field.id], value_file_base64: null, value_file_name: null, value_file_size: null }
                              }))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => fileRefs.current[field.id]?.click()}
                              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                              onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--color-gray-300)'; }}
                              onDrop={e => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--color-gray-300)';
                                const file = e.dataTransfer.files[0];
                                if (file) handleFileUpload(field.id, file);
                              }}
                              style={{
                                padding: '24px', borderRadius: '10px', border: '2px dashed var(--color-gray-300)',
                                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                background: 'var(--color-gray-50)'
                              }}
                            >
                              <Upload size={24} style={{ color: 'var(--color-gray-400)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                              <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>
                                Click to upload or drag & drop
                              </span>
                              <input
                                type="file"
                                ref={el => { fileRefs.current[field.id] = el; }}
                                style={{ display: 'none' }}
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(field.id, file);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* STEP: Undertaking (conditional) */}
              {hasUndertaking && step === (infoFields.length > 0 ? 2 : 1) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '20px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
                    border: '1px solid #fde68a'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Shield size={20} style={{ color: '#92400e' }} />
                      <span style={{ fontWeight: 700, color: '#92400e' }}>Compliance Undertaking</span>
                    </div>
                    <div style={{
                      padding: '16px', background: 'white', borderRadius: '8px',
                      fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--color-gray-700)',
                      maxHeight: '200px', overflow: 'auto', border: '1px solid #fde68a'
                    }}>
                      {compData.selectedCompliance?.undertakingText || 'By proceeding, you acknowledge that you understand and accept full responsibility for the accuracy and completeness of the information provided in this compliance submission. You further declare that all documents uploaded are genuine and unaltered.'}
                    </div>
                  </div>

                  <label style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer',
                    padding: '16px', borderRadius: '12px', border: `2px solid ${undertakingAccepted ? '#059669' : 'var(--color-gray-200)'}`,
                    background: undertakingAccepted ? '#f0fdf4' : 'white', transition: 'all 0.2s'
                  }}>
                    <input type="checkbox" checked={undertakingAccepted} onChange={e => setUndertakingAccepted(e.target.checked)}
                      style={{ accentColor: '#059669', marginTop: '2px', width: 18, height: 18 }} />
                    <span style={{ fontSize: '0.875rem', color: undertakingAccepted ? '#059669' : 'var(--color-gray-600)', fontWeight: 500, lineHeight: 1.5 }}>
                      I have read, understood, and accept the undertaking agreement above. I confirm that all information and documents I have provided are accurate and complete.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP: Review */}
              {step === getMaxStep() && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <CheckCircle2 size={18} style={{ color: '#059669' }} />
                      <span style={{ fontWeight: 700, color: '#059669' }}>Ready to Submit</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', margin: 0 }}>
                      Review your responses below. Once submitted, your fulfillment will be sent for review.
                    </p>
                  </div>

                  {infoFields.map(field => {
                    const resp = responses[field.id];
                    let displayValue = resp?.value_text || '—';
                    if (field.type === 'attachment') displayValue = resp?.value_file_name || 'No file';
                    if (field.type === 'checkbox' || field.type === 'undertaking') displayValue = resp?.value_text === 'true' ? '✓ Confirmed' : '✗ Not confirmed';

                    return (
                      <div key={field.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-gray-100)', background: 'white'
                      }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>{field.label}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {field.type === 'attachment' && resp?.value_file_name ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                              <Paperclip size={12} />{displayValue}
                            </span>
                          ) : displayValue}
                        </span>
                      </div>
                    );
                  })}

                  {hasUndertaking && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
                      borderRadius: '8px', background: undertakingAccepted ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${undertakingAccepted ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {undertakingAccepted ? <CheckCircle2 size={16} style={{ color: '#059669' }} /> : <AlertCircle size={16} style={{ color: '#dc2626' }} />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: undertakingAccepted ? '#059669' : '#dc2626' }}>
                        Undertaking {undertakingAccepted ? 'Accepted' : 'Not Accepted'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--color-gray-100)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
            background: 'var(--color-gray-50)'
          }}>
            <button className="btn btn-ghost" onClick={() => step > 0 ? setStep(step - 1) : onClose()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < getMaxStep() ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !canProceed()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}
              >
                {submitting ? <><Loader2 size={16} className="portal-loading-spinner" /> Submitting...</> : <><CheckCircle2 size={16} /> Submit Fulfillment</>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
