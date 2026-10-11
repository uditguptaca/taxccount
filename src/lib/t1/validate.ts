// Cross-form checks. Everything here READS the answers; nothing changes them. Each result is a Finding with a
// stable key so the database can hold one review item per problem instead of one per save.
// Rules of this file:
//  - a blank answer is never treated as "No" or as zero;
//  - a limit is only used when it is verified for exactly this tax year (config/years.ts), otherwise the
//    preparer gets a review item instead of a guess;
//  - the checks flag and explain, they never decide the tax result.
import type { Ctx, Finding, L, Question, Rule, Severity, UploadedDoc, AnswerValue, RowValue } from './types.ts';
import { ak } from './types.ts';
import type { Catalogue, Slot } from './evaluate.ts';
import { answerOf, applicable, evalCond, recordLabel, recordsOf, valueOf } from './evaluate.ts';
import { isBlank } from './dsl.ts';
import { isVerifiedYear, ruleFor, verifiedValue } from './config/years.ts';

const FLAGGED = (a?: { flag?: string; v?: AnswerValue }) => a?.flag === 'unsure' || a?.v === 'unsure';

const n = (v: unknown): number | null => (typeof v === 'number' && isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && isFinite(Number(v.replace(/[$,\s]/g, ''))) ? Number(v.replace(/[$,\s]/g, '')) : null);
const money = (v: unknown) => n(v) ?? 0;
const norm = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const rowsOf = (v: AnswerValue | undefined): RowValue[] => (Array.isArray(v) ? (v as unknown[]).filter((r): r is RowValue => typeof r === 'object' && r !== null && !Array.isArray(r)) : []);

/** Social insurance number checksum (Luhn). Spaces and dashes are ignored. */
export function sinIsValid(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 9 || /^0+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) { let x = Number(d[i]); if (i % 2 === 1) { x *= 2; if (x > 9) x -= 9; } sum += x; }
  return sum % 10 === 0;
}

const MSG = {
  required: (q: Question): L => [`Missing: ${q.text[0]}`, `Manquant : ${q.text[1]}`],
};

function f(p: Partial<Finding> & Pick<Finding, 'key' | 'kind' | 'sev' | 'title'>): Finding { return p as Finding; }

// ── per-question rules ──
function ruleProblem(r: Rule, q: Question, v: AnswerValue | undefined, ctx: Ctx, rec: number): L | null {
  if (isBlank(v)) return null;
  const dflt = (en: string, fr: string): L => [en, fr];
  switch (r.t) {
    case 'min': { const x = n(v); return x !== null && x < r.v ? r.msg ?? dflt(`Must be at least ${r.v}.`, `Doit être d'au moins ${r.v}.`) : null; }
    case 'max': { const x = n(v); return x !== null && x > r.v ? r.msg ?? dflt(`Must be no more than ${r.v}.`, `Ne doit pas dépasser ${r.v}.`) : null; }
    case 'len': return String(v).length > r.v ? r.msg ?? dflt(`Must be ${r.v} characters or fewer.`, `Doit comporter au plus ${r.v} caractères.`) : null;
    case 'pattern': return typeof v === 'string' && !new RegExp(r.v).test(v) ? r.msg : null;
    case 'dateInYear': {
      if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return dflt('Enter a full date.', 'Entrez une date complète.');
      const last = r.allowNext ? `${ctx.year + 1}-03-03` : `${ctx.year}-12-31`;
      return v < `${ctx.year}-01-01` || v > last ? r.msg ?? dflt(`This date should be in ${ctx.year}.`, `Cette date devrait être en ${ctx.year}.`) : null;
    }
    case 'dateNotBefore': case 'dateNotAfter': {
      const other = valueOf(ctx, r.q.startsWith('.') ? `${q.sec}${r.q}` : r.q, rec);
      if (typeof v !== 'string' || typeof other !== 'string' || !/^\d{4}-/.test(v) || !/^\d{4}-/.test(other)) return null;
      const bad = r.t === 'dateNotBefore' ? v < other : v > other;
      return bad ? r.msg ?? dflt('This date does not fit with the other date.', "Cette date ne concorde pas avec l'autre date.") : null;
    }
    case 'lteQ': case 'gteQ': {
      const other = n(valueOf(ctx, r.q.startsWith('.') ? `${q.sec}${r.q}` : r.q, rec)), x = n(v);
      if (other === null || x === null) return null;
      const bad = r.t === 'lteQ' ? x > other : x < other;
      return bad ? r.msg ?? dflt('This amount does not fit with the related amount.', 'Ce montant ne concorde pas avec le montant connexe.') : null;
    }
  }
}

// ── the main entry point ──
export interface ValidateOptions { uploads?: UploadedDoc[]; lang?: 'en' | 'fr' }

