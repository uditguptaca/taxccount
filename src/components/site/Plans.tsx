'use client';
// The plans, with the yearly/monthly switch. Names, prices and what each plan includes are the owner's (kept as
// they were on the old homepage, 2026-11-11); change them only on the owner's word.
import { useState } from 'react';
import Link from 'next/link';
import { Tick } from './Chrome';

const PLANS = [
  { name: 'Individual', monthly: 12, yearly: 9, desc: 'For one person managing personal compliance.', main: false,
    has: ['Personal compliance dashboard', 'Unlimited reminders', 'Document organization', 'Google Drive linking', 'Personal timeline view', 'Notes & records'] },
  { name: 'Family', monthly: 24, yearly: 19, desc: 'For households managing multiple family members.', main: true,
    has: ['Everything in Individual', 'Up to 8 family profiles', 'Shared document structure', 'Family compliance calendar', 'Dependent tracking', 'Entity / business tracking', 'Priority support'] },
  { name: 'Consultant', monthly: 62, yearly: 49, desc: 'For professionals managing multiple clients.', main: false,
    has: ['Multi-client dashboard', 'Client reminders & workflows', 'Document request system', 'Communication center', 'Checklist engine', 'Workflow visibility', 'Advanced reporting', 'Team collaboration'] },
];

export default function Plans() {
  const [yearly, setYearly] = useState(true);
  return (
    <>
      <div className="ab-plans-bar">
        <p className="ab-lede">The check is free and needs no account. A plan is for keeping track afterwards.</p>
        <div className="ab-toggle" role="group" aria-label="Billing period">
          <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>Billed yearly</button>
          <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>Billed monthly</button>
        </div>
      </div>
      <div className="ab-plans">
        {PLANS.map((p) => (
          <div key={p.name} className={`ab-plan${p.main ? ' is-main' : ''}`} data-plan={p.name}>
            {p.main ? <span className="tag">For households</span> : null}
            <h3>{p.name}</h3>
            <p className="desc">{p.desc}</p>
            <p className="ab-price"><b>${yearly ? p.yearly : p.monthly}</b><span className="per">a month{yearly ? ', billed yearly' : ''}</span></p>
            <ul>{p.has.map((h) => <li key={h}><Tick className="" /><span>{h}</span></li>)}</ul>
            <Link href="/signup" className={`ab-btn ${p.main ? 'ab-btn-mark' : 'ab-btn-line'}`}>Start free trial</Link>
          </div>
        ))}
      </div>
      <div className="ab-ent">
        <p><b>Enterprise / Business.</b> Custom workflows, multi-user teams, advanced permissions, dedicated onboarding support.</p>
        <Link href="/signup" className="ab-btn ab-btn-line">Contact sales</Link>
      </div>
    </>
  );
}
