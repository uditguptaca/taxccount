// Prints a complete set of answers as the JSON the API expects: node t1_fill.ts <PROVINCE> <min|max> [year]
import { walk } from './t1_walk.ts';
import type { Strategy } from './t1_walk.ts';
const [prov = 'ON', strat = 'max', year = '2025'] = process.argv.slice(2);
const w = walk(Number(year), prov, strat as Strategy);
const responses = Object.entries(w.answers).map(([k, a]) => { const i = k.lastIndexOf('|'); return { questionId: k.slice(0, i), recordIndex: Number(k.slice(i + 1)), value: a.v ?? null, flag: a.flag ?? null, flagNote: a.note ?? null }; });
console.log(JSON.stringify({ responses }));
