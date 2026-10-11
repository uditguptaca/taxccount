// Module U: employment expenses and occupation-specific deductions.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, rw, info, O, yes, no, maybe, eq, isIn, has, any, all, answered } from '../dsl.ts';

const EMP_EXP = O('supplies|Supplies you used up directly in your work|Fournitures que vous avez consommées directement dans votre travail', 'travel|Travel (not to your regular workplace)|Déplacements (autres que vers votre lieu de travail habituel)', 'parking|Parking|Stationnement', 'meals|Meals when travelling (full amount)|Repas en déplacement (montant total)', 'lodging|Lodging when travelling|Hébergement en déplacement', 'phone|Phone and internet required by the employer|Téléphone et Internet exigés par l\'employeur', 'advertising|Advertising and promotion|Publicité et promotion', 'assistant|Salary paid to an assistant or substitute|Salaire versé à un adjoint ou à un remplaçant', 'dues|Professional dues and licence fees|Cotisations professionnelles et frais de permis', 'tools|Tools and equipment required (see tradesperson)|Outils et équipement requis (voir gens de métier)', 'other|Other|Autres');

export const moduleU = M({
  code: 'U', name: 'EMPLOYMENT_EXPENSES', phase: 'deductions', icon: 'wrench',
  title: ["Employment expenses", "Dépenses d'emploi"],
  desc: ["Costs your employer required you to pay yourself, and extra rules for commission earners and certain occupations.", "Frais que votre employeur vous a obligé à payer vous-même, et règles supplémentaires pour les vendeurs à commission et certaines professions."],
  show: any(maybe('F.ded.employExpenses'), maybe('F.inc.employment')),
  src: ['cra.employExp', 'cra.homeOffice'],
  cover: [
    { item: 'Employer requirement to pay expenses; signed T2200 or TP-64.3', ref: 'T2200, TP-64.3', kind: 'documents', qs: ['U.req.*'] },
    { item: 'Expenses by employer and category; reimbursements; work arrangements; supplies, tools, travel', ref: '22900, T777', kind: 'client', qs: ['U.job.*'] },
    { item: 'Workspace in the home and vehicle expenses for employees', ref: 'T777 Parts 2 and 4', kind: 'derived', qs: ['U.job.usesHome', 'U.job.usesVehicle'], note: 'Collected once in the shared schedules (module L). The flat-rate home office method is shown only for tax years in which it existed.' },
    { item: 'Commission employees; transport employees; tradespersons; apprentice mechanics; artists; musicians; forestry workers; clergy', ref: 'T777, TL2, 21200, 23100, 22900', kind: 'client', qs: ['U.who.*', 'U.commission.*', 'U.transport.*', 'U.trades.*', 'U.apprentice.*', 'U.artist.*', 'U.musician.*', 'U.forestry.*', 'U.clergy.*'] },
    { item: 'GST/HST employee rebate', ref: 'GST370', kind: 'client', qs: ['U.job.gst'] },
  ],
}, [
  S('req', ["Your employer's requirement", "L'exigence de votre employeur"], [
    yn('required', ["Did an employer require you, in your contract of employment, to pay work costs yourself?", "Un employeur vous a-t-il obligé, selon votre contrat d'emploi, à payer vous-même des frais de travail?"], { req: true, help: ["For example working away from the employer's place, using your own vehicle, workspace, tools or supplies.", "Par exemple travailler hors de l'établissement de l'employeur, utiliser votre véhicule, votre espace de travail, vos outils ou vos fournitures."] }),
    yn('signed', ["Has your employer signed Form T2200 (or TP-64.3 in Quebec) for the year?", "Votre employeur a-t-il signé le formulaire T2200 (ou TP-64.3 au Québec) pour l'année?"], { show: maybe('.required'), req: true, review: [{ when: { q: '.signed', op: 'in', v: ['no', 'unsure'] }, sev: 'blocking', title: ["No signed T2200 or TP-64.3: employment expenses cannot be claimed without it", "Aucun T2200 ou TP-64.3 signé : les dépenses d'emploi ne peuvent pas être demandées sans ce formulaire"] }] }),
    fl('form', ["Upload the signed T2200 or TP-64.3.", "Téléversez le T2200 ou le TP-64.3 signé."], { show: yes('.signed'), docs: [{ key: 'T2200', label: ["Signed T2200 or TP-64.3", "T2200 ou TP-64.3 signé"] }] }),
  ], { show: maybe('F.ded.employExpenses') }),
  S('who', ["Your kind of work", "Votre genre de travail"], [
    mu('kinds', ["Do any of these describe your work?", "L'une de ces descriptions correspond-elle à votre travail?"], { opts: O('commission|Paid mainly by commission|Payé principalement à commission', 'transport|Long-haul truck driver or other transport employee|Camionneur long-courrier ou autre employé du transport', 'trades|Tradesperson who supplies their own tools|Gens de métier fournissant leurs propres outils', 'apprentice|Apprentice mechanic buying tools|Mécanicien apprenti achetant des outils', 'artist|Artist (musician, actor, writer, performer) who is an employee|Artiste (musicien, acteur, écrivain, interprète) qui est un employé', 'musician|Musician who is an employee and uses their own instrument|Musicien salarié qui utilise son propre instrument', 'forestry|Forestry worker (chainsaw, tree planter)|Travailleur forestier (scie à chaîne, planteur d\'arbres)', 'clergy|Member of the clergy|Membre du clergé', 'none|None of these|Aucune de ces descriptions'), req: true }),
  ], { show: maybe('F.ded.employExpenses') }),
  S('job', ["Expenses for an employer", "Dépenses pour un employeur"], [
    tx('employer', ["Employer", "Employeur"], { req: true, label: true }),
    rw('expenses', ["What you paid", "Ce que vous avez payé"], { req: true, cols: [{ id: 'cat', t: ["Category", "Catégorie"], type: 'select', opts: EMP_EXP }, { id: 'amount', t: ["Total paid", "Total payé"], type: 'currency' }, { id: 'reimb', t: ["Reimbursed by the employer", "Remboursé par l'employeur"], type: 'currency' }], help: ["Only costs the employer did not reimburse can be claimed. If a reimbursement was only for part, enter it so we can subtract it.", "Seuls les frais non remboursés par l'employeur peuvent être demandés. Si le remboursement ne couvrait qu'une partie, inscrivez-le pour que nous le soustrayions."], map: { form: 'T777', line: '22900', verified: true } }),
    yn('usesVehicle', ["Did you use your own vehicle for work (other than to travel to a regular workplace)?", "Avez-vous utilisé votre propre véhicule pour le travail (autrement que pour vous rendre à un lieu de travail habituel)?"], { help: ["Enter it once in the vehicle schedule.", "Saisissez-le une seule fois dans le tableau des véhicules."] }),
    yn('usesHome', ["Did you work from home because the employer required it?", "Avez-vous travaillé à domicile parce que l'employeur l'exigeait?"], { help: ["Enter it once in the workspace schedule. For 2023 and later only actual costs with a signed T2200 qualify.", "Saisissez-le une seule fois dans le tableau de l'espace de travail. Pour 2023 et après, seuls les frais réels avec un T2200 signé sont admissibles."] }),
    yn('flatRate', ["Do you want to use the temporary flat rate for working from home ($2 a day)?", "Voulez-vous utiliser le taux fixe temporaire pour le travail à domicile (2 $ par jour)?"], { years: [2020, 2022], help: ["This simplified method existed only for 2020, 2021 and 2022.", "Cette méthode simplifiée n'existait que pour 2020, 2021 et 2022."], src: ['cra.homeOffice'] }),
    num('flatDays', ["How many days did you work from home because of COVID-19?", "Combien de jours avez-vous travaillé à domicile en raison de la COVID-19?"], { show: yes('.flatRate'), years: [2020, 2022], rules: [{ t: 'min', v: 0 }, { t: 'max', v: 366 }] }),
    yn('gst', ["Did you pay GST or HST on any of these costs?", "Avez-vous payé de la TPS ou de la TVH sur certains de ces frais?"], { help: ["You may be able to get some of it back with Form GST370. If you are not sure, say so.", "Vous pourriez en récupérer une partie avec le formulaire GST370. En cas de doute, dites-le."], map: { form: 'GST370', verified: true } }),
    cur('gstAmount', ["How much GST or HST did you pay?", "Combien de TPS ou de TVH avez-vous payée?"], { show: maybe('.gst') }),
    fl('receipts', ["Upload your receipts or a summary.", "Téléversez vos reçus ou un sommaire."], { docs: [{ key: 'EMPLOYMENT_EXPENSE_RECEIPTS', label: ["Employment expense receipts or summary", "Reçus ou sommaire des dépenses d'emploi"] }] }),
  ], { show: yes('U.req.signed'), repeat: { label: ["Employer", "Employeur"], add: ["Add another employer", "Ajouter un autre employeur"], min: 1 } }),
  S('commission', ["Commission earnings", "Revenus de commission"], [
    cur('earned', ["Commissions you earned from the employer", "Commissions gagnées auprès de l'employeur"], { req: true }),
    yn('advances', ["Did you receive advances or draws against future commissions?", "Avez-vous reçu des avances ou des tirages sur commissions futures?"]),
    cur('travel', ["Travel, entertainment and promotion costs, if separate from the table above", "Frais de déplacement, de représentation et de promotion, s'ils sont distincts du tableau ci-dessus"]),
    cur('meals', ["Meals and entertainment (full amount)", "Repas et divertissements (montant total)"]),
    yn('contract', ["Is there a written contract that says you must pay these costs?", "Existe-t-il un contrat écrit stipulant que vous devez payer ces frais?"], { req: true }),
  ], { show: has2('U.who.kinds', 'commission') }),
  S('transport', ["Long-haul truck driver meals", "Repas des camionneurs longue distance"], [
    num('days', ["How many days or parts of days did you spend driving long distance outside your municipality?", "Combien de jours ou parties de jours avez-vous passés en conduite longue distance à l'extérieur de votre municipalité?"], { req: true, rules: [{ t: 'min', v: 0 }, { t: 'max', v: 366 }], unit: 'days' }),
    fl('tl2', ["Upload your signed TL2 or the employer's travel summary.", "Téléversez votre TL2 signé ou le sommaire de déplacements de l'employeur."], { docs: [{ key: 'TL2', label: ["Form TL2 (meals for long-haul truck drivers)", "Formulaire TL2 (repas des camionneurs longue distance)"] }] }),
  ], { show: has2('U.who.kinds', 'transport') }),
  S('trades', ["Tradesperson's tools", "Outils des gens de métier"], [
    cur('tools', ["Cost of new tools you bought for your job (over the employer's reimbursement)", "Coût des nouveaux outils achetés pour votre travail (après le remboursement de l'employeur)"], { req: true }),
    fl('cert', ["Upload the employer's certificate that the tools were required.", "Téléversez l'attestation de l'employeur indiquant que les outils étaient requis."], { docs: [{ key: 'TOOLS_CERT', label: ["Employer certificate that tools were required", "Attestation de l'employeur indiquant que les outils étaient requis"] }] }),
  ], { show: has2('U.who.kinds', 'trades') }),
  S('apprentice', ["Apprentice mechanic's tools", "Outils d'un mécanicien apprenti"], [
    cur('tools', ["Cost of tools bought in the year", "Coût des outils achetés durant l'année"], { req: true }),
    fl('cert', ["Upload the employer's certificate.", "Téléversez l'attestation de l'employeur."], { docs: [{ key: 'APPRENTICE_CERT', label: ["Employer certificate for apprentice mechanic tools", "Attestation de l'employeur pour les outils du mécanicien apprenti"] }] }),
  ], { show: has2('U.who.kinds', 'apprentice') }),
  S('artist', ["Employed artist", "Artiste salarié"], [
    cur('expenses', ["Expenses connected to your artistic work", "Dépenses liées à votre travail artistique"], { req: true }),
    cur('income', ["Income from that artistic work as an employee", "Revenu de ce travail artistique comme employé"]),
  ], { show: has2('U.who.kinds', 'artist') }),
  S('musician', ["Employed musician", "Musicien salarié"], [
    cur('instrument', ["Instrument costs, rental, insurance, repairs and supplies", "Coûts d'instrument, location, assurance, réparations et fournitures"], { req: true }),
    cur('capital', ["Capital cost of an instrument you bought", "Coût en capital d'un instrument acheté"]),
  ], { show: has2('U.who.kinds', 'musician') }),
  S('forestry', ["Forestry worker", "Travailleur forestier"], [
    cur('chainsaw', ["Cost of a chainsaw or tree planting equipment bought or used", "Coût d'une scie à chaîne ou d'équipement de plantation acheté ou utilisé"], { req: true }),
    cur('other', ["Other costs (fuel, protective gear, tools)", "Autres frais (carburant, équipement de protection, outils)"]),
  ], { show: has2('U.who.kinds', 'forestry') }),
  S('clergy', ["Clergy residence", "Résidence du clergé"], [
    cur('rent', ["Rent or cost of the home you lived in", "Loyer ou coût de la résidence où vous habitiez"], { req: true }),
    cur('provided', ["Value of housing provided to you by the church or religious body", "Valeur du logement fourni par l'église ou l'organisme religieux"]),
    fl('cert', ["Upload the statement from the religious body.", "Téléversez la déclaration de l'organisme religieux."], { docs: [{ key: 'CLERGY_STATEMENT', label: ["Statement from the religious body about housing", "Déclaration de l'organisme religieux sur le logement"] }] }),
  ], { show: has2('U.who.kinds', 'clergy') }),
]);
function has2(q: string, v: string) { return { q, op: 'has' as const, v }; }
