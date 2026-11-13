# Review 26, United States: questions (2026-11-13)

The question findings of the independent audit (questions/SUMMARY.md, the US parts, and q-US.txt), one line each.
Proof: `node --experimental-strip-types tests/verify/review26_us_q.ts` (each FIXED line is held there by the
auditor's own reproduction: every unasked question answered "no" or the first option). US version 2026.11.2 -> 2026.11.3.
The US importer is now run with `docs/compliance-research/us-r26q.json` added at the end (after the coverage agent's
`us-r26.json us-r26-fixes.json`, when those exist).

- **B1** FIXED. The three negative tick-list questions are replaced under NEW ids, so a saved answer to the old wording
  is never read with the new meaning: `us_x_de_under10` -> `us_x_de_10plus` ("Does the business have 10 or more eligible
  employees working in Delaware?"), `us_x_va_under5` -> `us_x_va_5plus` ("... five or more eligible employees in
  Virginia at the end of the last calendar year?"), and `us_x_nj_under10` -> `us_x_nj_size`, a choice of size band
  (see M9). The conditions of `us_x_de_pfml`, `us_x_va_retire` and the New Jersey rules now require the positive answer,
  so an unticked box no longer gives these duties to a small employer; the help keeps the facts already quoted.
  `tests/verify/review_us.ts` (S12, and the OSHA test, see C8) was updated to the new ids.
- **C1** FIXED. `fye` (us.ts) and `us_st_date` (us-states.ts) are `optional: true`; `us_st_date` moved from the "Your
  state" step to "Your dates". A blank date leaves the filing listed with "date still needed".
- **C3** FIXED (help). `us_x_tm_date` help no longer says "Maintenance deadlines are counted from it": it now says the
  10-yearly renewal is worked out from it and the 5th-to-6th-year declaration is shown as a period. Linking Section 8
  and Section 71 to the date would need a two-ended window the engine does not count ("between the 5th and 6th year").
- **C6** FIXED (help, read 2026-11-13):
  - `us_trust_foreign`: IRS Instructions for Form 3520-A, https://www.irs.gov/instructions/i3520a: "A foreign trust is
    any trust other than a domestic trust. A domestic trust is any trust if:" "A court within the United States is able
    to exercise primary supervision over the administration of the trust" / "One or more U.S. persons have the
    authority to control all substantial decisions of the trust." "An owner of a foreign trust is the person that is
    treated as owning any of the assets of a foreign trust under the grantor trust rules" (sections 671 to 679).
  - `us_x_msb`: FinCEN, https://www.fincen.gov/money-services-business-definition: "Currency dealer or exchanger." "Check
    casher." "Issuer of traveler's checks, money orders or stored value." "Seller or redeemer of traveler's checks, money
    orders or stored value." "Money transmitter." "U.S. Postal Service." "An activity threshold of greater than $1,000 per
    person per day in one or more transactions applies to the definitions of:" [the first four]; "No activity threshold
    applies to the definition of money transmitter."
  - `us_x_hipaa`: hhs.gov refused (403) and ecfr.gov answered with a bot check (unblock.federalregister.gov), so neither
    was used; read on govinfo.gov, 45 CFR 160.103 (2025 edition),
    https://www.govinfo.gov/content/pkg/CFR-2025-title45-vol2/xml/CFR-2025-title45-vol2-sec160-103.xml: Covered entity
    "(1) A health plan." "(2) A health care clearinghouse." "(3) A health care provider who transmits any health
    information in electronic form in connection with a transaction covered by this subchapter." Business associate:
    "creates, receives, maintains, or transmits protected health information for a function or activity regulated by
    this subchapter, including claims processing or administration, data analysis, processing or administration ...
    billing ...". The old help's "hhs.gov refused ... not read there" is gone.
  - `us_x_lqg`: EPA, https://www.epa.gov/hwgenerators/categories-hazardous-waste-generators: LQGs "generate 1,000
    kilograms per month or more of hazardous waste" or "more than one kilogram per month of acutely hazardous waste".
- **C7** FIXED. `us_x_g_turn65` ("turning 65 within 12 months AND not yet signed up") is split into `us_x_g_65soon` ("Will
  you turn 65 within the next 12 months?") and the follow-up `us_x_g_medicare_on` ("Are you already signed up for
  Medicare?"); `us_x_g_medicare_iep` applies on 65soon = Yes and not already signed up. An unticked follow-up keeps the
  enrolment period on the list (the safe side).
- **C8** headcount: FIXED where an earlier answer decides it. `us_x_emp11` = No (10 or fewer employees at ALL times last
  calendar year) hides `us_x_emp20` (COBRA's count is also last year's) and `us_x_est_size` (no workplace can have had 20),
  and with it `us_x_osha_appa`. NOT FIXED, because the earlier answer does not decide the later one: `us_x_emp50` and
  `us_x_emp100` ask about the business now, `us_x_emp11` about last year (a business can grow); `us_ale` is in an earlier
  step than `us_x_emp11`, and hiding `us_x_emp11` after ALE = Yes would need the OSHA rules to read ALE too, which turns a
  "Not sure" on ALE into a "check" for an employer who said it never had more than 10; `us_futa500` is a tax amount (its
  help's "roughly ten employees" is a rule of thumb, not a count); the Delaware, New Jersey and Virginia counts are
  employees in that state (Delaware and New Jersey count now; 10 employees exactly is "not more than 10" and still "10 or
  more"). Repro 9 (ALE 50 full-time but FMLA "not 50 employees") is the same last-year/now difference.
- **C8** `us_944` vs `us_deposit` semi: FIXED. `us_944` is not asked when `us_deposit` = semiweekly (more than $50,000 in
  the lookback period, against Form 944's "yearly liability of $1,000 or less" already in its help); Form 941 then applies.
  The monthly band is not decided ($2,500 in a quarter does not exclude a notified 944 filer) and still asks.
- **C8** `us_status` No vs green card: NOT FIXED. Tax residence and immigration status are different tests: a green-card
  holder can file as a nonresident (for example in the year the card was granted), and hiding the green-card question
  would hide the I-90 renewal that still applies to them.
- **C8** green card vs conditional card: FIXED. `us_x_g_conditional` is not asked after a Yes to the 10-year card (the
  green-card help already tells a conditional holder to answer No there).
- **C8** Selective Service vs turning 65: FIXED. `us_x_g_65soon` is not asked of a man aged 18 to 25 (`us_x_g_sss` = Yes).
- **C8** `us_foreign_owner` vs `us_x_fdi10`: FIXED. A C corporation that already said a foreign person owns 25% or more is
  not asked `us_x_fdi10`; `us_x_be15` and the BEA-contact question now read "foreign-owned" as fdi10 = Yes, OR a C
  corporation with `us_foreign_owner` = Yes, OR an LLC owned by one non-US person. (25% by value with no votes is in
  theory below BEA's 10% voting test; this errs towards showing the survey, which also needs BEA's contact.)
- **C9** FIXED (US part). `us_1041` why now reads "The trust or estate had taxable income or gross income of $600 or
  more, or it has a beneficiary who is a nonresident alien." (it applies on either answer).
- **C11** FIXED, new file `docs/compliance-research/us-r26q.json` (2 compliances, 1 question). The question already
  existed for the W-2 trigger (`us_household`, "$3,000 or more", asked of individuals); added:
  - `us_x_hh_w2` (federal / Payroll): IRS Publication 926 (2026), https://www.irs.gov/publications/p926: "File a separate
    2026 Form W-2 for each household employee to whom you pay either of the following wages during the year." "Social
    security and Medicare wages of $3,000 or more." "Wages from which you withhold federal income tax." "You must complete
    Form W-2 and give Copies B, C, and 2 to your employee by February 1, 2027." "You must also send Copy A of Form W-2
    with Form W-3 to the SSA by February 1, 2027." Shown as January 31 (the earlier of the two, as the note says:
    January 31, 2027 is a Sunday and the publication gives February 1, 2027). Penalty: "You may have to pay a penalty if
    you don't give Forms W-2 to your employees or file Copy A of the forms with the SSA by the due dates."
  - `us_x_hh_i9` (Employment, safety and benefits / Hiring) with the new person-facing question `us_x_hh_hire` ("Have you
    hired someone to work in your home on a regular basis, such as a nanny, housekeeper or caregiver?"): Publication 926:
    "When you hire a household employee to work for you on a regular basis, you and the employee must each complete the
    U.S. Citizenship and Immigration Services (USCIS) Form I-9" ... "No later than the first day of work, the employee must
    complete the employee section of the form" ... "You should keep the completed Form I-9 in your own records." The
    employer's limit is not in the publication; it was read on USCIS, Completing Section 2,
    https://www.uscis.gov/i-9-central/completing-form-i-9/completing-section-2-employer-review-and-attestation: "within 3
    business days of the date of hire of your employee (the hire date means the first day of work for pay)." Counted as 3
    business days after the first day of work.
- **M1** FIXED. `us_is_llc` is asked of a corporation only in the 16 states whose rules tell a corporation from an LLC
  (AZ CA CT DE DC IA LA MA MI MO NE NC ND OK PA VT, `LLC_ASK_CORP` in us-states.ts) and of a partnership everywhere but DE
  and TX. The test works the list out again from the rules (asked exactly where Yes and No give different results), so a
  later rule change that makes the answer matter in another state fails it.
- **M2** FIXED. An LLC owned by one non-US person (a US LLC, by its own description) is no longer asked
  `us_formed_abroad` (so no BOI report, which since 2025 is for companies formed abroad) or `us_x_fdi10` (it is
  foreign-owned by definition; BE-15 then hangs on BEA's contact only).
- **M8** FIXED (help). The finding gave no detail; the one reading the text allows was fixed: `us_x_dmca` asks whether an
  agent is already designated, and its help now says to answer Yes only then (the designation expires three years after
  registration, already quoted in the rule) and No if one was never designated.
- **M9** FIXED. New Jersey's size is one choice (`us_x_nj_size`: fewer than 10 / 10-19 / 20-24 / 25-39 / 40 or more), and
  each band has its own rule and date, re-read on
  https://www.nj.gov/treasury/securechoiceprogram/employers/employer-program-details.shtml: "December 1, 2026"
  "Employers with 20 to 24 employees"; "February 17, 2027" "Employers with 10 to 19 employees"; "September 15, 2024"
  "Employers with 40 or more employees"; "November 15, 2024" "Employers with 25 to 39 employees"; "Larger employers, your
  deadlines have passed. Take action today!" The two passed deadlines show as passed. Ids: `us_x_nj_retire` (10-19),
  `us_x_nj_retire_20`, `us_x_nj_retire_25`, `us_x_nj_retire_40`.
- **M10** FIXED (US part). `us_gift` reads "in a single calendar year" and its help states the $19,000 limit for gifts made
  in 2025 and in 2026 (the figure already in `us_709`).
- Not mine: M12 (number of questions), the US coverage findings (us-r26.json, us-r26-fixes.json, the `us_st_*` sources).

Compliances added: 5 (`us_x_hh_w2`, `us_x_hh_i9`, and three New Jersey band rules split from `us_x_nj_retire`).
Nothing needed an engine change.
