import { NextResponse } from 'next/server';
import { runDailyCron } from '@/lib/cron';

export async function GET(request: Request) {
  try {
// In production, you would set CRON_SECRET in your Vercel/environment variables
    // and configure your external cron service to pass it as a Bearer token.
    const expectedSecret = process.env.CRON_SECRET || 'dev_cron_secret';
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${expectedSecret}`) {
      // In a real app we respond with 401, but for MVP local testing we might allow bypass via query param
      const { searchParams } = new URL(request.url);
      if (searchParams.get('test_cron') !== 'true') {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const result = await runDailyCron();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
