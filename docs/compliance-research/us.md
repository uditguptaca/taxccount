# United States (federal) non-tax compliance: research notes

Checked 2026-11-11. Output: `us.json` in this folder. 47 items: 43 verified, 4 not verified.
Everything is federal; `states` is null on every item. State rules were not researched.

## How the pages were read

- Each official page was opened in this session. Long PDFs (DOL reporting guide, FinCEN final-rule Q&A,
  EPA TRI basic concepts, BEA Form BE-13A, FTC franchise guide, PBGC premium instructions) were read as text.
- Source `title` values are descriptive. The exact `<title>` of each page was not captured, so treat them as
  labels, not quotations.
- `pageUpdated` is filled only where the page showed a date. Some are month-only ("2024-12").
- No weekend/holiday rule was confirmed for any of these authorities except PBGC (its page says a date on a
  weekend or federal holiday moves to the next business day). Consider `roll: false` for the rest.
- Frequency has no "every two years" or "every ten years" value. Three items use `annual` with a multi-year
  rule and say so in `note`: `us_x_biennial_hw` (even years), `us_x_fda_food` (even years),
  `us_x_tm_renew` (every 10 years, anniversary of the new date question `us_x_tm_date`).
  `us_x_mcs150` (every 24 months, schedule set by USDOT number digits) uses an event rule.
- Questions have only `askKinds`, so follow-up logic is in the `applies` conditions:
  `us_x_osha_appa` matters only when `us_x_est_size` is `20to249`; `us_x_regd_ongoing` only after `us_x_regd`;
  `us_x_db_plan` only after `us_x_retirement_plan`; `us_x_tm_date` only after `us_x_trademark`.
- Reused existing question ids: `us_employees`, `us_formed_abroad`, `us_foreign_corp`, `us_foreign_pship`.
  Note `us_foreign_corp` / `us_foreign_pship` are not shown to the foreign-owned LLC entity type.

## Pages that refused automated access (not worked around)

| Site | Result | Effect |
|---|---|---|
| hhs.gov (HIPAA breach notification pages) | HTTP 403 | HIPAA deadlines read in 45 CFR 164.404 / 164.408 / 164.410 on govinfo.gov (2025 annual edition). Who is a "covered entity", HHS guidance and penalties not read. |
| ecfr.gov and federalregister.gov | redirect to a bot check | Not used. The BOI final rule text (91 FR, doc. 2026-16576) could not be read. |
| fincen.gov final-rule PDF (BOIFinalRuleforFR.pdf) | HTTP 403 | Same. The FinCEN Q&A PDF did open. |
| acf.gov (federal child support office, new-hire reporting) | HTTP 403 on two pages | The 20-day new-hire deadline was read on sba.gov only. What to report, the rehire rule and penalties not read. |
| fmcsa.dot.gov (registration, MCS-150, UCR pages) | HTTP 403 on three pages | MCS-150 read in 49 CFR 390.19T on govinfo.gov (2025 annual edition). UCR deadline not confirmed. |
| dol.gov/agencies/ofccp/contractorportal | HTTP 403 | The OFCCP home page did open (see below). |
| phmsa.dot.gov (hazmat registration) | HTTP 403 | Item left out. |

## Rules found suspended, changing or closed (left out on purpose)

- **EEO-1 Component 1.** eeoc.gov says all private employers with 100 or more employees, and federal
  contractors with 50 or more meeting certain criteria, must file; "The 2024 EEO-1 Component 1 Data Collection
  is CLOSED" and updates on the 2025 collection "will be posted to this page as they become available". No
  opening date or deadline is published. A search result on eeoc.gov also shows a 2026 proposed rule to rescind
  the EEO-1 reports (not opened). EEO-3 and EEO-5 are "delayed". Left out: no firm date.
- **OFCCP affirmative action program certification.** dol.gov/agencies/ofccp: Executive Order 11246 was revoked
  on January 21, 2025 (E.O. 14173); "the Section 503 and VEVRAA affirmative action program (AAP) certification
  period will remain closed". Section 503 and VEVRAA themselves remain in effect. Left out.
- **FinCEN beneficial ownership (already in the country file as `us_boi`).** FinCEN issued a final rule on
  August 11, 2026, effective August 14, 2026. It makes the 2025 interim rule permanent: US companies and US
  persons are exempt; only entities formed under foreign law and registered to do business in a US State or
  Tribal jurisdiction report. It adds two reliefs: no reporting of US-person company applicants, and US persons
  with a FinCEN ID need not update or correct it. The existing `us_boi` text is still right. FinCEN's FAQ page
  and Small Entity Compliance Guide carry a banner that they may be outdated. New item `us_x_boi_update`
  (unverified) covers updates and corrections.
