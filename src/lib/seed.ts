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

  const iOrg = db.prepare(`INSERT INTO organizations (id,name,slug,org_type,email,phone,address_line_1,city,province,postal_code,website,gst_number,plan,status,max_users,max_clients,onboarded_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  iOrg.run(org1Id,'Taxccount Professional Services','taxccount','consulting_firm','admin@taxccount.ca','416-555-0100','100 King Street West, Suite 5600','Toronto','Ontario','M5X 1C9','www.taxccount.ca','123456789RT0001','professional','active',20,100,now,now,now);
  iOrg.run(org2Id,'Singh & Associates CPA','singh-cpa','consulting_firm','admin@singhcpa.ca','780-555-2000','456 Jasper Ave','Edmonton','Alberta','T5J 1S9','www.singhcpa.ca','987654321RT0001','starter','active',10,50,now,now,now);
  iOrg.run(org3Id,'Côté Comptabilité Inc.','cote-cpa','consulting_firm','admin@cotecpa.ca','418-555-3000','200 Grande Allée','Quebec City','Quebec','G1R 2J1','www.cotecpa.ca','555666777RT0001','free','active',5,25,now,now,now);
  iOrg.run(indOrg1,'James Thompson Personal','james-thompson','individual','james.personal@email.com','905-555-0200',null,'Toronto','Ontario','M5V 2T6',null,null,'free','active',1,0,now,now,now);
  iOrg.run(indOrg2,'Priya Sharma Personal','priya-sharma','individual','priya.personal@email.com','416-555-4000',null,'Mississauga','Ontario','L5B 1M2',null,null,'free','active',1,0,now,now,now);

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

  // Firm 2 templates
  const s_tplT1 = uid(); const s_tplT2 = uid();
  iTpl.run(s_tplT1,org2Id,'T1 Personal Tax Return','T1','Individual personal income tax return','Personal Tax',450,'{}',singh_admin,now,now);
  iTpl.run(s_tplT2,org2Id,'T2 Corporate Tax Return','T2','Corporate income tax return','Corporate Tax',1300,'{}',singh_admin,now,now);

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
  const iCl = db.prepare(`INSERT INTO clients (id,org_id,client_code,display_name,client_type,status,primary_email,portal_user_id,created_by,created_at,updated_at) VALUES (?,?,?,?,?,'active',?,?,?,?,?)`);
  cData.forEach((c,i) => {
    const cid = uid();
    clients.push({id:cid,code:c[0] as string,name:c[1] as string,type:c[2] as string,idx:i});
    iCl.run(cid,org1Id,c[0],c[1],c[2],`client${i+1}@example.com`,c[3],adminId,now,now);
  });

  // Firm 2 clients
  const s_clients: {id:string;code:string;name:string}[] = [];
  [['SC-0001','Kumar Industries Ltd.','business',singh_cu1],['SC-0002','Patel Family Trust','trust',singh_cu2],['SC-0003','Edmonton Logistics Inc.','business',null]
  ].forEach((c,i) => {
    const cid = uid(); s_clients.push({id:cid,code:c[0] as string,name:c[1] as string});
    iCl.run(cid,org2Id,c[0],c[1],c[2],`sclient${i+1}@example.com`,c[3],singh_admin,now,now);
  });

  // Firm 3 clients
  [['CC-0001','Martin Tremblay','individual',cote_cu1],['CC-0002','Gagnon Construction','business',null]
  ].forEach(c => { const cid = uid(); iCl.run(cid,org3Id,c[0],c[1],c[2],`cclient@example.com`,c[3],cote_admin,now,now); });

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
  const iLead = db.prepare(`INSERT INTO leads (id,org_id,lead_code,first_name,last_name,company_name,email,phone,lead_type,source,pipeline_stage,lead_score,expected_value,status,assigned_to,tags,notes,city,province,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
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
  const iPCI = db.prepare(`INSERT INTO personal_compliance_items (id,user_id,org_id,title,category,description,due_date,recurrence_rule,recurrence_label,status,urgency,notes,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const iPFM = db.prepare(`INSERT INTO personal_family_members (id,user_id,org_id,name,relationship,date_of_birth,email,phone,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

  // James personal vault
  iPCI.run(uid(),indUser1,indOrg1,'Passport Renewal','documents_ids','Canadian passport expires','2026-08-15',null,null,'pending','yellow','Passport #AB123456',null,now,now);
  iPCI.run(uid(),indUser1,indOrg1,'T1 Personal Tax Filing 2025','tax_filing','File personal income tax','2026-04-30',null,null,'in_progress','red','Gathering T4 slips',null,now,now);
  iPCI.run(uid(),indUser1,indOrg1,'Home Insurance Renewal','insurance','Annual home insurance','2026-01-15','FREQ=YEARLY;BYMONTH=1','Renew January','completed','green',null,'2026-01-10',now,now);
  iPCI.run(uid(),indUser1,indOrg1,'Property Tax Q2','property','Quarterly property tax','2026-06-30','FREQ=QUARTERLY','Quarterly','pending','yellow',null,null,now,now);

  const jSpouse = uid(); const jChild = uid();
  iPFM.run(jSpouse,indUser1,indOrg1,'Sarah Thompson','spouse','1987-06-22','sarah.t@email.com','905-555-0201',null,now,now);
  iPFM.run(jChild,indUser1,indOrg1,'Aarav Thompson','child','2015-09-10',null,null,'Grade 5',now,now);

  // Priya personal vault
  iPCI.run(uid(),indUser2,indOrg2,'PR Card Renewal','documents_ids','Permanent Resident card renewal','2026-09-15',null,null,'pending','yellow',null,null,now,now);
  iPCI.run(uid(),indUser2,indOrg2,'T1 Tax Filing 2025','tax_filing','Personal tax return','2026-04-30',null,null,'pending','red',null,null,now,now);
  iPCI.run(uid(),indUser2,indOrg2,'Life Insurance Annual','insurance','Annual life insurance premium','2026-06-01','FREQ=YEARLY','Annually','pending','green',null,null,now,now);
  iPCI.run(uid(),indUser2,indOrg2,'RRSP Contribution Deadline','financial','Maximize RRSP contribution','2026-03-01',null,null,'completed','green',null,'2026-02-28',now,now);

  console.log('Multi-tenant database seeded successfully with 3 firms + 2 individuals!');
}