export function validate(cat: Catalogue, ctx: Ctx, opts: ValidateOptions = {}): Finding[] {
  const out: Finding[] = [];
  const uploads = opts.uploads ?? [];
  const slots = applicable(cat, ctx);
  const push = (x: Finding) => out.push(x);
  const lbl = (sec: string, rec: number) => recordLabel(cat, ctx, sec, rec);

  // 1. required, unsure, ask, later; per-question rules and review rules
  for (const s of slots) {
    const a = answerOf(ctx, s.q.id, s.rec);
    const where = s.sec.repeat ? lbl(s.sec.id, s.rec) : '';
    const base = { questionId: s.q.id, rec: s.rec, mod: s.mod.code };
    const key = `${s.q.id}|${s.rec}`;
    if (a?.flag === 'ask') {
      push(f({ ...base, key: `ask:${key}`, kind: 'ask', sev: 'warning', title: [`Client question: ${s.q.text[0]}`, `Question du client : ${s.q.text[1]}`], detail: a.note ? [a.note, a.note] : undefined }));
    } else if (FLAGGED(a)) {
      push(f({ ...base, key: `unsure:${key}`, kind: 'unsure', sev: 'warning', title: [`Client is not sure: ${s.q.text[0]}${where ? ` (${where})` : ''}`, `Le client n'est pas certain : ${s.q.text[1]}${where ? ` (${where})` : ''}`] }));
    } else if (a?.flag === 'later') {
      push(f({ ...base, key: `later:${key}`, kind: 'later', sev: s.q.type === 'file' ? 'info' : 'warning', title: [`To be provided later: ${s.q.text[0]}${where ? ` (${where})` : ''}`, `À fournir plus tard : ${s.q.text[1]}${where ? ` (${where})` : ''}`] }));
    } else if (s.required && isBlank(a?.v)) {
      push(f({ ...base, key: `required:${key}`, kind: 'required', sev: 'blocking', title: MSG.required(s.q), detail: where ? [where, where] : undefined }));
    }
    for (const r of s.q.rules ?? []) {
      const m = ruleProblem(r, s.q, a?.v, ctx, s.rec);
      if (m) push(f({ ...base, key: `invalid:${key}:${r.t}`, kind: 'invalid', sev: 'warning', title: [`${s.q.text[0]}: ${m[0]}`, `${s.q.text[1]} : ${m[1]}`] }));
    }
    if (s.q.type === 'sin' && typeof a?.v === 'string' && !isBlank(a.v) && !sinIsValid(a.v)) {
      push(f({ ...base, key: `invalid:${key}:sin`, kind: 'invalid', sev: 'warning', title: ['This social insurance number does not pass the checksum: check for a typo', "Ce numéro d'assurance sociale ne passe pas la validation : vérifiez s'il y a une faute de frappe"] }));
    }
    for (let i = 0; i < (s.q.review?.length ?? 0); i++) {
      const rr = s.q.review![i];
      if (isBlank(a?.v) && !a?.flag && !rr.when.hasOwnProperty('span') && !rr.when.hasOwnProperty('all') && !rr.when.hasOwnProperty('any')) continue;
      if (evalCond(rr.when, cat, ctx, { group: s.sec.id, rec: s.rec })) {
        push(f({ ...base, key: `rule:${key}:${i}`, kind: rr.sev === 'specialist' ? 'specialist' : 'rule', sev: rr.sev, title: rr.title, detail: rr.detail, specialist: rr.specialist }));
      }
    }
  }

  slipChecks(cat, ctx, uploads, push);
  uploadChecks(ctx, uploads, push);
  householdChecks(cat, ctx, push);
  gapChecks(cat, ctx, slots, push);
  moneyChecks(cat, ctx, push);
  ownershipChecks(cat, ctx, push);
  investmentChecks(cat, ctx, push);
  timingChecks(cat, ctx, push);
  foreignChecks(cat, ctx, push);
  homeChecks(cat, ctx, push);
  yearChecks(ctx, push);

  // one finding per key
  const seen = new Set<string>();
  return out.filter((x) => (seen.has(x.key) ? false : (seen.add(x.key), true)));
}

// ── slips: duplicates, corrected copies, wrong person, wrong year ──
function slipSections(cat: Catalogue) { return cat.modules.find((m) => m.code === 'G')?.sections.filter((s) => s.repeat && s.qs.some((q) => q.id === `${s.id}.issuer`)) ?? []; }

function slipChecks(cat: Catalogue, ctx: Ctx, uploads: UploadedDoc[], push: (f: Finding) => void) {
  const legal = { first: norm(valueOf(ctx, 'B.name.first')), last: norm(valueOf(ctx, 'B.name.last')) };
  const sp = { first: norm(valueOf(ctx, 'D.spouse.first')), last: norm(valueOf(ctx, 'D.spouse.last')) };
  for (const s of slipSections(cat)) {
    const sigs = new Map<string, number[]>();
    const byIssuer = new Map<string, { rec: number; status: string }[]>();
    for (const r of recordsOf(cat, ctx, s.id)) {
      const issuer = norm(valueOf(ctx, `${s.id}.issuer`, r));
      const status = String(valueOf(ctx, `${s.id}.status`, r) ?? 'original');
      const year = String(valueOf(ctx, `${s.id}.year`, r) ?? '');
      const code = s.id.replace('G.', '').toUpperCase();
      const name = lbl2(cat, ctx, s.id, r);
      // the amounts: every box answer on the record
      const amounts: string[] = [];
      let total = 0;
      for (const q of s.qs) {
        if (!/^G\.[a-z0-9]+\.(b|lines|other|boxes|sessions)/i.test(q.id)) continue;
        const v = valueOf(ctx, q.id, r);
        if (isBlank(v)) continue;
        if (Array.isArray(v)) { const j = JSON.stringify(v); amounts.push(`${q.id}=${j}`); for (const row of rowsOf(v)) for (const x of Object.values(row)) total += Math.abs(money(x)); }
        else { amounts.push(`${q.id}=${v}`); total += Math.abs(money(v)); }
      }
      if (amounts.length) {
        const sig = `${issuer}|${year}|${amounts.sort().join(';')}`;
        const list = sigs.get(sig) ?? []; list.push(r); sigs.set(sig, list);
      }
      if (issuer) { const l = byIssuer.get(issuer) ?? []; l.push({ rec: r, status }); byIssuer.set(issuer, l); }
      if (status === 'cancelled' && total > 0) push(f({ key: `slip:cancelled:${s.id}|${r}`, kind: 'mismatch', sev: 'warning', mod: 'G', questionId: `${s.id}.status`, rec: r, title: [`${name}: a cancelled slip has amounts entered, so it should not be reported`, `${name} : un feuillet annulé comporte des montants et ne devrait pas être déclaré`] }));
      if (year && /^\d{4}$/.test(year) && Number(year) !== ctx.year) push(f({ key: `slip:year:${s.id}|${r}`, kind: 'mismatch', sev: 'blocking', mod: 'G', questionId: `${s.id}.year`, rec: r, title: [`${name}: slip is for ${year} but this return is for ${ctx.year}`, `${name} : le feuillet est de ${year} mais cette déclaration est pour ${ctx.year}`] }));
      const recipient = norm(valueOf(ctx, `${s.id}.recipient`, r));
      if (recipient && legal.last) {
        const mine = recipient.includes(legal.last) || (legal.first && recipient.includes(legal.first));
        const theirs = !!sp.last && (recipient.includes(sp.last) || (sp.first && recipient.includes(sp.first)));
        if (!mine && !theirs) push(f({ key: `slip:name:${s.id}|${r}`, kind: 'mismatch', sev: 'warning', mod: 'G', questionId: `${s.id}.recipient`, rec: r, title: [`${name}: the name on the slip does not match the taxpayer or spouse`, `${name} : le nom sur le feuillet ne correspond ni au contribuable ni au conjoint`] }));
        else if (!mine && theirs && String(valueOf(ctx, 'D.spouse.sameReturn') ?? '') !== 'yes') push(f({ key: `slip:spouse:${s.id}|${r}`, kind: 'mismatch', sev: 'warning', mod: 'G', questionId: `${s.id}.recipient`, rec: r, title: [`${name}: this looks like the spouse's slip, but the spouse is not on this return`, `${name} : ce feuillet semble être celui du conjoint, mais le conjoint n'est pas dans cette déclaration`] }));
      }
    }
    for (const [, recs] of Array.from(sigs)) if (recs.length > 1) push(f({ key: `slip:dup:${s.id}|${recs.join(',')}`, kind: 'duplicate', sev: 'warning', mod: 'G', questionId: s.qs[0].id, rec: recs[0], title: [`${s.title[0].split(':')[0]}: the same slip appears ${recs.length} times (same issuer, year and amounts)`, `${s.title[1].split(' :')[0]} : le même feuillet figure ${recs.length} fois (même émetteur, année et montants)`] }));
    for (const [, list] of Array.from(byIssuer)) {
      const corrected = list.some((x) => x.status === 'amended' || x.status === 'replaced');
      const original = list.filter((x) => x.status === 'original');
      if (corrected && original.length) push(f({ key: `slip:amended:${s.id}|${list.map((x) => x.rec).join(',')}`, kind: 'mismatch', sev: 'warning', mod: 'G', rec: list[0].rec, title: [`${s.title[0].split(':')[0]}: an original and a corrected slip from the same issuer are both entered; only the corrected one should count`, `${s.title[1].split(' :')[0]} : un original et une copie corrigée du même émetteur sont saisis; seule la copie corrigée doit compter`] }));
    }
  }
}
const lbl2 = (cat: Catalogue, ctx: Ctx, sec: string, rec: number) => recordLabel(cat, ctx, sec, rec);

