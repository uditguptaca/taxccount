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

  // Set up canvas for drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'draw') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set clear background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
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
      ctx.fillStyle = '#f9fafb';
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
    <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', background: 'white', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--color-gray-200)', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>Sign Document: {documentName}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '6px 10px', background: 'white', border: '1px solid var(--color-gray-300)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#4B5563' }}>
            <Eye size={14} /> Preview
          </button>
          <button style={{ padding: '6px 10px', background: 'white', border: '1px solid var(--color-gray-300)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#4B5563' }}>
            <Download size={14} /> Download
          </button>
        </div>
      </div>
      
      <div style={{ padding: '20px' }}>
        {isSigned ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F0FDF4', borderRadius: '8px', border: '1px dashed #86EFAC' }}>
            <CheckCircle2 size={48} style={{ color: '#22C55E', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#166534', margin: '0 0 8px 0' }}>Document Signed Successfully</h3>
            <p style={{ color: '#15803D', margin: 0, fontSize: '14px' }}>This document is now ready to be filed or stored in the Minute Book.</p>
            <button onClick={() => setIsSigned(false)} style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#16A34A', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              Reset Signature
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-gray-200)', marginBottom: '16px' }}>
              <button 
                onClick={() => setActiveTab('draw')}
                style={{ padding: '10px 20px', background: 'transparent', border: 'none', borderBottom: activeTab === 'draw' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'draw' ? 'var(--color-primary)' : 'var(--color-gray-500)', fontWeight: activeTab === 'draw' ? 600 : 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PenTool size={16} /> Draw
              </button>
              <button 
                onClick={() => setActiveTab('type')}
                style={{ padding: '10px 20px', background: 'transparent', border: 'none', borderBottom: activeTab === 'type' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'type' ? 'var(--color-primary)' : 'var(--color-gray-500)', fontWeight: activeTab === 'type' ? 600 : 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Type size={16} /> Type
              </button>
            </div>
            
            <div style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--color-gray-200)', position: 'relative', overflow: 'hidden', height: '200px' }}>
              <button 
                onClick={clearSignature}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <X size={12} /> Clear
              </button>
              
              {activeTab === 'draw' ? (
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={200}
                  style={{ width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none' }}
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
                    style={{ width: '100%', maxWidth: '400px', padding: '16px', fontSize: '32px', fontFamily: '"Caveat", "Dancing Script", cursive, serif', fontStyle: 'italic', textAlign: 'center', border: 'none', borderBottom: '2px dashed var(--color-gray-300)', background: 'transparent', outline: 'none', color: '#111827' }}
                  />
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleSignClick}
                style={{ padding: '10px 24px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}
              >
                Apply Signature
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
