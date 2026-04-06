import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    seedDatabase();
    const { email, password, first_name, last_name, type, firm_name } = await request.json();
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

    const hash = bcryptjs.hashSync(password, 10);
    const userId = uuidv4();
    const orgId = uuidv4();
    const now = new Date().toISOString();
    const slug = (type === 'firm' ? (firm_name || email.split('@')[0]) : `${first_name}-${last_name}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'');

    // Check slug uniqueness
    const existingSlug = db.prepare('SELECT id FROM organizations WHERE slug = ?').get(slug);
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

    if (type === 'firm') {
      // Create consulting firm org + firm_admin user
      db.prepare(`INSERT INTO organizations (id,name,slug,org_type,email,plan,status,onboarded_at,created_at,updated_at) VALUES (?,?,?,'consulting_firm',?,'free','active',?,?,?)`).run(orgId, firm_name || `${first_name}'s Firm`, finalSlug, email, now, now, now);
      db.prepare(`INSERT INTO users (id,email,password_hash,first_name,last_name,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,'firm_admin',1,?,?)`).run(userId, email, hash, first_name, last_name, now, now);
      db.prepare(`INSERT INTO organization_memberships (id,org_id,user_id,role,status,joined_at) VALUES (?,?,?,'firm_admin','active',?)`).run(uuidv4(), orgId, userId, now);
      // Seed default client types
      ['Individual','Business','Trust','Sole Proprietor'].forEach(t => db.prepare(`INSERT INTO client_types_config (id,org_id,name,is_system) VALUES (?,?,?,1)`).run(uuidv4(), orgId, t));
    } else {
      // Create individual org + individual user
      db.prepare(`INSERT INTO organizations (id,name,slug,org_type,email,plan,status,max_users,max_clients,onboarded_at,created_at,updated_at) VALUES (?,?,?,'individual',?,'free','active',1,0,?,?,?)`).run(orgId, `${first_name} ${last_name} Personal`, finalSlug, email, now, now, now);
      db.prepare(`INSERT INTO users (id,email,password_hash,first_name,last_name,role,is_active,personal_org_id,created_at,updated_at) VALUES (?,?,?,?,?,'individual',1,?,?,?)`).run(userId, email, hash, first_name, last_name, orgId, now, now);
    }

    const role = type === 'firm' ? 'firm_admin' : 'individual';
    const orgName = type === 'firm' ? (firm_name || `${first_name}'s Firm`) : `${first_name} ${last_name} Personal`;

    const response = NextResponse.json({ user: { id: userId, email, first_name, last_name, role, org_id: orgId, org_name: orgName, org_type: type === 'firm' ? 'consulting_firm' : 'individual' } });
    response.cookies.set('auth_role', role, { path: '/', httpOnly: true, secure: true, maxAge: 60*60*24*7 });
    response.cookies.set('auth_user_id', userId, { path: '/', httpOnly: true, secure: true, maxAge: 60*60*24*7 });
    response.cookies.set('auth_org_id', orgId, { path: '/', httpOnly: true, secure: true, maxAge: 60*60*24*7 });
    response.cookies.set('auth_org_type', type === 'firm' ? 'consulting_firm' : 'individual', { path: '/', httpOnly: true, secure: true, maxAge: 60*60*24*7 });
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
