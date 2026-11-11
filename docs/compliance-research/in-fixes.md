# India: fixes research notes (checked 2026-11-11)

Results: `in.fixes.json` (51 entries, 53 sources).

## Counts
- Penalty needed: 41. Found: 34. Not found: 7 (in_form67, in_form10f, in_15ca, in_pt, in_dir3, in_dpt3, in_x_labour_return).
- Confirmation needed: 23. Confirmed: 17. Corrected: 1 (in_dir3). Still unconfirmed: 5 (in_pf, in_pt, in_dpt3, in_x_posh_report, in_x_labour_return).

## Sites that refused access or failed
- wm.incometaxindia.gov.in and www.incometaxindia.gov.in: 403 (nginx / Akamai "Access Denied"), tried twice. Many existing in.ts sources (s263, adv, r17b, r128, r21ab, r30, r31, r31a, r37bb...) are on this host and could not be re-read today.
- mca.gov.in: 403 Access Denied, tried twice on three paths.
- epfindia.gov.in: redirects to epfo.gov.in, which returns 403.
- esic.gov.in, taxinformation.cbic.gov.in: no response (connection failed).
- egazette.gov.in: TLS certificate chain failure. Not worked around.
- shramsuvidha.gov.in and dmnewdelhi.delhi.gov.in: connection reset (tried twice).
- labour.gov.in and legislative.gov.in: open, but the page is built by script, so there is no readable content.
- indiacode.nic.in has moved to **indiacode.gov.in**, which works. Its public DSpace API (`/server/api/...`) gives the current text of each section in the item metadata. Most statute penalties here were read that way. The `handle/123456789/...` URLs in the sources are the matching item pages.
- India Code does not index the Income-tax Act, 1961 or 2025 sections. Its copy of the 1961 Act is the as-enacted 1961 Gazette. Company rules on India Code stop at about 2022 amendments.

## Existing rules that look WRONG or out of date
1. **DIR-3 KYC (in_dir3)**: G.S.R. 943(E) of 31 December 2025 replaced the yearly KYC from 31 March 2026 with a KYC intimation once in every three years. Per PIB (1 Jan 2026), directors whose KYC is complete next file by 30 June 2028. A corrected dueText and due are given. The recurring date for later cycles and new DINs was not read (mca.gov.in refused).
2. **Form 16 / Form 16A**: the existing rules state no penalty. The ITD's 2025-Act FAQ gives Rs 500 a day under section 272A(2)(g) for FY 2025-26 certificates.
3. **LUT (in_lut)**: rule 96A says only "prior to export". Our `due` text ("before the first export of the financial year") assumes one LUT per year. That assumption was not read on an official page.
4. **Form 10 (in_form10)**: an ITD ITR-7 FAQ from November 2023 describes the Form 10 due date as the section 139(1) return date. The current ITD "Return / Forms applicable" page (and our rule) says at least two months before that date. No change is made; flagged for awareness.
5. **AOC-4 / MGT-7 / MGT-7A / LLP 8 / LLP 11** say only "An additional fee for each day of delay". The Act also has penalties: s.137(3), s.92(5), LLP s.34(5), s.35(2). The figures are in each entry's note. Section 403 sets a floor of Rs 100 a day for the additional fee on AOC-4 and MGT-7.
6. These existing rules carry verified: false only because MCA refused access: AGM, AOC-4, AOC-4 (OPC), MGT-7, MGT-7A, ADT-1, MSME-1, LLP Form 8 and LLP Form 11. All of them can now be marked verified from the Act on India Code (and the MSME Order and LLP Rules, read on India Code).

## Repeals and transitions noticed
- The Income-tax Act, 1961 is shown on India Code as "Rep., Act 30 of 2025". Penalties found on ITD pages are mostly stated under the 1961 Act (for FY 2025-26). The 2025-Act equivalents were read only for the return late fee (s.428) and TDS interest (s.398(3)(a)).
- The four Labour Codes came into effect on 21 November 2025 (PIB, 5 Feb 2026). The EPF Act, 1952 is shown on India Code as repealed by Act 36 of 2020 (the Code on Social Security). The ESI rates used (regulations 31-A and 31-C) are in regulations made under the ESI Act, 1948. Whether those regulations continue under the Code was not checked.
- India Code lists a "Jan Vishwas (Amendment of Provisions) Act, 2026". Whether it changed any Companies Act penalty quoted here was not checked; the section texts on India Code are presumed current.
- The Black Money Act s.43 text still refers to returns under s.139 of the 1961 Act.
- The GSTR-9C late fee is the annual-return late fee (Circular 246/03/2025-GST). Under Notification 07/2023, it is reduced for turnover above Rs 5 crore and up to Rs 20 crore.

## Method notes
- General penalty provisions were used where their own text covers the item. Each is marked in the entry:
  - CGST s.50 (every person who pays tax late), used for PMT-06 and CMP-08.
  - Companies Act s.450, used for Board meetings.
  - Companies Act s.172, used for DIR-12. That s.170 sits in Chapter XI was read in the as-enacted Act on nclt.gov.in.
  - Companies Act s.405(4), used for MSME-1. The Order states it is made under s.405.
  - Code on Wages s.54(1)(c), used for late wages.
  - Packaged Commodities Rules r.32, used for registration.
- 26QC/26QD late filing fee: TRACES states the s.234E fee for "the TDS/TCS statement" in general and for 26QB by name, not for 26QC or 26QD by name. The penalty source cited for those two is the late payment interest FAQ.
