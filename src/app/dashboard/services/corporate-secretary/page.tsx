'use client';
import React from 'react';
import Link from 'next/link';
import { 
  Users, UsersRound, MapPin, FileText, Settings, 
  ArrowRightLeft, DollarSign, SplitSquareHorizontal, ShieldAlert,
  Lock, ArrowDownToLine, ChevronRight, Building2, Search, CheckCircle2
} from 'lucide-react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { format } from 'date-fns';

export default function CorporateSecretaryLanding() {
  const { clients, selectedClientId, setSelectedClientId } = useCorporateSecretary();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProvince, setSelectedProvince] = React.useState('');
  
  const [data, setData] = React.useState<{ category: string, projects: any[], stats: any } | null>(null);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  const [projectSearch, setProjectSearch] = React.useState('');

  React.useEffect(() => {
    fetch(`/api/services/corporate-secretary/projects`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoadingProjects(false);
      })
      .catch(e => {
        console.error(e);
        setLoadingProjects(false);
      });
  }, []);

  const filteredClients = React.useMemo(() => {
    return clients.filter(c => {
      if (searchTerm && !c.display_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedProvince && c.state_province !== selectedProvince) return false;
      return true;
    });
  }, [clients, searchTerm, selectedProvince]);

  const provinces = React.useMemo(() => {
    return Array.from(new Set(clients.map(c => c.state_province).filter(Boolean))).sort();
  }, [clients]);

  const corporateChanges = [
    { label: 'Add, update, or remove directors', href: '/dashboard/services/corporate-secretary/directors', icon: Users },
    { label: 'Add, update, or remove officers', href: '/dashboard/services/corporate-secretary/officers', icon: UsersRound },
    { label: 'Change your registered office address', href: '/dashboard/services/corporate-secretary/registered-address', icon: MapPin },
    { label: 'Federal Articles of Amendment', href: '/dashboard/services/corporate-secretary/articles-of-amendment', icon: FileText },
    { label: 'Making Changes to Your Corporation', href: '/dashboard/services/corporate-secretary/overview', icon: Settings },
  ];

  const ownershipChanges = [
    { label: 'Share transfers', href: '/dashboard/services/corporate-secretary/share-transfers', icon: ArrowRightLeft },
    { label: 'Price per Share', href: '/dashboard/services/corporate-secretary/price-per-share', icon: DollarSign },
    { label: 'Share Splits', href: '/dashboard/services/corporate-secretary/share-splits', icon: SplitSquareHorizontal },
    { label: 'Share Restrictions in Corporate Documents', href: '/dashboard/services/corporate-secretary/share-restrictions', icon: ShieldAlert },
    { label: 'Private Issuer Exemption', href: '/dashboard/services/corporate-secretary/private-issuer-exemption', icon: Lock },
    { label: 'Share Repurchases (or "Buy-Backs")', href: '/dashboard/services/corporate-secretary/share-repurchases', icon: ArrowDownToLine },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}>
          <Users size={32} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
          Corporate Secretary Services
        </h1>
        <p style={{ fontSize: '16px', color: '#4B5563', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Make changes to your corporation after you've incorporated. All changes are legally compliant, filed with the government, and stored in your Minute Book automatically.
        </p>
      </div>

      {!selectedClientId ? (
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ padding: '48px 32px 32px 32px', textAlign: 'center', borderBottom: '1px solid var(--color-gray-100)', background: '#F8FAFC' }}>
            <Building2 size={48} style={{ color: '#94A3B8', margin: '0 auto 24px auto' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Choose a Client</h2>
            <p style={{ color: '#64748B', fontSize: '16px', margin: 0 }}>Select or search for the company you'd like to manage corporate secretary records for.</p>
          </div>
          
          <div style={{ padding: '32px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                  type="text" 
                  placeholder="Search client name..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <select 
                  value={selectedProvince} 
                  onChange={e => setSelectedProvince(e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #CBD5E1', color: '#1E293B', padding: '12px 16px', borderRadius: '8px', fontSize: '15px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">All Provinces</option>
                  {provinces.map(p => (
                    <option key={p as string} value={p as string}>{p as string}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredClients.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>No clients found matching your filters.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredClients.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', 
                        background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', 
                        cursor: 'pointer', transition: 'background 0.2s ease', textAlign: 'left'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseOut={e => e.currentTarget.style.background = 'white'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px', marginBottom: '4px' }}>{c.display_name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }}>
                          <span>{c.client_type || 'Corporation'}</span>
                          {c.state_province && (
                            <>
                              <span style={{ color: '#CBD5E1' }}>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {c.state_province}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} style={{ color: '#94A3B8' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Global Tracking Table Section */}
          <div style={{ marginTop: '48px', maxWidth: '1000px', margin: '48px auto 0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Active Compliances</h2>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Global view of all corporate secretary work across the firm.</p>
            </div>

            {loadingProjects ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>Loading projects...</div>
            ) : data && (
              <>
                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '8px' }}>Active Projects</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{data.stats.total - data.stats.completed}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#991B1B', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={14}/> Overdue</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#991B1B' }}>{data.stats.overdue}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14}/> Completed</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#166534' }}>{data.stats.completed}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Tracked</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{data.stats.total}</div>
                  </div>
                </div>

                {/* Main Table */}
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--color-gray-200)', background: '#F9FAFB' }}>
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-gray-400)' }} />
                      <input 
                        type="text" 
                        placeholder="Search clients, projects, or codes..." 
                        value={projectSearch}
                        onChange={e => setProjectSearch(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--color-gray-300)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'white', borderBottom: '1px solid var(--color-gray-200)' }}>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Client</th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Project / Compliance</th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Period</th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Due Date</th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projects.filter(p => 
                        p.client_name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
                        p.template_name?.toLowerCase().includes(projectSearch.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                            No active projects found.
                          </td>
                        </tr>
                      ) : data.projects.filter(p => 
                        p.client_name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
                        p.template_name?.toLowerCase().includes(projectSearch.toLowerCase())
                      ).map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                {p.client_name.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.client_name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{p.client_code}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{p.template_name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={12}/> {p.engagement_code}</div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>
                            {p.period_label || '-'}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#4B5563' }}>
                            {p.due_date ? format(new Date(p.due_date), 'MMM d, yyyy') : 'No Due Date'}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ background: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{p.status.replace('_', ' ')}</span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <button onClick={() => setSelectedClientId(p.client_id)} style={{ textDecoration: 'none', background: 'transparent', border: '1px solid var(--color-gray-200)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          
          {/* Card 1: Corporate Changes */}
          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-gray-100)', background: '#F8FAFC' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Corporate Changes</h2>
              <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>Manage directors, officers, and corporate structure</p>
            </div>
            <div style={{ padding: '16px' }}>
              {corporateChanges.map((item, i) => (
                <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s ease' }} className="hover:bg-gray-50">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
                    <item.icon size={20} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 600, color: '#1E293B', fontSize: '15px' }}>
                    {item.label}
                  </div>
                  <ChevronRight size={20} style={{ color: '#CBD5E1' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Card 2: Changing Ownership Structure */}
          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-gray-100)', background: '#F8FAFC' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Changing Ownership Structure</h2>
              <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>Manage shares, prices, and transfers</p>
            </div>
            <div style={{ padding: '16px' }}>
              {ownershipChanges.map((item, i) => (
                <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s ease' }} className="hover:bg-gray-50">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
                    <item.icon size={20} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 600, color: '#1E293B', fontSize: '15px' }}>
                    {item.label}
                  </div>
                  <ChevronRight size={20} style={{ color: '#CBD5E1' }} />
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
