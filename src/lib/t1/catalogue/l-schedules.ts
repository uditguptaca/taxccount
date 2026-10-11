// Module L: shared schedules for vehicles, workspaces and assets that can serve employment, business or rental.
import { M, S, tx, ta, cur, dt, yn, rd, sl, mu, fl, num, pct, rw, info, O, yes, no, maybe, eq, isIn, any, all, answered, gt } from '../dsl.ts';
import { CURRENCIES } from '../opts.ts';

const ACTIVITY = O('employment|My job (employment)|Mon emploi', 'business|My business (self-employment)|Mon entreprise (travail autonome)', 'farm|Farming or fishing|Agriculture ou pêche', 'rental|A rental property|Un immeuble locatif', 'mixed|More than one of these|Plus d\'une de ces activités');
const VEH_EXP = O('fuel|Fuel and oil|Carburant et huile', 'insurance|Insurance|Assurance', 'licence|Licence and registration|Permis et immatriculation', 'maintenance|Repairs and maintenance|Réparations et entretien', 'lease|Lease payments|Paiements de location', 'interest|Loan interest|Intérêts sur le prêt', 'parking|Parking and tolls|Stationnement et péages', 'other|Other|Autres');
const HOME_EXP = O('heat|Heat|Chauffage', 'electricity|Electricity|Électricité', 'water|Water|Eau', 'insurance|Home insurance|Assurance habitation', 'maintenance|Maintenance and minor repairs|Entretien et petites réparations', 'mortgage|Mortgage interest|Intérêts hypothécaires', 'tax|Property taxes|Taxes foncières', 'rent|Rent|Loyer', 'internet|Internet and phone|Internet et téléphone', 'other|Other|Autres');

