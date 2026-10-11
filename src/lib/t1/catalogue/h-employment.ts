// Module H: employment and other earned income. Asks only for what is NOT already on a slip.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, info, O, yes, no, maybe, eq, isIn, any, all, answered, rec } from '../dsl.ts';
import { COUNTRIES, CURRENCIES, PROVINCE_OPTS } from '../opts.ts';

const SLIP_STATE = O('received|I have the T4 or Relevé 1|J\'ai le T4 ou le relevé 1', 'missing|I have not received it yet|Je ne l\'ai pas encore reçu', 'amended|I received a corrected one|J\'ai reçu un feuillet corrigé', 'none|The employer does not give slips|L\'employeur ne remet pas de feuillet');

export const moduleH = M({
  code: 'H', name: 'EMPLOYMENT', phase: 'income', icon: 'briefcase',
  title: ["Employment income", "Revenu d'emploi"],
  desc: ["Each employer, and anything you earned from work that is not already on a slip.", "Chaque employeur, et tout ce que vous avez gagné de votre travail qui ne figure pas déjà sur un feuillet."],
  show: any(maybe('F.inc.employment'), maybe('F.inc.tips'), maybe('F.inc.noSlip')),
  src: ['cra.income'],
  cover: [
    { item: 'Employment income (T4 box 14): employer, dates, slips missing or amended', ref: '10100', kind: 'documents', qs: ['H.job.employer', 'H.job.slip', 'H.job.start', 'H.job.end'] },
    { item: 'Other employment income: tips, commissions, bonuses and pay not on a slip', ref: '10400', kind: 'client', qs: ['H.job.extra', 'H.tips.*', 'H.cash.*'] },
    { item: 'Foreign employment income and foreign tax withheld', ref: '10400, 40500', kind: 'client', qs: ['H.job.foreign', 'H.job.fCountry', 'H.job.fTax'] },
    { item: 'Stock options, share awards and employee share purchases (security options deductions 24900, 24901, T4 boxes 38 to 41)', ref: '24900, 24901', kind: 'client', qs: ['H.opt.*'] },
    { item: 'Taxable benefits needing clarification (box 40, 34, 36, 85)', kind: 'client', qs: ['H.job.benefits'] },
    { item: 'Wage-loss replacement plan payments and the employee\'s contributions', ref: '10400, 23200', kind: 'client', qs: ['H.job.wageLoss', 'H.job.wlAmount', 'H.job.wlContrib'] },
    { item: 'Profit sharing; severance and retiring allowances; legal fees to collect them', ref: '10400, 13000, 22100', kind: 'client', qs: ['H.job.profit', 'H.job.severance', 'H.job.legal'] },
    { item: 'Research grants and related expenses', ref: '10400, 22900', kind: 'client', qs: ['H.job.research', 'H.job.grant', 'H.job.grantExp'] },
    { item: 'Union and professional dues paid outside payroll', ref: '21200', kind: 'client', qs: ['H.job.dues'] },
    { item: 'Employment expenses and employer reimbursement', ref: '22900', kind: 'derived', qs: ['H.job.reimb'], note: 'The expense detail is collected in the employment expenses module.' },
  ],
}, [
  S('intro', ["How we ask about work", "Comment nous posons les questions sur le travail"], [
    info('read', ["Your T4 already shows your pay, tax and contributions, so we only ask about each job and about anything that is not on a slip.", "Votre T4 indique déjà votre rémunération, l'impôt et les cotisations : nous ne posons donc des questions que sur chaque emploi et sur ce qui ne figure pas sur un feuillet."]),
    num('count', ["How many different employers did you have during the year?", "Combien d'employeurs différents avez-vous eus durant l'année?"], { req: true, rules: [{ t: 'min', v: 0 }, { t: 'max', v: 40 }], help: ["Count each employer once, even if you worked for them in more than one period. Staffing agencies count as the employer on your slip.", "Comptez chaque employeur une seule fois, même si vous avez travaillé pour lui à plusieurs reprises. Une agence de placement compte comme l'employeur indiqué sur votre feuillet."], show: maybe('F.inc.employment') }),
  ]),
  S('job', ["An employer", "Un employeur"], [
    tx('employer', ["Employer's name", "Nom de l'employeur"], { req: true, label: true, noUnsure: true }),
    tx('city', ["Where did you work (city and province)?", "Où travailliez-vous (ville et province)?"], { req: true }),
    dt('start', ["Date you started (or 1 January if you were already working there)", "Date de début (ou le 1er janvier si vous y travailliez déjà)"], { req: true, rules: [{ t: 'dateInYear' }] }),
    dt('end', ["Date you stopped, if you did", "Date de fin, le cas échéant"], { rules: [{ t: 'dateNotBefore', q: '.start', msg: ["The end date is before the start date.", "La date de fin précède la date de début."] }] }),
    rd('slip', ["Do you have the T4 (or Relevé 1) from this employer?", "Avez-vous le T4 (ou le relevé 1) de cet employeur?"], { req: true, opts: SLIP_STATE, help: ["If you have not received it, your employer must give it to you by the end of February. We can also ask your CRA account for it if you authorize us.", "Votre employeur doit vous le remettre d'ici la fin de février. Nous pouvons aussi le demander à votre compte de l'ARC si vous nous y autorisez."], review: [{ when: { q: '.slip', op: 'in', v: ['missing', 'none'] }, sev: 'warning', title: ["Employment slip missing: request it or rely on pay stubs", "Feuillet d'emploi manquant : le demander ou se fier aux talons de paie"] }, { when: { q: '.slip', op: 'eq', v: 'amended' }, sev: 'warning', title: ["Corrected slip: use only the latest copy", "Feuillet corrigé : utiliser seulement la dernière copie"] }] }),
    fl('stub', ["Upload your last pay stub of the year from this employer.", "Téléversez votre dernier talon de paie de l'année de cet employeur."], { show: isIn('.slip', ['missing', 'none']), req: true, docs: [{ key: 'FINAL_PAYSTUB', label: ["Final pay stub of the year", "Dernier talon de paie de l'année"] }], help: ["It shows the year-to-date pay, tax, CPP and EI we can use to prepare the return.", "Il indique la rémunération, l'impôt, le RPC et l'AE cumulés dont nous avons besoin pour préparer la déclaration."] }),
    cur('extra', ["Pay from this employer that is NOT on the slip (commissions, bonuses, tips, cash)", "Rémunération de cet employeur qui ne figure PAS sur le feuillet (commissions, bonus, pourboires, espèces)"], { help: ["Leave blank if everything is on the slip. Do not repeat amounts already on the T4.", "Laissez vide si tout figure sur le feuillet. Ne répétez pas les montants déjà inscrits sur le T4."], map: { form: 'T1', line: '10400', verified: true } }),
    yn('foreign', ["Did this employer pay you for work done outside Canada, or was it a foreign employer?", "Cet employeur vous a-t-il payé pour du travail fait à l'extérieur du Canada, ou était-il étranger?"]),
    sl('fCountry', ["Country", "Pays"], { show: maybe('.foreign'), opts: COUNTRIES, req: true }),
    cur('fAmount', ["Foreign pay received, in the currency you were paid", "Rémunération étrangère reçue, dans la devise où vous avez été payé"], { show: maybe('.foreign') }),
    sl('fCurrency', ["Currency", "Devise"], { show: maybe('.foreign'), opts: CURRENCIES }),
    cur('fTax', ["Tax withheld in that country", "Impôt retenu dans ce pays"], { show: maybe('.foreign'), map: { form: 'T2209', verified: true } }),
    ta('benefits', ["Is there a benefit from this employer you are unsure how to report?", "Y a-t-il un avantage de cet employeur dont vous ne savez pas comment faire la déclaration?"], { help: ["Examples: a company car, a loan, board and lodging, a gift card, a phone plan, a gym membership, or a trip. Say what it was and roughly what it was worth.", "Exemples : une voiture de société, un prêt, le logement et les repas, une carte-cadeau, un forfait téléphonique, un abonnement de gym ou un voyage. Dites ce que c'était et sa valeur approximative."] }),
    yn('wageLoss', ["Did you get payments from a wage-loss or disability insurance plan through this employer?", "Avez-vous reçu des paiements d'un régime d'assurance salaire ou d'invalidité par l'intermédiaire de cet employeur?"]),
    cur('wlAmount', ["Total received in the year", "Total reçu durant l'année"], { show: maybe('.wageLoss') }),
    cur('wlContrib', ["Premiums or contributions you paid into that plan since 1968", "Primes ou cotisations que vous avez versées à ce régime depuis 1968"], { show: maybe('.wageLoss'), help: ["The employer or insurer can tell you. They can reduce the taxable amount.", "L'employeur ou l'assureur peut vous le dire. Elles peuvent réduire le montant imposable."] }),
    yn('profit', ["Did you receive a share of the profits or an employee profit-sharing payment?", "Avez-vous reçu une part des bénéfices ou un paiement d'un régime de participation aux bénéfices?"]),
    yn('severance', ["Did you receive severance, a retiring allowance or termination pay?", "Avez-vous reçu une indemnité de départ, une allocation de retraite ou une indemnité de cessation d'emploi?"], { review: [{ when: { q: '.severance', op: 'maybe' }, sev: 'warning', title: ["Severance or retiring allowance: check transfer to an RRSP and whether a legal settlement is involved", "Indemnité de départ ou allocation de retraite : vérifier le transfert à un REER et s'il y a un règlement judiciaire"] }] }),
    cur('sevAmount', ["Amount", "Montant"], { show: maybe('.severance') }),
    cur('legal', ["Legal fees you paid to collect it or to settle a dispute with the employer", "Frais juridiques payés pour l'obtenir ou pour régler un différend avec l'employeur"], { show: maybe('.severance'), map: { form: 'T1', line: '23200', verified: true } }),
    fl('sevDoc', ["Upload the severance letter or settlement.", "Téléversez la lettre d'indemnité de départ ou l'entente de règlement."], { show: maybe('.severance'), docs: [{ key: 'SEVERANCE_DOC', label: ["Severance letter or settlement", "Lettre d'indemnité de départ ou entente de règlement"], optional: true }] }),
    yn('research', ["Were you paid a research grant, and did you pay related costs?", "Avez-vous reçu une subvention de recherche et payé des frais connexes?"]),
    cur('grant', ["Grant received", "Subvention reçue"], { show: maybe('.research') }),
    cur('grantExp', ["Related expenses you paid", "Frais connexes que vous avez payés"], { show: maybe('.research') }),
    cur('dues', ["Union or professional dues you paid yourself, outside payroll", "Cotisations syndicales ou professionnelles payées par vous-même, hors paie"], { map: { form: 'T1', line: '21200', verified: true }, help: ["Do not include dues already on the T4 (box 44).", "N'incluez pas les cotisations déjà inscrites sur le T4 (case 44)."] }),
    rd('reimb', ["Did this employer reimburse your work costs?", "Cet employeur a-t-il remboursé vos frais de travail?"], { opts: O('none|No reimbursement|Aucun remboursement', 'some|Some of them|Une partie', 'all|All of them|La totalité', 'allowance|A fixed allowance|Une allocation fixe', 'na|I had no work costs|Je n\'avais pas de frais de travail'), help: ["We ask about the expenses themselves in the employment expenses section.", "Nous posons des questions sur les frais eux-mêmes dans la section sur les dépenses d'emploi."] }),
  ], { show: maybe('F.inc.employment'), repeat: { label: ["Employer", "Employeur"], add: ["Add another employer", "Ajouter un autre employeur"], min: 1 } }),
  S('opt', ["Stock options, share awards and employee share purchases", "Options d'achat d'actions, attributions d'actions et achats d'actions par les employés"], [
    yn('any', ["Did you receive, exercise or sell stock options, share units, or shares bought through an employee plan?", "Avez-vous reçu, exercé ou vendu des options d'achat d'actions, des unités d'actions, ou des actions achetées dans le cadre d'un régime d'employés?"], { req: true, review: [{ when: { q: '.any', op: 'maybe' }, sev: 'specialist', specialist: 'Equity compensation', title: ["Equity compensation: benefit timing, deduction and sales need review", "Rémunération en actions : l'avantage, la déduction et les ventes doivent être examinés"] }] }),
  ], { show: any(maybe('F.inc.employment'), maybe('F.inc.sales')) }),
  S('award', ["An equity award", "Une attribution d'actions"], [
    tx('company', ["Company", "Société"], { req: true, label: true }),
    rd('kind', ["What kind of award?", "Quel type d'attribution?"], { opts: O('option|Stock option|Option d\'achat d\'actions', 'rsu|Restricted share or deferred share units|Unités d\'actions restreintes ou différées', 'espp|Employee share purchase plan|Régime d\'achat d\'actions pour employés', 'shares|Shares given or sold to me cheaply|Actions données ou vendues à prix réduit', 'other|Something else|Autre'), req: true }),
    dt('grant', ["Date granted", "Date d'attribution"]), dt('event', ["Date you exercised, received or sold", "Date de l'exercice, de la réception ou de la vente"], { rules: [{ t: 'dateInYear' }] }),
    num('shares', ["Number of shares or units", "Nombre d'actions ou d'unités"]), cur('price', ["Price you paid per share", "Prix payé par action"]), cur('fmv', ["Market value per share on the event date", "Valeur marchande par action à la date de l'événement"]),
    sl('currency', ["Currency", "Devise"], { opts: CURRENCIES }),
    yn('onT4', ["Is the benefit already on your T4 (boxes 38, 39, 41) or Relevé 1?", "L'avantage figure-t-il déjà sur votre T4 (cases 38, 39, 41) ou relevé 1?"]),
    yn('sold', ["Did you sell any of the shares you received?", "Avez-vous vendu des actions reçues?"], { help: ["A sale gets reported in the capital gains section as well.", "Une vente est aussi déclarée dans la section sur les gains en capital."] }),
    fl('doc', ["Upload the grant, exercise or broker statement.", "Téléversez la convention d'attribution, le relevé d'exercice ou celui du courtier."], { docs: [{ key: 'EQUITY_STATEMENT', label: ["Equity award, exercise or broker statement", "Convention d'attribution, relevé d'exercice ou relevé du courtier"] }] }),
  ], { show: maybe('H.opt.any'), repeat: { label: ["Award", "Attribution"], add: ["Add another award or plan", "Ajouter une autre attribution ou un autre régime"], min: 1 } }),
  S('tips', ["Tips and gratuities", "Pourboires et gratifications"], [
    cur('total', ["Total tips you received that are not on a slip", "Total des pourboires reçus qui ne figurent pas sur un feuillet"], { req: true, help: ["Include cash tips and tips paid through your pay or by card that your employer did not report on the T4.", "Incluez les pourboires en espèces et ceux versés par la paie ou par carte que l'employeur n'a pas déclarés sur le T4."], map: { form: 'T1', line: '10400', verified: true } }),
    cur('tipOut', ["Tips you had to share with others (tip-out)", "Pourboires que vous avez dû partager avec d'autres"]),
    rd('record', ["How do you keep track of your tips?", "Comment tenez-vous le compte de vos pourboires?"], { opts: O('log|A written or app log|Un registre écrit ou une application', 'receipts|Card and sales slips|Les reçus de cartes et de ventes', 'estimate|I estimate|J\'estime', 'none|I do not keep track|Je n\'en tiens pas compte'), review: [{ when: { q: '.record', op: 'in', v: ['estimate', 'none'] }, sev: 'warning', title: ["Tips are estimated: ask for supporting records or note the basis", "Pourboires estimés : demander des pièces justificatives ou noter la base"] }] }),
  ], { show: maybe('F.inc.tips') }),
  S('cash', ["Cash or informal pay", "Paie en espèces ou informelle"], [
    cur('total', ["Total received", "Total reçu"], { req: true }),
    ta('who', ["Who paid you, for what work and when?", "Qui vous a payé, pour quel travail et quand?"], { req: true }),
    yn('employee', ["Were you told what to do and when, using the payer's tools or premises (like an employee)?", "Deviez-vous suivre les directives du payeur et utiliser ses outils ou ses locaux (comme un employé)?"], { help: ["This helps us decide whether it is employment or self-employment. You do not need to decide.", "Cela nous aide à déterminer s'il s'agit d'emploi ou de travail autonome. Vous n'avez pas à en décider."], review: [{ when: { q: '.employee', op: 'maybe' }, sev: 'warning', title: ["Possible employment vs self-employment question", "Question possible : emploi ou travail autonome"] }] }),
    fl('proof', ["Upload anything that shows the payments.", "Téléversez tout ce qui montre les paiements."], { docs: [{ key: 'CASH_PROOF', label: ["Proof of cash or informal pay", "Preuve de la paie en espèces ou informelle"], optional: true }] }),
  ], { show: maybe('F.inc.noSlip') }),
]);