// ── uploads: the same file twice, a document for another year ──
function uploadChecks(ctx: Ctx, uploads: UploadedDoc[], push: (f: Finding) => void) {
  const byHash = new Map<string, UploadedDoc[]>();
  for (const u of uploads) {
    if (u.taxYear && /^\d{4}$/.test(u.taxYear) && Number(u.taxYear) !== ctx.year && u.slipStatus !== 'cancelled') push(f({ key: `upload:year:${u.id}`, kind: 'mismatch', sev: 'warning', title: [`${u.fileName}: marked as tax year ${u.taxYear}, but this return is for ${ctx.year}`, `${u.fileName} : marqué pour l'année ${u.taxYear}, mais cette déclaration est pour ${ctx.year}`], questionId: u.questionId ?? undefined }));
    if (u.hash) { const l = byHash.get(u.hash) ?? []; l.push(u); byHash.set(u.hash, l); }
  }
  for (const [h, l] of Array.from(byHash)) if (l.length > 1) push(f({ key: `upload:dup:${h}`, kind: 'duplicate', sev: 'info', title: [`The same file was uploaded ${l.length} times: ${l.map((x) => x.fileName).join(', ')}`, `Le même fichier a été téléversé ${l.length} fois : ${l.map((x) => x.fileName).join(', ')}`] }));
}

// ── household: marital status, spouse, dependants ──
function householdChecks(cat: Catalogue, ctx: Ctx, push: (f: Finding) => void) {
  const marital = String(valueOf(ctx, 'D.status.marital') ?? '');
  const withSpouse = marital === 'married' || marital === 'common_law';
  const spouseNamed = !isBlank(valueOf(ctx, 'D.spouse.first')) || !isBlank(valueOf(ctx, 'D.spouse.last'));
  const spouseSin = norm(valueOf(ctx, 'D.spouse.sin')).replace(/ /g, '');
  const mySin = norm(valueOf(ctx, 'B.id.sin')).replace(/ /g, '');
  if (marital && !withSpouse && (spouseNamed || String(valueOf(ctx, 'D.spouse.sameReturn') ?? '') === 'yes')) {
    push(f({ key: 'x:marital:spouse-but-not', kind: 'contradiction', sev: 'warning', mod: 'D', questionId: 'D.status.marital', title: ['Marital status is not married or common-law, but spouse details were entered', "L'état civil n'est ni marié ni conjoint de fait, mais des renseignements sur un conjoint ont été saisis"] }));
  }
  if (withSpouse && !spouseNamed && ctx.answers[ak('D.status.marital')] && !ctx.answers[ak('D.spouse.first')]?.flag) {
    push(f({ key: 'x:marital:no-spouse-details', kind: 'required', sev: 'blocking', mod: 'D', questionId: 'D.spouse.first', title: ['Married or common-law, but no spouse details were entered', 'Marié ou conjoint de fait, mais aucun renseignement sur le conjoint'] }));
  }
  if (spouseSin && mySin && spouseSin === mySin) push(f({ key: 'x:sin:spouse-same', kind: 'duplicate', sev: 'blocking', mod: 'D', questionId: 'D.spouse.sin', title: ["The spouse's social insurance number is the same as the taxpayer's", "Le numéro d'assurance sociale du conjoint est le même que celui du contribuable"] }));
  const hasDeps = String(valueOf(ctx, 'E.any.has') ?? '');
  const deps = recordsOf(cat, ctx, 'E.dep');
  if (hasDeps === 'yes' && deps.length === 0) push(f({ key: 'x:dependants:none', kind: 'required', sev: 'blocking', mod: 'E', questionId: 'E.any.has', title: ['Dependants were reported, but none were added', "Des personnes à charge ont été déclarées, mais aucune n'a été ajoutée"] }));
  if (hasDeps === 'no' && deps.length > 0) push(f({ key: 'x:dependants:contradiction', kind: 'contradiction', sev: 'warning', mod: 'E', questionId: 'E.any.has', title: ['The answer says no dependants, but dependant records exist', 'La réponse indique aucune personne à charge, mais des fiches de personnes à charge existent'] }));
  const sins = new Map<string, string>(); if (mySin) sins.set(mySin, 'taxpayer'); if (spouseSin) sins.set(spouseSin, 'spouse');
  for (const r of deps) {
    const name = recordLabel(cat, ctx, 'E.dep', r);
    const dob = valueOf(ctx, 'E.dep.dob', r);
    if (typeof dob === 'string' && /^\d{4}/.test(dob)) {
      const age = ctx.year - Number(dob.slice(0, 4));
      if (dob > `${ctx.year}-12-31`) push(f({ key: `x:dep:dob-future:${r}`, kind: 'invalid', sev: 'warning', mod: 'E', questionId: 'E.dep.dob', rec: r, title: [`${name}: date of birth is after the end of ${ctx.year}`, `${name} : la date de naissance est après la fin de ${ctx.year}`] }));
      const rel = String(valueOf(ctx, 'E.dep.relationship', r) ?? '');
      const student = String(valueOf(ctx, 'E.dep.student', r) ?? ''), dtc = String(valueOf(ctx, 'E.dep.dtc', r) ?? '');
      if (age >= 19 && rel === 'child' && student !== 'yes' && dtc !== 'yes' && !isBlank(valueOf(ctx, 'E.dep.dtc', r)) === true && String(valueOf(ctx, 'E.dep.support', r) ?? '') === 'yes') {
        push(f({ key: `x:dep:adult:${r}`, kind: 'rule', sev: 'warning', mod: 'E', questionId: 'E.dep.support', rec: r, title: [`${name}: age ${age} and not a student or disabled: confirm the dependency claim`, `${name} : ${age} ans, ni étudiant ni handicapé : confirmer la demande pour personne à charge`] }));
      }
    }
    const sin = norm(valueOf(ctx, 'E.dep.sin', r)).replace(/ /g, '');
    if (sin) { const who = sins.get(sin); if (who) push(f({ key: `x:sin:dep:${r}`, kind: 'duplicate', sev: 'blocking', mod: 'E', questionId: 'E.dep.sin', rec: r, title: [`${name}: the social insurance number is the same as the ${who}'s`, `${name} : le numéro d'assurance sociale est le même que celui du ${who === 'spouse' ? 'conjoint' : 'contribuable'}`] })); else sins.set(sin, name); }
    if (String(valueOf(ctx, 'E.dep.competing', r) ?? '') === 'yes') push(f({ key: `x:dep:competing:${r}`, kind: 'rule', sev: 'warning', mod: 'E', questionId: 'E.dep.competing', rec: r, title: [`${name}: someone else may also claim this person`, `${name} : une autre personne pourrait aussi réclamer cette personne`] }));
  }
  // childcare and support facts must agree with marital status
  const together = String(valueOf(ctx, 'V.who.together') ?? ''), apart = String(valueOf(ctx, 'V.who.apart') ?? '');
  if (together === 'yes' && apart === 'yes') push(f({ key: 'x:care:together-apart', kind: 'contradiction', sev: 'warning', mod: 'V', questionId: 'V.who.together', title: ['Childcare answers say the spouses lived together and apart: confirm the dates', 'Les réponses sur les frais de garde indiquent que les conjoints vivaient ensemble et séparés : confirmer les dates'] }));
  if (withSpouse && apart === 'yes' && String(valueOf(ctx, 'D.apart.breakdown') ?? '') !== 'yes') push(f({ key: 'x:care:apart-no-breakdown', kind: 'contradiction', sev: 'warning', mod: 'V', questionId: 'V.who.apart', title: ['Childcare says the spouses lived apart, but the separation answers say otherwise', 'Les frais de garde indiquent que les conjoints vivaient séparés, mais les réponses sur la séparation indiquent le contraire'] }));
}

