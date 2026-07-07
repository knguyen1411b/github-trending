import axios from 'axios';
import { connectToDatabase } from './db';
import Subscriber from '@/models/Subscriber';
import Repo from '@/models/Repo';
import DigestLog from '@/models/DigestLog';
import { fetchTrendingRepos } from './scraper';
import { summarizeRepoWithAI } from './ai';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TELEGRAM_MESSAGE_LIMIT = 4096;
const TELEGRAM_SAFE_CHUNK_LENGTH = 3900;

/**
 * Sends a HTML/Markdown formatted message to a specific Telegram Chat ID
 */
export async function sendTelegramMessage(chatId: string, htmlMessage: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing in environment variables.');
    return false;
  }

  const messageParts = splitTelegramMessage(htmlMessage);

  for (const text of messageParts) {
    try {
      await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });
    } catch (error: unknown) {
      let errMessage = error instanceof Error ? error.message : 'Unknown error';

      if (axios.isAxiosError(error) && error.response?.data) {
        errMessage =
          typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data);
      }

      console.error(`Failed to send Telegram message to ${chatId}:`, errMessage);
      return false;
    }
  }

  return true;
}

/**
 * Formats top trending repos into an attractive HTML message for Telegram
 */
export function formatTelegramDigest(repos: Record<string, unknown>[], dateStr: string): string {
  let message = `🔥 <b>GITHUB TRENDING DAILY DIGEST</b> 🔥\n`;
  message += `📅 <i>${escapeHtml(dateStr)}</i>\n\n`;
  message += `🤖 <i>Bản tin được tổng hợp & phân tích bởi AI Curator:</i>\n\n`;

  repos.forEach((repo, index) => {
    const num = index + 1;
    const author = String(repo.author || '');
    const name = String(repo.name || '');
    const url = String(repo.url || '');
    const language = String(repo.language || 'Code');
    const starsStr = repo.stars ? Number(repo.stars).toLocaleString() : '0';
    const periodStarsStr = repo.currentPeriodStars
      ? Number(repo.currentPeriodStars).toLocaleString()
      : '0';
    const aiSummary = repo.aiSummary as Record<string, string> | undefined;
    const description = String(repo.description || '');

    message += `<b>${num}. <a href="${escapeHtmlAttribute(url)}">${escapeHtml(author)}/${escapeHtml(
      name
    )}</a></b> (${escapeHtml(language)})\n`;
    message += `⭐ <b>${starsStr}</b> stars (+${periodStarsStr} hôm nay)\n`;

    if (aiSummary) {
      message += `🎯 <b>Mục đích:</b> ${escapeHtml(truncateText(aiSummary.purpose || '', 650))}\n`;
      message += `🚀 <b>Điểm nổi bật:</b> ${escapeHtml(
        truncateText(aiSummary.highlights || '', 650)
      )}\n`;
      message += `💡 <b>Ứng dụng:</b> ${escapeHtml(truncateText(aiSummary.useCases || '', 650))}\n`;
    } else if (description) {
      message += `📝 <i>${escapeHtml(truncateText(description, 500))}</i>\n`;
    }

    message += `\n-------------------------------\n\n`;
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  message += `🌐 Xem chi tiết Dashboard tại <a href="${escapeHtmlAttribute(appUrl)}">${escapeHtml(
    appUrl
  )}</a>!`;
  return message;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtmlAttribute(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;');
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function splitTelegramMessage(message: string): string[] {
  if (message.length <= TELEGRAM_MESSAGE_LIMIT) {
    return [message];
  }

  const parts: string[] = [];
  let remaining = message;

  while (remaining.length > TELEGRAM_SAFE_CHUNK_LENGTH) {
    let splitAt = remaining.lastIndexOf('\n\n', TELEGRAM_SAFE_CHUNK_LENGTH);

    if (splitAt < 1) {
      splitAt = remaining.lastIndexOf('\n', TELEGRAM_SAFE_CHUNK_LENGTH);
    }

    if (splitAt < 1) {
      splitAt = TELEGRAM_SAFE_CHUNK_LENGTH;
    }

    parts.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}

/**
 * Broadcasts top trending repos to all registered subscribers in MongoDB
 */
export async function broadcastDigestToSubscribers(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    await connectToDatabase();

    // 1. Get active subscribers from DB
    const activeSubscribers = await Subscriber.find({ isActive: true });
    if (!activeSubscribers || activeSubscribers.length === 0) {
      return { success: true, count: 0, error: 'No active subscribers found.' };
    }

    // 2. Fetch fresh GitHub Trending repos
    const scrapedRepos = await fetchTrendingRepos('', 'daily');
    if (scrapedRepos.length === 0) {
      return { success: false, count: 0, error: 'Could not fetch trending repos.' };
    }

    // 3. Filter out repos sent in the last 3 days to avoid duplicate spam
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentlySentLogs = await DigestLog.find({
      sentAt: { $gte: threeDaysAgo },
    });
    const recentlySentUrls = new Set(recentlySentLogs.map((log) => log.repoUrl));

    const newRepos = scrapedRepos.filter((r) => !recentlySentUrls.has(r.url));
    const reposToProcess = (newRepos.length >= 3 ? newRepos : scrapedRepos).slice(0, 5);

    // 4. Summarize selected repos with Gemini AI & Cache in Mongo
    const processedRepos = [];
    for (const repo of reposToProcess) {
      // Check Mongo cache first
      let dbRepo = await Repo.findOne({ url: repo.url });

      let aiSummary = dbRepo?.aiSummary;
      if (!aiSummary || !aiSummary.purpose) {
        aiSummary = await summarizeRepoWithAI(
          repo.author,
          repo.name,
          repo.description,
          repo.language,
          repo.stars
        );
      }

      // Upsert Repo in DB
      if (!dbRepo) {
        dbRepo = new Repo({
          ...repo,
          aiSummary,
          lastScrapedAt: new Date(),
        });
      } else {
        dbRepo.stars = repo.stars;
        dbRepo.forks = repo.forks;
        dbRepo.currentPeriodStars = repo.currentPeriodStars;
        dbRepo.aiSummary = aiSummary;
        dbRepo.lastScrapedAt = new Date();
      }
      await dbRepo.save();

      processedRepos.push({
        ...repo,
        aiSummary,
      });

      // Log to DigestLog
      await DigestLog.create({
        repoUrl: repo.url,
        repoName: `${repo.author}/${repo.name}`,
        sentAt: new Date(),
        period: 'daily',
      });
    }

    // 5. Format Telegram HTML Digest
    const dateToday = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const digestHtml = formatTelegramDigest(processedRepos, dateToday);

    // 6. Broadcast to all active subscribers
    let successCount = 0;
    for (const sub of activeSubscribers) {
      const sent = await sendTelegramMessage(sub.chatId, digestHtml);
      if (sent) successCount++;
    }

    return { success: true, count: successCount };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in broadcastDigestToSubscribers:', error);
    return { success: false, count: 0, error: errMessage };
  }
}
