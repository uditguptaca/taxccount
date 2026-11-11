# Canada: non-tax compliance research notes (read 2026-11-11)

Result file: `ca.json` in this folder. 52 compliances (50 verified, 2 not), 15 new questions, 55 sources,
6 new departments plus the existing `registry` department reused.

Every deadline and "who it applies to" marked `verified: true` was read today on the page named in `source`
(or in the item's `note` when a second page supplied part of the rule). Pages were read through a fetch tool
that returns short quotations, so each `evidence` is a quotation or two joined by "...". Three PDFs
(Ontario's Corporations Information Act notice, WCB Alberta's fact sheet, BC's "Maintaining Your B.C.
Company") were read as extracted text.

## How the new pieces fit the existing ca.ts

- Existing question ids reused: `ca_employees`, `ca_federal`, `ca_npo_corp`, `ca_inc_date`, `ca_bizname`
  (and `fye` implicitly, through `afterYearEnd` with basis `fy`).
- The CA pack has no `llc` or `branch` kind, so conditions use `sole_prop`, `partnership`, `corporation`,
  `trust`, `nonprofit` (and `individual` for the Record of Employment, since a person can employ a caregiver).
- `registry` in `departments` is the EXISTING department; it is listed only so every `dept` resolves. Its
  name and description in ca.ts should be kept or widened ("Corporate registry and records"), not replaced
  by the text in ca.json.
- The output shape has no `show` field for questions. Suggested conditions:
  - `ca_x_fedreg`: business kinds, `ca_employees` yes.
  - `ca_x_emp_band`: `ca_employees` yes and (state ON, QC or BC, or `ca_x_fedreg` yes). No Alberta item uses it.
  - `ca_x_private`: kind corporation and (`ca_federal` yes, or state ON or BC).
  - `ca_x_solicit`: nonprofit, `ca_npo_corp` yes, `ca_federal` yes.
  - `ca_x_msb`: `ca_x_fintrac` yes.
  - `ca_x_unclaimed`: state AB only.
  - `ca_x_fed_pension`: `ca_employees` yes (could be limited to `ca_x_fedreg` yes).
  - the rest: all business kinds.
- `ca_x_emp_band` is one question serving several laws that count differently (Ontario: employees in Ontario
  on January 1; B.C.: employees working in B.C. on January 1; federal: average). The help text says so.
  Ontario's accessibility page does not say how to count.
- The Ontario accessibility report is every three years. `DueRule` has no three-year cycle without a date
  question, so the item carries `{"t":"on","dates":["2026-12-31"]}` (the date on the page) and
  `frequency: "event"`. It needs a new date after 31 December 2026.
- Three items carry "before March 1" as `fixed [[3,1]]` (Ontario written policies): the policy must exist
  before that day.

## Not confirmed (verified: false)

1. `ca_x_statcan` (mandatory Statistics Canada surveys). The FAQ page says "participation in most business
   and agricultural surveys is mandatory" but gives no reply deadline and no penalty.
   `statcan.gc.ca/en/survey/business` and `/mandatory` returned HTTP 503.
2. `ca_x_qc_demes` (Québec pay equity declaration). cnesst.gouv.qc.ca returned HTTP 403 on every page tried.
   The threshold (11 employees declared to the enterprise register, or already subject to the Act), the
   deadline (6 months after the financial year end) and the fines ($1,000 to $45,000) were seen only in a
   search engine's summary of CNESST pages.

## Verified items with a part that was NOT read (said in each item's note)

- Penalty not stated on the page read, so `penalty` is null: change of directors and address (CBCA), annual
  meeting, employment equity report, federal EAHOR/EAHVOR, CASL (amounts), suspicious transaction report,
  EFT report, Investment Canada notification, trademark renewal, supply-chain report (the fine), NPRI,
  Ontario poster, written policies, serious-incident notice, committee and training items, Ontario
  ownership register, Québec current declaration, OQLF registration, B.C. transparency register and pay
  transparency report, WCB Alberta injury report, Alberta PIPA.
- PIPEDA breach: the page gives "as soon as feasible" for telling the individuals; it gives no separate
  number of days for the report to the Commissioner, and no fine amount.
- Record of Employment: the page gives no penalty for a late ROE, only for a knowingly false reason.
- FINTRAC large-cash, suspicious-transaction and EFT guidance pages are 175,000 to 280,000 characters long;
  only the first 100,000 characters of each were read. The deadlines quoted are in the part read. For EFT
  the day the 5 business days count from was not captured.
- Federal Work Place Committee Report: due March 1 with the other two reports, but which employers must
  file it was not on the pages read, so it is mentioned in a note only.
- Ontario initial return for corporations from outside Ontario (60 days after starting business there):
  seen only in a search summary of a separate notice; not included as an item.
- Québec ultimate beneficiaries: the page read confirms they are declared in the registration, annual and
  current declarations since 31 March 2023; that a change must be declared within 30 days was seen only in
  a search summary, so it sits in the note of `ca_x_qc_current`.

## Pages that refused or failed

| Site | Result | Effect |
|---|---|---|
| crtc.gc.ca (CASL FAQ, enforcement page) | HTTP 403 | CASL rule read on ISED's page instead (dated 2019); penalty amounts left out |
| payequitychrc.ca | HTTP 403 | Read the same content on chrc-ccdp.gc.ca |
| cnesst.gouv.qc.ca (pay equity, FR and EN) | HTTP 403 | Québec pay equity unverified; CNESST injury reporting and prevention duties not researched |
| fsrao.ca (pension filing deadlines) | HTTP 403 | Ontario pension plan annual information return left out |
| statcan.gc.ca/en/survey/business (and /mandatory) | HTTP 503 | Survey deadline and penalty unconfirmed |
| revenuquebec.ca | not tried (ca.ts records that it refuses every request) | Québec unclaimed property and the 1% training law left out |

Several guessed URLs returned 404 and were replaced by the correct official page found by search; those are
not refusals. No refusal was worked around.

## Rules found changing, in transition or old

- **Federal Plastics Registry: LEFT OUT.** The page (2026-10-27) says the reporting system is offline from
  31 October 2026 for modernisation, a notice amending the 2024 to 2026 reporting notice was published
  14 March 2026, and a notice of intent covers 2027 to 2029. The 29 September deadline was not on the page.
- **B.C. transparency register.** The statute (current to 3 November 2026) still says keep it at the
  records office, confirm yearly within 2 months of the recognition anniversary, record changes within 30
  days. A 2023 bill proposed filing it with the registrar and a shorter update period; whether that is in
  force was not confirmed. The province's own page is dated September 2022.
- **B.C. pay transparency.** The 50-employee threshold applied for the first time on 1 November 2026.
- **Ontario accessibility report.** Next deadline 31 December 2026, then every three years.
- **Federal pay equity.** First annual statements were due 30 June 2025 for employers covered since
  31 August 2021.
- **Accessible Canada Regulations.** The summary page is from June 2023; first plans were due 1 June 2023
  (100 or more employees) and 1 June 2024 (10 to 99). The yearly cycle since then is taken from that page.
- **CARM.** The border agency's pages were updated August to October 2026. Only the registration duty is
  included.
- Old pages relied on: NFP Act reporting obligations (2022-07-21), employment equity (2022-08-25), Ontario
  beneficial ownership (2022-12-23), CBCA shareholders page (2023-05-10), Investment Canada FAQ
  (2023-09-28), CIPO renewals notice (2020-10-27), CASL consent page (2019-04-01), WCB Alberta fact sheet
  (2023-01-17).

## Looked at and left out on purpose

- Customs payment due dates, the accounting declaration deadline and financial security (not on the pages
  read).
- Ontario health and safety representative (6 to 19 workers) and Alberta health and safety committee (20
  or more workers, representative for 5 to 19): the pages give the threshold but no dated action.
- B.C. unclaimed property: no general yearly reporting duty for ordinary businesses was found.
- FINTRAC terrorist property report, large virtual currency report and the sector-specific record rules.
- Trademark expungement, the supply-chain fine, CASL fine amounts: not on the pages read.
- Municipal business licences, professional licences and sector permits: not sector-neutral.

## The 5 biggest gaps still open

1. **Québec employment and safety.** CNESST and Revenu Québec refuse automated access, so pay equity
   (DEMES and the 4-year / 5-year exercises), injury reporting, prevention programmes, the 1% training law
   and unclaimed property are unverified or missing.
2. **Customs after registration.** When duties and taxes are due, the accounting declaration deadline and
   the financial-security rules under CARM were not read; only the RM account duty is in.
3. **Penalties.** About half the verified items have no penalty, because the page with the deadline does
   not state it (CASL, supply-chain report, PIPEDA amount, late ROE, Ontario OHSA and ESA fines, FINTRAC
   amounts).
4. **Pension plans and the other provinces.** Only federally registered plans (OSFI) are covered; Ontario's
   FSRA refused access and Québec, B.C. and Alberta plan filings were not researched. Manitoba,
   Saskatchewan, the Atlantic provinces and the territories have no non-tax items at all (injury reporting,
   safety committees, registry change notices, privacy).
5. **Rules in motion.** The B.C. transparency register filing duty, the Federal Plastics Registry and the
   deadline and penalty for Statistics Canada surveys need a human to confirm before they are relied on.
