# US state items, first half: notes (checked 2026-11-11)

Results: /tmp/claude-0/-home-user/6a2b5677-d0ea-50bb-b192-65a837ccd8e0/scratchpad/research3/us-st1.fixes.json

## Counts
- 67 entries. Penalty found for 63; not found for 4 (the generic "your state's ..." entries, where the rule differs by state).
- 8 entries needed confirming: 5 confirmed (4 with a corrected dueText and due rule), 3 still unconfirmed (us_st_nonres, us_st_partyear, us_st_est_tax).

## Existing rules that were wrong or incomplete
- us_de_sct: we said the date was not stated. The 2025 SCT-RTN instructions say the 15th day of the 3rd month after the close of the tax year; a federal 6-month extension extends Delaware filing too. Due rule: afterYearEnd fy months 3 day 15.
- us_ca_568_sm: the FTB due-dates page gives three cases. Owned by an individual or non-pass-through entity: 15th day of the 4th month (extended: 10th month). Owned by an S corp or by a partnership: 15th day of the 3rd month. Due rule given for the individual case: afterYearEnd fy months 4 day 15.
- us_nj_cbt_s: the CBT-100S is due the 15th day of the month after the federal return's original due date, which the 2025 schedule maps to the 15th day of the 4th month (Dec 31 year end: April 15). Due rule: afterYearEnd fy months 4 day 15.
- us_tx_twc: the old sourceUrl (programs/unemployment-tax/register-new-account) returns "Page Not Found". It was not a block. The page that is live now, https://www.twc.texas.gov/services/register-tax, says to register "within 10 days of becoming liable". Our "when you start paying employees" is close, but it is not the official wording.
- us_wa_emp: the DOR hiring page also says to file the Business License Application "no sooner than 90 days before you plan to hire".
- us_ny_it204: for 2025 the official date is March 16, 2026, because March 15 falls on a Sunday. This matches our rule once weekend roll is applied.

## Penalties that are not tied to the item itself
- Employer-account entries (us_de_emp, us_ny_emp, us_wa_emp, us_wy_emp, us_il_emp, us_tx_twc): no page states a penalty for registering late, except California, where the EDD charges $100 per unreported employee for wilful failure to register. The penalties reported are for the returns and contributions that follow registration, and each entry's note says so.
- us_ny_204ll: the instructions say only "may be subject to penalties and interest", with no figure.
- us_nyc_tax: the NY personal income tax penalty page is used, because the City tax is on the same IT-201. The page does not name the City tax.

## Statute or legislature sites used because the agency page gave no figures
- Nevada: NAC 360.395 (graduated 2/4/6/8/10% late-payment schedule) and NRS 360.417/360.300 (0.75% a month interest; 10% penalty on a determination for not filing), both from leg.state.nv.us.
- Washington: RCW 82.32.090 (9% / 19% / 29%, minimum $5) from app.leg.wa.gov. The DOR late-filing page gives no rates.
- Wyoming: W.S. 39-15-108 (sales tax) and W.S. 27-3-503, 27-3-510, 27-14-202 and 27-14-203 (unemployment insurance and workers' compensation), from the compiled titles on wyoleg.gov.
- Texas TWC: TUCA chapter 213 as published by TWC (Sec. 213.021 interest 1.5% a month up to 37.5%; Sec. 213.022 report penalties starting at $15). statutes.capitol.texas.gov is a JavaScript app and returned no text.

## Access
- No site refused access. Earlier 404s: tax.ny.gov IT-204 HTML instructions (the 2025 PDF was used instead), the Illinois Publication 103 sub-pages (the main publication page holds the full text), dor.wa.gov "late-payment-penalties-and-interest" (the page does not exist), and the old TWC register URL.

## Repeals and changes seen
- Nevada sales tax: from the January 2026 period the due date moves to the 20th. NRS 360.417 still counts interest from "the last day of the month following the period"; this was not checked against any newer amendment.
- California EDD figures are from DE 231EP Rev. 3 (1-26). New York sales tax penalties are from TB-ST-805 (issued 2010). Illinois figures are from Publication 103 (September 2025), which also mentions an amnesty that ran October 1 to November 17, 2025.
