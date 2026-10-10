'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { LayoutDashboard, Building2, FileStack, FolderKanban, UsersRound, Receipt, Bell, MessageSquare, Settings, Search, Inbox, Activity, Plus, Timer, LogOut, User, ChevronDown, FileText, BarChart2, UserCircle, Calendar, UserPlus, ClipboardList, Landmark, Calculator, FileDigit, Percent, CalendarCheck, Banknote, Briefcase, Users } from 'lucide-react';

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
  ]},
  { section: 'CRM', items: [
    { label: 'Clients', href: '/dashboard/clients', icon: Building2 },
    { label: 'Leads', href: '/dashboard/leads', icon: UserPlus },
  ]},
  { section: 'Communication', items: [
    { label: 'Inbox', href: '/dashboard/inbox', icon: Inbox, badgeKey: 'inboxCount' },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { label: 'Reminders', href: '/dashboard/reminders', icon: Bell },
  ]},
  { section: 'Finance', items: [
    { label: 'Firm Accounting', href: '/dashboard/accounting', icon: Landmark },
  ]},
  { section: 'Services', items: [
    { label: 'T1 Tax Intake', href: '/dashboard/tax-intake', icon: FileText },
    { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { label: 'Smart Forms', href: '/dashboard/smart-forms', icon: ClipboardList },
    { label: 'Accounting', href: '/dashboard/services/accounting', icon: Calculator },
    { label: 'Direct Tax', href: '/dashboard/services/direct-tax', icon: FileDigit },
    { label: 'Indirect Tax', href: '/dashboard/services/indirect-tax', icon: Percent },
    { label: 'Annual Return', href: '/dashboard/services/annual-return', icon: CalendarCheck },
    { label: 'Payroll', href: '/dashboard/services/payroll', icon: Banknote },
    { label: 'Corporate Secretary', href: '/dashboard/services/corporate-secretary', icon: Users },
  ]},
  { section: 'Management', items: [
    { label: 'Onboarding', href: '/dashboard/onboarding/settings', icon: UserPlus },
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
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerClient, setTimerClient] = useState('');
  const [timerTask, setTimerTask] = useState('');
  const [currentUser, setCurrentUser] = useState<any>({ first_name: '', last_name: '', email: '' });
  const [expandedNavItems, setExpandedNavItems] = useState<string[]>(['Clients', 'Leads', 'Projects']); // Default expanded

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/inbox').then(r => r.json()).then(d => setInboxCount(d.unreadCount || 0)).catch(e => console.error(e));
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser && (savedUser.first_name || savedUser.firstName)) {
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
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {currentUser.org_name ? currentUser.org_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div><span className="sidebar-logo-text">{currentUser.org_name || 'My Firm'}</span><div style={{ fontSize: 10, color: 'var(--color-gray-400)', fontWeight: 500, marginTop: -2 }}>{currentUser.role?.replace('_', ' ') || 'Firm Admin'}</div></div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((section) => {
            // RBAC Filtering natively in UI
            if (currentUser.role === 'team_member') {
              if (section.section === 'Finance' || section.section === 'Management') return null;
            }
            if (currentUser.role === 'external_consultant' || currentUser.role === 'shared_accountant') {
              if (section.section === 'Management') return null; // Consultants cannot see Teams, Templates, Global Onboarding
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
                  <Link href="/dashboard/clients?create=true" onClick={() => setShowNewMenu(false)}><Building2 /> New Client</Link>
                  <Link href="/dashboard/leads?create=true" onClick={() => setShowNewMenu(false)}><UserPlus /> New Lead</Link>
                  <Link href="/dashboard/projects" onClick={() => setShowNewMenu(false)}><FolderKanban /> New Project</Link>
                  <Link href="/dashboard/smart-forms" onClick={() => setShowNewMenu(false)}><ClipboardList /> New Smart Form / Intake</Link>
                  <Link href="/dashboard/billing?create=true" onClick={() => setShowNewMenu(false)}><Receipt /> New Invoice</Link>
                  <Link href="/dashboard/reminders?create=true" onClick={() => setShowNewMenu(false)}><Bell /> New Reminder</Link>
                </div>
              )}
            </div>

            <div className="topbar-icons" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-full)', padding: '2px' }}>
                <button className={`topbar-icon-btn ${isTimerActive ? 'active-timer' : ''}`} title="Time Tracker" onClick={() => setShowTimerModal(!showTimerModal)} style={isTimerActive ? { color: 'var(--color-primary)', background: 'var(--color-primary-light)' } : {}}> 
                  <Timer size={18} />
                  {(isTimerActive || timerSeconds > 0) && <span style={{ marginLeft: 4, fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatTimer(timerSeconds)}</span>}
                </button>
                {(timerSeconds > 0 && !isTimerActive) && (
                  <button className="btn btn-ghost" title="Reset Timer" onClick={() => setTimerSeconds(0)} style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', minHeight: 'auto', color: 'var(--color-gray-500)' }}>Reset</button>
                )}
            </div>

            {showTimerModal && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '40px',
                background: 'white',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '20px',
                width: '320px',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }} onMouseLeave={() => setShowTimerModal(false)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-900)' }}>Time Tracker</h4>
                  <span style={{ fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isTimerActive ? 'var(--color-primary)' : 'var(--color-gray-600)' }}>{formatTimer(timerSeconds)}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button 
                    type="button"
                    className="btn cs-btn-sm" 
                    style={{ flex: 1, height: '36px', fontSize: '13px', background: isTimerActive ? 'var(--cs-red, #ef4444)' : 'var(--cs-accent, #6366f1)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setIsTimerActive(!isTimerActive)}
                  >
                    {isTimerActive ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    type="button"
                    className="btn cs-btn-sm" 
                    style={{ height: '36px', fontSize: '13px', borderColor: 'var(--color-gray-200)', border: '1px solid var(--color-gray-200)', background: 'white', color: 'var(--color-gray-700)', borderRadius: '6px', cursor: 'pointer', padding: '0 12px' }}
                    onClick={() => { setTimerSeconds(0); setIsTimerActive(false); }}
                  >
                    Reset
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', display: 'block', marginBottom: '2px' }}>Client</label>
                    <select 
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', fontSize: '13px', background: 'white', color: 'black' }}
                      value={timerClient}
                      onChange={e => setTimerClient(e.target.value)}
                    >
                      <option value="">-- Internal / No Client --</option>
                      <option value="cd99b82a-e48d-4596-a6df-d7854c4d1932">Maple Leaf Consulting Inc.</option>
                      <option value="83e41a7c-5114-4578-95a6-5156971062cc">Northern Lights Energy Corp.</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', display: 'block', marginBottom: '2px' }}>Task Description</label>
                    <input 
                      type="text" 
                      placeholder="What are you working on?" 
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', fontSize: '13px', background: 'white', color: 'black' }}
                      value={timerTask}
                      onChange={e => setTimerTask(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  disabled={timerSeconds === 0}
                  style={{ marginTop: '8px', height: '36px', fontSize: '13px', background: timerSeconds === 0 ? 'var(--color-gray-300)' : 'var(--cs-emerald, #10b981)', color: 'white', border: 'none', borderRadius: '6px', cursor: timerSeconds === 0 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                  onClick={async () => {
                    alert(`Logged ${Math.round(timerSeconds / 60) || 1} minutes of work on "${timerTask || 'Tasks'}" to the database!`);
                    setIsTimerActive(false);
                    setTimerSeconds(0);
                    setTimerTask('');
                    setShowTimerModal(false);
                  }}
                >
                  Log Time Entry
                </button>
              </div>
            )}
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
              <div className="topbar-avatar" title={currentUser.first_name || currentUser.firstName} onClick={() => { setShowUserMenu(!showUserMenu); setShowNewMenu(false); }} style={{ cursor: 'pointer' }}>
                {(currentUser.first_name || currentUser.firstName) ? (currentUser.first_name || currentUser.firstName).charAt(0) : 'U'}
              </div>
              {showUserMenu && (
                <div className="user-dropdown" onMouseLeave={() => setShowUserMenu(false)}>
                  <div className="user-dropdown-header">
                    <div className="user-name">{currentUser.first_name || currentUser.firstName} {currentUser.last_name || currentUser.lastName}</div>
                    <div className="user-email">{currentUser.email || 'user@example.com'}</div>
                  </div>
                  <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)}><User size={16} /> My Profile</Link>
                  {currentUser.role !== 'team_member' && (
                    <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)}><Settings size={16} /> Settings</Link>
                  )}
                  <button data-testid="sign-out-btn" onClick={async () => { await fetch('/api/auth/logout', {method: 'POST'}); localStorage.removeItem('user'); window.location.href = '/login'; }}><LogOut size={16} /> Sign Out</button>
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
