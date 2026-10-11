// Module V: childcare, support payments and adoption.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, rw, sin, info, O, yes, no, maybe, eq, isIn, has, any, all, answered } from '../dsl.ts';
import { RELATIONSHIPS } from '../opts.ts';

const CC_PROVIDER = O('individual|An individual (nanny, babysitter, relative paid)|Un particulier (nounou, gardienne, proche rémunéré)', 'daycare|A daycare or child care centre|Une garderie ou un centre de la petite enfance', 'camp|A day camp or sports school|Un camp de jour ou une école de sport', 'boarding|A boarding school, overnight camp or sports school|Un pensionnat, un camp de nuit ou une école de sport avec hébergement', 'agency|A nanny agency|Une agence de nounous', 'other|Other|Autre');
const CC_WHY = O('work|I was working|Je travaillais', 'business|I was running a business|J\'exploitais une entreprise', 'school|I was in school full time|J\'étais aux études à temps plein', 'schoolPart|I was in school part time|J\'étais aux études à temps partiel', 'research|I was doing research under a grant|Je faisais de la recherche en vertu d\'une subvention', 'other|Another reason|Autre raison');
const ADOPT = O('agency|Fees to an adoption agency|Frais à une agence d\'adoption', 'court|Court costs|Frais de justice', 'legal|Legal and administrative fees|Frais juridiques et administratifs', 'travel|Travel and lodging for the child and parents|Voyage et hébergement de l\'enfant et des parents', 'translation|Translation and document costs|Frais de traduction et de documents', 'medical|Mandatory medical examination|Examen médical obligatoire', 'immigration|Immigration and passport costs|Frais d\'immigration et de passeport', 'other|Other|Autres');

