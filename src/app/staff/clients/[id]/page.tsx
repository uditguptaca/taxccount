'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Globe, Calendar, User,
  CheckCircle, Clock, AlertTriangle, DollarSign, FolderKanban, ChevronDown
} from 'lucide-react';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function StaffClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEng, setExpandedEng] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/clients/${params.id}?user_id=${user.id}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading client details...</div>;
  if (!data || !data.client) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Client not found.</div>;

  const { client, engagements, stages, billing } = data;
  const typeColor: Record<string, string> = { individual: '#6366f1', business: '#10b981', trust: '#f59e0b', sole_proprietor: '#8b5cf6' };
  const statusColors: Record<string, string> = { completed: 'var(--color-success)', in_progress: '#6366f1', pending: 'var(--color-warning)', not_started: 'var(--color-gray-400)' };

  const getStagesForEngagement = (engId: string) => (stages || []).filter((s: any) => s.engagement_code === engagements.find((e: any) => e.id === engId)?.engagement_code);

  return (
    <>
      {/* Back + Header */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.push('/staff/clients')} style={{ marginBottom: 'var(--space-3)' }}>
          <ArrowLeft size={16} /> Back to My Clients
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: `${typeColor[client.client_type] || '#6366f1'}15`, color: typeColor[client.client_type] || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
              {client.display_name?.[0]}
            </div>
            <div>
              <h1 style={{ margin: 0 }}>{client.display_name}</h1>
              <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 2 }}>
                <span>{client.client_code}</span>
                <span className="badge" style={{ background: `${typeColor[client.client_type] || '#6366f1'}15`, color: typeColor[client.client_type] || '#6366f1' }}>{client.client_type?.replace(/_/g, ' ')}</span>
                <span className={`badge ${client.status === 'active' ? 'badge-green' : 'badge-gray'}`}><span className="badge-dot"></span>{client.status}</span>
              </div>
            </div>
          </div>
          <div className="badge badge-yellow" style={{ padding: '6px 10px', fontSize: 'var(--font-size-xs)' }}>🔒 Read-Only View</div>
        </div>
      </div>

      {/* Contact + Billing Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div className="card">
          <div className="card-header"><h3>Contact Details</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {client.email && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}><Mail size={14} style={{ color: 'var(--color-gray-400)' }} /> {client.email}</div>}
              {client.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}><Phone size={14} style={{ color: 'var(--color-gray-400)' }} /> {client.phone}</div>}
              {(client.city || client.province) && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}><MapPin size={14} style={{ color: 'var(--color-gray-400)' }} /> {[client.address, client.city, client.province, client.postal_code].filter(Boolean).join(', ')}</div>}
              {client.website && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}><Globe size={14} style={{ color: 'var(--color-gray-400)' }} /> {client.website}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}><Calendar size={14} style={{ color: 'var(--color-gray-400)' }} /> Since {formatDate(client.created_at)}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Billing Summary</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm text-muted">Total Billed</span>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{formatCurrency((billing as any)?.total_billed)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm text-muted">Completed Value</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency((billing as any)?.completed_amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm text-muted">Pending Value</span>
                <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{formatCurrency((billing as any)?.pending_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>My Involvement</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm text-muted">My Engagements</span>
                <span className="badge badge-blue" style={{ fontSize: 14, fontWeight: 700 }}>{engagements?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm text-muted">My Active Stages</span>
                <span className="badge badge-yellow">{(stages || []).filter((s: any) => s.status !== 'completed').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm text-muted">Completed Stages</span>
                <span className="badge badge-green">{(stages || []).filter((s: any) => s.status === 'completed').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Engagements */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><FolderKanban size={18} /> Compliance Engagements</h3>
          <span className="badge badge-gray">{engagements?.length} engagements</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(engagements || []).map((eng: any) => {
            const engStages = (stages || []).filter((s: any) => {
              const matchEng = engagements.find((e: any) => e.id === eng.id);
              return matchEng && s.engagement_code === matchEng.engagement_code;
            });
            const isExpanded = expandedEng === eng.id;
            const progress = eng.total_stages > 0 ? Math.round((eng.completed_stages / eng.total_stages) * 100) : 0;

            return (
              <div key={eng.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setExpandedEng(isExpanded ? null : eng.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{eng.template_name || 'Engagement'}</div>
                      <div className="text-xs text-muted">{eng.engagement_code} · FY {eng.financial_year}</div>
                    </div>
                    <span className={`badge ${eng.compliance_type === 'T1' ? 'badge-blue' : eng.compliance_type === 'T2' ? 'badge-green' : 'badge-cyan'}`} style={{ fontSize: 10 }}>
                      {eng.compliance_type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: 120 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span className="text-xs text-muted">{eng.completed_stages}/{eng.total_stages} stages</span>
                        <span className="text-xs" style={{ fontWeight: 600 }}>{progress}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--color-success)' : '#6366f1', borderRadius: 3, transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{formatCurrency(eng.price)}</div>
                      <div className="text-xs text-muted">Due {formatDate(eng.due_date)}</div>
                    </div>
                    <span className={`badge ${eng.status === 'completed' ? 'badge-green' : eng.status === 'in_progress' ? 'badge-blue' : 'badge-yellow'}`}>
                      {eng.status?.replace(/_/g, ' ')}
                    </span>
                    <ChevronDown size={16} style={{ color: 'var(--color-gray-400)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>

                {/* Expanded Stage Pipeline */}
                {isExpanded && (
                  <div style={{ padding: '0 var(--space-4) var(--space-4)', background: 'var(--color-gray-50)' }}>
                    <div className="text-xs text-muted" style={{ fontWeight: 600, marginBottom: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>STAGE PIPELINE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {engStages.length > 0 ? engStages.map((stage: any, i: number) => (
                        <div key={stage.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: 'var(--space-2) var(--space-3)',
                          background: 'white', borderRadius: 'var(--radius-md)',
                          borderLeft: `3px solid ${statusColors[stage.status] || 'var(--color-gray-300)'}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            {stage.status === 'completed' ? <CheckCircle size={14} style={{ color: 'var(--color-success)' }} /> :
                              stage.status === 'in_progress' ? <Clock size={14} style={{ color: '#6366f1' }} /> :
                                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--color-gray-300)' }}></div>}
                            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>{stage.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span className="text-xs text-muted">
                              {stage.assigned_name || 'Unassigned'}
                            </span>
                            <span className={`badge ${stage.status === 'completed' ? 'badge-green' : stage.status === 'in_progress' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                              {stage.status?.replace(/_/g, ' ')}
                            </span>
                            {stage.completed_at && <span className="text-xs text-muted">✓ {formatDate(stage.completed_at)}</span>}
                          </div>
                        </div>
                      )) : (
                        <div className="text-xs text-muted text-center" style={{ padding: 'var(--space-3)' }}>No stage data available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
