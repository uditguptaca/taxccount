# Review 26: Canada (independent audit of 2026-11-13)

Every official page below was opened in this session on 2026-11-13 with a plain page read. The new compliances are in
`ca-r26.json` (loaded last by the importer: `ca.json ca-fixes.json ca-gaps.json ca-r26.json`); question changes are
in `src/lib/compliance/countries/ca.ts` (version 2026.11.5 -> 2026.11.6), `ca.json` and `ca-gaps.json`. Proof:
`node --experimental-strip-types tests/verify/review26_ca.ts` (27 checks).

## Questions (questions/SUMMARY.md, Canadian parts)

- **C1** FIXED. `fye` and `ca_inc_date` are `optional: true`. A blank one no longer blocks the form; the dates that
  depend on it say the date is still needed (`needs: 'fye'` / `'ca_inc_date'`).
- **C4** FIXED. `ca_selfemp` ("you, or your spouse ...") is gone and replaced by two questions with new ids, so a saved
  answer is never read with the new meaning: `ca_biz_own` ("Did you yourself carry on a business this year?") and
  `ca_biz_spouse` (asked only when the first is No). Either one moves the T1 to June 15 (`ca_t1_se`, `ca_t1_pay`,
  `ca_tp1_se`, as before); only `ca_biz_own` makes an individual a seller who is asked about GST/HST, the small-supplier
  limit, taxi registration and provincial sales tax. `tests/verify/review_ca.ts` had five inputs named `ca_selfemp`
  (all meaning the person's own business); they were renamed to `ca_biz_own`, nothing else in it changed.
- **C5** FIXED. `ca_federal` now comes after `ca_npo_corp` in the question order, so a non-profit is asked whether it
  is incorporated before whether it was incorporated federally (and never asked the second when the answer is No).
- **C6** FIXED (help text):
  - `ca_x_private`: says who answers No: a reporting issuer under provincial securities law, a public corporation
    trading on a stock exchange designated under the Income Tax Act, or a wholly-owned subsidiary of one. Read on
    Corporations Canada, https://ised-isde.canada.ca/site/corporations-canada/en/individuals-significant-control
    (modified 2026-03-30): "A reporting issuer under provincial securities law or a wholly-owned subsidiary of such a
    corporation"; "A public corporation that trades its securities on a stock exchange designated by the Income Tax
    Act". (Crown corporations are also exempt there; they were left out of the help on purpose, because the same
    question also serves Ontario's and British Columbia's registers, whose exemptions were not read.)
  - `ca_trust_listed`: names the main entries of the CRA's list and where the full list is. Read on
    https://www.canada.ca/en/revenue-agency/services/tax/trust-administrators/t3-return/enhanced-reporting-rules-trusts-bare-trusts-faq.html,
    question 2.3.C (years ending on or after December 31, 2025): "(a) had been in existence for less than three
    months;" "(b) holds assets with a total fair market value that does not exceed $50,000 throughout the year;"
    (b.1) the $250,000 related-family trust; "(d) is a registered charity;" "(f) is a mutual fund trust," "(j) is a
    graduated rate estate ..."; (n) trusts governed by registered plans; and, on
    .../filing-trust-return/who-should-file.html (modified 2026-07-03): "This provides an exception for a lawyer's
    general trust account, but not for specific client trust accounts."
  - `ca_x_msb`: lists the services that make a money services business. Read on
    https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng (modified 2026-08-27): "foreign exchange
    dealing"; "remitting funds or transmitting funds by any means or through any person, entity or electronic funds
    transfer network"; "issuing or redeeming money orders, traveller's cheques or other similar negotiable
    instruments"; "dealing in virtual currencies".
- **C7** FIXED where cheap, reworded elsewhere:
  - `ca_x_noncdn` split into `ca_x_noncdn_owned` ("owned or controlled by non-Canadians?") and `ca_x_noncdn_new`
    ("just started a new business activity ... or bought control ...?", asked after a Yes); `ca_x_ica_notice` needs both.
  - `ca_x_g_fcp` split into `ca_x_g_fcp_100` (100 or more permanent employees) and `ca_x_g_fcp_bid` ($1 million
    federal bids, asked after a Yes); `ca_x_g_fcp_aiee` needs both.
  - `ca_sbd`, `ca_corp_instal`, `ca_gst_instal`, `ca_owing`, `ca_construction`: NOT SPLIT. Each rule truly needs both
    parts at once, and these ids are answered by the cross-country and browser/API suites (`compliance_scenarios.ts`,
    `compliance_browser.cjs`, `compliance_api.py`, `service_master_*`), which this round may not edit. Their help now
    says "Answer Yes only if both are true ... If either is not true, answer No."
