// The public homepage: the compliance wallet. Rebuilt 2026-11-12 on the owner's brief (phase 19): "a single
// compliance wallet that helps you minimise penalties for non-compliance": passport, insurance, tax, licences,
// company filings, anything with a date, kept in one place. Pictures instead of paragraphs; countries are not the
// subject (they appear only where a visitor needs them: the check's own list, one answer, the footer's guides).
// The wallet cards in the hero are labelled illustrations; every other date, name and penalty is read from the
// live rules at the moment the page is drawn (src/lib/site-data.ts).
import Link from 'next/link';
import Checker from '@/components/compliance/Checker';
import Plans from '@/components/site/Plans';
import { Arrow, Plus, SiteFooter, SiteHeader, Tick } from '@/components/site/Chrome';
import { PhoneBoard, Receipts, Shelf, WALLET_DOES, WalletStack, YearLine } from '@/components/site/Wallet';
import { siteData } from '@/lib/site-data';

export const dynamic = 'force-dynamic';       // the rules live in the database and change in Service Master

const CONTRACT = `<!--
THESIS: The page is a wallet. Every deadline a person or business carries (passport, insurance, tax, company, payroll, their own) is a card in one stack, soonest in front. Refuses the paragraph-and-table page it replaces.
OWN-WORLD: Navy field, cards in black, navy, blue, white and one red; time-left chips; objects drawn as what they are (booklet, card, sheet, certificate); a year on one line; receipts for penalties. Bricolage Grotesque display, Hanken Grotesk text.
STORY: That is my life's paperwork in one place; the check fills it for free; the wallet keeps watch so I stop paying penalties.
FIRST VIEWPORT: Headline and two actions left; the wallet stack right, at the size of a real phone wallet, cards dealt in once.
FORM: brief-pinned (owner: "compliance wallet"), palette pinned (navy, red, white, black).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default async function HomePage() {
  const d = await siteData();
  const board = d.examples.find((e) => e.id === 'on-company') ?? d.examples[d.examples.length - 1];
  const names = d.countries.map((c) => c.name);
  const countryList = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
  // three real penalties, from three different places where there are three
  const costs = [0, 2, 4, 6, 1].map((i) => d.penalties[i]).filter(Boolean).filter((p, k, a) => a.findIndex((q) => q.country === p.country) === k).slice(0, 3);

  const FAQ: [string, string][] = [
    ['Is the check really free?', 'Yes. There is no account to make and no card to give. Your answers are not stored unless you choose to save the list.'],
    ['What can go in the wallet?', 'Anything with a date. The check fills in the official deadlines for you: tax, company, payroll, licences and more. You add the rest yourself, such as a passport, a visa, a driving licence, an insurance policy or a lease, and any of them can repeat.'],
    ['Where do the official deadlines come from?', 'Each one was read on the government’s own page, which is linked beside it with the day it was last read. Where a page could not be read, or states no date, the row says “please confirm” instead of guessing.'],
    ['Which places have official deadlines?', `Official rules are in for ${countryList} so far, and more places are being added. Wherever you are, you can keep your own items in the wallet.`],
    ['Will it remind me?', 'Your wallet shows the time left on every deadline, and what is overdue, due this week and due this month. One file adds every date to your own calendar, which will remind you the way you already like. Reminders by email are not available yet.'],
    ['Can I keep my family and my company in it too?', 'Yes. One account holds your own deadlines, your family’s, and those of the companies you own. A consultant can work with you in it.'],
    ['Is this legal or tax advice?', 'No. It is general information to help you keep track. Confirm each date on the official page before you act.'],
  ];

  return (
    <div className="ab">
      <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
      <div className="ab-top">
        <SiteHeader />
        <div className="ab-wrap ab-hero">
          <div className="ab-hero-copy">
            <h1>Your compliance wallet.<em>Every deadline, one place.</em></h1>
            <p className="ab-lede">Tax returns, passport and ID renewals, insurance, licences, company filings, payroll. Keep them together, see the time left on each, and stop paying penalties for the ones you forgot.</p>
            <div className="ab-hero-act">
              <a href="#check" className="ab-btn ab-btn-mark">Fill my wallet free<Arrow /></a>
              <Link href="/signup" className="ab-btn ab-btn-ghost">Create a free account</Link>
            </div>
            <p className="ab-hero-note"><Tick />The check needs no account</p>
          </div>
          <WalletStack today={d.today} />
        </div>
      </div>

      <section className="ab-sec" id="what">
        <div className="ab-wrap">
          <div className="ab-head ab-head-one">
            <h2>If it has a date, it goes in.</h2>
          </div>
          <Shelf />
        </div>
      </section>

      <section className="ab-sec ab-wash" id="check" aria-label="Free compliance check">
        <div className="ab-wrap">
          <div className="ab-head">
            <h2>Fill it in three minutes.</h2>
            <p className="ab-lede">Say where you live and what you do. The free check finds the official deadlines that apply to you, with the date and the government page each one comes from.</p>
          </div>
          <div className="ab-check-frame"><Checker wide /></div>
          <ul className="ab-check-note">
            <li><Tick /><span><b className="ab-count" data-total={d.total}>{d.total}</b> official deadlines in the rules today</span></li>
            <li><Tick /><span>Each read on a government page</span></li>
            <li><Tick /><span>No sign-up to see your list</span></li>
          </ul>
        </div>
      </section>

      {board && board.year.length > 0 && (
        <section className="ab-sec" id="year">
          <div className="ab-wrap">
            <div className="ab-head">
              <h2>Your whole year on one line.</h2>
              <p className="ab-lede">A small company and its owner, as the wallet sees them today. The official dates are worked out from the rules; two items were added by hand.</p>
            </div>
            <YearLine rows={board.year} today={d.today} />
          </div>
        </section>
      )}

      {costs.length > 0 && (
        <section className="ab-sec ab-mark" id="costs">
          <div className="ab-wrap">
            <div className="ab-head">
              <h2>A missed deadline sends a bill.</h2>
              <p className="ab-lede">The wallet shows what each one costs before it happens. These are real, read on the official pages.</p>
            </div>
            <Receipts penalties={costs} />
          </div>
        </section>
      )}

      <section className="ab-sec ab-deep" id="wallet">
        <div className="ab-wrap ab-acct">
          <div>
            <h2>Then the wallet keeps watch.</h2>
            <ul className="ab-does-list">
              {WALLET_DOES.map((w) => { const I = w.icon; return (
                <li key={w.title}><I className="ab-does-ico" strokeWidth={1.8} aria-hidden /><div><h3>{w.title}</h3><p>{w.line}</p></div></li>
              ); })}
            </ul>
            <p className="ab-acct-act"><Link href="/signup" className="ab-btn ab-btn-mark">Open my free wallet<Arrow /></Link></p>
          </div>
          {board && <PhoneBoard rows={board.year.length ? board.year : board.rows} today={d.today} total={board.total} />}
        </div>
      </section>

      <section className="ab-sec-tight" id="who">
        <div className="ab-wrap">
          <ul className="ab-for">
            <li><h3>For you</h3><p>Your returns, renewals and documents.</p></li>
            <li><h3>For your family</h3><p>A partner, children, parents: one calendar.</p></li>
            <li><h3>For your business</h3><p>Tax, payroll, the annual return, licences.</p></li>
            <li><h3>For your clients</h3><p>What is pending for each, in one view.</p></li>
          </ul>
        </div>
      </section>

      <section className="ab-sec ab-wash" id="plans">
        <div className="ab-wrap">
          <div className="ab-head ab-head-one"><h2>Plans.</h2></div>
          <Plans />
        </div>
      </section>

      <section className="ab-sec" id="questions">
        <div className="ab-wrap ab-faq">
          <div>
            <h2>Questions people ask first.</h2>
            <p style={{ marginTop: '1.6rem' }}><Link href="/compliance" className="ab-btn ab-btn-line">Read the guides<Arrow /></Link></p>
          </div>
          <div>
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}<Plus /></summary><p>{a}</p></details>))}
          </div>
        </div>
      </section>

      <section className="ab-sec-tight ab-close">
        <div className="ab-wrap ab-close-in">
          <div>
            <h2>One wallet. Fewer penalties.</h2>
            <p>Find what applies to you in a few minutes, then keep it all in one place.</p>
          </div>
          <div className="ab-close-act">
            <a href="#check" className="ab-btn ab-btn-mark">Fill my wallet free<Arrow /></a>
            <Link href="/signup" className="ab-btn ab-btn-ghost">Create a free account</Link>
          </div>
        </div>
      </section>

      <SiteFooter countries={d.countries} />
    </div>
  );
}
