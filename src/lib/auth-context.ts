import { cookies } from 'next/headers';

export function getSessionContext() {
  const cookieStore = cookies();
  const userId = cookieStore.get('auth_user_id')?.value;
  const role = cookieStore.get('auth_role')?.value;
  const orgId = cookieStore.get('auth_org_id')?.value;
  const orgType = cookieStore.get('auth_org_type')?.value;

  if (!userId || !role) {
    return null;
  }

  return {
    userId,
    role,
    orgId,
    orgType,
    isPlatformAdmin: role === 'platform_admin',
    isFirmAdmin: role === 'firm_admin',
    isIndividual: role === 'individual',
    isClient: role === 'client'
  };
}
