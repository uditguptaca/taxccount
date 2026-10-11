// Module D: marital status, spouse or partner, and household changes.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, sin, info, O, yes, no, maybe, eq, isIn, all, any, answered, some, rec } from '../dsl.ts';
import { COUNTRIES } from '../opts.ts';

export const moduleD = M({
  code: 'D', name: 'MARITAL', phase: 'about', icon: 'users', always: true,
  title: ["Relationship and household", "Relation conjugale et ménage"],
  desc: ["Your marital status on 31 December, your spouse or partner, and any change in your household during the year.", "Votre état civil au 31 décembre, votre conjoint ou conjointe, et tout changement dans votre ménage durant l'année."],
  src: ['cra.deductions'],
  cover: [
    { item: 'Marital status on 31 December and changes during the year', ref: 'T1 page 1', kind: 'client', qs: ['D.status.*', 'D.event.*'] },
    { item: 'Spouse or common-law partner: name, date of birth, SIN, net income', ref: 'T1 page 1, lines 30300, 21000, 30400', kind: 'client', qs: ['D.spouse.*'] },
    { item: 'Separation and reconciliation dates; living apart', kind: 'client', qs: ['D.apart.*'] },
    { item: 'Spouse return prepared together; household linking', kind: 'client', qs: ['D.spouse.sameReturn'], note: 'Linking two returns never gives either person access to the other\'s documents, income or messages.' },
    { item: 'Children born or adopted, custody and household composition changes, death of a spouse or dependant', kind: 'client', qs: ['D.change.*'] },
  ],
}, [
  S('status', ["Your marital status", "Votre état civil"], [
    rd('marital', ["What was your marital status on 31 December of the tax year?", "Quel était votre état civil le 31 décembre de l'année d'imposition?"], {
      req: true, noUnsure: true, map: { form: 'T1', line: 'Marital status', verified: true },
      opts: O('single|Single (never married and not in a common-law relationship)|Célibataire (jamais marié et sans union de fait)', 'married|Married|Marié(e)', 'common_law|Living common-law|En union de fait', 'separated|Separated|Séparé(e)', 'divorced|Divorced|Divorcé(e)', 'widowed|Widowed|Veuf ou veuve'),
      help: ["Common-law means you have lived together in a conjugal relationship for at least 12 months, or have a child together. Choose \"Separated\" only if you were living apart because the relationship broke down.", "L'union de fait signifie que vous vivez ensemble dans une relation conjugale depuis au moins 12 mois ou que vous avez un enfant ensemble. Choisissez « Séparé(e) » seulement si vous viviez séparément en raison de la rupture de la relation."],
      why: ["Your marital status decides which credits you and your spouse or partner can claim and how family income is counted.", "Votre état civil détermine les crédits que vous et votre conjoint pouvez demander et la façon de compter le revenu familial."],
    }),
    yn('changed', ["Did your marital status change during the tax year?", "Votre état civil a-t-il changé durant l'année d'imposition?"], { req: true, noUnsure: true }),
  ]),
  S('event', ["A change in your relationship", "Un changement dans votre relation"], [
    sl('kind', ["What happened?", "Que s'est-il passé?"], { req: true, label: true, opts: O('married|We married|Nous nous sommes mariés', 'common_law|We started living common-law|Nous avons commencé à vivre en union de fait', 'separated|We separated|Nous nous sommes séparés', 'reconciled|We got back together|Nous nous sommes réconciliés', 'divorced|We divorced|Nous avons divorcé', 'widowed|My spouse or partner died|Mon conjoint ou ma conjointe est décédé(e)') }),
    dt('date', ["On what date?", "À quelle date?"], { req: true, rules: [{ t: 'dateInYear' }] }),
    ta('note', ["Anything we should know about it?", "Y a-t-il quelque chose que nous devrions savoir?"]),
  ], { show: yes('D.status.changed'), repeat: { label: ["Change", "Changement"], add: ["Add another change", "Ajouter un autre changement"], min: 1 } }),
  S('spouse', ["Your spouse or partner", "Votre conjoint ou conjointe"], [
    tx('first', ["Spouse or partner's first name", "Prénom du conjoint ou de la conjointe"], { req: true, noUnsure: true }),
    tx('last', ["Spouse or partner's last name", "Nom de famille du conjoint ou de la conjointe"], { req: true, noUnsure: true }),
    dt('dob', ["Their date of birth", "Sa date de naissance"], { req: true, noUnsure: true, sens: 'protected' }),
    sin('sin', ["Their Social Insurance Number", "Son numéro d'assurance sociale"], { sens: 'restricted', help: ["Needed to claim spousal amounts. If you do not have it, choose \"I will provide this later\".", "Nécessaire pour demander les montants pour conjoint. Si vous ne l'avez pas, choisissez « Je le fournirai plus tard »."], req: isIn('D.status.marital', ['married', 'common_law']) }),
    dt('since', ["Date you started living together", "Date à laquelle vous avez commencé à vivre ensemble"], { show: eq('D.status.marital', 'common_law') }),
    sl('residence', ["Where did they live on 31 December?", "Où habitait-il ou elle le 31 décembre?"], { opts: O('canada|In Canada|Au Canada', 'abroad|Outside Canada|À l\'extérieur du Canada', 'part|Part of the year in Canada|Une partie de l\'année au Canada'), req: true }),
    yn('sameReturn', ["Are we also preparing your spouse or partner's own return?", "Préparons-nous aussi la déclaration de votre conjoint ou conjointe?"], { req: true, help: ["Each person has a separate return and a separate file. We can link them so credits that depend on both are worked out together. Linking does not let either of you see the other's information.", "Chaque personne a une déclaration et un dossier distincts. Nous pouvons les lier pour calculer ensemble les crédits qui dépendent des deux. Cela ne permet à aucun de vous de voir les renseignements de l'autre."], why: ["Some credits are better claimed by one spouse than the other. We can only decide that if both returns are prepared together.", "Certains crédits sont plus avantageux pour un conjoint que pour l'autre. Nous ne pouvons en décider que si les deux déclarations sont préparées ensemble."] }),
    cur('netIncome', ["Your spouse or partner's net income for the tax year (line 23600 of their return)", "Revenu net de votre conjoint pour l'année d'imposition (ligne 23600 de sa déclaration)"], { show: no('.sameReturn'), help: ["Needed for spousal credits. Use their notice of assessment if you can. If you only have an estimate, say so below.", "Nécessaire pour les montants pour conjoint. Utilisez son avis de cotisation si possible. Si vous n'avez qu'une estimation, dites-le ci-dessous."], map: { form: 'T1', line: '23600', verified: true } }),
    rd('netBasis', ["Is that figure confirmed or an estimate?", "Ce chiffre est-il confirmé ou estimé?"], { show: answered('.netIncome'), opts: O('confirmed|Confirmed from their notice of assessment or return|Confirmé par son avis de cotisation ou sa déclaration', 'estimate|An estimate|Une estimation'), req: true, review: [{ when: { q: '.netBasis', op: 'eq', v: 'estimate' }, sev: 'warning', title: ["Spouse income is an estimate: confirm before claiming spousal amounts", "Le revenu du conjoint est une estimation : confirmer avant de demander les montants pour conjoint"] }] }),
    fl('spouseNoa', ["If your spouse has authorized you to share it, upload their notice of assessment or return.", "Si votre conjoint vous a autorisé à le partager, téléversez son avis de cotisation ou sa déclaration."], { show: no('.sameReturn'), docs: [{ key: 'SPOUSE_NOA', label: ["Spouse's notice of assessment or return (with their permission)", "Avis de cotisation ou déclaration du conjoint (avec sa permission)"], who: 'spouse', optional: true }], sens: 'restricted' }),
  ], { show: isIn('D.status.marital', ['married', 'common_law', 'separated', 'widowed', 'divorced']) }),
  S('apart', ["Separation", "Séparation"], [
    dt('date', ["Date you began living apart", "Date à laquelle vous avez commencé à vivre séparément"], { req: true }),
    yn('breakdown', ["Did you live apart because the relationship broke down?", "Viviez-vous séparément en raison de la rupture de la relation?"], { req: true, help: ["Living apart for work or care reasons is not a separation for tax purposes.", "Vivre séparément pour des raisons de travail ou de soins n'est pas une séparation aux fins de l'impôt."] }),
    yn('ninety', ["Were you living apart for at least 90 days in a row, including 31 December?", "Viviez-vous séparément pendant au moins 90 jours consécutifs, incluant le 31 décembre?"], { req: true }),
    dt('reconciled', ["If you got back together, on what date?", "Si vous vous êtes réconciliés, à quelle date?"], { rules: [{ t: 'dateNotBefore', q: '.date' }] }),
    yn('support', ["Did either of you pay or receive support for the other or for the children?", "L'un de vous a-t-il versé ou reçu une pension alimentaire pour l'autre ou pour les enfants?"], { help: ["We ask for the details in the support section later.", "Nous demandons les détails dans la section sur les pensions alimentaires plus loin."] }),
  ], { show: any(eq('D.status.marital', 'separated'), eq('D.status.marital', 'divorced'), rec('D.event', { q: '.kind', op: 'in', v: ['separated', 'reconciled', 'divorced'] })) }),
  S('widow', ["The death of a spouse or partner", "Le décès d'un conjoint ou d'une conjointe"], [
    dt('date', ["Date your spouse or partner died", "Date du décès de votre conjoint ou conjointe"], { req: true, sens: 'protected' }),
    yn('finalReturn', ["Is someone preparing their final return?", "Quelqu'un prépare-t-il sa dernière déclaration?"], { review: [{ when: { q: '.finalReturn', op: 'maybe' }, sev: 'specialist', specialist: 'Deceased taxpayer', title: ["Spouse's final return affects this return (survivor elections and transfers)", "La dernière déclaration du conjoint touche cette déclaration (choix et transferts du survivant)"] }] }),
    yn('rollover', ["Did you receive any of their RRSP, RRIF, pension or other property after their death?", "Avez-vous reçu leur REER, FERR, pension ou autre bien après leur décès?"], { review: [{ when: { q: '.rollover', op: 'maybe' }, sev: 'specialist', specialist: 'Estate / deceased', title: ["Property received on a spouse's death: rollover and tax review", "Biens reçus au décès d'un conjoint : examen du roulement et de l'impôt"] }] }),
  ], { show: any(eq('D.status.marital', 'widowed'), rec('D.event', { q: '.kind', op: 'eq', v: 'widowed' })) }),
  S('change', ["Other changes in your household", "Autres changements dans votre ménage"], [
    yn('child', ["Was a child born to you, or did you adopt or become the guardian of a child, during the year?", "Un enfant est-il né, ou avez-vous adopté un enfant ou en êtes-vous devenu le tuteur, durant l'année?"], { req: true, help: ["We collect the child's details in the next section about children and dependants.", "Nous recueillons les renseignements sur l'enfant à la section suivante sur les enfants et les personnes à charge."] }),
    yn('custody', ["Did custody or where a child lives change during the year?", "La garde ou le lieu de résidence d'un enfant a-t-il changé durant l'année?"], { req: true }),
    yn('moveIn', ["Did a parent, adult child or other relative move in with you, or did someone you support move out?", "Un parent, un enfant adulte ou un autre proche a-t-il emménagé avec vous, ou une personne que vous souteniez a-t-elle déménagé?"], { req: true }),
    yn('death', ["Did a spouse, partner, child or other dependant die during the year?", "Un conjoint, un enfant ou une autre personne à charge est-il décédé durant l'année?"], { req: true, review: [{ when: { q: '.death', op: 'maybe' }, sev: 'warning', title: ["A death in the household: special claim rules apply", "Un décès dans le ménage : des règles particulières de demande s'appliquent"] }] }),
    ta('details', ["Please describe what changed and when.", "Veuillez décrire ce qui a changé et quand."], { show: any(maybe('.child'), maybe('.custody'), maybe('.moveIn'), maybe('.death')), req: true }),
  ]),
]);
