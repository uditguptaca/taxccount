import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear cookies used by middleware
    response.cookies.delete('auth_role');
    response.cookies.delete('auth_user_id');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
