// Module B: who the taxpayer is and how to reach them.
import { M, S, tx, ta, dt, yn, rd, sl, mu, fl, sin, ph, em, pc, rw, info, O, yes, no, maybe, eq, isIn, all, any, answered, age } from '../dsl.ts';
import { PROVINCE_OPTS, PROVINCE_OR_OUTSIDE, COUNTRIES } from '../opts.ts';

export const moduleB = M({
  code: 'B', name: 'IDENTIFICATION', phase: 'about', icon: 'user', always: true,
  title: ["About you", "À propos de vous"],
  desc: ["Your legal name, date of birth, identification number, addresses and contact details.", "Votre nom légal, date de naissance, numéro d'identification, adresses et coordonnées."],
  src: ['cra.deductions', 'cra.income'],
  cover: [
    { item: 'Identification: name, date of birth, SIN, mailing address', ref: 'T1 page 1', kind: 'client', qs: ['B.name.*', 'B.id.*', 'B.mail.*'] },
    { item: 'Province or territory of residence on 31 December', ref: 'T1 page 1', kind: 'client', qs: ['B.res.province'] },
    { item: 'Address changes during the year', kind: 'client', qs: ['B.move.*'] },
    { item: 'Citizenship and the optional Elections Canada authorization', ref: 'T1 page 1', kind: 'client', qs: ['B.citizen.*'] },
    { item: 'Death during the year; bankruptcy; authorized representative; accessibility needs', kind: 'client', qs: ['B.status.*', 'B.access.*'] },
    { item: 'Identity verification', kind: 'documents', qs: ['B.verify.*'], note: 'Only used where our verification process cannot rely on your CRA or Revenu Québec account.' },
  ],
}, [
  S('name', ["Your name", "Votre nom"], [
    tx('first', ["Legal first name", "Prénom légal"], { req: true, noUnsure: true, noLater: true, help: ["Exactly as it appears on your Social Insurance Number record or your last notice of assessment.", "Exactement tel qu'il figure à votre dossier du numéro d'assurance sociale ou sur votre dernier avis de cotisation."] }),
    tx('middle', ["Middle name or names", "Deuxième prénom ou prénoms"], { noUnsure: true }),
    tx('last', ["Legal last name", "Nom de famille légal"], { req: true, noUnsure: true, noLater: true }),
    yn('prevNames', ["Have you used a different legal name in the last 3 years?", "Avez-vous utilisé un autre nom légal au cours des 3 dernières années?"], { help: ["For example after a marriage, a divorce or a legal name change.", "Par exemple à la suite d'un mariage, d'un divorce ou d'un changement de nom légal."] }),
    tx('previous', ["Previous name", "Ancien nom"], { show: yes('.prevNames'), req: true }),
    dt('changed', ["Date the name changed", "Date du changement de nom"], { show: yes('.prevNames') }),
  ]),
  S('id', ["Identification", "Identification"], [
    dt('dob', ["Date of birth", "Date de naissance"], { req: true, noUnsure: true, noLater: true, sens: 'protected', why: ["Your age decides which credits and benefits apply and is needed to match your CRA record.", "Votre âge détermine les crédits et prestations applicables et sert à rapprocher votre dossier de l'ARC."] }),
    yn('hasSin', ["Do you have a Canadian Social Insurance Number (SIN)?", "Avez-vous un numéro d'assurance sociale (NAS) canadien?"], { req: true, noUnsure: true }),
    sin('sin', ["Social Insurance Number", "Numéro d'assurance sociale"], { show: yes('.hasSin'), req: true, noUnsure: true, sens: 'restricted', ph: "___ ___ ___", why: ["The CRA identifies your return by your SIN. It is shown masked on screen and only the people working on your return can see it in full.", "L'ARC identifie votre déclaration par votre NAS. Il est masqué à l'écran et seules les personnes qui travaillent à votre déclaration peuvent le voir en entier."], rules: [{ t: 'pattern', v: '^\\d{3}[ -]?\\d{3}[ -]?\\d{3}$', msg: ["A SIN has 9 digits.", "Un NAS compte 9 chiffres."] }] }),
    rd('noSin', ["Why do you not have a SIN?", "Pourquoi n'avez-vous pas de NAS?"], { show: no('.hasSin'), req: true, opts: O('applied|I have applied and am waiting|J\'ai fait une demande et j\'attends', 'itn|I have a CRA individual tax number (ITN)|J\'ai un numéro d\'identification temporaire de l\'ARC (NIT)', 'notEligible|I am not eligible for a SIN|Je ne suis pas admissible à un NAS', 'child|This is for a child who does not have one yet|Il s\'agit d\'un enfant qui n\'en a pas encore', 'other|Another reason|Autre raison'), review: [{ when: { q: '.noSin', op: 'answered' }, sev: 'warning', title: ["No SIN: choose the identifier process before filing", "Aucun NAS : choisir le processus d'identification avant la production"] }] }),
    tx('itn', ["Individual tax number (ITN) or other identifier", "Numéro d'identification temporaire (NIT) ou autre identifiant"], { show: eq('.noSin', 'itn'), sens: 'restricted', noUnsure: true }),
    tx('sinNote', ["Anything else we should know about your identification number", "Autre chose que nous devrions savoir au sujet de votre numéro d'identification"], { show: no('.hasSin') }),
  ]),
  S('res', ["Where you lived on 31 December", "Où vous habitiez le 31 décembre"], [
    sl('province', ["Province or territory where you lived on 31 December of the tax year", "Province ou territoire où vous habitiez le 31 décembre de l'année d'imposition"], {
      opts: PROVINCE_OR_OUTSIDE, req: true, noUnsure: true,
      help: ["This sets your provincial tax and which local credits we ask about. If you moved between provinces during the year, choose where you lived on 31 December and tell us about the move in the next sections.", "Cela détermine votre impôt provincial et les crédits locaux dont nous parlons. Si vous avez déménagé entre provinces durant l'année, choisissez l'endroit où vous habitiez le 31 décembre et parlez-nous du déménagement dans les sections suivantes."],
      why: ["Provincial tax is based on where you lived on 31 December. Quebec has its own separate return.", "L'impôt provincial dépend de l'endroit où vous habitiez le 31 décembre. Le Québec a sa propre déclaration distincte."],
      map: { form: 'T1', line: 'Province or territory of residence on December 31', verified: true }, src: ['cra.provincial'],
      review: [{ when: { q: '.province', op: 'eq', v: 'QC' }, sev: 'info', title: ["Quebec resident: a separate TP-1 return is prepared", "Résident du Québec : une déclaration TP-1 distincte est préparée"] }, { when: { q: '.province', op: 'eq', v: 'OUT' }, sev: 'specialist', specialist: 'Non-resident / international', title: ["Not living in Canada on 31 December", "Ne résidait pas au Canada le 31 décembre"] }],
    }),
    yn('businessElsewhere', ["Did you carry on a business with a permanent establishment in a province or territory other than where you live?", "Avez-vous exploité une entreprise ayant un établissement stable dans une province ou un territoire autre que celui où vous habitez?"], { review: [{ when: { q: '.businessElsewhere', op: 'maybe' }, sev: 'specialist', specialist: 'Multiple jurisdictions', title: ["Business income may need allocating between provinces (Form T2203)", "Le revenu d'entreprise pourrait devoir être réparti entre provinces (formulaire T2203)"] }], map: { form: 'T2203', verified: true }, src: ['cra.provincial'] }),
  ]),
  S('mail', ["Your mailing address", "Votre adresse postale"], [
    tx('line1', ["Street number and name, or PO box", "Numéro et nom de la rue, ou case postale"], { req: true, noUnsure: true }),
    tx('unit', ["Apartment, suite or unit", "Appartement, bureau ou unité"], { noUnsure: true }),
    tx('city', ["City, town or village", "Ville, village ou municipalité"], { req: true, noUnsure: true }),
    sl('prov', ["Province, territory or state", "Province, territoire ou État"], { opts: PROVINCE_OR_OUTSIDE, req: true, noUnsure: true }),
    pc('postal', ["Postal or ZIP code", "Code postal ou ZIP"], { req: true, noUnsure: true, rules: [{ t: 'pattern', v: '^([A-Za-z]\\d[A-Za-z][ -]?\\d[A-Za-z]\\d|\\d{5}(-\\d{4})?)$', msg: ["Use a Canadian postal code such as K1A 0B1, or a US ZIP code.", "Utilisez un code postal canadien comme K1A 0B1, ou un code ZIP américain."] }] }),
    sl('country', ["Country", "Pays"], { opts: COUNTRIES, req: true, noUnsure: true }),
    yn('sameHome', ["Is this also the address where you live?", "Est-ce aussi l'adresse où vous habitez?"], { req: true, noUnsure: true }),
    tx('homeLine1', ["Home street number and name", "Numéro et nom de la rue de votre domicile"], { show: no('.sameHome'), req: true }),
    tx('homeCity', ["Home city", "Ville de votre domicile"], { show: no('.sameHome'), req: true }),
    sl('homeProv', ["Home province, territory or state", "Province, territoire ou État de votre domicile"], { show: no('.sameHome'), opts: PROVINCE_OR_OUTSIDE, req: true }),
    pc('homePostal', ["Home postal or ZIP code", "Code postal ou ZIP de votre domicile"], { show: no('.sameHome') }),
    yn('foreign', ["Do you also have an address outside Canada?", "Avez-vous aussi une adresse à l'extérieur du Canada?"], { help: ["For example a family home or a place you stay for part of the year.", "Par exemple une résidence familiale ou un lieu où vous séjournez une partie de l'année."] }),
    ta('foreignAddr', ["Address outside Canada", "Adresse à l'extérieur du Canada"], { show: yes('.foreign'), req: true }),
    ph('phone', ["Telephone number", "Numéro de téléphone"], { req: true, noUnsure: true, rules: [{ t: 'pattern', v: '^[+()\\d][\\d\\s().+-]{6,}$', msg: ["Enter a phone number.", "Entrez un numéro de téléphone."] }] }),
    em('email', ["Email address", "Adresse courriel"], { req: true, noUnsure: true, rules: [{ t: 'pattern', v: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', msg: ["Enter an email address such as name@example.com.", "Entrez une adresse courriel comme nom@exemple.com."] }] }),
  ]),
  S('move', ["Address changes during the year", "Changements d'adresse durant l'année"], [
    yn('any', ["Did your home address change during the tax year?", "Votre adresse domiciliaire a-t-elle changé durant l'année d'imposition?"], { req: true }),
  ]),
  S('moved', ["A move", "Un déménagement"], [
    dt('date', ["Date you moved in", "Date d'emménagement"], { req: true, label: true, rules: [{ t: 'dateInYear' }] }),
    tx('from', ["Moved from (city and province or country)", "Ancienne adresse (ville et province ou pays)"], { req: true }),
    tx('to', ["Moved to (city and province or country)", "Nouvelle adresse (ville et province ou pays)"], { req: true }),
    yn('workSchool', ["Was the move connected to starting a new job, a business or full-time studies?", "Le déménagement était-il lié à un nouvel emploi, à une entreprise ou à des études à temps plein?"], { help: ["We ask about moving costs later if so.", "Nous poserons ensuite des questions sur les frais de déménagement, le cas échéant."] }),
  ], { show: maybe('B.move.any'), repeat: { label: ["Move", "Déménagement"], add: ["Add another move", "Ajouter un autre déménagement"], min: 1 } }),
  S('citizen', ["Citizenship and Elections Canada", "Citoyenneté et Élections Canada"], [
    yn('canadian', ["Are you a Canadian citizen?", "Êtes-vous citoyen canadien?"], { req: true, noUnsure: true, help: ["Citizenship is different from tax residency and immigration status. We ask each one separately.", "La citoyenneté est différente de la résidence fiscale et du statut d'immigration. Nous posons chaque question séparément."] }),
    mu('other', ["Do you hold any other citizenship?", "Détenez-vous une autre citoyenneté?"], { opts: COUNTRIES.filter((c) => c.v !== 'CA'), help: ["Tick every country. This only helps us spot cross-border questions to ask you later.", "Cochez chaque pays. Cela nous aide seulement à repérer des questions transfrontalières à vous poser plus tard."] }),
    yn('elections', ["Do you authorize the CRA to give your name, address, date of birth and citizenship to Elections Canada to update the National Register of Electors?", "Autorisez-vous l'ARC à transmettre vos nom, adresse, date de naissance et citoyenneté à Élections Canada pour mettre à jour le Registre national des électeurs?"], {
      show: all(yes('.canadian'), age('B.id.dob', 'gte', 18)), noUnsure: true, noLater: true, noAsk: true,
      help: ["This is optional. You must be a Canadian citizen aged 18 or over. Saying yes does not register you to vote by itself.", "Ce choix est facultatif. Vous devez être citoyen canadien et avoir 18 ans ou plus. Répondre oui ne vous inscrit pas automatiquement sur la liste électorale."],
      map: { form: 'T1', line: 'Elections Canada', verified: false }, review: [{ when: { q: '.elections', op: 'answered' }, sev: 'info', title: ["Confirm the Elections Canada wording against the current T1 before filing", "Confirmer le libellé d'Élections Canada selon la T1 actuelle avant la production"] }],
    }),
  ]),
  S('status', ["Other situations that change how we prepare", "Autres situations qui changent notre façon de préparer"], [
    yn('died', ["Did the taxpayer die during the tax year or in the following months?", "Le contribuable est-il décédé durant l'année d'imposition ou dans les mois suivants?"], { req: true, noUnsure: true, review: [{ when: { q: '.died', op: 'yes' }, sev: 'specialist', specialist: 'Deceased taxpayer', title: ["Return for a deceased taxpayer", "Déclaration d'un contribuable décédé"] }] }),
    dt('deathDate', ["Date of death", "Date du décès"], { show: yes('.died'), req: true, sens: 'protected' }),
    yn('bankrupt', ["Did you go bankrupt, or file a proposal, in the tax year or the year before?", "Avez-vous fait faillite ou déposé une proposition durant l'année d'imposition ou l'année précédente?"], { req: true, review: [{ when: { q: '.bankrupt', op: 'maybe' }, sev: 'specialist', specialist: 'Bankruptcy', title: ["Bankruptcy or proposal: more than one return may be needed", "Faillite ou proposition : plus d'une déclaration peut être nécessaire"] }] }),
    dt('bankruptDate', ["Date of bankruptcy or proposal", "Date de la faillite ou de la proposition"], { show: yes('.bankrupt') }),
    tx('trustee', ["Trustee's name and telephone", "Nom et téléphone du syndic"], { show: yes('.bankrupt') }),
  ]),
  S('access', ["Help and accessibility", "Aide et accessibilité"], [
    yn('need', ["Do you need any accommodation to deal with us, such as large print, a phone call instead of messages or an interpreter?", "Avez-vous besoin d'un accommodement pour traiter avec nous, comme de gros caractères, un appel plutôt que des messages ou un interprète?"], { noUnsure: true }),
    ta('details', ["What would help?", "Qu'est-ce qui vous aiderait?"], { show: yes('.need') }),
    yn('rep', ["Do you have a representative or trusted person we should speak to about your return?", "Avez-vous un représentant ou une personne de confiance à qui nous devrions parler au sujet de votre déclaration?"], { noUnsure: true, help: ["Naming someone here is only a note. It does not authorize them with the CRA or Revenu Québec.", "Nommer une personne ici n'est qu'une note. Cela ne l'autorise pas auprès de l'ARC ou de Revenu Québec."] }),
    tx('repName', ["Their name and telephone", "Son nom et son téléphone"], { show: yes('.rep') }),
  ]),
  S('verify', ["Identity verification", "Vérification de l'identité"], [
    info('why', ["We only ask for identity documents when we cannot rely on your CRA or Revenu Québec account, or when someone else is acting for you. Never send a document by email.", "Nous ne demandons des pièces d'identité que lorsque nous ne pouvons pas nous fier à votre dossier de l'ARC ou de Revenu Québec, ou lorsqu'une autre personne agit pour vous. N'envoyez jamais de document par courriel."]),
    fl('photoId', ["Upload one government photo ID.", "Téléversez une pièce d'identité avec photo émise par un gouvernement."], { req: true, sens: 'restricted', docs: [{ key: 'PHOTO_ID', label: ["Government photo ID", "Pièce d'identité avec photo émise par un gouvernement"] }] }),
  ], { show: any(no('B.id.hasSin'), yes('A.behalf.other')) }),
]);
