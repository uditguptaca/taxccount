# US states group 2: non-tax duties (checked 2026-11-11)

States: GA, HI, ID, IL, IN, IA, KS, KY, LA, ME. None of them had a quarterly UI wage report in us-states.ts, so duty 2 was researched for all ten.
Every item was read on a state legislature, state agency, treasurer or attorney-general page in this session. Working copies: g2-pages/ (urls.log lists every fetch).

## Per state: what could NOT be read
- **Georgia**: new-hire penalty: the directory's compliance page only describes the federal option (up to $25 / $500), so no Georgia penalty is recorded. Breach: read on the Attorney General's Consumer Ed page summarising O.C.G.A. 10-1-912 (no state-hosted statute text found). Unclaimed: no due-diligence window or penalty on the DOR FAQ. Unusual: new-hire deadline is 10 days (shorter than the federal 20).
- **Hawaii**: unclaimed: the January 2026 guidelines state no penalty. Otherwise complete. The UI handbook URL contains "test-handbook-for-employers" but is the live DLIR page.
- **Idaho**: new hire: the page states no penalty. Complete otherwise. The breach statute's 24-hour Attorney General notice applies to public agencies only.
- **Illinois**: ilga.gov (statutes and admin code) failed a TLS certificate check from this environment, and the Treasurer's iCash site returns only a script shell. So: **unclaimed property is verified:false** (May 1 / November 1 split by holder type seen only in search snippets). Breach: AG page gives "without unreasonable delay"; the >500-resident AG notice rule for private businesses was not read and is not recorded. UI: IDES also has a monthly wage reporting duty (nav link seen), not researched.
- **Indiana**: iga.in.gov (Indiana Code) loads by script, unreadable. **Unclaimed is verified:false**: dates (life insurance May 1, others November 1, safekeeping November 30) read only in an AG presentation from 2016 hosted on in.gov; 180/60-day due diligence from a 2025 SBOA presentation. Breach: AG FAQ says "without unreasonable delay"; the 2022 45-day limit (HB 1351) was NOT confirmed on an official page, noted in the item.
- **Iowa**: complete. New-hire deadline is 15 days. Unclaimed statute gives no due-diligence window in days.
- **Kansas**: dol.ks.gov returned 403 for every page (new-hire form, K-CNS 100, employer FAQ); new hire and UI were read in statutes (K.S.A. 75-5743, 44-717) plus the DCF employer page. New hire: statute says 20 BUSINESS days, DCF says 20 days. No new-hire penalty found.
- **Kentucky**: treasury.ky.gov returned 403 (holder book, FAQ). Unclaimed read in 20 KAR 1:080 (November 1, 180/60-day notice, >$50); the insurers' May 1 date and any penalty were not read. New hire: since July 1, 2025 reports go to the Office of the Attorney General (KRS 405.435); penalty $250/month/person after two notices.
- **Louisiana**: UI: Louisiana Works says "within 30 days after the end of the quarter" (gives July 30/Oct 30, not the 31st) - encoded as days:30. Unclaimed: no penalty amounts (guide cites R.S. 9:176). Breach is one of only two fixed-day deadlines in the group: 60 days to residents, AG within 10 days of resident notice.
- **Maine**: maine.gov returned 403 for every page tried (DHHS new-hire FAQ, ME UC-1 instructions, employer FAQ, Treasurer's unclaimed manual, PFML FAQ). All Maine items were read on legislature.maine.gov statutes instead. Unclaimed: due-diligence window and penalty not read. New hire is 7 days and also covers independent contractors paid $2,500+. Breach: 30 days after becoming aware and identifying scope.

## Duties 5-6
- Added: Maine PFML contribution report (verified:false - statute says quarterly, the date is set by the Department and its pages were 403).
- Not researched for lack of time: Hawaii TDI/prepaid health care, Illinois Secure Choice (Treasurer news page read: Wave 5 deadline for employers with 5+ employees was Nov 1, 2023, already past; no rule for new employers was read, so no item), Illinois monthly wage reporting, state licence renewals.

## Things a reviewer should know
- Several sites block automated access (403): dol.ks.gov, maine.gov, treasury.ky.gov, revenue.ky.gov. Not worked around.
- ilga.gov fails certificate verification here (not a bot block); left unread rather than disabling TLS.
- Unclaimed "before November 1" is encoded as fixed [10,31]; Georgia says "due on November 1st" and is [11,1].
