// The public homepage. Every figure and every example on it is read from the rules at the moment the page is
// drawn (src/lib/site-data.ts); nothing here is a typed-in number or an invented customer. Rebuilt 2026-11-11 on the
// owner's brief: full width, the check's filters across the top, for a person managing their own compliance in more
// than one country, first action "run the free check".
import Link from 'next/link';
import Checker from '@/components/compliance/Checker';
import Cases from '@/components/site/Cases';
import Plans from '@/components/site/Plans';
import { Arrow, Plus, SiteFooter, SiteHeader, Tick } from '@/components/site/Chrome';
import { fmtDate, siteData } from '@/lib/site-data';

export const dynamic = 'force-dynamic';       // the rules live in the database and change in Service Master

const CONTRACT = `<!--
THESIS: The check is the page. A visitor sets four filters and gets their own list; everything below is that list at work. Refuses the dashboard-mock hero with three feature cards.
OWN-WORLD: White paper, one indigo field for the top and the close, highlighter yellow for the one action and the cost of missing, deep indigo for the account. Bricolage Grotesque display, Hanken Grotesk text. Rule lines, tables and lists, no icon cards.
STORY: I see what applies to people like me, with dates and sources; I run it for myself; I keep the list.
FIRST VIEWPORT: Indigo field, headline left, three plain facts right, the full-width filter panel straddling the field's lower edge with its action.
FORM: the category canon, chosen by the owner over the dealt directions (seed 778c1ce0).
FINISH: figures and examples come from the live rules; no invented people.
-->`;

const FAQ: [string, string][] = [
  ['Is the check really free?', 'Yes. There is no account to make and no card to give. Your answers are not stored unless you choose to save the list to an account.'],
  ['Where do the rules come from?', 'Each compliance was read on the government’s own page: the tax authority, the company registry, the labour ministry, the state or province. The page is linked beside it with the day it was last read. Where a page could not be read, or states no date, the row says “please confirm” instead of guessing.'],
  ['Is this legal or tax advice?', 'No. It is general information to help you find what applies to you, and it does not replace a professional who knows your situation. Confirm each date on the official page before you act.'],
  ['Will it remind me?', 'Your account shows the time left on every row, and what is overdue, due this week and due this month. One file adds every date to your own calendar, which will remind you the way you already like. Reminders by email are not available yet.'],
  ['What happens to the papers I attach?', 'A paper you attach is kept with the row it belongs to, and only you can open it. You can also keep your files in your own Google Drive.'],
  ['Can I track my family and my company as well?', 'Yes. An account holds your own compliances, those of family members, and those of the companies and other entities you own. You can also add items of your own, such as a passport or a lease, with a date that can repeat.'],
  ['What if a date changes?', 'When a rule or a date is updated, saved lists follow. A date you set by hand and anything you already marked as filed are left as you left them.'],
];

