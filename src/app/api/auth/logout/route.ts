import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear JWT session cookie
    response.cookies.delete('auth_session');
    // Clear legacy cookies
    response.cookies.delete('auth_role');
    response.cookies.delete('auth_user_id');
    response.cookies.delete('auth_org_id');
    response.cookies.delete('auth_org_type');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
