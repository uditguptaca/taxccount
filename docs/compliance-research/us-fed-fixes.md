# US federal: penalties and confirmations (checked 2026-11-11)

Results: /tmp/claude-0/-home-user/6a2b5677-d0ea-50bb-b192-65a837ccd8e0/scratchpad/research3/us-fed.fixes.json (54 entries, 69 sources, ids `us_y_fed_*`).

## Counts
- Penalties found: 53 of 54. Not found: `us_x_safeguards` (FTC Safeguards Rule notice). ftc.gov refused, and the rule text on eCFR states no penalty.
- Confirmation (7 entries needed it):
  - Confirmed: `us_sched_d`, `us_sched_e`, `us_1095c`, `us_x_be15`, `us_x_be11`.
  - Corrected: `us_x_boi_update` (new dueText and due rule given).
  - Still unconfirmed: `us_x_ucr`. No official page read states the last day to register.

## Sites that refused automated access (not worked around)
- osha.gov: CloudFront 403, 3 tries. I used 29 CFR 1903.15 on eCFR and 29 U.S.C. 666 on govinfo instead.
- ftc.gov: 403 on the Safeguards page and on the franchise compliance guide PDF, twice each. I used 16 CFR 436 and 1.98 on eCFR.
- sec.gov: 403 on the Form D page, twice. I used 17 CFR 230.507 on eCFR.
- hhs.gov: 403. I used 45 CFR 160.404 and 102.3 and 160.103 on eCFR.
- fmcsa.dot.gov: "Access Denied" 403 on the UCR page. clearinghouse.fmcsa.dot.gov did work. I used Part 386 Appendix B on eCFR.
- e-verify.gov: 403 this run. I used FAR 52.222-54 and 22.1802 on eCFR.
- acf.gov: empty 202 response, twice. I used 42 U.S.C. 653a on govinfo.
- www.ucr.gov: returns an app shell with no text. plan.ucr.gov worked.
- federalregister.gov was not needed.

## Existing rules that looked wrong or incomplete
- `us_x_boi_update`: our text says the 30-day period applies only to non-US individuals updating a FinCEN ID. That is wrong. The current eCFR text of 31 CFR 1010.380 includes the August 14, 2026 amendment. It says a reporting company must:
  - file an updated report within 30 calendar days after a change (a)(2)(i);
  - file a corrected report within 30 calendar days after it becomes aware of an inaccuracy (a)(3)(i).

  FinCEN's BOI FAQ says the same. The corrected due rule is `{t:'event', text:'Within 30 calendar days after a change in the reported information, or after learning that a report was inaccurate'}`.
- `us_x_be15`: the 2025 BE-15 booklet covers US businesses that foreign persons own or control at **50 percent or more**, at the end of fiscal year 2025. Persons that BEA contacts must respond, either with a report or with a Claim for Exemption. If our `applies` condition uses the 10% foreign-ownership test, it is wider than this survey's reporting requirement. (Our applies condition was not checked; the todo list does not show it.)
- `us_x_be11`: the 2025 instructions require a report from "any U.S. person that had a majority-owned foreign affiliate" that is not exempt. The annual BE-11C requirement for minority-owned affiliates was dropped for 2025.
- `us_1095c`: the rule agrees with the official page (March 31 electronic). For 2025, the employee copy deadline moved to March 2, 2026. February 28 fell on a weekend, so the paper filing date was also March 2, 2026.

## Repeals and changes noted
- BOI final rule, effective August 14, 2026: only companies formed under foreign law that are registered to do business in a US State or Tribal jurisdiction must report. US persons' information is not reported. FinCEN also says it will not enforce BOI penalties against US citizens or domestic companies.
- DOL penalty adjustment for 2026 (91 FR 31358, May 27, 2026): the WHD page says 2026 maximums are unchanged from 2025. eCFR 29 CFR 1903.15 still shows the 2025 OSHA amounts.
- Information-return penalty amounts: $340 per return for returns due in 2026 and in 2027. The annual caps rise in 2027 (large businesses $4,191,500).

## Caveats on how general provisions were applied
- Schedules D, E, H and SE and Form 8889 carry no penalty of their own. I used the Form 1040 late-filing and late-payment penalties because these schedules are filed as part of Form 1040.
- Form 1040-NR: the instructions refer to the Form 1040 instructions for interest and penalties.
- Forms 709, 706, 720 and 2290: the instructions name section 6651 but print no percentages, or print none at all. The percentages come from 26 U.S.C. 6651, which covers any return under subchapter A of chapter 61.
- Form 940: the instructions point to Pub. 15 sections 11 and 12 for penalties.
- Form 1042-S: I used the general information-return penalty table, which does not name 1042-S. Treat those figures as indicative.
- OSHA: Part 1904 lists 29 U.S.C. 666 among its authorities. Which category a given recordkeeping violation falls in is decided by OSHA.
- Summary annual report (SAR): ERISA 502(c)(1)(B) penalty, up to $110 a day, applies only when a participant has asked for the information. No SAR-specific penalty was found.
- COBRA: only the ERISA penalty was read. The IRS excise tax under 4980B was not read and is not included.
- Gag clause attestation: the penalty is the IRC 4980D excise tax ($100 per day per individual). The attestation sits in 26 U.S.C. 9824, which is in chapter 100.
- Federal penalty ceilings only; states can set their own: new-hire reporting (up to $25 per failure, or $500 for a conspiracy), UCR, Tier II and RCRA.
