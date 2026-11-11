# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Confirmed by the owner (2026-11-11): the site is "majorly for individuals to manage the compliance globally".

- **Primary:** a person managing their own obligations, often in more than one country (income tax, foreign assets,
  a side business, a company they own, renewals). They are not a tax professional and do not know which filings exist.
- **Also served:** business owners (corporations, partnerships, employers), families, and consultants who look after
  several clients.

## Product Purpose

AbideByLaw tells a person or business which government filings and duties apply to them, when each is due, what
missing it costs, and which official government page says so. Then it keeps track of them.

1. **The check (free, no sign-up).** Choose country, place, entity type and the types of compliance; answer a few
   questions; get the list.
2. **The account.** The list is saved; each row shows the date and time left, can be marked as filed, takes notes and
   papers, and exports a calendar file.

Success for a visitor: they leave knowing what they must file and by when, and trust it enough to save it.

## Positioning

Every compliance on the list carries the government's own page it was read on and the date it was last checked, the
rule in the government's words, and the penalty where one could be read. Items that could not be confirmed on an
official page say "please confirm" instead of pretending. A neighbouring product could not claim this without doing
the reading.

## Operating Context

- **A global tracker** (owner, 2026-11-11: "not only USA, Canada, UAE and India, it would be much bigger; these four
  have been kept for a test purpose"). Live today: Canada (13 provinces and territories), United States (50 states
  and DC), India (36 states and union territories), United Arab Emirates (7 emirates, with free zones). The site says
  it is built for every country, lists what is live, and says more are being added. It never names or implies a
  country that is not in the rules.
- 929 compliances as of 2026-11-11 (Canada 199, United States 491, India 133, UAE 106), tax and non-tax: income tax,
  sales tax, payroll, company registry, employment and workplace safety, privacy, anti-money-laundering, import and
  export, licences, state duties, patents and trademarks, and a person's own documents (passport, driving licence,
  vehicle registration, residence cards, health card).
- The figures must be read from the rules at render time (`src/lib/compliance`, `getPacks()`), never typed into copy.
- Rules are maintained by the owner's staff in Service Master (after login; out of scope for the public site).

## Capabilities and Constraints

Real today:
- the check, with tick boxes for several types of compliance at once, questions a few at a time with an information
  point on each;
- due dates worked out from the person's own dates (year end, incorporation date); duties with no calendar date show
  their rule and work out the deadline from the day it happened;
- penalties with the page they were read on; official source and date checked on every row;
- account: time left, mark as filed, own items, notes, papers (files), calendar file (.ics), family and entity
  compliances, consultants, messages;
- documents can be stored through the person's own Google Drive;
- public guide pages per country and entity type under `/compliance`.

Not real today (never claim):
- reminders by email or text (no email service is connected);
- any count of users or customers ("thousands of people");
- Privacy Policy and Terms of Service pages (not written; owner's lawyer to supply);
- coverage of any country that is not in the rules (say "more are being added", never which or when).

Open decisions:
- none blocking. Prices stay as they are (owner, 2026-11-11).

## Brand Commitments

- Name: AbideByLaw. Domain www.abidebylaw.com.
- Plain language for people who are not accountants. The owner's standing rule: no fabricated facts; official
  government sources only.
- Owner's brief for the public site (2026-11-11): full-width layout, the check's filters across the top, modern,
  very detailed, "no AI slop". Only the public website changes; the login page and everything after login stay as
  they are.
- First action for a visitor: run the free check on the page.
- Prices unchanged: Individual $12, Family $24, Consultant $62 a month (annual $9, $19, $49), plus Enterprise by
  contact.

## Evidence on Hand

- The rules themselves, with sources: `src/lib/compliance/countries/*`, served by `/api/public/compliance`.
- The working checker component: `src/components/compliance/Checker.tsx` (must keep working; browser tests in
  `tests/verify/compliance_browser.cjs` drive it by its labels).
- No real customer quotes, logos, press or usage numbers exist. The six quotes on the old homepage were prototype
  text (owner, 2026-11-11). Do not present invented people as customers; worked examples from the real rules are the
  proof.

## Product Principles

1. Show the source. A claim about a filing appears with the government page it came from.
2. Say what is not known. "Please confirm" and "no penalty read" are shown, not hidden.
3. The check first. Nothing stands between a visitor and their list.
4. Plain words. The reader is not an accountant.
5. Earlier is the safe side. Where a date is uncertain, never show a later one.

## Accessibility & Inclusion

Readers include non-native English speakers in four countries, on phones. Controls must work by keyboard and keep
their accessible names (the tests select them by label).
