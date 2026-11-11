# US states, second half: notes (checked 2026-11-11)

Results: 52 of 67 penalties found, 15 not found. 13 entries confirmed, 1 corrected (Ohio CAT), 16 still unconfirmed (10 of them are the generic "your state's ..." entries).

## Sites that refused automated access (not worked around)
- ilsos.gov (403 / connection reset). ilga.gov and cga.ct.gov also failed every time (TLS error / 503), so Illinois has nothing, and the Connecticut corporation due date is not confirmed.
- sos.ms.gov (Cloudflare block), sos.tn.gov (CloudFront 403). No state-hosted code site could be read, so Mississippi and Tennessee have nothing.
- sos.ok.gov sends every page to the oklahoma.gov/sos home page, and oscn.net (the statutes) shows a Turnstile bot check. Oklahoma has nothing.
- These sites were blocked, so the state's statute site was read instead: business.nj.gov (Incapsula), michigan.gov (Access Denied), sos.nh.gov (Access Denied), maine.gov SOS, sos.vermont.gov, sos.ky.gov, sos.mo.gov, sos.ga.gov, sos.iowa.gov, commerce.alaska.gov, tax.ohio.gov (403).
- sec.state.ma.us gave a redirect loop, so mass.gov and malegislature.gov were used.
- gc.nh.gov refused curl (empty reply), so it was read through a summarising fetch and the New Hampshire quotations are short.

## Existing rules that look wrong or incomplete
- **Ohio CAT (us_oh_cat):** under R.C. 5751.051 (version of 3 Oct 2023), every taxpayer files a return for each calendar quarter, due no later than the 10th day of the second month after the quarter ends. The fourth-quarter return is the annual return. A corrected dueText and due rule are in the JSON. The $6 million exclusion was not read.
- **Louisiana corporation (us_ar_la_corp):** our source (d=76392) is R.S. 12:205.1. The business-corporation rule in force since 2015 is R.S. 12:1-1621, which gives the same due date (on or before the anniversary of incorporation). The source should be switched.
- **Colorado (us_ar_co_both):** the official last day is the end of the second month after the periodic report month, and the late fee applies after that. Our "due" rule uses the end of the report month itself.
- **Georgia (us_ar_ga_both):** a corporation's first annual registration is due within 90 days of incorporation (georgia.gov). Our text does not say this.
- **Alaska (us_ar_ak_both):** the statute says the report is "due before January 2 of the filing year". Our text says "due January 2". Proof of mailing by February 1 also counts as on time.
- **South Dakota (us_ar_sd_both):** the current SDCL 59-11-25 says the first report is due "before the first day of the second month of the year following the year" of authorization, then the same date each year. This does not match "anniversary month". From 1 Jan 2027 (SL 2026 ch 203) the rule becomes either the anniversary month or, if the entity elects it, January 31. The rule was left unconfirmed and no correction is proposed.
- **Montana (us_ar_mt_both):** the help page adds that foreign entities must file by November 1 and domestic entities by December 1. The fee is $35 after April 15.

## Changes and transitions
- **Pennsylvania:** administrative dissolution, cancellation or termination for not filing applies only from annual reports due in 2027 (Act 122 transition).
- **West Virginia:** the annual report fee is $25 after 1 July 2026. The administrative late fee is $50 for an annual delinquency and $100 for a biennial one.
- **New Jersey sales tax:** penalties were read in ANJ-1, the Division's Taxpayers' Bill of Rights, which covers all its taxes. The sales tax page itself states none.
- **New Jersey NJ-REG:** no official page read states a penalty for registering late.

## Penalties that come from statute (the agency page was blocked or silent)
- Statute rather than agency page: AK, IA, KY, LA, MA, ME, MI, MO, NC, NH, OH, VT, WV.
- Business-corporation statute only, LLC statute not read: Maine (13-C) and New Hampshire (293-A).
