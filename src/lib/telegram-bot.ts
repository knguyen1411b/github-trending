import TelegramBot from 'node-telegram-bot-api';
import { connectToDatabase } from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import { fetchTrendingRepos } from '@/lib/scraper';
import { summarizeRepoWithAI } from '@/lib/ai';
import { formatTelegramDigest, broadcastDigestToSubscribers } from '@/lib/telegram';

declare global {
  var telegramBotInstance: TelegramBot | undefined;
}

export function initTelegramBot() {
  // On Serverless platforms like Vercel, long-polling cannot run in background.
  // Webhooks are used instead via /api/telegram/webhook
  if (process.env.VERCEL === '1') {
    return null;
  }

  // Prevent duplicate initialization during HMR / Next.js hot reloads in dev mode
  if (global.telegramBotInstance) {
    return global.telegramBotInstance;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN chưa được cấu hình trong .env.local!');
    return null;
  }

  try {
    const bot = new TelegramBot(token, { polling: true });
    global.telegramBotInstance = bot;

    // Clear any leftover Webhook on Telegram servers so polling gets all updates immediately
    bot.deleteWebHook().catch(() => {});

    console.log(
      '🚀 [Next.js Instrumentation] Telegram Bot đã được tự động kết nối & sẵn sàng nhận lệnh (@my_gh_trending_ai_bot)!'
    );

    const sendOptions = {
      parse_mode: 'HTML' as const,
      disable_web_page_preview: true,
    };

    // Command: /start or /subscribe [language]
    bot.onText(/\/(start|subscribe)(?:\s+(.+))?/, async (msg, match) => {
      const chatId = String(msg.chat.id);
      const chatType = msg.chat.type;
      const chatTitle = msg.chat.title || msg.chat.first_name || 'Subscriber';
      const targetLang = match && match[2] ? match[2].toLowerCase().trim() : null;

      try {
        await connectToDatabase();
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
            username: msg.chat.username,
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

        bot.sendMessage(chatId, welcomeMsg, sendOptions);
      } catch (err: unknown) {
        const msgStr = err instanceof Error ? err.message : 'Unknown error';
        console.error('Telegram Bot Error:', msgStr);
      }
    });

    // Command: /topics
    bot.onText(/\/topics/, async (msg) => {
      const chatId = String(msg.chat.id);
      try {
        await connectToDatabase();
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

        bot.sendMessage(chatId, topicsMsg, sendOptions);
      } catch (err: unknown) {
        const msgStr = err instanceof Error ? err.message : 'Unknown error';
        console.error('Telegram Bot Error:', msgStr);
      }
    });

    // Command: /digest or /scrape (Trigger Scrape & Broadcast like Cron)
    bot.onText(/\/(digest|scrape|send)/, async (msg) => {
      const chatId = String(msg.chat.id);
      try {
        bot.sendMessage(
          chatId,
          `🚀 <i>Đang kích hoạt cào dữ liệu GitHub Trending mới nhất và phát sóng bản tin AI đến tất cả người dùng... Vui lòng đợi!</i>`,
          sendOptions
        );

        const result = await broadcastDigestToSubscribers();
        if (result.success) {
          bot.sendMessage(
            chatId,
            `✅ <b>ĐÃ PHÁT SÓNG THÀNH CÔNG!</b>\n📊 Số người nhận: <b>${result.count}</b>`,
            sendOptions
          );
        } else {
          bot.sendMessage(
            chatId,
            `❌ <b>Lỗi phát sóng:</b> ${result.error || 'Không xác định'}`,
            sendOptions
          );
        }
      } catch (err: unknown) {
        const msgStr = err instanceof Error ? err.message : 'Unknown error';
        console.error('Telegram Bot Error:', msgStr);
      }
    });

    // Command: /unsubscribe [language]
    bot.onText(/\/unsubscribe(?:\s+(.+))?/, async (msg, match) => {
      const chatId = String(msg.chat.id);
      const chatTitle = msg.chat.title || msg.chat.first_name || 'Subscriber';
      const targetLang = match && match[1] ? match[1].toLowerCase().trim() : null;

      try {
        await connectToDatabase();
        const sub = await Subscriber.findOne({ chatId });

        if (targetLang && sub && sub.languages) {
          const nextLangs = sub.languages.filter((l: string) => l !== targetLang);
          await Subscriber.findOneAndUpdate(
            { chatId },
            { languages: nextLangs },
            { returnDocument: 'after' }
          );
          bot.sendMessage(
            chatId,
            `🗑️ Đã xóa ngôn ngữ <code>${targetLang}</code> khỏi danh sách nhận tin.`,
            sendOptions
          );
        } else {
          await Subscriber.findOneAndUpdate(
            { chatId },
            { isActive: false },
            { returnDocument: 'after' }
          );
          bot.sendMessage(
            chatId,
            `❌ Đã hủy đăng ký nhận bản tin tự động cho <code>${chatTitle}</code>.`,
            sendOptions
          );
        }
      } catch (err: unknown) {
        const msgStr = err instanceof Error ? err.message : 'Unknown error';
        console.error('Telegram Bot Error:', msgStr);
      }
    });

    // Command: /trending [language]
    bot.onText(/\/(trending|hot)(?:\s+(.+))?/, async (msg, match) => {
      const chatId = String(msg.chat.id);
      const cmdLang = match && match[2] ? match[2].toLowerCase().trim() : '';

      try {
        await connectToDatabase();
        const sub = await Subscriber.findOne({ chatId });
        const userLangs = sub?.languages || [];
        const targetLang = cmdLang || (userLangs.length > 0 ? userLangs[0] : '');

        bot.sendMessage(
          chatId,
          `🔍 <i>Đang cào dữ liệu GitHub Trending (${targetLang || 'Tất cả'}) và nhờ AI Gemini 2.5 Flash tóm tắt... Vui lòng đợi trong giây lát!</i>`,
          sendOptions
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
        bot.sendMessage(chatId, htmlMsg, sendOptions);
      } catch (err: unknown) {
        const msgStr = err instanceof Error ? err.message : 'Unknown error';
        console.error('Telegram Bot Error:', msgStr);
      }
    });

    // Command: /help
    bot.onText(/\/help/, async (msg) => {
      const chatId = String(msg.chat.id);
      const helpMsg =
        `🤖 <b>HƯỚNG DẪN SỬ DỤNG GITHUB TRENDING BOT</b>\n\n` +
        `• <code>/subscribe python</code> - Đăng ký nhận tin chủ đề Python.\n` +
        `• <code>/topics</code> - Danh sách chủ đề đang đăng ký.\n` +
        `• <code>/trending</code> - Lấy ngay Top Repo hot trong ngày kèm tóm tắt AI.\n` +
        `• <code>/digest</code> - Chủ động cào & phát sóng bản tin tự động đến tất cả người dùng.\n` +
        `• <code>/unsubscribe python</code> - Xóa ngôn ngữ Python.\n` +
        `• <code>/unsubscribe</code> - Hủy nhận bản tin hoàn toàn.`;
      bot.sendMessage(chatId, helpMsg, sendOptions);
    });

    bot.on('polling_error', (error) => {
      console.error('⚠️ Telegram Polling Error:', error.message);
    });

    return bot;
  } catch (error: unknown) {
    const msgStr = error instanceof Error ? error.message : 'Unknown error';
    console.error('⚠️ Lỗi khởi tạo Telegram Bot:', msgStr);
    return null;
  }
}
