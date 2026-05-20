import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const templates = await db.prepare(`SELECT * FROM organizer_templates WHERE org_id = ? ORDER BY created_at DESC`).all(orgId);
    
    // Fetch sections and questions for each template
    const sectionsStmt = await db.prepare(`SELECT * FROM organizer_template_sections WHERE template_id = ? ORDER BY sequence_order ASC`);
    const questionsStmt = await db.prepare(`SELECT * FROM organizer_template_questions WHERE section_id = ? ORDER BY sequence_order ASC`);
    
    const configuredTemplates = templates.map(async (tpl: any) => {
      const sections = sectionsStmt.all(tpl.id);
      const populatedSections = sections.map((sec: any) => ({
        ...sec,
        questions: questionsStmt.all(sec.id)
      }));
      return {
        ...tpl,
        sections: populatedSections
      };
    });

    return NextResponse.json(configuredTemplates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await req.json();
    const { name, description, sections } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const templateId = uuidv4();
    const now = new Date().toISOString();
    
    // Assign created_by (mocking admin context)
    const adminId = userId;

    // Insert template
    await db.prepare(`
      INSERT INTO organizer_templates (id, org_id, name, description, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(templateId, orgId, name, description || '', adminId, now, now);

    // Insert sections and questions 
    if (sections && Array.isArray(sections)) {
      // Use transaction to ensure full commit
      await (db.transaction(async (txDb: any) => {
        const txInsertSection = await txDb.prepare(`
          INSERT INTO organizer_template_sections (id, template_id, title, sequence_order)
          VALUES (?, ?, ?, ?)
        `);
        
        const txInsertQuestion = await txDb.prepare(`
          INSERT INTO organizer_template_questions (id, section_id, question_text, question_type, is_required, sequence_order, options, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (let secIdx = 0; secIdx < sections.length; secIdx++) {
          const sec = sections[secIdx];
          const sectionId = uuidv4();
          await txInsertSection.run(sectionId, templateId, sec.title, secIdx + 1);
          
          if (sec.questions && Array.isArray(sec.questions)) {
            for (let qIdx = 0; qIdx < sec.questions.length; qIdx++) {
              const q = sec.questions[qIdx];
              await txInsertQuestion.run(
                uuidv4(),
                sectionId,
                q.question_text,
                q.question_type || 'text',
                q.is_required ? 1 : 0,
                qIdx + 1,
                q.options ? JSON.stringify(q.options) : null,
                now
              );
            }
          }
        }
      }))();
    }

    return NextResponse.json({ id: templateId, message: 'Organizer template created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
