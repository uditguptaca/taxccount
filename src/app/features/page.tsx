// "What it does": the product in plain words, and what it does not do yet. Only things that exist are listed.
import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow, SiteFooter, SiteHeader } from '@/components/site/Chrome';
import { siteData } from '@/lib/site-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'What AbideByLaw does',
  description: 'The free compliance check, what each result shows, and what the account keeps for you afterwards. In plain words, including what it does not do yet.',
};

const PARTS: { title: string; items: [string, string][] }[] = [
  { title: 'The check', items: [
    ['Four filters', 'Country, place, the kind of person or business you are, and the types of compliance you want checked. Tick one type, several, or all.'],
    ['A few questions at a time', 'Only the questions your ticks depend on are asked. Each has a small information point saying what it means and why it is asked. “Not sure” is an answer: nothing is hidden because of it.'],
    ['Your list', 'Every compliance that applies, grouped by heading, with the ones that may apply marked for you to confirm.'],
  ] },
  { title: 'Each result', items: [
    ['The due date', 'Worked out from your own year end, the day you incorporated or registered, or the calendar. Where the authority moved a deadline, the row says what the usual date was.'],
    ['The rule, when there is no calendar date', 'Some duties start when something happens: a director changes, a new employee is hired. The row shows the rule, and works out the deadline from the day you enter.'],
    ['The cost of missing it', 'The penalty as the authority states it, with a link to the page it was read on.'],
    ['The official source', 'The government page for that filing and the day it was last read.'],
  ] },
  { title: 'The account', items: [
    ['One page for everything', 'What is overdue, due in seven days, due in thirty days and filed so far, then the next five things to do.'],
    ['Mark as filed', 'A filing that repeats moves to its next date and keeps a line of history.'],
    ['Notes and papers', 'Write a note on any row and attach the return, the receipt or the notice. Only you can open them. Files can also be kept in your own Google Drive.'],
    ['Your own items', 'Add anything with a date, once or repeating: a passport, a lease, a professional licence.'],
    ['Calendar file', 'One file adds every date to Google, Apple or Outlook calendar.'],
    ['Family, entities and consultants', 'Keep the compliances of family members and of the companies you own in the same account, and work with the consultant who files for you.'],
  ] },
];

export default async function FeaturesPage() {
  const d = await siteData();
  return (
    <div className="ab">
      <SiteHeader light />
      <main>
        <div className="ab-wrap ab-page-top">
          <h1>What it does, in plain words.</h1>
          <p className="ab-lede">AbideByLaw tells you which government filings and duties apply to you, when each is due and what missing it costs. Then it keeps track of them. It is built as a tracker for every country. Live today: {d.total} compliances in {d.countries.map((c) => c.name).join(', ')}.</p>
        </div>
        <div className="ab-wrap" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          {PARTS.map((part) => (
            <section key={part.title} className="ab-does">
              <h2>{part.title}</h2>
              <ul>{part.items.map(([t, x]) => <li key={t}><b>{t}</b><span>{x}</span></li>)}</ul>
            </section>
          ))}
          <section className="ab-does">
            <h2>What it does not do</h2>
            <div>
              <p className="ab-not"><b>It does not file anything for you</b>, and it is not legal or tax advice. <b>It does not send reminders by email yet</b>: the account shows the time left, and the calendar file lets your own calendar remind you. <b>It is built for every country, but {d.countries.length} are live today</b> ({d.countries.map((c) => c.name).join(', ')}); more are being added. And where a government page could not be read, the row says “please confirm” instead of giving a date.</p>
              <p style={{ marginTop: '1.6rem' }}><Link href="/#compliance-checker" className="ab-btn ab-btn-brand">Run the free check<Arrow /></Link></p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter countries={d.countries} />
    </div>
  );
}
