// Option lists shared by many questions.
import type { Option } from './types.ts';
import { O } from './dsl.ts';

export const PROVINCE_OPTS: Option[] = O(
  'AB|Alberta|Alberta', 'BC|British Columbia|Colombie-Britannique', 'MB|Manitoba|Manitoba', 'NB|New Brunswick|Nouveau-Brunswick',
  'NL|Newfoundland and Labrador|Terre-Neuve-et-Labrador', 'NT|Northwest Territories|Territoires du Nord-Ouest', 'NS|Nova Scotia|Nouvelle-Écosse',
  'NU|Nunavut|Nunavut', 'ON|Ontario|Ontario', 'PE|Prince Edward Island|Île-du-Prince-Édouard', 'QC|Quebec|Québec', 'SK|Saskatchewan|Saskatchewan', 'YT|Yukon|Yukon',
);
export const PROVINCE_NAMES: Record<string, { en: string; fr: string }> = Object.fromEntries(PROVINCE_OPTS.map((o) => [o.v, { en: o.en, fr: o.fr }]));

export const PROVINCE_OR_OUTSIDE: Option[] = [...PROVINCE_OPTS, ...O('OUT|Outside Canada|À l\'extérieur du Canada')];

export const COUNTRIES: Option[] = O(
  'CA|Canada|Canada', 'US|United States|États-Unis', 'GB|United Kingdom|Royaume-Uni', 'FR|France|France', 'DE|Germany|Allemagne', 'IN|India|Inde', 'CN|China|Chine',
  'HK|Hong Kong|Hong Kong', 'PH|Philippines|Philippines', 'PK|Pakistan|Pakistan', 'BD|Bangladesh|Bangladesh', 'LK|Sri Lanka|Sri Lanka', 'NG|Nigeria|Nigéria', 'EG|Egypt|Égypte',
  'IR|Iran|Iran', 'IQ|Iraq|Irak', 'SY|Syria|Syrie', 'UA|Ukraine|Ukraine', 'RU|Russia|Russie', 'MX|Mexico|Mexique', 'BR|Brazil|Brésil', 'CO|Colombia|Colombie', 'JM|Jamaica|Jamaïque',
  'HT|Haiti|Haïti', 'VN|Vietnam|Viêt Nam', 'KR|South Korea|Corée du Sud', 'JP|Japan|Japon', 'AU|Australia|Australie', 'NZ|New Zealand|Nouvelle-Zélande', 'IE|Ireland|Irlande',
  'IT|Italy|Italie', 'ES|Spain|Espagne', 'PT|Portugal|Portugal', 'PL|Poland|Pologne', 'NL|Netherlands|Pays-Bas', 'CH|Switzerland|Suisse', 'AE|United Arab Emirates|Émirats arabes unis',
  'SA|Saudi Arabia|Arabie saoudite', 'LB|Lebanon|Liban', 'TR|Türkiye|Turquie', 'ZA|South Africa|Afrique du Sud', 'KE|Kenya|Kenya', 'GH|Ghana|Ghana', 'ET|Ethiopia|Éthiopie',
  'SG|Singapore|Singapour', 'OTHER|Another country|Autre pays',
);

export const MONTHS: Option[] = O(
  '1|January|Janvier', '2|February|Février', '3|March|Mars', '4|April|Avril', '5|May|Mai', '6|June|Juin', '7|July|Juillet', '8|August|Août',
  '9|September|Septembre', '10|October|Octobre', '11|November|Novembre', '12|December|Décembre',
);

export const RELATIONSHIPS: Option[] = O(
  'spouse|Spouse or common-law partner|Conjoint(e) ou conjoint(e) de fait', 'child|Child|Enfant', 'grandchild|Grandchild|Petit-enfant', 'parent|Parent|Parent',
  'grandparent|Grandparent|Grands-parents', 'sibling|Brother or sister|Frère ou sœur', 'niece_nephew|Niece or nephew|Nièce ou neveu', 'aunt_uncle|Aunt or uncle|Tante ou oncle',
  'other|Other relative or non-relative|Autre personne apparentée ou non',
);

export const CURRENCIES: Option[] = O(
  'CAD|Canadian dollar (CAD)|Dollar canadien (CAD)', 'USD|US dollar (USD)|Dollar américain (USD)', 'EUR|Euro (EUR)|Euro (EUR)', 'GBP|British pound (GBP)|Livre sterling (GBP)',
  'INR|Indian rupee (INR)|Roupie indienne (INR)', 'CNY|Chinese yuan (CNY)|Yuan chinois (CNY)', 'HKD|Hong Kong dollar (HKD)|Dollar de Hong Kong (HKD)',
  'PHP|Philippine peso (PHP)|Peso philippin (PHP)', 'AUD|Australian dollar (AUD)|Dollar australien (AUD)', 'OTHER|Other currency|Autre devise',
);

export const CONTACT_METHOD: Option[] = O('email|Email|Courriel', 'phone|Phone call|Appel téléphonique', 'text|Text message|Message texte', 'portal|Secure portal messages|Messages du portail sécurisé');
export const OWN_SPOUSE: Option[] = O('self|Me|Moi', 'spouse|My spouse or partner|Mon conjoint ou ma conjointe', 'joint|Both of us (joint)|Les deux (conjoint)', 'dependant|A dependant|Une personne à charge');
export const OWNER_ONLY: Option[] = O('self|Me|Moi', 'spouse|My spouse or partner|Mon conjoint ou ma conjointe', 'joint|Both of us (joint)|Les deux (conjoint)');
export const DOC_STATUS: Option[] = O('original|Original|Original', 'amended|Amended|Modifié', 'cancelled|Cancelled|Annulé', 'replaced|Replaced|Remplacé');
