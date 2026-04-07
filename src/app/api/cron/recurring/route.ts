import { NextResponse } from 'next/server';
import { runRecurringJobs } from '@/lib/cron';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
const expectedSecret = process.env.CRON_SECRET || 'dev_cron_secret';
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${expectedSecret}`) {
      const { searchParams } = new URL(request.url);
      if (searchParams.get('test_cron') !== 'true') {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const result = await runRecurringJobs();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
