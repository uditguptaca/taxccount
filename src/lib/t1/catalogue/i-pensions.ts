// Module I: pensions, government benefits and registered-plan payments.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, info, O, yes, no, maybe, eq, isIn, any, all, answered, age } from '../dsl.ts';
import { COUNTRIES, CURRENCIES } from '../opts.ts';

export const moduleI = M({
  code: 'I', name: 'PENSIONS', phase: 'income', icon: 'landmark',
  title: ["Pensions and benefits", "Pensions et prestations"],
  desc: ["Retirement income, government benefits and withdrawals from registered plans.", "Revenu de retraite, prestations gouvernementales et retraits de régimes enregistrés."],
  show: any(maybe('F.inc.pension'), maybe('F.inc.benefits'), maybe('F.inc.studentFunding'), maybe('F.ded.fhsa'), maybe('F.ded.rrsp')),
  src: ['cra.income', 'cra.rrspGuide'],
  cover: [
    { item: 'OAS pension and supplements (T4A(OAS))', ref: '11300, 14600', kind: 'documents', qs: ['I.oas.*'] },
    { item: 'CPP/QPP retirement, disability, survivor, child, death and post-retirement benefits; election to stop contributing', ref: '11400, 11410', kind: 'documents', qs: ['I.cpp.*'] },
    { item: 'Employer pensions, annuities, RRIFs, LIFs; foreign pensions and foreign withholding', ref: '11500', kind: 'client', qs: ['I.pension.*'] },
    { item: 'EI and provincial parental benefits; benefit repayments', ref: '11900, 11905, 23500', kind: 'documents', qs: ['I.ei.*', 'I.repay.*'] },
    { item: 'Workers\' compensation and social assistance', ref: '14400, 14500, 25000', kind: 'documents', qs: ['I.wc.*'] },
    { item: 'RRSP and FHSA withdrawals; spousal RRSP attribution', ref: '12900, 12905, 12906', kind: 'client', qs: ['I.rrsp.*', 'I.fhsa.*'] },
    { item: 'RESP assistance and accumulated income; RDSP payments', ref: '13000, 12500', kind: 'client', qs: ['I.resp.*', 'I.rdsp.*'] },
    { item: 'Other retirement or deferred compensation (RCA, SDA, annuity income)', kind: 'client', qs: ['I.other.*'] },
    { item: 'Advance benefit payments needing reconciliation', kind: 'client', qs: ['I.advance.*'] },
    { item: 'Pension income splitting review; prior elections', ref: '21000, 11600', kind: 'preparer', qs: ['I.split.*'], note: 'The client is never asked to decide the election; the preparer works out whether it saves tax.' },
  ],
}, [
  S('oas', ["Old Age Security", "Sécurité de la vieillesse"], [
    yn('got', ["Did you receive Old Age Security (OAS), the Guaranteed Income Supplement or an OAS allowance?", "Avez-vous reçu la Sécurité de la vieillesse (SV), le Supplément de revenu garanti ou une allocation de la SV?"], { req: true }),
    num('months', ["For how many months of the year?", "Pendant combien de mois de l'année?"], { show: maybe('.got'), unit: 'months', rules: [{ t: 'min', v: 0 }, { t: 'max', v: 12 }] }),
    yn('recovery', ["Was any of your OAS held back or recovered because your income was high?", "Une partie de votre SV a-t-elle été retenue ou récupérée parce que votre revenu était élevé?"], { show: maybe('.got') }),
    yn('slipHave', ["Do you have the T4A(OAS) slip?", "Avez-vous le feuillet T4A(SV)?"], { show: maybe('.got'), help: ["The slip is in the tax slips section.", "Le feuillet se trouve dans la section sur les feuillets fiscaux."] }),
  ], { show: any(maybe('F.inc.benefits'), age('B.id.dob', 'gte', 64)) }),
  S('cpp', ["CPP or QPP benefits", "Prestations du RPC ou du RRQ"], [
    mu('kinds', ["Which CPP or QPP benefits did you receive?", "Quelles prestations du RPC ou du RRQ avez-vous reçues?"], { opts: O('retirement|Retirement pension|Pension de retraite', 'disability|Disability benefit|Prestation d\'invalidité', 'survivor|Survivor\'s benefit|Prestation de survivant', 'child|Child\'s benefit|Prestation d\'enfant', 'death|Death benefit (lump sum)|Prestation de décès (somme forfaitaire)', 'prb|Post-retirement benefit|Prestation après-retraite', 'none|None|Aucune'), req: true }),
    dt('started', ["Date the retirement pension started", "Date du début de la pension de retraite"], { show: has2('.kinds', 'retirement') }),
    yn('electStop', ["Are you working and aged 65 to 70, receiving CPP or QPP retirement, and did you ask to stop contributing?", "Travaillez-vous, avez-vous entre 65 et 70 ans, recevez-vous une pension de retraite du RPC ou du RRQ et avez-vous demandé de cesser de cotiser?"], { show: has2('.kinds', 'retirement'), help: ["There is an election form (CPT30) for this. Tell us if you filed it, or whether you would like to.", "Un formulaire de choix (CPT30) existe. Dites-nous si vous l'avez produit, ou si vous aimeriez le faire."] }),
    yn('estate', ["Is the death benefit being reported by an estate or a beneficiary?", "La prestation de décès est-elle déclarée par une succession ou un bénéficiaire?"], { show: has2('.kinds', 'death') }),
  ], { show: maybe('F.inc.benefits') }),
  S('pension', ["A pension or annuity", "Une pension ou une rente"], [
    tx('payer', ["Who pays it?", "Qui la verse?"], { req: true, label: true }),
    rd('kind', ["What kind is it?", "De quel type s'agit-il?"], { req: true, opts: O('rpp|Employer pension plan (RPP)|Régime de pension d\'employeur (RPA)', 'dpsp|Deferred profit sharing plan or PRPP|Régime de participation différée aux bénéfices ou RPAC', 'annuity|Annuity|Rente', 'foreign|Foreign pension|Pension étrangère', 'veteran|Veterans or military pension|Pension d\'ancien combattant ou militaire', 'variable|Variable benefit (defined contribution plan)|Prestations variables (régime à cotisations déterminées)', 'other|Another kind|Autre') }),
    cur('amount', ["Total received in the year", "Total reçu durant l'année"], { req: true }),
    cur('tax', ["Tax withheld", "Impôt retenu"]),
    sl('country', ["Country paying it, if outside Canada", "Pays qui la verse, si hors du Canada"], { opts: COUNTRIES, show: eq('.kind', 'foreign') }),
    sl('currency', ["Currency", "Devise"], { opts: CURRENCIES, show: eq('.kind', 'foreign') }),
    cur('foreignTax', ["Foreign tax withheld", "Impôt étranger retenu"], { show: eq('.kind', 'foreign'), map: { form: 'T2209', verified: true } }),
    yn('contrib', ["Did you pay in after-tax money to this pension, or was part of it tax-paid?", "Avez-vous cotisé à cette pension avec de l'argent après impôt, ou une partie est-elle déjà imposée?"], { show: isIn('.kind', ['foreign', 'annuity']), help: ["This can make part of a foreign pension tax-free in Canada.", "Cela peut rendre une partie d'une pension étrangère non imposable au Canada."] }),
    fl('doc', ["Upload the slip or the statement.", "Téléversez le feuillet ou le relevé."], { docs: [{ key: 'PENSION_STATEMENT', label: ["Pension or annuity slip or statement", "Feuillet ou relevé de pension ou de rente"] }] }),
  ], { show: maybe('F.inc.pension'), repeat: { label: ["Pension", "Pension"], add: ["Add another pension or annuity", "Ajouter une autre pension ou rente"], min: 1 } }),
  S('rrspAny', ["Withdrawals from registered plans", "Retraits de régimes enregistrés"], [
    yn('any', ["Did you withdraw money from an RRSP, RRIF, LIF or similar plan?", "Avez-vous retiré de l'argent d'un REER, d'un FERR, d'un FRV ou d'un régime semblable?"], { req: true }),
  ], { show: any(maybe('F.inc.pension'), maybe('F.ded.rrsp')) }),
  S('rrsp', ["RRSP, RRIF or LIF withdrawal", "Retrait d'un REER, d'un FERR ou d'un FRV"], [
    tx('inst', ["Institution", "Institution"], { req: true, label: true }),
    rd('kind', ["What kind of withdrawal?", "Quel type de retrait?"], { req: true, opts: O('rrif|Regular RRIF or LIF income|Revenu régulier d\'un FERR ou d\'un FRV', 'rrsp|Lump-sum RRSP withdrawal|Retrait forfaitaire d\'un REER', 'hbp|Home Buyers\' Plan|Régime d\'accession à la propriété', 'llp|Lifelong Learning Plan|Régime d\'encouragement à l\'éducation permanente', 'deceased|From a deceased person\'s plan|D\'un régime d\'une personne décédée', 'other|Other|Autre') }),
    cur('amount', ["Gross amount withdrawn", "Montant brut retiré"], { req: true }),
    cur('tax', ["Tax withheld", "Impôt retenu"]),
    dt('date', ["Date of withdrawal", "Date du retrait"], { rules: [{ t: 'dateInYear' }] }),
    yn('spousal', ["Did your spouse or partner put money into a spousal RRSP for you in the year of this withdrawal or the two years before?", "Votre conjoint a-t-il cotisé à un REER de conjoint à votre nom durant l'année de ce retrait ou les deux années précédentes?"], { show: isIn('.kind', ['rrsp', 'rrif']), help: ["Part of the withdrawal may be taxed to your spouse instead of you.", "Une partie du retrait peut être imposée à votre conjoint plutôt qu'à vous."], review: [{ when: { q: '.spousal', op: 'maybe' }, sev: 'warning', title: ["Spousal RRSP attribution: income may be taxed to the contributing spouse", "Attribution d'un REER de conjoint : le revenu peut être imposé au conjoint cotisant"] }] }),
    fl('slip', ["Upload the T4RSP, T4RIF or statement.", "Téléversez le T4RSP, le T4RIF ou le relevé."], { docs: [{ key: 'RRSP_WITHDRAWAL_SLIP', label: ["T4RSP, T4RIF or withdrawal statement", "T4RSP, T4RIF ou relevé de retrait"] }] }),
  ], { show: maybe('I.rrspAny.any'), repeat: { label: ["Withdrawal", "Retrait"], add: ["Add another withdrawal", "Ajouter un autre retrait"] } }),
  S('fhsaAny', ["FHSA withdrawals", "Retraits du CELIAPP"], [
    yn('any', ["Did you take any money out of an FHSA?", "Avez-vous retiré de l'argent d'un CELIAPP?"], { req: true }),
  ], { show: maybe('F.ded.fhsa') }),
  S('fhsa', ["FHSA withdrawal", "Retrait d'un CELIAPP"], [
    tx('inst', ["Institution", "Institution"], { req: true, label: true }),
    dt('date', ["Date of withdrawal", "Date du retrait"], { req: true, rules: [{ t: 'dateInYear' }] }),
    cur('amount', ["Amount withdrawn", "Montant retiré"], { req: true }),
    yn('qualifying', ["Was it used to buy or build your first home?", "A-t-il servi à acheter ou à construire votre première propriété?"], { req: true, help: ["A qualifying withdrawal is tax-free. Other withdrawals are taxable.", "Un retrait admissible est libre d'impôt. Les autres retraits sont imposables."], review: [{ when: { q: '.qualifying', op: 'maybe' }, sev: 'warning', title: ["FHSA qualifying withdrawal: confirm the qualifying-withdrawal documents and timing", "Retrait admissible d'un CELIAPP : confirmer les documents et le calendrier"] }] }),
    tx('home', ["Address of the home", "Adresse de la propriété"], { show: maybe('.qualifying') }),
    dt('closing', ["Closing date or date of the written agreement to buy or build", "Date de clôture ou date de la convention écrite d'achat ou de construction"], { show: maybe('.qualifying') }),
    fl('doc', ["Upload the purchase agreement or closing statement.", "Téléversez la convention d'achat ou l'état de clôture."], { show: maybe('.qualifying'), docs: [{ key: 'FHSA_QUALIFYING_DOC', label: ["Purchase agreement or closing statement for a qualifying FHSA withdrawal", "Convention d'achat ou état de clôture pour un retrait admissible du CELIAPP"] }] }),
  ], { show: maybe('I.fhsaAny.any'), repeat: { label: ["FHSA withdrawal", "Retrait du CELIAPP"], add: ["Add another withdrawal", "Ajouter un autre retrait"] } }),
  S('resp', ["RESP payments", "Paiements d'un REEE"], [
    cur('eap', ["Educational assistance payments received (T4A box 042)", "Paiements d'aide aux études reçus (case 042 du T4A)"], { help: ["Taxable to the student. Enter the total if you do not have a slip.", "Imposables pour l'étudiant. Inscrivez le total si vous n'avez pas de feuillet."] }),
    cur('aip', ["Accumulated income payments received (T4A box 040)", "Paiements de revenu accumulé reçus (case 040 du T4A)"], { review: [{ when: { q: '.aip', op: 'answered' }, sev: 'warning', title: ["RESP accumulated income payment: extra tax and RRSP room rules apply", "Paiement de revenu accumulé d'un REEE : un impôt additionnel et des règles de droits REER s'appliquent"] }] }),
    ta('note', ["Anything else about RESP payments", "Autres précisions sur les paiements d'un REEE"]),
  ], { show: maybe('F.inc.studentFunding') }),
  S('rdsp', ["RDSP payments", "Paiements d'un REEI"], [
    yn('got', ["Did you receive money from a Registered Disability Savings Plan?", "Avez-vous reçu de l'argent d'un régime enregistré d'épargne-invalidité?"], { req: true }),
    cur('amount', ["Total taxable amount received", "Total imposable reçu"], { show: maybe('.got') }),
    yn('repay', ["Did you have to repay grants or bonds to the government?", "Avez-vous dû rembourser des subventions ou des bons au gouvernement?"], { show: maybe('.got') }),
  ], { show: maybe('F.inc.benefits') }),
  S('ei', ["Employment Insurance and parental benefits", "Assurance-emploi et prestations parentales"], [
    mu('kinds', ["Which did you receive?", "Lesquelles avez-vous reçues?"], { opts: O('regular|Regular EI benefits|Prestations régulières d\'AE', 'sickness|EI sickness benefits|Prestations de maladie de l\'AE', 'maternity|Maternity or parental (EI)|Maternité ou parentales (AE)', 'qpip|Quebec Parental Insurance Plan (QPIP)|Régime québécois d\'assurance parentale (RQAP)', 'caregiving|Caregiving benefits|Prestations de proche aidant', 'training|Training or work-sharing|Formation ou travail partagé', 'none|None|Aucune') }),
    yn('repay', ["Were you asked to repay any of your EI benefits because your income was high?", "Vous a-t-on demandé de rembourser une partie de vos prestations d'AE parce que votre revenu était élevé?"], { show: maybe('F.inc.benefits') }),
  ], { show: maybe('F.inc.benefits') }),
  S('wc', ["Workers' compensation and social assistance", "Indemnités d'accident du travail et aide sociale"], [
    cur('wc', ["Workers' compensation received", "Indemnités d'accident du travail reçues"]),
    cur('sa', ["Social assistance received (including provincial supplements)", "Aide sociale reçue (y compris les suppléments provinciaux)"]),
    yn('slip', ["Do you have the T5007 slip or Relevé 5?", "Avez-vous le feuillet T5007 ou le relevé 5?"], { help: ["It goes in the tax slips section.", "Il se trouve dans la section sur les feuillets fiscaux."] }),
  ], { show: maybe('F.inc.benefits') }),
  S('repay', ["Repaying a benefit", "Remboursement d'une prestation"], [
    yn('any', ["Did you repay any benefit during the year, for example EI, OAS, CPP, a pandemic benefit or a provincial benefit?", "Avez-vous remboursé une prestation durant l'année, par exemple l'AE, la SV, le RPC, une prestation liée à la pandémie ou une prestation provinciale?"], { req: true }),
    cur('amount', ["Total repaid", "Total remboursé"], { show: maybe('.any') }),
    tx('which', ["Which benefit, and for which year?", "Quelle prestation, et pour quelle année?"], { show: maybe('.any') }),
    fl('proof', ["Upload the repayment receipt or letter.", "Téléversez le reçu ou la lettre de remboursement."], { show: maybe('.any'), docs: [{ key: 'BENEFIT_REPAYMENT', label: ["Benefit repayment proof", "Preuve de remboursement d'une prestation"], optional: true }] }),
  ], { show: maybe('F.inc.benefits') }),
  S('advance', ["Advance benefit payments", "Paiements anticipés de prestations"], [
    yn('any', ["Did you receive any advance payment of a benefit that will be checked against your tax return?", "Avez-vous reçu un paiement anticipé d'une prestation qui sera vérifié à la lumière de votre déclaration?"], { req: true, help: ["For example advance payments of the Canada Workers Benefit or a provincial credit.", "Par exemple les paiements anticipés de l'Allocation canadienne pour les travailleurs ou d'un crédit provincial."] }),
    tx('which', ["Which program, and how much?", "Quel programme, et combien?"], { show: maybe('.any') }),
  ], { show: maybe('F.inc.benefits') }),
  S('other', ["Other retirement or deferred income", "Autre revenu de retraite ou différé"], [
    yn('any', ["Do you receive anything else for retirement or deferred pay, such as a retirement compensation arrangement, a salary deferral arrangement or a death or disability pension?", "Recevez-vous autre chose au titre de la retraite ou d'une rémunération différée, comme une convention de retraite, un arrangement de report de salaire ou une pension de décès ou d'invalidité?"], { req: true, review: [{ when: { q: '.any', op: 'maybe' }, sev: 'specialist', specialist: 'Retirement arrangements', title: ["Retirement compensation or deferral arrangement: treatment needs review", "Convention de retraite ou arrangement de report : le traitement doit être examiné"] }] }),
    ta('details', ["Describe it and who pays it.", "Décrivez-la et indiquez qui la verse."], { show: maybe('.any') }),
  ], { show: maybe('F.inc.pension') }),
  S('split', ["Pension income splitting", "Fractionnement du revenu de pension"], [
    yn('check', ["Would you like us to check whether splitting pension income with your spouse or partner would save tax?", "Souhaitez-vous que nous vérifiions si le fractionnement du revenu de pension avec votre conjoint ou conjointe vous ferait économiser de l'impôt?"], { help: ["You do not need to decide. We run the numbers when both returns are prepared together.", "Vous n'avez pas à décider. Nous faisons les calculs lorsque les deux déclarations sont préparées ensemble."] }),
    yn('prior', ["Did you split pension income in earlier years?", "Avez-vous fractionné un revenu de pension dans les années précédentes?"]),
    tx('priorHow', ["How much did you split, and in which years?", "Combien avez-vous fractionné, et pour quelles années?"], { show: maybe('.prior') }),
  ], { show: all(maybe('F.inc.pension'), any(eq('D.status.marital', 'married'), eq('D.status.marital', 'common_law'))) }),
]);

function has2(q: string, v: string) { return { q, op: 'has' as const, v }; }
