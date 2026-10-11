import type { Lang } from '@/lib/t1/types';

const D = {
  yes: ['Yes', 'Oui'], no: ['No', 'Non'], unsure: ["I'm not sure", 'Je ne suis pas certain'],
  later: ["I'll provide this later", 'Je le fournirai plus tard'], ask: ['Ask my preparer', 'Demander à mon préparateur'],
  laterShort: ['Providing later', 'À fournir plus tard'], askShort: ['Question for preparer', 'Question pour le préparateur'],
  askNote: ['What would you like to ask?', 'Que souhaitez-vous demander?'], clear: ['Clear', 'Effacer'],
  why: ['Why are we asking this?', 'Pourquoi cette question?'], required: ['Required', 'Obligatoire'], optional: ['Optional', 'Facultatif'],
  select: ['Choose…', 'Choisir…'], upload: ['Upload a file', 'Téléverser un fichier'], uploading: ['Uploading…', 'Téléversement…'],
  remove: ['Remove', 'Retirer'], view: ['View', 'Voir'], addRow: ['Add a row', 'Ajouter une ligne'], removeRow: ['Remove row', 'Retirer la ligne'],
  addAnother: ['Add another', 'En ajouter un autre'], addFirst: ['Add', 'Ajouter'], removeRecord: ['Remove this one', 'Retirer celui-ci'],
  removeConfirm: ['Remove this? Your preparer can still see what was entered before.', 'Retirer? Votre préparateur pourra toujours voir ce qui a été saisi.'],
  saved: ['All changes saved', 'Toutes les modifications sont enregistrées'], saving: ['Saving…', 'Enregistrement…'], pending: ['Saving in a moment…', 'Enregistrement dans un instant…'],
  saveError: ['Not saved yet. Your answers are kept on this screen and we will keep trying.', "Pas encore enregistré. Vos réponses restent à l'écran et nous réessayons."], retry: ['Try now', 'Réessayer'],
  locked: ['Submitted. Read only.', 'Soumis. Lecture seule.'],
  welcome: ['Welcome', 'Bienvenue'], review: ['Review and submit', 'Vérifier et soumettre'], documents: ['Documents', 'Documents'],
  questions: ['My questions', 'Mes questions'], next: ['Next', 'Suivant'], back: ['Back', 'Précédent'], continue: ['Continue', 'Continuer'],
  progress: ['Progress', 'Progression'], showSin: ['Show', 'Afficher'], hideSin: ['Hide', 'Masquer'],
  status_not_started: ['Not started', 'Pas commencé'], status_in_progress: ['In progress', 'En cours'], status_awaiting_documents: ['Waiting for documents', 'En attente de documents'],
  status_needs_clarification: ['Needs your input', 'Nécessite votre avis'], status_complete: ['Complete', 'Terminé'],
  submit: ['Submit information to my preparer', 'Soumettre mes renseignements à mon préparateur'],
  submitting: ['Submitting…', 'Soumission…'],
  frNote: ['The French text was written for this form and has not yet been reviewed by a professional translator.', "Le texte français a été rédigé pour ce formulaire et n'a pas encore été révisé par un traducteur professionnel."],
  notFiling: ['Submitting sends your information to your preparer. It does not file anything with the CRA or Revenu Québec.', "La soumission transmet vos renseignements à votre préparateur. Rien n'est produit auprès de l'ARC ni de Revenu Québec."],
  moreInfo: ['What this is and why we ask', 'De quoi il s\'agit et pourquoi nous le demandons'], moreOptions: ['Help and more options', 'Aide et autres options'], cantAnswer: ["Can't answer right now?", 'Impossible de répondre maintenant?'],
  language: ['Français', 'English'], sections: ['Sections', 'Sections'], year: ['Tax year', "Année d'imposition"],
  notApplicable: ['Nothing to answer here for you.', "Rien à répondre ici pour vous."],
  removedNote: ['Answers from an earlier version of the form', "Réponses d'une version précédente du formulaire"],
  conflict: ['Another person changed some answers at the same time. We kept the newer ones.', "Une autre personne a modifié des réponses en même temps. Nous avons gardé les plus récentes."],
} as const;
export type Key = keyof typeof D;
export const tt = (lang: Lang, k: Key): string => D[k][lang === 'fr' ? 1 : 0];
