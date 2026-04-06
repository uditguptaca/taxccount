'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { LayoutDashboard, Building2, FileStack, FolderKanban, UsersRound, Receipt, Bell, MessageSquare, Settings, Search, Inbox, Activity, Plus, Timer, LogOut, User, ChevronDown, FileText, BarChart2, UserCircle, Calendar, UserPlus } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badgeKey?: string;
  subItems?: { label: string; href: string }[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const navItems: NavSection[] = [
  { section: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { label: 'Inbox', href: '/dashboard/inbox', icon: Inbox, badgeKey: 'inboxCount' },
  ]},
  { section: 'CRM', items: [
    { label: 'Clients', href: '/dashboard/clients', icon: Building2 },
    { label: 'Leads', href: '/dashboard/leads', icon: UserPlus },
    { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  ]},
  { section: 'Communication', items: [
    { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { label: 'Reminders', href: '/dashboard/reminders', icon: Bell },
  ]},
  { section: 'Finance', items: [
    { label: 'Billing', href: '/dashboard/billing', icon: Receipt },
  ]},
  { section: 'Management', items: [
    { label: 'Documents', href: '/dashboard/documents', icon: FileText },
    { label: 'Templates', href: '/dashboard/templates', icon: FileStack },
    { label: 'Teams', href: '/dashboard/teams', icon: UsersRound },
    { label: 'Activity', href: '/dashboard/activity', icon: Activity },
    { label: 'Reports', href: '/dashboard/reports', icon: BarChart2 },
  ]},
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>({ firstName: 'Sarah', lastName: 'Mitchell', email: 'admin@taxccount.ca' });
  const [expandedNavItems, setExpandedNavItems] = useState<string[]>(['Clients', 'Leads', 'Projects']); // Default expanded

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/inbox').then(r => r.json()).then(d => setInboxCount(d.unreadCount || 0)).catch(e => console.error(e));
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser && savedUser.firstName) {
      setCurrentUser(savedUser);
    }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else if (!isTimerActive && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setShowSearchDrop(false); return; }
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        const lowerQ = q.toLowerCase();
        const filtered = (data.clients || []).filter((c: any) => 
          c.display_name?.toLowerCase().includes(lowerQ) || 
          c.client_code?.toLowerCase().includes(lowerQ) ||
          c.email?.toLowerCase().includes(lowerQ)
        );
        setSearchResults(filtered.slice(0, 5));
        setShowSearchDrop(true);
      } catch {}
    }, 300);
  };

  const badges: Record<string, number> = { inboxCount };

  const toggleNavExpand = (label: string) => {
    setExpandedNavItems(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>A</div>
          <div><span className="sidebar-logo-text">Abidebylaw</span><div style={{ fontSize: 10, color: 'var(--color-gray-400)', fontWeight: 500, marginTop: -2 }}>{currentUser.org_name || 'Firm Admin'}</div></div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((section) => {
            // RBAC Filtering natively in UI
            if (currentUser.role === 'team_member') {
              if (section.section === 'Finance' || section.section === 'Management') return null;
            }
            if (currentUser.role === 'client') return null; // Client has own portal

            return (
            <div className="sidebar-section" key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const badgeVal = (item as any).badgeKey ? badges[(item as any).badgeKey] : 0;
                return (
                  <div key={item.label} style={{ marginBottom: 0 }}>
                    <div style={{ position: 'relative' }}>
                      <Link href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                        <Icon />
                        <span>{item.label}</span>
                        {badgeVal > 0 && <span className="badge">{badgeVal}</span>}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            );
          })}
        </nav>
        {currentUser.role !== 'team_member' && currentUser.role !== 'client' && (
          <div style={{ padding: 'var(--space-4) var(--space-3)', borderTop: '1px solid var(--color-gray-100)' }}>
            <Link href="/dashboard/settings" className={`sidebar-link ${pathname.startsWith('/dashboard/settings') ? 'active' : ''}`}>
              <Settings />
              <span>Settings</span>
            </Link>
          </div>
        )}
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-search" style={{ position: 'relative' }}>
              <Search />
              <input type="text" placeholder="Search clients, projects..." value={searchQuery} onChange={e => handleSearch(e.target.value)} onFocus={() => searchQuery.trim() && setShowSearchDrop(true)} />
              {showSearchDrop && (
                <div className="search-results-dropdown" onMouseLeave={() => setShowSearchDrop(false)}>
                  <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', borderBottom: '1px solid var(--color-gray-100)', backgroundColor: 'var(--color-gray-50)' }}>CLIENTS</div>
                  {searchResults.map(c => (
                     <Link key={c.id} href={`/dashboard/clients`} className="search-result-item" onClick={() => setShowSearchDrop(false)}>
                       <Building2 size={14} style={{ color: 'var(--color-primary)' }} />
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                         <div style={{ fontWeight: 500, fontSize: '13px', lineHeight: 1 }}>{c.display_name}</div>
                         <div className="text-xs text-muted" style={{ lineHeight: 1 }}>{c.client_code} · {c.email}</div>
                       </div>
                     </Link>
                  ))}
                  {searchResults.length === 0 && <div className="text-sm text-muted" style={{ padding: '12px 16px' }}>No clients found for "{searchQuery}"</div>}
                </div>
              )}
            </div>
          </div>
          <div className="topbar-right">
            {/* +New Button */}
            <div style={{ position: 'relative' }}>
              <button className="global-new-btn" onClick={() => { setShowNewMenu(!showNewMenu); setShowUserMenu(false); }}>
                <Plus size={16} /> New <ChevronDown size={14} />
              </button>
              {showNewMenu && (
                <div className="global-new-dropdown" onMouseLeave={() => setShowNewMenu(false)}>
                  <Link href="/dashboard/clients" onClick={() => setShowNewMenu(false)}><Building2 /> New Client</Link>
                  <Link href="/dashboard/leads?create=true" onClick={() => setShowNewMenu(false)}><UserPlus /> New Lead</Link>
                  <Link href="/dashboard/projects" onClick={() => setShowNewMenu(false)}><FolderKanban /> New Project</Link>
                  <Link href="/dashboard/billing?create=true" onClick={() => setShowNewMenu(false)}><Receipt /> New Invoice</Link>
                  <Link href="/dashboard/reminders?create=true" onClick={() => setShowNewMenu(false)}><Bell /> New Reminder</Link>
                </div>
              )}
            </div>

            <div className="topbar-icons" style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-full)', padding: '2px' }}>
                <button className={`topbar-icon-btn ${isTimerActive ? 'active-timer' : ''}`} title={isTimerActive ? "Stop Timer" : "Start Timer"} onClick={() => setIsTimerActive(!isTimerActive)} style={isTimerActive ? { color: 'var(--color-primary)', background: 'var(--color-primary-light)' } : {}}> 
                  <Timer size={18} />
                  {(isTimerActive || timerSeconds > 0) && <span style={{ marginLeft: 4, fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatTimer(timerSeconds)}</span>}
                </button>
                {(timerSeconds > 0 && !isTimerActive) && (
                  <button className="btn btn-ghost" title="Reset Timer" onClick={() => setTimerSeconds(0)} style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', minHeight: 'auto', color: 'var(--color-gray-500)' }}>Reset</button>
                )}
            </div>
            <button className="topbar-icon-btn" title="Notifications" onClick={() => router.push('/dashboard/inbox')}>
              <Bell size={18} />
              {inboxCount > 0 && <span className="notification-dot"></span>}
            </button>
            <button className="topbar-icon-btn" title="Messages" onClick={() => router.push('/dashboard/messages')}>
              <MessageSquare size={18} />
            </button>
            </div>

            {/* User Avatar */}
            <div style={{ position: 'relative' }}>
              <div className="topbar-avatar" title={currentUser.firstName} onClick={() => { setShowUserMenu(!showUserMenu); setShowNewMenu(false); }} style={{ cursor: 'pointer' }}>
                {currentUser.firstName ? currentUser.firstName.charAt(0) : 'U'}
              </div>
              {showUserMenu && (
                <div className="user-dropdown" onMouseLeave={() => setShowUserMenu(false)}>
                  <div className="user-dropdown-header">
                    <div className="user-name">{currentUser.firstName} {currentUser.lastName}</div>
                    <div className="user-email">{currentUser.email || 'user@taxccount.ca'}</div>
                  </div>
                  <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)}><User size={16} /> My Profile</Link>
                  {currentUser.role !== 'team_member' && (
                    <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)}><Settings size={16} /> Settings</Link>
                  )}
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
