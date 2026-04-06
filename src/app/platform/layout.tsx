'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, BarChart2, Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/platform', icon: BarChart2 },
  { label: 'Organizations', href: '/platform/organizations', icon: Building2 },
  { label: 'Users', href: '/platform/users', icon: Users },
  { label: 'Settings', href: '/platform/settings', icon: Settings },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
