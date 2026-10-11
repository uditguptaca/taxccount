// Module Z: donations, other deductions, credits and carry-forwards.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, rw, info, O, yes, no, maybe, eq, isIn, has, any, all, answered } from '../dsl.ts';
import { OWNER_ONLY } from '../opts.ts';

const GIFT = O('cash|Cash or cheque|Argent comptant ou chèque', 'listed|Publicly listed shares, funds or other securities|Actions, fonds ou autres titres cotés en bourse', 'property|Other property (art, land, a vehicle, goods)|Autres biens (œuvres d\'art, terrain, véhicule, marchandises)', 'cultural|Certified cultural property|Bien culturel certifié', 'ecogift|Ecologically sensitive land (ecogift)|Terre écosensible (don écologique)', 'foreign|A gift to a charity outside Canada|Un don à un organisme de bienfaisance hors du Canada');
const CARRY = O('nonCapital|Non-capital losses|Pertes autres qu\'en capital', 'farm|Farm or restricted farm losses|Pertes agricoles ou pertes agricoles restreintes', 'donation|Unused charitable donations|Dons de bienfaisance inutilisés', 'minTax|Minimum tax carryover|Report d\'impôt minimum', 'bizHome|Business-use-of-home expenses carried forward|Frais d\'utilisation de la résidence pour travail autonome reportés', 'cnil|Cumulative net investment loss|Perte nette cumulative sur placements', 'lcgeUsed|Capital gains deduction already used|Déduction pour gains en capital déjà utilisée', 'moving|Moving expenses carried forward|Frais de déménagement reportés', 'other|Other|Autre');

