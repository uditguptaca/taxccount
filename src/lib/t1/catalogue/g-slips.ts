// Module G: tax slips. Box numbers and names below were read from the CRA's "understand your tax slips"
// pages on 2026-10-11 for the 2025 tax year (source ids cra.slips.*). Where the official page was not
// available the slip is captured box-by-box as PRINTED (box number plus amount) instead of from memory.
// No extraction is pretended: the client uploads the slip, types the figures, and the preparer checks them.
import { M, S, tx, cur, dt, num, yn, rd, sl, mu, fl, rw, info, O, yes, no, maybe, eq, isIn, any, all, answered, prov } from '../dsl.ts';
import type { QDraft, SectionDraft } from '../dsl.ts';
import type { Cond, Col, Option, L } from '../types.ts';
import { DOC_STATUS, PROVINCE_OPTS } from '../opts.ts';

type Box = [box: string, en: string, fr: string, kind?: 'cur' | 'text' | 'num' | 'date' | { opts: Option[] } | { multi: Option[] }, line?: string];

const OTHER_COLS: Col[] = [
  { id: 'box', t: ["Box or code", "Case ou code"], type: 'text' },
  { id: 'what', t: ["What it says", "Ce qu'il indique"], type: 'text' },
  { id: 'amount', t: ["Amount", "Montant"], type: 'currency' },
];

function slip(local: string, code: string, en: string, fr: string, show: Cond, boxes: Box[], opts: { issuer?: L; hasOther?: boolean; other?: L; note?: L; years?: [number | null, number | null]; ownerWho?: boolean } = {}): SectionDraft {
  const qs: QDraft[] = [
    fl('file', [`Upload your ${code}`, `Téléversez votre ${code}`], { docs: [{ key: code, label: [`${code}: ${en}`, `${code} : ${fr}`] }], help: ["A clear photo or PDF of the whole slip. If you do not have it yet, choose \"I will provide this later\".", "Une photo claire ou un PDF du feuillet complet. Si vous ne l'avez pas encore, choisissez « Je le fournirai plus tard »."] }),
    tx('issuer', opts.issuer ?? ["Who issued it?", "Qui l'a émis?"], { req: true, label: true, noUnsure: true }),
    tx('recipient', ["Name printed on the slip", "Nom figurant sur le feuillet"], { help: ["We compare it with your legal name to catch a slip that belongs to someone else.", "Nous le comparons à votre nom légal pour repérer un feuillet appartenant à quelqu'un d'autre."], noUnsure: true }),
    tx('year', ["Year printed on the slip", "Année figurant sur le feuillet"], { req: true, noUnsure: true, rules: [{ t: 'pattern', v: '^(19|20)\\d{2}$', msg: ["Enter a four-digit year.", "Entrez une année à quatre chiffres."] }], help: ["It should match the tax year being prepared.", "Elle devrait correspondre à l'année d'imposition préparée."] }),
    rd('status', ["Is this the original, or a corrected copy?", "S'agit-il de l'original ou d'une copie corrigée?"], { opts: DOC_STATUS, req: true, noUnsure: true, help: ["Choose \"Amended\" for a corrected slip, \"Cancelled\" if the issuer told you to ignore an earlier one, and \"Replaced\" if a new slip replaces it.", "Choisissez « Modifié » pour un feuillet corrigé, « Annulé » si l'émetteur a demandé d'ignorer un feuillet antérieur, et « Remplacé » si un nouveau feuillet le remplace."], review: [{ when: { q: '.status', op: 'in', v: ['amended', 'cancelled', 'replaced'] }, sev: 'warning', title: [`${code} is not an original: confirm which copy to use`, `${code} n'est pas un original : confirmer quelle copie utiliser`] }] }),
  ];
  for (const [b, bEn, bFr, kind, line] of boxes) {
    const t: L = [`Box ${b}: ${bEn}`, `Case ${b} : ${bFr}`];
    const extra = { map: { form: code, box: b, line, verified: true } as const, src: [`cra.slips.${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`] };
    if (kind === 'text') qs.push(tx(`b${b}`, t, extra));
    else if (kind === 'num') qs.push(num(`b${b}`, t, extra));
    else if (kind === 'date') qs.push(dt(`b${b}`, t, extra));
    else if (kind && typeof kind === 'object' && 'opts' in kind) qs.push(sl(`b${b}`, t, { ...extra, opts: kind.opts }));
    else if (kind && typeof kind === 'object' && 'multi' in kind) qs.push(mu(`b${b}`, t, { ...extra, opts: kind.multi }));
    else qs.push(cur(`b${b}`, t, extra));
  }
  if (opts.hasOther !== false) qs.push(rw('other', opts.other ?? ["Other boxes with an amount, exactly as printed", "Autres cases comportant un montant, exactement comme imprimées"], { cols: OTHER_COLS, help: ["Add one row for every other box or code on the slip that has an amount. Copy the box number or code as it is printed.", "Ajoutez une ligne pour chaque autre case ou code du feuillet comportant un montant. Copiez le numéro de case ou le code tel qu'imprimé."] }));
  return S(local, [`${code}: ${en}`, `${code} : ${fr}`], qs, { show, repeat: { label: [code, code], add: [`Add another ${code}`, `Ajouter un autre ${code}`], min: 1 }, desc: opts.note });
}

const T4_EXEMPT = O('cpp|CPP or QPP|RPC ou RRQ', 'ei|EI|AE', 'ppip|PPIP|RPAP');
const T4_DENTAL = O('1|1: No access to dental coverage|1 : Aucun accès aux soins dentaires', '2|2: Access to dental coverage, you only|2 : Accès aux soins dentaires, vous seulement', '3|3: Access for you and family members|3 : Accès pour vous et les membres de votre famille', '4|4: Access for you and your spouse|4 : Accès pour vous et votre conjoint', '5|5: Access for you and your dependent children|5 : Accès pour vous et vos enfants à charge');

