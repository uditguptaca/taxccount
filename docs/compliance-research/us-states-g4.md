# US states group 4: non-tax duties (checked 2026-11-11)

States: NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI. JSON: us-states-g4.json (41 items, all `verified: true`).
None of these states had a quarterly UI wage report in us-states.ts, so duty 2 is covered for all ten.
Working files (fetch script, page copies, item sources, builder) are in g4work/.

## Duties 1 to 4, per state: what could NOT be read, and anything unusual

- **NJ**: All four read. New hire: njcsesp.com (the state's child support employer portal). UI: the employer
  handbook states the WR-30 deadline ("within 30 days of the end of each calendar quarter"). The NJ-927
  contribution-report date is not stated separately on that page; the NJ-927 also carries the TDI/FLI
  contributions. Breach: read on the 2019 amending act (P.L.2019 c.95). There is no fixed number of days, but
  the State Police must be told BEFORE customers. Unclaimed property: reports must be "postmarked before
  November 1", so the due date is set to Oct 31.
- **NM**: All four read. New hire: no penalty stated on either page. Breach: read on the enacted 2017 bill
  (HB 15 final) on nmlegis.gov. The codified NMSA page on nmonesource.com is script-only and could not be
  read. UI: read in 11.3.400 NMAC (State Records Center).
- **NY**: All four read. Breach: GBL 899-aa now says "within thirty days after the breach has been
  discovered", with notice to the AG, Department of State and State Police (and DFS for covered entities).
  The AG's breach page itself had no rule text. Unclaimed: the March 10 dates are for general business
  entities; other industries have their own sheets. UI: NYS-45 also carries withholding.
- **NC**: All four read. New hire: read on G.S. 110-129.2. newhire.ncdhhs.gov failed (proxy 502) and the
  DHHS employer page returned 404. Unclaimed: the notice threshold changes on 2026-12-01 (to $25 for all
  property). Breach: "without unreasonable delay", with no day count.
- **ND**: All four read. New hire penalty: the page names NDCC 34-15-05/06 but gives no amount.
  Unclaimed: read on the statute (N.D.C.C. 47-30.2). unclaimedproperty.nd.gov is a script-only app.
  Breach: "most expedient time possible and without unreasonable delay"; notify the AG when more than 250
  people are affected.
- **OH**: All four read, but on the Revised/Administrative Code only. oh-newhire.com returned 403 (not
  worked around), and jfs.ohio.gov pages returned 404. Unclaimed: the penalty section was not read, so
  penalty is null. The Commerce news page returned 404.
- **OK**: All four read. Breach: SB 626 took effect 2026-01-01. It adds AG notice within 60 days AFTER
  notifying residents, and exempts breaches affecting fewer than 500 residents. UI: the due date is in the
  OESC rules (Title 240) PDF, and the penalty is on the wage-reporting page. No new-hire or
  unclaimed-property penalty is stated.
- **OR**: All four read. Unclaimed: read on ORS 98.352/98.992. unclaimed.oregon.gov is a script-only app.
  The Form OQ 2026 instructions give the exact 2026 dates (Nov 2, 2026; Feb 1, 2027). Form OQ is also the
  Paid Leave Oregon quarterly report, so no separate pfml item.
- **PA**: All four read. Breach: the AG BPINA page applies to businesses ("without unreasonable delay"; AG
  notice at the same time when more than 500 residents). Its 7-business-day rules are for state agencies and
  contractors. legis.state.pa.us returned 403. No new-hire penalty is stated on PA CareerLink.
- **RI**: All four read. New hire is **14 days** (not 20), on the RI New Hire Reporting Directory
  site. UI: dlt.ri.gov HTML pages returned 403 (not worked around). The TX-17 due date ("last business day
  of April, July, October and January") was read on the Department of State's business-tax page, and the
  penalties on the 2026 TX-17 form PDF. Unclaimed: the statute says life insurers ALSO file before
  November 1, unlike most states. Unclaimed penalty not read. treasury.ri.gov returned 403.

## Duties 5 and 6 (partly done)
- Added: NJ RetireReady NJ registration (Dec 1, 2026 for 20-24 employees; Feb 17, 2027 for 10-19).
  It applies only to employers with 10+ NJ employees and no qualified plan. No shared question captures
  that, so it uses `us_employees` and says so in the note.
- Not added: OregonSaves (oregonsaves.com returned 403), NY Secure Choice and RISavers (script-only pages).
  Separate PFML/TDI premium reports for NJ (NJ-927), RI (TX-17) and OR (Form OQ) are folded into the quarterly
  UI reports (noted on those items). NY PFL/DBL, state pay-data reports and licence renewals were not
  researched.
