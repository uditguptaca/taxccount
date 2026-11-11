# Canada gaps research: notes (checked 2026-11-11)

Output: ca-gaps.json, 32 items (29 verified, 3 not verified). New department: `personal`. The other items use the existing `trade`, `reporting`, `registry` and `labour` departments. Existing questions reused: `ca_x_trade`, `ca_x_unclaimed`.

## Counts per gap
- Personal documents and status: 19 items (17 verified). Passport, PR card, PR address within 180 days, ON (licence, plate, health card, 6-day and 30-day address changes), BC (licence, BC Services Card/MSP, MSP 10-day address change, vehicle insurance/licence), QC (licence annual fees; registration NOT verified), AB (licence, registration, 14-day address change), firearms licence (PAL), NEXUS.
- Import and export: 7 items (7 verified). These are the 5-business-day accounting after release, the CARM monthly payment, the 90-day correction duty, keeping import records for 6 years, export declaration timeframes, the monthly SRP summary and keeping export records for 6 years.
- Unclaimed property: 3 items (2 verified). BC has two: notify within 6 months, and keep a public database. QC has one remittance item, NOT verified. Alberta was already in ca-more.ts and was skipped.
- Intellectual property: 2 items (2 verified), patent maintenance fees and the industrial design maintenance fee.
- Government contracts: 1 item (1 verified), the Federal Contractors Program agreement (AIEE) signed before bidding.

## Not confirmed, and why
- **SAAQ vehicle registration (QC):** the page returned a Radware bot-check redirect. It was not worked around, and the item is `verified: false`. The SAAQ licence page was readable with a plain request and is verified.
- **Revenu Québec unclaimed property:** HTTP 403 on every page tried. LégisQuébec also returned 403. The item is `verified: false`, and its deadline wording comes from a search summary only.
- **BC vehicle (Autoplan) renewal:** `verified: false`. It was read only on a 2024 ICBC news release (44-day renewal window, $598 fine). The policy term is not stated on any page read. ICBC's rule pages render by script and gave no text.
- **BC driver's licence address change (10 days):** ICBC's page content did not load, so it was left out. Only the MSP 10-day rule under the Medicare Protection Act is included.
- **CRA change of address:** the page says only "as soon as possible", with no stated deadline. It was left out as advice, not a dated duty.
- **IRCC change of address for PR card holders in general:** no stated deadline was found, apart from the 180-day first-card address, which is included.
- **Penalties that the pages do not state:** consequences of an expired Alberta licence or registration (the operator manual needs sign-in), consequences of an expired BC licence, the Ontario plate fine, and the Ontario address-change penalty. These fields are left null.
- **Validity periods not stated:** the BC Services Card (the page says only "renew by the date on the card") and the Québec licence card's photo cycle.

## Rules found changing or in transition
- Québec unclaimed financial assets: a new remittance deadline since 2025-06-04, with a transition for fiscal years ending June to December 2025 (not read on the official page).
- Ontario plates: automatic renewal for 1 year at no fee, only for some vehicle types and only when the vehicle is insured and has no unpaid fines or tolls.
- CBSA memoranda D17-5-1 and D17-1-8 carry a notice that they are under review after CARM, and CARM is now the system of record.

## Five biggest gaps still open
1. Québec vehicle registration renewal and the Revenu Québec unclaimed-property remittance. Both official sites blocked automated reading, so both items need a manual read.
2. A BC driver's licence and vehicle address-change deadline, and the BC licence lapse consequences, from ICBC's rule pages, which load by script.
3. Health card renewal and address rules for Québec (RAMQ) and Alberta (AHCIP), plus licence, plate and health-card renewals for the other 9 provinces and territories (only ON, BC, QC and AB were covered).
4. Alberta: the consequences of an expired licence or registration and the re-test thresholds, which are only in a sign-in operator manual.
5. CBSA penalty amounts (the AMPS master penalty table) for late accounting, late export reporting and record-keeping failures. The items cite penalties without amounts.
