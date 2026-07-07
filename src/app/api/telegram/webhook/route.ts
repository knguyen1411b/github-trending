import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import {
  sendTelegramMessage,
  formatTelegramDigest,
  broadcastDigestToSubscribers,
} from '@/lib/telegram';
import { fetchTrendingRepos } from '@/lib/scraper';
import { summarizeRepoWithAI } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (!update.message || !update.message.chat) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = String(message.chat.id);
    const chatType = message.chat.type; // 'private', 'group', 'supergroup', 'channel'
    const chatTitle = message.chat.title || message.chat.first_name || 'Subscriber';
    const text = (message.text || '').trim();

    await connectToDatabase();

    // Command: /digest or /scrape (Chủ động cào & phát sóng)
    if (text.startsWith('/digest') || text.startsWith('/scrape')) {
      await sendTelegramMessage(
        chatId,
        `🚀 <i>Đang kích hoạt cào dữ liệu GitHub Trending mới nhất và phát sóng bản tin AI đến tất cả người dùng... Vui lòng đợi!</i>`
      );

      const result = await broadcastDigestToSubscribers();
      if (result.success) {
        await sendTelegramMessage(
          chatId,
          `✅ <b>ĐÃ PHÁT SÓNG THÀNH CÔNG!</b>\n📊 Số người nhận: <b>${result.count}</b>`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Lỗi phát sóng:</b> ${result.error || 'Không xác định'}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Command: /start or /subscribe [language]
    if (text.startsWith('/start') || text.startsWith('/subscribe')) {
      const parts = text.split(/\s+/);
      const targetLang = parts.length > 1 ? parts[1].toLowerCase().trim() : null;

      let sub = await Subscriber.findOne({ chatId });
      const currentLangs = sub?.languages || [];

      if (targetLang) {
        if (!currentLangs.includes(targetLang)) {
          currentLangs.push(targetLang);
        }
      }

      sub = await Subscriber.findOneAndUpdate(
        { chatId },
        {
          chatId,
          type: chatType,
          title: chatTitle,
          username: message.chat.username,
          languages: currentLangs,
          isActive: true,
          subscribedAt: new Date(),
        },
        { upsert: true, returnDocument: 'after' }
      );

      let welcomeMsg = `🎉 <b>CHÀO MỪNG BẠN ĐẾN VỚI GITHUB TRENDING AI DIGEST!</b>\n\n`;
      if (targetLang) {
        welcomeMsg += `✅ Đã thêm ngôn ngữ <code>${targetLang}</code> vào danh sách theo dõi của bạn!\n\n`;
      } else {
        welcomeMsg += `✅ Đăng ký thành công cho Chat ID: <code>${chatId}</code> (${chatTitle})\n\n`;
      }

      const langsText =
        sub && sub.languages && sub.languages.length > 0
          ? sub.languages.map((l: string) => `• <code>${l}</code>`).join('\n')
          : '• <i>Tất cả ngôn ngữ (Mặc định)</i>';

      welcomeMsg +=
        `📋 <b>Chủ đề đang theo dõi:</b>\n${langsText}\n\n` +
        `💡 <b>Các lệnh hỗ trợ:</b>\n` +
        `• <code>/subscribe python</code> - Theo dõi chủ đề Python\n` +
        `• <code>/topics</code> - Xem các chủ đề đang đăng ký\n` +
        `• <code>/trending</code> - Lấy ngay Top Repo hot theo chủ đề\n` +
        `• <code>/digest</code> - Chủ động cào & phát sóng bản tin mới nhất\n` +
        `• <code>/unsubscribe</code> - Hủy nhận thông báo`;

      await sendTelegramMessage(chatId, welcomeMsg);
      return NextResponse.json({ ok: true });
    }

    // Command: /topics
    if (text.startsWith('/topics')) {
      const sub = await Subscriber.findOne({ chatId });
      const activeLangs =
        sub?.languages && sub.languages.length > 0
          ? sub.languages.map((l: string) => `• <code>${l}</code>`).join('\n')
          : '• <i>Tất cả ngôn ngữ (Chưa lọc riêng)</i>';

      const topicsMsg =
        `🏷️ <b>DANH SÁCH CHỦ ĐỀ / NGÔN NGỮ ĐÃ ĐĂNG KÝ:</b>\n\n${activeLangs}\n\n` +
        `💡 <b>Cách quản lý chủ đề:</b>\n` +
        `• <code>/subscribe python</code> - Đăng ký nhận tin Python\n` +
        `• <code>/subscribe rust</code> - Đăng ký nhận tin Rust\n` +
        `• <code>/subscribe typescript</code> - Đăng ký nhận tin TypeScript\n` +
        `• <code>/unsubscribe python</code> - Bỏ đăng ký chủ đề Python\n` +
        `• <code>/unsubscribe</code> - Tắt nhận thông báo hoàn toàn`;

      await sendTelegramMessage(chatId, topicsMsg);
      return NextResponse.json({ ok: true });
    }

    // Command: /unsubscribe [language]
    if (text.startsWith('/unsubscribe')) {
      const parts = text.split(/\s+/);
      const targetLang = parts.length > 1 ? parts[1].toLowerCase().trim() : null;

      const sub = await Subscriber.findOne({ chatId });
      if (targetLang && sub && sub.languages) {
        const nextLangs = sub.languages.filter((l: string) => l !== targetLang);
        await Subscriber.findOneAndUpdate(
          { chatId },
          { languages: nextLangs },
          { returnDocument: 'after' }
        );
        await sendTelegramMessage(
          chatId,
          `🗑️ Đã xóa ngôn ngữ <code>${targetLang}</code> khỏi danh sách nhận tin.`
        );
      } else {
        await Subscriber.findOneAndUpdate(
          { chatId },
          { isActive: false },
          { returnDocument: 'after' }
        );
        await sendTelegramMessage(
          chatId,
          `❌ Đã hủy đăng ký nhận bản tin tự động cho <code>${chatTitle}</code>.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Command: /trending
    if (text.startsWith('/trending') || text.startsWith('/hot')) {
      const parts = text.split(/\s+/);
      const cmdLang = parts.length > 1 ? parts[1].toLowerCase().trim() : '';

      const sub = await Subscriber.findOne({ chatId });
      const userLangs = sub?.languages || [];
      const targetLang = cmdLang || (userLangs.length > 0 ? userLangs[0] : '');

      await sendTelegramMessage(
        chatId,
        `🔍 <i>Đang cào dữ liệu GitHub Trending (${targetLang || 'Tất cả'}) và nhờ AI Gemini 2.5 Flash tóm tắt... Vui lòng đợi trong giây lát!</i>`
      );

      const repos = await fetchTrendingRepos(targetLang, 'daily');
      const topRepos = repos.slice(0, 3);

      const processed = [];
      for (const r of topRepos) {
        const aiSummary = await summarizeRepoWithAI(
          r.author,
          r.name,
          r.description,
          r.language,
          r.stars
        );
        processed.push({ ...r, aiSummary });
      }

      const dateToday = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const htmlMsg = formatTelegramDigest(processed, dateToday);
      await sendTelegramMessage(chatId, htmlMsg);
      return NextResponse.json({ ok: true });
    }

    // Command: /help
    if (text.startsWith('/help')) {
      const helpMsg =
        `🤖 <b>HƯỚNG DẪN SỬ DỤNG GITHUB TRENDING BOT</b>\n\n` +
        `• <code>/subscribe python</code> - Đăng ký nhận tin chủ đề Python.\n` +
        `• <code>/topics</code> - Danh sách chủ đề đang đăng ký.\n` +
        `• <code>/trending</code> - Lấy ngay Top Repo hot trong ngày kèm tóm tắt AI.\n` +
        `• <code>/digest</code> - Chủ động cào & phát sóng bản tin tự động đến tất cả người dùng.\n` +
        `• <code>/unsubscribe python</code> - Xóa ngôn ngữ Python.\n` +
        `• <code>/unsubscribe</code> - Hủy nhận bản tin hoàn toàn.`;
      await sendTelegramMessage(chatId, helpMsg);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('Telegram Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