export const moduleV = M({
  code: 'V', name: 'CHILDCARE_SUPPORT', phase: 'deductions', icon: 'baby',
  title: ["Childcare, support payments and adoption", "Frais de garde, pensions alimentaires et adoption"],
  desc: ["Who looked after each child, what you paid, who can claim it, support payments made or received, and adoption costs.", "Qui gardait chaque enfant, ce que vous avez payé, qui peut le demander, les pensions alimentaires versées ou reçues et les frais d'adoption."],
  show: any(maybe('F.ded.childcare'), maybe('F.ded.supportPaid'), maybe('F.inc.support'), maybe('F.ded.adoption')),
  src: ['cra.childcare', 'cra.childcareWho'],
  cover: [
    { item: 'Childcare per child: provider and identifier, dates, purpose, payer, amounts, reimbursements, receipts', ref: '21400, T778', kind: 'client', qs: ['V.care.*'] },
    { item: 'Who may claim: spouse income and periods of study, incapacity, separation or other circumstances', ref: 'T778, who can claim', kind: 'client', qs: ['V.who.*'] },
    { item: 'Support payments made: agreement or order, effective dates, payer and recipient, child versus spousal amounts, arrears, reimbursements, legal fees', ref: '22000, 22100', kind: 'client', qs: ['V.paid.*'] },
    { item: 'Support payments received: agreement, dates, spousal versus child support, arrears, legal fees', ref: '12800', kind: 'client', qs: ['V.recv.*'] },
    { item: 'Adoption expenses: period, costs by category, reimbursements, other potential claimants, documents', ref: '31300', kind: 'client', qs: ['V.adopt.*'] },
  ],
}, [
  S('care', ["Childcare for a child", "Garde d'un enfant"], [
    tx('child', ["Child's name", "Nom de l'enfant"], { req: true, label: true }),
    sl('age', ["How old was the child on 31 December?", "Quel âge avait l'enfant au 31 décembre?"], { req: true, opts: O('under7|Under 7|Moins de 7 ans', '7to16|7 to 16|De 7 à 16 ans', 'dis|Any age, and has a severe disability|Tout âge, avec une déficience grave', 'over16|Over 16 and no disability|Plus de 16 ans, sans déficience'), review: [{ when: { q: '.age', op: 'eq', v: 'over16' }, sev: 'warning', title: ["Child over 16 without a disability: childcare is normally not deductible", "Enfant de plus de 16 ans sans déficience : les frais de garde ne sont normalement pas déductibles"] }] }),
    tx('provider', ["Who looked after the child (name of person or organization)?", "Qui a gardé l'enfant (nom de la personne ou de l'organisme)?"], { req: true }),
    sl('type', ["What kind of provider?", "Quel type de fournisseur?"], { opts: CC_PROVIDER, req: true }),
    tx('providerId', ["Provider's SIN (for an individual) or business number", "NAS du fournisseur (particulier) ou numéro d'entreprise"], { req: true, sens: 'protected', noUnsure: false, help: ["The CRA requires the SIN of an individual provider. If you do not have it, choose \"I will provide this later\" and we will help you ask for it.", "L'ARC exige le NAS d'un fournisseur qui est un particulier. Si vous ne l'avez pas, choisissez « Je le fournirai plus tard » et nous vous aiderons à le demander."] }),
    dt('from', ["Care began on", "La garde a commencé le"], { req: true }), dt('to', ["Care ended on", "La garde s'est terminée le"], { rules: [{ t: 'dateNotBefore', q: '.from' }] }),
    sl('why', ["Why did you need childcare?", "Pourquoi aviez-vous besoin de services de garde?"], { opts: CC_WHY, req: true }),
    cur('paid', ["Amount you paid", "Montant que vous avez payé"], { req: true, rules: [{ t: 'min', v: 0 }] }),
    cur('reimb', ["Amount reimbursed to you (by an employer, plan or subsidy)", "Montant qui vous a été remboursé (par un employeur, un régime ou une subvention)"], { rules: [{ t: 'lteQ', q: '.paid', msg: ["The reimbursement cannot be more than what you paid.", "Le remboursement ne peut pas dépasser ce que vous avez payé."] }] }),
    rd('payer', ["Who paid for it?", "Qui l'a payé?"], { opts: O('me|Me|Moi', 'spouse|My spouse or partner|Mon conjoint ou ma conjointe', 'both|Both of us|Nous deux', 'other|Someone else|Quelqu\'un d\'autre') }),
    num('weeks', ["Number of weeks, for boarding school or an overnight camp", "Nombre de semaines, pour un pensionnat ou un camp de nuit"], { show: eq('.type', 'boarding'), rules: [{ t: 'min', v: 0 }, { t: 'max', v: 52 }], unit: 'weeks' }),
    fl('receipt', ["Upload the receipts or the provider's summary.", "Téléversez les reçus ou le sommaire du fournisseur."], { req: true, docs: [{ key: 'CHILDCARE_RECEIPT', label: ["Childcare receipts", "Reçus de frais de garde"] }] }),
  ], { show: maybe('F.ded.childcare'), repeat: { label: ["Childcare", "Garde d'enfant"], add: ["Add more childcare", "Ajouter d'autres frais de garde"], min: 1 } }),
  S('who', ["Who can claim the childcare", "Qui peut demander les frais de garde"], [
    yn('together', ["Did you and your spouse or partner live together at the end of the year?", "Vous et votre conjoint viviez-vous ensemble à la fin de l'année?"], { req: true }),
    yn('apart', ["For a period, were you separated, or was one of you in school, ill, disabled or in prison?", "Pendant une période, étiez-vous séparés, ou l'un de vous était-il aux études, malade, invalide ou en prison?"], { show: maybe('.together'), help: ["These situations can allow the higher-income spouse to claim part of the cost. Tell us the dates below.", "Ces situations peuvent permettre au conjoint ayant le revenu le plus élevé de demander une partie des frais. Indiquez les dates ci-dessous."] }),
    ta('details', ["Which period, and what was the situation?", "Quelle période, et quelle était la situation?"], { show: maybe('.apart'), req: true }),
    cur('spouseIncome', ["Your spouse or partner's net income, if you know it", "Revenu net de votre conjoint, si vous le connaissez"], { show: maybe('.together'), help: ["Childcare is normally claimed by the spouse with the lower income. We work out who claims from both incomes.", "Les frais de garde sont normalement demandés par le conjoint dont le revenu est le plus bas. Nous déterminons qui les demande selon les deux revenus."] }),
    yn('shared', ["Does another person also pay for the same childcare (for example a separated parent)?", "Une autre personne paie-t-elle aussi les mêmes frais de garde (par exemple un parent séparé)?"], { review: [{ when: { q: '.shared', op: 'maybe' }, sev: 'warning', title: ["Same childcare paid by two people: avoid a duplicate claim", "Mêmes frais de garde payés par deux personnes : éviter une demande en double"] }] }),
  ], { show: maybe('F.ded.childcare') }),
  S('paid', ["Support payments you made", "Pensions alimentaires que vous avez versées"], [
    fl('agreement', ["Upload the separation agreement or court order.", "Téléversez l'entente de séparation ou l'ordonnance du tribunal."], { req: true, docs: [{ key: 'SUPPORT_ORDER', label: ["Support agreement or court order", "Entente de pension alimentaire ou ordonnance du tribunal"] }] }),
    dt('date', ["Date of the agreement or order", "Date de l'entente ou de l'ordonnance"], { req: true, review: [{ when: { q: '.date', op: 'answered' }, sev: 'info', title: ["Support agreement date decides whether child support is deductible", "La date de l'entente détermine si la pension alimentaire pour enfants est déductible"] }] }),
    tx('recipient', ["Who you paid (name)", "À qui vous avez payé (nom)"], { req: true, label: true }),
    sin('recipientSin', ["Their SIN", "Son NAS"], { sens: 'restricted', req: true }),
    cur('spousal', ["Spousal support paid in the year", "Pension alimentaire pour conjoint versée durant l'année"]),
    cur('child', ["Child support paid in the year", "Pension alimentaire pour enfants versée durant l'année"]),
    cur('arrears', ["Payments toward arrears from earlier years", "Paiements pour des arriérés d'années antérieures"]),
    yn('lump', ["Was any payment a lump sum, or a payment to someone other than the recipient (for example rent or school)?", "Un paiement était-il une somme forfaitaire, ou versé à une autre personne que le bénéficiaire (par exemple loyer ou école)?"]),
    cur('reimb', ["Amounts the recipient paid back to you", "Montants que le bénéficiaire vous a remboursés"]),
    cur('legal', ["Legal fees to get or change a support order", "Frais juridiques pour obtenir ou modifier une ordonnance de pension alimentaire"], { map: { form: 'T1', line: '22100', verified: true } }),
  ], { show: maybe('F.ded.supportPaid'), repeat: { label: ["Support recipient", "Bénéficiaire de la pension"], add: ["Add another recipient", "Ajouter un autre bénéficiaire"], min: 1 } }),
  S('recv', ["Support payments you received", "Pensions alimentaires que vous avez reçues"], [
    fl('agreement', ["Upload the agreement or court order.", "Téléversez l'entente ou l'ordonnance du tribunal."], { req: true, docs: [{ key: 'SUPPORT_ORDER_RECV', label: ["Support agreement or court order (received)", "Entente de pension alimentaire ou ordonnance du tribunal (reçue)"] }] }),
    dt('date', ["Date of the agreement or order", "Date de l'entente ou de l'ordonnance"], { req: true }),
    tx('payer', ["Who paid you (name)", "Qui vous a payé (nom)"], { req: true, label: true }),
    cur('spousal', ["Spousal support received in the year", "Pension alimentaire pour conjoint reçue durant l'année"]),
    cur('child', ["Child support received in the year", "Pension alimentaire pour enfants reçue durant l'année"]),
    cur('arrears', ["Arrears from earlier years received this year", "Arriérés d'années antérieures reçus cette année"]),
    cur('legal', ["Legal fees to collect support", "Frais juridiques pour percevoir la pension"]),
  ], { show: maybe('F.inc.support'), repeat: { label: ["Support payer", "Payeur de la pension"], add: ["Add another payer", "Ajouter un autre payeur"], min: 1 } }),
  S('adopt', ["Adoption", "Adoption"], [
    tx('child', ["Child's name", "Nom de l'enfant"], { req: true, label: true }),
    dt('from', ["Start of the adoption period (the earlier of the first application or court action)", "Début de la période d'adoption (la première des deux dates : demande ou action en justice)"], { req: true }),
    dt('final', ["Date the adoption was finalized, or the child began living with you", "Date de finalisation de l'adoption, ou date où l'enfant a commencé à vivre avec vous"], { req: true }),
    rw('costs', ["Costs paid", "Frais payés"], { req: true, cols: [{ id: 'cat', t: ["Category", "Catégorie"], type: 'select', opts: ADOPT }, { id: 'amount', t: ["Amount", "Montant"], type: 'currency' }, { id: 'year', t: ["Year paid", "Année du paiement"], type: 'text' }] }),
    cur('reimb', ["Amounts reimbursed or paid by someone else", "Montants remboursés ou payés par quelqu'un d'autre"]),
    yn('other', ["Could the other adoptive parent also claim some of these costs?", "L'autre parent adoptif pourrait-il aussi demander une partie de ces frais?"], { review: [{ when: { q: '.other', op: 'maybe' }, sev: 'warning', title: ["Adoption costs shared between parents: agree who claims what", "Frais d'adoption partagés entre les parents : convenir de qui demande quoi"] }] }),
    fl('docs', ["Upload invoices and the adoption order or agency letter.", "Téléversez les factures et l'ordonnance d'adoption ou la lettre de l'agence."], { req: true, docs: [{ key: 'ADOPTION_DOCS', label: ["Adoption invoices and order", "Factures d'adoption et ordonnance"] }] }),
  ], { show: maybe('F.ded.adoption'), repeat: { label: ["Adoption", "Adoption"], add: ["Add another adoption", "Ajouter une autre adoption"], min: 1 } }),
]);
