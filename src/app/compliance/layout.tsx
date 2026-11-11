// The public guide: what each country asks of each kind of person or business, from the same rules the checker
// runs on. Open to everyone and to search engines.
import Link from 'next/link';
import Scope from '@/components/t1/Scope';

export const dynamic = 'force-dynamic';       // read from the rules as they stand in Service Master, never at build time

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <Scope>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">A</span>AbideByLaw</Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700" aria-label="Main">
              <Link href="/compliance" className="hover:text-indigo-700">Compliance guides</Link>
              <Link href="/login" className="hover:text-indigo-700">Sign in</Link>
              <Link href="/#compliance-checker" className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">Check my compliances, free</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500">
            <p>General information to help you find what applies to you. It is not legal or tax advice. Governments change rules and dates: confirm each one on the official source shown beside it before you act.</p>
            <p className="mt-2"><Link href="/" className="underline">Home</Link> · <Link href="/compliance" className="underline">Compliance guides</Link> · <Link href="/signup" className="underline">Create a free account</Link></p>
          </div>
        </footer>
      </div>
    </Scope>
  );
}
