import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url') || process.env.NEXT_PUBLIC_APP_URL;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Thiếu TELEGRAM_BOT_TOKEN trong environment variables.' },
      { status: 400 }
    );
  }

  if (!targetUrl) {
    return NextResponse.json(
      {
        success: false,
        error: 'Thiếu URL domain Vercel. Vui lòng truyền ?url=https://your-domain.vercel.app',
      },
      { status: 400 }
    );
  }

  const webhookUrl = `${targetUrl.replace(/\/$/, '')}/api/telegram/webhook`;

  try {
    const response = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
      url: webhookUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Đã kết nối Webhook Telegram thành công với URL: ${webhookUrl}`,
      telegramResponse: response.data,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Lỗi kết nối Webhook: ${errMsg}` },
      { status: 500 }
    );
  }
}
