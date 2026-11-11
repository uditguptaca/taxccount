# US states group 5: notes (checked 2026-11-11)

States: SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY. Output: us-states-g5.json (46 items, 76 sources).
Working files (downloaded pages, build scripts) are in research3/g5work; `run.sh` rebuilds the JSON from `st_*.py`.

South Carolina's four items from the earlier, cut-off attempt were re-fetched and re-checked against the
official pages today (statutes on scstatehouse.gov, DEW handbook PDF, Treasurer FAQ PDF). All quotes and
figures matched, so they were kept unchanged.

None of my states had a quarterly wage report in us-states.ts, so duty 2 is included for all 11.

## Per state: duties 1-4 not read, and anything unusual

- **SC**: all four read. newhire.sc.gov is script-only; new-hire rule read in statute 43-5-598. Breach law gives no day count ("most expedient time possible and without unreasonable delay").
- **SD**: all four read. Breach: 60 days (SDCL 22-40-20); AG notice when more than 250 residents. Treasurer's unclaimed page shows no holder deadline, so it was read in SDCL 43-41B-18 (before Nov 1; life insurers before May 1). No due-diligence day window in law, only "before filing". Penalty is interest only (43-41B-35).
- **TN**: duty 2 NOT verified. lwdsupport.tn.gov ("When are quarterly reports due?") returned 403; tn.gov pages read show who must file but not the due date or late penalty. Item kept with verified:false. Unclaimed penalty amounts are only in the statute, which the Treasury links on LexisNexis (not read); the Treasury says 2026 reports are accepted on Mon Nov 2 because Nov 1 is a Sunday. Breach: 45 days from the AG's summary page; statute (Lexis) not read, so no start point or penalty.
- **TX**: all four read. Statute site (statutes.capitol.texas.gov) is script-only. Breach: the AG page gives 30 days for the AG report (250+ Texans) but no day count for consumer notice, which was not recorded beyond "must also provide notice". New-hire page states no penalty. Unclaimed is due **July 1** (property presumed abandoned as of March 1), not November.
- **UT**: all four read. Unclaimed read in statute (mycash.utah.gov is script-only). Breach: no day count.
- **VT**: duty 2 NOT verified. labor.vermont.gov returned CloudFront 403 on every page (quarterly reporting page, employer handbook, new-hire page), and vermonttreasurer.gov returned 403 too. New hire (10 calendar days, shorter than federal), unclaimed (before **May 1**, covering the prior calendar year) and breach (45 days; AG preliminary notice in 14 business days) were all read in the Vermont statutes. For duty 2 only the $100 late-report penalty (21 V.S.A. § 1328) was read; the due date is set by Department rule and was not read.
- **VA**: all four read. New-hire: neither DSS nor § 63.2-1946 states a penalty. Breach: no day count. Extra: RetirePath Virginia (duty 5) added with verified:false, because the statute does not fix an enrolment date and the programme site returned nothing readable; it also applies only to employers with 5+ eligible employees and no qualified plan, which no shared question tests.
- **WA**: all four read. Unclaimed due **October 31** (12 months before July 1; insurers April 30); $75 due-diligence threshold. Breach: 30 calendar days for residents and for the AG (500+ residents). Extra: Paid Family and Medical Leave quarterly report (duty 5) added from the WAC (due last day of month after quarter); paidleave.wa.gov returned 403, so its late penalty was not read. WA Cares Fund and business licence renewals were not researched.
- **WV**: all four read, all from statute/agency pages. New hire **14 days** (shorter than federal). Unclaimed owner notice window is 120-60 days. Breach: no day count. Treasurer's own holder pages were not read.
- **WI**: all four read. docs.legis.wisconsin.gov reset the connection on three tries, so the breach statute (§ 134.98) and UI statute were not read; breach deadline (45 days) is from DATCP's page, UI dates and penalties from DWD's employer handbook. DWD new-hire page gives no penalty and does not say from which day the 20 days run. Unclaimed: for 2026 DOR says reports are due Mon Nov 2 (Nov 1 is a Sunday); letters must go out between July 1 and Sept 1.
- **WY**: all four read (statutes read in the Legislature's title PDFs). Neither statute nor DWS page states a new-hire penalty or a flat late-filing penalty for UI (only 2% a month interest on late contributions). Breach: no day count; penalty provisions not read.

## Duties 5 and 6 not covered
Not researched for lack of time: WA Cares Fund premium, business licence renewals (duty 6) in all states,
Vermont Saves and any other state retirement programme, pay-data reports. No state in this group has a
state disability insurance programme that was checked.