// ── income said yes, but nothing entered ──
const GAPS: { gate: string; groups: string[]; alsoOk?: string[]; mod: string; title: L }[] = [
  { gate: 'F.inc.rental', groups: ['M.prop'], mod: 'M', title: ['Rental income reported, but no rental property was added', "Un revenu de location est déclaré, mais aucun immeuble locatif n'a été ajouté"] },
  { gate: 'F.inc.selfEmp', groups: ['J.biz'], mod: 'J', title: ['Self-employment income reported, but no business was added', "Un revenu de travail autonome est déclaré, mais aucune entreprise n'a été ajoutée"] },
  { gate: 'F.inc.platform', groups: ['J.biz'], mod: 'J', title: ['Platform or gig income reported, but no business was added', "Un revenu de plateforme est déclaré, mais aucune entreprise n'a été ajoutée"] },
  { gate: 'F.inc.employment', groups: ['H.job', 'G.t4'], mod: 'H', title: ['Employment income reported, but no job or T4 was added', "Un revenu d'emploi est déclaré, mais aucun emploi ni T4 n'a été ajouté"] },
  { gate: 'F.inc.farming', groups: ['K.op'], mod: 'K', title: ['Farming income reported, but no farm was added', "Un revenu agricole est déclaré, mais aucune exploitation n'a été ajoutée"] },
  { gate: 'F.inc.fishing', groups: ['K.op'], mod: 'K', title: ['Fishing income reported, but no fishing business was added', "Un revenu de pêche est déclaré, mais aucune entreprise de pêche n'a été ajoutée"] },
  { gate: 'F.inc.interest', groups: ['N.acct', 'G.t5', 'G.t3'], mod: 'N', title: ['Interest reported, but no slip or account was added', "Des intérêts sont déclarés, mais aucun feuillet ni compte n'a été ajouté"] },
  { gate: 'F.inc.dividends', groups: ['N.acct', 'G.t5', 'G.t3'], mod: 'N', title: ['Dividends reported, but no slip or account was added', "Des dividendes sont déclarés, mais aucun feuillet ni compte n'a été ajouté"] },
  { gate: 'F.inc.property', groups: ['O.sale', 'P.home'], mod: 'O', title: ['A sale of property was reported, but no sale was added', "Une vente de biens est déclarée, mais aucune vente n'a été ajoutée"] },
  { gate: 'F.inc.crypto', groups: ['Q.acct'], mod: 'Q', title: ['Crypto reported, but no exchange or wallet was added', "Des cryptoactifs sont déclarés, mais aucune plateforme ni aucun portefeuille n'a été ajouté"] },
  { gate: 'F.inc.foreign', groups: ['R.inc', 'R.prop', 'C.foreigntax'], mod: 'R', title: ['Foreign income or property reported, but nothing was added', "Un revenu ou un bien étranger est déclaré, mais rien n'a été ajouté"] },
  { gate: 'F.ded.donations', groups: ['Z.gift', 'Z.political'], mod: 'Z', title: ['Donations reported, but none were added', "Des dons sont déclarés, mais aucun n'a été ajouté"] },
  { gate: 'F.ded.medical', groups: ['X.exp'], mod: 'X', title: ['Medical expenses reported, but none were added', "Des frais médicaux sont déclarés, mais aucun n'a été ajouté"] },
  { gate: 'F.ded.childcare', groups: ['V.care'], mod: 'V', title: ['Childcare reported, but no provider was added', "Des frais de garde sont déclarés, mais aucun fournisseur n'a été ajouté"] },
  { gate: 'F.ded.education', groups: ['W.school', 'G.t2202'], mod: 'W', title: ['Education reported, but no school was added', "Des études sont déclarées, mais aucun établissement n'a été ajouté"] },
  { gate: 'F.ded.moving', groups: ['Y.move'], mod: 'Y', title: ['A move was reported, but no move was added', "Un déménagement est déclaré, mais aucun n'a été ajouté"] },
];

function gapChecks(cat: Catalogue, ctx: Ctx, _slots: Slot[], push: (f: Finding) => void) {
  for (const g of GAPS) {
    if (String(valueOf(ctx, g.gate) ?? '') !== 'yes') continue;
    const any = g.groups.some((id) => recordsOf(cat, ctx, id).length > 0);
    const later = answerOf(ctx, g.gate)?.flag === 'later';
    if (!any && !later) push(f({ key: `x:gap:${g.gate}`, kind: 'required', sev: 'blocking', mod: g.mod, questionId: g.gate, title: g.title }));
  }
  const sawNothing = String(valueOf(ctx, 'F.inc.noSlip') ?? '') === 'yes' && isBlank(valueOf(ctx, 'F.noslip.desc'));
  if (sawNothing) push(f({ key: 'x:gap:noslip', kind: 'required', sev: 'blocking', mod: 'F', questionId: 'F.noslip.desc', title: ['Income without a slip was reported, but not described', "Un revenu sans feuillet est déclaré, mais n'est pas décrit"] }));
}

