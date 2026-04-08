'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, BarChart2, Settings, LogOut, ClipboardList, ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/platform', icon: BarChart2 },
  { label: 'Organizations', href: '/platform/organizations', icon: Building2 },
  { label: 'Users', href: '/platform/users', icon: Users },
];

const smNavItems = [
  { label: 'Overview', href: '/platform/service-master' },
  { label: 'Wizard Builder', href: '/platform/service-master/wizard' },
  { label: 'Countries & States', href: '/platform/service-master/countries' },
  { label: 'Entity Types', href: '/platform/service-master/entity-types' },
  { label: 'Departments', href: '/platform/service-master/departments' },
  { label: 'Compliance Heads', href: '/platform/service-master/compliance-heads' },
  { label: 'Sub-Compliances', href: '/platform/service-master/sub-compliances' },
  { label: 'Service Rules', href: '/platform/service-master/rules' },
  { label: 'Questions', href: '/platform/service-master/questions' },
  { label: 'Info Forms', href: '/platform/service-master/info-forms' },
  { label: 'Penalties', href: '/platform/service-master/penalties' },
];

const bottomNavItems = [
  { label: 'Settings', href: '/platform/settings', icon: Settings },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [smOpen, setSmOpen] = useState(pathname.startsWith('/platform/service-master'));
  useEffect(() => { try { setUser(JSON.parse(localStorage.getItem('user') || '{}')); } catch {} }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <div className="platform-layout">
      <aside className="platform-sidebar">
        <div className="platform-sidebar-header">
          <div className="brand-logo-sm">A</div>
          <div><h2>Abidebylaw</h2><span>PLATFORM</span></div>
        </div>
        <nav>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`platform-nav-link ${pathname === item.href ? 'active' : ''}`}>
              <item.icon size={18} /> {item.label}
            </Link>
          ))}

          {/* Service Master collapsible section */}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setSmOpen(!smOpen)}
              className={`platform-nav-link ${pathname.startsWith('/platform/service-master') ? 'active' : ''}`}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={18} /> Service Master
              </span>
              {smOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {smOpen && (
              <div style={{ paddingLeft: 20 }}>
                {smNavItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`platform-nav-link ${pathname === item.href ? 'active' : ''}`}
                    style={{ fontSize: 13, padding: '6px 12px' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {bottomNavItems.map(item => (
            <Link key={item.href} href={item.href} className={`platform-nav-link ${pathname === item.href ? 'active' : ''}`}>
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>{user?.email}</div>
          <button onClick={handleLogout} className="platform-nav-link" style={{ color: '#ef4444' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="platform-main">{children}</main>
    </div>
  );
}