- **FinCEN Residential Real Estate Rule.** fincen.gov/rre: a court vacated the rule; FinCEN has appealed;
  "reporting persons are not required to file Real Estate Reports with FinCEN". Left out.
- **CIRCIA cyber incident reporting (CISA).** Final rule not issued; "organizations are not required to submit
  covered cyber incident or ransom payment reports under CIRCIA" yet. Left out.
- **BEA benchmark surveys.** BE-10 (fiscal year 2024) was due May 30 / June 30, 2025 and is past; the next
  BE-10 and the next BE-12 are not announced on BEA's pages. Left out. BEA dropped the annual filing for
  minority-owned affiliates and form BE-11C.
- **Census Bureau AIES.** Mandatory under Title 13 for selected businesses, but "Data collection for the 2025
  AIES has ended" and no next due date is published. Left out. The 2027 Economic Census was not found on the
  page read.
- **VETS-4212.** Included, but the page contradicts itself: "The current reporting threshold is $200,000" and
  one FAQ still says $150,000.

## Items marked not verified, and why

1. `us_x_boi_update`: the Q&A says reporting companies must file an updated or corrected report, but the number
   of days was read only for non-US individuals updating a FinCEN identifier (30 calendar days). The rule text
   was blocked.
2. `us_x_be15`: who files and the 2025 survey date (May 31, 2026) were read; the date of the 2026 survey is not
   published, so the recurring date is an assumption from two past years.
3. `us_x_be11`: same, plus it is unclear whether a business with only small foreign affiliates, not contacted by
   BEA, must file.
4. `us_x_ucr`: who registers and the 2027 fees were read on plan.ucr.gov; the last day to register is not stated
   there and FMCSA's page was blocked.

## Things inside verified items that were NOT confirmed

- OSHA: the list of industries exempt from record keeping, and appendix A / appendix B industry lists, were not
  read (the checker asks the person). OSHA penalty amounts not read.
- Form I-9: current penalty amounts (USCIS links only to a 2019 inflation notice).
- HIPAA and MCS-150: read in the CFR annual edition dated 2025-10-01, not on the agency's live page.
- New-hire reporting: verified on the SBA page only (a worked example on that page), see table above.
- Form 5500: the IRS page gives the $250-a-day penalty; DOL's own penalty was not read. Welfare-plan filing
  thresholds were not read; the checker asks only about retirement plans.
- Posters: a continuing duty with no date. The FMLA poster penalty figure on the DOL page was not recorded
  verbatim, so it is not quoted.
- FTC penalty figure $53,088 appears on three FTC pages; the CAN-SPAM page's edit note still says "Edited
  January 2024", so the page may carry a later figure than its note suggests.
- Part D notice: "prior to October 15th" is modelled as October 14.
- BE-13: the $40 million threshold was read on Form BE-13A (acquisitions) only.
- Gag clause attestation and Part D pages were last modified in September 2024.
- E-Verify federal contractor page was last updated in 2017.
- Patent maintenance fees: which patent types are subject to them was not read.

## Looked at and left out for lack of a readable official deadline

- Customs (CBP): importer number (Form 5106), bonds, entry summary timing, Importer Security Filing and
  5-year records. The CBP pages opened state no deadlines; two others returned 404.
- CMS prescription drug data collection (RxDC): the CMS page opened gives no due date.
- FDA medical device establishment registration (yearly, October 1 to December 31; new establishments within
  30 days): timing read on a page "current as of 12/23/2017", who must register not read. Not included.
- Form M-1 for multiple employer welfare arrangements (DOL guide: "Generally, due by March 1st of the year after
  the calendar year for which report is required"): niche, not included.
- COPPA: no dated filing found; not researched further.
- FinCEN currency transaction and suspicious activity reports, SEC filings other than Form D, export filings,
  FCC, DEA, ATF, TTB, FAA: not researched.

## The 5 most important gaps still open

1. **EEO-1 Component 1**: no collection dates published for the 2025 report and a proposed rescission; needs a
   re-check on eeoc.gov/data/eeo-data-collections before it can be added.
2. **HIPAA on HHS's own site** (blocked): who is a covered entity or business associate, the HHS breach portal
   steps and penalties; and the same for **new-hire reporting on acf.gov** (blocked): details and penalties.
3. **FinCEN BOI updates and corrections**: the deadline in the August 2026 final rule text could not be read.
4. **Motor carriers**: UCR registration deadline and any 2026 change to the MCS-150 biennial update on
   fmcsa.dot.gov (blocked); PHMSA hazmat registration (blocked).
5. **Importers and exporters**: no CBP item at all (bond, entry summary, ISF, record keeping), and no
   Census/BEA services surveys (BE-120, BE-125 and similar) were checked.
