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