// ── money that cannot be right ──
function moneyChecks(cat: Catalogue, ctx: Ctx, push: (f: Finding) => void) {
  const pairs: { sec: string; paid: string; back: string; mod: string; what: L }[] = [
    { sec: 'V.care', paid: 'paid', back: 'reimb', mod: 'V', what: ['childcare', 'garde'] },
    { sec: 'X.exp', paid: 'gross', back: 'reimb', mod: 'X', what: ['medical', 'médicale'] },
    { sec: 'W.school', paid: 'tuition', back: 'reimb', mod: 'W', what: ['tuition', 'scolarité'] },
  ];
  for (const p of pairs) for (const r of recordsOf(cat, ctx, p.sec)) {
    const paid = n(valueOf(ctx, `${p.sec}.${p.paid}`, r)), back = n(valueOf(ctx, `${p.sec}.${p.back}`, r));
    if (paid !== null && back !== null && back > paid) push(f({ key: `x:reimb:${p.sec}|${r}`, kind: 'invalid', sev: 'warning', mod: p.mod, questionId: `${p.sec}.${p.back}`, rec: r, title: [`${recordLabel(cat, ctx, p.sec, r)}: the amount reimbursed is more than the amount paid (${p.what[0]})`, `${recordLabel(cat, ctx, p.sec, r)} : le montant remboursé dépasse le montant payé (${p.what[1]})`] }));
  }
  for (const r of recordsOf(cat, ctx, 'V.paid')) {
    const total = money(valueOf(ctx, 'V.paid.spousal', r)) + money(valueOf(ctx, 'V.paid.child', r)) + money(valueOf(ctx, 'V.paid.arrears', r));
    const back = n(valueOf(ctx, 'V.paid.reimb', r));
    if (back !== null && total > 0 && back > total) push(f({ key: `x:reimb:V.paid|${r}`, kind: 'invalid', sev: 'warning', mod: 'V', questionId: 'V.paid.reimb', rec: r, title: ['Support paid: the amount repaid to you is more than the amount paid', 'Pension alimentaire versée : le montant qui vous a été remboursé dépasse le montant versé'] }));
  }
  // foreign tax with no foreign income
  for (const r of recordsOf(cat, ctx, 'R.inc')) {
    const tax = n(valueOf(ctx, 'R.inc.tax', r)), amt = money(valueOf(ctx, 'R.inc.amount', r)) + money(valueOf(ctx, 'R.inc.cad', r));
    if (tax !== null && tax > 0 && amt === 0) push(f({ key: `x:ftax:R.inc|${r}`, kind: 'rule', sev: 'warning', mod: 'R', questionId: 'R.inc.tax', rec: r, title: [`${recordLabel(cat, ctx, 'R.inc', r)}: foreign tax was entered with no foreign income`, `${recordLabel(cat, ctx, 'R.inc', r)} : un impôt étranger est saisi sans revenu étranger`] }));
  }
  for (const r of recordsOf(cat, ctx, 'N.acct')) {
    const tax = n(valueOf(ctx, 'N.acct.foreignTax', r));
    const inc = money(valueOf(ctx, 'N.acct.interest', r)) + money(valueOf(ctx, 'N.acct.dividends', r)) + money(valueOf(ctx, 'N.acct.other', r));
    if (tax !== null && tax > 0 && inc === 0) push(f({ key: `x:ftax:N.acct|${r}`, kind: 'rule', sev: 'warning', mod: 'N', questionId: 'N.acct.foreignTax', rec: r, title: [`${recordLabel(cat, ctx, 'N.acct', r)}: foreign tax was entered with no income from the account`, `${recordLabel(cat, ctx, 'N.acct', r)} : un impôt étranger est saisi sans revenu du compte`] }));
  }
  for (const r of recordsOf(cat, ctx, 'C.foreigntax')) {
    const cad = n(valueOf(ctx, 'C.foreigntax.cad', r)), amt = n(valueOf(ctx, 'C.foreigntax.amount', r));
    if ((cad ?? amt ?? 0) > 0 && (String(valueOf(ctx, 'F.inc.foreign') ?? '') === 'no')) push(f({ key: `x:ftax:C|${r}`, kind: 'contradiction', sev: 'warning', mod: 'C', questionId: 'C.foreigntax.amount', rec: r, title: ['Foreign tax paid, but the income questions say there is no foreign income', "Un impôt étranger a été payé, mais les questions sur le revenu indiquent qu'il n'y a aucun revenu étranger"] }));
  }
}