const emp = any(maybe('F.inc.employment'), maybe('F.inc.tips'));
const t4aGate = any(maybe('F.inc.pension'), maybe('F.inc.unusual'), maybe('F.inc.studentFunding'), maybe('F.inc.selfEmp'), maybe('F.inc.noSlip'), maybe('F.inc.benefits'));
const benefits = maybe('F.inc.benefits');
const invest = any(maybe('F.inc.interest'), maybe('F.inc.dividends'));
const qc = prov('QC');

export const moduleG = M({
  code: 'G', name: 'TAX_SLIPS', phase: 'income', icon: 'file-text',
  title: ["Tax slips", "Feuillets fiscaux"],
  desc: ["Enter the figures from each slip you received and upload a copy. We keep the original upload and check the figures you type.", "Saisissez les chiffres de chaque feuillet reçu et téléversez-en une copie. Nous conservons le fichier original et vérifions les chiffres saisis."],
  show: any(emp, t4aGate, invest, maybe('F.inc.trust'), maybe('F.inc.sales'), maybe('F.ded.education'), maybe('F.ded.fhsa'), maybe('C.life.left'), maybe('F.inc.foreign'), qc),
  src: ['cra.income', 'cra.autofill'],
  cover: [
    { item: 'T4 Statement of Remuneration Paid: boxes 14, 16, 16A, 17, 17A, 18, 20, 22, 24, 26, 44, 45, 46, 52, 55, 56 and other information codes 30 to 88', ref: 'lines 10100, 22215, 31200, 43700', kind: 'client', qs: ['G.t4.*'] },
    { item: 'T4A Statement of Pension, Retirement, Annuity and Other Income: boxes 016 to 211', ref: 'lines 10400, 11500, 13000, 13010, 13499-14300', kind: 'client', qs: ['G.t4a.*'] },
    { item: 'T4A(P) CPP/QPP benefits: boxes 13 to 23', ref: '11400, 11410', kind: 'client', qs: ['G.t4ap.*'] },
    { item: 'T4A(OAS) Old Age Security: boxes 18 to 23', ref: '11300, 14600', kind: 'client', qs: ['G.t4aoas.*'] },
    { item: 'T4E Employment Insurance and other benefits: boxes 7 to 37', ref: '11900, 11905', kind: 'client', qs: ['G.t4e.*'] },
    { item: 'T4RSP and T4RIF registered plan income; T4FHSA', ref: '12900, 11500', kind: 'client', qs: ['G.t4rsp.*', 'G.t4rif.*', 'G.t4fhsa.*'] },
    { item: 'T3 trust, T5 investment income, T5007 benefits, T5008 securities, T5013 partnership', ref: '12000-12200, 12700, 14400, 14500', kind: 'client', qs: ['G.t3.*', 'G.t5.*', 'G.t5007.*', 'G.t5008.*', 'G.t5013.*'] },
    { item: 'T2202 tuition and enrolment certificate', ref: '32300', kind: 'client', qs: ['G.t2202.*'] },
    { item: 'NR4 non-resident slip', kind: 'client', qs: ['G.nr4.*'] },
    { item: 'Québec RL slips: RL-1, RL-2, RL-3, RL-8, RL-15, RL-24, RL-31', ref: 'TP-1', kind: 'client', qs: ['G.rl1.*', 'G.rl2.*', 'G.rl3.*', 'G.rl8.*', 'G.rl15.*', 'G.rl24.*', 'G.rl31.*'], note: 'Box letters for Québec slips are captured as printed; the Québec box list must be reviewed against the year\'s Revenu Québec slip guides.' },
    { item: 'T5018, T4PS, T5006, T1204, RC62 and any other slip', kind: 'client', qs: ['G.other.*', 'F.extra.*'] },
    { item: 'Duplicate, amended, cancelled and replaced slips; slip versus manual entry', kind: 'derived', qs: ['G.t4.status', 'G.t4a.status'], note: 'Checked in the review step: same issuer, year and amounts entered twice are flagged and never added twice.' },
  ],
}, [
  S('intro', ["Before you start", "Avant de commencer"], [
    info('read', ["For each slip, type the figures exactly as printed. We do not read your upload automatically, so your typing is what the preparer will check against the file. A slip that has been corrected or cancelled must be marked that way so the same income is not counted twice.", "Pour chaque feuillet, saisissez les chiffres tels qu'imprimés. Nous ne lisons pas automatiquement votre fichier : la personne qui prépare votre déclaration vérifiera votre saisie en la comparant au fichier. Un feuillet corrigé ou annulé doit être indiqué comme tel pour que le même revenu ne soit pas compté deux fois."]),
    yn('autofill', ["Would you like us to look up your slips in your CRA account?", "Souhaitez-vous que nous recherchions vos feuillets dans votre compte de l'ARC?"], { noUnsure: true, help: ["This only works if you have authorized us in your CRA account. It never replaces your own slips: the CRA list may not include income that was not reported to it. Your answer is only a note for your preparer.", "Cela ne fonctionne que si vous nous avez autorisés dans votre compte de l'ARC. Cela ne remplace jamais vos propres feuillets : la liste de l'ARC peut ne pas inclure un revenu qui ne lui a pas été déclaré. Votre réponse n'est qu'une note pour votre préparateur."], src: ['cra.autofill'] }),
  ]),
  slip('t4', 'T4', 'Statement of Remuneration Paid', 'État de la rémunération payée', emp, [
    ['10', 'Province of employment', 'Province d\'emploi', { opts: PROVINCE_OPTS }],
    ['14', 'Employment income', 'Revenus d\'emploi', 'cur', '10100'],
    ['16', 'Employee\'s CPP contributions', 'Cotisations de l\'employé au RPC', 'cur'],
    ['16A', 'Employee\'s second additional CPP contributions', 'Deuxièmes cotisations supplémentaires de l\'employé au RPC', 'cur'],
    ['17', 'Employee\'s QPP contributions', 'Cotisations de l\'employé au RRQ', 'cur'],
    ['17A', 'Employee\'s second additional QPP contributions', 'Deuxièmes cotisations supplémentaires de l\'employé au RRQ', 'cur'],
    ['18', 'Employee\'s EI premiums', 'Cotisations de l\'employé à l\'AE', 'cur', '31200'],
    ['20', 'RPP contributions', 'Cotisations à un RPA', 'cur', '20700'],
    ['22', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'],
    ['24', 'EI insurable earnings', 'Gains assurables d\'AE', 'cur'],
    ['26', 'CPP/QPP pensionable earnings', 'Gains ouvrant droit à pension du RPC/RRQ', 'cur'],
    ['28', 'Exempt (CPP/QPP, EI, PPIP)', 'Exemption (RPC/RRQ, AE, RPAP)', { multi: T4_EXEMPT }],
    ['44', 'Union dues', 'Cotisations syndicales', 'cur', '21200'],
    ['45', 'Employer-offered dental benefits', 'Régimes de soins dentaires offerts par l\'employeur', { opts: T4_DENTAL }],
    ['46', 'Charitable donations', 'Dons de bienfaisance', 'cur'],
    ['52', 'Pension adjustment', 'Facteur d\'équivalence', 'cur', '20600'],
    ['55', 'Employee\'s PPIP premiums', 'Cotisations de l\'employé au RPAP', 'cur'],
    ['56', 'PPIP insurable earnings', 'Gains assurables du RPAP', 'cur'],
    ['30', 'Board and lodging', 'Logement et pension', 'cur'], ['31', 'Special work site', 'Chantier particulier', 'cur'], ['32', 'Travel in a prescribed zone', 'Voyages dans une zone visée par règlement', 'cur'],
    ['33', 'Medical travel assistance', 'Aide aux déplacements pour soins médicaux', 'cur'], ['34', 'Personal use of employer\'s automobile or motor vehicle', 'Usage personnel de l\'automobile ou du véhicule à moteur de l\'employeur', 'cur'],
    ['36', 'Interest-free and low-interest loans', 'Prêts sans intérêt ou à faible intérêt', 'cur'], ['38', 'Security options benefits', 'Avantages liés aux options d\'achat de titres', 'cur'],
    ['39', 'Security options deduction 110(1)(d)', 'Déduction pour options d\'achat de titres 110(1)d)', 'cur'], ['40', 'Other taxable allowances and benefits', 'Autres allocations et avantages imposables', 'cur'],
    ['41', 'Security options deduction 110(1)(d.1)', 'Déduction pour options d\'achat de titres 110(1)d.1)', 'cur'], ['42', 'Employment commissions', 'Commissions d\'emploi', 'cur'],
    ['43', 'Canadian Armed Forces personnel and police deduction', 'Déduction pour le personnel des Forces armées canadiennes et les policiers', 'cur'],
    ['66', 'Eligible retiring allowances', 'Allocations de retraite admissibles', 'cur'], ['67', 'Non-eligible retiring allowances', 'Allocations de retraite non admissibles', 'cur'],
    ['69', 'Indian Act (exempt income): non-eligible retiring allowances', 'Loi sur les Indiens (revenu exonéré) : allocations de retraite non admissibles', 'cur'], ['71', 'Indian Act (exempt income): employment', 'Loi sur les Indiens (revenu exonéré) : emploi', 'cur'],
    ['74', 'Past service contributions for 1989 or earlier years while a contributor', 'Cotisations pour services passés en 1989 ou avant, à titre de cotisant', 'cur'], ['75', 'Past service contributions for 1989 or earlier years while not a contributor', 'Cotisations pour services passés en 1989 ou avant, à titre de non-cotisant', 'cur'],
    ['77', 'Workers\' compensation benefits repaid to the employer', 'Indemnités pour accident du travail remboursées à l\'employeur', 'cur'], ['78', 'Fishers: gross income', 'Pêcheurs : revenu brut', 'cur'], ['79', 'Fishers: net partnership amount', 'Pêcheurs : montant net de société de personnes', 'cur'],
    ['80', 'Fishers: shareperson amount', 'Pêcheurs : montant de l\'équipier', 'cur'], ['81', 'Placement or employment agency workers: gross income', 'Travailleurs d\'une agence de placement : revenu brut', 'cur'],
    ['82', 'Taxi drivers and drivers of other passenger-carrying vehicles: gross income', 'Chauffeurs de taxi et de véhicules de transport de passagers : revenu brut', 'cur'], ['83', 'Barbers or hairdressers: gross income', 'Barbiers ou coiffeurs : revenu brut', 'cur'],
    ['85', 'Employee-paid premiums for private health services plans', 'Primes de régimes privés de services de santé payées par l\'employé', 'cur'], ['87', 'Emergency services volunteer exempt amount', 'Montant exonéré des volontaires des services d\'urgence', 'cur'], ['88', 'Indian Act (exempt income): self-employment', 'Loi sur les Indiens (revenu exonéré) : travail autonome', 'cur'],
  ], { issuer: ["Employer's name", "Nom de l'employeur"], hasOther: true, other: ["Any other box or code with an amount that is not listed above", "Toute autre case ou code comportant un montant et qui ne figure pas ci-dessus"] }),
  slip('t4a', 'T4A', 'Statement of Pension, Retirement, Annuity, and Other Income', 'État du revenu de pension, de retraite, de rente et autres revenus', t4aGate, [
    ['016', 'Pension or superannuation', 'Pensions ou superannuation', 'cur', '11500'], ['018', 'Lump-sum payments', 'Paiements forfaitaires', 'cur', '13000'], ['020', 'Self-employed commissions', 'Commissions d\'un travailleur autonome', 'cur'],
    ['022', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'], ['024', 'Annuities', 'Rentes', 'cur', '11500'], ['028', 'Other income', 'Autres revenus', 'cur', '13000'],
    ['030', 'Patronage allocations', 'Répartitions selon l\'apport commercial', 'cur'], ['032', 'Registered pension plan contributions (past service)', 'Cotisations à un régime de pension agréé (services passés)', 'cur', '20700'], ['034', 'Pension adjustment', 'Facteur d\'équivalence', 'cur', '20600'],
    ['040', 'RESP accumulated income payments', 'Paiements de revenu accumulé d\'un REEE', 'cur'], ['042', 'RESP educational assistance payments', 'Paiements d\'aide aux études d\'un REEE', 'cur'], ['046', 'Charitable donations', 'Dons de bienfaisance', 'cur'],
    ['048', 'Fees for services', 'Honoraires ou autres sommes pour services rendus', 'cur'], ['104', 'Research grants', 'Subventions de recherche', 'cur', '10400'], ['105', 'Scholarships, fellowships, bursaries and artists\' project grants', 'Bourses d\'études, bourses de perfectionnement, bourses d\'entretien et subventions à des artistes', 'cur', '13010'],
    ['106', 'Death benefits', 'Prestations consécutives au décès', 'cur'], ['107', 'Payments from a wage-loss replacement plan', 'Paiements d\'un régime de remplacement de la perte de salaire', 'cur', '10400'], ['109', 'Periodic payments from an unregistered plan', 'Paiements périodiques d\'un régime non enregistré', 'cur'],
    ['117', 'Loan benefits', 'Avantages relatifs à un prêt', 'cur'], ['118', 'Medical premium benefits', 'Avantages relatifs aux primes d\'assurance médicale', 'cur'], ['119', 'Premiums paid to a group term life insurance plan', 'Primes versées à un régime d\'assurance-vie collective temporaire', 'cur'],
    ['123', 'Payments from a revoked DPSP', 'Paiements d\'un RPDB révoqué', 'cur'], ['125', 'Disability benefits paid out of a superannuation or pension plan', 'Prestations d\'invalidité d\'un régime de pension', 'cur'], ['127', 'Veterans\' benefits', 'Prestations d\'ancien combattant', 'cur'],
    ['129', 'Tax deferred cooperative share', 'Parts de coopérative à impôt différé', 'cur'], ['130', 'Apprenticeship incentive grant or Apprenticeship completion grant', 'Subvention incitative aux apprentis ou subvention à l\'achèvement de la formation d\'apprenti', 'cur'],
    ['131', 'Registered disability savings plan', 'Régime enregistré d\'épargne-invalidité', 'cur', '12500'], ['132', 'Wage Earner Protection Program', 'Programme de protection des salariés', 'cur'], ['133', 'Variable pension benefits', 'Prestations de retraite à cotisations variables', 'cur'],
    ['134', 'TFSA taxable amount or taxable FHSA amount for a qualified donee', 'Montant imposable d\'un CELI ou d\'un CELIAPP pour un donataire reconnu', 'cur'], ['135', 'Recipient-paid premiums for private health services plans', 'Primes de régimes privés de services de santé payées par le bénéficiaire', 'cur', '33099'],
    ['150', 'Labour Adjustment Benefits Act and Appropriation Acts', 'Loi sur les prestations d\'adaptation pour les travailleurs et lois portant affectation de crédits', 'cur'], ['152', 'SUBP qualified under the Income Tax Act', 'Régime de prestations supplémentaires de chômage', 'cur'],
    ['154', 'Cash award or prize from payer', 'Prix en espèces ou récompense du payeur', 'cur'], ['156', 'Bankruptcy settlement', 'Règlement de faillite', 'cur'], ['194', 'PRPP payments', 'Paiements d\'un RPAC', 'cur'], ['196', 'Tuition assistance for adult basic education', 'Aide pour les frais de scolarité en éducation de base des adultes', 'cur'],
  ], { issuer: ["Who paid you (payer's name)?", "Qui vous a payé (nom du payeur)?"], other: ["Any other T4A box with an amount that is not listed above", "Toute autre case T4A comportant un montant et ne figurant pas ci-dessus"] }),
  slip('t4ap', 'T4A(P)', 'Statement of Canada Pension Plan Benefits', 'État des prestations du Régime de pensions du Canada', benefits, [
    ['13', 'Onset or effective date', 'Date de début ou d\'entrée en vigueur', 'date'], ['14', 'Retirement benefit', 'Prestation de retraite', 'cur'], ['15', 'Survivor benefit', 'Prestation de survivant', 'cur'], ['16', 'Disability benefit', 'Prestation d\'invalidité', 'cur', '11410'],
    ['17', 'Child benefit', 'Prestation d\'enfant', 'cur'], ['18', 'Death benefit', 'Prestation de décès', 'cur'], ['19', 'Post-retirement benefit', 'Prestation après-retraite', 'cur'], ['20', 'Taxable CPP benefits', 'Prestations imposables du RPC', 'cur', '11400'],
    ['21', 'Number of months: disability', 'Nombre de mois : invalidité', 'num'], ['22', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'], ['23', 'Number of months: retirement', 'Nombre de mois : retraite', 'num'],
  ], { hasOther: false, issuer: ["Plan (CPP or QPP)", "Régime (RPC ou RRQ)"] }),
  slip('t4aoas', 'T4A(OAS)', 'Statement of Old Age Security', 'État de la Sécurité de la vieillesse', benefits, [
    ['18', 'Taxable pension paid', 'Pension imposable versée', 'cur', '11300'], ['19', 'Gross OAS pension', 'Pension brute de la SV', 'cur'], ['20', 'Amounts recovered from your OAS pension due to an overpayment from a previous period', 'Montants récupérés de votre pension de la SV en raison d\'un paiement en trop d\'une période antérieure', 'cur', '23200'],
    ['21', 'Net supplements (allowance, survivor allowance, guaranteed income supplement)', 'Suppléments nets (allocation, allocation au survivant, supplément de revenu garanti)', 'cur', '14600'], ['22', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'], ['23', 'Quebec income tax deducted', 'Impôt du Québec retenu', 'cur'],
  ], { hasOther: false, issuer: ["Issuer", "Émetteur"] }),
  slip('t4e', 'T4E', 'Statement of Employment Insurance and Other Benefits', 'État des prestations d\'assurance-emploi et autres prestations', benefits, [
    ['7', 'Repayment rate', 'Taux de remboursement', 'num'], ['14', 'Total benefits paid', 'Total des prestations versées', 'cur', '11900'], ['15', 'Regular and other benefits paid', 'Prestations ordinaires et autres versées', 'cur'], ['17', 'Employment benefits and support measures paid', 'Prestations d\'emploi et mesures de soutien versées', 'cur'],
    ['18', 'Tax-exempt benefits', 'Prestations exonérées d\'impôt', 'cur'], ['20', 'Taxable tuition assistance', 'Aide imposable pour frais de scolarité', 'cur'], ['21', 'Non-taxable tuition assistance', 'Aide non imposable pour frais de scolarité', 'cur', '25600'],
    ['22', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'], ['23', 'Quebec income tax deducted', 'Impôt du Québec retenu', 'cur'], ['24', 'Non-resident tax deducted', 'Impôt des non-résidents retenu', 'cur'],
    ['26', 'Overpayment recovered or repaid', 'Paiement en trop récupéré ou remboursé', 'cur'], ['27', 'Reversal of income tax deducted', 'Annulation de l\'impôt retenu', 'cur'], ['30', 'Total repayment', 'Remboursement total', 'cur', '23200'],
    ['33', 'Payments out of the consolidated revenue fund', 'Paiements du Trésor', 'cur'], ['36', 'Provincial Parental Insurance Plan benefits', 'Prestations du Régime québécois d\'assurance parentale', 'cur'], ['37', 'EI maternity and parental benefits payment', 'Prestations de maternité et parentales de l\'AE', 'cur'],
  ], { hasOther: false, issuer: ["Issuer", "Émetteur"] }),
  slip('t4rsp', 'T4RSP', 'Statement of RRSP Income', 'État du revenu d\'un REER', any(maybe('F.inc.pension'), maybe('F.ded.rrsp')), [
    ['22', 'Other income or deductions (withdrawals, commutation payments)', 'Autres revenus ou déductions (retraits, paiements de commutation)', 'cur', '12900'], ['30', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'],
  ], { issuer: ["Financial institution", "Institution financière"], other: ["Every other box with an amount, as printed (for example box 16 taxable amounts, box 18 deceased, box 20 deregistration, box 26 to 36)", "Chaque autre case comportant un montant, telle qu'imprimée (par exemple case 16 montants imposables, case 18 décédé, case 20 désenregistrement, cases 26 à 36)"] }),
  slip('t4rif', 'T4RIF', 'Statement of Income from a Registered Retirement Income Fund', 'État du revenu d\'un fonds enregistré de revenu de retraite', maybe('F.inc.pension'), [
    ['16', 'Taxable amounts', 'Montants imposables', 'cur', '11500'], ['18', 'Deceased', 'Décédé', 'cur'], ['20', 'Deregistration', 'Désenregistrement', 'cur', '11500'], ['22', 'Other income or deductions', 'Autres revenus ou déductions', 'cur'],
    ['24', 'Excess amount', 'Montant excédentaire', 'cur'], ['26', 'Spousal or common-law partner RRIF', 'FERR de conjoint ou de conjoint de fait', 'cur'], ['28', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'], ['35', 'Transfers on breakdown of marriage or common-law partnership', 'Transferts à la suite d\'une rupture de mariage ou d\'union de fait', 'cur'], ['36', 'Tax-paid amount', 'Montant déjà imposé', 'cur'],
  ], { issuer: ["Financial institution", "Institution financière"] }),
  slip('t4fhsa', 'T4FHSA', 'First Home Savings Account Statement', 'État du compte d\'épargne libre d\'impôt pour l\'achat d\'une première propriété', maybe('F.ded.fhsa'), [
    ['30', 'Income tax deducted', 'Impôt sur le revenu retenu', 'cur', '43700'],
  ], { issuer: ["Financial institution", "Institution financière"], other: ["Every other box with an amount, exactly as printed on your FHSA slip (withdrawals, taxable amounts and others)", "Chaque autre case comportant un montant, telle qu'imprimée sur votre feuillet de CELIAPP (retraits, montants imposables et autres)"] }),
  slip('t3', 'T3', 'Statement of Trust Income Allocations and Designations', 'État des répartitions et attributions de revenus de fiducie', any(maybe('F.inc.trust'), maybe('F.inc.dividends'), maybe('F.inc.interest'), maybe('F.inc.sales')), [
    ['21', 'Capital gains', 'Gains en capital', 'cur', '17600'], ['22', 'Lump-sum pension income', 'Revenu de pension forfaitaire', 'cur', '13000'], ['23', 'Actual amount of dividends other than eligible dividends', 'Montant réel des dividendes autres que les dividendes déterminés', 'cur'],
    ['24', 'Foreign business income', 'Revenus étrangers d\'entreprise', 'cur', '13500'], ['25', 'Foreign non-business income', 'Revenus étrangers hors entreprise', 'cur', '12100'], ['26', 'Other income', 'Autres revenus', 'cur', '13000'],
    ['30', 'Capital gains eligible for deduction', 'Gains en capital admissibles à la déduction', 'cur'], ['31', 'Qualifying pension income', 'Revenu de pension admissible', 'cur', '11500'], ['32', 'Actual amount of eligible dividends', 'Montant réel des dividendes déterminés', 'cur'],
    ['33', 'Foreign business income tax paid', 'Impôt étranger payé sur le revenu d\'entreprise', 'cur'], ['34', 'Foreign non-business income tax paid', 'Impôt étranger payé sur le revenu hors entreprise', 'cur'], ['35', 'Eligible death benefits', 'Prestations de décès admissibles', 'cur'],
    ['37', 'Insurance segregated fund net capital losses', 'Pertes en capital nettes d\'un fonds distinct d\'assurance', 'cur'], ['38', 'Part XII.2 tax credit', 'Crédit d\'impôt de la partie XII.2', 'cur', '45600'], ['42', 'Amount resulting in cost base adjustment', 'Montant entraînant un rajustement du prix de base', 'cur'],
    ['48', 'Eligible amount of charitable donations', 'Montant admissible des dons de bienfaisance', 'cur'],
  ], { issuer: ["Trust, fund or institution", "Fiducie, fonds ou institution"], other: ["Every other box with an amount, exactly as printed (investment tax credits, other credits, and the rest)", "Chaque autre case comportant un montant, telle qu'imprimée (crédits d'impôt à l'investissement, autres crédits et le reste)"] }),
  slip('t5', 'T5', 'Statement of Investment Income', 'État des revenus de placement', invest, [
    ['10', 'Taxable amount of dividends other than eligible dividends', 'Montant imposable des dividendes autres que déterminés', 'cur', '12010'], ['11', 'Dividends other than eligible dividends: taxable amount', 'Dividendes autres que déterminés : montant imposable', 'cur', '12010'], ['12', 'Dividend tax credit for dividends other than eligible dividends', 'Crédit d\'impôt pour dividendes autres que déterminés', 'cur', '40425'],
    ['13', 'Interest from Canadian sources', 'Intérêts de sources canadiennes', 'cur', '12100'], ['14', 'Other income from Canadian sources', 'Autres revenus de sources canadiennes', 'cur', '12100'], ['15', 'Foreign income', 'Revenus de source étrangère', 'cur', '12100'], ['16', 'Foreign tax paid', 'Impôt étranger payé', 'cur', '40500'],
    ['17', 'Royalties from Canadian sources', 'Redevances de sources canadiennes', 'cur'], ['18', 'Capital gains dividends', 'Dividendes sur gains en capital', 'cur', '17400'], ['19', 'Accrued income: annuities', 'Revenu couru : rentes', 'cur'],
    ['24', 'Actual amount of eligible dividends', 'Montant réel des dividendes déterminés', 'cur'], ['25', 'Taxable amount of eligible dividends', 'Montant imposable des dividendes déterminés', 'cur', '12000'], ['26', 'Dividend tax credit for eligible dividends', 'Crédit d\'impôt pour dividendes déterminés', 'cur', '40425'], ['30', 'Equity linked notes interest', 'Intérêts sur billets liés à des actions', 'cur', '12100'],
  ], { issuer: ["Bank, broker or company", "Banque, courtier ou société"] }),
  slip('t5007', 'T5007', 'Statement of Benefits', 'État des prestations', any(benefits, maybe('F.inc.noSlip')), [
    ['10', 'Workers\' compensation benefits', 'Indemnités pour accident du travail', 'cur', '14400'], ['11', 'Social assistance payments or provincial or territorial supplements', 'Paiements d\'aide sociale ou suppléments provinciaux ou territoriaux', 'cur', '14500'], ['13', 'Report code', 'Code du genre de relevé', 'text'],
  ], { hasOther: false, issuer: ["Agency or board", "Organisme ou commission"] }),
  slip('t5008', 'T5008', 'Statement of Securities Transactions', 'État des opérations sur titres', maybe('F.inc.sales'), [], { issuer: ["Broker or institution", "Courtier ou institution"], hasOther: false, note: ["Boxes 20 (cost or book value) and 21 (proceeds of disposition) are what we use first. Box 20 may not be your adjusted cost base, so we check it against your own records in the capital gains section.", "Les cases 20 (coût ou valeur comptable) et 21 (produit de disposition) sont les premières que nous utilisons. La case 20 peut ne pas correspondre à votre prix de base rajusté : nous la comparons à vos propres registres dans la section sur les gains en capital."] }),
  slip('t5013', 'T5013', 'Statement of Partnership Income', 'État des revenus d\'une société de personnes', maybe('F.inc.trust'), [], { issuer: ["Partnership name", "Nom de la société de personnes"], other: ["Each box exactly as printed on the T5013 (box number, what it says, amount)", "Chaque case exactement comme imprimée sur le T5013 (numéro de case, ce qu'elle indique, montant)"], note: ["Partnership slips differ a lot from one partnership to another. Please copy every box that has an amount. Your preparer will map them to the right lines.", "Les feuillets de société de personnes varient beaucoup d'une société à l'autre. Veuillez copier chaque case comportant un montant. Votre préparateur les associera aux bonnes lignes."] }),
  S('t2202', ["T2202: Tuition and Enrolment Certificate", "T2202 : Certificat pour frais de scolarité et d'inscription"], [
    fl('file', ["Upload your T2202", "Téléversez votre T2202"], { docs: [{ key: 'T2202', label: ["T2202: Tuition and Enrolment Certificate", "T2202 : Certificat pour frais de scolarité et d'inscription"] }] }),
    tx('issuer', ["School name", "Nom de l'établissement"], { req: true, label: true }), tx('year', ["Year printed on the certificate", "Année figurant sur le certificat"], { req: true }),
    sl('status', ["Original or corrected?", "Original ou corrigé?"], { opts: DOC_STATUS, req: true }),
    sl('b11', ["Box 11: School type", "Case 11 : Type d'établissement"], { opts: O('1|University|Université', '2|College|Collège', '3|Other post-secondary institution|Autre établissement postsecondaire', '4|Institution certified by ESDC|Établissement agréé par EDSC', '5|Flying school or club|École ou club de pilotage') }),
    tx('b13', ["Box 13: Name of program or course", "Case 13 : Nom du programme ou du cours"]),
    num('b24', ["Box 24: Total number of months part-time", "Case 24 : Nombre total de mois à temps partiel"]), num('b25', ["Box 25: Total number of months full-time", "Case 25 : Nombre total de mois à temps plein"]),
    cur('b26', ["Box 26: Total eligible tuition fees", "Case 26 : Total des frais de scolarité admissibles"], { map: { form: 'T2202', box: '26', line: '32300', verified: true } }),
    rw('sessions', ["Each session (box 19 start, box 20 end, box 21 part-time months, box 22 full-time months, box 23 eligible tuition)", "Chaque session (case 19 début, case 20 fin, case 21 mois à temps partiel, case 22 mois à temps plein, case 23 frais admissibles)"], { cols: [{ id: 'start', t: ["Start (yy/mm)", "Début (aa/mm)"], type: 'text' }, { id: 'end', t: ["End (yy/mm)", "Fin (aa/mm)"], type: 'text' }, { id: 'pt', t: ["Months part-time", "Mois à temps partiel"], type: 'number' }, { id: 'ft', t: ["Months full-time", "Mois à temps plein"], type: 'number' }, { id: 'fee', t: ["Eligible tuition", "Frais admissibles"], type: 'currency' }] }),
  ], { show: maybe('F.ded.education'), repeat: { label: ["T2202", "T2202"], add: ["Add another T2202", "Ajouter un autre T2202"], min: 1 } }),
  slip('nr4', 'NR4', 'Statement of Amounts Paid or Credited to Non-Residents of Canada', 'État des sommes payées ou créditées à des non-résidents du Canada', any(maybe('C.life.left'), maybe('F.inc.foreign')), [
    ['11', 'Recipient code', 'Code du bénéficiaire', 'text'], ['12', 'Country code for tax purposes', 'Code de pays aux fins fiscales', 'text'], ['14', 'Income code', 'Code de revenu', 'text'], ['16', 'Gross income', 'Revenu brut', 'cur'], ['17', 'Non-resident tax withheld', 'Impôt de non-résident retenu', 'cur'], ['18', 'Exemption code', 'Code d\'exemption', 'text'],
  ], { hasOther: false, issuer: ["Payer", "Payeur"] }),
  slip('rl1', 'RL-1', 'Relevé 1: Employment and other income', 'Relevé 1 : Revenus d\'emploi et revenus divers', all(qc, emp), [
    ['A', 'Employment income', 'Revenus d\'emploi', 'cur'], ['B', 'QPP contributions', 'Cotisation au RRQ', 'cur'], ['C', 'EI premium', 'Cotisation à l\'assurance-emploi', 'cur'], ['D', 'RPP contributions', 'Cotisation à un RPA', 'cur'],
    ['E', 'Quebec income tax withheld', 'Impôt du Québec retenu à la source', 'cur'], ['F', 'Union dues', 'Cotisations syndicales', 'cur'], ['G', 'QPP pensionable salary or wages', 'Salaire admissible au RRQ', 'cur'], ['H', 'QPIP premium', 'Cotisation au RQAP', 'cur'], ['I', 'QPIP insurable earnings', 'Salaire assurable au RQAP', 'cur'],
  ], { issuer: ["Employer's name", "Nom de l'employeur"], other: ["Every other box with an amount, exactly as printed (for example O other income, S tips received, T tips allocated, W motor vehicle)", "Chaque autre case comportant un montant, telle qu'imprimée (par exemple O autres revenus, S pourboires reçus, T pourboires attribués, W véhicule à moteur)"] }),
  slip('rl2', 'RL-2', 'Relevé 2: Retirement and annuity income', 'Relevé 2 : Revenus de retraite et rentes', all(qc, maybe('F.inc.pension')), [], { issuer: ["Payer", "Payeur"], other: ["Each box exactly as printed on the RL-2 (box letter, what it says, amount)", "Chaque case exactement comme imprimée sur le relevé 2 (lettre de la case, ce qu'elle indique, montant)"] }),
  slip('rl3', 'RL-3', 'Relevé 3: Investment income', 'Relevé 3 : Revenus de placement', all(qc, invest), [], { issuer: ["Bank, broker or company", "Banque, courtier ou société"], other: ["Each box exactly as printed on the RL-3 (box letter, what it says, amount)", "Chaque case exactement comme imprimée sur le relevé 3 (lettre de la case, ce qu'elle indique, montant)"] }),
  slip('rl8', 'RL-8', 'Relevé 8: Amount for education', 'Relevé 8 : Montant relatif aux études', all(qc, maybe('F.ded.education')), [], { issuer: ["School", "Établissement"], other: ["Each box exactly as printed on the RL-8 (box letter, what it says, amount)", "Chaque case exactement comme imprimée sur le relevé 8 (lettre de la case, ce qu'elle indique, montant)"] }),
  slip('rl15', 'RL-15', 'Relevé 15: Partnership income', 'Relevé 15 : Revenus d\'une société de personnes', all(qc, maybe('F.inc.trust')), [], { issuer: ["Partnership name", "Nom de la société de personnes"], other: ["Each box exactly as printed on the RL-15 (box letter, what it says, amount)", "Chaque case exactement comme imprimée sur le relevé 15 (lettre de la case, ce qu'elle indique, montant)"] }),
  slip('rl24', 'RL-24', 'Relevé 24: Child care expenses', 'Relevé 24 : Frais de garde', all(qc, maybe('F.ded.childcare')), [], { issuer: ["Child care provider or service", "Garderie ou service de garde"], other: ["Each box exactly as printed on the RL-24 (box letter, what it says, amount)", "Chaque case exactement comme imprimée sur le relevé 24 (lettre de la case, ce qu'elle indique, montant)"] }),
  slip('rl31', 'RL-31', 'Relevé 31: Information about a leased dwelling', 'Relevé 31 : Renseignements sur un logement', qc, [], { issuer: ["Landlord", "Locateur"], other: ["Each box exactly as printed on the RL-31 (box letter, what it says, amount)", "Chaque case exactement comme imprimée sur le relevé 31 (lettre de la case, ce qu'elle indique, montant)"] }),
  S('other', ["Any other slip", "Tout autre feuillet"], [
    sl('type', ["Which slip is it?", "De quel feuillet s'agit-il?"], { req: true, label: true, opts: O('T5018|T5018 Statement of Contract Payments|T5018 État des paiements contractuels', 'T4PS|T4PS Employee Profit Sharing Plan|T4PS Régime de participation des employés aux bénéfices', 'T5006|T5006 Labour-sponsored funds|T5006 Fonds de travailleurs', 'T1204|T1204 Government services contract payments|T1204 Paiements contractuels de services gouvernementaux', 'RC62|RC62 Universal Child Care Benefit|RC62 Prestation universelle pour la garde d\'enfants', 'T4ANR|T4A-NR|T4A-NR', 'other|Another slip|Un autre feuillet') }),
    tx('issuer', ["Who issued it?", "Qui l'a émis?"], { req: true }), tx('year', ["Year printed on it", "Année figurant sur celui-ci"], { req: true }),
    sl('status', ["Original or corrected?", "Original ou corrigé?"], { opts: DOC_STATUS, req: true }),
    fl('file', ["Upload the slip", "Téléversez le feuillet"], { req: true, docs: [{ key: 'OTHER_SLIP', label: ["Other slip", "Autre feuillet"] }] }),
    rw('boxes', ["Every box with an amount, exactly as printed", "Chaque case comportant un montant, telle qu'imprimée"], { cols: OTHER_COLS }),
  ], { show: any(maybe('F.inc.noSlip'), maybe('F.inc.selfEmp'), maybe('F.inc.unusual'), maybe('F.ded.investCredits'), maybe('F.inc.employment')), repeat: { label: ["Slip", "Feuillet"], add: ["Add another slip", "Ajouter un autre feuillet"] }, desc: ["For example T5018 for contract work, T4PS, T5006 or RC62. Skip this if every slip is already listed above.", "Par exemple T5018 pour du travail à contrat, T4PS, T5006 ou RC62. Passez cette section si tous vos feuillets figurent déjà ci-dessus."] }),
]);

// T5008 entered as one row per security (the slip repeats the same boxes on each line)
const t5008 = moduleG.sections.find((s) => s.id === 'G.t5008')!;
t5008.qs.push({
  id: 'G.t5008.lines', sec: 'G.t5008', mod: 'G', type: 'rows', text: ["Each transaction on the slip", "Chaque opération du feuillet"],
  help: ["One row per security. Box 20 is the cost or book value and box 21 the proceeds of disposition, as printed.", "Une ligne par titre. La case 20 est le coût ou la valeur comptable et la case 21 le produit de disposition, tels qu'imprimés."],
  cols: [{ id: 'security', t: ["Security description", "Description du titre"], type: 'text' }, { id: 'qty', t: ["Quantity", "Quantité"], type: 'number' }, { id: 'b21', t: ["Box 21: Proceeds of disposition", "Case 21 : Produit de disposition"], type: 'currency' }, { id: 'b20', t: ["Box 20: Cost or book value", "Case 20 : Coût ou valeur comptable"], type: 'currency' }, { id: 'date', t: ["Date sold, if shown", "Date de vente, si indiquée"], type: 'date' }],
  map: { form: 'T5008', box: '20, 21', line: 'Schedule 3', verified: true },
  review: [{ when: { q: 'G.t5008.lines', op: 'answered' }, sev: 'warning', title: ["T5008 cost may not be the adjusted cost base: compare with the client's own cost records", "Le coût du T5008 peut ne pas être le prix de base rajusté : comparer aux registres de coût du client"] }],
});
