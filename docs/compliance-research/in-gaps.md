# India: the gaps research (checked on 2026-11-11)

Output: `in-gaps.json`, made by `gen_in.py` in the same folder. It has 34 items: 27 verified and 7 not verified. It adds 4 new departments (personal, safety, aml, environment). It also puts items in the existing `mca` and `licences` departments.

| Gap | Verified | Not verified |
|---|---|---|
| 1 Personal documents | 7 (passport re-issue, PAN-Aadhaar link, OCI upload, driving licence renewal, change of address on a vehicle registration, report of sale by seller, transfer by buyer) | 5 (OCI re-issue after 20, OCI spouse upload, vehicle registration renewal, transfer on owner's death, child Aadhaar biometric update) |
| 2 Workplace safety | 3 (OSH Code registration, change, closure) | 2 (factory or contract-labour licence renewal, accident notice) |
| 3 Anti-money-laundering | 6 (CTR, NTR, CCR, CBWTR, STR, CKYC upload) | 0 |
| 4 Environment | 5 (EPR plastic annual return, plastic raw material quarterly and annual, seller of raw material, plastic recycler, e-waste returns) | 0 |
| 5 Unclaimed amounts (IEPF) | 4 (Unpaid Dividend Account, IEPF-1, shares and IEPF-4, IEPF-2) | 0 |
| 6 Intellectual property | 2 (patent renewal fee, Form 27 statement of working) | 0 |

The trade mark renewal is already in `in-more.ts` (`in_x_tm_renew`), so it is not repeated here.

## Where the facts were read
- **India Code (indiacode.gov.in), the new site.** I read the section texts through its public search API (`/server/api/discover/search/objects`) and the Gazette text files (`/server/api/core/bitstreams/.../content`). That gave me the following:
  - the Motor Vehicles Act sections 14, 15, 41, 49 and 50, which carry the amendments made by Act 8 of 2026 (in force from 15 August 2026);
  - the OSH Code sections 2, 3, 10 and 119;
  - Companies Act section 124;
  - the IEPF Rules and their amendments of 2017, 2019 and 2021;
  - the Plastic Waste Management amendments of 2022 and 2024;
  - the E-Waste (Management) Rules, 2022.

  The old indiacode.nic.in returned 504 errors and a 403 to WebFetch.
- **passportindia.gov.in.** The FAQ page is built by script. I read the official English text file that the page loads (`/psp/locales/en/translation.json`).
- **Other official sites:**
  - fiuindia.gov.in: the PMLA, the PML Rules and the FAQs;
  - incometax.gov.in: the Link Aadhaar FAQ;
  - ipindia.gov.in: Patent Rules 80 and 131, and Patents Act section 53;
  - transport.delhi.gov.in: the registration FAQ;
  - dgfasli.gov.in: the DGOSH newsletter, which confirms the OSH Code is in effect;
  - Embassy of India, Brussels: the 2021 OCI public notice.

## Pages that refused access or could not be read
- uidai.gov.in returned 503 and 404 errors. This affects the child biometric update and the 10-year document update.
- The parivahan.gov.in and vahan sites returned 503 or reset the connection. sarathi.parivahan.gov.in returned a 403. I did not work around these.
- egazette.gov.in failed the certificate check. This blocked the OSH (Central) Rules, 2026 (G.S.R. 345(E), 8 May 2026).
- mca.gov.in and iepf.gov.in returned a 403 or a certificate error.
- cpcb.nic.in did not respond.
- labour.gov.in, morth.gov.in, dish.tn.gov.in and ociservices.gov.in load by script or redirect only.

## Rules that are changing or in conflict
- **Driving licence.** The Delhi Transport Department page is out of date. It says a licence lasts 20 years or to age 50, with a 30-day grace period. The Act now says:
  - a licence lasts to age 40, 10 years, to age 60, or 5 years, depending on the holder's age;
  - you can renew up to 1 year before expiry, and the licence still counts for 30 days after expiry (added by Act 8 of 2026);
  - you must take the driving test again if you apply more than 1 year after expiry.

  The JSON follows the Act.
- **Vehicle change of address and transfer.** Delhi's FAQ says 14 days and Rs 500 a month. The Act says 30 days for a change of address and 30 days for the buyer (14 days for the seller), with a fee of up to Rs 500 or Rs 100 set by the State. The JSON follows the Act.
- **Section 55 of the Motor Vehicles Act** (reporting a destroyed vehicle). A footnote says Act 8 of 2026 replaced "fourteen days", but the text still reads fourteen days. I left this item out.
- **OCI.** The only text I could read is a 2021 mission notice. I could not confirm that it is still in force.
- **Statement of working (rule 8(2) of the PML Rules).** The rule text says "promptly", while the FIU FAQ says "not later than seven working days". The JSON uses the FAQ wording and records this in a note.
- **Companies Act section 124(7).** India Code shows fines with no later amendment. I did not check whether the 2019–2020 decriminalisation changed it.
- **PAN-Aadhaar.** The 30 June 2023 deadline has passed. The page says PAN stays inoperative until the holder pays the Rs 1,000 fee.

## Left out
- Pollution-under-control certificate validity, vehicle fitness certificate periods, and the registration renewal window. These are in the Central Motor Vehicles Rules (rules 52, 62 and 115). India Code only had the 2021 PUCC amendment, which does not state the validity periods.
- Consent-to-operate renewal under the Water and Air Acts. These are set by each State board, and none was read.
- Surrender of an Indian passport after taking foreign citizenship. Passport Seva gives no deadline.
- Reporting entities that are designated businesses or professions, such as real estate agents and dealers in precious metals. These depend on notifications I did not read, so the question text says "where notified".

## The 5 biggest gaps still open
1. **The OSH (Central) Rules, 2026 and the State rules.** These set the time limit for an accident notice, the yearly return, the validity and renewal date of a factory licence, and the age bands for the annual health check. egazette.gov.in was unreachable.
2. **The Central Motor Vehicles Rules.** These set PUC certificate validity, fitness certificate periods for transport vehicles, the window for renewing registration at 15 years, and the time limit for a transfer on the owner's death.
3. **Aadhaar (UIDAI).** The child biometric update at 5 and 15, the 10-year document update, and what happens if they are missed. uidai.gov.in was unreachable.
4. **Pollution-board consent to operate (State boards)** and the CPCB portal procedures, including the rates of environmental compensation.
5. **OCI re-issue rules as they stand today.** These need the MHA or ociservices page. A related gap is the FIU-IND notifications naming the designated businesses and professions (real estate agents, dealers in precious metals and stones, and professionals).
