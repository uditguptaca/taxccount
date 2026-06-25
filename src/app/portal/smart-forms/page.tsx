'use client';
import { useEffect, useState } from 'react';
import { FileText, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PortalSmartFormsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/portal/smart-forms');
      const data = await res.json();
      setAssignments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium flex items-center gap-1.5"><CheckCircle2 size={14}/> Completed</span>;
      case 'In progress': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium flex items-center gap-1.5"><Clock size={14}/> In Progress</span>;
      case 'Needs revision': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1.5"><AlertCircle size={14}/> Action Required</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1.5">To Do</span>;
    }
  };

  return (
    <div className="portal-content-area" style={{ padding: 'var(--space-6)', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: 'var(--space-2)' }}>Data Collection Forms</h1>
        <p style={{ color: '#6b7280' }}>Please complete the following forms assigned by your consultant.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: '#6b7280' }}>Loading forms...</div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #e5e7eb' }}>
          <FileText size={40} style={{ margin: '0 auto var(--space-4)', color: '#d1d5db' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: 'var(--space-2)' }}>No forms assigned</h3>
          <p style={{ color: '#6b7280' }}>You do not have any pending data collection forms.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {assignments.map(a => (
            <div key={a.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #e5e7eb', padding: 'var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{a.form_name}</h3>
                  {getStatusBadge(a.status)}
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Assigned on {new Date(a.assigned_at).toLocaleDateString()}</p>
              </div>
              
              <Link href={`/portal/smart-forms/fill/${a.id}`}>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {a.status === 'Not started' ? 'Start Form' : 'Continue'} <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