// ── who owns what: shares, joint income counted twice ──
function ownershipChecks(cat: Catalogue, ctx: Ctx, push: (f: Finding) => void) {
  for (const sec of ['M.prop', 'N.acct', 'O.sale', 'P.home', 'R.prop']) {
    const s = cat.sec.get(sec); if (!s) continue;
    const sig = new Map<string, number[]>();
    for (const r of recordsOf(cat, ctx, sec)) {
      const share = n(valueOf(ctx, `${sec}.share`, r));
      const co = rowsOf(valueOf(ctx, `${sec}.coOwners`, r));
      if (share !== null && (share <= 0 || share > 100)) push(f({ key: `x:share:range:${sec}|${r}`, kind: 'invalid', sev: 'warning', mod: s.mod, questionId: `${sec}.share`, rec: r, title: [`${recordLabel(cat, ctx, sec, r)}: ownership share must be between 0 and 100 percent`, `${recordLabel(cat, ctx, sec, r)} : la part de propriété doit être entre 0 et 100 %`] }));
      if (share !== null && co.length) {
        const others = co.reduce((a, row) => a + money(row.share ?? row.percent ?? row.pct), 0);
        if (others > 0 && Math.abs(share + others - 100) > 0.5) push(f({ key: `x:share:sum:${sec}|${r}`, kind: 'invalid', sev: 'warning', mod: s.mod, questionId: `${sec}.coOwners`, rec: r, title: [`${recordLabel(cat, ctx, sec, r)}: ownership shares add up to ${Math.round((share + others) * 100) / 100}%, not 100%`, `${recordLabel(cat, ctx, sec, r)} : les parts de propriété totalisent ${Math.round((share + others) * 100) / 100} %, et non 100 %`] }));
      }
      const owner = String(valueOf(ctx, `${sec}.owner`, r) ?? valueOf(ctx, `${sec}.owners`, r) ?? '');
      const place = norm(valueOf(ctx, `${sec}.address`, r) ?? valueOf(ctx, `${sec}.inst`, r) ?? valueOf(ctx, `${sec}.desc`, r));
      if (place) { const k = `${place}|${owner}`; const l = sig.get(k) ?? []; l.push(r); sig.set(k, l); }
    }
    // the same joint holding entered twice (once for each spouse) is the classic double count
    const joint = (o: string) => o === 'joint' || o === 'others' || o === 'spouse';
    const byPlace = new Map<string, { rec: number; owner: string }[]>();
    for (const r of recordsOf(cat, ctx, sec)) {
      const owner = String(valueOf(ctx, `${sec}.owner`, r) ?? valueOf(ctx, `${sec}.owners`, r) ?? '');
      const place = norm(valueOf(ctx, `${sec}.address`, r) ?? valueOf(ctx, `${sec}.inst`, r) ?? valueOf(ctx, `${sec}.desc`, r));
      if (!place) continue;
      const l = byPlace.get(place) ?? []; l.push({ rec: r, owner }); byPlace.set(place, l);
    }
    for (const [place, list] of Array.from(byPlace)) {
      if (list.length > 1 && list.some((x) => joint(x.owner))) push(f({ key: `x:joint:${sec}:${place}`, kind: 'duplicate', sev: 'warning', mod: s.mod, rec: list[0].rec, questionId: `${sec}.${sec === 'M.prop' ? 'address' : sec === 'N.acct' ? 'inst' : 'desc'}`, title: [`${list.length} records for "${place}" include joint or shared ownership: check the income is not counted twice`, `${list.length} fiches pour « ${place} » comprennent une propriété conjointe ou partagée : vérifier que le revenu n'est pas compté deux fois`] }));
    }
  }
  if (String(valueOf(ctx, 'D.spouse.sameReturn') ?? '') === 'yes') {
    for (const r of recordsOf(cat, ctx, 'N.acct')) if (String(valueOf(ctx, 'N.acct.owner', r)) === 'joint' && isBlank(valueOf(ctx, 'N.acct.share', r))) push(f({ key: `x:joint:noshare:${r}`, kind: 'required', sev: 'warning', mod: 'N', questionId: 'N.acct.share', rec: r, title: [`${recordLabel(cat, ctx, 'N.acct', r)}: joint account with no share stated`, `${recordLabel(cat, ctx, 'N.acct', r)} : compte conjoint sans part indiquée`] }));
  }
}

// ── registered and non-registered accounts ──
function investmentChecks(cat: Catalogue, ctx: Ctx, push: (f: Finding) => void) {
  for (const r of recordsOf(cat, ctx, 'N.acct')) {
    const type = String(valueOf(ctx, 'N.acct.type', r) ?? '');
    const inc = money(valueOf(ctx, 'N.acct.interest', r)) + money(valueOf(ctx, 'N.acct.dividends', r));
    if (type === 'registered' && inc > 0) push(f({ key: `x:reg:income:${r}`, kind: 'rule', sev: 'warning', mod: 'N', questionId: 'N.acct.type', rec: r, title: [`${recordLabel(cat, ctx, 'N.acct', r)}: income entered on a registered account (RRSP, TFSA, FHSA and similar are not usually taxed on it)`, `${recordLabel(cat, ctx, 'N.acct', r)} : revenu saisi pour un compte enregistré (REER, CELI, CELIAPP et semblables ne sont généralement pas imposés)`] }));
    if (type === 'nonreg' && String(valueOf(ctx, 'N.acct.income', r) ?? '') === '' && inc === 0 && isBlank(valueOf(ctx, 'N.acct.docs', r)) && answerOf(ctx, 'N.acct.docs', r)?.flag !== 'later') push(f({ key: `x:nonreg:empty:${r}`, kind: 'required', sev: 'warning', mod: 'N', questionId: 'N.acct.interest', rec: r, title: [`${recordLabel(cat, ctx, 'N.acct', r)}: non-registered account with no income or slip entered`, `${recordLabel(cat, ctx, 'N.acct', r)} : compte non enregistré sans revenu ni feuillet saisi`] }));
  }
  // TFSA / RRSP / FHSA room
  if (String(valueOf(ctx, 'T.tfsa.over') ?? '') === 'yes') push(f({ key: 'x:tfsa:over', kind: 'specialist', sev: 'specialist', mod: 'T', questionId: 'T.tfsa.over', title: ['TFSA over-contribution reported: a penalty tax may apply', 'Cotisation excédentaire au CELI déclarée : un impôt de pénalité peut s’appliquer'], specialist: 'TFSA over-contribution' }));
  const fhsaLimit = verifiedValue('fhsa.annualLimit', ctx.year);
  for (const r of recordsOf(cat, ctx, 'T.acct')) {
    const rows = rowsOf(valueOf(ctx, 'T.acct.contrib', r));
    const cash = rows.filter((x) => !x.kind || x.kind === 'cash').reduce((a, x) => a + money(x.amount), 0);
    const room = n(valueOf(ctx, 'T.acct.room', r));
    if (room !== null && cash > room && String(valueOf(ctx, 'T.acct.over', r) ?? '') !== 'yes') push(f({ key: `x:fhsa:room:${r}`, kind: 'rule', sev: 'warning', mod: 'T', questionId: 'T.acct.contrib', rec: r, title: [`${recordLabel(cat, ctx, 'T.acct', r)}: contributions of $${cash} are more than the participation room of $${room} reported`, `${recordLabel(cat, ctx, 'T.acct', r)} : les cotisations de ${cash} $ dépassent le droit de participation de ${room} $ déclaré`] }));
    else if (room === null && fhsaLimit !== null && cash > Number(fhsaLimit)) push(f({ key: `x:fhsa:limit:${r}`, kind: 'rule', sev: 'info', mod: 'T', questionId: 'T.acct.contrib', rec: r, title: [`${recordLabel(cat, ctx, 'T.acct', r)}: contributions of $${cash} are more than the $${fhsaLimit} annual amount: participation room carried forward must be confirmed`, `${recordLabel(cat, ctx, 'T.acct', r)} : les cotisations de ${cash} $ dépassent le montant annuel de ${fhsaLimit} $ : le droit reporté doit être confirmé`] }));
  }
  const ctrib = recordsOf(cat, ctx, 'S.contrib');
  const dollarLimit = verifiedValue('rrsp.dollarLimit', ctx.year);
  const total = ctrib.reduce((a, r) => a + money(valueOf(ctx, 'S.contrib.amount', r)), 0);
  const limit = n(valueOf(ctx, 'S.limit.limit'));
  if (limit !== null && total > limit) push(f({ key: 'x:rrsp:over-limit', kind: 'rule', sev: 'warning', mod: 'S', questionId: 'S.limit.limit', title: [`RRSP contributions of $${total} are more than the deduction limit of $${limit} on the notice of assessment`, `Les cotisations au REER de ${total} $ dépassent la limite de déduction de ${limit} $ de l'avis de cotisation`] }));
  else if (limit === null && dollarLimit !== null && total > Number(dollarLimit)) push(f({ key: 'x:rrsp:over-dollar', kind: 'rule', sev: 'warning', mod: 'S', questionId: 'S.limit.limit', title: [`RRSP contributions of $${total} are more than the $${dollarLimit} dollar limit for ${ctx.year}: confirm the room on the notice of assessment`, `Les cotisations au REER de ${total} $ dépassent le plafond de ${dollarLimit} $ pour ${ctx.year} : confirmer le droit sur l'avis de cotisation`] }));
}