export const moduleZ = M({
  code: 'Z', name: 'DONATIONS_CREDITS', phase: 'deductions', icon: 'heart',
  title: ["Donations, other credits and carry-forwards", "Dons, autres crédits et reports"],
  desc: ["Gifts to charity, political contributions, remaining deductions and credits, and balances carried from earlier years.", "Dons de bienfaisance, contributions politiques, autres déductions et crédits, et soldes reportés d'années antérieures."],
  show: any(maybe('F.ded.donations'), maybe('F.ded.volunteer'), maybe('F.ded.educator'), maybe('F.ded.investCredits'), maybe('F.ded.carry'), maybe('F.inc.unusual')),
  src: ['cra.deductions'],
  cover: [
    { item: 'Charitable gifts: donor, recipient, receipt, date, amount, type, non-cash property, prior unused gifts, spouse allocation', ref: 'Schedule 9, 34900', kind: 'client', qs: ['Z.gift.*'] },
    { item: 'Federal political contributions', ref: '41000', kind: 'client', qs: ['Z.political.*'] },
    { item: 'Volunteer firefighters and search and rescue volunteers; eligible educator school supplies', ref: '31220, 31240, 46900', kind: 'client', qs: ['Z.vol.*', 'Z.edu.*'] },
    { item: 'Labour-sponsored funds and investment tax credits; specialized investment credits', ref: '41200, 41400', kind: 'client', qs: ['Z.invest.*'] },
    { item: 'Repayments of income, legal fees to collect or establish a right to income, and other employment-related deductions', ref: '23200, 22100, 25600', kind: 'client', qs: ['Z.other.*'] },
    { item: 'Carry-forwards for losses, tuition, donations, minimum tax, registered plans, business-use-of-home and other balances, supported by assessments', ref: '25200, 25300, 40427', kind: 'documents', qs: ['Z.carry.*'], note: 'A balance is never accepted from memory alone: an assessment or prior schedule is requested for each.' },
  ],
}, [
  S('giftAny', ["Gifts to charity", "Dons de bienfaisance"], [
    yn('any', ["Did you or your spouse give to a registered charity in the tax year?", "Vous ou votre conjoint avez-vous fait un don à un organisme de bienfaisance enregistré durant l'année d'imposition?"], { req: true }),
    cur('prior', ["Unused gifts carried forward from earlier years (from last year's return or notice of assessment), if you know", "Dons inutilisés reportés d'années antérieures (selon la déclaration de l'an dernier ou l'avis de cotisation), si vous les connaissez"], { show: maybe('.any'), map: { form: 'Schedule 9', verified: true } }),
  ], { show: maybe('F.ded.donations') }),
  S('gift', ["A gift", "Un don"], [
    tx('charity', ["Name of the charity", "Nom de l'organisme de bienfaisance"], { req: true, label: true }),
    tx('regNo', ["Charity registration number on the receipt", "Numéro d'enregistrement de l'organisme figurant sur le reçu"], { help: ["It looks like 123456789RR0001. It lets us check the charity is registered.", "Il ressemble à 123456789RR0001. Il nous permet de vérifier que l'organisme est enregistré."] }),
    rd('donor', ["Who made the gift?", "Qui a fait le don?"], { opts: OWNER_ONLY, req: true, help: ["Spouses can combine their gifts on one return. We decide the best way.", "Les conjoints peuvent regrouper leurs dons sur une même déclaration. Nous déterminons la meilleure façon."] }),
    dt('date', ["Date of the gift", "Date du don"], { req: true, rules: [{ t: 'dateInYear' }] }),
    sl('type', ["What kind of gift?", "Quel type de don?"], { opts: GIFT, req: true }),
    cur('amount', ["Total amount on the receipt", "Montant total figurant sur le reçu"], { req: true, rules: [{ t: 'min', v: 0 }] }),
    cur('advantage', ["Value of anything you received in return (a gift, a meal, a ticket)", "Valeur de tout ce que vous avez reçu en retour (un cadeau, un repas, un billet)"], { help: ["The eligible amount of the gift is lower by this.", "Le montant admissible du don est réduit de cette valeur."] }),
    cur('fmv', ["Market value on the date of the gift", "Valeur marchande à la date du don"], { show: isIn('.type', ['listed', 'property', 'cultural', 'ecogift']) }),
    cur('acb', ["What the property cost you", "Ce que le bien vous a coûté"], { show: isIn('.type', ['listed', 'property']), help: ["Needed to work out the capital gain on a gift of property.", "Nécessaire pour calculer le gain en capital sur un don de bien."] }),
    tx('propertyDesc', ["Describe the property and who valued it", "Décrivez le bien et indiquez qui l'a évalué"], { show: isIn('.type', ['property', 'cultural', 'ecogift']) }),
    fl('receipt', ["Upload the official donation receipt.", "Téléversez le reçu officiel de don."], { req: true, docs: [{ key: 'DONATION_RECEIPT', label: ["Official charitable donation receipt", "Reçu officiel de don de bienfaisance"] }] }),
  ], { show: maybe('Z.giftAny.any'), repeat: { label: ["Gift", "Don"], add: ["Add another gift", "Ajouter un autre don"], min: 1 } }),
  S('political', ["Federal political contributions", "Contributions politiques fédérales"], [
    yn('any', ["Did you make a contribution to a federal political party, association or candidate?", "Avez-vous fait une contribution à un parti, une association ou un candidat politique fédéral?"], { req: true, map: { form: 'T1', line: '41000', verified: true } }),
    rw('rows', ["Contributions", "Contributions"], { show: maybe('.any'), cols: [{ id: 'to', t: ["To", "À"], type: 'text' }, { id: 'date', t: ["Date", "Date"], type: 'date' }, { id: 'amount', t: ["Amount", "Montant"], type: 'currency' }] }),
    fl('receipt', ["Upload the official receipts.", "Téléversez les reçus officiels."], { show: maybe('.any'), docs: [{ key: 'FED_POLITICAL_RECEIPT', label: ["Federal political contribution receipts", "Reçus de contributions politiques fédérales"] }] }),
  ], { show: maybe('F.ded.donations') }),
  S('vol', ["Volunteer service", "Service bénévole"], [
    num('hours', ["Hours of eligible volunteer firefighter or search and rescue service in the year", "Heures de service admissible comme pompier volontaire ou bénévole en recherche et sauvetage durant l'année"], { req: true, unit: 'hours', rules: [{ t: 'min', v: 0 }], help: ["At least 200 hours are needed.", "Au moins 200 heures sont nécessaires."], map: { form: 'T1', line: '31220 / 31240', verified: true } }),
    fl('proof', ["Upload the certificate from your fire department or organization.", "Téléversez l'attestation de votre service d'incendie ou organisme."], { docs: [{ key: 'VOLUNTEER_CERT', label: ["Volunteer service certificate", "Attestation de service bénévole"] }] }),
  ], { show: maybe('F.ded.volunteer') }),
  S('edu', ["Educator school supplies", "Fournitures scolaires des éducateurs"], [
    cur('spent', ["Amount you spent on eligible supplies", "Montant dépensé en fournitures admissibles"], { req: true, map: { form: 'T1', line: '46900', verified: true } }),
    cur('reimb', ["Amount you were reimbursed or could be reimbursed", "Montant qui vous a été remboursé ou pourrait l'être"]),
    fl('cert', ["Upload the certificate from your school or the receipts.", "Téléversez l'attestation de votre école ou les reçus."], { docs: [{ key: 'EDUCATOR_CERT', label: ["Educator certificate and supply receipts", "Attestation de l'éducateur et reçus de fournitures"] }] }),
  ], { show: maybe('F.ded.educator') }),
  S('invest', ["Investment tax credits and funds", "Crédits d'impôt à l'investissement et fonds"], [
    tx('what', ["What did you invest in?", "Dans quoi avez-vous investi?"], { req: true, label: true }),
    rd('kind', ["What kind of investment?", "Quel type de placement?"], { opts: O('labour|Labour-sponsored fund|Fonds de travailleurs', 'shelter|Tax shelter|Abri fiscal', 'flow|Flow-through shares|Actions accréditives', 'itc|A business with an investment tax credit|Une entreprise donnant droit à un crédit d\'impôt à l\'investissement', 'other|Other|Autre'), req: true }),
    cur('amount', ["Amount invested", "Montant investi"], { req: true }),
    dt('date', ["Date of purchase", "Date d'achat"]),
    fl('slip', ["Upload the slip (for example T5006, tax shelter statement or flow-through statement).", "Téléversez le feuillet (par exemple T5006, état de l'abri fiscal ou des actions accréditives)."], { req: true, docs: [{ key: 'INVESTMENT_CREDIT_SLIP', label: ["Investment tax credit or tax shelter slip", "Feuillet de crédit d'impôt à l'investissement ou d'abri fiscal"] }] }),
  ], { show: maybe('F.ded.investCredits'), repeat: { label: ["Investment", "Placement"], add: ["Add another investment", "Ajouter un autre placement"], min: 1 } }),
  S('other', ["Repayments, legal fees and other deductions", "Remboursements, frais juridiques et autres déductions"], [
    yn('repaid', ["Did you repay income you received in an earlier year (for example salary, a benefit, a pension payment)?", "Avez-vous remboursé un revenu reçu dans une année antérieure (par exemple salaire, prestation, paiement de pension)?"], { req: true }),
    cur('repaidAmount', ["Amount repaid and which year it came from", "Montant remboursé et année d'origine"], { show: maybe('.repaid'), map: { form: 'T1', line: '23200', verified: true } }),
    yn('legal', ["Did you pay legal fees to collect or establish a right to salary, a pension or a retirement benefit, or to object to a tax assessment?", "Avez-vous payé des frais juridiques pour percevoir ou faire établir un droit à un salaire, à une pension ou à une prestation de retraite, ou pour contester une cotisation?"], { req: true }),
    cur('legalAmount', ["Amount paid", "Montant payé"], { show: maybe('.legal'), map: { form: 'T1', line: '22100', verified: true } }),
    yn('misc', ["Is there another deduction or credit you have been told you can claim that we have not asked about?", "Y a-t-il une autre déduction ou un autre crédit qu'on vous a dit pouvoir demander et dont nous n'avons pas parlé?"]),
    ta('miscNote', ["Tell us what it is and who told you.", "Dites-nous de quoi il s'agit et qui vous l'a dit."], { show: maybe('.misc'), review: [{ when: { q: '.misc', op: 'maybe' }, sev: 'warning', title: ["Client mentions a deduction or credit not in the questionnaire: check eligibility", "Le client mentionne une déduction ou un crédit absent du questionnaire : vérifier l'admissibilité"] }] }),
  ], { show: any(maybe('F.inc.unusual'), maybe('F.ded.carry'), maybe('F.inc.employment'), maybe('F.inc.pension')) }),
  S('carry', ["Balances from earlier years", "Soldes d'années antérieures"], [
    info('read', ["We do not rely on memory for these. Upload your last notice of assessment and last year's return, and we read the balances from them. Tell us here about anything they might not show.", "Nous ne nous fions pas à la mémoire pour ces montants. Téléversez votre dernier avis de cotisation et la déclaration de l'an dernier, et nous lirons les soldes. Dites-nous ici tout ce qu'ils pourraient ne pas indiquer."]),
    fl('noa', ["Upload your last notice of assessment and last year's return.", "Téléversez votre dernier avis de cotisation et la déclaration de l'an dernier."], { docs: [{ key: 'CARRYFORWARD_PROOF', label: ["Last notice of assessment and prior-year return (carry-forward balances)", "Dernier avis de cotisation et déclaration de l'an dernier (soldes reportés)"] }] }),
    sl('type', ["Which kind of balance?", "Quel type de solde?"], { opts: CARRY, label: true }),
    cur('amount', ["Amount", "Montant"]),
    tx('year', ["Year it arose", "Année d'origine"]),
    ta('note', ["Anything else about this balance", "Autre précision sur ce solde"]),
  ], { show: maybe('F.ded.carry'), repeat: { label: ["Balance", "Solde"], add: ["Add another balance", "Ajouter un autre solde"] } }),
]);
