import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { triggerWorkflowEvent } from '@/lib/workflow-engine';
import { getSessionContext } from "@/lib/auth-context";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    
    // Get instance
    const instance = db.prepare(`
      SELECT o.*, t.name as template_name, t.description as template_description 
      FROM organizer_instances o
      JOIN organizer_templates t ON o.template_id = t.id
      WHERE o.id = ?
    `).get(params.id) as any;

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Get sections and questions
    const sections = db.prepare(`SELECT * FROM organizer_template_sections WHERE template_id = ? ORDER BY sequence_order ASC`).all(instance.template_id);
    const questionsStmt = db.prepare(`SELECT * FROM organizer_template_questions WHERE section_id = ? ORDER BY sequence_order ASC`);
    
    // Get existing answers
    const answersStmt = db.prepare(`SELECT * FROM organizer_answers WHERE instance_id = ?`);
    const answers = answersStmt.all(params.id) as any[];
    
    const mappedSections = sections.map((sec: any) => {
      const questions = questionsStmt.all(sec.id).map((q: any) => {
        const matchingAnswer = answers.find((a: any) => a.question_id === q.id);
        return {
          ...q,
          answer: matchingAnswer ? matchingAnswer.answer_text : ''
        };
      });
      return { ...sec, questions };
    });

    return NextResponse.json({ ...instance, sections: mappedSections });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const body = await req.json();
    const { answers, status } = body; 

    const now = new Date().toISOString();
    
    if (answers && Array.isArray(answers)) {
      const upsertAnswer = db.prepare(`
        INSERT INTO organizer_answers (id, instance_id, question_id, answer_text, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(instance_id, question_id) 
        DO UPDATE SET answer_text = excluded.answer_text, updated_at = excluded.updated_at
      `);
      
      const processAnswers = db.transaction((ansArray: any[]) => {
        ansArray.forEach((ans: any) => {
          // Find if there is an existing answer id first, or use a new uuid if it's the first time
          // Since ON CONFLICT is used (instance_id, question_id), we just pass a new uuid for id
          upsertAnswer.run(uuidv4(), params.id, ans.question_id, ans.answer_text, now, now);
        });
      });
      
      processAnswers(answers);
    }

    if (status) {
      db.prepare(`UPDATE organizer_instances SET status = ?, updated_at = ? WHERE id = ?`).run(status, now, params.id);
      if (status === 'completed') {
        db.prepare(`UPDATE organizer_instances SET completed_at = ? WHERE id = ?`).run(now, params.id);
        
        // Trigger Workflow Event BUS Here
        const instanceInfo = db.prepare(`SELECT client_id, engagement_id, template_id FROM organizer_instances WHERE id = ?`).get(params.id) as any;
        if (instanceInfo) {
          triggerWorkflowEvent('ORGANIZER_COMPLETED', {
            client_id: instanceInfo.client_id,
            engagement_id: instanceInfo.engagement_id,
            pipeline_template_id: instanceInfo.template_id,
            entity_id: params.id
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
