# United States: gap research notes (checked 2026-11-11)

Output: us-gaps.json. It has 33 items, all marked verified: personal 21, import/export 7, anti-money-laundering 4 (in the existing `finance` department) and intellectual property 1 (in `ip`). It also has 16 new questions, 36 sources and 2 new departments (`personal` and `trade`). New business questions use the existing `ops` step and personal questions use the `about` step. Reused question ids: `us_x_msb`, `us_x_trademark`.

## Pages that refused access or could not be read
- **travel.state.gov**: every page returned HTTP 403, including the renewal page, the minors page and the passport FAQ. I did not work around it. I read the passport validity in 22 CFR 51.4 on govinfo.gov (2024 CFR edition) and read the 6-month and 15-year renewal points on usa.gov.
- **ecfr.gov**: redirects to a bot check (unblock.federalregister.gov), so I did not use it. This affects 19 CFR 163.4 (CBP record keeping, read instead in CBP's 2005 guide), 31 CFR 1010.306 and 1010.311 (CTR deadline and who files) and 15 CFR 30 (EEI penalties).
- I extracted these PDFs locally because WebFetch could not read them: the CBP ISF FAQ (May 2023), the Census FTR Quick Guide (Apr 2026), the CBP recordkeeping guide (Jan 2005), the FinCEN SAR filing instructions (Apr 2026) and the FinCEN MSB guide (undated, old).
- These URLs returned 404: the uscis.gov I-751 page (I used "When to File Your Petition to Remove Conditions" instead), the CA DMV change-of-address page, the TX DMV change-of-address page, the NY DMV address page (the `records/` URL worked), the FDA prior-notice page under `/food/` (the guidance page worked) and FinCEN's MSB CTR page.

## Not confirmed / partly confirmed (kept, with a note on the item)
- **Green card (I-90)**: the page states the 6-month window but not that the card lasts 10 years, and it gives no penalty for an expired card.
- **New York licence term**: the renewal page does not state it. It mentions an "8-year licence" only in a fee note. I worded the due date as "by the expiration date".
- **New York vehicle registration period** (1 or 2 years) is not stated on the page.
- **Casino CTR deadline**: the casino FAQ (2012) says "15 gaming days to file a complete report". The general CTR FAQ says all CTRs are due within 15 calendar days, and I used that.
- **MSB CTR**: the threshold comes from an old FinCEN guide that cites 31 CFR 103.22 and IRS Form 4789. The 15-day deadline comes from the CTR FAQ.
- **CBP record keeping**: the 5-year rule comes from CBP's 2005 guide. The current regulation text was not opened.
- **Penalties not stated on the official page**: AR-11, I-90, EAD, customs entry and entry summary, EEI, MSB and casino SAR/CTR, the CA, NY, TX and FL address changes, the FL licence, and the Selective Service address update. For these, `penalty` is null.
- **Selective Service**: who must register and the 30-day rule were read on two pages ("Who Needs to Register", "Men 26 and Older"). Exempt groups of non-citizens are not modelled.

## Left out, and why
- **REAL ID**: enforcement started on 7 May 2025, and tsa.gov shows no upcoming dated requirement (only the $45 TSA ConfirmID fee for travellers without acceptable ID). It is not a renewal deadline.
- **Continuous customs bond renewal**: I found no official page that gives a renewal deadline.
- **Dealers in precious metals**: they must have an AML programme, but the FinCEN SAR instructions do not list them as SAR filers and I found no dated duty. Form 8300 already exists as `us_x_8300`.
- **Patents and Section 8/9 trademarks**: already in the files (`us_x_patent`, `us_x_tm_sec8`, `us_x_tm_renew`). I added only the Section 71 (Madrid) declaration. The existing Section 8/9 items probably should not apply to a Madrid extension, which is a question for whoever merges this.
- **Investor conditional green card (I-829)**: same 90-day window as I-751, but not modelled.
- **Texas vehicle address change** and **Florida vehicle address change**: no official page was read (the TX page was 404; the FL rule was seen only in a search snippet of a procedure PDF).
- **Proposed CBP outbound export manifest rule (2026)**: still only a proposal.

## Rules changing
- **FDA prior notice**: international mail notices must include the mail service name and tracking number from 1 October 2026, enforced from 1 May 2027 (FDA page current as of 2026-10-05).
- **Texas**: since 1 January 2025, non-commercial vehicles do not need a safety inspection before registration. Emissions inspections are still required in 18 counties.

## 5 biggest gaps still open
1. **Driver's licences and vehicle registrations in the other 46 states and DC**: only CA, TX, NY and FL are covered.
2. **US passport**: travel.state.gov blocks automated access, so any State Department rules beyond validity and renewal eligibility were not read on the State Department's own site.
3. **Penalty amounts for EEI/AES filing errors and for late customs entry or entry summary**: these need 15 CFR 30.71 and 19 CFR, which eCFR blocks.
4. **Other non-citizen statuses with dated duties**: I-829 for investors, re-entry permits, F/J/M student reporting through SEVIS, and DACA renewal windows.
5. **AML duties beyond MSBs and casinos**: SAR and CTR for insurance companies, broker-dealers and residential mortgage lenders, and a current, codified reading of the casino CTR deadline (31 CFR 1021 / 1010.306).
