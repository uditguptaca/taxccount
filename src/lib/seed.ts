import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';

export function seedDatabase() {
  const db = getDb();
  const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get() as any;
  if (orgCount.count > 0) return;

  const hash = bcryptjs.hashSync('password123', 10);
  const now = new Date().toISOString();
  const uid = () => uuidv4();

  // ══════════════════════════════════════════════════════════════════
  // ORGANIZATIONS
  // ══════════════════════════════════════════════════════════════════
  const org1Id = uid(); const org2Id = uid(); const org3Id = uid();
  const indOrg1 = uid(); const indOrg2 = uid();

  const iOrg = db.prepare(`INSERT INTO organizations (id,name,slug,org_type,email,phone,address_line_1,city,state_province,postal_code,country,jurisdiction,area_of_practice,currency_code,website,tax_id,plan,status,max_users,max_clients,onboarded_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  iOrg.run(org1Id,'Taxccount Professional Services','taxccount','consulting_firm','admin@taxccount.ca','416-555-0100','100 King Street West, Suite 5600','Toronto','Ontario','M5X 1C9','Canada','Canada','Tax & Accounting','CAD','www.taxccount.ca','123456789RT0001','professional','active',20,100,now,now,now);
  iOrg.run(org2Id,'Dynamic Audit & Advisory','dynamic-audit','consulting_firm','admin@dynamicaudit.com','312-555-2000','123 Michigan Ave','Chicago','Illinois','60601','United States','United States','Audit & Advisory','USD','www.dynamicaudit.com','98-7654321','starter','active',10,50,now,now,now);
  iOrg.run(org3Id,'Côté Boutique Consulting','cote-cpa','consulting_firm','admin@cotelondon.co.uk','020-7946-0000','200 Grande Allée','London','England','WC2N 5DU','United Kingdom','United Kingdom','Management Consulting','GBP','www.cotelondon.co.uk','GB123456789','free','active',5,25,now,now,now);
  iOrg.run(indOrg1,'James Thompson Personal','james-thompson','individual','james.personal@email.com','905-555-0200',null,'Toronto','Ontario','M5V 2T6','Canada','Canada',null,'CAD',null,null,'free','active',1,0,now,now,now);
  iOrg.run(indOrg2,'Priya Sharma Personal','priya-sharma','individual','priya.personal@email.com','416-555-4000',null,'New York','New York','10001','United States','United States',null,'USD',null,null,'free','active',1,0,now,now,now);

  // ══════════════════════════════════════════════════════════════════
  // USERS
  // ══════════════════════════════════════════════════════════════════
  const platformAdminId = uid();
  // Firm 1: Taxccount
  const adminId = uid(); const mgr1Id = uid(); const mgr2Id = uid();
  const mem1Id = uid(); const mem2Id = uid(); const mem3Id = uid(); const mem4Id = uid(); const mem5Id = uid();
  const cu1 = uid(); const cu2 = uid(); const cu3 = uid();
  // Firm 2: Singh CPA
  const singh_admin = uid(); const singh_mem1 = uid(); const singh_mem2 = uid();
  const singh_cu1 = uid(); const singh_cu2 = uid();
  // Firm 3: Côté
  const cote_admin = uid(); const cote_mem1 = uid(); const cote_cu1 = uid();
  // Individuals
  const indUser1 = uid(); const indUser2 = uid();

  const iU = db.prepare(`INSERT INTO users (id,email,password_hash,first_name,last_name,phone,role,is_active,is_platform_admin,personal_org_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,?,?,?,?)`);
  // Platform admin
  iU.run(platformAdminId,'platform@abidebylaw.com',hash,'Platform','Admin','416-555-9999','platform_admin',1,null,now,now);
  // Firm 1
  iU.run(adminId,'admin@taxccount.ca',hash,'Sarah','Mitchell','416-555-0100','firm_admin',0,null,now,now);
  iU.run(mgr1Id,'david@taxccount.ca',hash,'David','Chen','416-555-0101','team_manager',0,null,now,now);
  iU.run(mgr2Id,'lisa@taxccount.ca',hash,'Lisa','Nakamura','416-555-0110','team_manager',0,null,now,now);
  iU.run(mem1Id,'emily@taxccount.ca',hash,'Emily','Rodriguez','416-555-0102','team_member',0,null,now,now);
  iU.run(mem2Id,'michael@taxccount.ca',hash,'Michael','Johnson','416-555-0103','team_member',0,null,now,now);
  iU.run(mem3Id,'priya@taxccount.ca',hash,'Priya','Patel','416-555-0104','team_member',0,null,now,now);
  iU.run(mem4Id,'alex@taxccount.ca',hash,'Alex','Dubois','416-555-0105','team_member',0,null,now,now);
  iU.run(mem5Id,'neha@taxccount.ca',hash,'Neha','Sharma','416-555-0106','team_member',0,null,now,now);
  iU.run(cu1,'james@email.com',hash,'James','Thompson','905-555-0200','client',0,null,now,now);
  iU.run(cu2,'contact@mapleleaf.ca',hash,'Robert','Williams','604-555-0300','client',0,null,now,now);
  iU.run(cu3,'singh@email.com',hash,'Harpreet','Singh','780-555-0700','client',0,null,now,now);
  // Firm 2
  iU.run(singh_admin,'admin@singhcpa.ca',hash,'Gurpreet','Singh','780-555-2001','firm_admin',0,null,now,now);
  iU.run(singh_mem1,'ravi@singhcpa.ca',hash,'Ravi','Kumar','780-555-2002','team_member',0,null,now,now);
  iU.run(singh_mem2,'deepa@singhcpa.ca',hash,'Deepa','Gupta','780-555-2003','team_member',0,null,now,now);
  iU.run(singh_cu1,'kumar.client@email.com',hash,'Anil','Kumar','780-555-2010','client',0,null,now,now);
  iU.run(singh_cu2,'patel.client@email.com',hash,'Meera','Patel','780-555-2011','client',0,null,now,now);
  // Firm 3
  iU.run(cote_admin,'admin@cotecpa.ca',hash,'Pierre','Côté','418-555-3001','firm_admin',0,null,now,now);
  iU.run(cote_mem1,'luc@cotecpa.ca',hash,'Luc','Bergeron','418-555-3002','team_member',0,null,now,now);
  iU.run(cote_cu1,'martin.client@email.com',hash,'Martin','Tremblay','418-555-3010','client',0,null,now,now);
  // Individuals
  iU.run(indUser1,'james.personal@email.com',hash,'James','Thompson','905-555-0200','individual',0,indOrg1,now,now);
  iU.run(indUser2,'priya.personal@email.com',hash,'Priya','Sharma','416-555-4000','individual',0,indOrg2,now,now);

  // ══════════════════════════════════════════════════════════════════
  // ORGANIZATION MEMBERSHIPS
  // ══════════════════════════════════════════════════════════════════
  const iOM = db.prepare(`INSERT INTO organization_memberships (id,org_id,user_id,role,status,joined_at) VALUES (?,?,?,?,?,?)`);
  // Firm 1
  [
    [org1Id,adminId,'firm_admin'],[org1Id,mgr1Id,'team_manager'],[org1Id,mgr2Id,'team_manager'],
    [org1Id,mem1Id,'team_member'],[org1Id,mem2Id,'team_member'],[org1Id,mem3Id,'team_member'],
    [org1Id,mem4Id,'team_member'],[org1Id,mem5Id,'team_member'],
    [org1Id,cu1,'client'],[org1Id,cu2,'client'],[org1Id,cu3,'client'],
  ].forEach(m => iOM.run(uid(),m[0],m[1],m[2],'active',now));
  // Firm 2
  [[org2Id,singh_admin,'firm_admin'],[org2Id,singh_mem1,'team_member'],[org2Id,singh_mem2,'team_member'],
   [org2Id,singh_cu1,'client'],[org2Id,singh_cu2,'client']
  ].forEach(m => iOM.run(uid(),m[0],m[1],m[2],'active',now));
  // Firm 3
  [[org3Id,cote_admin,'firm_admin'],[org3Id,cote_mem1,'team_member'],[org3Id,cote_cu1,'client']
  ].forEach(m => iOM.run(uid(),m[0],m[1],m[2],'active',now));

  // ══════════════════════════════════════════════════════════════════
  // CLIENT TYPES CONFIG (per org)
  // ══════════════════════════════════════════════════════════════════
  const iType = db.prepare(`INSERT INTO client_types_config (id,org_id,name,is_system) VALUES (?,?,?,?)`);
  const typeMap: Record<string, string> = {};
  [org1Id, org2Id, org3Id].forEach(oid => {
    ['Individual','Business','Trust','Sole Proprietor'].forEach(t => {
      const tid = uid(); typeMap[`${oid}_${t.toLowerCase()}`] = tid;
      iType.run(tid, oid, t, 1);
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // TEAMS (Firm 1)
  // ══════════════════════════════════════════════════════════════════
  const t1 = uid(); const t2 = uid(); const t3 = uid(); const t4 = uid();
  const iT = db.prepare(`INSERT INTO teams (id,org_id,name,description,manager_id,is_active,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)`);
  iT.run(t1,org1Id,'Personal Tax Team','T1 and personal filings',mgr1Id,now,now);
  iT.run(t2,org1Id,'Corporate Tax Team','T2, GST/HST, corporate',mgr1Id,now,now);
  iT.run(t3,org1Id,'Bookkeeping Team','Monthly bookkeeping',mgr2Id,now,now);
  iT.run(t4,org1Id,'Advisory Team','Tax planning and advisory',mgr2Id,now,now);

  const iM = db.prepare(`INSERT INTO team_memberships (id,org_id,team_id,user_id,role_in_team,joined_at,is_active) VALUES (?,?,?,?,?,?,1)`);
  iM.run(uid(),org1Id,t1,mgr1Id,'manager','2024-01-01'); iM.run(uid(),org1Id,t1,mem1Id,'senior','2024-01-01'); iM.run(uid(),org1Id,t1,mem2Id,'member','2024-03-01');
  iM.run(uid(),org1Id,t2,mgr1Id,'manager','2024-01-01'); iM.run(uid(),org1Id,t2,mem3Id,'senior','2024-02-01'); iM.run(uid(),org1Id,t2,mem4Id,'member','2024-04-01');
  iM.run(uid(),org1Id,t3,mgr2Id,'manager','2024-01-01'); iM.run(uid(),org1Id,t3,mem5Id,'senior','2024-01-01');
  iM.run(uid(),org1Id,t4,mgr2Id,'manager','2024-01-01'); iM.run(uid(),org1Id,t4,mem1Id,'member','2024-06-01');

  // Firm 2 teams
  const st1 = uid();
  iT.run(st1,org2Id,'Tax Team','Personal and corporate tax',singh_admin,now,now);
  iM.run(uid(),org2Id,st1,singh_mem1,'member','2024-01-01');
  iM.run(uid(),org2Id,st1,singh_mem2,'member','2024-01-01');

  // ══════════════════════════════════════════════════════════════════
  // TEMPLATE CATEGORIES
  // ══════════════════════════════════════════════════════════════════
  const iCat = db.prepare(`INSERT INTO template_categories (id,org_id,name,sort_order,created_at) VALUES (?,?,?,?,?)`);
  ['Personal Tax','Corporate Tax','Sales Tax','Payroll','Information Returns','Bookkeeping'].forEach((c,i) => {
    iCat.run(uid(),org1Id,c,i+1,now);
    iCat.run(uid(),org2Id,c,i+1,now);
  });

  // ══════════════════════════════════════════════════════════════════
  // COMPLIANCE TEMPLATES (Firm 1)
  // ══════════════════════════════════════════════════════════════════
  const tplT1 = uid(); const tplT2 = uid(); const tplGST = uid(); const tplBK = uid(); const tplT3 = uid();
  const iTpl = db.prepare(`INSERT INTO compliance_templates (id,org_id,name,code,description,category,default_price,due_date_rule,is_active,version,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,1,1,?,?,?)`);
  iTpl.run(tplT1,org1Id,'T1 Personal Tax Return','T1','Individual personal income tax return','Personal Tax',500,'{}',adminId,now,now);
  iTpl.run(tplT2,org1Id,'T2 Corporate Tax Return','T2','Corporate income tax return','Corporate Tax',1500,'{}',adminId,now,now);
  iTpl.run(tplGST,org1Id,'GST/HST Return','GST-HST','GST/HST return filing','Sales Tax',400,'{}',adminId,now,now);
  iTpl.run(tplBK,org1Id,'Monthly Bookkeeping','BK-MTH','Monthly bookkeeping services','Bookkeeping',600,'{}',adminId,now,now);
  iTpl.run(tplT3,org1Id,'T3 Trust Return','T3-TRUST','Trust income tax return','Personal Tax',1200,'{}',adminId,now,now);

  // Firm 2 templates (US)
  const s_tplT1 = uid(); const s_tplT2 = uid();
  iTpl.run(s_tplT1,org2Id,'IRS Form 1040','1040','US Individual Income Tax Return','Personal Tax',450,'{}',singh_admin,now,now);
  iTpl.run(s_tplT2,org2Id,'IRS Form 1120','1120','US Corporation Income Tax Return','Corporate Tax',1300,'{}',singh_admin,now,now);

  // Firm 3 templates (UK)
  const c_tplT1 = uid(); const c_tplT2 = uid();
  iTpl.run(c_tplT1,org3Id,'Self Assessment Tax Return','SA100','UK Individual Tax Return','Personal Tax',350,'{}',cote_admin,now,now);
  iTpl.run(c_tplT2,org3Id,'Company Tax Return','CT600','UK Corporation Tax Return','Corporate Tax',950,'{}',cote_admin,now,now);

  // Template stages
  const stages = [
    {name:'Client Onboarding',code:'ONBOARDING',group:'onboarding',approval:0,visible:1,days:3},
    {name:'Data Collection',code:'DATA_COLLECTION',group:'work_in_progress',approval:0,visible:1,days:7},
    {name:'Preparation',code:'PREPARED',group:'work_in_progress',approval:0,visible:0,days:5},
    {name:'First Review',code:'FIRST_CHECK',group:'work_in_progress',approval:1,visible:0,days:2},
    {name:'Sent to Client',code:'SENT_TO_CLIENT',group:'work_in_progress',approval:0,visible:1,days:3},
    {name:'Billing',code:'BILLING',group:'invoicing',approval:0,visible:1,days:2},
    {name:'Final Filing',code:'FINAL_FILING',group:'completed',approval:1,visible:1,days:1},
    {name:'Completed',code:'COMPLETED',group:'completed',approval:0,visible:1,days:0},
  ];
  const iStg = db.prepare(`INSERT INTO compliance_template_stages (id,org_id,template_id,stage_name,stage_code,stage_group,sequence_order,requires_approval,is_client_visible,estimated_days,auto_advance) VALUES (?,?,?,?,?,?,?,?,?,?,0)`);
  [tplT1,tplT2,tplGST,tplBK,tplT3].forEach(tid => stages.forEach((s,i) => iStg.run(uid(),org1Id,tid,s.name,s.code,s.group,i+1,s.approval,s.visible,s.days)));
  [s_tplT1,s_tplT2].forEach(tid => stages.forEach((s,i) => iStg.run(uid(),org2Id,tid,s.name,s.code,s.group,i+1,s.approval,s.visible,s.days)));
  [c_tplT1,c_tplT2].forEach(tid => stages.forEach((s,i) => iStg.run(uid(),org3Id,tid,s.name,s.code,s.group,i+1,s.approval,s.visible,s.days)));

  // ══════════════════════════════════════════════════════════════════
  // CLIENTS (Firm 1 — 10 clients)
  // ══════════════════════════════════════════════════════════════════
  const clients: {id:string;code:string;name:string;type:string;idx:number}[] = [];
  const cData = [
    ['CLI-0001','James & Sarah Thompson','individual',cu1],
    ['CLI-0002','Maple Leaf Consulting Inc.','business',cu2],
    ['CLI-0003','Pacific Coast Holdings Ltd.','business',null],
    ['CLI-0004','Tremblay Family Trust','trust',null],
    ['CLI-0005','Ahmed Khan','sole_proprietor',null],
    ['CLI-0006','Harpreet & Manpreet Singh','individual',cu3],
    ['CLI-0007','Northern Lights Energy Corp.','business',null],
    ['CLI-0008','Côté & Associés SENC','business',null],
    ['CLI-0009','Prairie Grain Cooperative','business',null],
    ['CLI-0010','Maria Santos','individual',null],
  ];
  const iCl = db.prepare(`INSERT INTO clients (id,org_id,client_code,display_name,client_type,status,primary_email,portal_user_id,created_by,country,created_at,updated_at) VALUES (?,?,?,?,?,'active',?,?,?,?,?,?)`);
  cData.forEach((c,i) => {
    const cid = uid();
    clients.push({id:cid,code:c[0] as string,name:c[1] as string,type:c[2] as string,idx:i});
    iCl.run(cid,org1Id,c[0],c[1],c[2],`client${i+1}@example.com`,c[3],adminId,'Canada',now,now);
  });

  // Firm 2 clients
  const s_clients: {id:string;code:string;name:string}[] = [];
  [['SC-0001','USA Industries Ltd.','business',singh_cu1],['SC-0002','Patel Family Trust','trust',singh_cu2],['SC-0003','Chicago Logistics Inc.','business',null]
  ].forEach((c,i) => {
    const cid = uid(); s_clients.push({id:cid,code:c[0] as string,name:c[1] as string});
    iCl.run(cid,org2Id,c[0],c[1],c[2],`sclient${i+1}@example.com`,c[3],singh_admin,'United States',now,now);
  });

  // Firm 3 clients
  [['CC-0001','Martin Tremblay','individual',cote_cu1],['CC-0002','UK Construction Ltd','business',null]
  ].forEach(c => { const cid = uid(); iCl.run(cid,org3Id,c[0],c[1],c[2],`cclient@example.com`,c[3],cote_admin,'United Kingdom',now,now); });

  // ══════════════════════════════════════════════════════════════════
  // ENGAGEMENTS (Firm 1 — 12 engagements)
  // ══════════════════════════════════════════════════════════════════
  const engagements: {id:string;clientIdx:number}[] = [];
  const engData: [number,string,string,string,number,string,string,string][] = [
    [0,tplT1,'2025','2026-04-30',500,'in_progress','current',t1],
    [1,tplT2,'2025','2026-06-30',1500,'in_progress','current',t2],
    [1,tplGST,'2025','2026-01-31',400,'in_progress','current',t2],
    [2,tplT2,'2025','2026-06-30',2000,'new','future',t2],
    [4,tplT1,'2025','2026-06-15',750,'in_progress','submit_data',t1],
    [5,tplT1,'2025','2026-04-30',500,'in_progress','current',t1],
    [6,tplT2,'2025','2026-06-30',2500,'in_progress','current',t2],
    [7,tplT2,'2025','2026-06-30',1800,'new','future',t2],
    [8,tplT2,'2025','2026-06-30',1500,'in_progress','current',t2],
    [9,tplT1,'2025','2026-04-30',500,'in_progress','current',t1],
    [3,tplT3,'2025','2026-03-31',1200,'in_progress','current',t1],
    [0,tplT1,'2024','2025-04-30',450,'completed','past',t1],
  ];
  const iEng = db.prepare(`INSERT INTO client_compliances (id,org_id,engagement_code,client_id,template_id,financial_year,due_date,price,status,client_facing_status,priority,assigned_team_id,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iES = db.prepare(`INSERT INTO client_compliance_stages (id,org_id,engagement_id,stage_name,stage_code,sequence_order,status,assigned_user_id,started_at,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const priorities = ['low','medium','high','urgent'];
  const memberPool = [mem1Id,mem2Id,mem3Id,mem4Id,mem5Id];

  engData.forEach((e,idx) => {
    const eid = uid();
    const code = `ENG-${e[2]}-${String(idx+1).padStart(4,'0')}`;
    const pri = priorities[idx % 4];
    engagements.push({id:eid,clientIdx:e[0] as number});
    iEng.run(eid,org1Id,code,clients[e[0] as number].id,e[1],e[2],e[3],e[4],e[5],e[6],pri,e[7],adminId,now,now);
    const assignee = memberPool[idx % memberPool.length];
    stages.forEach((s,i) => {
      let st = 'pending'; let asgn: string|null = null; let started: string|null = null; let completed: string|null = null;
      if (e[5] === 'completed') { st = 'completed'; asgn = assignee; started = now; completed = now; }
      else if (e[5] === 'in_progress') {
        const pp = (idx % 6) + 1;
        if (i < pp) { st = 'completed'; asgn = assignee; started = now; completed = now; }
        else if (i === pp) { st = 'in_progress'; asgn = assignee; started = now; }
      }
      iES.run(uid(),org1Id,eid,s.name,s.code,i+1,st,asgn,started,completed,now,now);
    });
  });

  // Firm 2 engagements
  const s_eng: string[] = [];
  [[0,s_tplT1,'2025','2026-04-30',450,'in_progress','current',st1],[1,s_tplT2,'2025','2026-06-30',1300,'new','future',st1],[2,s_tplT2,'2025','2026-06-30',1300,'in_progress','current',st1]
  ].forEach((e: any,idx) => {
    const eid = uid(); s_eng.push(eid);
    iEng.run(eid,org2Id,`SENG-${idx+1}`,s_clients[e[0]].id,e[1],e[2],e[3],e[4],e[5],e[6],'medium',e[7],singh_admin,now,now);
    stages.forEach((s,i) => {
      let st = 'pending'; if (e[5]==='in_progress' && i < 2) st = 'completed';
      iES.run(uid(),org2Id,eid,s.name,s.code,i+1,st,i<3?singh_mem1:null,i<2?now:null,st==='completed'?now:null,now,now);
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // INVOICES (Firm 1)
  // ══════════════════════════════════════════════════════════════════
  const iInv = db.prepare(`INSERT INTO invoices (id,org_id,invoice_number,engagement_id,client_id,amount,tax_amount,total_amount,status,issued_date,due_date,paid_amount,description,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const invStatuses = ['paid','sent','overdue','draft','paid','sent','paid','partially_paid'];
  engagements.forEach((eng,i) => {
    const amt = [500,1500,400,2000,750,500,2500,1800,1500,500,1200,450][i] || 500;
    const tax = Math.round(amt * 0.13 * 100) / 100;
    const total = amt + tax;
    const st = invStatuses[i % invStatuses.length];
    const issued = `2025-${String((i%12)+1).padStart(2,'0')}-15`;
    const due = `2025-${String((i%12)+2).padStart(2,'0')}-15`;
    const paid = st==='paid'?total:st==='partially_paid'?Math.round(total*0.5):0;
    iInv.run(uid(),org1Id,`INV-${String(i+1).padStart(4,'0')}`,eng.id,clients[eng.clientIdx].id,amt,tax,total,st,issued,due,paid,`Professional fees - ${clients[eng.clientIdx].name}`,adminId,now,now);
  });

  // ══════════════════════════════════════════════════════════════════
  // INBOX, ACTIVITY, REMINDERS (Firm 1 — compact)
  // ══════════════════════════════════════════════════════════════════
  const iInbox = db.prepare(`INSERT INTO inbox_items (id,org_id,user_id,item_type,title,message,client_id,is_read,created_at) VALUES (?,?,?,?,?,?,?,?,?)`);
  for (let i = 0; i < 20; i++) {
    const types = ['document_uploaded','invoice_paid','message_received','deadline_approaching'];
    const titles = ['New document uploaded','Payment received','New message','Deadline approaching'];
    const ci = i % clients.length;
    iInbox.run(uid(),org1Id,adminId,types[i%4],`${titles[i%4]} — ${clients[ci].name}`,`For ${clients[ci].name}`,clients[ci].id,i>5?1:0,new Date(Date.now()-i*3600000*3).toISOString());
  }

  const iAF = db.prepare(`INSERT INTO activity_feed (id,org_id,actor_id,action,entity_type,entity_id,entity_name,client_id,details,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const staffIds = [adminId,mgr1Id,mgr2Id,mem1Id,mem2Id,mem3Id];
  const actions = ['advanced_stage','uploaded_document','created_invoice','sent_reminder','completed_stage','filed_return'];
  for (let i = 0; i < 15; i++) {
    const ci = i % clients.length;
    iAF.run(uid(),org1Id,staffIds[i%staffIds.length],actions[i%actions.length],'engagement',uid(),clients[ci].name,clients[ci].id,`Activity for ${clients[ci].name}`,new Date(Date.now()-i*3600000*4).toISOString());
  }

  const iRem = db.prepare(`INSERT INTO reminders (id,org_id,reminder_type,engagement_id,client_id,user_id,title,message,trigger_date,channel,status,is_recurring,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (let i = 0; i < 15; i++) {
    const eng = engagements[i % engagements.length];
    const d = (i%10)-5;
    const trigDate = new Date(Date.now()+d*86400000).toISOString().split('T')[0];
    iRem.run(uid(),org1Id,['deadline','document_request','payment'][i%3],eng.id,clients[eng.clientIdx].id,staffIds[i%staffIds.length],
      ['Filing Deadline','Missing Documents','Invoice Overdue'][i%3],`Reminder for ${clients[eng.clientIdx].name}`,trigDate,'both',d<0?'sent':'pending',0,adminId,now);
  }

  // ══════════════════════════════════════════════════════════════════
  // LEADS (Firm 1 — 5 leads)
  // ══════════════════════════════════════════════════════════════════
  const iLead = db.prepare(`INSERT INTO leads (id,org_id,lead_code,first_name,last_name,company_name,email,phone,lead_type,source,pipeline_stage,lead_score,expected_value,status,assigned_to,tags,notes,city,state_province,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  [
    ['Ananya','Desai','Desai Consulting','ananya@desai.ca','416-555-3001','corporation','referral','qualified','hot',8500,'active',adminId,'T2,Advisory','High-value corporate prospect','Toronto','Ontario'],
    ['Marcus','Leblanc',null,'marcus@gmail.com','514-555-3002','individual','website','meeting_scheduled','warm',1200,'active',mgr1Id,null,'T1 inquiry from website','Montreal','Quebec'],
    ['Fatima','Al-Hassan','Al-Hassan Medical','fatima@medical.ca','604-555-3003','corporation','call','proposal_sent','hot',12000,'active',mgr2Id,'T2,GST/HST','Medical corp full service','Vancouver','British Columbia'],
    ['Derek','O\'Brien',null,'derek@outlook.com','403-555-3004','individual','walk_in','contacted','cold',600,'active',mem1Id,null,'Walk-in basic T1','Calgary','Alberta'],
    ['Sarah','Blackwood','Blackwood Legal','sarah@legal.ca','613-555-3007','partnership','website','new_inquiry','warm',6500,'active',mem2Id,'T2,Advisory','Law firm partnership','Ottawa','Ontario'],
  ].forEach((l: any,i) => {
    iLead.run(uid(),org1Id,`LEAD-${String(i+1).padStart(4,'0')}`,l[0],l[1],l[2],l[3],l[4],l[5],l[6],l[7],l[8],l[9],l[10],l[11],l[12],l[13],l[14],l[15],adminId,now,now);
  });

  // ══════════════════════════════════════════════════════════════════
  // PERSONAL COMPLIANCE VAULT (for individual users)
  // ══════════════════════════════════════════════════════════════════
  const iPCI = db.prepare(`INSERT INTO personal_compliance_items (id,user_id,org_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,assigned_consultant_id,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iPFM = db.prepare(`INSERT INTO personal_family_members (id,user_id,org_id,name,relationship,date_of_birth,email,phone,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const iPFC = db.prepare(`INSERT INTO personal_family_compliance (id,family_member_id,user_id,org_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iPC = db.prepare(`INSERT INTO personal_consultants (id,user_id,org_id,name,specialty,email,phone,company,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const iPCA = db.prepare(`INSERT INTO personal_consultant_assignments (id,consultant_id,compliance_item_id,compliance_type,user_id,created_at) VALUES (?,?,?,?,?,?)`);
  const iPE = db.prepare(`INSERT INTO personal_entities (id,user_id,org_id,name,entity_type,registration_number,description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const iPEC = db.prepare(`INSERT INTO personal_entity_compliance (id,entity_id,user_id,org_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  // ── JAMES THOMPSON — 3 Sample Consultants ──
  const consul1 = uid(); const consul2 = uid(); const consul3 = uid();
  iPC.run(consul1,indUser1,indOrg1,'Robert Chen, CPA','tax_advisor','robert@chenassociates.ca','416-555-8001','Chen & Associates CPAs','Handles all tax filings and property tax matters. 15+ years experience.',now,now);
  iPC.run(consul2,indUser1,indOrg1,'Maria Rodriguez, Esq.','legal_expert','maria@rodriguezlaw.ca','416-555-8002','Rodriguez Law','Specializes in real estate law and immigration. Licensed in Ontario.',now,now);
  iPC.run(consul3,indUser1,indOrg1,'David Park, CFP','financial_planner','david@parkviewwealth.ca','416-555-8003','Parkview Wealth Management','Financial planning, insurance, RRSP/TFSA strategy.',now,now);

  // ── JAMES THOMPSON — 22+ Personal Compliance Items ──
  // Medical
  const pci_dental = uid(); const pci_physical = uid(); const pci_eye = uid();
  iPCI.run(pci_dental,indUser1,indOrg1,'Annual Dental Cleaning','medical','Regular dental cleaning and checkup','2026-07-15','FREQ=SEMIANNUAL','Every 6 months','pending','yellow',null,'Dr. Patel, Yonge St Dental',null,now,now);
  iPCI.run(pci_physical,indUser1,indOrg1,'Annual Physical Checkup','medical','Complete physical with bloodwork','2026-09-01','FREQ=YEARLY','Yearly','pending','green',null,'Book with Dr. Singh, Family Medicine',null,now,now);
  iPCI.run(pci_eye,indUser1,indOrg1,'Eye Exam & Prescription Renewal','medical','Vision test and contact lens renewal','2027-03-15','FREQ=BIENNIAL','Every 2 years','pending','green',null,'Last exam: Mar 2025',null,now,now);

  // Property
  const pci_ptax = uid(); const pci_hins = uid(); const pci_rental = uid();
  iPCI.run(pci_ptax,indUser1,indOrg1,'House Property Tax Filing','property','Annual property tax assessment filing','2026-06-30','FREQ=YEARLY','Annually','pending','yellow',consul1,'123 Maple Drive, Toronto',null,now,now);
  iPCI.run(pci_hins,indUser1,indOrg1,'Home Insurance Renewal','insurance','Annual home insurance policy renewal','2027-01-15','FREQ=YEARLY','Renew January','completed','green',consul3,null,'2026-01-10',now,now);
  iPCI.run(pci_rental,indUser1,indOrg1,'Rental Property Maintenance Inspection','property','Quarterly inspection of rental unit','2026-08-01','FREQ=QUARTERLY','Quarterly','pending','green',null,'Unit 302, 456 Oak Ave',null,now,now);

  // Documents & IDs
  const pci_passport = uid(); const pci_driver = uid(); const pci_health = uid();
  iPCI.run(pci_passport,indUser1,indOrg1,'Passport Renewal','documents_ids','Canadian passport expires Dec 2026','2026-12-31','FREQ=DECENNIAL','Every 10 years','pending','yellow',null,'Passport #AB123456',null,now,now);
  iPCI.run(pci_driver,indUser1,indOrg1,'Driver\'s License Renewal','documents_ids','Ontario G license renewal','2027-04-15','FREQ=QUINQUENNIAL','Every 5 years','pending','green',null,'License #T1234-56789-70001',null,now,now);
  iPCI.run(pci_health,indUser1,indOrg1,'Health Card Renewal','documents_ids','Ontario Health Card (OHIP) renewal','2026-11-30','FREQ=QUINQUENNIAL','Every 5 years','pending','yellow',null,'Photo update required',null,now,now);

  // Tax Filing
  const pci_t1 = uid(); const pci_hst = uid(); const pci_rrsp = uid();
  iPCI.run(pci_t1,indUser1,indOrg1,'T1 Personal Income Tax (2025)','tax_filing','File personal income tax return','2026-04-30','FREQ=YEARLY','Annually','in_progress','red',consul1,'Gathering T4, T5 slips from employer',null,now,now);
  iPCI.run(pci_hst,indUser1,indOrg1,'HST Return Q2 2026','tax_filing','Quarterly HST return for rental income','2026-07-31','FREQ=QUARTERLY','Quarterly','pending','green',consul1,null,null,now,now);
  iPCI.run(pci_rrsp,indUser1,indOrg1,'RRSP Contribution Deadline','tax_filing','Maximize RRSP contribution for tax year','2027-03-01','FREQ=YEARLY','Annually','pending','green',consul3,'Contribution room: $15,200',null,now,now);

  // Insurance
  const pci_auto = uid(); const pci_life = uid(); const pci_tenant = uid();
  iPCI.run(pci_auto,indUser1,indOrg1,'Auto Insurance Renewal','insurance','Annual car insurance renewal — 2018 Honda Civic','2026-09-15','FREQ=YEARLY','Annually','pending','green',consul3,'Policy #AI-987654',null,now,now);
  iPCI.run(pci_life,indUser1,indOrg1,'Life Insurance Premium Review','insurance','Annual review of life insurance coverage','2027-02-28','FREQ=YEARLY','Annually','pending','green',consul3,'Current coverage: $500K term',null,now,now);
  iPCI.run(pci_tenant,indUser1,indOrg1,'Tenant Insurance Renewal','insurance','Rental property tenant insurance','2026-10-01','FREQ=YEARLY','Annually','pending','green',null,null,null,now,now);

  // Financial
  const pci_tfsa = uid(); const pci_credit = uid(); const pci_mortgage = uid();
  iPCI.run(pci_tfsa,indUser1,indOrg1,'TFSA Contribution','financial','Annual TFSA contribution','2027-01-02','FREQ=YEARLY','Annually','pending','green',consul3,'Contribution room: $7,000',null,now,now);
  iPCI.run(pci_credit,indUser1,indOrg1,'Credit Report Check','financial','Pull free credit report from TransUnion/Equifax','2026-06-01','FREQ=SEMIANNUAL','Semi-annually','pending','yellow',null,null,null,now,now);
  iPCI.run(pci_mortgage,indUser1,indOrg1,'Mortgage Renewal Review','financial','Review mortgage terms and negotiate rates','2026-11-01',null,'Every 5 years','pending','yellow',consul1,'Current rate: 4.8% variable',null,now,now);

  // Education
  const pci_ceu = uid();
  iPCI.run(pci_ceu,indUser1,indOrg1,'Professional Certification CEU','education','Complete continuing education credits','2026-12-31','FREQ=YEARLY','Annually','pending','yellow',null,'Need 20 credits by year end',null,now,now);

  // Custom / Misc
  const pci_car = uid(); const pci_smoke = uid(); const pci_chimney = uid(); const pci_furnace = uid();
  iPCI.run(pci_car,indUser1,indOrg1,'Car License Plate Sticker Renewal','custom','Annual vehicle registration renewal','2026-08-31','FREQ=YEARLY','Annually','pending','green',null,'Plate #BXYZ 123',null,now,now);
  iPCI.run(pci_smoke,indUser1,indOrg1,'Smoke Detector Battery Check','custom','Replace batteries in all smoke detectors','2026-10-01','FREQ=SEMIANNUAL','Semi-annually','pending','green',null,'6 units across house',null,now,now);
  iPCI.run(pci_chimney,indUser1,indOrg1,'Annual Chimney Inspection','custom','WETT-certified chimney sweep and inspection','2026-05-15','FREQ=YEARLY','Annually','pending','red',null,'Last inspected May 2025',null,now,now);
  iPCI.run(pci_furnace,indUser1,indOrg1,'Furnace & HVAC Maintenance','custom','Annual furnace tune-up and filter change','2026-10-15','FREQ=YEARLY','Annually','pending','green',null,'Reliance Home contract',null,now,now);

  // Mark some as completed for realistic stats
  const pci_done1 = uid(); const pci_done2 = uid(); const pci_done3 = uid();
  iPCI.run(pci_done1,indUser1,indOrg1,'2024 T1 Personal Tax Return','tax_filing','Filed 2024 personal income tax','2025-04-30','FREQ=YEARLY','Annually','completed','green',consul1,'Filed and assessed','2025-04-25',now,now);
  iPCI.run(pci_done2,indUser1,indOrg1,'Driver\'s License Photo Update','documents_ids','Updated driver\'s license photo','2025-06-15',null,null,'completed','green',null,'Done at ServiceOntario','2025-06-10',now,now);
  iPCI.run(pci_done3,indUser1,indOrg1,'Annual Dental Cleaning (Previous)','medical','Completed regular dental cleaning','2026-01-15','FREQ=SEMIANNUAL','Every 6 months','completed','green',null,'No cavities','2026-01-15',now,now);

  // ── JAMES — Consultant Assignments ──
  [pci_ptax,pci_t1,pci_hst,pci_mortgage,pci_done1].forEach(id => iPCA.run(uid(),consul1,id,'personal',indUser1,now));
  [pci_hins,pci_auto,pci_life,pci_rrsp,pci_tfsa].forEach(id => iPCA.run(uid(),consul3,id,'personal',indUser1,now));

  // ── JAMES — Family Members & Compliance ──
  const jSpouse = uid(); const jChild = uid(); const jParent = uid();
  iPFM.run(jSpouse,indUser1,indOrg1,'Sarah Thompson','spouse','1987-06-22','sarah.t@email.com','905-555-0201',null,now,now);
  iPFM.run(jChild,indUser1,indOrg1,'Aarav Thompson','child','2015-09-10',null,null,'Grade 5 at Maple Grove PS',now,now);
  iPFM.run(jParent,indUser1,indOrg1,'Margaret Thompson','parent','1955-03-14','margaret.t@email.com','905-555-0205','Retired',now,now);

  // Sarah's compliances
  iPFC.run(uid(),jSpouse,indUser1,indOrg1,'Passport Renewal','documents_ids','Sarah\'s passport expiry','2027-05-20',null,null,'pending','green',null,null,now,now);
  iPFC.run(uid(),jSpouse,indUser1,indOrg1,'Annual Physical Checkup','medical','Sarah\'s annual physical','2026-08-15','FREQ=YEARLY','Yearly','pending','green',null,null,now,now);
  iPFC.run(uid(),jSpouse,indUser1,indOrg1,'T1 Personal Tax (2025)','tax_filing','Sarah\'s personal tax return','2026-04-30','FREQ=YEARLY','Annually','in_progress','red','Filing jointly with James',null,now,now);

  // Aarav's compliances
  iPFC.run(uid(),jChild,indUser1,indOrg1,'School Registration Renewal','education','Register for Grade 6','2026-06-15','FREQ=YEARLY','Annually','pending','yellow',null,null,now,now);
  iPFC.run(uid(),jChild,indUser1,indOrg1,'Dental Checkup','medical','Bi-annual dental visit','2026-07-01','FREQ=SEMIANNUAL','Every 6 months','pending','yellow',null,null,now,now);
  iPFC.run(uid(),jChild,indUser1,indOrg1,'Passport Application','documents_ids','First Canadian passport','2026-09-01',null,null,'pending','green',null,null,now,now);

  // Margaret's compliances
  iPFC.run(uid(),jParent,indUser1,indOrg1,'OHIP Renewal','documents_ids','Ontario Health Card renewal','2026-12-15','FREQ=QUINQUENNIAL','Every 5 years','pending','yellow',null,null,now,now);
  iPFC.run(uid(),jParent,indUser1,indOrg1,'Flu Shot','medical','Annual flu vaccination','2026-10-15','FREQ=YEARLY','Annually','pending','green',null,null,now,now);
  iPFC.run(uid(),jParent,indUser1,indOrg1,'T1 Personal Tax (2025)','tax_filing','Margaret\'s tax return — pension income','2026-04-30','FREQ=YEARLY','Annually','pending','red','OAS and CPP income',null,now,now);

  // ── JAMES — Entities & Entity Compliance ──
  const jEntity1 = uid(); const jEntity2 = uid();
  iPE.run(jEntity1,indUser1,indOrg1,'Thompson Rental Properties','sole_proprietorship','BN-123456789','Manages 2 rental properties','active',now,now);
  iPE.run(jEntity2,indUser1,indOrg1,'TechVenture Holdings Inc.','business','BC-0987654','Tech investment holding company','active',now,now);

  iPEC.run(uid(),jEntity1,indUser1,indOrg1,'Annual HST Return','tax_filing','File HST for rental income','2026-06-15','FREQ=YEARLY','Annually','pending','yellow',null,null,now,now);
  iPEC.run(uid(),jEntity1,indUser1,indOrg1,'Rental Income T776 Schedule','tax_filing','Prepare rental income statement','2026-04-30','FREQ=YEARLY','Annually','in_progress','red','2 properties — Maple Dr & Oak Ave',null,now,now);
  iPEC.run(uid(),jEntity1,indUser1,indOrg1,'Property Insurance Review','insurance','Review rental property insurance','2026-11-01','FREQ=YEARLY','Annually','pending','green',null,null,now,now);

  iPEC.run(uid(),jEntity2,indUser1,indOrg1,'T2 Corporate Tax Return','tax_filing','Annual corporate income tax','2026-06-30','FREQ=YEARLY','Annually','pending','yellow',null,null,now,now);
  iPEC.run(uid(),jEntity2,indUser1,indOrg1,'Annual Return Filing','documents_ids','Ontario Corporations Information Act','2026-07-31','FREQ=YEARLY','Annually','pending','green',null,null,now,now);
  iPEC.run(uid(),jEntity2,indUser1,indOrg1,'Corporate Minutes','custom','Annual board meeting minutes','2026-12-31','FREQ=YEARLY','Annually','pending','green','Prepare with Maria Rodriguez',null,now,now);

  // ── PRIYA SHARMA — personal vault (US) ──
  iPCI.run(uid(),indUser2,indOrg2,'Passport Renewal','documents_ids','US passport renewal','2026-09-15',null,null,'pending','yellow',null,null,null,now,now);
  iPCI.run(uid(),indUser2,indOrg2,'IRS Form 1040 Deadline','tax_filing','Annual federal return','2026-04-15',null,null,'pending','red',null,null,null,now,now);
  iPCI.run(uid(),indUser2,indOrg2,'Life Insurance Annual','insurance','Annual life insurance premium','2026-06-01','FREQ=YEARLY','Annually','pending','green',null,null,null,now,now);
  iPCI.run(uid(),indUser2,indOrg2,'401k Contribution Deadline','financial','Maximize 401k contribution','2026-03-01',null,null,'completed','green',null,null,'2026-02-28',now,now);

  // ══════════════════════════════════════════════════════════════════
  // SERVICE MASTER SEED DATA
  // ══════════════════════════════════════════════════════════════════
  seedServiceMaster(db, uid, now, platformAdminId);

  console.log('Multi-tenant database seeded successfully with 3 firms + 2 individuals + vault data + service master!');
}

function seedServiceMaster(db: any, uid: () => string, now: string, adminId: string) {
  // Check if already seeded
  try {
    const count = db.prepare('SELECT COUNT(*) as c FROM sm_countries').get() as any;
    if (count && count.c > 0) return;
  } catch { return; }

  // ── COUNTRIES ──────────────────────────────────────────────────
  const ca = uid(), ind = uid(), us = uid(), uk = uid();
  const iC = db.prepare(`INSERT INTO sm_countries (id,name,iso_code,financial_year_end_default,fy_is_fixed,is_active,sort_order,created_at) VALUES (?,?,?,?,?,1,?,?)`);
  iC.run(ca,'Canada','CA',null,0,1,now);
  iC.run(ind,'India','IN','03-31',1,2,now);
  iC.run(us,'United States','US',null,0,3,now);
  iC.run(uk,'United Kingdom','GB','04-05',1,4,now);

  // ── STATES ─────────────────────────────────────────────────────
  const on = uid(), bc = uid(), ab = uid(), qc = uid(), sk = uid(), mb = uid();
  const kl = uid(), mh = uid(), dl = uid();
  const ny = uid(), cal = uid();
  const iS = db.prepare(`INSERT INTO sm_states (id,country_id,name,code,is_active,sort_order,created_at) VALUES (?,?,?,?,1,?,?)`);
  iS.run(on,ca,'Ontario','ON',1,now);
  iS.run(bc,ca,'British Columbia','BC',2,now);
  iS.run(ab,ca,'Alberta','AB',3,now);
  iS.run(qc,ca,'Quebec','QC',4,now);
  iS.run(sk,ca,'Saskatchewan','SK',5,now);
  iS.run(mb,ca,'Manitoba','MB',6,now);
  iS.run(kl,ind,'Kerala','KL',1,now);
  iS.run(mh,ind,'Maharashtra','MH',2,now);
  iS.run(dl,ind,'Delhi','DL',3,now);
  iS.run(ny,us,'New York','NY',1,now);
  iS.run(cal,us,'California','CA',2,now);

  // ── ENTITY TYPES ───────────────────────────────────────────────
  const etCorp = uid(), etPart = uid(), etTrust = uid(), etIndiv = uid(), etLLP = uid(), etSole = uid();
  const iET = db.prepare(`INSERT INTO sm_entity_types (id,name,description,is_active,sort_order,created_at) VALUES (?,?,?,1,?,?)`);
  iET.run(etCorp,'Corporation','A federally or provincially incorporated company',1,now);
  iET.run(etPart,'Partnership','A business partnership between two or more parties',2,now);
  iET.run(etTrust,'Trust','A legal arrangement for holding assets',3,now);
  iET.run(etIndiv,'Individual','A natural person',4,now);
  iET.run(etLLP,'LLP','Limited Liability Partnership',5,now);
  iET.run(etSole,'Sole Proprietorship','An unincorporated business owned by one person',6,now);

  // ── DEPARTMENTS ────────────────────────────────────────────────
  const dInc = uid(), dMun = uid(), dDrv = uid(), dMCA = uid(), dCS = uid(), dIT = uid();
  const iD = db.prepare(`INSERT INTO sm_departments (id,name,description,is_active,sort_order,created_at) VALUES (?,?,?,1,?,?)`);
  iD.run(dInc,'Income Tax','Government tax authority',1,now);
  iD.run(dMun,'Municipality','Municipal/local government',2,now);
  iD.run(dDrv,'Driving Authority','Vehicle licensing authority',3,now);
  iD.run(dMCA,'Ministry of Corporate Affairs','Corporate registration and compliance',4,now);
  iD.run(dCS,'Company Secretariate','Company secretary requirements',5,now);
  iD.run(dIT,'Indirect Tax','GST/HST/Sales tax authority',6,now);

  // ── COMPLIANCE HEADS ───────────────────────────────────────────
  const chCT = uid(), chSec = uid(), chIndT = uid(), chPay = uid(), chAudit = uid(), chAdv = uid(), chLit = uid();
  const iCH = db.prepare(`INSERT INTO sm_compliance_heads (id,name,short_name,description,icon,color_code,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?,?)`);
  iCH.run(chCT,'Corporate Tax','CT','All corporate income tax related compliances','💰','#dc2626',1,now,now);
  iCH.run(chSec,'Secretarial Compliances','SC','Corporate registration and annual filings','🏛️','#7c3aed',2,now,now);
  iCH.run(chIndT,'Indirect Tax','IT','GST/HST and provincial sales tax','📊','#2563eb',3,now,now);
  iCH.run(chPay,'Payroll','PY','Employee payroll tax and deductions','💼','#059669',4,now,now);
  iCH.run(chAudit,'Audit Report','AR','Statutory and voluntary audits','📋','#d97706',5,now,now);
  iCH.run(chAdv,'Advisory','AD','Advisory and consulting services','💡','#8b5cf6',6,now,now);
  iCH.run(chLit,'Litigation','LT','Legal and litigation matters','⚖️','#ef4444',7,now,now);

  // ── SUB-COMPLIANCES ────────────────────────────────────────────
  const scCorpTax = uid(), scT1134 = uid(), scT1135 = uid();
  const scFedAnn = uid(), scOntAnn = uid(), scBCAnn = uid();
  const scGSTAnn = uid(), scGSTQtr = uid(), scGSTMon = uid();
  const scQST = uid(), scSKPST = uid(), scBCPST = uid(), scMBPST = uid();
  const scImpExp = uid();
  const scPayroll = uid();
  const scAdvisory = uid(), scLitigation = uid(), scHealthChk = uid();

  const iSC = db.prepare(`INSERT INTO sm_sub_compliances (id,compliance_head_id,name,short_name,description,brief,has_compliance_date,dependency_type,dependency_label,period_type,period_value,grace_value,grace_unit,is_compulsory,undertaking_required,undertaking_text,is_active,sort_order,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?)`);

  iSC.run(scCorpTax,chCT,'Corporation Tax Return (Direct Tax)','T2 Corp Tax','Annual corporate income tax return filing',
    'Company will be required to file an Income Tax Return within six months of the end of its fiscal year. In this regard, ITA will assist QM in: Computation of income tax and determination of balance tax liability/refund due, if any. Review, whether QM has paid adequate advance tax in quarterly instalments. Determination of interest, if any payable to the CRA. Preparation of the corporate Income-tax return. Filing of the corporate Income-tax return.',
    1,'financial_year_corporate_tax','Financial Year End (Corporate Tax)','yearly',1,6,'months',1,1,'I confirm that all information provided is accurate and complete.',1,adminId,now,now);

  iSC.run(scT1134,chCT,'T1134 Foreign Affiliates','T1134','Foreign affiliate information return',
    'Required if the corporation has foreign affiliates. Must be filed within 6 months of the fiscal year end.',
    1,'financial_year_corporate_tax','Financial Year End (Corporate Tax)','yearly',1,6,'months',0,1,'I confirm that all information provided is accurate and complete.',2,adminId,now,now);

  iSC.run(scT1135,chCT,'T1135 Foreign Income Verification','T1135','Foreign income verification statement',
    'Required if the corporation holds foreign property with a cost of more than $100,000 CAD.',
    1,'financial_year_corporate_tax','Financial Year End (Corporate Tax)','yearly',1,6,'months',0,1,'I confirm that all information provided is accurate and complete.',3,adminId,now,now);

  iSC.run(scFedAnn,chSec,'Corporation Federal Annual Return','Federal Annual','Annual filing with Corporations Canada',
    'After incorporation you will be required by the Corporations Canada to maintain the following documents, which can be reviewed by the authorities, to ensure compliance: Issuance of shares, Appointing any officers, Appointing any additional Directors. We can help you maintain these documents and remain compliant.',
    1,'incorporation_date_federal','Incorporation Date (Federal)','yearly',1,60,'days',1,1,'I confirm that all information provided is accurate and complete.',1,adminId,now,now);

  iSC.run(scOntAnn,chSec,'Corporation Ontario Annual Return','Ontario Annual','Annual return for Ontario corporations',
    'After incorporation you will be required by the Corporations Canada to maintain the following documents, which can be reviewed by the authorities, to ensure compliance: Issuance of shares, Appointing any officers, Appointing any additional Directors. We can help you maintain these documents and remain compliant.',
    1,'calendar_year_fixed','Calendar Year (Fixed)','yearly',1,0,'days',0,1,'I confirm that all information provided is accurate and complete.',2,adminId,now,now);

  iSC.run(scBCAnn,chSec,'Corporation British Columbia Annual Return','BC Annual','Annual return for BC corporations',
    'After incorporation you will be required by the Corporations Canada to maintain the following documents: Issuance of shares, Appointing any officers, Appointing any additional Directors. We can help you maintain these documents and remain compliant.',
    1,'incorporation_date_provincial','Incorporation Date (British Columbia)','yearly',1,30,'days',0,1,'I confirm that all information provided is accurate and complete.',3,adminId,now,now);

  iSC.run(scGSTAnn,chIndT,'GST/HST Return (Annual)','GST Annual','Annual GST/HST return',
    'GST/HST is governed by Excise Tax Act, which requires an entity to register for a GST/HST account and remit GST/HST collected. COMPANY will be required to file return annually.',
    1,'financial_year_gst','Financial Year End (GST)','yearly',1,1,'months',0,1,'I confirm that all information provided is accurate and complete.',1,adminId,now,now);

  iSC.run(scGSTQtr,chIndT,'GST/HST Return (Quarterly)','GST Quarterly','Quarterly GST/HST return',
    'GST/HST is governed by Excise Tax Act, which requires an entity to register for a GST/HST account and remit GST/HST collected. COMPANY will be required to file return quarterly.',
    1,'financial_year_gst','Financial Year End (GST)','quarterly',1,1,'months',0,1,'I confirm that all information provided is accurate and complete.',2,adminId,now,now);

  iSC.run(scGSTMon,chIndT,'GST/HST Return (Monthly)','GST Monthly','Monthly GST/HST return',
    'GST/HST is governed by Excise Tax Act, which requires an entity to register for a GST/HST account and remit GST/HST collected. COMPANY will be required to file return monthly.',
    1,'financial_year_gst','Financial Year End (GST)','monthly',1,1,'months',0,1,'I confirm that all information provided is accurate and complete.',3,adminId,now,now);

  iSC.run(scQST,chIndT,'Quebec Sales Tax','QST','Quebec provincial sales tax return',null,
    1,'financial_year_gst','Financial Year End (GST)','quarterly',1,1,'months',0,0,null,4,adminId,now,now);

  iSC.run(scSKPST,chIndT,'Saskatchewan PST','SK PST','Saskatchewan provincial sales tax',null,
    1,'financial_year_gst','Financial Year End (GST)','monthly',1,15,'days',0,0,null,5,adminId,now,now);

  iSC.run(scBCPST,chIndT,'British Columbia PST','BC PST','BC provincial sales tax',null,
    1,'financial_year_gst','Financial Year End (GST)','quarterly',1,1,'months',0,0,null,6,adminId,now,now);

  iSC.run(scMBPST,chIndT,'Manitoba Provincial Sales Tax (PST)','MB PST','Manitoba provincial sales tax',null,
    1,'financial_year_gst','Financial Year End (GST)','monthly',1,15,'days',0,0,null,7,adminId,now,now);

  iSC.run(scImpExp,chIndT,'Import Export License','Imp/Exp','Import export license renewal',null,
    1,'specific_event','License Issue Date','renewal',5,0,'days',0,0,null,8,adminId,now,now);

  iSC.run(scPayroll,chPay,'Payroll','Payroll','Monthly payroll tax withholding and remittance',
    'COMPANY will be required to withhold income tax and payroll taxes, such as CPP & EI, and to remit the withheld amount to CRA monthly, quarterly, or annually depending on the amount of withholding. ITA would assist COMPANY in determination of the amounts to be withheld and also in the preparation and finalization of such returns.',
    1,'financial_year_payroll','Financial Year End (Payroll)','monthly',1,15,'days',0,1,'I confirm that all information provided is accurate and complete.',1,adminId,now,now);

  iSC.run(scAdvisory,chAdv,'Advisory','Advisory','General advisory services',null,
    0,'none',null,null,0,0,null,0,0,null,1,adminId,now,now);

  iSC.run(scLitigation,chLit,'Litigation','Litigation','Legal litigation support',null,
    0,'none',null,null,0,0,null,0,0,null,1,adminId,now,now);

  iSC.run(scHealthChk,chAdv,'Health Check','Health Check','Compliance health check review',null,
    0,'none',null,null,0,0,null,0,0,null,2,adminId,now,now);

  // ── SERVICE RULES (map to Canada/Ontario/Corporation) ──────────
  const iSR = db.prepare(`INSERT INTO sm_service_rules (id,sub_compliance_id,country_id,state_id,entity_type_id,department_id,is_active,created_at) VALUES (?,?,?,?,?,?,1,?)`);

  // Corp Tax — Canada, all states, Corporation, Income Tax
  const srCorpTax = uid(); iSR.run(srCorpTax,scCorpTax,ca,null,etCorp,dInc,now);
  iSR.run(uid(),scT1134,ca,null,etCorp,dInc,now);
  iSR.run(uid(),scT1135,ca,null,etCorp,dInc,now);

  // Secretarial —Federal annual = Canada, all states, Corporation, MCA
  const srFedAnn = uid(); iSR.run(srFedAnn,scFedAnn,ca,null,etCorp,dMCA,now);
  const srOntAnn = uid(); iSR.run(srOntAnn,scOntAnn,ca,on,etCorp,dMCA,now);
  const srBCAnn = uid(); iSR.run(srBCAnn,scBCAnn,ca,bc,etCorp,dMCA,now);

  // GST/HST — Canada, all states, Corporation, Indirect Tax
  const srGSTAnn = uid(); iSR.run(srGSTAnn,scGSTAnn,ca,null,etCorp,dIT,now);
  const srGSTQtr = uid(); iSR.run(srGSTQtr,scGSTQtr,ca,null,etCorp,dIT,now);
  const srGSTMon = uid(); iSR.run(srGSTMon,scGSTMon,ca,null,etCorp,dIT,now);

  // Provincial taxes — specific states
  iSR.run(uid(),scQST,ca,qc,etCorp,dIT,now);
  iSR.run(uid(),scSKPST,ca,sk,etCorp,dIT,now);
  iSR.run(uid(),scBCPST,ca,bc,etCorp,dIT,now);
  iSR.run(uid(),scMBPST,ca,mb,etCorp,dIT,now);

  // Import Export — Canada, all states
  iSR.run(uid(),scImpExp,ca,null,etCorp,dIT,now);

  // Payroll — Canada, all states, Corporation
  const srPayroll = uid(); iSR.run(srPayroll,scPayroll,ca,null,etCorp,dInc,now);

  // Advisory/Litigation — all countries
  iSR.run(uid(),scAdvisory,null,null,null,null,now);
  iSR.run(uid(),scLitigation,null,null,null,null,now);
  iSR.run(uid(),scHealthChk,null,null,null,null,now);

  // ── APPLICABILITY QUESTIONS (Step 12) ─────────────────────────
  const iQ = db.prepare(`INSERT INTO sm_questions (id,sub_compliance_id,question_text,question_type,description,is_compulsory_trigger,trigger_value,triggers_sub_compliance_id,threshold_context,parent_question_id,options,sort_order,is_active,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,?)`);

  // Ontario Annual — provincial registration question
  const qOntReg = uid();
  iQ.run(qOntReg,scOntAnn,'Are you having Ontario Provincial Registration?','yes_no','Select Yes if your corporation is registered in Ontario',1,'yes',null,null,null,'["yes","no"]',1,now);

  // BC Annual
  const qBCReg = uid();
  iQ.run(qBCReg,scBCAnn,'Are you having British Columbia Provincial Registration?','yes_no','Select Yes if your corporation is registered in British Columbia',1,'yes',null,null,null,'["yes","no"]',2,now);

  // GST/HST — cascading questions
  const qGSTReg = uid();
  iQ.run(qGSTReg,scGSTAnn,'Is the company having GST Registration?','yes_no','Select Yes if you have a CRA GST/HST registration number',1,'yes',null,null,null,'["yes","no"]',3,now);

  const qGST30k = uid();
  iQ.run(qGST30k,scGSTAnn,'Is company taxable turnover >$30,000 CAD?','yes_no','Annual revenue threshold for mandatory GST registration',1,'yes',scGSTAnn,'If turnover >$30,000 = Annual Return',qGSTReg,'["yes","no"]',4,now);

  const qGST15m = uid();
  iQ.run(qGST15m,scGSTQtr,'Is company taxable turnover >$1.5M CAD?','yes_no','Quarterly filing threshold',1,'yes',scGSTQtr,'If turnover >$1.5M = Quarterly Return',qGST30k,'["yes","no"]',5,now);

  const qGST6m = uid();
  iQ.run(qGST6m,scGSTMon,'Is company taxable turnover >$6M?','yes_no','Monthly filing threshold',1,'yes',scGSTMon,'If turnover >$6M = Monthly Return',qGST15m,'["yes","no"]',6,now);

  // Payroll — cascading questions
  const qPayReg = uid();
  iQ.run(qPayReg,scPayroll,'Is the company having Payroll Registration?','yes_no','Select Yes if you have a CRA payroll account',1,'yes',null,null,null,'["yes","no"]',7,now);

  const qPaySalary = uid();
  iQ.run(qPaySalary,scPayroll,'Is the company paying a salary to an individual?','yes_no','Select Yes if you employ and pay anyone',1,'yes',null,null,qPayReg,'["yes","no"]',8,now);

  // ── INFO FIELDS (Step 10 — requisition forms) ─────────────────
  const iIF = db.prepare(`INSERT INTO sm_info_fields (id,sub_compliance_id,field_label,field_type,is_required,placeholder,help_text,sort_order,is_active,created_at) VALUES (?,?,?,?,?,?,?,?,1,?)`);

  // Corp Tax Return info fields
  iIF.run(uid(),scCorpTax,'Attach the Previous Year\'s Return','attachment',0,null,'Option to attach last year\'s filed return',1,now);
  iIF.run(uid(),scCorpTax,'If previous Year Written Not Available, Provide XYZ Information','textarea',0,'Describe any relevant information...','Provide details if prior return is unavailable',2,now);
  iIF.run(uid(),scCorpTax,'Add Financials','attachment',1,null,'Upload financial statements',3,now);
  iIF.run(uid(),scCorpTax,'Take Undertaking','undertaking',1,null,'I undertake that all information provided is accurate',4,now);

  // Federal Annual Return info fields
  iIF.run(uid(),scFedAnn,'Attach Board Meeting Minutes','attachment',1,null,'Upload board meeting minutes',1,now);
  iIF.run(uid(),scFedAnn,'Attach Financials','attachment',1,null,'Upload financial statements',2,now);
  iIF.run(uid(),scFedAnn,'Confirm following details \'XYZ\'','textarea',1,'Enter details...','Confirm key corporate details',3,now);
  iIF.run(uid(),scFedAnn,'Provide \'ABC\' Information','textarea',1,'Enter information...','Additional required information',4,now);
  iIF.run(uid(),scFedAnn,'Take Undertaking','undertaking',1,null,'I undertake that all information provided is accurate',5,now);

  // Ontario Annual Return info fields
  iIF.run(uid(),scOntAnn,'Attach Board Meeting Minutes','attachment',1,null,'Upload board meeting minutes',1,now);
  iIF.run(uid(),scOntAnn,'Attach Financials','attachment',1,null,'Upload financial statements',2,now);
  iIF.run(uid(),scOntAnn,'Confirm following details \'XYZ\'','textarea',1,'Enter details...','Confirm key corporate details',3,now);
  iIF.run(uid(),scOntAnn,'Provide \'ABC\' Information','textarea',1,'Enter information...','Additional required information',4,now);
  iIF.run(uid(),scOntAnn,'Take Undertaking','undertaking',1,null,'I undertake that all information provided is accurate',5,now);

  // BC Annual Return info fields
  iIF.run(uid(),scBCAnn,'Attach Board Meeting Minutes','attachment',1,null,'Upload board meeting minutes',1,now);
  iIF.run(uid(),scBCAnn,'Attach Financials','attachment',1,null,'Upload financial statements',2,now);
  iIF.run(uid(),scBCAnn,'Confirm following details','textarea',1,'Enter details...','Confirm key corporate details',3,now);
  iIF.run(uid(),scBCAnn,'Provide \'ABC\' Information','textarea',1,'Enter information...','Additional required information',4,now);
  iIF.run(uid(),scBCAnn,'Take Undertaking','undertaking',1,null,'I undertake that all information provided is accurate',5,now);

  // GST/HST info fields
  iIF.run(uid(),scGSTAnn,'Provide Sales Made in Canada','number',1,'Enter amount in CAD','Total domestic sales for the period',1,now);
  iIF.run(uid(),scGSTAnn,'Provide Sales made outside Canada','number',1,'Enter amount in CAD','Total export/foreign sales',2,now);
  iIF.run(uid(),scGSTAnn,'Provide Input Tax credit claimed','number',1,'Enter amount in CAD','Total ITC claimed',3,now);
  iIF.run(uid(),scGSTAnn,'Provide Tax Payable','number',1,'Enter amount in CAD','Net tax payable/refund',4,now);
  iIF.run(uid(),scGSTAnn,'Take Undertaking','undertaking',1,null,'I undertake that all information provided is accurate',5,now);

  // Payroll info fields
  iIF.run(uid(),scPayroll,'Provide Employee\'s Name','text',1,'Full legal name','Name of employee',1,now);
  iIF.run(uid(),scPayroll,'Salary Paid to the employee','number',1,'Enter amount in CAD','Gross salary amount',2,now);
  iIF.run(uid(),scPayroll,'Employee SIN Number','text',1,'XXX-XXX-XXX','Social Insurance Number',3,now);
  iIF.run(uid(),scPayroll,'Employee DOB','date',1,null,'Date of birth',4,now);
  iIF.run(uid(),scPayroll,'Take Undertaking','undertaking',1,null,'I undertake that all information provided is accurate',5,now);

  // ── PENALTIES (Step 13) ────────────────────────────────────────
  const iP = db.prepare(`INSERT INTO sm_penalties (id,sub_compliance_id,description,penalty_type,amount,rate,details,is_active,created_at) VALUES (?,?,?,?,?,?,?,1,?)`);
  iP.run(uid(),scCorpTax,'Late filing penalty','percentage',null,5,'5% of the balance owing, plus 1% for each complete month the return is late (max 12 months)',now);
  iP.run(uid(),scFedAnn,'Late filing penalty','fixed',200,null,'$200 penalty for late filing of annual return',now);
  iP.run(uid(),scGSTAnn,'Late filing penalty','percentage',null,1,'1% of the amount owing, plus 0.25% per month late (max 12 months)',now);
  iP.run(uid(),scPayroll,'Late remittance penalty','progressive',null,null,'3% if 1-3 days late, 5% if 4-5 days late, 7% if 6-7 days late, 10% if more than 7 days late',now);

  console.log('Service Master seeded with countries, states, entity types, departments, compliance heads, sub-compliances, rules, questions, info fields, penalties.');
}
