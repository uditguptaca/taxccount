import { NextResponse } from 'next/server';
import { batchProcessOcr } from '@/lib/ocr';
import { batchClassifyDocuments } from '@/lib/classifier';
import { cronAuthorized } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

/**
 * CRON endpoint to batch process OCR and document classification
 * Protected by CRON_SECRET or a signed-in platform admin
 */
export async function GET(request: Request) {
  try {
if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Run OCR batch
    const ocrResult = await batchProcessOcr(50);

    // Run auto-classification batch
    const classifyResult = await batchClassifyDocuments(100);

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