// ── RRSP and FHSA timing; the first 60 days ──
function timingChecks(cat: Catalogue, ctx: Ctx, push: (f: Finding) => void) {
  for (const r of recordsOf(cat, ctx, 'S.contrib')) {
    const date = valueOf(ctx, 'S.contrib.date', r), when = String(valueOf(ctx, 'S.contrib.when', r) ?? '');
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const inYear = date >= `${ctx.year}-01-01` && date <= `${ctx.year}-12-31`;
    const first60 = date > `${ctx.year}-12-31` && date <= `${ctx.year + 1}-03-03`;
    const lbl = recordLabel(cat, ctx, 'S.contrib', r);
    if (first60 && when === 'during') push(f({ key: `x:rrsp:timing:${r}`, kind: 'contradiction', sev: 'warning', mod: 'S', questionId: 'S.contrib.when', rec: r, title: [`${lbl}: the date is in the first 60 days of ${ctx.year + 1}, but it is marked as made during ${ctx.year}`, `${lbl} : la date est dans les 60 premiers jours de ${ctx.year + 1}, mais elle est indiquée comme faite en ${ctx.year}`] }));
    else if (inYear && when === 'first60') push(f({ key: `x:rrsp:timing:${r}`, kind: 'contradiction', sev: 'warning', mod: 'S', questionId: 'S.contrib.when', rec: r, title: [`${lbl}: the date is in ${ctx.year}, but it is marked as made in the first 60 days of the next year`, `${lbl} : la date est en ${ctx.year}, mais elle est indiquée comme faite dans les 60 premiers jours de l'année suivante`] }));
    else if (date > `${ctx.year + 1}-03-03` || date < `${ctx.year}-01-01` && when !== 'early') push(f({ key: `x:rrsp:window:${r}`, kind: 'invalid', sev: 'warning', mod: 'S', questionId: 'S.contrib.date', rec: r, title: [`${lbl}: this date does not belong to ${ctx.year} contributions (they run to 60 days after year end)`, `${lbl} : cette date n'appartient pas aux cotisations de ${ctx.year} (elles vont jusqu'à 60 jours après la fin de l'année)`] }));
  }
  // an FHSA contribution counted as an RRSP one, or the reverse, within the same 60 days
  const fhsaRows = recordsOf(cat, ctx, 'T.acct').flatMap((r) => rowsOf(valueOf(ctx, 'T.acct.contrib', r)));
  const late = fhsaRows.filter((x) => typeof x.date === 'string' && x.date > `${ctx.year}-12-31`);
  if (late.length) push(f({ key: 'x:fhsa:after-year', kind: 'rule', sev: 'warning', mod: 'T', questionId: 'T.acct.contrib', title: [`FHSA contributions dated after 31 December ${ctx.year} belong to ${ctx.year + 1}, unlike RRSP contributions in the first 60 days`, `Les cotisations au CELIAPP datées après le 31 décembre ${ctx.year} appartiennent à ${ctx.year + 1}, contrairement aux cotisations au REER des 60 premiers jours`] }));
}

// ── foreign property: T1135 and Québec TP-1079.8.BE-V ──
function foreignChecks(cat: Catalogue, ctx: Ctx, push: (f: Finding) => void) {
  const recs = recordsOf(cat, ctx, 'R.prop');
  let cost = 0, anyCost = false;
  for (const r of recs) {
    if (String(valueOf(ctx, 'R.prop.useExcluded', r) ?? '') === 'yes') continue;
    const c = n(valueOf(ctx, 'R.prop.maxCost', r)) ?? n(valueOf(ctx, 'R.prop.cost', r));
    if (c !== null) { cost += c; anyCost = true; }
    else push(f({ key: `x:t1135:nocost:${r}`, kind: 'required', sev: 'warning', mod: 'R', questionId: 'R.prop.maxCost', rec: r, title: [`${recordLabel(cat, ctx, 'R.prop', r)}: no cost entered, so the T1135 threshold cannot be checked`, `${recordLabel(cat, ctx, 'R.prop', r)} : aucun coût saisi, le seuil du T1135 ne peut donc pas être vérifié`] }));
  }
  if (!recs.length) return;
  const t1135 = verifiedValue('t1135.cost', ctx.year), detailed = verifiedValue('t1135.detailedCost', ctx.year);
  const arrival = valueOf(ctx, 'C.newcomer.arrival');
  const firstYear = typeof arrival === 'string' && arrival.startsWith(String(ctx.year));
  if (t1135 === null) {
    push(f({ key: 'x:t1135:unverified', kind: 'specialist', sev: 'specialist', mod: 'R', title: [`Foreign property is reported for ${ctx.year}: the T1135 threshold for that year has not been verified, so the preparer must check it`, `Des biens étrangers sont déclarés pour ${ctx.year} : le seuil du T1135 de cette année n'a pas été vérifié, le préparateur doit donc le confirmer`], specialist: 'T1135 foreign income verification' }));
  } else if (anyCost && cost > Number(t1135)) {
    push(f({ key: 'x:t1135:over', kind: 'specialist', sev: 'specialist', mod: 'R', title: [`Specified foreign property cost totals $${cost}, over the $${t1135} threshold: Form T1135 is likely required${detailed !== null && cost >= Number(detailed) ? ' (detailed method)' : ''}`, `Le coût des biens étrangers déterminés totalise ${cost} $, au-dessus du seuil de ${t1135} $ : le formulaire T1135 est probablement requis${detailed !== null && cost >= Number(detailed) ? ' (méthode détaillée)' : ''}`], specialist: 'T1135 foreign income verification' }));
  } else if (anyCost && cost > 0 && cost <= Number(t1135)) {
    push(f({ key: 'x:t1135:under', kind: 'rule', sev: 'info', mod: 'R', title: [`Foreign property cost totals $${cost}, at or under the $${t1135} threshold: confirm nothing was left out`, `Le coût des biens étrangers totalise ${cost} $, au plus le seuil de ${t1135} $ : confirmer que rien n'a été omis`] }));
  }
  if (firstYear) push(f({ key: 'x:t1135:newcomer', kind: 'rule', sev: 'warning', mod: 'R', questionId: 'C.newcomer.arrival', title: [`Arrived in Canada in ${ctx.year}: only property held while resident counts toward the T1135 threshold, so the preparer should check the dates`, `Arrivé au Canada en ${ctx.year} : seuls les biens détenus pendant la résidence comptent pour le seuil du T1135, le préparateur doit donc vérifier les dates`] }));
  const qcLimit = verifiedValue('qc.foreignProperty', ctx.year);
  if (String(valueOf(ctx, PROVINCE_ANSWER) ?? '') === 'QC' && qcLimit !== null && anyCost && cost > Number(qcLimit)) push(f({ key: 'x:qc:tp1079', kind: 'specialist', sev: 'specialist', mod: 'AB', title: [`Québec resident with foreign property costing $${cost}: the Québec foreign property return (TP-1079.8.BE-V) is likely required`, `Résident du Québec avec des biens étrangers coûtant ${cost} $ : la déclaration des biens étrangers du Québec (TP-1079.8.BE-V) est probablement requise`], specialist: 'Québec foreign property' }));
}
const PROVINCE_ANSWER = 'B.res.province';