- **C8** (Canadian contradictions):
  - `ca_x_emp_band` 1-5 vs `ca_x_g_fcp`: FIXED. `ca_x_g_fcp_100` is asked only when the headcount answer is "100 or
    more"; with 1 to 5 employees neither FCP question nor the item appears.
  - `ca_ccpc` vs `ca_x_private` No: FIXED. A CCPC is private (the pack's own help: "A private corporation that is not
    controlled by non-residents or public companies"), so `ca_x_private` is not asked after `ca_ccpc` Yes, and the
    three register items (`ca_x_isc_change`, `ca_x_on_isc`, `ca_x_bc_transparency`) apply on `ca_ccpc` Yes OR
    `ca_x_private` Yes.
  - `ca_x_fintrac` No vs `ca_x_msb` Yes: FIXED. `ca_x_msb` is now asked first and `ca_x_fintrac` is reworded "Is the
    business in another of the sectors ..." and asked only when it is not a money services business. The earlier
    round's decision is kept: a money services business gets every FINTRAC report (`review_ca.ts` C17 still passes).
  - `ca_x_trade` Yes vs imports No and exports No: DID NOT HOLD. `ca_x_g_exports` asks about exports of CAD 2,000 or
    more per shipment or restricted goods ("Non-restricted commercial goods under CAD 2,000 do not need an export
    declaration"), so Yes / No / No is a real case (an exporter of small non-restricted shipments), not a
    contradiction; the RM account item correctly stays.
- **C9** FIXED. The reason on `ca_x_fintrac_lctr`, `_str`, `_review` now reads "It is a money services business, or
  the business is in another sector that must report to FINTRAC", and with the reorder above it can no longer sit
  beside a No to the sector question.
- **M3** FIXED (wording). `ca_pe` reads "... in Alberta or Québec (apart from the province you chose above)?" and its
  help says a corporation based in one of them is already counted there. The options themselves cannot depend on the
  province: the engine has no per-place option list.
- **M4** FIXED. Help added to the ten Canadian questions that had none: `ca_npo_income`, `ca_employment`,
  `ca_rental`, `ca_invest`, `ca_request`, `ca_nrtrust_d`, `ca_contractors`, `ca_grants`, `ca_construction`,
  `ca_dividends` (plain words, no new rule).
- **M5** NOT FIXED. A question has one wording for every entity type it is shown to ("you" for a company, "the
  business" for a trust or non-profit); the engine cannot vary the text by entity type. The audit's own check that a
  PERSON is never asked about "the business" passes.

## Coverage (cov-ca-us/SUMMARY.md, Canada)

- **C1** FIXED: `ca_x_payroll_account` (every employer). https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/open-manage-payroll-account/determine-need-register.html
  (2026-02-27): "You are required to register for a payroll account if you are an employer, a trustee ... or a payer of
  other amounts related to employment." "You have to register for a payroll account before the first remittance due
  date." "Your first remittance due date is the 15th day of the month following the month in which you began
  withholding deductions ... from your employee's pay". Shown as the rule in words (`within: null`): the person gives
  no date it could be counted from.
- **C2** FIXED for MB and NB; NEEDS RESEARCH for SK and NS.
  - `ca_x_mb_wcb_payroll`: https://www.wcb.mb.ca/employers/premiums-and-payroll/reporting-payroll/ "You must report
    before the last day in February." The page also says "by the end of February"; the date shown is the day before
    the last day of February (the earlier reading), as the note says.
  - `ca_x_nb_wsnb_payroll`: https://www.worksafenb.ca/employers/insurance/accounts-and-coverage/ "Employers must report
    their payroll information to WorkSafeNB by February 28 of each year." "Annual employers must complete Form 100 -
    Employer Payroll Report". (The 2026 Form 100 notice the auditor quoted was not found; this page carries the rule.)
  - Saskatchewan (https://www.wcbsask.com/employers/reporting-payroll: 502 Bad Gateway) and Nova Scotia
    (https://www.wcb.ns.ca/: 503 Service Unavailable) refused again: left out.
- **C3** FIXED: `ca_x_ns_bizname_renew` (sole proprietorship or partnership in Nova Scotia with a registered business
  name), counted from the new optional date question `ca_x_ns_reg_date`, end of the anniversary month (the same reading
  as the existing `ca_ar_ns`). https://novascotia.ca/renew-business-or-non-profit-registration-registry-joint-stock-companies
  "Businesses and non-profits need to renew their registration and pay a renewal fee each year they continue to
  operate." "Renewal is due in the anniversary month that the business or non-profit originally incorporated or
  registered."
- **C4** FIXED: `ca_x_g_marital_tell`, asked by `ca_x_g_marital` (personal documents and status).
  https://www.canada.ca/en/revenue-agency/services/child-family-benefits/update-your-marital-status-canada-revenue-agency.html
  (2026-03-20): "You must tell the Canada Revenue Agency (CRA) about your new marital status by the end of the
  following month after your status changed." "For example, if your status changed in March, you must tell us by the
  end of April." Rule in words (`within: null`): "end of the following month" is not a fixed number of days, and
  counting one month from the day would not be the same date.
- **C5** FIXED, marked to confirm: `ca_x_nl_hapset` with the question `ca_x_nl_payroll2m` (NL employers over $2
  million). Duty read on https://www.gov.nl.ca/fin/tax-programs-incentives/business/education/: "Payroll tax, at a rate
  of 2%, is payable by employers on annual remuneration in this province that exceeds a predetermined exemption
  threshold." "Effective January 1, 2023, the exemption threshold has been increased from $1.3 million to $2 million for
  all employers." The date was read only in the department's return explanation linked from its Tax e-Filing page
  (https://www.gov.nl.ca/fin/files/tax-programs-incentives-business-taxefile-hapset-return-description.pdf, dated 2009):
  "The return should be filed with the Department of Finance within 20 days following the end of the reporting
  period." Because that document is from 2009 and the Act (https://www.assembly.nl.ca/legislation/sr/statutes/h01.htm)
  answered "page not found", the item is `verified: false` and its note says so. NEEDS RESEARCH: the current Act or a
  current bulletin, for the due date and the penalty.
- **C6** FIXED: `ca_x_nr_services_remit` and `ca_x_t4a_nr`, asked by `ca_x_nr_services`.
  https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4445/t4a-payments-non-residents-services-provided-canada.html
  (2025-12-12): "As a payer, you have to withhold 15% from fees, commissions or other amounts that you pay to
  non-resident individuals, partnerships, or corporations for services provided in Canada." "You have to remit your tax
  deductions so that the CRA receives them on or before the 15th day of the month following the month the amount was
  paid or credited to the non-resident." "The T4A-NR information return is due on or before the last day of February
  following the calendar year in which you paid the amounts." Penalties: "The CRA can assess a penalty of 10% of the
  required amount of tax you failed to deduct." and "The penalty is $100 or the amount calculated according to the
  chart below, whichever is more".
- **C7** FIXED: `ca_x_slips_efile`, asked by `ca_x_slips5` (only of someone who files slips).
  https://www.canada.ca/en/revenue-agency/services/e-services/filing-information-returns-electronically-t4-t5-other-types-returns-overview/filing-information-returns-electronically-t4-t5-other-types-returns-what-you-should-know-before.html
  (2026-10-16): "If you file more than 5 information returns (slips) for a calendar year, you are required to file
  electronically." Penalty table: 6 to 50 slips $125; 51 to 250 $250; 251 to 500 $500; 501 to 2,500 $1,500; 2,501 or
  more $2,500. It sets how slips are filed, not a date, so its rule is in words and each slip keeps its own due date.
- **C8** FIXED: `ca_x_g_ccb_changes`, asked by `ca_x_g_ccb` (Canada child benefit recipients).
  https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/get-payments.html
  (2026-10-22): "You must let the CRA know as soon as possible if there are any changes to your situation or personal
  information." "You must tell the CRA right away if you are getting benefit or credit payments for a child who is no
  longer in your care". "Each parent must immediately tell the CRA of their new custody arrangement". No period is
  stated, so the rule is in words. The GST/HST credit and other benefits were not researched.

## Count

10 compliances added (9 confirmed on the official page, 1 to confirm: `ca_x_nl_hapset`); 6 new questions in
`ca-r26.json`, 2 split questions in `ca.json`, 2 in `ca-gaps.json`, 2 in `ca.ts`. Importer: 95 Canadian researched
compliances (was 85), 0 left out.

## Could not be expressed

- Per-province option lists (M3) and per-entity wording (M5).
- "End of the month after the month of the change" (marital status) from a date the person gives: the engine counts
  whole periods from a day, not to the end of the following month, so the rule stays in words.
