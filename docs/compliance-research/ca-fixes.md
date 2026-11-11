# CA fixes: notes (checked 2026-11-11)

Results: 66 entries. Penalty found for 55, not found for 11. Of the 17 entries that needed confirming, 6 are confirmed (one of them, ca_ar_nu, with a corrected due date) and 11 are still unconfirmed.

## Sites that refused access or failed
- **revenuquebec.ca**: not fetched. It refused automated access earlier, and the session's own permission check blocked a retry as bot-check circumvention.
- **legisquebec.gouv.qc.ca**: 403 "Request blocked" (CloudFront).
- **oqlf.gouv.qc.ca**: 403 Forbidden (Azure gateway).
- **cnesst.gouv.qc.ca**: not retried, because it refused access earlier.
- **laws.yukon.ca**: 403 Cloudflare challenge. yukon.ca was not retried, because it refused access earlier.
- **princeedwardisland.ca** (the regulations PDF): 403 Forbidden.
- **publications.saskatchewan.ca** (Bulletin GENERAL-1): 503 twice, plus a TLS certificate error. The Saskatchewan figures come from the SETS home-page notice instead.
- **statcan.gc.ca/en/survey/business**: 503 ("technical difficulties") twice.
- **www.canada.ca**: curl fails with an HTTP/2 stream error or an empty reply. Its pages were read with the WebFetch tool instead, which is a page summariser, so treat canada.ca quotes as close paraphrase-quotes. justice.gc.ca, gov.bc.ca, ontario.ca, quebec.ca, gnwt.ca, the Gazette and the other sites were read as raw text.
- **justice.gov.nt.ca**: 504 at first. It now redirects to gnwt.ca, which worked.

## Entries not found (no penalty)
- **Revenu Québec, 7 entries**: ca_instal_qc, ca_co17, ca_qst_a, ca_qst_q, ca_qst_m, ca_qc_remit, ca_rl1. Every official route (revenuquebec.ca, LégisQuébec) refused access.
- **ca_tp1 and ca_tp1_se**: confirmed on a Revenu Québec release published on Québec.ca (April 1, 2026), which gives the 2025-year dates as April 30 and June 15, with the balance due April 30. That release only says a late-filing penalty and interest apply, with no figures, so the penalty text carries no amounts.
- **ca_cnesst and ca_x_qc_demes**: CNESST and LégisQuébec refused access, and nothing on Québec.ca states the rule.
- **ca_ar_pe**: the PEI site returned 403.
- **ca_ar_yt**: the Yukon sites refused access.
- **ca_x_qc_oqlf**: the fines were not read. Only the Charter s.152.1 consequence (no public contracts or subsidies) is given, from Québec.ca.
- **ca_x_statcan**: the penalty was found (Statistics Act s.31, up to $500). Who must reply and by when is still unconfirmed.

## Existing rules that looked wrong or need an update
- **ca_ar_nu**: our rule says the due date is "not stated". Nunavut's consolidation of the Business Corporations Act, s.270(2), says: "on or before the last day of the month immediately following its anniversary month". I gave a corrected dueText and due rule, the same as NWT. Caveat: the consolidation on nunavutlegislation.ca says it is current only to 2015-02-01.
- **ca_x_bc_transparency**: the existing note says no fine amounts were found. They are in BCA ss.426(4.1) and 428(2.1) (current to Nov 3, 2026): up to $100,000 for a company and $50,000 for an individual. The note can drop that remark.
- **ca_x_cbca_directors, ca_x_cbca_office and ca_x_cbca_agm**: the CBCA sets no fine amount for these. The general offence in s.251 states no amount. Dissolution under s.212(1)(a)(iii) only bites after one year of default in sending a notice to the Director.
- **ca_x_bc_paytransparency**: the Act deliberately has no penalty. s.12 disapplies Offence Act s.5, so the absence of a penalty is correct and is now stated.
- **ca_ar_sk**: the registry's own example is odd. It says incorporation on July 15, 2022 gives a first annual return due August 31, **2024**. That may be a typo on their page. The month-end rule we use agrees with the example's day and month.
- **ca_rrsp**: confirmed for 2025 (March 2, 2026). Our 60-day rule gives March 1, 2027 for 2026. The CRA had not yet published that date on the page read.
- **FINTRAC (ca_x_fintrac_str, ca_x_fintrac_eft)**: S.C. 2026, c. 4 raised the PCMLTFA penalties. Offences under s.75 and s.77 now carry up to $10M (summary), and s.75 up to $20M on indictment. The AMP maximum is $4M for a person and $20M for an entity per violation (s.73.1(2)). Any older figures elsewhere in our data are out of date.

## Changes and transitions noted
- **Bare trusts**: no filing for 2023, nor for years ending Dec 31, 2024 to before Dec 31, 2026. The first required year is the one ending on or after Dec 31, 2026 (CRA FAQ updated Oct 5, 2026). This matches our dueText.
- **Saskatchewan**: from Oct 1, 2024 there is a $50 per-return late-filing penalty, and the $500 cap on the 10% late-payment penalty was removed.
- **Ontario ESA**: individuals' maximum fine has been $100,000 since Oct 28, 2024. The third notice of contravention within three years is $5,000 according to the ministry guide (updated Sept 16, 2026).
- **WorkSafeBC**: the statutory maximum administrative penalty for 2026 is $816,148.69. It is indexed each January.
- **NPRI**: the 2025–2027 Gazette notice (March 8, 2025) fixes the deadlines: June 1, 2026, then June 1, 2027, then June 1, 2028.

## Scope caveats on general provisions (rule 4)
- **Manitoba RST and HE levy**: the penalty is in TAMTA s.39. Its definition of "tax Act" lists the Retail Sales Tax Act and the HE Levy Act, and the HE bulletin states the 10% penalty and the $200/day penalty directly.
- **EAHOR and EAHVOR**: the duty is Canada Labour Code s.125(1)(c), "report, in accordance with the regulations". The offence is s.148(1). The reporting regulations themselves and the Part IV AMPs were not read.
- **Ontario OHSA items**: the fines come from the ministry's OHSA guide, Part IX, which covers contraventions of "the act or the regulations".
- **ca_x_casl**: the AMP covers ss.6–9. The 10-business-day unsubscribe rule sits in s.11, which s.20 does not name.
