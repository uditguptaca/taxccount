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
import { AskBubbles, Consequences, Countries, Family, HowItWorks, MiniFan, PhoneBoard, Shelf, Ticker, WALLET_DOES, walletCards, YearLine } from '@/components/site/Wallet';
import { CountUp, RevealRoot, WalletCycle } from '@/components/site/Motion';
import { siteData } from '@/lib/site-data';

export const dynamic = 'force-dynamic';       // the rules live in the database and change in Service Master

const CONTRACT = `<!--
THESIS: The page is a wallet. Every deadline a person or business carries (passport, insurance, tax, company, payroll, their own) is a card in one stack, soonest in front. Refuses the paragraph-and-table page it replaces.
OWN-WORLD: Navy field, cards in black, navy, blue, white and one red; time-left chips; objects drawn as what they are (booklet, card, sheet, certificate); a year on one line; receipts for penalties. Bricolage Grotesque display, Hanken Grotesk text.
STORY: My family's and my company's statutory deadlines, in every country, in one place; the check on the first screen fills it free; the wallet keeps watch so I stop paying penalties.
FIRST VIEWPORT: Headline and actions left; the wallet stack right (corporation tax in front); the free check straddles the field's lower edge, visible without scrolling.
FORM: brief-pinned (owner: "compliance wallet"), palette pinned (navy, red, white, black).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default async function HomePage() {
  const d = await siteData();
  const board = d.examples.find((e) => e.id === 'on-company') ?? d.examples[d.examples.length - 1];
  const names = d.countries.map((c) => c.name);
  const countryList = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';

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
            <p className="ab-lede">Income tax, corporation tax, sales tax and payroll first; then passports, licences and insurance. For you, your family and your company, in every country you have them.</p>
            <div className="ab-hero-act">
              <a href="#check" className="ab-btn ab-btn-mark">Find my compliances<Arrow /></a>
              <Link href="/signup" className="ab-btn ab-btn-ghost">Create a free account</Link>
            </div>
            <p className="ab-hero-note"><Tick />The check needs no account</p>
          </div>
          <WalletCycle cards={walletCards(d.today)} caption="Example wallet: one family, its company, three countries." />
        </div>
      </div>

      <section className="ab-wrap ab-check" id="check" aria-label="Free compliance check">
        <div className="ab-check-frame">
          <div className="ab-check-title"><h2>What do you owe, and when?</h2><p>A few quick choices and yes-or-no questions: every official deadline that applies to you, with its date and its government page. Free.</p></div>
          <Checker wide />
        </div>
        <ul className="ab-check-note">
          <li><Tick /><span><CountUp className="ab-count" value={d.total} /> official deadlines in the rules today</span></li>
          <li><Tick /><span>Each read on a government page</span></li>
          <li><Tick /><span>No sign-up to see your list</span></li>
        </ul>
      </section>

      {d.ticker.length > 0 && <Ticker items={d.ticker} />}

      <section className="ab-sec" id="how">
        <div className="ab-wrap">
          <div className="ab-head ab-head-one"><h2>Three steps. Then nothing slips.</h2></div>
          <HowItWorks />
        </div>
      </section>

      <section className="ab-sec" id="family">
        <div className="ab-wrap">
          <div className="ab-head">
            <h2>Everyone you look after, in one wallet.</h2>
            <p className="ab-lede">Your returns, your spouse’s, your kids’ passports, your parents’ taxes and your company’s filings, side by side, with the time left on each.</p>
          </div>
          <div data-reveal><Family today={d.today} /></div>
        </div>
      </section>

      <section className="ab-sec ab-wash" id="global">
        <div className="ab-wrap">
          <div className="ab-head">
            <h2>One wallet, every country you file in.</h2>
            <p className="ab-lede">A job in one country, a company in another, parents in a third: the official rules of each run in the same check and land in the same wallet.</p>
          </div>
          <div data-reveal><Countries countries={d.countries} /></div>
        </div>
      </section>

      <section className="ab-sec" id="what">
        <div className="ab-wrap">
          <div className="ab-head ab-head-one">
            <h2>Tax first. Then everything else with a date.</h2>
          </div>
          <div data-reveal><Shelf /></div>
        </div>
      </section>

      {board && board.year.length > 0 && (
        <section className="ab-sec" id="year">
          <div className="ab-wrap">
            <div className="ab-head">
              <h2>Your whole year on one line.</h2>
              <p className="ab-lede">Official deadlines and the things you add yourself, side by side, with the time left on each.</p>
            </div>
            <div data-reveal><YearLine rows={board.year} today={d.today} ex={board} /></div>
            <p className="ab-year-cap">Example: a small company and its owner. Official dates worked out today from the rules; the dashed ones were added by hand.</p>
          </div>
        </section>
      )}

      {d.consequences.length > 0 && (
        <section className="ab-sec ab-dread" id="costs">
          <div className="ab-wrap">
            <div className="ab-head">
              <h2>Miss one, and it can cost far more than a late fee.</h2>
              <p className="ab-lede">Companies dissolved. Licences cancelled. Fines that grow every day. Prosecution. Each line below is quoted from the official page behind a deadline the wallet keeps.</p>
            </div>
            <Consequences items={d.consequences} />
            <div className="ab-dread-act">
              <p>The wallet puts every one of these deadlines in front of you, with the time left, before it is too late.</p>
              <a href="#check" className="ab-btn ab-btn-mark">Find my compliances<Arrow /></a>
            </div>
          </div>
        </section>
      )}

      <section className="ab-sec ab-deep" id="wallet">
        <div className="ab-wrap ab-acct" data-reveal>
          <div>
            <h2>Then the wallet keeps watch.</h2>
            <ul className="ab-does-list">
              {WALLET_DOES.map((w) => { const I = w.icon; return (
                <li key={w.title}><I className="ab-does-ico" strokeWidth={1.8} aria-hidden /><div><h3>{w.title}</h3><p>{w.line}</p></div></li>
              ); })}
            </ul>
            <p className="ab-acct-act"><Link href="/signup" className="ab-btn ab-btn-mark">Open my free wallet<Arrow /></Link></p>
          </div>
          {board && <PhoneBoard rows={board.year.length ? board.year : board.rows} today={d.today} total={board.total} ex={board} />}
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
            <AskBubbles />
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
          <MiniFan cards={walletCards(d.today)} />
          <div className="ab-close-act">
            <a href="#check" className="ab-btn ab-btn-mark">Find my compliances<Arrow /></a>
            <Link href="/signup" className="ab-btn ab-btn-ghost">Create a free account</Link>
          </div>
        </div>
      </section>

      <SiteFooter countries={d.countries} />
      <RevealRoot />
    </div>
  );
}
