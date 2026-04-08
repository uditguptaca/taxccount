// ══════════════════════════════════════════════════════════════════
// COMPLIANCE SUGGESTION ENGINE — Intelligence Engine
// Takes user profile + admin rules + user answers → suggests compliances
// ══════════════════════════════════════════════════════════════════

import { getDb } from './db';

export interface UserProfile {
  countryId: string;
  stateId: string;
  entityTypeId: string;
}

export interface QuestionAnswer {
  questionId: string;
  answer: string;
}

export interface DiscoveryQuestion {
  id: string;
  question_text: string;
  question_type: string;
  description: string | null;
  options: string | null;
  sort_order: number;
  sub_compliance_id: string;
  sub_compliance_name: string;
  parent_question_id: string | null;
  is_compulsory_trigger: number;
  trigger_value: string | null;
  triggers_sub_compliance_id: string | null;
  threshold_context: string | null;
  children?: DiscoveryQuestion[];
}

export interface SuggestedCompliance {
  id: string;
  sub_compliance_id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  brief: string | null;
  compliance_head_name: string;
  compliance_head_icon: string | null;
  compliance_head_color: string | null;
  has_compliance_date: number;
  dependency_type: string | null;
  dependency_label: string | null;
  period_type: string | null;
  period_value: number;
  grace_value: number;
  grace_unit: string | null;
  is_compulsory: number;
  undertaking_required: number;
  undertaking_text: string | null;
  service_rule_id: string;
  country_name: string | null;
  state_name: string | null;
  entity_type_name: string | null;
  department_name: string | null;
  selectionMethod: 'compulsory' | 'auto_suggested' | 'available';
  reason: string;
}

/**
 * Get all compliances matching a user's jurisdiction profile.
 * This does NOT filter by questions — it returns everything
 * that matches country/state/entity_type in the service rules.
 */
