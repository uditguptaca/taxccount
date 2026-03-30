import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { batchProcessOcr } from '@/lib/ocr';
import { batchClassifyDocuments } from '@/lib/classifier';

export const dynamic = 'force-dynamic';

/**
 * CRON endpoint to batch process OCR and document classification
 * Protected by CRON_SECRET or admin role
 */
export async function GET(request: Request) {
  try {
    // Auth: require either CRON secret or admin role
    const expectedSecret = process.env.CRON_SECRET || 'dev_cron_secret';
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${expectedSecret}`) {
      const cookieStore = await cookies();
      const role = cookieStore.get('auth_role')?.value;
      if (role !== 'super_admin' && role !== 'admin') {
        const { searchParams } = new URL(request.url);
        if (searchParams.get('test_cron') !== 'true') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
    }

    // Run OCR batch
    const ocrResult = batchProcessOcr(50);

    // Run auto-classification batch
    const classifyResult = batchClassifyDocuments(100);

    return NextResponse.json({
      success: true,
      ocr: ocrResult,
      classification: classifyResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('OCR/Classification batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
