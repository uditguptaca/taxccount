# UAE (AE): notes on the penalty and confirmation fixes, checked 2026-11-11

Results are in `ae.fixes.json` (43 entries, 24 sources).

## Sites that refused access or could not be reached
- **mohre.gov.ae**: the connection was reset on every attempt, several tries over the session (home page, laws page, labour-law PDFs). u.ae's links to MoHRE resolutions and to the labour law PDFs (Federal Decree-Law 33/2021, Cabinet Resolution 21/2020 and 96/2023, Ministerial Resolutions 296/2023, 455/2023 and 668/2023) all returned HTTP 404.
- **uaelegislation.gov.ae**: HTTP 403 (tried twice).
- **uaefiu.gov.ae**: HTTP 403 (tried twice).
- **rakicc.com**: an Incapsula bot check (refused), so I did not try to get past it.
- **ADGM legislation host** (en.adgm.thomsonreuters.com and adgmen.thomsonreuters.com): HTTP 403.
- **moet.gov.ae and adphc.gov.ae**: frequent connection resets, but they worked on retry. moet's legislation list is loaded by a script and has no links I could follow.

## Entries where our existing rule looks wrong
- **ae_difc_scheme (DEWS)**: the DIFC Employment Law, Art. 66(17), does set the day. Contributions are in breach "if Core Benefits in respect of any monthly period are not paid ... by the twenty first (21st) day of the next calendar month". The corrected rule is `{t:"afterPeriodEnd",freq:"monthly",basis:"cal",months:1,day:21}`.
- **ae_x_work_permit_renew**: the current u.ae page (updated 19 Oct 2026) puts "Settle any outstanding fines for late issuance or non-renewal" under *cancelling* a work permit, not renewing one. I gave corrected dueText. It also notes that juvenile permits last one year and national trainee permits 12 months.
- **ae_x_difc_dp_notify**: the DIFC handbook Rev.06 (approved 29 Sep 2026) now says "Within 6 months from the **Incorporation date**". Our text says from the date the licence was issued.
- **ae_x_difc_accounts / _small**: the consolidated Companies Law I read (March 2022) does not match the 2026 handbook. Under Art. 124, accounts are audited and circulated within 6 months and filed within 30 days after that. Art. 124(6) exempts a small private company (turnover up to USD 5m and no more than 20 shareholders) from audit and filing. The handbook instead says 7 months (non-small) and 9 months (all other private companies). A later amendment probably explains this, but I did not read one. Our entries follow the handbook.
- **ae_x_dpmsr**: for individuals, only *cash* transactions of AED 55,000 or more trigger a DPMSR. For companies and entities, cash or wire transfers both count. Our due text only says "each transaction at or above AED 55,000".

## Repealed, changing or transitional rules
- Corporate tax penalties are still set by Cabinet Decision 75/2023 as amended by 10/2024 (MoF copy). Cabinet Decision 129/2025, in force 14 April 2026, changed the VAT, excise and tax-procedures penalties (Cabinet Decision 40/2017). The FTA's own copy of Decision 75 shows no amendment by 129/2025.
- **Top-up tax**: Cabinet Decision 142/2024, Art. 14.3, gives transitional relief. There are no penalties for filing top-up or Pillar Two returns for fiscal years beginning on or before 31 Dec 2026 (and not ending after 30 June 2028) where the group took reasonable measures. I found no penalty amounts specific to top-up tax.
- **GPSSA**: the late-payment surcharge (0.1% a day, capped at the arrears) comes from Federal Decree-Law 57/2023. That law covers only Emiratis who started work on or after 31 Oct 2023. Earlier insured persons stay under Federal Law 7/1999, and the English copy of that law on gpssa.gov.ae is a scanned image I could not read.
- **Abu Dhabi licences**: a waiver of late-renewal fines ran until 15 Aug 2026. Licences expired for 3 or more years can be revoked.
- **Emiratisation, 20 to 49 employees**: the u.ae page (updated 15 Oct 2026) still gives targets only up to the end of 2025. Non-compliance costs AED 96,000 (charged January 2025) and AED 108,000 (charged January 2026). It states no 2026 target.
- **The UBO penalty schedule (Cabinet Resolution 132/2023)** was read in an English copy published by Dubai Humanitarian, a licensing registrar, not on moet.gov.ae. Cabinet Decision 109/2023, Art. 18 (read on moet.gov.ae), confirms that the penalties come from a Cabinet list.

## How the general provisions were applied
- Decision 75/2023, items 7 and 9 (late or incorrect corporate tax return), are used for the SBR election and the TP disclosure, because both are filed inside the corporate tax return (CT Law Art. 55(1) for the disclosure).
- Item 1 (records required by the CT Law) is used for the TP master and local files, which Art. 55(2) of the CT Law requires to be maintained.
- Item 13 ("Declaration") was **not** applied to the family foundation annual confirmation, because no official page says it covers that confirmation.
