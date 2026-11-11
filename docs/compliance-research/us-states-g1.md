# US states group 1: research notes (checked 2026-11-11)

States: AL, AK, AZ, AR, CA, CO, CT, DE, DC, FL. Results are in `us-states-g1.json`: 43 items and 53 sources. The working files are in `g1work/`. There is one build script per state (`st_*.py`), a helper (`b.py`), a merge script (`merge.py`), and the PDFs and text extracted from them.

Florida's quarterly wage report is already in us-states.ts as `us_fl_rt`, so it is not repeated here. The other nine states had only an employer registration in us-states.ts, so each of them gets an unemployment wage report item.

## Gaps by state (duties 1-4)

- **AL**: Nothing missing. The breach Act was read on a state agency's copy of the code (acua.alabama.gov), because the legislature's ALISON site runs only with scripts. The Treasury's unclaimed-property instructions are dated 10-25-16 and were uploaded in 2024. unclaimed.alabama.gov runs only with scripts.
- **AK**: **Data breach was not read.** Every akleg.gov page (statutes and session laws) returned HTTP 403, so the item is left out. The unclaimed-property overview gives no penalty and no notice window in days. unclaimedproperty.alaska.gov runs only with scripts. The new-hire item comes from the CSSD employer guide PDF (Rev 09/25); the CSSD web page returned 404.
- **AZ**: **The UI wage report due date was not read.** All of des.az.gov returned HTTP 403, and so did the administrative code on apps.azsos.gov. The item is included with verified:false; only its penalty was read, on A.R.S. 23-723. New-hire reporting was read on the statute (A.R.S. 23-722.01), which says the department cannot penalise employers. No unclaimed-property penalty section was found: A.R.S. 44-317, 44-327 and 44-328 do not have one.
- **AR**: Nothing missing. The UI due dates and penalties come from the DWS Employer Handbook, dated August 2022. For individual breach notice, the Attorney General's page says only "in a timely manner". The 45-day Attorney General deadline was read in Act 1030 of 2019. Neither page states a breach penalty. No unclaimed-property penalty is stated; the Auditor points holders to its Voluntary Compliance Program.
- **CA**: **Unclaimed property was not read**, because sco.ca.gov, leginfo.legislature.ca.gov and ftb.ca.gov all returned 403. The item is included with verified:false, and its dates are marked as unconfirmed. **The breach day count was not read.** The Attorney General's pages state the duty and the over-500 sample-notice rule but give no number of days. SB 446, said to set 30 days from 2026-01-01, could not be opened on leginfo (403), so the item is verified:false. The UI item uses the EDD's delinquency date, the last day of the month after the quarter. The EDD also lists a nominal due date on the 1st of that month.
- **CO**: **The UI wage report was not read.** Every cdle.colorado.gov and famli.colorado.gov page returned 403. **Unclaimed property was not read either**: treasury.colorado.gov returned 403, the holder pages run only with scripts, and the old colorado.gov FAQ redirects to a vendor site that I did not follow. Both items are included with verified:false. The breach rule was read in the 2018 session law (HB 18-1128), and later amendments were not checked. New-hire reporting also covers independent contractors paid $600 or more.
- **CT**: Nothing missing, but **unclaimed property rests on older Treasurer documents**: a brochure from an earlier Treasurer, and instructions for 2019 that say "no later than March 30, 2020". The statute on cga.ct.gov returned 503 twice, and the Holder Alerts page has been removed. The March 31 date should be confirmed, and the 15%-a-year interest under CGS 3-65b was not read. For new hires, the DOL 2026 guide says 14 days for electronic reports and 20 days for fax or mail; business.ct.gov says 20 days, with 14 for FTP.
- **DE**: Nothing missing. The newhire.dhss.delaware.gov host did not resolve from this session, so it has to be allowed in the session's network settings before it can be read. The DCSS page itself was read. The UI late fee is $17.50 on the DOL FAQ, while the older handbook says $17.25. Unclaimed-property dates and penalties were read on the Delaware Code. Banks report November 10 and insurers December 20.
- **DC**: Nothing missing. The breach law sets no number of days ("most expedient time possible and without unreasonable delay"), so that wording is recorded. The Attorney General must be told when 50 or more residents are affected.
- **FL**: Nothing missing; the UI item was skipped because it already exists. The current statute sets the unclaimed-property owner notice at 90 to 180 days before filing, while older Division manuals said 60 to 120.

## Unusual points

- Unclaimed property is not always due on November 1. **CT** is March 31 and **DE** is March 1, both covering the prior calendar year. **FL** is "before May 1". **AK, AZ and DC** say "before November 1", which is recorded as October 31. **AR** requires receipt by the last business day of October, which is recorded as an event. Life insurers have their own dates in AZ, AR, DC and CA, and DE banks and insurers do as well.
- **AZ**: by statute, no penalty can be charged to employers for new-hire reporting.
- **FL and CO**: independent contractors must be reported as new hires.
- **CA new hire**: the penalties are $24 and $490 (EDD page).

## Duties 5-6 added

- `us_x_ct_pfml`: CT Paid Leave contributions. The date recorded is the end of the month after the quarter, which is the last day without penalty.
- `us_x_de_pfml`: Delaware Paid Leave, due 30 days after the quarter. It applies only to employers with 10 or more eligible employees, and no shared question asks this, so the note says to treat it as "confirm".
- `us_x_dc_pfml`: DC Paid Family Leave contributions. They come from a 2018 rule whose rate is out of date, so no rate is given.
- `us_x_ca_paydata`: uses the existing shared question `us_x_emp100`. The date is set each year (May 13, 2026).
- `us_x_ca_retire`: CalSavers. It uses the existing question `us_x_retirement_plan` answered "no".

Not done: CO FAMLI (site returned 403), the Colorado SecureSavings and MyCTSavings retirement programmes, and the duty-6 licence renewals. In the extra items, "extra" conditions use only questions that already exist in us-more.ts. No new questions were defined.
