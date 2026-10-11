// Module C: residency, immigration, emigration and time outside Canada.
import { M, S, tx, ta, cur, num, dt, yn, rd, sl, mu, fl, rw, info, O, yes, no, maybe, eq, isIn, has, all, any, answered, some } from '../dsl.ts';
import { COUNTRIES, CURRENCIES, PROVINCE_OR_OUTSIDE } from '../opts.ts';

const PERIOD = O('before|Before I became a Canadian resident|Avant que je devienne résident du Canada', 'during|While I was a Canadian resident|Pendant que j\'étais résident du Canada', 'after|After I stopped being a Canadian resident|Après que j\'ai cessé d\'être résident du Canada');
const INCOME_TYPE = O('employment|Employment|Emploi', 'business|Business or self-employment|Entreprise ou travail autonome', 'pension|Pension or retirement|Pension ou retraite', 'rental|Rental|Location', 'interest|Interest|Intérêts', 'dividends|Dividends|Dividendes', 'gains|Sale of property or investments|Vente de biens ou de placements', 'benefits|Government benefits|Prestations gouvernementales', 'other|Other|Autre');

export const moduleC = M({
  code: 'C', name: 'RESIDENCY', phase: 'about', icon: 'globe', always: true,
  title: ["Residency, moves and time abroad", "Résidence, déménagements et séjours à l'étranger"],
  desc: ["Where you lived during the year, arriving in or leaving Canada, and any ties or income abroad.", "Où vous avez vécu durant l'année, l'arrivée au Canada ou le départ, et les liens ou revenus à l'étranger."],
  src: ['cra.newcomer', 'cra.emigrant'],
  cover: [
    { item: 'Countries and provinces lived in; arrival, departure and move dates', kind: 'client', qs: ['C.life.*', 'C.newcomer.*', 'C.emigrant.*'] },
    { item: 'Residential ties: homes, spouse and dependants, work, other ties', kind: 'client', qs: ['C.ties.*'] },
    { item: 'Another country treating the person as resident; foreign returns and tax paid', kind: 'client', qs: ['C.other.*', 'C.foreigntax.*'] },
    { item: 'Income before arrival, while resident and after departure (T1 residency-period reporting)', kind: 'client', qs: ['C.period.*'] },
    { item: 'Spouse or partner worldwide income for the same periods', kind: 'client', qs: ['C.spouse.*'] },
    { item: 'Property owned on arrival or departure; deemed acquisition and disposition', kind: 'client', qs: ['C.asset.*'] },
    { item: 'Canadian-source income received while non-resident', ref: 'NR4, Part XIII', kind: 'client', qs: ['C.nr.*'] },
    { item: 'Treaty residency tie-breaker, deemed residency, departure tax (T1161, T1243, T1244), section 216 rental election, non-resident return rules', ref: 'T1161, T1243, T1244, T1159', kind: 'specialist', qs: ['C.life.left', 'C.other.claims', 'C.xborder.*'], note: 'These are never decided from the client answers: they create specialist review items.' },
    { item: 'US citizenship, green card and other cross-border facts', kind: 'specialist', qs: ['C.xborder.*'] },
  ],
}, [
  S('life', ["Where you lived", "Où vous avez vécu"], [
    info('intro', ["These questions describe the facts only. We decide your tax residency from them: you do not need to.", "Ces questions décrivent seulement les faits. C'est nous qui déterminons votre résidence fiscale à partir de ceux-ci : vous n'avez pas à le faire."]),
    yn('arrived', ["During the tax year, did you move to Canada to live, or return to live here after living abroad?", "Durant l'année d'imposition, avez-vous déménagé au Canada pour y vivre, ou y êtes-vous revenu après avoir vécu à l'étranger?"], { req: true }),
    yn('left', ["During the tax year, did you leave Canada to live somewhere else?", "Durant l'année d'imposition, avez-vous quitté le Canada pour vivre ailleurs?"], { req: true, review: [{ when: { q: '.left', op: 'maybe' }, sev: 'specialist', specialist: 'Emigration', title: ["Possible emigration: residency, departure tax and property reporting need review", "Émigration possible : la résidence, l'impôt de départ et la déclaration des biens doivent être examinés"] }] }),
    yn('abroadLong', ["Apart from that, were you away from Canada for more than 30 days in total at any time during the year?", "Hormis cela, avez-vous été absent du Canada plus de 30 jours au total durant l'année?"], { req: true, help: ["Count holidays, work trips, study, family visits and medical stays.", "Comptez les vacances, voyages de travail, études, visites familiales et séjours médicaux."] }),
    yn('movedProv', ["Did you move from one Canadian province or territory to another during the year?", "Avez-vous déménagé d'une province ou d'un territoire canadien à un autre durant l'année?"], { req: true, help: ["Your province on 31 December decides your provincial tax. We still need the dates.", "Votre province au 31 décembre détermine votre impôt provincial. Nous avons tout de même besoin des dates."] }),
  ]),
  S('place', ["A place you lived", "Un lieu où vous avez vécu"], [
    sl('country', ["Country", "Pays"], { opts: COUNTRIES, req: true, label: true }),
    sl('province', ["Province or territory, if in Canada", "Province ou territoire, si au Canada"], { opts: PROVINCE_OR_OUTSIDE.filter((o) => o.v !== 'OUT'), show: eq('.country', 'CA') }),
    dt('from', ["From", "Du"], { req: true }),
    dt('to', ["To", "Au"], { help: ["Leave blank if you were still living there on 31 December.", "Laissez vide si vous y habitiez encore le 31 décembre."], rules: [{ t: 'dateNotBefore', q: '.from', msg: ["This date is before the start date.", "Cette date précède la date de début."] }] }),
    rd('home', ["What was your home there?", "Quel était votre domicile à cet endroit?"], { opts: O('own|A home I owned|Une maison m\'appartenant', 'rent|A home I rented|Un logement que je louais', 'family|With family or friends|Chez des proches ou des amis', 'employer|Provided by an employer or school|Fourni par un employeur ou une école', 'temporary|Hotel or short stay|Hôtel ou court séjour', 'other|Other|Autre') }),
  ], { show: any(maybe('C.life.arrived'), maybe('C.life.left'), maybe('C.life.movedProv'), maybe('C.life.abroadLong')), repeat: { label: ["Place", "Lieu"], add: ["Add another place you lived", "Ajouter un autre lieu où vous avez vécu"] } }),
  S('trip', ["A trip or stay outside Canada", "Un voyage ou un séjour à l'extérieur du Canada"], [
    sl('country', ["Country", "Pays"], { opts: COUNTRIES, req: true, label: true }),
    dt('from', ["Left Canada on", "Départ du Canada le"], { req: true }),
    dt('to', ["Returned on", "Retour le"], { rules: [{ t: 'dateNotBefore', q: '.from' }] }),
    sl('reason', ["Reason", "Motif"], { opts: O('holiday|Holiday|Vacances', 'work|Work|Travail', 'study|Study|Études', 'family|Family|Famille', 'medical|Medical care|Soins médicaux', 'other|Other|Autre'), req: true }),
    yn('keptHome', ["Did you keep a home available to you in Canada during this time?", "Avez-vous conservé un logement à votre disposition au Canada durant cette période?"]),
  ], { show: maybe('C.life.abroadLong'), repeat: { label: ["Trip", "Voyage"], add: ["Add another trip", "Ajouter un autre voyage"] } }),
  S('newcomer', ["Arriving in Canada", "Arrivée au Canada"], [
    dt('arrival', ["Date you arrived to live in Canada", "Date de votre arrivée pour vivre au Canada"], { req: true, rules: [{ t: 'dateInYear' }], src: ['cra.newcomer'] }),
    sl('from', ["Country you came from", "Pays d'où vous venez"], { opts: COUNTRIES, req: true }),
    yn('firstTime', ["Is this the first time you have ever lived in Canada?", "Est-ce la première fois que vous vivez au Canada?"], { req: true }),
    yn('before', ["Did you live in Canada at any time before?", "Avez-vous déjà vécu au Canada auparavant?"], { show: no('.firstTime') }),
    ta('prior', ["When were those earlier periods in Canada?", "Quelles étaient ces périodes antérieures au Canada?"], { show: any(yes('.before'), no('.firstTime')), help: ["Approximate years are fine.", "Des années approximatives suffisent."] }),
    rd('status', ["What is your immigration status in Canada today?", "Quel est votre statut d'immigration au Canada aujourd'hui?"], { req: true, opts: O('citizen|Canadian citizen|Citoyen canadien', 'pr|Permanent resident|Résident permanent', 'work|Work permit holder|Titulaire d\'un permis de travail', 'study|Study permit holder|Titulaire d\'un permis d\'études', 'refugee|Refugee claimant or protected person|Demandeur d\'asile ou personne protégée', 'visitor|Visitor|Visiteur', 'other|Other|Autre'), help: ["Your immigration status is separate from your tax residency. We ask only so we can request the right documents.", "Votre statut d'immigration est distinct de votre résidence fiscale. Nous le demandons seulement pour réclamer les bons documents."], sens: 'protected' }),
    dt('statusDate', ["Date that status began", "Date de début de ce statut"]),
    fl('immDoc', ["Upload your immigration document or permit, if we ask for it.", "Téléversez votre document d'immigration ou permis, si nous vous le demandons."], { docs: [{ key: 'IMMIGRATION_DOC', label: ["Immigration document or permit", "Document d'immigration ou permis"], optional: true }], sens: 'protected' }),
    yn('worldwide', ["Did you receive income from outside Canada before you arrived?", "Avez-vous reçu un revenu de l'extérieur du Canada avant votre arrivée?"], { help: ["We list it in the income-by-period section below.", "Nous l'inscrivons dans la section sur le revenu par période ci-dessous."] }),
  ], { show: maybe('C.life.arrived') }),
  S('emigrant', ["Leaving Canada", "Départ du Canada"], [
    dt('departure', ["Date you left Canada to live somewhere else", "Date à laquelle vous avez quitté le Canada pour vivre ailleurs"], { req: true, rules: [{ t: 'dateInYear' }] }),
    sl('to', ["Country you moved to", "Pays où vous avez déménagé"], { opts: COUNTRIES, req: true }),
    rd('return', ["Do you plan to come back to live in Canada?", "Prévoyez-vous revenir vivre au Canada?"], { opts: O('no|No|Non', 'later|Yes, within about two years|Oui, d\'ici environ deux ans', 'maybe|Possibly later|Peut-être plus tard', 'unsure|I do not know|Je ne sais pas') }),
    yn('keptHome', ["Did you keep a home in Canada available to you after you left?", "Avez-vous conservé un logement à votre disposition au Canada après votre départ?"], { req: true }),
    rd('family', ["Where did your spouse or partner and children live after you left?", "Où vivaient votre conjoint ou conjointe et vos enfants après votre départ?"], { opts: O('with|They moved with me|Ils ont déménagé avec moi', 'canada|They stayed in Canada|Ils sont restés au Canada', 'mixed|Some came and some stayed|Certains m\'ont suivi, d\'autres sont restés', 'none|I have no spouse or children|Je n\'ai ni conjoint ni enfant') }),
    yn('canadianAccounts', ["Do you still have Canadian bank accounts, credit cards, a driver's licence or health coverage?", "Avez-vous encore des comptes bancaires canadiens, des cartes de crédit, un permis de conduire ou une couverture santé?"]),
    yn('job', ["Are you working or running a business outside Canada now?", "Travaillez-vous ou exploitez-vous une entreprise à l'extérieur du Canada maintenant?"]),
  ], { show: maybe('C.life.left') }),
  S('ties', ["Your ties to Canada and elsewhere", "Vos liens avec le Canada et l'étranger"], [
    yn('homeCanada', ["During the year, did you have a home in Canada available to you (owned, rented or lent to you)?", "Durant l'année, aviez-vous un logement au Canada à votre disposition (que vous possédiez, louiez ou qui vous était prêté)?"], { req: true }),
    yn('homeAbroad', ["During the year, did you have a home outside Canada available to you?", "Durant l'année, aviez-vous un logement à l'extérieur du Canada à votre disposition?"], { req: true }),
    rd('familyWhere', ["Where do your spouse or partner and dependants live?", "Où vivent votre conjoint ou conjointe et les personnes à votre charge?"], { opts: O('canada|In Canada|Au Canada', 'abroad|Outside Canada|À l\'extérieur du Canada', 'both|Some in Canada, some abroad|Certains au Canada, d\'autres à l\'étranger', 'na|I have none|Je n\'en ai pas'), req: true }),
    rd('jobWhere', ["Where did you work during the year?", "Où avez-vous travaillé durant l'année?"], { opts: O('canada|Only in Canada|Seulement au Canada', 'abroad|Only outside Canada|Seulement à l\'extérieur du Canada', 'both|Both|Les deux', 'none|I did not work|Je n\'ai pas travaillé') }),
    mu('other', ["Which of these ties did you have?", "Lesquels de ces liens aviez-vous?"], { opts: O('bank|Bank or investment accounts in Canada|Comptes bancaires ou de placement au Canada', 'licence|Canadian driver\'s licence|Permis de conduire canadien', 'health|Provincial health coverage|Couverture santé provinciale', 'clubs|Memberships or clubs|Abonnements ou clubs', 'car|Car or other vehicle in Canada|Voiture ou autre véhicule au Canada', 'storage|Personal belongings stored in Canada|Effets personnels entreposés au Canada', 'none|None of these|Aucun de ces liens') }),
  ], { show: any(maybe('C.life.arrived'), maybe('C.life.left'), maybe('C.life.abroadLong')) }),
  S('other', ["Another country", "Un autre pays"], [
    yn('claims', ["Is any other country treating you as a resident for tax, or asking you to file a tax return there?", "Un autre pays vous considère-t-il comme résident aux fins de l'impôt, ou vous demande-t-il de produire une déclaration?"], { req: true, review: [{ when: { q: '.claims', op: 'maybe' }, sev: 'specialist', specialist: 'Treaty residency', title: ["Another country may treat the taxpayer as resident: treaty tie-breaker review", "Un autre pays pourrait considérer le contribuable comme résident : examen de la convention fiscale"] }] }),
    sl('country', ["Which country?", "Quel pays?"], { opts: COUNTRIES, show: maybe('.claims'), req: true }),
    yn('filed', ["Did you file a return there for this year?", "Avez-vous produit une déclaration là-bas pour cette année?"], { show: maybe('.claims') }),
    fl('return', ["Upload that return or assessment.", "Téléversez cette déclaration ou cet avis de cotisation."], { show: yes('.filed'), docs: [{ key: 'FOREIGN_RETURN', label: ["Foreign income tax return or assessment", "Déclaration de revenus ou avis de cotisation étranger"] }] }),
  ], { show: any(maybe('C.life.arrived'), maybe('C.life.left'), maybe('C.life.abroadLong'), maybe('F.inc.foreign')) }),
  S('foreigntax', ["Foreign tax paid", "Impôt étranger payé"], [
    sl('country', ["Country", "Pays"], { opts: COUNTRIES, req: true, label: true }),
    tx('kind', ["What was the tax on? (for example wages, a pension, dividends)", "Sur quoi portait l'impôt? (par exemple salaire, pension, dividendes)"], { req: true }),
    cur('amount', ["Tax paid, in the currency it was paid in", "Impôt payé, dans la devise où il a été payé"], { req: true }),
    sl('currency', ["Currency", "Devise"], { opts: CURRENCIES, req: true }),
    cur('cad', ["Canadian dollar amount, if you know it", "Montant en dollars canadiens, si vous le connaissez"], { help: ["Leave blank if unsure: we convert it with the Bank of Canada rate.", "Laissez vide en cas de doute : nous le convertissons au taux de la Banque du Canada."] }),
    fl('proof', ["Upload the foreign tax slip or receipt.", "Téléversez le feuillet ou le reçu d'impôt étranger."], { docs: [{ key: 'FOREIGN_TAX_PROOF', label: ["Proof of foreign tax paid", "Preuve de l'impôt étranger payé"] }] }),
  ], { show: yes('C.other.filed'), repeat: { label: ["Foreign tax", "Impôt étranger"], add: ["Add another", "Ajouter un autre"] } }),
  S('period', ["Income by period", "Revenu par période"], [
    sl('period', ["When did you receive it?", "Quand l'avez-vous reçu?"], { opts: PERIOD, req: true }),
    sl('type', ["What kind of income was it?", "De quel genre de revenu s'agissait-il?"], { opts: INCOME_TYPE, req: true, label: true }),
    sl('country', ["Country it came from", "Pays d'origine"], { opts: COUNTRIES, req: true }),
    cur('amount', ["Gross amount, in the currency received", "Montant brut, dans la devise reçue"], { req: true }),
    sl('currency', ["Currency", "Devise"], { opts: CURRENCIES, req: true }),
    cur('withheld', ["Tax withheld at source", "Impôt retenu à la source"]),
    tx('payer', ["Who paid it?", "Qui l'a versé?"]),
    fl('proof', ["Upload the statement or slip.", "Téléversez le relevé ou le feuillet."], { docs: [{ key: 'PERIOD_INCOME_PROOF', label: ["Statement for income in a residency period", "Relevé du revenu pour une période de résidence"], optional: true }] }),
  ], { show: any(maybe('C.life.arrived'), maybe('C.life.left')), repeat: { label: ["Income", "Revenu"], add: ["Add more income", "Ajouter un autre revenu"] } }),
  S('spouse', ["Your spouse's income in those periods", "Le revenu de votre conjoint durant ces périodes"], [
    cur('before', ["Spouse or partner's income from all sources before they or you became a Canadian resident, in Canadian dollars", "Revenu de votre conjoint de toutes provenances avant que lui ou vous deveniez résident du Canada, en dollars canadiens"], { help: ["Needed for credits that depend on your family income. Your best figure is fine for now.", "Nécessaire pour les crédits qui dépendent du revenu familial. Votre meilleur chiffre suffit pour l'instant."] }),
    rd('basis', ["Is that figure confirmed or an estimate?", "Ce chiffre est-il confirmé ou estimé?"], { opts: O('confirmed|Confirmed from documents|Confirmé par des documents', 'estimate|An estimate|Une estimation'), req: answered('.before') }),
  ], { show: all(any(maybe('C.life.arrived'), maybe('C.life.left')), any(eq('D.status.marital', 'married'), eq('D.status.marital', 'common_law'))) }),
  S('asset', ["Property you owned when you arrived or left", "Biens que vous possédiez à votre arrivée ou à votre départ"], [
    tx('desc', ["What is the property?", "De quel bien s'agit-il?"], { req: true, label: true, ph: "House in Mumbai, shares of ABC Ltd, bank account" }),
    sl('country', ["Where is it?", "Où se trouve-t-il?"], { opts: COUNTRIES, req: true }),
    dt('acquired', ["When did you get it?", "Quand l'avez-vous obtenu?"]),
    cur('cost', ["What it cost you, in the currency you paid", "Ce qu'il vous a coûté, dans la devise payée"]),
    cur('value', ["What it was worth on the day you arrived or left", "Sa valeur le jour de votre arrivée ou de votre départ"], { help: ["A statement, appraisal or listing price from around that date is best.", "Un relevé, une évaluation ou un prix affiché à cette date est préférable."] }),
    sl('currency', ["Currency of those amounts", "Devise de ces montants"], { opts: CURRENCIES }),
    fl('proof', ["Upload a statement or valuation.", "Téléversez un relevé ou une évaluation."], { docs: [{ key: 'ASSET_VALUATION', label: ["Statement or valuation on arrival or departure", "Relevé ou évaluation à l'arrivée ou au départ"], optional: true }] }),
  ], { show: any(maybe('C.life.arrived'), maybe('C.life.left')), repeat: { label: ["Property", "Bien"], add: ["Add more property", "Ajouter un autre bien"] }, desc: ["List property worth more than about $10,000 in total, and any real estate, shares or business interests.", "Indiquez les biens valant plus d'environ 10 000 $ au total, ainsi que tout immeuble, action ou intérêt dans une entreprise."] }),
  S('nr', ["Canadian income received while living abroad", "Revenu canadien reçu pendant que vous viviez à l'étranger"], [
    tx('payer', ["Who paid you?", "Qui vous a payé?"], { req: true, label: true }),
    sl('type', ["What kind of income?", "Quel genre de revenu?"], { opts: INCOME_TYPE, req: true }),
    cur('amount', ["Amount received", "Montant reçu"], { req: true }),
    cur('withheld', ["Canadian tax withheld (Part XIII)", "Impôt canadien retenu (partie XIII)"]),
    fl('slip', ["Upload the NR4 or other slip.", "Téléversez le feuillet NR4 ou autre feuillet."], { docs: [{ key: 'NR4', label: ["NR4 or other non-resident slip", "Feuillet NR4 ou autre feuillet de non-résident"] }] }),
  ], { show: maybe('C.life.left'), repeat: { label: ["Canadian-source income", "Revenu de source canadienne"], add: ["Add more", "Ajouter un autre"] }, desc: ["Rent from a Canadian property, a Canadian pension, interest or dividends paid after you left.", "Loyer d'un immeuble canadien, pension canadienne, intérêts ou dividendes versés après votre départ."] }),
  S('xborder', ["Other cross-border facts", "Autres éléments transfrontaliers"], [
    yn('usCitizen', ["Are you a United States citizen?", "Êtes-vous citoyen des États-Unis?"], { req: true, review: [{ when: { q: '.usCitizen', op: 'maybe' }, sev: 'specialist', specialist: 'US cross-border', title: ["US citizen: a US return and foreign account reporting may be required", "Citoyen américain : une déclaration américaine et la déclaration de comptes étrangers peuvent être requises"] }] }),
    yn('greenCard', ["Do you hold, or have you ever held, a US green card?", "Détenez-vous ou avez-vous déjà détenu une carte verte américaine?"], { req: true, review: [{ when: { q: '.greenCard', op: 'maybe' }, sev: 'specialist', specialist: 'US cross-border', title: ["US green card holder: US tax residency review", "Titulaire de carte verte : examen de la résidence fiscale américaine"] }] }),
    yn('usReturn', ["Did you file, or were you required to file, a US income tax return for this year?", "Avez-vous produit ou deviez-vous produire une déclaration de revenus américaine pour cette année?"], { show: any(maybe('.usCitizen'), maybe('.greenCard')) }),
    yn('substantial', ["Did you spend a lot of time in the United States this year or in recent years?", "Avez-vous passé beaucoup de temps aux États-Unis cette année ou récemment?"], { help: ["Our review uses the days you were in the US. A rough count is enough.", "Notre examen utilise le nombre de jours passés aux É.-U. Un décompte approximatif suffit."] }),
    num('usDays', ["About how many days were you in the United States this year?", "Environ combien de jours avez-vous passé aux États-Unis cette année?"], { show: yes('.substantial'), unit: 'days', rules: [{ t: 'min', v: 0 }, { t: 'max', v: 366 }] }),
  ]),
]);
