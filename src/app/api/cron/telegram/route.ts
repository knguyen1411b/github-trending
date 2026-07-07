import { NextRequest, NextResponse } from 'next/server';
import { broadcastDigestToSubscribers } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
    const isParamValid = secretParam === cronSecret;

    if (!isHeaderValid && !isParamValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid secret key.' },
        { status: 401 }
      );
    }
  }

  try {
    const result = await broadcastDigestToSubscribers();
    return NextResponse.json({
      success: result.success,
      subscribersNotified: result.count,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API /api/cron/telegram error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
