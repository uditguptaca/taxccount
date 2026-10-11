// The T1 questionnaire. Version it whenever a question, rule or wording changes so a submitted
// snapshot can always be read against the questions that were live when it was filled in.
import type { Module } from '../types.ts';
import { indexCatalogue } from '../evaluate.ts';
import { moduleA } from './a-engagement.ts';
import { moduleB } from './b-identification.ts';
import { moduleC } from './c-residency.ts';
import { moduleD } from './d-household.ts';
import { moduleE } from './e-dependants.ts';
import { moduleF } from './f-screening.ts';
import { moduleG } from './g-slips.ts';
import { moduleH } from './h-employment.ts';
import { moduleI } from './i-pensions.ts';
import { moduleJ } from './j-selfemployment.ts';
import { moduleK } from './k-farming.ts';
import { moduleL } from './l-schedules.ts';
import { moduleM } from './m-rental.ts';
import { moduleN } from './n-investments.ts';
import { moduleO } from './o-capital.ts';
import { moduleP } from './p-residence.ts';
import { moduleQ } from './q-crypto.ts';
import { moduleR } from './r-foreign.ts';
import { moduleS } from './s-rrsp.ts';
import { moduleT } from './t-fhsa.ts';
import { moduleU } from './u-employment-expenses.ts';
import { moduleV } from './v-childcare.ts';
import { moduleW } from './w-education.ts';
import { moduleX } from './x-medical.ts';
import { moduleY } from './y-housing.ts';
import { moduleAA } from './aa-provincial.ts';
import { moduleAB } from './ab-quebec.ts';
import { moduleZ } from './z-donations.ts';
import { moduleAC } from './ac-special.ts';
import { moduleAD } from './ad-review.ts';

export const CATALOGUE_VERSION = '2026.10.1';
export const MODULES: Module[] = [moduleA, moduleB, moduleC, moduleD, moduleE, moduleF, moduleG, moduleH, moduleI, moduleJ, moduleK, moduleL, moduleM, moduleN, moduleO, moduleP, moduleQ, moduleR, moduleS, moduleT, moduleU, moduleV, moduleW, moduleX, moduleY, moduleZ, moduleAA, moduleAB, moduleAC, moduleAD];
export const CATALOGUE = indexCatalogue(CATALOGUE_VERSION, MODULES);
