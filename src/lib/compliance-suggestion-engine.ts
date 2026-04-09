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
 * Get all applicability questions for the matching compliances AND independent questions.
 * Groups by sub-compliance and builds parent-child hierarchy.
 */
export function getDiscoveryQuestions(profile: UserProfile): DiscoveryQuestion[] {
  const db = getDb();

  // First get all matching sub-compliance IDs for this jurisdiction
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

  // If no matching compliances, still we might have independent questions that map strictly by jurisdiction
  // So we just fetch questions that natively map to the user's jurisdiction, or belong to a sub-compliance in matchingIds.
  
  let placeholders = "";
  let ids: string[] = [];
  
  if (matchingIds.length > 0) {
    ids = matchingIds.map((r: any) => r.id);
    placeholders = ids.map(() => '?').join(',');
  }

  // We fetch questions that EITHER:
  // 1. Belong to a matched optional sub-compliance AND match jurisdiction directly.
  // 2. Do not have a sub_compliance_id but strictly match jurisdiction directly.
  
  // Note: Since placeholders could be empty, handle gracefully
  const subCompClause = placeholders ? `q.sub_compliance_id IN (${placeholders}) OR q.sub_compliance_id IS NULL` : `q.sub_compliance_id IS NULL`;

  const questions = db.prepare(`
    SELECT q.*, sc.name as sub_compliance_name
    FROM sm_questions q
    LEFT JOIN sm_sub_compliances sc ON q.sub_compliance_id = sc.id
    WHERE q.is_active = 1
      AND (q.country_id = ? OR q.country_id IS NULL)
      AND (q.state_id = ? OR q.state_id IS NULL)
      AND (q.entity_type_id = ? OR q.entity_type_id IS NULL)
      AND (${subCompClause})
    ORDER BY q.sort_order
  `).all(profile.countryId, profile.stateId, profile.entityTypeId, ...ids) as DiscoveryQuestion[];

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

  // Apply default status
  for (const comp of allCompliances) {
    if (comp.is_compulsory) {
      comp.selectionMethod = 'compulsory';
      comp.reason = 'Compulsory for your entity type';
    } else {
      comp.selectionMethod = 'available';
      comp.reason = 'You can optionally add this compliance';
    }
  }

  // Build answer lookup
  const answerMap = new Map<string, string>();
  for (const a of answers) {
    answerMap.set(a.questionId, a.answer);
  }
  
  if (answerMap.size === 0) return allCompliances;

  // Fetch all active questions relevant to the user's jurisdiction
  const questions = db.prepare(`
    SELECT * FROM sm_questions
    WHERE is_active = 1
      AND (country_id = ? OR country_id IS NULL)
      AND (state_id = ? OR state_id IS NULL)
      AND (entity_type_id = ? OR entity_type_id IS NULL)
    ORDER BY sort_order
  `).all(profile.countryId, profile.stateId, profile.entityTypeId) as any[];

  // Map to find questions easily
  const questionMap = new Map();
  for (const q of questions) {
    questionMap.set(q.id, q);
  }

  // Evaluate triggers logically
  for (const [qId, ans] of Array.from(answerMap.entries())) {
    const q = questionMap.get(qId);
    if (!q) continue;

    // Check if it's a trigger and matches the target value
    if (q.is_compulsory_trigger && (ans || '').toLowerCase() === (q.trigger_value || '').toLowerCase()) {
      
      // What does this trigger? 
      // It defaults to its linked `sub_compliance_id` unless it explicitly overrides with `triggers_sub_compliance_id`
      const targetSubCompId = q.triggers_sub_compliance_id || q.sub_compliance_id;
      if (!targetSubCompId) continue;
      
      // Apply the suggestion
      const variant = allCompliances.find(c => c.sub_compliance_id === targetSubCompId);
      if (variant && variant.selectionMethod !== 'compulsory') {
        variant.selectionMethod = 'auto_suggested';
        
        // If it's a child question, show parent context
        if (q.parent_question_id) {
          variant.reason = `Based on nested scenario: "${q.question_text}" = ${ans}`;
        } else {
          variant.reason = `You answered "${ans}" to "${q.question_text}"`;
        }
      }
    }
  }

  return allCompliances;
}
