'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Mail, Phone, Briefcase, Building2 } from 'lucide-react';

export default function StaffTeamPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { router.push('/'); return; }
    fetch(`/api/staff/dashboard?user_id=${user.id}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-gray-400)', textAlign: 'center' }}>Loading team...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)', textAlign: 'center' }}>Failed to load team data.</div>;

  const { teammates, user } = data;

  // Add current user to the list for display
  const allMembers = [
    { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email, role: user.role, team_name: user.team_name, role_in_team: user.role_in_team, isMe: true },
    ...(teammates || []).map((t: any) => ({ ...t, isMe: false })),
  ];

  const roleColors: Record<string, string> = {
    super_admin: '#dc2626',
    admin: '#dc2626',
    team_manager: '#d97706',
    team_member: '#6366f1',
  };

  const bgGradients = [
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #0891b2, #0e7490)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #14b8a6, #0d9488)',
  ];

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Users size={28} /> Team & Colleagues</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Your team members and firm colleagues</p>
        </div>
        <span className="badge badge-blue" style={{ padding: '6px 12px', fontSize: 12 }}>{allMembers.length} Members</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {allMembers.map((m: any, i: number) => (
          <div key={m.id} className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', border: m.isMe ? '2px solid #6366f1' : undefined }}>
            {/* Color bar */}
            <div style={{ height: 4, background: bgGradients[i % bgGradients.length] }}></div>
            <div style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-full)',
                  background: bgGradients[i % bgGradients.length],
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 'var(--font-size-lg)', flexShrink: 0
                }}>
                  {m.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {m.name}
                    {m.isMe && <span className="badge badge-blue" style={{ fontSize: 9 }}>You</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                    <span className="badge" style={{
                      fontSize: 10, background: `${roleColors[m.role] || '#6366f1'}15`,
                      color: roleColors[m.role] || '#6366f1',
                      border: `1px solid ${roleColors[m.role] || '#6366f1'}30`
                    }}>
                      {m.role?.replace(/_/g, ' ')}
                    </span>
                    {m.role_in_team && (
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>{m.role_in_team}</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                  <Mail size={14} /> {m.email}
                </div>
                {m.team_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                    <Building2 size={14} /> {m.team_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
