// Module N: interest, dividends, partnerships and investment expenses.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, pct, rw, info, O, yes, no, maybe, eq, isIn, has, any, all, answered } from '../dsl.ts';
import { COUNTRIES, CURRENCIES, OWNER_ONLY } from '../opts.ts';

const ACCT = O('nonreg|Non-registered (taxable) account|Compte non enregistré (imposable)', 'joint|Joint non-registered account|Compte conjoint non enregistré', 'margin|Margin or trading account|Compte sur marge ou de négociation', 'gic|GIC, term deposit or savings account|CPG, dépôt à terme ou compte d\'épargne', 'fund|Mutual fund or ETF held directly|Fonds commun ou FNB détenu directement', 'private|Loan or investment in a private company|Prêt ou placement dans une société privée', 'trust|Trust or partnership units|Parts de fiducie ou de société de personnes', 'registered|An RRSP, TFSA, FHSA, RESP or RRIF|Un REER, CELI, CELIAPP, REEE ou FERR', 'other|Other|Autre');
const INC_KINDS = O('interest|Interest|Intérêts', 'cdn|Canadian dividends|Dividendes canadiens', 'foreign|Foreign dividends or interest|Dividendes ou intérêts étrangers', 'gains|Capital gains distributions|Distributions de gains en capital', 'roc|Return of capital|Remboursement de capital', 'reinvested|Reinvested distributions|Distributions réinvesties', 'other|Other|Autre');