export default async function HomePage() {
  const d = await siteData();
  const spec = d.examples[0]?.rows.find((r) => r.penalty && r.left) ?? d.examples[0]?.rows[0];
  const board = d.examples.find((e) => e.id === 'on-company') ?? d.examples[d.examples.length - 1];
  const names = d.countries.map((c) => c.name);
  const countryList = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
  const count = (tone: string) => (board ? board.rows.filter((r) => r.tone === tone).length : 0);

  return (
    <div className="ab">
      <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
      <div className="ab-top">
        <SiteHeader />
        <div className="ab-wrap ab-hero">
          <div>
            <h1>Know every filing you owe. <em>Before the penalty.</em></h1>
            <p className="ab-lede">Say where you live and earn, and answer a few questions. You get each compliance that applies to you, the date it is due, what missing it costs, and the government page that says so.</p>
          </div>
          <ul className="ab-facts">
            <li><b>{countryList}.</b> {d.places} states, provinces, territories and emirates.</li>
            <li><b>{d.total} compliances</b>, tax and everything beside it: company registers, payroll, licences, privacy, state duties.</li>
            <li><b>Every one linked to its official source</b>, with the day it was last read.</li>
          </ul>
        </div>
      </div>

      <section className="ab-wrap ab-check" aria-label="Free compliance check">
        <div className="ab-check-frame"><Checker wide /></div>
        <ul className="ab-check-note">
          <li><Tick />Due dates worked out from your own dates</li>
          <li><Tick />Nothing to install, no sign-up to see your list</li>
          <li><Tick />Save the list to a free account when you are done</li>
        </ul>
      </section>

      {d.examples.length > 0 && (
        <section className="ab-sec" id="examples">
          <div className="ab-wrap">
            <div className="ab-head">
              <h2>See it on a real case.</h2>
              <p className="ab-lede">Ordinary situations, run through the same rules the check uses. The dates are worked out as of today, {fmtDate(d.today)}.</p>
            </div>
            <Cases examples={d.examples} />
          </div>
        </section>
      )}

      <section className="ab-sec ab-wash" id="coverage">
        <div className="ab-wrap">
          <div className="ab-head">
            <h2>Four countries, read page by page.</h2>
            <p className="ab-lede">Tax is only part of what a government expects. Company registers, payroll, workplace safety, privacy, money-laundering rules, licences and state duties are in here too.</p>
          </div>
          <table className="ab-table">
            <thead><tr><th scope="col">Country</th><th scope="col">Compliances</th><th scope="col">Places</th><th scope="col">Areas covered</th><th scope="col"><span className="sr">Guide</span></th></tr></thead>
            <tbody>
              {d.countries.map((c) => (
                <tr key={c.code} data-country={c.code}>
                  <th scope="row">{c.name}{c.checkedOn ? <small>Sources last read {fmtDate(c.checkedOn)}</small> : null}</th>
                  <td className="num" data-l="Compliances">{c.total}</td>
                  <td className="num" data-l="Places">{c.places}<small>{c.placeLabel}</small></td>
                  <td data-l="Areas"><ul className="ab-areas">{c.departments.map((x) => <li key={x.name}>{x.name} <b>{x.count}</b></li>)}</ul></td>
                  <td><Link href={`/compliance/${c.slug}`} className="ab-btn ab-btn-line">Read the guide<Arrow /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ab-honest">{d.confirmed} of the {d.total} were confirmed on the government’s own page. The other {d.total - d.confirmed} are shown with “please confirm”, because the page could not be read or states no date. {d.withPenalty} carry the penalty for missing them; where no penalty could be read on an official page, none is shown.</p>
        </div>
      </section>

      {spec && (
        <section className="ab-sec" id="row">
          <div className="ab-wrap ab-anat">
            <div>
              <h2>What you get for each one.</h2>
              <ul className="ab-points" style={{ marginTop: '2.2rem' }}>
                <li><h3>The date, worked out for you</h3><p>From your year end, the day you incorporated, or the calendar. Next to it, how long is left.</p></li>
                <li><h3>What missing it costs</h3><p>The penalty in the authority’s own terms, with the page it was read on. Where none could be read, none is shown.</p></li>
                <li><h3>Where it comes from</h3><p>The government page, and the day it was last read. You can check any row yourself in one click.</p></li>
                <li><h3>No calendar date? You get the rule</h3><p>“Within 15 days after the change.” Enter the day it happened and the deadline is worked out.</p></li>
              </ul>
            </div>
            <figure className="ab-specimen" aria-label="One compliance, as the check shows it">
              <h3>{spec.name}</h3>
              <p className="who">{spec.form ? `${spec.form} · ` : ''}{spec.authority}</p>
              <dl>
                <div><dt>Due</dt><dd className="big">{spec.when}{spec.left ? <> <span className={`ab-chip ${spec.tone}`}>{spec.left}</span></> : null}</dd></div>
                {spec.penalty ? <div><dt>If missed</dt><dd>{spec.penalty}{spec.penaltyUrl ? <> (<a className="ab-link" href={spec.penaltyUrl} target="_blank" rel="noopener noreferrer nofollow">official page</a>)</> : null}</dd></div> : null}
                <div><dt>Source</dt><dd><a className="ab-link" href={spec.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{spec.sourceTitle || spec.sourcePublisher}</a><br />{spec.sourcePublisher}{spec.checked ? `, read ${fmtDate(spec.checked)}` : ''}</dd></div>
                <div><dt>For</dt><dd>{d.examples[0].who.replace(/^A /, 'a ')}: {d.examples[0].detail.charAt(0).toLowerCase() + d.examples[0].detail.slice(1)}</dd></div>
              </dl>
            </figure>
          </div>
        </section>
      )}

      <section className="ab-sec ab-deep" id="account">
        <div className="ab-wrap ab-acct">
          <div>
            <h2>Then keep it all in one place.</h2>
            <p className="ab-lede" style={{ marginTop: '1.1rem' }}>Save the list and it becomes the page you come back to: what is due next, what is done, and the papers that prove it, for the day someone asks.</p>
            <div className="ab-acct-list">
              <div><h3>Time left on every row</h3><p>Overdue, due this week and due this month are counted at the top.</p></div>
              <div><h3>Mark as filed</h3><p>A filing that repeats moves to its next date and keeps a line of history.</p></div>
              <div><h3>Notes and papers</h3><p>The filed return, the receipt, the notice: kept with the row they belong to, or in your own Google Drive.</p></div>
              <div><h3>Your own items</h3><p>A passport, a lease, a licence. Anything with a date, and it can repeat.</p></div>
              <div><h3>Your calendar</h3><p>One file puts every date into Google, Apple or Outlook calendar.</p></div>
              <div><h3>Family and companies</h3><p>Track family members and the entities you own, and work with the consultant who files for you.</p></div>
            </div>
            <p style={{ marginTop: '2.2rem' }}><Link href="/signup" className="ab-btn ab-btn-mark">Create a free account<Arrow /></Link></p>
          </div>
          {board && (
            <figure className="ab-board" aria-label="An example of a saved list">
              <p className="ab-board-cap"><span>Example: {board.who.replace(/^A /, 'a ')}</span><span>{board.total} compliances</span></p>
              <ul className="ab-tiles">
                <li className="zero"><b>0</b><span>Overdue</span></li>
                <li className={count('red') ? 'red' : 'zero'}><b>{count('red')}</b><span>Due in 7 days</span></li>
                <li className={count('yellow') ? 'yellow' : 'zero'}><b>{count('yellow')}</b><span>Due in 30 days</span></li>
                <li className="green"><b>2</b><span>Filed so far</span></li>
              </ul>
              <ul className="ab-board-rows">
                {board.rows.map((r) => (
                  <li key={r.id}>
                    <span><b>{r.name}</b><small>{r.authority}</small></span>
                    <span className={`ab-pill ${r.left ? r.tone : 'gray'}`}>{r.left ? `${r.when} · ${r.left}` : r.when}</span>
                    <span className="ab-fake-btn">Mark as filed</span>
                  </li>
                ))}
              </ul>
            </figure>
          )}
        </div>
      </section>

      <section className="ab-sec" id="who">
        <div className="ab-wrap">
          <div className="ab-head ab-head-one"><h2>Made for one person. Useful for everyone they answer to.</h2></div>
          <ul className="ab-for">
            <li>
              <h3>For you</h3>
              <p>A job in one country, a property or an account in another, a small business on the side, a renewal you forget every few years. Start with the check; keep the list.</p>
              <ul><li>Income tax, foreign assets, instalments, renewals</li><li>More than one country in one account</li><li>Papers kept with the filing they prove</li></ul>
            </li>
            <li><h3>For families</h3><p>Parents, a partner, children: each person’s compliances in one account, with one calendar.</p></li>
            <li><h3>For business owners</h3><p>Corporate tax, sales tax, payroll, the annual return, workplace duties, by province, state or emirate.</p></li>
            <li><h3>For consultants</h3><p>See what is pending for each client, ask for documents, and keep the conversation with the filing.</p></li>
          </ul>
        </div>
      </section>

      {d.penalties.length > 0 && (
        <section className="ab-sec ab-mark" id="costs">
          <div className="ab-wrap">
            <div className="ab-head">
              <h2>What missing one costs.</h2>
              <p className="ab-lede">In the authority’s own terms. Each was read on the page linked beside it.</p>
            </div>
            <ul className="ab-costs">
              {d.penalties.map((p) => (
                <li key={p.country + p.name}>
                  <h3>{p.name}<small>{p.country}</small></h3>
                  <p>{p.penalty}</p>
                  <p className="src">Read on <a className="ab-link" href={p.url} target="_blank" rel="noopener noreferrer nofollow">{p.publisher}</a></p>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: '2rem' }}><Link href="/compliance-guide" className="ab-btn ab-btn-line">More on penalties<Arrow /></Link></p>
          </div>
        </section>
      )}

      <section className="ab-sec" id="plans">
        <div className="ab-wrap">
          <div className="ab-head ab-head-one"><h2>Plans.</h2></div>
          <Plans />
        </div>
      </section>

      <section className="ab-sec ab-wash" id="questions">
        <div className="ab-wrap ab-faq">
          <div>
            <h2>Questions people ask first.</h2>
            <p className="ab-lede" style={{ marginTop: '1.1rem' }}>If yours is not here, the guides go country by country and entity by entity.</p>
            <p style={{ marginTop: '1.6rem' }}><Link href="/compliance" className="ab-btn ab-btn-line">Open the guides<Arrow /></Link></p>
          </div>
          <div>
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}<Plus /></summary><p>{a}</p></details>))}
          </div>
        </div>
      </section>

      <section className="ab-sec-tight ab-close">
        <div className="ab-wrap ab-close-in">
          <div>
            <h2>Find out what applies to you.</h2>
            <p>It takes a few minutes and no account. If the list is useful, keep it.</p>
          </div>
          <div className="ab-close-act">
            <a href="#compliance-checker" className="ab-btn ab-btn-mark">Run the free check<Arrow /></a>
            <Link href="/signup" className="ab-btn ab-btn-ghost">Create a free account</Link>
          </div>
        </div>
      </section>

      <SiteFooter countries={d.countries} />
    </div>
  );
}