export function getAllMatchingCompliances(profile: UserProfile): SuggestedCompliance[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT
      sr.id as service_rule_id,
      sc.id as sub_compliance_id,
      sc.name, sc.short_name, sc.description, sc.brief,
      sc.has_compliance_date, sc.dependency_type, sc.dependency_label,
      sc.period_type, sc.period_value, sc.grace_value, sc.grace_unit,
      sc.is_compulsory, sc.undertaking_required, sc.undertaking_text, sc.sort_order,
      ch.name as compliance_head_name, ch.icon as compliance_head_icon, ch.color_code as compliance_head_color,
      c.name as country_name, s.name as state_name,
      et.name as entity_type_name, d.name as department_name
    FROM sm_service_rules sr
    JOIN sm_sub_compliances sc ON sr.sub_compliance_id = sc.id
    JOIN sm_compliance_heads ch ON sc.compliance_head_id = ch.id
    LEFT JOIN sm_countries c ON sr.country_id = c.id
    LEFT JOIN sm_states s ON sr.state_id = s.id
    LEFT JOIN sm_entity_types et ON sr.entity_type_id = et.id
    LEFT JOIN sm_departments d ON sr.department_id = d.id
    WHERE sc.is_active = 1 AND sr.is_active = 1
      AND (sr.country_id = ? OR sr.country_id IS NULL)
      AND (sr.state_id = ? OR sr.state_id IS NULL)
      AND (sr.entity_type_id = ? OR sr.entity_type_id IS NULL)
    ORDER BY ch.sort_order, sc.sort_order, sc.name
  `).all(profile.countryId, profile.stateId, profile.entityTypeId) as any[];

  return rows.map(r => ({
    ...r,
    id: r.service_rule_id,
    selectionMethod: r.is_compulsory ? 'compulsory' as const : 'available' as const,
    reason: r.is_compulsory ? 'Compulsory for your entity type' : 'Available for your jurisdiction',
  }));
}

/**
 * Get all applicability questions for the matching compliances.
 * Groups by sub-compliance and builds parent-child hierarchy.
 */
export function getDiscoveryQuestions(profile: UserProfile): DiscoveryQuestion[] {
  const db = getDb();

  // First get all matching sub-compliance IDs
  const matchingIds = db.prepare(`
    SELECT DISTINCT sc.id
    FROM sm_service_rules sr
    JOIN sm_sub_compliances sc ON sr.sub_compliance_id = sc.id
    WHERE sc.is_active = 1 AND sr.is_active = 1
      AND sc.is_compulsory = 0
      AND (sr.country_id = ? OR sr.country_id IS NULL)
      AND (sr.state_id = ? OR sr.state_id IS NULL)
      AND (sr.entity_type_id = ? OR sr.entity_type_id IS NULL)
  `).all(profile.countryId, profile.stateId, profile.entityTypeId) as any[];

  if (matchingIds.length === 0) return [];

  const ids = matchingIds.map((r: any) => r.id);
  const placeholders = ids.map(() => '?').join(',');

  const questions = db.prepare(`
    SELECT q.*, sc.name as sub_compliance_name
    FROM sm_questions q
    JOIN sm_sub_compliances sc ON q.sub_compliance_id = sc.id
    WHERE q.sub_compliance_id IN (${placeholders})
      AND q.is_active = 1
    ORDER BY q.sort_order
  `).all(...ids) as DiscoveryQuestion[];

  // Build hierarchy (parent → children)
  const rootQuestions = questions.filter(q => !q.parent_question_id);
  for (const root of rootQuestions) {
    root.children = questions.filter(q => q.parent_question_id === root.id);
    for (const child of root.children) {
      child.children = questions.filter(q => q.parent_question_id === child.id);
    }
  }

  return rootQuestions;
}

/**
 * Run the suggestion algorithm: take user answers and determine
 * which compliances should be auto-suggested vs just available.
 */
export function suggestCompliances(
  profile: UserProfile,
  answers: QuestionAnswer[]
): SuggestedCompliance[] {
  const allCompliances = getAllMatchingCompliances(profile);
  const db = getDb();

  // Build answer lookup
  const answerMap = new Map<string, string>();
  for (const a of answers) {
    answerMap.set(a.questionId, a.answer);
  }

  // Process each non-compulsory compliance
  for (const comp of allCompliances) {
    if (comp.is_compulsory) {
      comp.selectionMethod = 'compulsory';
      comp.reason = 'Compulsory for your entity type';
      continue;
    }

    // Get questions for this sub-compliance
    const questions = db.prepare(`
      SELECT * FROM sm_questions
      WHERE sub_compliance_id = ? AND parent_question_id IS NULL AND is_active = 1
      ORDER BY sort_order
    `).all(comp.sub_compliance_id) as any[];

    if (questions.length === 0) {
      comp.selectionMethod = 'available';
      comp.reason = 'Available for your jurisdiction';
      continue;
    }

    let suggested = false;
    let reason = '';

    for (const q of questions) {
      const userAnswer = answerMap.get(q.id);
      if (!userAnswer) continue;

      if (q.is_compulsory_trigger && userAnswer.toLowerCase() === (q.trigger_value || '').toLowerCase()) {
        suggested = true;
        reason = `You answered "${userAnswer}" to "${q.question_text}"`;

        // Check child questions for more specific variants
        const childQuestions = db.prepare(`
          SELECT * FROM sm_questions
          WHERE parent_question_id = ? AND is_active = 1
          ORDER BY sort_order
        `).all(q.id) as any[];

        for (const cq of childQuestions) {
          const childAnswer = answerMap.get(cq.id);
          if (childAnswer && cq.triggers_sub_compliance_id && childAnswer.toLowerCase() === (cq.trigger_value || '').toLowerCase()) {
            // This child triggers a different sub-compliance variant
            const variant = allCompliances.find(c => c.sub_compliance_id === cq.triggers_sub_compliance_id);
            if (variant && variant.selectionMethod !== 'compulsory') {
              variant.selectionMethod = 'auto_suggested';
              variant.reason = `Based on: "${cq.question_text}" = ${childAnswer}`;
            }
          }
        }
        break;
      }
    }

    if (suggested) {
      comp.selectionMethod = 'auto_suggested';
      comp.reason = reason;
    } else {
      comp.selectionMethod = 'available';
      comp.reason = 'You can optionally add this compliance';
    }
  }

  return allCompliances;
}
