import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, X, PenTool, Type, CheckCircle2 } from 'lucide-react';

interface ESignaturePanelProps {
  documentName: string;
  onSignComplete?: () => void;
  defaultName?: string;
}

export default function ESignaturePanel({ documentName, onSignComplete, defaultName = '' }: ESignaturePanelProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(defaultName);
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const getPreviewHtml = () => {
    if (documentName.includes('Consent')) {
      return `
        <div style="border: 1px solid #ddd; padding: 40px; background: white; font-family: 'Times New Roman', serif; color: #222; text-align: left; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h2 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 24px; text-transform: uppercase;">CONSENT TO ACT AS DIRECTOR</h2>
          <p style="margin-bottom: 16px;"><strong>TO:</strong> MAPLE LEAF CONSULTING INC. (the "Corporation")</p>
          <p style="text-align: justify; margin-bottom: 24px;">
            I hereby consent to act as a director of the Corporation, effective immediately, and agree to perform my duties in accordance with the Canada Business Corporations Act and the by-laws of the Corporation.
          </p>
          <p style="margin-bottom: 8px;">My address for service is:</p>
          <p style="margin-bottom: 24px; font-style: italic;">123 Pinecrest Ave, Toronto, ON</p>
          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>
              <div style="border-bottom: 1px solid #000; width: 200px; height: 30px; font-family: 'Caveat', cursive, sans-serif; font-size: 20px; font-style: italic; color: #3b82f6;">${typedSignature || 'Jane Thompson'}</div>
              <div style="font-size: 12px; margin-top: 4px;">Signature</div>
            </div>
            <div>
              <div style="height: 30px;">July 11, 2026</div>
              <div style="font-size: 12px; margin-top: 4px;">Date</div>
            </div>
          </div>
        </div>
      `;
    }
    
    return `
      <div style="border: 1px solid #ddd; padding: 40px; background: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; text-align: left; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 24px; color: #0f172a;">MUTUAL NON-DISCLOSURE AGREEMENT</h2>
        <p style="text-align: justify; margin-bottom: 16px;">
          This Mutual Non-Disclosure Agreement (the "Agreement") is entered into by and between the Corporation and the undersigned party (collectively the "Parties") to protect proprietary and confidential information.
        </p>
        <p style="text-align: justify; margin-bottom: 24px;">
          The Parties agree to maintain the confidentiality of all shared business strategies, software source code, customer records, and financial disclosures for a period of three (3) years from the effective date.
        </p>
        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div>
            <div style="border-bottom: 1px solid #000; width: 200px; height: 30px; font-family: 'Caveat', cursive, sans-serif; font-size: 20px; font-style: italic; color: #3b82f6;">${typedSignature || 'Jane Thompson'}</div>
            <div style="font-size: 12px; margin-top: 4px;">Signed By</div>
          </div>
          <div>
            <div style="height: 30px;">July 11, 2026</div>
            <div style="font-size: 12px; margin-top: 4px;">Date</div>
          </div>
        </div>
      </div>
    `;
  };

  // Set up canvas for drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'draw') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set clear background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      setTypedSignature('');
    }
    setIsSigned(false);
  };

  const handleSignClick = () => {
    setIsSigned(true);
    if (onSignComplete) onSignComplete();
  };

  return (
    <div className="cs-signature" style={{ minWidth: '320px' }}>
      <div className="cs-signature-header">
        <div style={{ fontWeight: 600, fontSize: '15px' }}>Sign Document: {documentName}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="cs-btn cs-btn-secondary cs-btn-sm" 
            onClick={() => setShowPreviewModal(true)}
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <Eye size={13} /> Preview
          </button>
          <button 
            className="cs-btn cs-btn-secondary cs-btn-sm" 
            onClick={() => {
              const html = getPreviewHtml();
              const blob = new Blob([`<html><head><title>${documentName}</title></head><body>${html}</body></html>`], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${documentName.replace(/\s+/g, '_')}.html`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <Download size={13} /> Download
          </button>
        </div>
      </div>
      
      <div className="cs-card-body" style={{ padding: '24px' }}>
        {isSigned ? (
          <div className="cs-signature-success">
            <CheckCircle2 size={44} style={{ color: 'var(--cs-emerald)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cs-emerald)', margin: '0 0 4px 0' }}>Document Signed Successfully</h3>
            <p style={{ color: 'var(--cs-emerald)', margin: 0, fontSize: '13px' }}>This document is now ready to be filed or stored in the Minute Book.</p>
            <button onClick={() => setIsSigned(false)} className="cs-btn cs-btn-ghost cs-btn-sm" style={{ marginTop: '16px', color: 'var(--cs-emerald)', textDecoration: 'underline' }}>
              Reset Signature
            </button>
          </div>
        ) : (
          <>
            <div className="cs-section-tabs" style={{ borderBottom: '1px solid var(--cs-border-light)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <button 
                onClick={() => setActiveTab('draw')}
                className={`cs-section-tab ${activeTab === 'draw' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <PenTool size={14} /> Draw Signature
              </button>
              <button 
                onClick={() => setActiveTab('type')}
                className={`cs-section-tab ${activeTab === 'type' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Type size={14} /> Type Signature
              </button>
            </div>
            
            <div style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--cs-border)', position: 'relative', overflow: 'hidden', height: '200px' }}>
              <button 
                onClick={clearSignature}
                className="cs-btn cs-btn-secondary cs-btn-sm"
                style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, color: 'var(--cs-red)', borderColor: 'var(--cs-red)' }}
              >
                <X size={12} /> Clear
              </button>
              
              {activeTab === 'draw' ? (
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="cs-signature-canvas"
                  style={{ width: '100%', height: '100%', touchAction: 'none' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px' }}>
                  <input 
                    type="text" 
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type your full name here"
                    style={{ width: '100%', maxWidth: '400px', padding: '16px', fontSize: '32px', fontFamily: '"Caveat", "Dancing Script", cursive, serif', fontStyle: 'italic', textAlign: 'center', border: 'none', borderBottom: '2px dashed var(--cs-border)', background: 'transparent', outline: 'none', color: 'var(--cs-text-primary)' }}
                  />
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleSignClick}
                className="cs-btn cs-btn-primary"
              >
                Apply Signature
              </button>
            </div>
          </>
        )}
      </div>

      {showPreviewModal && (
        <div className="cs-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="cs-modal" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="cs-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Document Preview</h2>
              <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setShowPreviewModal(false)}>Close</button>
            </div>
            <div className="cs-modal-body" style={{ overflowY: 'auto', background: '#f8fafc', padding: '24px' }}>
              <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
