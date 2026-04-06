'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, ClipboardList, FolderKanban, Users, BarChart2, Settings,
  Bell, Timer, LogOut, User, Calendar, Briefcase, Inbox, UserCheck,
  Target, MessageSquare, Clock
} from 'lucide-react';

const staffNavItems = [
  { section: 'Main', items: [
    { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
    { label: 'Calendar', href: '/staff/calendar', icon: Calendar },
    { label: 'Inbox', href: '/staff/inbox', icon: Inbox },
  ]},
  { section: 'Work', items: [
    { label: 'My Tasks', href: '/staff/tasks', icon: ClipboardList },
    { label: 'Projects', href: '/staff/projects', icon: FolderKanban },
    { label: 'My Clients', href: '/staff/clients', icon: UserCheck },
    { label: 'Leads', href: '/staff/leads', icon: Target },
  ]},
  { section: 'Communication', items: [
    { label: 'Messages', href: '/staff/messages', icon: MessageSquare },
    { label: 'Reminders', href: '/staff/reminders', icon: Clock },
  ]},
  { section: 'Team', items: [
    { label: 'Colleagues', href: '/staff/team', icon: Users },
  ]},
  { section: 'Insights', items: [
    { label: 'Performance', href: '/staff/reports', icon: BarChart2 },
  ]},
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>({ firstName: 'Staff', lastName: 'User', email: 'staff@taxccount.ca' });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser && savedUser.firstName) setCurrentUser(savedUser);
    if (!savedUser || !savedUser.id) { router.push('/'); return; }
    if (savedUser.role === 'client') { router.push('/portal'); return; }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTimer = (t: number) => `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>A</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="sidebar-logo-text">Abidebylaw</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '-2px' }}>Staff Portal</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {staffNavItems.map((section) => (
            <div className="sidebar-section" key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/staff' && pathname.startsWith(item.href));
                return (
                  <Link key={item.label} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: 'var(--space-4) var(--space-3)', borderTop: '1px solid var(--color-gray-100)' }}>
          <Link href="/staff/settings" className={`sidebar-link ${pathname.startsWith('/staff/settings') ? 'active' : ''}`}>
            <Settings />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Briefcase size={20} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-gray-600)' }}>My Assignments</span>
            </div>
          </div>
          <div className="topbar-right">
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-full)', padding: '2px' }}>
              <button className={`topbar-icon-btn ${isTimerActive ? 'active-timer' : ''}`} title={isTimerActive ? "Stop Timer" : "Start Timer"} onClick={() => setIsTimerActive(!isTimerActive)} style={isTimerActive ? { color: 'var(--color-primary)', background: 'var(--color-primary-light)' } : {}}>
                <Timer size={18} />
                {(isTimerActive || timerSeconds > 0) && <span style={{ marginLeft: 4, fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatTimer(timerSeconds)}</span>}
              </button>
              {(timerSeconds > 0 && !isTimerActive) && (
                <button className="btn btn-ghost" title="Reset Timer" onClick={() => setTimerSeconds(0)} style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', minHeight: 'auto', color: 'var(--color-gray-500)' }}>Reset</button>
              )}
            </div>

            <button className="topbar-icon-btn" title="Notifications" onClick={() => router.push('/staff/inbox')}>
              <Bell size={18} />
            </button>

            <div style={{ position: 'relative' }}>
              <div className="topbar-avatar" title={currentUser.first_name || currentUser.firstName} onClick={() => setShowUserMenu(!showUserMenu)} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                {(currentUser.first_name || currentUser.firstName || 'S').charAt(0)}
              </div>
              {showUserMenu && (
                <div className="user-dropdown" onMouseLeave={() => setShowUserMenu(false)}>
                  <div className="user-dropdown-header">
                    <div className="user-name">{currentUser.first_name || currentUser.firstName} {currentUser.last_name || currentUser.lastName}</div>
                    <div className="user-email">{currentUser.email || 'staff@taxccount.ca'}</div>
                  </div>
                  <Link href="/staff/settings" onClick={() => setShowUserMenu(false)}><User size={16} /> My Profile</Link>
                  <button onClick={async () => { await fetch('/api/auth/logout', {method: 'POST'}); localStorage.removeItem('user'); router.push('/'); }}><LogOut size={16} /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
