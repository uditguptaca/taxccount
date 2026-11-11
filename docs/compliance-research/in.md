# India: non-tax compliance research notes (checked 2026-11-11)

Result file: `in.json` in this folder. 36 new compliances (26 verified, 10 not), 24 new questions, 26 sources,
3 new departments (`fema`, `labour`, `licences`; company items use the existing `mca`), and a top-level
`confirmations` array with 6 entries for filings already in `in.ts`.

Two fields were added beyond the brief's shape, both optional to consume:
- `sources[].read` is `false` for the four sources whose page could not be opened (see "Seen only in search
  summaries"). Their `checked` date is the date access was attempted, not a date the page was read.
- `confirmations[].caveat` says which version of the law the quotation comes from.

## How things were read
- Pages were opened with WebFetch. PDFs were saved by the tool and their text extracted locally with
  `pdftotext`; quotations in `evidence` come from that text or from short exact quotations returned for HTML pages.
- No refusal was worked around. A 403 or 503 was treated as final for that host.

## Hosts that refused automated access
| Host | Result | Effect |
|---|---|---|
| mca.gov.in (all paths, including the Act PDF and e-book) | 403 | No MCA rule, form or circular could be read |
| indiacode.nic.in | 403 | No consolidated (amended) text of any Act |
| incometaxindia.gov.in and wm.incometaxindia.gov.in (Companies Act pages) | 403 | Same |
| lddashboard.legislative.gov.in, legislative.gov.in, iepf.gov.in | 503 / 403 | Same |
| labour.gov.in, return.shramsuvidha.gov.in, egazette.gov.in | 403 / 503 | Labour code rules and the unified annual return unread |
| epfindia.gov.in (redirects to epfo.gov.in), esic.gov.in, web.esic.gov.in | 503 / 403 | PF and ESI due dates still unconfirmed |
| pib.gov.in (press release pages) | 403 | Only `static.pib.gov.in` explainer PDFs could be read |
| meity.gov.in (pages and static uploads) | 403 | DPDP Rules text unread |
| cpcb.nic.in, eprplastic.cpcb.gov.in | 503 | Plastic EPR and e-waste unread |
| fcraonline.nic.in, mha.gov.in | 503 / 403 | FCRA return unread |
| udyamregistration.gov.in, dcmsme.gov.in | 503 | Udyam notification unread |
| apprenticeshipindia.gov.in | 403 | Apprenticeship duties unread |
| klwb.karnataka.gov.in, public.mlwb.in | 503 | Karnataka and Maharashtra labour welfare funds unread |
| rbidocs.rbi.org.in (PDF host) | bot check page | Not attempted further; the HTML versions on rbi.org.in were used |

Hosts that worked: rbi.org.in, content.dgft.gov.in, cert-in.org.in, fssai.gov.in, ipindia.gov.in,
consumeraffairs.gov.in, static.pib.gov.in, nclt.gov.in, cdnbbsr.s3waas.gov.in, law.delhi.gov.in,
labour.delhi.gov.in, dmnewdelhi.delhi.gov.in, mahakamgar.maharashtra.gov.in.

## What could not be confirmed, item by item
**Company law.** The only full text of the Companies Act that could be opened is the Gazette copy of 30 August 2013
on nclt.gov.in (the Act as passed, with no later amendments), plus the Companies (Amendment) Act, 2019 on
cdnbbsr.s3waas.gov.in. The 2013 copy predates every later amending Act, so any time limit in it may have changed
and none of them could be checked against a current official text. So:
- `in_x_board_meetings`, `in_x_mgt14`, `in_x_dir12` are `verified: false`: their time limits were read only in the
  2013 text.
- `in_x_csr_unspent` is `verified: false`: read in the 2019 amending Act as passed; its commencement was not read.
- `in_x_inc20a` and `in_x_chg1` are `verified: true` because the 2019 Act itself contains the rule (section 10A;
  the provisos to section 77). The penalties quoted are the 2019 wording and may have been reduced since.
- No form number (INC-20A, CHG-1, MGT-14, DIR-12, AOC-4, MGT-7, ADT-1) was read on an official page; they are
  carried from the brief and the existing file.
- Not found on any readable official page, so left out rather than filled from memory: BEN-2 (significant
  beneficial owner), PAS-6 (demat reconciliation), CSR-2, INC-22A, CRA-4 (cost audit), MR-3 (secretarial audit
  thresholds), statutory registers, DPT-3, MSME-1, DIR-3 KYC, LLP Form 8 and Form 11.

**Confirmations.** `in_agm`, `in_aoc4`, `in_aoc4_opc`, `in_mgt7`, `in_mgt7a`, `in_adt1` have their time limits
quoted from the 2013 text, each with a caveat. NOT confirmed: `in_dir3`, `in_dpt3`, `in_msme1`, `in_llp11`,
`in_llp8` (rules and the LLP Act unreadable), `in_pf`, `in_esi`, `in_pt`. The FY 2025-26 fee waiver for AOC-4
(to 31 December 2026) and MGT-7 (to 31 January 2027) appeared only in non-official search results (described
there as General Circular 05/2026 of 24 October 2026); it stays unconfirmed.

**Labour codes.** Search results on official hosts (labour.gov.in, pib.gov.in) say the four labour codes took
effect on 21 November 2025 and that Central rules followed in May 2026 (OSH Central Rules reported notified on
8 May 2026). Neither page could be opened. What was read, on two `static.pib.gov.in` explainers (21 November and
5 December 2025): 29 laws consolidated into four codes; "single registration, single licence, single return";
wage payment time limits (monthly wages within 7 days of the next month); appointment letters for every
employee; free annual health check-ups. The laws listed there as subsumed include the Maternity Benefit Act,
the Payment of Gratuity Act, the Contract Labour Act, the Factories Act, the Payment of Bonus Act and the
Employment Exchanges Act, so the old returns under those Acts were NOT researched as live duties.
`in_x_labour_return` is a placeholder with no date. (A search summary showed a 1 February unified return in
Ladakh's Union-territory rules; that is not a Central rule and was not used.)

**PF and ESI.** Search summaries of official pages show "within fifteen days of close of every month" (EPFO, grace
period withdrawn from February 2016) and "within 15 days of the last day of the calendar month" with rates of
0.75% and 3.25% (ESIC). Neither page could be opened, so the existing items stay unverified.

**POSH annual report.** The Act (read) requires a report "in each calendar year" at a time "as may be prescribed".
The 31 January date was read only on the New Delhi District Magistrate's notice. It is marked verified with that
limit stated in `dueText` and `note`; other districts and States may use another date.

**Seen only in search summaries (all `verified: false`, `sources[].read: false`).**
- `in_x_fcra_fc4`: FC-4 within nine months of the year end (31 December).
- `in_x_epr_plastic`: annual return by 30 June of the next financial year; processors by 30 April.
- `in_x_udyam_update`: update within the period shown on the portal; suspension for failure.
- `in_x_ka_lwf`: 15 January; the summary showed two different contribution amounts (Rs 20/40 and Rs 6/12).

**Data protection.** The government explainer (read) says the DPDP Rules were notified on 14 November 2025 with an
eighteen-month phased compliance period, breach notice to affected individuals "without delay", and ninety days
to answer requests. The rule-by-rule start dates and the time limit for the detailed breach report to the Board
were not read. `in_x_dpdp_breach` is `verified: false`.

**Delhi shops registration.** Read in the Act on the Delhi Labour Department's site, which shows no amendment
date. The same site says registration is now online and that newly incorporated companies register through the
incorporation form; that sentence came from a search summary.

**FSSAI renewal.** Read in the FAQ last updated 21 December 2022. A newer edition was not opened.

**Trade mark.** The page shows the Act with no consolidation date. The ten-year term and the six-month late window
were read; which date the first ten years run from was not, so the question asks for the expiry date instead.

## Rules found changing or recently changed
- **Export proceeds (FEMA 23(R)/2026-RB)**: new regulations in force from 1 October 2026, amended up to
  2 November 2026. The realisation period was 15 months (18 for rupee exports) and was cut to 9 and 12 months by
  a September 2026 amendment. Expect further movement.
- **Labour codes**: in transition; State rules may differ and may not all be notified.
- **DPDP**: duties phase in over eighteen months from 14 November 2025.
- **ECB**: the Master Direction was updated on 8 September 2026; the reporting rules quoted were read in that version.
- **FLA return**: FAQ updated 1 July 2026; unchanged at 15 July.
- **Company annual filings for FY 2025-26**: a fee waiver is reported but unconfirmed (above).

## Five most important gaps still open
1. **MCA rule-based filings**: BEN-2, DPT-3, MSME-1, DIR-3 KYC (old 30 September rule or the reported new cycle),
   PAS-6, CSR-2, CRA-4, MR-3 thresholds, LLP Forms 8 and 11, and the FY 2025-26 fee waiver. All need
   mca.gov.in, which returned 403 on every path.
2. **Labour code returns and dates**: the unified annual return (form, date, penalty) under the Central and State
   rules, bonus and gratuity timing, contract labour and factory licensing under the OSH Code, and whether any
   return under a repealed Act is still due for the transition year.
3. **PF and ESI**: monthly due dates, rates, wage ceilings, interest and damages (EPFO and ESIC sites refused).
4. **Environment**: plastic packaging EPR (registration and the 30 June return), e-waste and battery EPR, and State
   pollution control consents (CPCB refused).
5. **State duties beyond Maharashtra and Delhi**: shops and establishments registration and renewal in Karnataka,
   Tamil Nadu and Gujarat; labour welfare fund dates in Maharashtra (not read at all), Karnataka (search summary
   only), Tamil Nadu, Gujarat and Delhi.

Also not covered: DPDP rule-by-rule start dates; FCRA (FC-4, renewal every five years); anti-money-laundering
reports to FIU-IND (only old RBI circulars surfaced); apprenticeship; IEPF transfers of unclaimed dividends;
mandatory statistical surveys; patents and designs renewal.
