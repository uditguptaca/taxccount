import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const db = getDb();
    const templates = db.prepare(`SELECT * FROM organizer_templates ORDER BY created_at DESC`).all();
    
    // Fetch sections and questions for each template
    const sectionsStmt = db.prepare(`SELECT * FROM organizer_template_sections WHERE template_id = ? ORDER BY sequence_order ASC`);
    const questionsStmt = db.prepare(`SELECT * FROM organizer_template_questions WHERE section_id = ? ORDER BY sequence_order ASC`);
    
    const configuredTemplates = templates.map((tpl: any) => {
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
    const db = getDb();
    const body = await req.json();
    const { name, description, sections } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const templateId = uuidv4();
    const now = new Date().toISOString();
    
    // Assign created_by (mocking admin context)
    const firstAdmin = db.prepare(`SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1`).get() as { id: string };
    const adminId = firstAdmin?.id || 'admin_1';

    // Insert template
    db.prepare(`
      INSERT INTO organizer_templates (id, name, description, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(templateId, name, description || '', adminId, now, now);

    // Insert sections and questions 
    if (sections && Array.isArray(sections)) {
      const insertSection = db.prepare(`
        INSERT INTO organizer_template_sections (id, template_id, title, sequence_order)
        VALUES (?, ?, ?, ?)
      `);
      
      const insertQuestion = db.prepare(`
        INSERT INTO organizer_template_questions (id, section_id, question_text, question_type, is_required, sequence_order, options, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Use transaction to ensure full commit
      const processSections = db.transaction((secArray: any[]) => {
        secArray.forEach((sec: any, secIdx: number) => {
          const sectionId = uuidv4();
          insertSection.run(sectionId, templateId, sec.title, secIdx + 1);
          
          if (sec.questions && Array.isArray(sec.questions)) {
            sec.questions.forEach((q: any, qIdx: number) => {
              insertQuestion.run(
                uuidv4(),
                sectionId,
                q.question_text,
                q.question_type || 'text',
                q.is_required ? 1 : 0,
                qIdx + 1,
                q.options ? JSON.stringify(q.options) : null,
                now
              );
            });
          }
        });
      });
      
      processSections(sections);
    }

    return NextResponse.json({ id: templateId, message: 'Organizer template created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
