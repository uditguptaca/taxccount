import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';

export function seedDatabase() {
  const db = getDb();

  // ── CLIENT TYPES CONFIG (Always ensure these exist) ──
  const typeCount = db.prepare('SELECT COUNT(*) as count FROM client_types_config').get() as any;
  const typeMap: Record<string, string> = {};
  
  if (typeCount.count === 0) {
    const types = [
      { id: uuidv4(), name: 'Individual', is_system: 1 },
      { id: uuidv4(), name: 'Business', is_system: 1 },
      { id: uuidv4(), name: 'Trust', is_system: 1 },
      { id: uuidv4(), name: 'Sole Proprietor', is_system: 1 },
    ];
    const iType = db.prepare(`INSERT INTO client_types_config (id, name, is_system) VALUES (?, ?, ?)`);
    types.forEach(t => {
      iType.run(t.id, t.name, t.is_system);
      typeMap[t.name.toLowerCase()] = t.id;
    });
  } else {
    const existingTypes = db.prepare(`SELECT * FROM client_types_config`).all() as any[];
    existingTypes.forEach(t => {
      typeMap[t.name.toLowerCase()] = t.id;
    });
  }

  // Backfill existing clients if needed
  db.prepare(`
    UPDATE clients SET client_type_id = (SELECT id FROM client_types_config WHERE LOWER(name) = 'individual') 
    WHERE client_type_id IS NULL AND client_type = 'individual'
  `).run();
  db.prepare(`
    UPDATE clients SET client_type_id = (SELECT id FROM client_types_config WHERE LOWER(name) = 'business') 
    WHERE client_type_id IS NULL AND client_type = 'business'
  `).run();
  db.prepare(`
    UPDATE clients SET client_type_id = (SELECT id FROM client_types_config WHERE LOWER(name) = 'trust') 
    WHERE client_type_id IS NULL AND client_type = 'trust'
  `).run();
  db.prepare(`
    UPDATE clients SET client_type_id = (SELECT id FROM client_types_config WHERE LOWER(name) = 'sole proprietor') 
    WHERE client_type_id IS NULL AND client_type = 'sole_proprietor'
  `).run();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count > 0) return;

  const hash = bcryptjs.hashSync('password123', 10);
  const now = new Date().toISOString();
  const uid = () => uuidv4();

  // ── USERS ──
  const adminId = uid(); const mgr1Id = uid(); const mgr2Id = uid();
  const mem1Id = uid(); const mem2Id = uid(); const mem3Id = uid(); const mem4Id = uid(); const mem5Id = uid();
  const cu1 = uid(); const cu2 = uid(); const cu3 = uid();

  const iU = db.prepare(`INSERT INTO users (id,email,password_hash,first_name,last_name,phone,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,?,?)`);
  iU.run(adminId,'admin@taxccount.ca',hash,'Sarah','Mitchell','416-555-0100','super_admin',now,now);
  iU.run(mgr1Id,'david@taxccount.ca',hash,'David','Chen','416-555-0101','team_manager',now,now);
  iU.run(mgr2Id,'lisa@taxccount.ca',hash,'Lisa','Nakamura','416-555-0110','team_manager',now,now);
  iU.run(mem1Id,'emily@taxccount.ca',hash,'Emily','Rodriguez','416-555-0102','team_member',now,now);
  iU.run(mem2Id,'michael@taxccount.ca',hash,'Michael','Johnson','416-555-0103','team_member',now,now);
  iU.run(mem3Id,'priya@taxccount.ca',hash,'Priya','Patel','416-555-0104','team_member',now,now);
  iU.run(mem4Id,'alex@taxccount.ca',hash,'Alex','Dubois','416-555-0105','team_member',now,now);
  iU.run(mem5Id,'neha@taxccount.ca',hash,'Neha','Sharma','416-555-0106','team_member',now,now);
  iU.run(cu1,'james@email.com',hash,'James','Thompson','905-555-0200','client',now,now);
  iU.run(cu2,'contact@mapleleaf.ca',hash,'Robert','Williams','604-555-0300','client',now,now);
  iU.run(cu3,'singh@email.com',hash,'Harpreet','Singh','780-555-0700','client',now,now);

  const staffIds = [adminId,mgr1Id,mgr2Id,mem1Id,mem2Id,mem3Id,mem4Id,mem5Id];

  // ── TEAMS ──
  const t1 = uid(); const t2 = uid(); const t3 = uid(); const t4 = uid();
  const iT = db.prepare(`INSERT INTO teams (id,name,description,manager_id,is_active,created_at,updated_at) VALUES (?,?,?,?,1,?,?)`);
  iT.run(t1,'Personal Tax Team','T1 and personal filings',mgr1Id,now,now);
  iT.run(t2,'Corporate Tax Team','T2, GST/HST, corporate',mgr1Id,now,now);
  iT.run(t3,'Bookkeeping Team','Monthly bookkeeping',mgr2Id,now,now);
  iT.run(t4,'Advisory Team','Tax planning and advisory',mgr2Id,now,now);

  const iM = db.prepare(`INSERT INTO team_memberships (id,team_id,user_id,role_in_team,joined_at,is_active) VALUES (?,?,?,?,?,1)`);
  iM.run(uid(),t1,mgr1Id,'manager','2024-01-01'); iM.run(uid(),t1,mem1Id,'senior','2024-01-01'); iM.run(uid(),t1,mem2Id,'member','2024-03-01');
  iM.run(uid(),t2,mgr1Id,'manager','2024-01-01'); iM.run(uid(),t2,mem3Id,'senior','2024-02-01'); iM.run(uid(),t2,mem4Id,'member','2024-04-01');
  iM.run(uid(),t3,mgr2Id,'manager','2024-01-01'); iM.run(uid(),t3,mem5Id,'senior','2024-01-01');
  iM.run(uid(),t4,mgr2Id,'manager','2024-01-01'); iM.run(uid(),t4,mem1Id,'member','2024-06-01');

  // ── TEMPLATE CATEGORIES ──
  const iCat = db.prepare(`INSERT INTO template_categories (id,name,sort_order,created_at) VALUES (?,?,?,?)`);
  ['Personal Tax','Corporate Tax','Sales Tax','Payroll','Information Returns','Corporate Services','Bookkeeping','Tax Credits','CRA Compliance','Other'].forEach((c,i) => iCat.run(uid(),c,i+1,now));

  // ── COMPLIANCE TEMPLATES ──
  const tplT1 = uid(); const tplT2 = uid(); const tplGST = uid(); const tplT4 = uid(); const tplBK = uid(); const tplT3 = uid();
  const iTpl = db.prepare(`INSERT INTO compliance_templates (id,name,code,description,category,default_price,due_date_rule,is_active,version,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,1,?,?,?)`);
  iTpl.run(tplT1,'T1 Personal Tax Return','T1','Individual personal income tax return','Personal Tax',500,'{}',adminId,now,now);
  iTpl.run(tplT2,'T2 Corporate Tax Return','T2','Corporate income tax return','Corporate Tax',1500,'{}',adminId,now,now);
  iTpl.run(tplGST,'GST/HST Return','GST-HST','GST/HST return filing','Sales Tax',400,'{}',adminId,now,now);
  iTpl.run(tplT4,'T4 Information Return','T4','T4 employer information return','Information Returns',350,'{}',adminId,now,now);
  iTpl.run(tplBK,'Monthly Bookkeeping','BK-MTH','Monthly bookkeeping services','Bookkeeping',600,'{}',adminId,now,now);
  iTpl.run(tplT3,'T3 Trust Return','T3-TRUST','Trust income tax return','Personal Tax',1200,'{}',adminId,now,now);

  // ── TEMPLATE STAGES ──
  const stages = [
    {name:'New Lead / Project',code:'NEW_LEAD',group:'onboarding',approval:0,visible:0,days:1},
    {name:'Client Onboarding',code:'ONBOARDING',group:'onboarding',approval:0,visible:1,days:3},
    {name:'Data Collection',code:'DATA_COLLECTION',group:'work_in_progress',approval:0,visible:1,days:7},
    {name:'Preparation',code:'PREPARED',group:'work_in_progress',approval:0,visible:0,days:5},
    {name:'First Review',code:'FIRST_CHECK',group:'work_in_progress',approval:1,visible:0,days:2},
    {name:'Second Review',code:'SECOND_CHECK',group:'work_in_progress',approval:1,visible:0,days:2},
    {name:'Sent to Client',code:'SENT_TO_CLIENT',group:'work_in_progress',approval:0,visible:1,days:3},
    {name:'Billing',code:'BILLING',group:'invoicing',approval:0,visible:1,days:2},
    {name:'Payment Received',code:'PAYMENT_RECEIVED',group:'invoicing',approval:0,visible:1,days:0},
    {name:'Final Filing',code:'FINAL_FILING',group:'completed',approval:1,visible:1,days:1},
    {name:'Document Checklist',code:'DOC_CHECKLIST',group:'completed',approval:0,visible:0,days:1},
    {name:'Completed',code:'COMPLETED',group:'completed',approval:0,visible:1,days:0},
  ];
  const iStg = db.prepare(`INSERT INTO compliance_template_stages (id,template_id,stage_name,stage_code,stage_group,sequence_order,requires_approval,is_client_visible,estimated_days,auto_advance) VALUES (?,?,?,?,?,?,?,?,?,0)`);
  [tplT1,tplT2,tplGST,tplT4,tplBK,tplT3].forEach(tid => stages.forEach((s,i) => iStg.run(uid(),tid,s.name,s.code,s.group,i+1,s.approval,s.visible,s.days)));

  // ── TEMPLATE DOCUMENTS ──
  const iDoc = db.prepare(`INSERT INTO compliance_template_documents (id,template_id,document_name,document_category,is_mandatory,upload_by,linked_stage_code) VALUES (?,?,?,?,?,?,?)`);
  [
    [tplT1,'Government ID','onboarding',1,'client','ONBOARDING'],
    [tplT1,'Engagement Letter','onboarding',1,'staff','ONBOARDING'],
    [tplT1,'T4 Employment Income Slips','client_supporting',1,'client','DATA_COLLECTION'],
    [tplT1,'T5 Investment Income Slips','client_supporting',0,'client','DATA_COLLECTION'],
    [tplT1,'Prior Year NOA','client_supporting',1,'client','DATA_COLLECTION'],
    [tplT1,'RRSP Contribution Receipts','client_supporting',0,'client','DATA_COLLECTION'],
    [tplT1,'Signed T183','client_signed',1,'client','SENT_TO_CLIENT'],
    [tplT1,'Filed T1 Copy','final_document',1,'staff','FINAL_FILING'],
  ].forEach(d => iDoc.run(uid(),d[0],d[1],d[2],d[3],d[4],d[5]));

  // ── CLIENTS ──
  const clients: {id:string;code:string;name:string;type:string;email:string;phone:string;city:string;prov:string;postal:string;portal:string|null}[] = [];
  const cData = [
    ['CLI-0001','James & Sarah Thompson','individual','james@email.com','905-555-0200','Toronto','Ontario','M5V 2T6',cu1],
    ['CLI-0002','Maple Leaf Consulting Inc.','business','contact@mapleleaf.ca','604-555-0300','Vancouver','British Columbia','V6B 1A1',cu2],
    ['CLI-0003','Pacific Coast Holdings Ltd.','business','info@pacificcoast.ca','604-555-0400','Vancouver','British Columbia','V6C 2X8',null],
    ['CLI-0004','Tremblay Family Trust','trust','tremblay@email.com','514-555-0500','Montreal','Quebec','H3B 1A7',null],
    ['CLI-0005','Ahmed Khan','sole_proprietor','ahmed.khan@email.com','403-555-0600','Calgary','Alberta','T2P 1J9',null],
    ['CLI-0006','Harpreet & Manpreet Singh','individual','singh@email.com','780-555-0700','Edmonton','Alberta','T5J 1S9',cu3],
    ['CLI-0007','Northern Lights Energy Corp.','business','info@northernlights.ca','780-555-0800','Edmonton','Alberta','T5K 2P7',null],
    ['CLI-0008','Côté & Associés SENC','business','cote@cabinet.ca','418-555-0900','Quebec City','Quebec','G1R 4P5',null],
    ['CLI-0009','Prairie Grain Cooperative','business','admin@prairiegrain.ca','306-555-1000','Regina','Saskatchewan','S4P 3Y2',null],
    ['CLI-0010','Maria Santos','individual','maria.santos@email.com','204-555-1100','Winnipeg','Manitoba','R3C 1A5',null],
    ['CLI-0011','Halifax Marine Services Ltd.','business','ops@halifaxmarine.ca','902-555-1200','Halifax','Nova Scotia','B3J 1S9',null],
    ['CLI-0012','Chen Family Trust','trust','chen.family@email.com','604-555-1300','Burnaby','British Columbia','V5H 4N2',null],
    ['CLI-0013','Oceanview Properties Inc.','business','info@oceanview.ca','506-555-1400','Saint John','New Brunswick','E2L 4Z6',null],
    ['CLI-0014','Rajesh Kapoor','sole_proprietor','rajesh.kapoor@email.com','416-555-1500','Mississauga','Ontario','L5B 1M2',null],
    ['CLI-0015','Island Brewing Company','business','brew@islandbrew.ca','902-555-1600','Charlottetown','Prince Edward Island','C1A 1N3',null],
    ['CLI-0016','Newfoundland Fisheries Ltd.','business','admin@nfldfish.ca','709-555-1700','St. John\'s','Newfoundland and Labrador','A1C 5S7',null],
    ['CLI-0017','Diana Okafor','individual','diana.okafor@email.com','905-555-1800','Hamilton','Ontario','L8P 4S6',null],
    ['CLI-0018','Mountain View Dental Corp.','business','admin@mtnviewdental.ca','250-555-1900','Kelowna','British Columbia','V1Y 6H2',null],
    ['CLI-0019','Laurent & Fils Construction','business','info@laurentfils.ca','819-555-2000','Gatineau','Quebec','J8X 3X7',null],
    ['CLI-0020','Thompson Investment Holdings','trust','invest@thompson.ca','416-555-2100','Toronto','Ontario','M5H 3Y2',null],
    ['CLI-0021','Whitehorse Adventure Tours','sole_proprietor','tours@yukonadv.ca','867-555-2200','Whitehorse','Yukon','Y1A 2C6',null],
  ];
  const iCl = db.prepare(`INSERT INTO clients (id,client_code,display_name,client_type,client_type_id,status,primary_email,primary_phone,city,province,postal_code,portal_user_id,created_by,created_at,updated_at) VALUES (?,?,?,?,?,'active',?,?,?,?,?,?,?,?,?)`);
  cData.forEach(c => {
    const cid = uid();
    const typeLabel = c[2] as string;
    const typeId = typeMap[typeLabel.toLowerCase().replace('_', ' ')] || null;
    clients.push({id:cid,code:c[0] as string,name:c[1] as string,type:typeLabel,email:c[3] as string,phone:c[4] as string,city:c[5] as string,prov:c[6] as string,postal:c[7] as string,portal:c[8] as string|null});
    iCl.run(cid,c[0],c[1],typeLabel,typeId,c[3],c[4],c[5],c[6],c[7],c[8],adminId,now,now);
  });

  // ── CLIENT TAGS ──
  const tagData = [
    ['T1','#2563eb'],['T2','#7c3aed'],['GST/HST','#0891b2'],['Bookkeeping','#059669'],
    ['Priority','#dc2626'],['VIP','#d97706'],['New Client','#10b981'],['Payroll','#6366f1'],
    ['Advisory','#8b5cf6'],['Referred','#f59e0b'],
  ];
  const tagIds: string[] = [];
  const iTag = db.prepare(`INSERT INTO client_tags (id,name,color,created_at) VALUES (?,?,?,?)`);
  tagData.forEach(t => { const tid = uid(); tagIds.push(tid); iTag.run(tid,t[0],t[1],now); });

  const iTA = db.prepare(`INSERT INTO client_tag_assignments (id,client_id,tag_id) VALUES (?,?,?)`);
  // Assign tags to clients
  const tagAssignments: [number,number[]][] = [
    [0,[0,6]], [1,[1,2,5]], [2,[1,4]], [3,[0,8]], [4,[0,9]], [5,[0,6]], [6,[1,2,7,4]],
    [7,[1,8]], [8,[1,2,3]], [9,[0,9]], [10,[1,2,7]], [11,[0,8,5]], [12,[1,3]], [13,[0,6]],
    [14,[1,2]], [15,[1,7]], [16,[0]], [17,[1,3,7]], [18,[1,2]], [19,[0,8,5]], [20,[0,9]],
  ];
  tagAssignments.forEach(([ci,tis]) => tis.forEach(ti => iTA.run(uid(),clients[ci].id,tagIds[ti])));

  // ── PERSONAL INFO ──
  const iPI = db.prepare(`INSERT INTO client_personal_info (id,client_id,info_key,info_value,is_sensitive,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`);
  iPI.run(uid(),clients[0].id,'SIN','***-***-123',1,now,now);
  iPI.run(uid(),clients[0].id,'Date of Birth','1985-03-15',0,now,now);
  iPI.run(uid(),clients[0].id,'Marital Status','Married',0,now,now);
  iPI.run(uid(),clients[1].id,'Business Number','123456789RC0001',0,now,now);
  iPI.run(uid(),clients[1].id,'Fiscal Year End','2025-12-31',0,now,now);
  iPI.run(uid(),clients[5].id,'SIN','***-***-456',1,now,now);
  iPI.run(uid(),clients[5].id,'Date of Birth','1978-11-22',0,now,now);
  iPI.run(uid(),clients[6].id,'Business Number','987654321RC0001',0,now,now);

  // ── ENGAGEMENTS ──
  const engagements: {id:string;code:string;clientIdx:number;tplId:string;year:string;due:string;price:number;status:string;teamId:string}[] = [];
  const engData: [number,string,string,string,number,string,string,string][] = [
    [0,tplT1,'2025','2026-04-30',500,'in_progress','current',t1],
    [1,tplT2,'2025','2026-06-30',1500,'in_progress','current',t2],
    [1,tplGST,'2025','2026-01-31',400,'in_progress','current',t2],
    [2,tplT2,'2025','2026-06-30',2000,'new','future',t2],
    [4,tplT1,'2025','2026-06-15',750,'in_progress','submit_data',t1],
    [0,tplT1,'2024','2025-04-30',450,'completed','past',t1],
    [5,tplT1,'2025','2026-04-30',500,'in_progress','current',t1],
    [6,tplT2,'2025','2026-06-30',2500,'in_progress','current',t2],
    [6,tplGST,'2025','2026-03-31',400,'in_progress','current',t2],
    [7,tplT2,'2025','2026-06-30',1800,'new','future',t2],
    [8,tplT2,'2025','2026-06-30',1500,'in_progress','current',t2],
    [8,tplGST,'2025','2026-03-31',400,'completed','past',t2],
    [9,tplT1,'2025','2026-04-30',500,'in_progress','current',t1],
    [10,tplT2,'2025','2026-06-30',2000,'in_progress','current',t2],
    [10,tplGST,'2025','2026-03-31',400,'in_progress','current',t2],
    [11,tplT3,'2025','2026-03-31',1200,'in_progress','current',t1],
    [12,tplT2,'2025','2026-06-30',1500,'new','future',t2],
    [13,tplT1,'2025','2026-06-15',600,'in_progress','submit_data',t1],
    [14,tplT2,'2025','2026-06-30',1500,'in_progress','current',t2],
    [14,tplGST,'2025','2026-03-31',400,'completed','past',t2],
    [15,tplT2,'2025','2026-06-30',1800,'new','future',t2],
    [16,tplT1,'2025','2026-04-30',500,'in_progress','current',t1],
    [17,tplT2,'2025','2026-06-30',2000,'in_progress','current',t2],
    [17,tplBK,'2025','2026-04-15',600,'in_progress','current',t3],
    [18,tplT2,'2025','2026-06-30',1800,'in_progress','current',t2],
    [18,tplGST,'2025','2026-03-31',400,'in_progress','current',t2],
    [19,tplT3,'2025','2026-03-31',1500,'in_progress','current',t1],
    [20,tplT1,'2025','2026-06-15',550,'new','future',t1],
    [3,tplT3,'2025','2026-03-31',1200,'in_progress','current',t1],
    [5,tplT1,'2024','2025-04-30',450,'completed','past',t1],
    [9,tplT1,'2024','2025-04-30',500,'completed','past',t1],
  ];

  const iEng = db.prepare(`INSERT INTO client_compliances (id,engagement_code,client_id,template_id,financial_year,due_date,price,status,client_facing_status,priority,assigned_team_id,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iES = db.prepare(`INSERT INTO client_compliance_stages (id,engagement_id,stage_name,stage_code,sequence_order,status,assigned_user_id,started_at,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

  const priorities = ['low','medium','high','urgent'];
  engData.forEach((e,idx) => {
    const eid = uid();
    const code = `ENG-${e[2]}-${String(idx+1).padStart(4,'0')}`;
    const pri = e[5] === 'completed' ? 'medium' : priorities[idx % 4];
    engagements.push({id:eid,code,clientIdx:e[0] as number,tplId:e[1] as string,year:e[2] as string,due:e[3] as string,price:e[4] as number,status:e[5] as string,teamId:e[7] as string});
    iEng.run(eid,code,clients[e[0] as number].id,e[1],e[2],e[3],e[4],e[5],e[6],pri,e[7],adminId,now,now);

    // Seed stages based on engagement status
    const memberPool = [mem1Id,mem2Id,mem3Id,mem4Id,mem5Id];
    const assignee = memberPool[idx % memberPool.length];
    stages.forEach((s,i) => {
      let st = 'pending', asgn: string|null = null, started: string|null = null, completed: string|null = null;
      if (e[5] === 'completed') { st = 'completed'; asgn = assignee; started = now; completed = now; }
      else if (e[5] === 'in_progress') {
        const progressPoint = (idx % 8) + 2; // varies which stage they're at
        if (i < Math.min(progressPoint, stages.length - 1)) { st = 'completed'; asgn = assignee; started = now; completed = now; }
        else if (i === Math.min(progressPoint, stages.length - 1)) { st = 'in_progress'; asgn = assignee; started = now; }
        else { asgn = i < progressPoint + 3 ? assignee : null; }
      }
      iES.run(uid(),eid,s.name,s.code,i+1,st,asgn,started,completed,now,now);
    });
  });

  // ── INVOICES ──
  const iInv = db.prepare(`INSERT INTO invoices (id,invoice_number,engagement_id,client_id,amount,tax_amount,total_amount,status,issued_date,due_date,paid_date,paid_amount,payment_method,description,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const invStatuses = ['paid','paid','sent','overdue','draft','paid','sent','paid','partially_paid','paid'];
  const invDates = ['2025-01-15','2025-02-10','2025-03-01','2025-01-20','2026-03-20','2025-04-01','2025-03-15','2025-05-01','2025-02-28','2025-06-01'];

  engagements.forEach((eng,i) => {
    const status = invStatuses[i % invStatuses.length];
    const amt = eng.price;
    const tax = Math.round(amt * 0.13 * 100) / 100;
    const total = amt + tax;
    const issued = invDates[i % invDates.length];
    const due = new Date(new Date(issued).getTime() + 30*86400000).toISOString().split('T')[0];
    const paid = status === 'paid' ? due : status === 'partially_paid' ? due : null;
    const paidAmt = status === 'paid' ? total : status === 'partially_paid' ? Math.round(total * 0.5 * 100)/100 : 0;
    const method = status === 'paid' ? 'e-transfer' : status === 'partially_paid' ? 'cheque' : null;
    iInv.run(uid(),`INV-${String(i+1).padStart(4,'0')}`,eng.id,clients[eng.clientIdx].id,amt,tax,total,status,issued,due,paid,paidAmt,method,`${clients[eng.clientIdx].name} - Professional fees`,adminId,now,now);
  });

  // Additional invoices for more data
  for (let i = 0; i < 25; i++) {
    const eng = engagements[i % engagements.length];
    const status = invStatuses[(i+3) % invStatuses.length];
    const amt = [250,350,500,750,1000,1250,1500,200,400,800][i%10];
    const tax = Math.round(amt*0.13*100)/100;
    const total = amt+tax;
    const d = new Date(2025, i%12, (i%28)+1);
    const issued = d.toISOString().split('T')[0];
    const due = new Date(d.getTime()+30*86400000).toISOString().split('T')[0];
    const paid = status==='paid'?due:null;
    const paidAmt = status==='paid'?total:status==='partially_paid'?Math.round(total*0.6*100)/100:0;
    iInv.run(uid(),`INV-${String(engagements.length+i+1).padStart(4,'0')}`,eng.id,clients[eng.clientIdx].id,amt,tax,total,status,issued,due,paid,paidAmt,status==='paid'?'e-transfer':null,`Additional services`,adminId,now,now);
  }

  // ── CHAT THREADS & MESSAGES ──
  const iThread = db.prepare(`INSERT INTO chat_threads (id,thread_type,client_id,subject,is_active,last_message_at,created_by,created_at,updated_at) VALUES (?,?,?,?,1,?,?,?,?)`);
  const iMsg = db.prepare(`INSERT INTO chat_messages (id,thread_id,sender_id,content,is_internal,is_read,created_at) VALUES (?,?,?,?,?,?,?)`);
  const iTask = db.prepare(`INSERT INTO client_tasks (id,thread_id,client_id,task_name,is_completed,created_at) VALUES (?,?,?,?,?,?)`);

  const threadSubjects = [
    'T1 Document Collection 2025','T2 Corporate Filing Questions','GST/HST Quarterly - Missing Receipts',
    'Engagement Letter Review','Tax Planning Discussion','Bookkeeping Monthly Update',
    'NOA Follow-up','RRSP Deadline Reminder','Payroll Setup Questions',
    'Year-end Closing Checklist','CRA Correspondence','Investment Income Reporting',
    'Team Discussion - Peak Season Planning','Internal - Training Schedule','Team - Client Handoff Notes',
  ];
  const messageContents = [
    'Hi, I\'ve uploaded the T4 slips for this year. Please let me know if you need anything else.',
    'Thanks for sending those over! I\'ll review them shortly and follow up if we need additional documents.',
    'Could you please send the bank statements for January through March?',
    'Sure, I\'ll have those sent over by end of day tomorrow.',
    'I noticed a discrepancy in the investment income reported. Can we schedule a call to discuss?',
    'Absolutely, how does Thursday at 2pm work for you?',
    'Just wanted to confirm - have you received the engagement letter I sent last week?',
    'Yes, I signed and uploaded it to the portal. Please check.',
    'Perfect, I can see it now. Thanks for the quick turnaround!',
    'Our records show an outstanding balance of $565.00 for the Q3 GST filing. Could you please process the payment?',
    'I\'ve made the e-transfer. Should show up within 24 hours.',
    'Payment received, thank you! Your account is now current.',
    'The CRA has sent a reassessment notice for 2023. I\'ll need the original receipts to dispute this.',
    'I\'ll gather them this weekend and upload by Monday.',
    'Quick update - I\'ve completed the first review of your T2 return. Moving to second review now.',
    'Great news! Your return has been filed and the confirmation number is attached.',
  ];

  const threads: {id:string;clientIdx:number}[] = [];
  threadSubjects.forEach((subj,i) => {
    const isInternal = i >= 12;
    const clientIdx = isInternal ? 0 : i % Math.min(clients.length, 12);
    const thId = uid();
    threads.push({id:thId,clientIdx});
    const lastMsg = new Date(Date.now() - (i * 3600000 * 6)).toISOString();
    iThread.run(thId,isInternal?'internal':'client_facing',clients[clientIdx].id,subj,lastMsg,isInternal?adminId:staffIds[i%staffIds.length],now,now);

    // Add 4-8 messages per thread
    const msgCount = 4 + (i % 5);
    for (let m = 0; m < msgCount; m++) {
      const sender = m % 2 === 0 ? staffIds[(i+m)%staffIds.length] : (isInternal ? staffIds[(i+m+1)%staffIds.length] : clients[clientIdx].portal || staffIds[(i+m)%staffIds.length]);
      const content = messageContents[(i*3+m) % messageContents.length];
      const msgTime = new Date(Date.now() - ((i*10 + (msgCount-m)) * 3600000)).toISOString();
      iMsg.run(uid(),thId,sender,content,isInternal?1:0,m < msgCount-2 ? 1 : 0,msgTime);
    }

    // Add tasks to client-facing threads
    if (!isInternal && i < 8) {
      const tasks = ['Upload T4 slips','Sign engagement letter','Send bank statements','Review and approve return'];
      tasks.slice(0, 2 + (i%3)).forEach((task,ti) => {
        iTask.run(uid(),thId,clients[clientIdx].id,task,ti < 1 ? 1 : 0,now);
      });
    }
  });

  // ── REMINDERS ──
  const iRem = db.prepare(`INSERT INTO reminders (id,reminder_type,engagement_id,client_id,user_id,title,message,trigger_date,channel,status,is_recurring,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const reminderTypes = ['deadline','document_request','payment','follow_up','compliance'];
  const reminderTitles = [
    'T1 Filing Deadline - April 30','Missing T4 Slips Required','Invoice Payment Overdue',
    'Follow up on signed T183','GST/HST Q4 Due','Send engagement letter',
    'Collect bank statements','Quarterly review meeting','CRA reassessment response due',
    'Payroll filing reminder','Annual return deadline','Client onboarding follow-up',
  ];

  for (let i = 0; i < 45; i++) {
    const eng = engagements[i % engagements.length];
    const daysOffset = (i % 20) - 10; // some past, some future
    const triggerDate = new Date(Date.now() + daysOffset * 86400000).toISOString().split('T')[0];
    const status = daysOffset < -3 ? 'sent' : daysOffset < 0 ? 'sent' : 'pending';
    const channels = ['email','in_app','both'];
    iRem.run(uid(),reminderTypes[i%reminderTypes.length],eng.id,clients[eng.clientIdx].id,staffIds[i%staffIds.length],
      reminderTitles[i%reminderTitles.length],`Reminder for ${clients[eng.clientIdx].name}`,
      triggerDate,channels[i%3],status,i%5===0?1:0,adminId,now);
  }

  // ── DOCUMENT FILES ──
  const iDF = db.prepare(`INSERT INTO document_files (id,engagement_id,client_id,file_name,storage_path,file_size_bytes,mime_type,document_category,financial_year,status,uploaded_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const docNames = [
    ['T4_Employment_Income_2025.pdf','client_supporting'],['T5_Investment_Income_2025.pdf','client_supporting'],
    ['Bank_Statement_Jan_2025.pdf','client_supporting'],['Bank_Statement_Feb_2025.pdf','client_supporting'],
    ['Engagement_Letter_2025.pdf','onboarding'],['Government_ID_Scan.pdf','onboarding'],
    ['Signed_T183_2025.pdf','client_signed'],['Filed_T1_Return_2025.pdf','final_document'],
    ['Notice_of_Assessment_2025.pdf','final_document'],['RRSP_Contribution_Receipt.pdf','client_supporting'],
    ['Donation_Receipts_2025.pdf','client_supporting'],['T2_Corporate_Return_2025.pdf','final_document'],
    ['GST_HST_Return_Q4_2025.pdf','final_document'],['Business_Registration.pdf','onboarding'],
    ['Financial_Statements_2025.pdf','client_supporting'],['Payroll_Summary_2025.pdf','client_supporting'],
  ];
  const docStatuses = ['new','viewed','signed','new','viewed','viewed','signed','new'];

  for (let i = 0; i < 35; i++) {
    const eng = engagements[i % engagements.length];
    const doc = docNames[i % docNames.length];
    const uploadDate = new Date(Date.now() - (i * 86400000 * 2)).toISOString();
    iDF.run(uid(),eng.id,clients[eng.clientIdx].id,doc[0],`/uploads/${clients[eng.clientIdx].code}/${eng.year}/${doc[0]}`,
      Math.floor(Math.random()*500000)+50000,'application/pdf',doc[1],eng.year,
      docStatuses[i%docStatuses.length],i%3===0?clients[eng.clientIdx].portal||adminId:staffIds[i%staffIds.length],uploadDate,uploadDate);
  }

  // ── INBOX ITEMS ──
  const iInbox = db.prepare(`INSERT INTO inbox_items (id,user_id,item_type,title,message,client_id,link_type,link_id,is_read,is_archived,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const inboxTypes = ['document_uploaded','invoice_paid','task_completed','message_received','deadline_approaching','organizer_completed'];
  const inboxTitles = [
    'New document uploaded','Invoice payment received','Client task completed',
    'New message from client','Filing deadline approaching','Organizer submitted',
  ];

  for (let i = 0; i < 65; i++) {
    const clientIdx = i % clients.length;
    const itemType = inboxTypes[i % inboxTypes.length];
    const title = inboxTitles[i % inboxTitles.length];
    const createdAt = new Date(Date.now() - (i * 3600000 * 3)).toISOString();
    iInbox.run(uid(),adminId,itemType,`${title} — ${clients[clientIdx].name}`,
      `${title} for ${clients[clientIdx].name}`,clients[clientIdx].id,
      'client',clients[clientIdx].id,i>10?1:0,i>30?1:0,createdAt);
  }

  // ── ACTIVITY FEED ──
  const iAF = db.prepare(`INSERT INTO activity_feed (id,actor_id,action,entity_type,entity_id,entity_name,client_id,details,created_at) VALUES (?,?,?,?,?,?,?,?,?)`);
  const activities = [
    ['advanced_stage','engagement','Advanced to First Review','James & Sarah Thompson T1'],
    ['uploaded_document','document','Uploaded T4 Employment Income','Maple Leaf Consulting'],
    ['created_invoice','invoice','Created Invoice INV-0001','Pacific Coast Holdings'],
    ['sent_reminder','reminder','Sent deadline reminder','Tremblay Family Trust'],
    ['completed_stage','engagement','Completed Data Collection','Ahmed Khan T1'],
    ['onboarded_client','client','Onboarded new client','Harpreet & Manpreet Singh'],
    ['filed_return','engagement','Filed T2 Corporate Return','Northern Lights Energy'],
    ['received_payment','invoice','Received payment $1,695.00','Côté & Associés'],
    ['created_engagement','engagement','Created new engagement','Prairie Grain Cooperative'],
    ['sent_message','message','Sent message to client','Maria Santos'],
    ['uploaded_document','document','Uploaded Financial Statements','Halifax Marine Services'],
    ['advanced_stage','engagement','Advanced to Billing','Chen Family Trust T3'],
    ['created_proposal','proposal','Created engagement proposal','Oceanview Properties'],
    ['completed_engagement','engagement','Marked as completed','Island Brewing Company GST'],
    ['assigned_team','engagement','Assigned to Corporate Tax Team','Laurent & Fils Construction'],
    ['created_reminder','reminder','Created follow-up reminder','Thompson Investment Holdings'],
    ['sent_engagement_letter','document','Sent engagement letter','Whitehorse Adventure Tours'],
    ['advanced_stage','engagement','Advanced to Second Review','Mountain View Dental'],
    ['uploaded_document','document','Uploaded Payroll Summary','Newfoundland Fisheries'],
    ['received_payment','invoice','Received payment $565.00','Diana Okafor'],
    ['created_invoice','invoice','Created Invoice INV-0035','Rajesh Kapoor'],
    ['completed_stage','engagement','Completed Preparation','Harpreet & Manpreet Singh'],
    ['sent_reminder','reminder','Sent payment reminder','Maple Leaf Consulting'],
    ['uploaded_document','document','Uploaded NOA 2024','James & Sarah Thompson'],
    ['advanced_stage','engagement','Advanced to Sent to Client','Prairie Grain Cooperative'],
  ];

  activities.forEach((a,i) => {
    const createdAt = new Date(Date.now() - (i * 3600000 * 4)).toISOString();
    const clientIdx = i % clients.length;
    iAF.run(uid(),staffIds[i%staffIds.length],a[0],a[1],uid(),a[3],clients[clientIdx].id,a[2],createdAt);
  });

  // ── TIME ENTRIES ──
  const iTE = db.prepare(`INSERT INTO time_entries (id,user_id,client_id,engagement_id,description,duration_minutes,hourly_rate,is_billable,entry_date,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const timeDescs = ['T1 preparation','Document review','Client meeting','Data entry','Tax research','Return filing','CRA correspondence','Bookkeeping entries'];
  for (let i = 0; i < 30; i++) {
    const eng = engagements[i % engagements.length];
    const mins = [30,45,60,90,120,15,75,180][i%8];
    const rate = [150,175,200,125,250][i%5];
    const date = new Date(Date.now() - i*86400000).toISOString().split('T')[0];
    iTE.run(uid(),staffIds[i%staffIds.length],clients[eng.clientIdx].id,eng.id,timeDescs[i%timeDescs.length],mins,rate,1,date,'logged',now);
  }

  // ── PROPOSALS ──
  const iProp = db.prepare(`INSERT INTO proposals (id,proposal_number,client_id,title,description,services,total_amount,status,sent_date,accepted_date,expiry_date,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const propData: [number,string,string,number,string][] = [
    [2,'Tax Compliance Package 2025','T2 + GST/HST annual filing',3400,'accepted'],
    [6,'Corporate Full Service 2025','T2 + GST + Payroll + Bookkeeping',6500,'sent'],
    [12,'Annual Filing Package','T2 corporate return with advisory',2500,'draft'],
    [17,'Dental Corp Tax Package','T2 + Monthly Bookkeeping',4200,'accepted'],
    [19,'Trust Administration 2025','T3 Trust Return + Advisory',3000,'sent'],
    [20,'Personal Tax & Advisory','T1 + Tax planning consultation',1200,'draft'],
  ];
  propData.forEach((p,i) => {
    const sent = p[4]==='draft'?null:'2025-03-'+(10+i).toString().padStart(2,'0');
    const accepted = p[4]==='accepted'?'2025-03-'+(15+i).toString().padStart(2,'0'):null;
    const expiry = '2025-04-'+(10+i).toString().padStart(2,'0');
    iProp.run(uid(),`PROP-${String(i+1).padStart(4,'0')}`,clients[p[0] as number].id,p[1],p[2],
      JSON.stringify([p[2]]),p[3],p[4],sent,accepted,expiry,adminId,now,now);
  });


  // ── LEADS CRM SYSTEM ──
  const leadInsert = db.prepare(`INSERT INTO leads (id,lead_code,first_name,last_name,company_name,email,phone,lead_type,source,pipeline_stage,lead_score,expected_value,status,assigned_to,converted_client_id,tags,notes,city,province,next_followup_date,last_contact_date,referral_source,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const leadActivityInsert = db.prepare(`INSERT INTO lead_activities (id,lead_id,activity_type,summary,outcome,next_action,contact_date,duration_minutes,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const leadTaskInsert = db.prepare(`INSERT INTO lead_tasks (id,lead_id,title,description,assigned_to,due_date,priority,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const leadProposalInsert = db.prepare(`INSERT INTO lead_proposals (id,lead_id,service_name,description,price,created_by,created_at) VALUES (?,?,?,?,?,?,?)`);

  const leadsData: any[][] = [
    // [first, last, company, email, phone, type, source, stage, score, value, status, assignedIdx, tags, notes, city, prov, followup_offset_days, last_contact_offset_days, referral]
    ['Ananya','Desai','Desai Consulting Group','ananya@desaiconsulting.ca','416-555-3001','corporation','referral','qualified','hot',8500,'active',0,'T2,Advisory','Very interested in full corporate package. Referred by James Thompson.','Toronto','Ontario',2,-1,'James Thompson'],
    ['Marcus','Leblanc',null,'marcus.leblanc@gmail.com','514-555-3002','individual','website','meeting_scheduled','warm',1200,'active',1,null,'Submitted inquiry through website for T1 filing.','Montreal','Quebec',3,-2,null],
    ['Fatima','Al-Hassan','Al-Hassan Medical Corp.','fatima@ahmedical.ca','604-555-3003','corporation','call','proposal_sent','hot',12000,'active',2,'T2,GST/HST,Bookkeeping','Large medical corp. Needs full service package.','Vancouver','British Columbia',1,-1,null],
    ['Derek','O\'Brien',null,'derek.obrien@outlook.com','403-555-3004','individual','walk_in','contacted','cold',600,'active',3,null,'Walk-in. Needs basic T1 filing. Low urgency.','Calgary','Alberta',7,-5,null],
    ['Priyanka','Sharma','Sharma & Sons Construction Ltd.','priyanka@sharmascons.ca','905-555-3005','corporation','referral','negotiation','hot',9500,'active',0,'T2,Payroll,Advisory','Construction company. Needs T2 + payroll. Price sensitive.','Brampton','Ontario',1,0,'Ahmed Khan'],
    ['Jean-Pierre','Tremblay','Tremblay Vineyards Inc.','jp@tremblayvineyards.ca','819-555-3006','corporation','email','new_inquiry','warm',4000,'active',1,'T2,GST/HST',null,'Sherbrooke','Quebec',5,-3,null],
    ['Sarah','Blackwood','Blackwood Legal Services','sarah@blackwoodlegal.ca','613-555-3007','partnership','website','meeting_scheduled','warm',6500,'active',2,'T2,Advisory','Law firm partnership. Interested in tax planning.','Ottawa','Ontario',2,-1,null],
    ['Kevin','Wong',null,'kevin.wong88@gmail.com','604-555-3008','individual','social_media','new_inquiry','cold',500,'active',4,null,'Found us on Instagram. Basic T1 inquiry.','Richmond','British Columbia',10,-7,null],
    ['Natasha','Petrova','NP Digital Marketing Inc.','natasha@npdigital.ca','416-555-3009','corporation','referral','proposal_sent','warm',5500,'active',0,'T2,Bookkeeping','Digital agency. Needs monthly bookkeeping + annual T2.','Toronto','Ontario',3,-2,'Maple Leaf Consulting'],
    ['David','Makenzie','Makenzie Real Estate Holdings','david@makenzieholdings.ca','403-555-3010','trust','call','qualified','hot',15000,'active',3,'T3-TRUST,Advisory','Real estate trust portfolio. High value prospect.','Calgary','Alberta',1,0,null],
    ['Isabelle','Gagnon',null,'isabelle.gagnon@hotmail.com','418-555-3011','individual','website','contacted','warm',800,'active',1,null,'Student finishing residency. First time filing independently.','Quebec City','Quebec',5,-4,null],
    ['Raj','Patel','Patel Franchises Ltd.','raj@patelfranchises.ca','905-555-3012','corporation','walk_in','new_inquiry','warm',7000,'active',2,'T2,GST/HST,Payroll','Owns 3 Tim Hortons franchises. Complex multi-entity.','Mississauga','Ontario',4,-1,null],
    // Converted leads
    ['Michael','Torres','Torres Tech Solutions','michael@torrestech.ca','416-555-3013','corporation','referral','converted','hot',6000,'converted',0,'T2,GST/HST','Converted to client. Now CLI-0002.','Toronto','Ontario',null,-30,'Website form'],
    // Lost lead
    ['Amanda','Foster',null,'amanda.foster@email.com','204-555-3014','individual','website','lost','cold',400,'lost',4,null,'Went with competitor for cheaper price.','Winnipeg','Manitoba',null,-14,null],
    ['Robert','Kim','Kim Dental Group','robert@kimdental.ca','604-555-3015','corporation','referral','negotiation','hot',11000,'active',3,'T2,Bookkeeping,Payroll','3-location dental group. Finalizing pricing.','Burnaby','British Columbia',1,0,'Chen Family Trust'],
  ];

  const leadIds: string[] = [];
  leadsData.forEach((l, i) => {
    const lid = uid();
    leadIds.push(lid);
    const assignedUser = staffIds[l[11] as number];
    const followupDate = l[16] != null ? new Date(Date.now() + (l[16] as number) * 86400000).toISOString().split('T')[0] : null;
    const lastContact = l[17] != null ? new Date(Date.now() + (l[17] as number) * 86400000).toISOString().split('T')[0] : null;
    const createdDate = new Date(Date.now() - (30 - i * 2) * 86400000).toISOString();
    leadInsert.run(lid, `LEAD-${String(i + 1).padStart(4, '0')}`, l[0], l[1], l[2], l[3], l[4], l[5], l[6], l[7], l[8], l[9], l[10], assignedUser, l[10] === 'converted' ? clients[1]?.id || null : null, l[12], l[13], l[14], l[15], followupDate, lastContact, l[18], adminId, createdDate, now);
  });

  // Seed lead activities
  const activityData: [number, string, string, string | null, string | null, number, number][] = [
    [0, 'call', 'Initial discovery call with Ananya. Discussed corporate tax needs.', 'Interested in full T2 + advisory package', 'Send proposal', -5, 30],
    [0, 'meeting', 'In-person meeting to review financial statements.', 'Very impressed. Ready to move forward.', 'Prepare pricing proposal', -2, 60],
    [0, 'email', 'Sent detailed service breakdown and pricing.', null, 'Follow up in 2 days', -1, 0],
    [1, 'email', 'Responded to website inquiry. Scheduled intro call.', null, 'Call on Thursday', -3, 0],
    [1, 'call', 'Introductory call. Explained T1 process.', 'Wants to meet in person', 'Schedule meeting', -2, 20],
    [2, 'call', 'Called about medical corp tax needs. Complex multi-province.', 'Needs T2 + GST + bookkeeping', 'Prepare comprehensive proposal', -7, 45],
    [2, 'meeting', 'Met at their clinic. Reviewed 3 years of financials.', 'Significant tax savings potential', 'Send proposal this week', -3, 90],
    [2, 'email', 'Sent $12K annual proposal for full service package.', null, 'Follow up Monday', -1, 0],
    [3, 'note', 'Walk-in client. Seemed hesitant about pricing.', null, 'Send information package', -5, 0],
    [4, 'call', 'Discussed construction company payroll complexity.', 'Needs payroll + T2', 'Negotiate pricing', -3, 35],
    [4, 'meeting', 'Site visit to Sharma Construction office.', 'Reviewed employee count and payroll system', 'Revise proposal with volume discount', -1, 60],
    [5, 'email', 'Received email inquiry about T2 filing for vineyard.', null, 'Respond within 24h', -3, 0],
    [6, 'call', 'Initial call with law firm partners.', 'Need partnership tax advisory', 'Schedule meeting', -4, 25],
    [6, 'meeting', 'Virtual meeting with all 3 partners.', 'Very interested. Comparing with current accountant.', 'Prepare competitive proposal', -1, 45],
    [8, 'call', 'Discussed bookkeeping + T2 needs.', 'Needs monthly bookkeeping', 'Send proposal', -4, 20],
    [8, 'email', 'Sent bookkeeping + T2 proposal.', null, 'Follow up next week', -2, 0],
    [9, 'call', 'High-value real estate trust discussion.', 'Complex trust structure with 4 properties', 'Schedule in-depth review', -5, 40],
    [9, 'meeting', 'Detailed trust portfolio review.', 'Needs T3 + advisory + estate planning', 'Prepare premium proposal', -2, 120],
    [9, 'call', 'Follow-up pricing discussion.', 'Agreeable to $15K annual retainer', 'Send engagement letter', 0, 25],
    [14, 'call', 'Initial call about dental group needs.', 'Multi-location. Needs comprehensive package.', 'Schedule site visit', -5, 30],
    [14, 'meeting', 'Visited main Burnaby location.', 'Reviewed books for all 3 locations', 'Prepare multi-location proposal', -2, 90],
    [14, 'call', 'Pricing negotiation. Wants bundled discount.', 'Agreed on $11K. Finalizing terms.', 'Send revised proposal', 0, 25],
    [12, 'call', 'Initial consultation.', 'Ready to sign up', 'Create client account', -32, 20],
    [12, 'stage_change', 'Converted to Client CLI-0002.', null, null, -30, 0],
    [13, 'call', 'Discussed T1 filing needs.', 'Price shopping', 'Send competitive quote', -20, 15],
    [13, 'email', 'Sent quote at $400.', 'Too expensive', null, -15, 0],
    [13, 'stage_change', 'Lead marked as lost. Chose competitor.', null, null, -14, 0],
  ];

  activityData.forEach((a, i) => {
    const contactDate = new Date(Date.now() + (a[5] as number) * 86400000).toISOString();
    leadActivityInsert.run(uid(), leadIds[a[0]], a[1], a[2], a[3], a[4], contactDate, a[6], staffIds[i % staffIds.length], contactDate);
  });

  // Seed lead tasks
  const taskData: [number, string, string, number, number, string, string][] = [
    [0, 'Send final pricing proposal', 'Include T2 + advisory combo pricing', 0, 2, 'high', 'pending'],
    [0, 'Schedule onboarding call', 'Once proposal is accepted', 0, 5, 'medium', 'pending'],
    [2, 'Follow up on medical corp proposal', 'Check if they reviewed the $12K proposal', 2, 1, 'high', 'pending'],
    [4, 'Revise construction pricing', 'Add volume discount for payroll', 0, 1, 'urgent', 'in_progress'],
    [4, 'Send revised proposal to Sharma', 'Include 10% multi-service discount', 0, 3, 'high', 'pending'],
    [6, 'Prepare law firm proposal', 'Partnership T2 + tax advisory package', 2, 3, 'high', 'pending'],
    [8, 'Follow up with NP Digital', 'Check on bookkeeping proposal response', 0, 3, 'medium', 'pending'],
    [9, 'Draft engagement letter for Makenzie', 'Trust advisory retainer agreement', 3, 1, 'urgent', 'in_progress'],
    [11, 'Research franchise tax rules', 'Tim Hortons multi-entity structure', 2, 7, 'medium', 'pending'],
    [14, 'Send revised multi-location proposal', 'Bundled pricing for 3 dental locations', 3, 1, 'high', 'pending'],
    [1, 'Prepare meeting materials', 'Print T1 checklist for Marcus', 1, 3, 'medium', 'pending'],
    [5, 'Respond to vineyard inquiry', 'Send T2 information package', 1, 1, 'high', 'pending'],
  ];

  taskData.forEach(t => {
    const dueDate = new Date(Date.now() + (t[4] as number) * 86400000).toISOString().split('T')[0];
    leadTaskInsert.run(uid(), leadIds[t[0]], t[1], t[2], staffIds[t[3]], dueDate, t[5], t[6], adminId, now, now);
  });

  // Seed lead proposals (services/pricing)
  const proposalData: [number, string, string, number][] = [
    [0, 'T2 Corporate Tax Return', 'Annual T2 filing for Desai Consulting', 2000],
    [0, 'Tax Advisory Retainer', 'Quarterly tax planning sessions', 4500],
    [0, 'GST/HST Return', 'Quarterly GST/HST filing', 2000],
    [2, 'T2 Corporate Tax Return', 'Medical corporation T2', 2500],
    [2, 'Monthly Bookkeeping', 'Full-service bookkeeping', 7200],
    [2, 'GST/HST Returns', 'Quarterly filings', 2300],
    [4, 'T2 Corporate Tax Return', 'Construction company T2', 2500],
    [4, 'Payroll Services', 'Monthly payroll processing for 25 employees', 4800],
    [4, 'Tax Advisory', 'Construction-specific tax planning', 2200],
    [8, 'T2 Corporate Tax Return', 'Digital marketing agency T2', 1500],
    [8, 'Monthly Bookkeeping', 'Cloud-based bookkeeping', 4000],
    [9, 'T3 Trust Return', 'Real estate trust return', 3000],
    [9, 'Estate Planning Advisory', 'Trust structuring and optimization', 8000],
    [9, 'Annual Property Tax Review', 'Multi-property assessment review', 4000],
    [14, 'T2 Corporate Returns (3 locations)', 'Multi-entity T2 filings', 4500],
    [14, 'Monthly Bookkeeping (3 locations)', 'Consolidated bookkeeping', 4200],
    [14, 'Payroll Services', 'Multi-location payroll', 2300],
  ];

  proposalData.forEach(p => {
    leadProposalInsert.run(uid(), leadIds[p[0]], p[1], p[2], p[3], adminId, now);
  });

  // ── PERSONAL COMPLIANCE VAULT SEED DATA ──
  // Seed for client users (cu1 = James Thompson, cu2 = Robert Williams, cu3 = Harpreet Singh)
  const vaultUsers = [cu1, cu2, cu3];
  
  const iPCI = db.prepare(`INSERT INTO personal_compliance_items (id,user_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iPFM = db.prepare(`INSERT INTO personal_family_members (id,user_id,name,relationship,date_of_birth,email,phone,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const iPFC = db.prepare(`INSERT INTO personal_family_compliance (id,family_member_id,user_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iPE = db.prepare(`INSERT INTO personal_entities (id,user_id,name,entity_type,registration_number,description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`);
  const iPEC = db.prepare(`INSERT INTO personal_entity_compliance (id,entity_id,user_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iPC = db.prepare(`INSERT INTO personal_consultants (id,user_id,name,specialty,email,phone,company,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const iPCA = db.prepare(`INSERT INTO personal_consultant_assignments (id,consultant_id,compliance_item_id,compliance_type,user_id,created_at) VALUES (?,?,?,?,?,?)`);

  // --- James Thompson (cu1) ---
  const jPassport = uid(); const jLicense = uid(); const jTax = uid(); const jInsurance = uid();
  const jPropTax = uid(); const jSchool = uid(); const jMaintenance = uid(); const jMedical = uid();
  
  // Personal compliance items for James
  iPCI.run(jPassport,cu1,'Passport Renewal','documents_ids','Canadian passport expires - needs renewal','2026-08-15',null,null,'pending','yellow','Current passport #AB123456',null,now,now);
  iPCI.run(jLicense,cu1,'Driver\'s License Renewal','documents_ids','Ontario G license renewal due','2026-05-20',null,null,'pending','red','License #T1234-56789-70315',null,now,now);
  iPCI.run(jTax,cu1,'T1 Personal Tax Filing 2025','tax_filing','File personal income tax return for 2025','2026-04-30',null,null,'in_progress','red','Gathering T4 and T5 slips',null,now,now);
  iPCI.run(jInsurance,cu1,'Home Insurance Renewal','insurance','Annual home insurance policy renewal','2026-01-15','FREQ=YEARLY;BYMONTH=1','Renew every January','completed','green','Policy #HI-2025-7890','2026-01-10T10:00:00Z',now,now);
  iPCI.run(jPropTax,cu1,'Property Tax Payment - Q2','property','Quarterly property tax for 123 Maple Lane','2026-06-30','FREQ=QUARTERLY','Pay quarterly','pending','yellow','Assessment value: $850,000',null,now,now);
  iPCI.run(jSchool,cu1,'Pay School Fees - Summer Term','education','Aarav\'s summer camp registration fees','2026-06-01','FREQ=YEARLY;BYMONTH=6','Pay every June','pending','yellow','Maple Ridge Academy - $2,400',null,now,now);
  iPCI.run(jMaintenance,cu1,'Pay Society Maintenance','property','Monthly maintenance fees for condo association','2026-04-15','FREQ=MONTHLY','Pay monthly','pending','green','$450/month - Lakeview Condo Association',null,now,now);
  iPCI.run(jMedical,cu1,'Annual Medical Checkup','medical','Schedule annual physical examination','2026-07-01','FREQ=YEARLY;BYMONTH=7','Every July','pending','green','Dr. Patel - Family Practice',null,now,now);

  // Family members for James
  const jSpouse = uid(); const jChild = uid(); const jParent = uid(); const jGrandparent = uid();
  iPFM.run(jSpouse,cu1,'Sarah Thompson','spouse','1987-06-22','sarah.t@email.com','905-555-0201','Co-primary on all accounts',now,now);
  iPFM.run(jChild,cu1,'Aarav Thompson','child','2015-09-10',null,null,'Grade 5 at Maple Ridge Academy',now,now);
  iPFM.run(jParent,cu1,'Robert Thompson Sr.','parent','1955-03-08','robert.sr@email.com','905-555-0250','Lives in Mississauga, retired',now,now);
  iPFM.run(jGrandparent,cu1,'Eleanor Thompson','grandparent','1930-12-01',null,'905-555-0260','Retirement home - Sunrise Senior Living',now,now);

  // Family compliance items
  iPFC.run(uid(),jSpouse,cu1,'Sarah - Passport Renewal','documents_ids','Passport expires next year','2027-03-15',null,null,'pending','green',null,null,now,now);
  iPFC.run(uid(),jSpouse,cu1,'Sarah - Driver\'s License Renewal','documents_ids','Ontario license renewal','2026-11-30',null,null,'pending','green','License class G',null,now,now);
  iPFC.run(uid(),jChild,cu1,'Aarav - Health Card Renewal','documents_ids','OHIP card renewal','2026-09-10',null,null,'pending','green',null,null,now,now);
  iPFC.run(uid(),jChild,cu1,'Aarav - School Registration 2026-27','education','Register for next school year','2026-05-01',null,null,'pending','yellow','Maple Ridge Academy deadline',null,now,now);
  iPFC.run(uid(),jParent,cu1,'Dad - Property Tax Filing','tax_filing','Help dad file property tax returns','2026-06-30',null,null,'pending','yellow','Mississauga property',null,now,now);
  iPFC.run(uid(),jParent,cu1,'Dad - Insurance Policy Renewal','insurance','Home and auto insurance bundle','2026-08-01','FREQ=YEARLY;BYMONTH=8','Renew every August','pending','green',null,null,now,now);
  iPFC.run(uid(),jGrandparent,cu1,'Grandma - Medicare Review','medical','Annual senior benefits review','2026-04-01','FREQ=YEARLY','Annually','pending','red','Contact Sunrise Living coordinator',null,now,now);

  // Personal entities for James
  const jBiz = uid(); const jTrust = uid();
  iPE.run(jBiz,cu1,'Thompson Digital Marketing','sole_proprietorship','BN-123456789','Freelance web development and digital marketing','active',now,now);
  iPE.run(jTrust,cu1,'Thompson Family Trust','trust','TR-2020-5678','Family trust for estate planning purposes','active',now,now);

  // Entity compliance
  iPEC.run(uid(),jBiz,cu1,'HST Return - Q1 2026','tax_filing','File quarterly HST return for the business','2026-04-30','FREQ=QUARTERLY','File quarterly','pending','red','Revenue for Q1: ~$45,000',null,now,now);
  iPEC.run(uid(),jBiz,cu1,'Business License Renewal','documents_ids','Annual City of Toronto business license','2026-12-31','FREQ=YEARLY;BYMONTH=12','Renew every December','pending','green','License #BL-2025-1234',null,now,now);
  iPEC.run(uid(),jBiz,cu1,'Annual T2125 Filing','tax_filing','File Statement of Business Activities','2026-06-15',null,null,'pending','yellow','Need to compile all expense receipts',null,now,now);
  iPEC.run(uid(),jTrust,cu1,'T3 Trust Return 2025','tax_filing','Annual trust income tax return','2026-03-31',null,null,'in_progress','red','Working with tax advisor',null,now,now);
  iPEC.run(uid(),jTrust,cu1,'Trust Annual Review','financial','Annual review of trust assets and distributions','2026-06-30','FREQ=YEARLY;BYMONTH=6','Review every June','pending','yellow','Current trust value ~$320,000',null,now,now);

  // Consultants for James
  const jTaxAdv = uid(); const jImmLaw = uid(); const jFinPlan = uid();
  iPC.run(jTaxAdv,cu1,'Amit Shah, CPA','tax_advisor','amit.shah@taxfirm.ca','416-555-8001','Shah & Associates CPA','Primary tax advisor for personal and business',now,now);
  iPC.run(jImmLaw,cu1,'Karen White, LL.B.','legal_expert','karen@whitelaw.ca','416-555-8002','White & Associates Law','Estate planning and trust law',now,now);
  iPC.run(jFinPlan,cu1,'Michael Chen, CFP','financial_planner','michael@wealthplan.ca','416-555-8003','WealthPlan Advisory','Investment and retirement planning',now,now);

  // Consultant assignments
  iPCA.run(uid(),jTaxAdv,jTax,'personal',cu1,now);
  iPCA.run(uid(),jImmLaw,jTrust,'personal',cu1,now); // trust entity
  iPCA.run(uid(),jFinPlan,jInsurance,'personal',cu1,now);

  // --- Harpreet Singh (cu3) - minimal seed ---
  iPCI.run(uid(),cu3,'Passport Renewal - Harpreet','documents_ids','Indian passport renewal at consulate','2026-10-20',null,null,'pending','green','OCI card also needs renewal',null,now,now);
  iPCI.run(uid(),cu3,'T1 Tax Filing 2025','tax_filing','Personal tax return','2026-04-30',null,null,'pending','red',null,null,now,now);
  iPCI.run(uid(),cu3,'Life Insurance Premium','insurance','Annual life insurance premium payment','2026-05-15','FREQ=YEARLY;BYMONTH=5','Pay every May','pending','yellow','Sun Life Policy #SL-789012',null,now,now);
  iPCI.run(uid(),cu3,'Vehicle Registration Renewal','documents_ids','Alberta vehicle registration','2026-07-30',null,null,'pending','green',null,null,now,now);

  const hSpouse = uid();
  iPFM.run(hSpouse,cu3,'Manpreet Singh','spouse','1980-04-15','manpreet@email.com','780-555-0701','Joint tax filing',now,now);
  iPFC.run(uid(),hSpouse,cu3,'Manpreet - T1 Tax Filing','tax_filing','Spouse tax return 2025','2026-04-30',null,null,'pending','red',null,null,now,now);

  // ── STAFF TASKS (Ad-hoc admin-assigned tasks for Staff Portal) ──
  const iST = db.prepare(`INSERT INTO staff_tasks (id,title,description,assigned_to,assigned_by,client_id,engagement_id,due_date,priority,status,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const staffTaskData: [string,string,string,string|null,string|null,string,string,string,string|null,string|null][] = [
    ['Review bank reconciliation for Q1','Check all bank statements match the ledger entries for Q1 2025',mem1Id,clients[0].id,engagements[0].id,'2026-04-10','high','in_progress','Started reviewing Jan statements',null],
    ['Prepare T4 summary for filing','Compile all T4 slips and prepare summary report',mem2Id,clients[6].id,engagements[7].id,'2026-04-15','urgent','pending',null,null],
    ['Follow up with CRA on reassessment','Call CRA regarding the 2024 reassessment notice for Singh family',mem1Id,clients[5].id,engagements[6].id,'2026-04-05','high','pending','CRA reference #RC-2024-7890',null],
    ['Update bookkeeping entries - March','Enter all March transactions for Mountain View Dental',mem5Id,clients[17].id,engagements[23].id,'2026-04-08','medium','in_progress',null,null],
    ['Verify RRSP contribution room','Check CRA My Account for client RRSP room and prepare letter',mem3Id,clients[0].id,engagements[0].id,'2026-04-12','medium','pending',null,null],
    ['Prepare engagement letter for new client','Draft and send engagement letter for Whitehorse Adventure Tours',mem4Id,clients[20].id,engagements[27].id,'2026-04-03','high','pending',null,null],
    ['File HST return - Q4','File quarterly HST return for Prairie Grain Cooperative',mem3Id,clients[8].id,engagements[10].id,'2026-04-01','urgent','in_progress','Waiting for final invoice amounts',null],
    ['Review financial statements','Annual financial statement review for Halifax Marine Services',mem2Id,clients[10].id,engagements[13].id,'2026-04-20','medium','pending',null,null],
    ['Organize client folder structure','Reorganize digital file structure for Chen Family Trust files',mem5Id,clients[11].id,engagements[15].id,'2026-04-25','low','pending',null,null],
    ['Complete T2 preparation checklist','Run through T2 prep checklist for Island Brewing Company',mem4Id,clients[14].id,engagements[18].id,'2026-04-18','medium','pending',null,null],
    ['Send payment reminder to client','Follow up on overdue invoice for Pacific Coast Holdings',mem1Id,clients[2].id,engagements[3].id,'2026-03-28','high','completed',null,'2026-03-28T14:30:00Z'],
    ['Archive completed engagement files','Archive all 2024 completed engagement documents',mem2Id,null,null,'2026-03-25','low','completed','All files archived to cloud storage','2026-03-25T10:00:00Z'],
  ];
  staffTaskData.forEach(t => {
    iST.run(uid(),t[0],t[1],t[2],adminId,t[3],t[4],t[5],t[6],t[7],t[8],t[9],now,now);
  });

  // ── STAFF REMINDERS (Personal reminders for staff) ──
  const iSR = db.prepare(`INSERT INTO staff_reminders (id,user_id,title,message,related_task_type,related_task_id,trigger_date,days_before_due,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const reminderDays = [1,2,3,5,7];
  [mem1Id,mem2Id,mem3Id,mem4Id,mem5Id].forEach((memId, mi) => {
    // 3 reminders per staff member
    for (let ri = 0; ri < 3; ri++) {
      const daysOffset = reminderDays[(mi + ri) % reminderDays.length];
      const trigDate = new Date(Date.now() + daysOffset * 86400000).toISOString().split('T')[0];
      const titles = [
        'Review pending documents before deadline',
        'Follow up on client response',
        'Complete task before due date',
        'Check CRA portal for updates',
        'Prepare weekly status report',
      ];
      iSR.run(uid(), memId, titles[(mi + ri) % titles.length], `Reminder set ${daysOffset} days from now`, null, null, trigDate, daysOffset, 'pending', now);
    }
  });

  console.log('Database seeded successfully with comprehensive demo data!');
}
