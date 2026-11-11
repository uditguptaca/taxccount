// UNITED STATES, state level. Filled from the state research; until a state's own page has been read its
// filings stay generic and unverified.
import type { Compliance, Question, Source, State } from '../types.ts';
import { US_STATES } from './geo.ts';

export const US_STATE_LIST: State[] = US_STATES.map(([code, name]) => ({ code, name }));
export const US_STATE_QUESTIONS: Question[] = [];
export const US_STATE_COMPLIANCES: Compliance[] = [];
export const US_STATE_SOURCES: Source[] = [];
