'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Home, FileText, MessageSquare, ClipboardList, CreditCard, Bell, LogOut, UploadCloud, User, Menu, X, ChevronDown, Shield } from 'lucide-react';
import { PortalProvider } from '@/components/portal/PortalContext';
import PortalSidebar from '@/components/portal/PortalSidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [clientName, setClientName] = useState('Client');
  const [clientEmail, setClientEmail] = useState('');
  const [badges, setBadges] = useState<any>({});
  const [accessibleAccounts, setAccessibleAccounts] = useState<any[]>([]);
  const [activeAccountName, setActiveAccountName] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isIndividual, setIsIndividual] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || (user.role !== 'client' && user.role !== 'individual')) {
      router.push('/');
    } else {
      setClientName(`${user.first_name} ${user.last_name}`);
      setClientEmail(user.email);
      setIsIndividual(user.role === 'individual');
    }
  }, [router]);

  // Fetch dashboard meta
  const fetchBadges = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const clientIdParam = urlParams.get('client_id');
      const fetchUrl = clientIdParam ? `/api/portal/dashboard?client_id=${clientIdParam}` : `/api/portal/dashboard`;
      
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        setBadges({
          chats: data.statusSummary?.unread_messages || 0,
          requests: data.statusSummary?.pending_actions || 0,
          billing: data.billing?.unpaid_count || 0,
        });
        if (data.accessible_accounts) setAccessibleAccounts(data.accessible_accounts);
        if (data.client) setActiveAccountName(data.client.display_name);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Clear cookies by calling a logout or just redirect
    document.cookie = 'auth_role=; path=/; max-age=0';
    document.cookie = 'auth_user_id=; path=/; max-age=0';
    router.push('/');
  };

  return (
    <div className="portal-app">
      {/* Portal Top Navigation */}
      <header className="portal-topbar">
        <div className="portal-topbar-inner">
          <div className="portal-topbar-left">
            <Link href="/portal" className="portal-logo" style={{ textDecoration: 'none' }}>
              {isIndividual ? (
                <>
                  <div className="portal-logo-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}><Shield size={16} /></div>
                  <span className="portal-logo-text" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Abidebylaw Vault</span>
                </>
              ) : (
                <>
                  <div className="portal-logo-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>A</div>
                  <span className="portal-logo-text" style={{ color: '#111827' }}>Abidebylaw</span>
                </>
              )}
            </Link>
          </div>

          <div className="portal-topbar-right">
            <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/portal?tab=documents'}>
              <UploadCloud size={16} /> Upload Docs
            </button>

            <button className="portal-notification-btn" onClick={() => window.location.href = '/portal?tab=requests'}>
              <Bell size={20} />
              {badges.requests > 0 && <span className="portal-notif-dot" />}
            </button>

            <div className="portal-user-area" onClick={() => { setShowAccountMenu(!showAccountMenu); setShowUserMenu(false); }}>
              <div className="portal-avatar" style={{ backgroundColor: '#2563eb' }}>{activeAccountName ? activeAccountName.substring(0, 2).toUpperCase() : 'CO'}</div>
              <div className="portal-user-info">
                <span className="text-xs text-gray-400">Viewing As</span>
                <span className="portal-user-name" style={{ fontSize: '13px' }}>{activeAccountName || 'Loading...'}</span>
              </div>
              <ChevronDown size={14} className="ml-1 text-gray-500" />
            </div>

            {showAccountMenu && (
              <div className="user-dropdown" style={{ top: 56, right: 40, position: 'absolute', width: '250px' }}>
                <div className="user-dropdown-header bg-gray-50">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Switch Entity</div>
                  <div className="user-email text-gray-500">You have access to {accessibleAccounts.length} accounts.</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {accessibleAccounts.map(acc => (
                    <button 
                      key={acc.id} 
                      onClick={() => {
                        setShowAccountMenu(false);
                        window.location.href = `/portal?client_id=${acc.id}`;
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${activeAccountName === acc.display_name ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                    >
                      <div className="font-medium text-gray-800 text-sm truncate">{acc.display_name}</div>
                      <div className="text-xs text-gray-500 capitalize">{acc.client_type.replace('_', ' ')}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="portal-user-area ml-2 pl-2 border-l border-gray-200" onClick={() => { setShowUserMenu(!showUserMenu); setShowAccountMenu(false); }}>
              <div className="portal-avatar">{clientName.substring(0, 2).toUpperCase()}</div>
            </div>

            {showUserMenu && (
              <div className="user-dropdown" onMouseLeave={() => setShowUserMenu(false)} style={{ top: 56, right: 0, position: 'absolute' }}>
                <div className="user-dropdown-header">
                  <div className="user-name">{clientName}</div>
                  <div className="user-email">{clientEmail}</div>
                </div>
                <Link href="/portal/profile" onClick={() => setShowUserMenu(false)}><User size={16} /> Profile & Settings</Link>
                <button onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="portal-mobile-toggle" onClick={() => setShowMobileNav(!showMobileNav)}>
              {showMobileNav ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main className="portal-main">
        <PortalProvider>
          <div className="portal-page" style={{ paddingTop: '24px' }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
              <PortalSidebar />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {children}
              </div>
            </div>
          </div>
        </PortalProvider>
      </main>

      {/* Footer */}
      <footer className="portal-footer">
        <div className="portal-footer-inner">
          <span>© {new Date().getFullYear()} Abidebylaw Software</span>
          <span>Powered by Abidebylaw</span>
        </div>
      </footer>
    </div>
  );
}