export const moduleL = M({
  code: 'L', name: 'VEHICLE_WORKSPACE', phase: 'income', icon: 'car',
  title: ["Vehicles, workspace and equipment", "Véhicules, espace de travail et équipement"],
  desc: ["A vehicle, a home workspace or equipment used for work. Each one is entered once and linked to the job, business or rental it serves.", "Un véhicule, un espace de travail à domicile ou du matériel utilisé pour le travail. Chacun est saisi une seule fois et lié à l'emploi, à l'entreprise ou à l'immeuble locatif qu'il sert."],
  show: any(maybe('F.inc.selfEmp'), maybe('F.inc.platform'), maybe('F.inc.farming'), maybe('F.inc.fishing'), maybe('F.inc.rental'), maybe('F.ded.employExpenses')),
  src: ['cra.selfEmp', 'cra.employExp', 'cra.homeOffice'],
  cover: [
    { item: 'Vehicle ownership or lease, dates, kilometres, logbook, operating costs, reimbursements, financing, disposal', ref: 'T2125 Part 5, T777 Part 4', kind: 'client', qs: ['L.veh.*'] },
    { item: 'Home workspace: size, exclusive or shared use, periods, expense categories, reimbursements and other claims on the same space', ref: 'T2125 Part 7, T777 Part 2', kind: 'client', qs: ['L.home.*'] },
    { item: 'Assets: acquisition, cost, rebate treatment, date available for use, allocation, prior depreciation, disposition', ref: 'Capital cost allowance, Schedule 8-type', kind: 'client', qs: ['L.asset.*'] },
    { item: 'The same expense claimed twice across activities', kind: 'derived', qs: ['L.veh.share', 'L.home.otherClaims', 'L.asset.share'], note: 'The review step adds the activity shares of a vehicle, space or asset and flags a total above 100 per cent.' },
  ],
}, [
  S('any', ["What you used for work", "Ce que vous avez utilisé pour le travail"], [
    yn('veh', ["Did you use a vehicle for your job, business, farm or rental (other than driving to a regular workplace)?", "Avez-vous utilisé un véhicule pour votre emploi, votre entreprise, votre ferme ou votre immeuble locatif (autrement que pour aller à un lieu de travail habituel)?"], { req: true }),
    yn('home', ["Did you use part of your home as a workspace?", "Avez-vous utilisé une partie de votre domicile comme espace de travail?"], { req: true }),
    yn('asset', ["Did you buy, sell or start or stop using equipment or another asset for work, business or rental?", "Avez-vous acheté ou vendu du matériel ou un autre bien pour le travail, l'entreprise ou la location, ou commencé ou cessé de l'utiliser?"], { req: true }),
  ]),
  S('veh', ["A vehicle", "Un véhicule"], [
    tx('desc', ["Vehicle (year, make and model)", "Véhicule (année, marque et modèle)"], { req: true, label: true }),
    rd('own', ["Do you own it, lease it, or borrow it?", "Le possédez-vous, le louez-vous ou l'empruntez-vous?"], { req: true, opts: O('own|I own it (paid for)|Je le possède (payé)', 'financed|I own it with a loan|Je le possède avec un prêt', 'lease|I lease it|Je le loue', 'other|Someone else owns it|Il appartient à quelqu\'un d\'autre') }),
    dt('acquired', ["Date you bought or leased it", "Date d'achat ou de location"]),
    cur('price', ["Purchase price or total lease cost, including taxes", "Prix d'achat ou coût total de location, taxes comprises"]),
    sl('use', ["Which activity do you use it for?", "Pour quelle activité l'utilisez-vous?"], { opts: ACTIVITY, req: true }),
    tx('which', ["Which employer, business or property?", "Quel employeur, quelle entreprise ou quel immeuble?"], { show: any(eq('.use', 'mixed'), eq('.use', 'employment'), eq('.use', 'business')) }),
    num('totalKm', ["Total kilometres driven in the year", "Total de kilomètres parcourus dans l'année"], { req: true, unit: 'km', rules: [{ t: 'min', v: 0 }] }),
    num('workKm', ["Kilometres driven for work, business, farm or rental", "Kilomètres parcourus pour le travail, l'entreprise, la ferme ou la location"], { req: true, unit: 'km', rules: [{ t: 'min', v: 0 }, { t: 'lteQ', q: '.totalKm', msg: ["Work kilometres cannot be more than total kilometres.", "Les kilomètres de travail ne peuvent pas dépasser le total des kilomètres."] }] }),
    pct('share', ["What percent of the work use belongs to this activity (if it serves more than one)?", "Quel pourcentage de l'usage professionnel appartient à cette activité (si le véhicule en sert plus d'une)?"], { show: eq('.use', 'mixed'), unit: '%', rules: [{ t: 'min', v: 0 }, { t: 'max', v: 100 }] }),
    yn('log', ["Do you have a logbook or app record of your trips?", "Avez-vous un registre ou une application de vos déplacements?"], { req: true, help: ["The CRA can ask for it. A logbook covering the whole year is best.", "L'ARC peut le demander. Un registre couvrant toute l'année est préférable."], review: [{ when: { q: '.log', op: 'no' }, sev: 'warning', title: ["No logbook for vehicle kilometres: the claim may need to be reduced or reconstructed", "Aucun registre des kilomètres : la demande devra peut-être être réduite ou reconstituée"] }] }),
    fl('logFile', ["Upload your logbook or mileage report.", "Téléversez votre registre ou rapport de kilométrage."], { show: yes('.log'), docs: [{ key: 'VEHICLE_LOG', label: ["Vehicle logbook or mileage report", "Registre ou rapport de kilométrage du véhicule"] }] }),
    rw('expenses', ["Costs of the vehicle for the whole year", "Coûts du véhicule pour toute l'année"], { cols: [{ id: 'cat', t: ["Category", "Catégorie"], type: 'select', opts: VEH_EXP }, { id: 'amount', t: ["Total paid", "Total payé"], type: 'currency' }], help: ["The full year's costs for the vehicle, not only the work part. We apply the work share.", "Les coûts de toute l'année pour le véhicule, pas seulement la part de travail. Nous appliquons la part de travail."] }),
    cur('reimb', ["Amount an employer or client reimbursed or paid you for vehicle costs", "Montant qu'un employeur ou un client vous a remboursé ou versé pour les frais du véhicule"]),
    cur('loanInterest', ["Interest paid on a car loan in the year", "Intérêts payés sur un prêt auto durant l'année"], { show: eq('.own', 'financed') }),
    dt('disposed', ["Date you sold or disposed of it, if you did", "Date de vente ou de disposition, le cas échéant"]),
    cur('proceeds', ["What you sold it for", "Prix de vente"], { show: answered('.disposed') }),
    fl('docs', ["Upload the purchase or lease contract and loan statement.", "Téléversez le contrat d'achat ou de location et le relevé du prêt."], { docs: [{ key: 'VEHICLE_CONTRACT', label: ["Vehicle purchase or lease contract and loan statement", "Contrat d'achat ou de location du véhicule et relevé du prêt"], optional: true }] }),
  ], { show: maybe('L.any.veh'), repeat: { label: ["Vehicle", "Véhicule"], add: ["Add another vehicle", "Ajouter un autre véhicule"], min: 1 } }),
  S('home', ["A home workspace", "Un espace de travail à domicile"], [
    sl('use', ["Which activity does it serve?", "Quelle activité sert-il?"], { opts: ACTIVITY, req: true, label: true }),
    num('homeSize', ["Total area of your home (square feet or square metres, say which)", "Superficie totale de votre domicile (pieds carrés ou mètres carrés, précisez)"], { req: true, unit: 'area' }),
    num('workSize', ["Area used for work, in the same unit", "Superficie utilisée pour le travail, dans la même unité"], { req: true, unit: 'area', rules: [{ t: 'lteQ', q: '.homeSize', msg: ["The workspace cannot be bigger than the home.", "L'espace de travail ne peut pas être plus grand que le domicile."] }] }),
    yn('exclusive', ["Is the space used only for work?", "L'espace sert-il uniquement au travail?"], { req: true, help: ["For example a spare room used only as an office. A kitchen table is shared use.", "Par exemple une chambre d'appoint servant seulement de bureau. Une table de cuisine est un usage partagé."] }),
    yn('clients', ["Do you meet clients or customers there regularly?", "Y rencontrez-vous régulièrement des clients?"], { show: eq('.use', 'business') }),
    num('hours', ["Hours per week you work there", "Heures par semaine où vous y travaillez"], { unit: 'hours', rules: [{ t: 'min', v: 0 }, { t: 'max', v: 120 }] }),
    num('months', ["Months of the year you used it", "Mois de l'année où vous l'avez utilisé"], { unit: 'months', rules: [{ t: 'min', v: 0 }, { t: 'max', v: 12 }] }),
    rw('expenses', ["Home costs for the whole year", "Coûts du domicile pour toute l'année"], { cols: [{ id: 'cat', t: ["Category", "Catégorie"], type: 'select', opts: HOME_EXP }, { id: 'amount', t: ["Total paid", "Total payé"], type: 'currency' }] }),
    cur('reimb', ["Amount your employer or client reimbursed for home costs", "Montant qu'un employeur ou un client a remboursé pour les frais du domicile"]),
    yn('otherClaims', ["Is the same space or any of these costs also claimed for another job, business or rental?", "Le même espace ou certains de ces coûts sont-ils aussi demandés pour un autre emploi, une autre entreprise ou un autre immeuble locatif?"], { req: true, review: [{ when: { q: '.otherClaims', op: 'maybe' }, sev: 'warning', title: ["Same space or costs claimed for more than one activity: allocate so they are not counted twice", "Même espace ou mêmes coûts demandés pour plus d'une activité : répartir pour ne pas les compter deux fois"] }] }),
    fl('t2200', ["Upload the T2200 or TP-64.3 signed by your employer.", "Téléversez le T2200 ou le TP-64.3 signé par votre employeur."], { show: eq('.use', 'employment'), docs: [{ key: 'T2200', label: ["T2200 or TP-64.3 signed by the employer", "T2200 ou TP-64.3 signé par l'employeur"] }], src: ['cra.homeOffice'], help: ["The temporary flat-rate method no longer exists for 2023 and later: employees claim actual costs and need this signed form.", "La méthode à taux fixe temporaire n'existe plus pour 2023 et après : les employés demandent les coûts réels et ont besoin de ce formulaire signé."] }),
  ], { show: maybe('L.any.home'), repeat: { label: ["Workspace", "Espace de travail"], add: ["Add another workspace", "Ajouter un autre espace de travail"], min: 1 } }),
  S('asset', ["An asset", "Un bien"], [
    tx('desc', ["What is it?", "De quoi s'agit-il?"], { req: true, label: true, ph: "Laptop, camera, tractor, furniture" }),
    dt('acquired', ["Date you bought it", "Date d'achat"], { req: true }),
    cur('cost', ["Cost, before taxes", "Coût, avant taxes"], { req: true }),
    rd('rebate', ["How were GST/HST, QST or PST treated when you bought it?", "Comment la TPS/TVH, la TVQ ou la TVP ont-elles été traitées à l'achat?"], { opts: O('paid|I paid it and have not claimed it back|Je l\'ai payée et ne l\'ai pas récupérée', 'itc|I claimed it back as an input tax credit|Je l\'ai récupérée à titre de crédit de taxe sur les intrants', 'included|The cost above already includes it|Le coût ci-dessus l\'inclut déjà', 'na|No sales tax was charged|Aucune taxe de vente n\'a été perçue', 'unsure|I am not sure|Je ne suis pas certain') }),
    dt('inUse', ["Date it was ready to be used", "Date à laquelle il était prêt à être utilisé"]),
    sl('use', ["Which activity does it serve?", "Quelle activité sert-il?"], { opts: ACTIVITY, req: true }),
    pct('share', ["Percent used for work, business or rental", "Pourcentage utilisé pour le travail, l'entreprise ou la location"], { unit: '%', req: true, rules: [{ t: 'min', v: 0 }, { t: 'max', v: 100 }] }),
    yn('moved', ["Did it start or stop being used personally this year?", "A-t-il commencé ou cessé d'être utilisé à des fins personnelles cette année?"], { review: [{ when: { q: '.moved', op: 'maybe' }, sev: 'warning', title: ["Change in use (personal to business or the reverse): deemed sale at market value", "Changement d'usage (personnel à entreprise ou l'inverse) : vente réputée à la valeur marchande"] }] }),
    cur('fmv', ["Market value on the day its use changed", "Valeur marchande le jour du changement d'usage"], { show: maybe('.moved') }),
    yn('prior', ["Was it claimed (depreciated) in an earlier year?", "A-t-il été déduit (amorti) dans une année antérieure?"], { help: ["Your last year's depreciation schedule shows it.", "Le tableau d'amortissement de l'an dernier l'indique."] }),
    cur('ucc', ["Remaining undepreciated amount, if you know it", "Fraction non amortie du coût en capital, si vous la connaissez"], { show: maybe('.prior') }),
    dt('disposed', ["Date you sold or scrapped it, if you did", "Date de vente ou de mise au rebut, le cas échéant"]),
    cur('proceeds', ["What you received", "Ce que vous avez reçu"], { show: answered('.disposed') }),
    sl('currency', ["Currency of the amounts above", "Devise des montants ci-dessus"], { opts: CURRENCIES }),
    fl('proof', ["Upload the invoice or sale record.", "Téléversez la facture ou le registre de vente."], { docs: [{ key: 'ASSET_INVOICE', label: ["Invoice or sale record for the asset", "Facture ou registre de vente du bien"] }] }),
  ], { show: maybe('L.any.asset'), repeat: { label: ["Asset", "Bien"], add: ["Add another asset", "Ajouter un autre bien"], min: 1 } }),
]);
