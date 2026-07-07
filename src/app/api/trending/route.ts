import { NextRequest, NextResponse } from 'next/server';
import { fetchTrendingRepos, fetchTrendingDevelopers } from '@/lib/scraper';
import { connectToDatabase } from '@/lib/db';
import Repo from '@/models/Repo';
import { isRichAiSummary } from '@/lib/ai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'repositories'; // 'repositories' | 'developers'
  const language = searchParams.get('language') || '';
  const since = searchParams.get('since') || 'daily'; // 'daily' | 'weekly' | 'monthly'

  try {
    if (type === 'developers') {
      const developers = await fetchTrendingDevelopers(language, since);
      return NextResponse.json({ success: true, data: developers });
    }

    // Default: Repositories
    const repos = await fetchTrendingRepos(language, since);

    // Try to attach valid cached AI Summaries from MongoDB if available
    try {
      await connectToDatabase();
      const urls = repos.map((r) => r.url);
      const cachedRepos = await Repo.find({ url: { $in: urls } });
      const cacheMap = new Map();

      cachedRepos.forEach((cr) => {
        if (isRichAiSummary(cr.aiSummary)) {
          cacheMap.set(cr.url, cr.aiSummary);
        }
      });

      const reposWithAi = repos.map((r) => ({
        ...r,
        aiSummary: cacheMap.get(r.url) || undefined,
      }));

      return NextResponse.json({ success: true, data: reposWithAi });
    } catch {
      // Return scraped repos directly if DB connection is offline
      return NextResponse.json({ success: true, data: repos });
    }
  } catch (error: unknown) {
    console.error('API /api/trending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}
