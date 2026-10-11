// Module AD: payments, final review and the client's confirmation.
// Submitting this questionnaire sends information to a preparer. It does not file a return, and a generic
// signature here is NOT the CRA's authorization (Form T183): that is created later, after the return is prepared.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, rw, info, O, yes, no, maybe, eq, isIn, any, all, answered } from '../dsl.ts';

export const moduleAD = M({
  code: 'AD', name: 'PAYMENTS_REVIEW', phase: 'finish', icon: 'check-circle',
  title: ["Payments and final review", "Paiements et révision finale"], 
  desc: ["Payments you made toward tax, how you would like a refund or balance handled, and your confirmation.", "Paiements faits sur l'impôt, façon dont vous souhaitez traiter un remboursement ou un solde, et votre confirmation."],
  always: true,
  src: ['cra.t183', 'opc.consent'],
  cover: [
    { item: 'Federal and provincial instalments: dates, allocation to years, statements, balances', ref: '47600', kind: 'client', qs: ['AD.pay.*'] },
    { item: 'Direct deposit: whether details need attention (no bank details are collected here)', kind: 'client', qs: ['AD.bank.*'], note: 'Banking details are not collected in this form: the preparer guides the client to update them in their own CRA or Revenu Québec account.' },
    { item: 'Client review of answers, documents, missing items, estimates, referrals and changes since an earlier submission', kind: 'derived', qs: ['AD.confirm.*'] },
    { item: 'Separate acknowledgements: accuracy and completeness, engagement terms, privacy, optional sharing', kind: 'client', qs: ['AD.confirm.accuracy', 'AD.confirm.terms', 'AD.confirm.privacy', 'AD.share.*'] },
    { item: 'Filing authorization (T183) and representative authorization: created only after the return is prepared', ref: 'T183, T1013', kind: 'preparer', qs: ['AD.confirm.note'], note: 'A task is created for the preparer after preparation; nothing in this form authorizes filing.' },
  ],
}, [
  S('pay', ["Payments to the tax authorities", "Paiements aux autorités fiscales"], [
    yn('instalments', ["Did you pay federal income tax instalments, or any other payment to the CRA, during the tax year?", "Avez-vous versé des acomptes provisionnels d'impôt fédéral, ou fait un autre paiement à l'ARC, durant l'année d'imposition?"], { req: true, map: { form: 'T1', line: '47600', verified: true } }),
    rw('rows', ["Each payment", "Chaque paiement"], { show: maybe('.instalments'), cols: [{ id: 'date', t: ["Date paid", "Date du paiement"], type: 'date' }, { id: 'amount', t: ["Amount", "Montant"], type: 'currency' }, { id: 'year', t: ["Applied to which year", "Appliqué à quelle année"], type: 'text' }, { id: 'who', t: ["To", "À"], type: 'select', opts: O('cra|Canada Revenue Agency|Agence du revenu du Canada', 'rq|Revenu Québec|Revenu Québec', 'prov|Another province or territory|Une autre province ou un autre territoire') }], help: ["Use your payment confirmations. We also check them against your CRA account if you authorize us.", "Utilisez vos confirmations de paiement. Nous les vérifions aussi dans votre compte de l'ARC si vous nous y autorisez."] }),
    fl('statement', ["Upload your instalment or payment statement.", "Téléversez votre relevé d'acomptes ou de paiements."], { show: maybe('.instalments'), docs: [{ key: 'INSTALMENT_STATEMENT', label: ["Instalment or payment statement", "Relevé d'acomptes ou de paiements"] }] }),
    yn('owing', ["Do you owe the CRA or Revenu Québec money from an earlier year?", "Devez-vous de l'argent à l'ARC ou à Revenu Québec pour une année antérieure?"], { req: true, help: ["If you do, a refund can be applied to it. We never arrange payment without you.", "Si oui, un remboursement peut y être appliqué. Nous ne prenons jamais d'arrangement de paiement sans vous."] }),
    ta('owingDetails', ["Which years, roughly how much, and is there a payment arrangement?", "Quelles années, environ combien, et existe-t-il une entente de paiement?"], { show: maybe('.owing') }),
  ]),
  S('bank', ["Refund and direct deposit", "Remboursement et dépôt direct"], [
    yn('update', ["Do your direct deposit details at the CRA or Revenu Québec need to be updated?", "Vos renseignements de dépôt direct à l'ARC ou à Revenu Québec doivent-ils être mis à jour?"], { req: true, help: ["Do not type bank details here. If they need updating, we will show you how to do it in your own account.", "Ne saisissez pas de renseignements bancaires ici. S'ils doivent être mis à jour, nous vous montrerons comment le faire dans votre propre compte."] }),
    yn('closed', ["Did you close the bank account you used last year?", "Avez-vous fermé le compte bancaire utilisé l'an dernier?"], { show: maybe('.update') }),
  ]),
  S('share', ["Optional sharing", "Partage facultatif"], [
    yn('spouseFile', ["May we compare this return with your spouse or partner's return that we also prepare, so that shared claims agree?", "Pouvons-nous comparer cette déclaration à celle de votre conjoint que nous préparons aussi, afin que les demandes communes concordent?"], { noUnsure: true, show: yes('D.spouse.sameReturn'), help: ["This never lets either of you see the other's documents or messages.", "Cela ne permet à aucun de vous de voir les documents ou messages de l'autre."] }),
    yn('lookup', ["If you separately authorize us in your CRA or Revenu Québec account, may we look up slips and assessments to check what you sent?", "Si vous nous autorisez séparément dans votre compte de l'ARC ou de Revenu Québec, pouvons-nous consulter les feuillets et avis de cotisation pour vérifier ce que vous avez envoyé?"], { noUnsure: true, help: ["Authorization is a separate step, in your own account. A lookup never replaces the documents you provide.", "L'autorisation est une étape distincte, dans votre propre compte. Une consultation ne remplace jamais les documents que vous fournissez."] }),
  ]),
  S('notes', ["Anything else", "Autre chose"], [
    ta('note', ["Anything else you want your preparer to know", "Tout autre renseignement que vous voulez transmettre à votre préparateur"]),
    ta('questions', ["Questions for your preparer", "Questions pour votre préparateur"]),
  ]),
  S('confirm', ["Your confirmation", "Votre confirmation"], [
    info('note', ["Submitting this form sends your information to your preparer. It does not file your return and it does not give anyone permission to deal with the CRA or Revenu Québec for you. After your return is prepared, you will review it and sign a separate authorization before anything is filed.", "Soumettre ce formulaire transmet vos renseignements à votre préparateur. Cela ne produit pas votre déclaration et ne donne à personne la permission de traiter avec l'ARC ou Revenu Québec pour vous. Une fois votre déclaration préparée, vous la réviserez et signerez une autorisation distincte avant que quoi que ce soit ne soit produit."]),
    mu('accuracy', ["Accuracy and completeness", "Exactitude et exhaustivité"], { opts: O('agree|To the best of my knowledge the information I gave is true and complete, and I understand that anything I marked "not sure", "later" or "ask my preparer" is incomplete.|À ma connaissance, les renseignements fournis sont vrais et complets, et je comprends que tout ce que j\'ai indiqué comme « pas certain », « plus tard » ou « demander à mon préparateur » est incomplet.'), req: true, noUnsure: true, noLater: true, noAsk: true }),
    mu('terms', ["Engagement terms", "Conditions du mandat"], { opts: O('agree|I confirm the engagement terms I accepted at the start still apply.|Je confirme que les conditions du mandat acceptées au début s\'appliquent toujours.'), req: true, noUnsure: true, noLater: true, noAsk: true }),
    mu('privacy', ["Privacy", "Vie privée"], { opts: O('agree|I confirm I understand how my information is used, kept and protected.|Je confirme comprendre comment mes renseignements sont utilisés, conservés et protégés.'), req: true, noUnsure: true, noLater: true, noAsk: true }),
  ]),
]);
