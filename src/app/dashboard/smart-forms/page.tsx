'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreVertical, FileText, CheckCircle2, Archive, Globe, Tag, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SmartFormsListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/smart-forms');
      const data = await res.json();
      setForms(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await fetch('/api/smart-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Smart Form', country: 'Canada', compliance_type: 'Tax' })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/smart-forms/builder/${data.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredForms = forms.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Smart Forms</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Manage AI-powered structured data collection forms.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/dashboard/settings/smart-forms" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Settings size={16} /> Settings
          </Link>
          <button onClick={handleCreateNew} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Plus size={16} /> Create Smart Form
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
          <input 
            type="text"
            placeholder="Search forms by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Filter size={16} className="text-muted" />
          <select 
            className="form-select input-sm" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-500)' }}>Loading forms...</div>
      ) : filteredForms.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Smart Forms found</h3>
            <p>Try adjusting your search filters or create a new form.</p>
            <button onClick={handleCreateNew} className="btn btn-primary mt-4">
              Create Smart Form
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredForms.map(form => (
            <div key={form.id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div className="card-body" style={{ flex: 1 }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '2px', fontWeight: 600 }}>{form.name}</h3>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={12} /> {form.country || 'Global'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12} /> {form.compliance_type || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                    <MoreVertical size={16} className="text-muted" />
                  </button>
                </div>

                <p className="text-sm text-muted" style={{ height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 'var(--space-5)' }}>
                  {form.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-gray-100)', borderBottom: '1px solid var(--color-gray-100)', padding: 'var(--space-3) 0', marginBottom: 'var(--space-4)' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{form.question_count || 0}</div>
                    <div className="text-xs text-muted">Questions</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--color-gray-100)' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{form.doc_count || 0}</div>
                    <div className="text-xs text-muted">Docs</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--color-gray-100)' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{form.usage_count || 0}</div>
                    <div className="text-xs text-muted">Uses</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${
                    form.status === 'Active' ? 'badge-green' :
                    form.status === 'Draft' ? 'badge-yellow' :
                    'badge-gray'
                  }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {form.status === 'Active' && <CheckCircle2 size={12} />}
                    {form.status === 'Draft' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
                    {form.status === 'Archived' && <Archive size={12} />}
                    {form.status}
                  </span>
                  
                  <Link href={`/dashboard/smart-forms/builder/${form.id}`} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>
                    Edit Builder →
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
