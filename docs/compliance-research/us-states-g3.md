# US states group 3: notes (checked 2026-11-11)

States: MD, MA, MI, MN, MS, MO, MT, NE, NV, NH. 43 items in us-states-g3.json: duties 1-4 for all 10 states (40 items), plus paid-leave contributions for MA, MN and MD (duty 5).
41 items are verified. 2 are not (MI new hire, NV UI wage report).

None of these states had a quarterly UI wage report in us-states.ts. Nevada has only the Modified Business Tax return, which is a separate tax, so all 10 UI items were added.

## Per state: what could not be read, and anything unusual

**Maryland**
- Unclaimed property: the Comptroller's holder pages have moved to claimitmd.gov, a JavaScript-only app. The deadlines (Oct 31 for most holders, Apr 30 for insurers) and the 15% late penalty were read in the site's own page code. The due-diligence letter window was not found.
- Breach: 45 days after discovery (Com. Law 14-3504, 2026 text). The Attorney General must be told BEFORE the individuals.
- FAMLI (paid leave) added. Contributions and the quarterly wage and hour report start with 2027 wages, and the first filing is due April 30, 2027. The penalty amounts are not stated.

**Massachusetts**
- New hire: 14 days. This also covers independent contractors, retirees and workers' compensation claimants.
- UI: the DUA page states only the 12% interest. A late-filing penalty amount was not on the current pages.
- Unclaimed: the "penalties and interest" are stated without amounts.
- Breach: "as soon as practicable and without unreasonable delay", to the AG, OCABR and residents.
- PFML quarterly return added (830 CMR 175M.8.1).

**Michigan**: michigan.gov returned 403 (Akamai "Access Denied") for every page: UIA, Treasury and MDHHS. This was not worked around.
- New hire: NOT verified. The state portal mi-newhire.com is script-only, and its help pages returned 403. The Michigan statute was not found on legislature.mi.gov. The item uses the federal 20-day maximum (42 USC 653a), and the penalty was not read.
- UI: read in Admin Code R 421.121 (due the 25th of the month after the quarter). The UIA penalty amounts were not read, only the interest rule.
- Unclaimed: read in MCL 567.238 (July 1 for the year to March 31). The penalty section was not found.
- Breach: MCL 445.72, "without unreasonable delay". There is no AG notice in the text read.

**Minnesota**: some mn.gov pages hit a bot check (perfdrive/ShieldSquare): the UI due-dates page and the Commerce unclaimed page. Other official pages carried the same facts.
- Breach: "most expedient time possible and without unreasonable delay". Consumer reporting agencies must be told within 48 hours if more than 500 people are notified. This deadline is not for the AG.
- Paid Leave wage detail report and premiums added (268B.12 / 268B.14). The premium start date was not read.
- Secure Choice retirement: not added. The deadline table on mn.gov is an image, and securechoice.mn.gov returned 403.

**Mississippi**
- New hire: 15 days, which is shorter than federal.
- Unclaimed: the report is due EVERY THIRD YEAR (2023, 2026, 2029), before November 1. The source is the Treasurer's 2020 instructions PDF. The current holder page says holders may report any time once property is 5 years dormant. Because the rule does not fit the "fixed" shape, due is written as an event. The 60-day due-diligence letter is only a "suggestion" in the FAQ.
- Breach: the Mississippi code is not on a state site. The text of 75-24-29 was read in its reprint in 2026 SB 2128. That bill would have added AG notice but died in committee, so there is no AG notice.

**Missouri**: no gaps.
- The new-hire report goes via the Department of Revenue to DSS (RSMo 285.300).
- Breach: the AG and the credit agencies are notified when more than 1,000 consumers are notified.

**Montana**
- New hire: no penalty amount was found.
- The UI Employer Handbook was revised January 2025.
- Breach: a copy of the notice goes to the AG's Office of Consumer Protection at the same time.

**Nebraska**
- Unclaimed: the penalty section of the Act was not found. The due-diligence window (60 to 120 days) was read on the Treasurer's JS app page code (nebraskalostcash.nebraska.gov).
- New hire also covers independent contractors.
- Breach: the AG must be told no later than the residents.

**Nevada**: detr.nv.gov returned 403 for every page. This was not worked around.
- New hire: read on the DWSS child-support page (20 days) plus NRS 606.120.
- UI: NOT verified. NAC 612.260 gives the contribution payment date (last day of the month after the quarter), but the report date is "prescribed by the Administrator" on DETR pages that refused access. The forfeit and interest were read in NRS 612.740.
- Unclaimed: read in NRS 120A (Nov 1; insurers May 1; 18% interest; $200 a day up to $5,000). The Treasurer's holder pages were not read.
- Retirement (NEST): not added. nest.nv.gov returned 403, and the search results gave conflicting registration deadlines.

**New Hampshire**: nhes.nh.gov and mm.nh.gov returned 403. gc.nh.gov (statutes and rules) closed plain curl connections with an empty reply (not a refusal page), so the RSA and rule texts were read with the WebFetch tool. Flagging this in case it counts as a workaround.
- New hire: 20 days, and also covers contractors paid over $2,500. The penalty is in the NHES guide, which returned 403, so it is not recorded.
- UI: due date from Emp 303.02 / 304.01. The late fee comes from RSA 282-A:142 (10% of contributions, minimum $25).
- Unclaimed: RSA 471-C:19 and Tre 303 (60 to 120 days due diligence; 18% interest; $100 a day up to $5,000).
- Breach: "as soon as possible" to individuals. Notify the AG, or the regulator for businesses regulated under RSA 358-A:3, I. No days are fixed for the AG.

## Duties 5-6 not covered
- Retirement programmes: MarylandSaves, Minnesota Secure Choice and Nevada NEST were not added (reasons above).
- Licence renewals: not researched. Nevada's state business license renewal is already in us-states.ts with the annual list.
