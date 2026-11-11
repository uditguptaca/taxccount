# UAE gaps research: notes (checked 2026-11-11)

Output: ae-gaps.json in this folder. All items read on official pages in this session (u.ae, rta.ae,
dubailand.gov.ae, dlp.dubai.gov.ae, moet.gov.ae, dmpmedia.dm.gov.ae).

## Pages that refused or failed
- tamm.abudhabi: script-only pages (no text without running JavaScript); WebFetch failed with "Header overflow".
  Abu Dhabi driving licence, vehicle registration and Tawtheeq rules therefore not read on TAMM.
- icp.gov.ae: HTTP 500 (including "ID card holder's duties"). ICP rules were read on u.ae, which cites ICP.
- moi.gov.ae e-service pages: script-only shell, no text.
- doh.gov.ae (Department of Health Abu Dhabi), mohre.gov.ae, dcd.gov.ae (Dubai Civil Defence), adcda.gov.ae,
  scda.shj.ae, spsa.shj.ae, evg.ae: no response / connection failed.
- ajman.ae service catalogue: HTTP 403 (not worked around).
- moccae.gov.ae: "Request Rejected" (web application firewall). Not worked around.
- moet.gov.ae: intermittently dropped connections; pages read on retry. Its "Page was last updated on"
  shows the time of the visit, so it is not a real update date (pageUpdated left null).
- dlp.dubai.gov.ae Law No. (33) of 2008 (amending the Dubai tenancy law): 404.

## Not confirmed
- Ejari: the law says all leases are registered with RERA and unregistered leases cannot be enforced, but no
  official page read states a time limit or which party must register. Kept with verified=false.
- Tawtheeq (Abu Dhabi): no official page readable (TAMM/ADM/DMT). Left out.
- Abu Dhabi driving licence and vehicle late fines: not readable. The driving-licence item uses the federal
  validity from u.ae and Dubai RTA's fine as an example.
- Late fee amount for vehicle registration in Dubai: page says "based on vehicle category and duration of delay"
  without amounts.
- Health insurance in Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah: u.ae (updated 2026-11-09) says
  the mandate "will extend" to these emirates, with no date. Left out (rule 4).
- Patent annual fee late charges: two MoET pages disagree on the cap (AED 600/1,200 vs AED 2,000/4,000).
- Commercial agency renewal (MoET): the service page gives fee AED 3,000 but no validity period or deadline.
  Left out.
- Civil defence / fire safety certificate renewal: no official page reachable in any emirate. Left out.
- MOCCAE permits: site rejected the request. Left out.
- Food-establishment Person in Charge (Dubai Municipality): the DM page confirms PICs are mandatory in every
  food establishment but gives no validity or renewal cycle (training providers say 5 years; not official). Left out.
- RAK environmental permit renewal (epda.rak.ae): fees read, no validity or cycle stated. Left out.
- Abu Dhabi environmental licence (EAD): no official page with a cycle found. Left out.
- Domestic workers law penalties (Cabinet Resolution 106/2022): the tables on u.ae did not come through as text
  and the linked PDFs downloaded empty.
- Consumer protection: no dated duty found on an official page. Nothing added.

## Rules found changing or with deadlines in the past
- Health insurance for private-sector employees and domestic workers: mandatory since 1 January 2025 in Abu Dhabi
  and Dubai; "will extend" to the other five emirates (no date).
- Fire detectors in houses: Cabinet resolution of September 2020 gave owners of existing houses three years
  (now past); new houses need it before the completion certificate.
- Cabinet Resolution No. 136 of 2026 (from 14 September 2026) exempts student inventors and people of
  determination from some industrial property fees (not read in detail).

## Items (21: 19 verified, 2 not)
- Personal documents and status (dept "residency"): 16 items, 14 verified (driving licence, vehicle
  registration, lost Emirates ID, change of details, 180 days abroad, birth registration, newborn visa, family and
  domestic-worker health insurance, Dubai 90-day lease notice, Ejari [not verified], Tawtheeq [not verified],
  Emirati passport, fire detectors, domestic worker wages and ticket, national service).
  Plus 1 employer item in "labour": Abu Dhabi employee health insurance (verified).
- Intellectual property (new dept "ip"): 2 items, 2 verified (trade mark renewal, patent annual fee).
- Environment and sector (new dept "sector"): 1 item, 1 verified (Dubai OHS Person in Charge, 2-year renewal).
- Consumer protection and commercial agencies: 0 items (no dated duty on an official page).

## Five biggest gaps still open
1. Abu Dhabi and northern-emirates driving licence / vehicle renewal fines and grace rules (TAMM and MOI pages
   are script-only; Abu Dhabi Police unreachable). Only Dubai RTA figures are in.
2. Civil defence fire-safety certificate renewal for businesses (Dubai, Abu Dhabi, Sharjah, Ajman sites
   unreachable or 403).
3. Tenancy registration deadlines and penalties (Ejari, Tawtheeq, Sharjah): no time limit on any readable page.
4. Food-establishment permits and food-safety PIC validity, and MOCCAE / EAD environmental permit cycles
   (MOCCAE firewall; no official cycle stated elsewhere).
5. Penalties for domestic-worker violations and for late reporting of lost Emirates ID / changed details
   (ICP site HTTP 500; law PDFs empty), and commercial agency registration validity at MoET.
