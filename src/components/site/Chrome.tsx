// The header and footer of the public website (homepage, inner pages, the guides). No state: the small-screen
// menu is a <details>, so it works before any script has loaded.
import Link from 'next/link';
import '@/app/site.css';

export const Arrow = () => (<svg className="ab-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg>);
export const Tick = ({ className = 'ab-tick' }: { className?: string }) => (<svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10.5l4 4 8-9" /></svg>);
export const Plus = () => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>);

const LINKS: [string, string][] = [['/#family', 'Your family'], ['/#global', 'Countries'], ['/#year', 'Your year'], ['/#plans', 'Plans'], ['/compliance', 'Guides']];

export function SiteHeader({ light = false }: { light?: boolean }) {
  return (
    <header className={light ? 'ab-header-light' : undefined}>
      <div className="ab-wrap ab-header">
        <Link href="/" className="ab-brand" aria-label="AbideByLaw, home"><span className="ab-brand-mark" aria-hidden="true">A</span>AbideByLaw</Link>
        <nav className="ab-nav" aria-label="Main">
          {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="ab-nav-end">
          <Link href="/login" className="ab-signin">Sign in</Link>
          <Link href="/#check" className={`ab-btn ${light ? 'ab-btn-brand' : 'ab-btn-mark'}`}>Run the free check</Link>
          <details className="ab-menu">
            <summary aria-label="Menu">Menu</summary>
            <div className="ab-menu-list">
              {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
              <Link href="/features">What it does</Link>
              <Link href="/login">Sign in</Link>
              <Link href="/signup">Create a free account</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ countries }: { countries: { name: string; slug: string }[] }) {
  return (
    <footer className="ab-foot">
      <div className="ab-wrap ab-foot-in">
        <div>
          <Link href="/" className="ab-brand"><span className="ab-brand-mark" aria-hidden="true">A</span>AbideByLaw</Link>
          <p className="ab-foot-note">Your compliance wallet: every deadline you carry, from tax returns to passport and insurance renewals, in one place, so none of them turns into a penalty.</p>
        </div>
        <div>
          <h3>The wallet</h3>
          <ul>
            <li><Link href="/#check">Run the free check</Link></li>
            <li><Link href="/#year">Your year on one line</Link></li>
            <li><Link href="/compliance-guide">What missing one costs</Link></li>
          </ul>
        </div>
        <div>
          <h3>Guides</h3>
          <ul>{countries.map((c) => <li key={c.slug}><Link href={`/compliance/${c.slug}`}>{c.name}</Link></li>)}</ul>
        </div>
        <div>
          <h3>Account</h3>
          <ul>
            <li><Link href="/features">What it does</Link></li>
            <li><Link href="/#plans">Plans</Link></li>
            <li><Link href="/signup">Create a free account</Link></li>
            <li><Link href="/login">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="ab-wrap ab-legal">
        <p>AbideByLaw gives general information to help you find what applies to you. It is not legal, tax or accounting advice, and it does not replace a professional who knows your situation. Governments change rules and dates: confirm each one on the official page shown beside it before you act.</p>
        <p>&copy; {new Date().getFullYear()} AbideByLaw.</p>
      </div>
    </footer>
  );
}
