# United Arab Emirates: non-tax obligations, research notes (read 2026-11-11)

Result file: `ae.json` in this folder. 39 new items (33 verified, 6 not), 12 new questions, 35 sources,
3 new departments (`labour`, `residency`, `privacy`); AML, company-law, free-zone and customs items sit in the
existing `corporate` department and pension/final-pay items in the existing `payroll` department.

Two things in the JSON go beyond the brief's shape, both additive:
- `questionShow`: for each new question id, the condition under which it should be asked (the brief's question
  shape has only `askKinds`).
- `confirmations`: 7 entries for EXISTING items (asked for in the task).

Extracted text of the official PDFs that were read is in `pdf_ae/` (pdftotext output); the script that wrote
the JSON is `build_ae/build.py`.

## Sites that refused or could not be read (not worked around)
| Site | What happened | Effect |
|---|---|---|
| mohre.gov.ae (all URLs tried, with and without www) | HTTP 503 every time | No MoHRE page was read. Emiratisation half-year dates, the midday-break fine, the ILOE four-month limit, work-permit renewal windows and fines, and the Emirati minimum-wage contract deadline are NOT confirmed. u.ae was used instead where it covers the rule. |
| uaelegislation.gov.ae | HTTP 403 | Federal laws were read only where a ministry or u.ae hosts a copy (labour law on assets.u.ae, companies law and AML penalties on moet.gov.ae). The Personal Data Protection Law text and Cabinet Resolution 132 of 2023 (UBO fines) were not read. |
| uaefiu.gov.ae | HTTP 403 | goAML report guides not read: no filing time limit for DPMSR / REAR. |
| doh.gov.ae | HTTP 503 | Abu Dhabi health insurance duty and its monthly fine not read. |
| pension.gov.ae (Abu Dhabi Pension Fund) | HTTP 503 | Abu Dhabi pension deadlines not read. |
| ded.ae, dubaided.gov.ae | HTTP 503; dubaidet.gov.ae/en/faqs HTTP 403 | Dubai mainland licence renewal term and late fine not read. |
| tamm.abudhabi | fetch error "Header overflow" | Abu Dhabi licence renewal, customs registration renewal, health insurance penalty pages not read. |
| dubaitrade.ae | "The requested URL was rejected" | Business code renewal help page not read (Dubai Customs' own PDFs were). |
| rakicc.com FAQ pages | page body empty (script-rendered) | RAK ICC renewal rules still unread. |
| u.ae "Getting a health insurance" | HTTP 404 on four attempts (page is in search results) | Federal (northern emirates) employer health insurance rule not read. |

## Rules found suspended, repealed or changing
- **Economic Substance Regulations: no longer a live filing.** Ministry of Finance news, 14 October 2024:
  "cancellation of economic substance reporting requirements for companies for financial years ending after
  31 December 2022"; companies are "no longer required to submit economic substance notifications or reports".
  Obligations for earlier years remain. The MoET page on ESR (updated 10 Nov 2026) still describes annual
  submissions and is out of date on this point. No ESR item was added.
- **Federal Personal Data Protection Law (Federal Decree-Law 45 of 2021).** u.ae says it "came into force on
  2 January 2022" (page updated 04 Dec 2025) and says nothing about executive regulations, registration or breach
  deadlines. The law text could not be opened (403). Unofficial sources say the executive regulations are still
  not issued. No dated duty could be read on an official page, so nothing was added. Only the DIFC and ADGM
  data protection regimes are in the JSON.
- **AML framework changed.** MoET's March 2026 guidelines are written under Federal Decree-Law No. 10 of 2025
  and Cabinet Resolution No. 134 of 2025 (replacing the 2018 law and 2019 regulation the existing `ae_goaml`
  source page still cites). The penalty table read (Cabinet Resolution 71 of 2024) still refers to the old
  article numbers; fine amounts are as printed there.
- **Emiratisation.** u.ae states targets "by 2026" for 50+ employers and only up to end-2025 for 20 to 49
  employers. What applies from 2027 (and for 20 to 49 employers in 2026) was not found.
- **Sanctions report names.** The Executive Office's page now uses CNMR (Confirmed Name Match Report) and PNMR;
  its 2021 guidance PDF (last amended 14 Nov 2021) called the first one FFR. Deadlines are the same in both.
- **ADGM data protection late penalty: two official pages disagree** (USD 450 on the fees page, USD 750 on the
  annual filings page). Both figures are given in the item.
- **DMCC accounts deadline** is "within six months" in the 29 April 2025 guideline; older DMCC sheets said 90 days.

## Items marked unverified, and why
- `ae_x_emiratisation_20_49`: targets read on u.ae run only to end-2025; current-year rule not found.
- `ae_x_work_permit_renew`: u.ae gives the two-year validity and mentions fines for non-renewal, but not the
  renewal window or amounts.
- `ae_x_health_abudhabi`, `ae_x_health_north`: no official page could be opened (see table). Nothing in them
  was read on a page; no penalty is stated.
- `ae_x_dpmsr`, `ae_x_rear`: trigger and filer read in MoET's March 2026 supplemental guidance and in Circulars
  08/AML/2021 and 05/2022; the guidance refers to "predefined parameters and timelines" that are in the FIU's
  guides (403).

Items verified but with no calendar date on the official page (shown as "event"): compliance officer and
sanctions-notification registration (no date stated), JAFZA audit report ("annually", no date), DIFC data
protection renewal ("annually", date set in the portal), establishment card (30 days from expiry; validity
period not stated), Dubai Customs business code (follows the licence; 60-day grace from a 2009 policy).

## Existing unverified items: what could and could not be confirmed
- `ae_difc_renew`: CONFIRMED (DIFC handbook Rev.06, 29 Sep 2026): on the licence expiry date and no later than
  30 days after.
- `ae_licence_fz`: partly: JAFZA only (renew within three months before expiry; AED 1,000 fine for delay).
- `ae_licence` (mainland): NOT confirmed (Dubai and Abu Dhabi licensing sites refused or errored).
- `ae_offshore_renew_rak`: NOT confirmed (page body empty).
- `ae_customs_other`: NOT confirmed (TAMM unreadable).
- `ae_gcc_pension`: not attempted beyond GPSSA; home-country rules not read.
- `ae_ct_return_offshore`: tax item, outside this brief.
- Gaps filled in items that are already verified: `ae_difc_scheme` (21st of the next month), `ae_gratuity`
  (14 days), `ae_adgm_conf` (accounts within 9 months), `ae_gpssa` (0.1% a day late charge). `ae_iloe`: the
  joining time limit is still unread.

## Looked at and left out on purpose
- Worker file retention (two years after end of service, Article 13 of Federal Decree-Law 33 of 2021),
  accounting registers (five years, Article 26 of the Commercial Companies Law), AML records (five years),
  hazard-exposure records for 50+ worker establishments (five years): record-keeping with no filing date.
- Emirati minimum wage of AED 6,000 from 1 January 2026 (u.ae): a pay rule, not a filing.
- Statistical surveys, anti-spam, unclaimed property, commercial agency and trademark renewals: no official
  page with a dated duty for ordinary businesses was found in the time available.

## Five most important gaps still open
1. **MoHRE rules read on MoHRE's own site**: Emiratisation half-year deadlines and the current per-head
   contribution, the 2026+ rule for 20 to 49 employers, midday-break fines, work-permit renewal windows and
   fines, and the ILOE joining time limit. The site returned 503 throughout.
2. **Mainland trade licence renewal** (Dubai DET, Abu Dhabi ADDED, other emirates): licence term, grace period
   and late fine are still unread, so `ae_licence` stays unverified.
3. **Health insurance outside Dubai**: Abu Dhabi (DoH) and the federal scheme for the northern emirates could
   not be read at all; fines unknown.
4. **goAML report time limits** (DPMSR, REAR, and the FIU's current report list) and the **UBO penalty table**
   (Cabinet Resolution 132 of 2023): official files exist but refused access.
5. **Federal Personal Data Protection Law**: whether executive regulations exist and start any dated duty
   (registration, breach notice, DPO) could not be read on an official page. Also unread: RAK ICC renewal and
   record rules, Abu Dhabi Pension Fund deadlines, and customs registration renewal outside Dubai.
