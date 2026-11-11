# Compliance research (non-tax duties)

Each `<country>.json` here is what a researcher read on the governments' own pages on the date in its
`checkedOn` field, in the shape `scripts/compliance-import.ts` reads. Each item keeps a short quotation
(`evidence`) from the official page that shows its deadline, and the address of that page. The `.md` beside it
lists what could NOT be confirmed, the sites that refused access, and the rules found suspended or changing.

Nothing here came from memory. An item whose date or trigger could not be read on an official page is either
absent or carries `"verified": false`, and the person using the checker is told to confirm it.

To load a file into the rules: `node --experimental-strip-types scripts/compliance-import.ts docs/compliance-research/ca.json --write`
(writes `src/lib/compliance/countries/ca-more.ts`). After that the owner can change any item in Service Master.

## Changes made to the researchers' files before loading
- ca: departments "labour" and "safety" joined as "Employment and workplace safety" (heads unchanged).
- us: departments safety+labour+benefits joined as "Employment, safety and benefits"; environment+transport+registrations joined as "Environment, transport and food" (heads unchanged).
- in: left out, because the official page refused access and the date was seen only in a search summary: in_x_ka_lwf, in_x_epr_plastic, in_x_udyam_update, in_x_fcra_fc4
- in: in_x_posh_report marked to confirm (the date comes from one district's notice).
- in: the "confirmations" for existing company filings were NOT applied: they quote the Companies Act as passed in 2013, and the amended text could not be read.
- ae: left out ae_x_health_abudhabi and ae_x_health_north (their official pages did not open, so nothing was read). The researcher's ask-conditions (`questionShow`) were put on the questions. Of the "confirmations", only ae_difc_renew was applied to the existing rule; the others were not.

## Second round (11 November 2026): penalties, confirmations and US state duties

`<cc>-fixes.json` files hold corrections to compliances that already existed: a penalty that was missing, a
confirmation of an item that was "to confirm", or a corrected deadline. Each carries the quotation it rests on
and the official page. `us-states-g1..g5.json` hold the state duties outside tax for all 50 states and DC;
`us-shared.json` holds the two questions those items share. Load ALL files of a country together, for example:

    node --experimental-strip-types scripts/compliance-import.ts docs/compliance-research/us.json docs/compliance-research/us-shared.json \
      docs/compliance-research/us-states-g1.json ... docs/compliance-research/us-fed-fixes.json docs/compliance-research/us-st1-fixes.json docs/compliance-research/us-st2-fixes.json --write

Changes made to the researchers' files before loading:
- ca-fixes: ca_ar_nu keeps the deadline read in the Act but stays "to confirm": the copy of the Act read is a consolidation current only to 1 February 2015.
- ae-fixes: ae_x_difc_accounts and ae_x_difc_accounts_small marked "to confirm" again: the DIFC Companies Law (March 2022 text) and the 2026 DIFC handbook give different periods.
- ae-fixes: ae_x_difc_dp_notify wording changed to "from the incorporation date", as the 2026 DIFC handbook now reads (the researcher flagged it; the correction was entered from its quotation).
- ae-fixes: ae_x_dpmsr note rewritten to say how the AED 55,000 trigger differs for individuals and companies (from the 2026 guidance quoted by the researcher).
- ae-fixes: the penalties for the beneficial-owner register (ae_ubo, ae_ubo_change) were read in an English copy of Cabinet Resolution 132 of 2023 published by Dubai Humanitarian, a Dubai government licensing authority, because the Ministry's own copy could not be opened.
- us-states-g3: us_x_ms_breach marked "to confirm" (read in a reprint inside a bill that died, not in the statute).
- us-st2-fixes: the address of Utah's renewal document was given as http://; it is stored as https:// (the same file on commerce.utah.gov, which answers on https).
- A few state programmes publish on their own sites that do not end in .gov (the state new-hire directories such as la-newhire.com, CalSavers, Connecticut Paid Leave, Job Service North Dakota, Louisiana Works, Florida Department of Revenue). They are the state's own designated sites and were accepted as official.
- ae-fixes: ae_difc_scheme: the researcher gave the corrected deadline (the 21st of the next month) with its quotation in the note; the quotation and its page were moved into the confirmation fields so the correction loads.

## Deadlines counted from a date the person already gave (2026-11-11)

Two one-time duties were given `"from"` on their `due` rule, so the deadline is worked out instead of shown as words.
No fact was added: the period is the one already quoted from the official page, and `from` names the date question
whose wording matches what the rule counts from.

- `ca_x_on_initial` (ca.json): "Within 60 days after the date of incorporation" is counted from `ca_inc_date`
  ("On what date was it incorporated?").
- `ae_x_difc_ubo` (ae.json): "within thirty (30) days of incorporation or registration" is counted from `ae_lic_date`
  ("On what date was its licence or registration first issued?").

Not linked, on purpose: `ae_ct_register` (counts from incorporation, establishment or recognition, which is not always
the licence date) and `us_x_ar_unclaimed` (the page gives November 1 and "received by the last business day of
October" together, so no single date is put on it).

## Gap research, 2026-11-11 (`<cc>-gaps.json`, ids `<cc>_x_g_...`)

A coverage map showed which angles were empty or thin (personal documents and residency almost everywhere, US import
and export, India workplace safety and anti-money-laundering, UAE intellectual property and environment). One
researcher per country read those on the governments' own pages. Changes made by hand to their files:

- `us_x_g_medicare_iep` (us-gaps.json): the short rule read "Within the 7 months from 3 months before the month you
  turn 65 ...". The app reads a period from the opening words and would have taken "7 months after" a day the person
  enters, which is not what the rule says. Reworded to "From 3 months before the month you turn 65 until 3 months
  after it (7 months in all)"; the official wording in `dueText` is unchanged.
- India and UAE gap files were loaded as the researchers wrote them. Three India questions (`in_x_plastic_pkg`,
  `in_x_udyam`, `in_x_fcra`) were left out by the importer because no compliance depends on them.
- Items the researchers could not confirm are in the files with `"verified": false` and show to the user with
  "please confirm": Canada 3 (Québec vehicle registration and unclaimed property, British Columbia Autoplan), India 7
  (OCI re-issue, vehicle registration renewal at 15 years, a child's Aadhaar update, factory licence, accident
  notice and two more), UAE 2 (Ejari and Tawtheeq: no official page gives a time limit).

