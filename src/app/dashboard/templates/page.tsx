'use client';
import { useEffect, useState } from 'react';
import { FileStack, Plus, Layers, FileText, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch('/api/templates').then(r => r.json()).then(d => {
      setTemplates(d.templates || []);
      setLoading(false);
    }).catch(console.error);
  }

  useEffect(() => { load(); }, []);

  function formatCurrency(n: number) { return n ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD' }).format(n) : '—'; }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Compliance Templates</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Define your products — each template becomes a reusable compliance workflow</p>
        </div>
        <Link href="/dashboard/templates/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <Plus size={18} /> New Template
        </Link>
      </div>

      {/* Template Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
        {templates.map((t: any) => (
          <div className="card" key={t.id} onClick={() => router.push(`/dashboard/templates/${t.id}`)} style={{ cursor: 'pointer', transition: 'all var(--transition-base)' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>{t.name}</h3>
                  <span className="badge badge-gray" style={{ marginRight: 'var(--space-2)' }}>{t.code}</span>
                  {t.category && <span className="badge badge-cyan">{t.category}</span>}
                </div>
                <span className={`badge ${t.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {t.description && <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>{t.description}</p>}
              <div style={{ display: 'flex', gap: 'var(--space-6)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <Layers size={14} style={{ color: 'var(--color-gray-400)' }} />
                  <span className="text-sm">{t.stage_count} stages</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <FileText size={14} style={{ color: 'var(--color-gray-400)' }} />
                  <span className="text-sm">{t.doc_count} documents</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <DollarSign size={14} style={{ color: 'var(--color-gray-400)' }} />
                  <span className="text-sm">{formatCurrency(t.default_price)}</span>
                </div>
              </div>
              <div className="text-xs text-muted" style={{ marginTop: 'var(--space-3)' }}>
                Used in {t.usage_count || 0} project{t.usage_count !== 1 ? 's' : ''} · v{t.version || 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div className="card">
          <div className="empty-state">
            <FileStack size={48} />
            <h3>No templates yet</h3>
            <p>Create your first compliance template to start managing projects.</p>
          </div>
        </div>
      )}
    </>
  );
}