export const moduleN = M({
  code: 'N', name: 'INVESTMENTS', phase: 'income', icon: 'trending-up',
  title: ["Interest, dividends and investments", "Intérêts, dividendes et placements"],
  desc: ["Each account or source of investment income, who owns it and what it cost to hold.", "Chaque compte ou source de revenu de placement, à qui il appartient et ce qu'il en coûte de le détenir."],
  show: any(maybe('F.inc.interest'), maybe('F.inc.dividends'), maybe('F.inc.trust'), maybe('F.ded.investCredits'), maybe('F.spec.privateCo')),
  src: ['cra.income', 'cra.capgains'],
  cover: [
    { item: 'Accounts and investment sources producing income; interest without slips', ref: '12100', kind: 'client', qs: ['N.acct.*', 'N.noSlip.*'] },
    { item: 'Canadian and foreign dividends; trust and partnership allocations', ref: '12000, 12010, 12200', kind: 'client', qs: ['N.acct.income', 'N.acct.foreignTax'] },
    { item: 'Joint owners, source of contributed funds, and the facts supporting an income allocation', kind: 'client', qs: ['N.acct.owner', 'N.acct.share', 'N.acct.funds', 'N.acct.basis'] },
    { item: 'Return of capital and reinvested distributions', kind: 'documents', qs: ['N.acct.roc', 'N.acct.acbStatement'] },
    { item: 'Investment borrowing and the use of the borrowed money; management fees and other carrying charges', ref: '22100', kind: 'client', qs: ['N.acct.loan', 'N.acct.loanUse', 'N.acct.loanInterest', 'N.acct.fees', 'N.acct.other'] },
    { item: 'Foreign withholding tax', ref: '40500', kind: 'client', qs: ['N.acct.foreignTax'] },
    { item: 'Private-company investments and shareholder transactions', kind: 'specialist', qs: ['N.priv.*'] },
    { item: 'Limited-partnership losses and carryforwards; tax shelters and resource investments', ref: '25100', kind: 'client', qs: ['N.lp.*', 'N.shelter.*'] },
  ],
}, [
  S('any', ["Where your investment income came from", "D'où provient votre revenu de placement"], [
    yn('any', ["Do you have any account, loan or investment that earned interest, dividends, distributions or other income this year?", "Avez-vous un compte, un prêt ou un placement qui a produit des intérêts, des dividendes, des distributions ou un autre revenu cette année?"], { req: true }),
  ]),
  S('acct', ["An account or source", "Un compte ou une source"], [
    tx('inst', ["Institution or issuer", "Institution ou émetteur"], { req: true, label: true }),
    sl('type', ["What kind of account or investment is it?", "De quel type de compte ou de placement s'agit-il?"], { opts: ACCT, req: true, review: [{ when: { q: '.type', op: 'eq', v: 'registered' }, sev: 'warning', title: ["Registered account listed as taxable income source: income inside registered plans is not reported unless withdrawn", "Compte enregistré inscrit comme source de revenu imposable : le revenu dans un régime enregistré n'est pas déclaré sauf en cas de retrait"] }] }),
    rd('owner', ["Whose account is it?", "À qui appartient le compte?"], { opts: OWNER_ONLY, req: true }),
    pct('share', ["Your share of the income from this account", "Votre part du revenu de ce compte"], { show: eq('.owner', 'joint'), unit: '%', req: true, rules: [{ t: 'min', v: 0 }, { t: 'max', v: 100 }], help: ["Use the share supported by who put the money in, not simply 50%. Your answer on the next question explains it.", "Utilisez la part qui correspond à qui a mis l'argent, pas simplement 50 %. Votre réponse à la question suivante l'explique."] }),
    rd('funds', ["Who put the money into this account?", "Qui a déposé l'argent dans ce compte?"], { show: eq('.owner', 'joint'), opts: O('me|Mostly or only me|Surtout ou seulement moi', 'other|Mostly or only the other owner|Surtout ou seulement l\'autre propriétaire', 'equal|About equally|À peu près également', 'mixed|It changed over time|Cela a changé avec le temps', 'unsure|I am not sure|Je ne suis pas certain'), req: true }),
    ta('basis', ["Tell us anything that explains how the income is shared (for example a parent added for convenience, a spouse's inheritance).", "Dites-nous tout ce qui explique le partage du revenu (par exemple un parent ajouté par commodité, l'héritage d'un conjoint)."], { show: eq('.owner', 'joint'), review: [{ when: { q: '.funds', op: 'in', v: ['other', 'mixed', 'unsure'] }, sev: 'warning', title: ["Joint account income allocation needs the facts about who contributed the funds", "La répartition du revenu d'un compte conjoint exige de connaître l'origine des fonds"] }] }),
    mu('income', ["What kinds of income did it pay you?", "Quels genres de revenu vous a-t-il versés?"], { opts: INC_KINDS, req: true }),
    cur('interest', ["Total interest earned (if you have no slip)", "Total des intérêts gagnés (si vous n'avez pas de feuillet)"], { show: has('.income', 'interest') }),
    cur('dividends', ["Total dividends received (if you have no slip)", "Total des dividendes reçus (si vous n'avez pas de feuillet)"], { show: any(has('.income', 'cdn'), has('.income', 'foreign')) }),
    sl('foreignCountry', ["Country the foreign income came from", "Pays d'où provient le revenu étranger"], { opts: COUNTRIES, show: has('.income', 'foreign') }),
    cur('foreignTax', ["Foreign tax withheld", "Impôt étranger retenu"], { show: has('.income', 'foreign'), map: { form: 'T2209', line: '40500', verified: true } }),
    yn('roc', ["Did you receive any return of capital or reinvested distributions?", "Avez-vous reçu un remboursement de capital ou des distributions réinvesties?"], { show: any(has('.income', 'roc'), has('.income', 'reinvested')), help: ["These change the cost of your investment. We use your statement to track it.", "Ils modifient le coût de votre placement. Nous utilisons votre relevé pour le suivre."] }),
    fl('acbStatement', ["Upload your annual statement or a cost-base report.", "Téléversez votre relevé annuel ou un rapport du prix de base."], { show: maybe('.roc'), docs: [{ key: 'ACB_STATEMENT', label: ["Annual statement or cost-base report", "Relevé annuel ou rapport du prix de base"] }] }),
    yn('loan', ["Did you borrow money to buy investments in this account?", "Avez-vous emprunté de l'argent pour acheter des placements dans ce compte?"], { review: [{ when: { q: '.loan', op: 'maybe' }, sev: 'info', title: ["Investment loan: confirm the use of the borrowed money for the interest deduction", "Prêt pour placement : confirmer l'utilisation des fonds empruntés pour la déduction des intérêts"] }] }),
    rd('loanUse', ["What was the borrowed money used for?", "À quoi l'argent emprunté a-t-il servi?"], { show: maybe('.loan'), opts: O('invest|Buying investments that can earn income|Acheter des placements pouvant produire un revenu', 'registered|Putting into an RRSP or TFSA|Cotiser à un REER ou à un CELI', 'personal|Personal spending|Dépenses personnelles', 'mixed|A mix|Un mélange', 'unsure|I am not sure|Je ne suis pas certain') }),
    cur('loanInterest', ["Interest paid on that loan", "Intérêts payés sur ce prêt"], { show: maybe('.loan'), map: { form: 'T1', line: '22100', verified: true } }),
    cur('fees', ["Investment management or advisory fees paid", "Frais de gestion de placements ou de conseils payés"], { map: { form: 'T1', line: '22100', verified: true }, help: ["Fees paid for a registered account such as an RRSP or TFSA are not deductible.", "Les frais payés pour un compte enregistré comme un REER ou un CELI ne sont pas déductibles."] }),
    cur('other', ["Other costs of holding the investments (safe deposit box, accounting for the investment)", "Autres frais de détention des placements (coffret de sûreté, comptabilité des placements)"]),
    fl('docs', ["Upload your tax slips or year-end statement for this account.", "Téléversez vos feuillets fiscaux ou le relevé de fin d'année de ce compte."], { docs: [{ key: 'INVESTMENT_STATEMENT', label: ["Year-end investment statement", "Relevé de placement de fin d'année"] }] }),
  ], { show: maybe('N.any.any'), repeat: { label: ["Account", "Compte"], add: ["Add another account or source", "Ajouter un autre compte ou une autre source"], min: 1 } }),
  S('noSlip', ["Interest with no slip", "Intérêts sans feuillet"], [
    tx('from', ["Who paid the interest?", "Qui a versé les intérêts?"], { req: true, label: true, help: ["For example a personal loan you made, an online savings account, a deposit abroad.", "Par exemple un prêt personnel que vous avez consenti, un compte d'épargne en ligne, un dépôt à l'étranger."] }),
    cur('amount', ["Amount of interest", "Montant des intérêts"], { req: true }),
    sl('currency', ["Currency", "Devise"], { opts: CURRENCIES }),
  ], { show: maybe('F.inc.interest'), repeat: { label: ["Interest source", "Source d'intérêts"], add: ["Add another", "Ajouter un autre"] } }),
  S('priv', ["Private-company investments", "Placements dans des sociétés privées"], [
    tx('company', ["Name of the company", "Nom de la société"], { req: true, label: true }),
    rd('what', ["What did you do with it this year?", "Qu'avez-vous fait avec cette société cette année?"], { opts: O('shares|Own shares|Détenir des actions', 'loanTo|Lent it money|Lui prêter de l\'argent', 'loanFrom|Borrowed from it|Emprunter d\'elle', 'dividend|Received a dividend or bonus|Recevoir un dividende ou une prime', 'benefit|Received a personal benefit paid by it|Recevoir un avantage personnel payé par elle', 'other|Something else|Autre chose'), req: true }),
    cur('amount', ["Amount involved", "Montant en cause"]),
    ta('details', ["Describe what happened and the dates.", "Décrivez ce qui s'est passé et les dates."], { req: true }),
  ], { show: maybe('F.spec.privateCo'), repeat: { label: ["Private company", "Société privée"], add: ["Add another company", "Ajouter une autre société"] }, desc: ["Shareholder loans, benefits and dividends from a private company have special tax rules, so your preparer will review them.", "Les prêts, avantages et dividendes d'actionnaire d'une société privée sont soumis à des règles fiscales particulières : votre préparateur les examinera."] }),
  S('lp', ["Limited partnerships", "Sociétés en commandite"], [
    tx('name', ["Name of the partnership", "Nom de la société en commandite"], { req: true, label: true }),
    cur('loss', ["Loss allocated to you this year", "Perte qui vous a été attribuée cette année"]),
    cur('carry', ["Unused limited-partnership losses carried from earlier years, if you know", "Pertes de société en commandite inutilisées d'années antérieures, si vous les connaissez"], { map: { form: 'T1', line: '25100', verified: true }, review: [{ when: { q: '.carry', op: 'answered' }, sev: 'info', title: ["Limited partnership loss carryforward: confirm the at-risk balance", "Report de pertes d'une société en commandite : confirmer le montant à risque"] }] }),
    fl('doc', ["Upload the partnership statement.", "Téléversez l'état de la société en commandite."], { docs: [{ key: 'LP_STATEMENT', label: ["Limited partnership statement", "État de la société en commandite"] }] }),
  ], { show: maybe('F.inc.trust'), repeat: { label: ["Partnership", "Société"], add: ["Add another partnership", "Ajouter une autre société"] } }),
  S('shelter', ["Tax shelters and resource investments", "Abris fiscaux et placements dans les ressources"], [
    tx('name', ["Name of the investment", "Nom du placement"], { req: true, label: true }),
    tx('id', ["Tax shelter identification number, if there is one", "Numéro d'identification de l'abri fiscal, s'il y en a un"]),
    cur('amount', ["Amount you invested", "Montant investi"]),
    fl('doc', ["Upload the tax shelter or flow-through statement.", "Téléversez l'état de l'abri fiscal ou des actions accréditives."], { docs: [{ key: 'SHELTER_DOC', label: ["Tax shelter or flow-through statement", "État de l'abri fiscal ou des actions accréditives"] }] }),
  ], { show: maybe('F.ded.investCredits'), repeat: { label: ["Investment", "Placement"], add: ["Add another", "Ajouter un autre"] }, desc: ["The preparer reviews any tax shelter or flow-through investment before it is claimed.", "Le préparateur examine tout abri fiscal ou placement accréditif avant qu'il ne soit demandé."] }),
]);