// ── sale of a home ──
function homeChecks(cat: Catalogue, ctx: Ctx, push: (f: Finding) => void) {
  for (const r of recordsOf(cat, ctx, 'P.home')) {
    const what = String(valueOf(ctx, 'P.home.what', r) ?? '');
    if (what !== 'sold' && what !== 'partSold' && what !== 'transferred') continue;
    const need: [string, L][] = [['acquired', ['date bought', "date d'achat"]], ['price', ['purchase price', "prix d'achat"]], ['soldDate', ['date sold', 'date de vente']], ['salePrice', ['selling price', 'prix de vente']]];
    const missing = need.filter(([id]) => isBlank(valueOf(ctx, `P.home.${id}`, r)) && answerOf(ctx, `P.home.${id}`, r)?.flag !== 'later');
    if (missing.length) push(f({ key: `x:home:details:${r}`, kind: 'required', sev: 'blocking', mod: 'P', questionId: `P.home.${missing[0][0]}`, rec: r, title: [`${recordLabel(cat, ctx, 'P.home', r)}: the sale cannot be reported without ${missing.map((x) => x[1][0]).join(', ')}`, `${recordLabel(cat, ctx, 'P.home', r)} : la vente ne peut pas être déclarée sans ${missing.map((x) => x[1][1]).join(', ')}`] }));
    const sold = valueOf(ctx, 'P.home.soldDate', r);
    if (typeof sold === 'string' && /^\d{4}/.test(sold) && Number(sold.slice(0, 4)) !== ctx.year) push(f({ key: `x:home:year:${r}`, kind: 'mismatch', sev: 'warning', mod: 'P', questionId: 'P.home.soldDate', rec: r, title: [`${recordLabel(cat, ctx, 'P.home', r)}: sold in ${sold.slice(0, 4)}, which is not the ${ctx.year} tax year`, `${recordLabel(cat, ctx, 'P.home', r)} : vendue en ${sold.slice(0, 4)}, ce qui n'est pas l'année d'imposition ${ctx.year}`] }));
    if (isBlank(valueOf(ctx, 'P.home.years', r)) && String(valueOf(ctx, 'P.home.designation', r) ?? '') === '' && answerOf(ctx, 'P.home.years', r)?.flag !== 'later') push(f({ key: `x:home:years:${r}`, kind: 'required', sev: 'warning', mod: 'P', questionId: 'P.home.years', rec: r, title: [`${recordLabel(cat, ctx, 'P.home', r)}: no years of use or designation entered, so the principal residence exemption cannot be assessed`, `${recordLabel(cat, ctx, 'P.home', r)} : aucune année d'usage ni désignation saisie, l'exemption pour résidence principale ne peut donc pas être évaluée`] }));
  }
  // short-term rental
  for (const r of recordsOf(cat, ctx, 'M.short')) {
    const nights = n(valueOf(ctx, 'M.short.nights', r));
    const licence = String(valueOf(ctx, 'M.short.licence', r) ?? '');
    const lbl = recordLabel(cat, ctx, 'M.short', r);
    if (licence === 'no' || licence === 'unsure') push(f({ key: `x:short:licence:${r}`, kind: 'specialist', sev: 'specialist', mod: 'M', questionId: 'M.short.licence', rec: r, title: [`${lbl}: short-term rental without a confirmed licence or registration: expense deductions may be denied`, `${lbl} : location à court terme sans permis ou enregistrement confirmé : les déductions de dépenses peuvent être refusées`], specialist: 'Short-term rental' }));
    if (nights !== null && nights >= 180) push(f({ key: `x:short:nights:${r}`, kind: 'rule', sev: 'warning', mod: 'M', questionId: 'M.short.nights', rec: r, title: [`${lbl}: ${nights} nights rented: check whether this is a business or a rental, and any GST/HST registration`, `${lbl} : ${nights} nuits louées : vérifier s'il s'agit d'une entreprise ou d'une location, et l'inscription à la TPS/TVH`] }));
  }
  if (recordsOf(cat, ctx, 'M.short').length && recordsOf(cat, ctx, 'M.prop').length === 0) push(f({ key: 'x:short:no-prop', kind: 'required', sev: 'blocking', mod: 'M', questionId: 'M.any.count', title: ['A short-term rental was entered with no rental property', "Une location à court terme est saisie sans immeuble locatif"] }));
}

// ── the tax year itself ──
function yearChecks(ctx: Ctx, push: (f: Finding) => void) {
  if (!isVerifiedYear(ctx.year)) {
    push(f({ key: `x:year:unverified:${ctx.year}`, kind: 'rule', sev: 'warning', title: [`The ${ctx.year} year's limits, dates and thresholds have not been verified in this questionnaire; the preparer must confirm every figure against the CRA's ${ctx.year} publications`, `Les limites, dates et seuils de ${ctx.year} n'ont pas été vérifiés dans ce questionnaire; le préparateur doit confirmer chaque chiffre selon les publications de l'ARC pour ${ctx.year}`] }));
  }
  const dead = ruleFor('lcge.limit', ctx.year);
  void dead;
}

// ── summaries ──
export interface FindingCounts { blocking: number; warning: number; specialist: number; info: number; total: number }
export function countFindings(list: Finding[]): FindingCounts {
  const c: FindingCounts = { blocking: 0, warning: 0, specialist: 0, info: 0, total: list.length };
  for (const x of list) c[x.sev as Severity]++;
  return c;
}
/** A client may submit when nothing blocks. Questions they could not answer are flagged, not blocking. */
export const canSubmit = (list: Finding[]) => !list.some((x) => x.sev === 'blocking');
