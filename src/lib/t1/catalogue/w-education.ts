// Module W: education and student-related information.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, rw, sin, info, O, yes, no, maybe, eq, isIn, has, any, all, answered } from '../dsl.ts';
import { COUNTRIES, RELATIONSHIPS } from '../opts.ts';

export const moduleW = M({
  code: 'W', name: 'EDUCATION', phase: 'deductions', icon: 'graduation-cap',
  title: ["Education and student information", "Études et renseignements sur les étudiants"],
  desc: ["Schools attended, tuition, scholarships, student loan interest and what to do with unused amounts.", "Établissements fréquentés, droits de scolarité, bourses, intérêts sur les prêts étudiants et traitement des montants inutilisés."],
  show: any(maybe('F.ded.education'), maybe('F.inc.studentFunding')),
  src: ['cra.students'],
  cover: [
    { item: 'Institutions and countries, program dates, full-time and part-time study', ref: 'T2202, 32300', kind: 'client', qs: ['W.school.*'] },
    { item: 'Tuition and examination fees; slips or certificates; reimbursements', ref: '32300, 32400', kind: 'client', qs: ['W.school.tuition', 'W.school.exam', 'W.school.reimb', 'W.school.slip'] },
    { item: 'Scholarships, bursaries, grants and RESP payments', ref: '13010, 13000', kind: 'client', qs: ['W.school.award', 'W.school.resp'] },
    { item: 'Prior unused tuition balances; proposed transfers and recipient details; no automatic transfer', ref: '32400, 32600', kind: 'client', qs: ['W.carry.*', 'W.transfer.*'] },
    { item: 'Eligible government student-loan interest (not other borrowing)', ref: '31900', kind: 'client', qs: ['W.loan.*'] },
    { item: 'Canada training credit', ref: '45350', kind: 'client', qs: ['W.ctc.*'] },
  ],
}, [
  S('any', ["Studies", "Études"], [
    yn('any', ["Did you, your spouse or a child attend a college, university or other school after high school during the year?", "Vous, votre conjoint ou un enfant avez-vous fréquenté un collège, une université ou un autre établissement après le secondaire durant l'année?"], { req: true }),
  ]),
  S('school', ["A student and school", "Un étudiant et un établissement"], [
    rd('who', ["Who attended?", "Qui a fréquenté?"], { req: true, opts: O('self|Me|Moi', 'spouse|My spouse or partner|Mon conjoint ou ma conjointe', 'child|My child|Mon enfant', 'other|Another person I support|Une autre personne que je soutiens') }),
    tx('student', ["Student's name, if not you", "Nom de l'étudiant, si ce n'est pas vous"], { show: isIn('.who', ['spouse', 'child', 'other']), label: true }),
    tx('name', ["Name of the school", "Nom de l'établissement"], { req: true, label: true }),
    sl('country', ["Country", "Pays"], { opts: COUNTRIES, req: true }),
    tx('program', ["Program or course", "Programme ou cours"]),
    dt('from', ["Start of studies this year", "Début des études cette année"]), dt('to', ["End", "Fin"], { rules: [{ t: 'dateNotBefore', q: '.from' }] }),
    rd('load', ["Full time or part time?", "À temps plein ou à temps partiel?"], { opts: O('full|Full time|Temps plein', 'part|Part time|Temps partiel', 'both|Both during the year|Les deux durant l\'année'), req: true }),
    yn('slip', ["Do you have a T2202 (or Relevé 8)?", "Avez-vous un T2202 (ou un relevé 8)?"], { req: true, help: ["Enter it in the tax slips section. Foreign schools use Form TL11A or TL11C.", "Saisissez-le dans la section sur les feuillets fiscaux. Les établissements étrangers utilisent le formulaire TL11A ou TL11C."] }),
    cur('tuition', ["Tuition you paid", "Droits de scolarité payés"], { show: no('.slip'), help: ["Only if you do not have the slip.", "Seulement si vous n'avez pas le feuillet."] }),
    cur('exam', ["Examination fees for professional or trade exams", "Frais d'examen pour des examens professionnels ou de métier"]),
    cur('reimb', ["Tuition paid back to you by an employer or other person", "Droits de scolarité remboursés par un employeur ou une autre personne"]),
    cur('award', ["Scholarships, bursaries or fellowships received", "Bourses d'études, d'entretien ou de perfectionnement reçues"]),
    cur('resp', ["RESP educational assistance received", "Aide aux études d'un REEE reçue"]),
    yn('foreign', ["Is the school outside Canada?", "L'établissement est-il à l'extérieur du Canada?"]),
    fl('doc', ["Upload the tuition slip or receipts.", "Téléversez le feuillet de scolarité ou les reçus."], { docs: [{ key: 'TUITION_DOC', label: ["Tuition slip or receipts", "Feuillet de scolarité ou reçus"] }] }),
  ], { show: maybe('W.any.any'), repeat: { label: ["Student", "Étudiant"], add: ["Add another student or school", "Ajouter un autre étudiant ou établissement"], min: 1 } }),
  S('carry', ["Unused tuition from earlier years", "Droits de scolarité inutilisés d'années antérieures"], [
    cur('amount', ["Unused tuition amount carried forward, from your notice of assessment", "Montant de scolarité inutilisé reporté, selon votre avis de cotisation"], { map: { form: 'Schedule 11', verified: true }, help: ["Your last notice of assessment shows it. We do not rely on memory for this one.", "Votre dernier avis de cotisation l'indique. Nous ne nous fions pas à la mémoire pour ce montant."] }),
    fl('proof', ["Upload the notice of assessment or Schedule 11.", "Téléversez l'avis de cotisation ou l'annexe 11."], { docs: [{ key: 'TUITION_CARRYFORWARD_PROOF', label: ["Notice or schedule showing unused tuition", "Avis ou annexe indiquant la scolarité inutilisée"] }] }),
  ], { show: maybe('W.any.any') }),
  S('transfer', ["Transferring unused tuition", "Transfert de droits de scolarité inutilisés"], [
    info('read', ["Unused tuition is not transferred automatically. If the student cannot use all of it, we show you the choices and you decide.", "Les droits de scolarité inutilisés ne sont pas transférés automatiquement. Si l'étudiant ne peut pas tous les utiliser, nous vous montrons les choix et vous décidez."]),
    yn('wish', ["Would the student like to transfer some unused tuition to a spouse, parent or grandparent?", "L'étudiant souhaite-t-il transférer une partie des droits inutilisés à un conjoint, un parent ou un grand-parent?"], { review: [{ when: { q: '.wish', op: 'maybe' }, sev: 'warning', title: ["Tuition transfer wanted: confirm the amount, the recipient and the maximum", "Transfert de scolarité souhaité : confirmer le montant, le bénéficiaire et le maximum"] }] }),
    tx('who', ["Who would receive it (name)?", "Qui le recevrait (nom)?"], { show: maybe('.wish') }),
    sl('rel', ["Their relationship to the student", "Son lien avec l'étudiant"], { show: maybe('.wish'), opts: RELATIONSHIPS }),
    sin('sin', ["Their SIN", "Son NAS"], { show: maybe('.wish'), sens: 'restricted' }),
  ], { show: any(maybe('F.ded.education'), maybe('W.any.any')) }),
  S('loan', ["Student loan interest", "Intérêts sur prêts étudiants"], [
    yn('paid', ["Did you pay interest on a student loan?", "Avez-vous payé des intérêts sur un prêt étudiant?"], { req: true }),
    sl('lender', ["Who is the lender?", "Qui est le prêteur?"], { show: maybe('.paid'), req: true, opts: O('federal|Canada Student Loans Program|Programme canadien de prêts aux étudiants', 'provincial|A provincial or territorial student loan program|Un programme provincial ou territorial de prêts aux étudiants', 'bank|A bank, credit union or line of credit|Une banque, une caisse populaire ou une marge de crédit', 'other|Something else|Autre chose'), review: [{ when: { q: '.lender', op: 'eq', v: 'bank' }, sev: 'warning', title: ["Bank loans or lines of credit are not eligible student loans: interest is not claimable here", "Les prêts bancaires et marges de crédit ne sont pas des prêts étudiants admissibles : les intérêts ne sont pas déductibles ici"] }] }),
    cur('interest', ["Interest paid in the year (and in the 5 years before that you have not claimed)", "Intérêts payés durant l'année (et durant les 5 années précédentes non demandées)"], { show: maybe('.paid'), map: { form: 'T1', line: '31900', verified: true } }),
    fl('doc', ["Upload the interest statement.", "Téléversez le relevé d'intérêts."], { show: maybe('.paid'), docs: [{ key: 'STUDENT_LOAN_INTEREST', label: ["Student loan interest statement", "Relevé des intérêts sur prêt étudiant"] }] }),
  ], { show: any(maybe('F.ded.education'), maybe('W.any.any')) }),
  S('ctc', ["Canada training credit", "Crédit canadien pour la formation"], [
    yn('limit', ["Does your notice of assessment show a Canada training credit limit?", "Votre avis de cotisation indique-t-il un plafond du crédit canadien pour la formation?"], { help: ["It is shown as an amount you can claim for training fees.", "Il figure comme un montant que vous pouvez demander pour des frais de formation."] }),
    cur('amount', ["The limit shown", "Le plafond indiqué"], { show: maybe('.limit') }),
    cur('fees', ["Eligible training fees you paid", "Frais de formation admissibles que vous avez payés"], { show: maybe('.limit'), map: { form: 'T1', line: '45350', verified: true } }),
  ], { show: maybe('F.ded.education') }),
]);
