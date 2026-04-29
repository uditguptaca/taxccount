import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogOptions {
  orgId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  clientId?: string;
  details?: string;
}

/**
 * Logs an activity to the organizational activity feed.
 */
export async function logActivity(options: AuditLogOptions) {
  try {
    const db = getDb();
    const id = uuidv4();
    
    await db.prepare(`
      INSERT INTO activity_feed (
        id, org_id, actor_id, action, 
        entity_type, entity_id, entity_name, 
        client_id, details, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `).run(
      id,
      options.orgId,
      options.actorId,
      options.action,
      options.entityType,
      options.entityId,
      options.entityName,
      options.clientId || null,
      options.details || null
    );
    
    console.log(`[AUDIT] Logged ${options.action} for Org ${options.orgId}`);
  } catch (error) {
    console.error('[AUDIT] Failed to log activity:', error);
  }
}
