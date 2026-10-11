import { NextResponse } from 'next/server';
import { runRecurringJobs } from '@/lib/cron';
import { cronAuthorized } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
if (!cronAuthorized(request)) return new Response('Unauthorized', { status: 401 });

    const result = await runRecurringJobs();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
