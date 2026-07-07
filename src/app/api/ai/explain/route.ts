import { NextRequest, NextResponse } from 'next/server';
import { summarizeRepoWithAI, isRichAiSummary } from '@/lib/ai';
import { fetchRepoReadme } from '@/lib/scraper';
import { connectToDatabase } from '@/lib/db';
import Repo from '@/models/Repo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, name, description, language, stars, url, forceRefresh } = body;

    if (!author || !name) {
      return NextResponse.json(
        { success: false, error: 'Author and name are required' },
        { status: 400 }
      );
    }

    const targetUrl = url || `https://github.com/${author}/${name}`;

    // Try checking MongoDB cache if DB is connected and not forcing refresh
    if (!forceRefresh) {
      try {
        await connectToDatabase();
        const existingRepo = await Repo.findOne({ url: targetUrl });
        if (existingRepo && isRichAiSummary(existingRepo.aiSummary)) {
          return NextResponse.json({
            success: true,
            summary: existingRepo.aiSummary,
            fromCache: true,
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB cache lookup warning (continuing directly to Gemini API):', dbErr);
      }
    }

    // 1. Fetch raw README.md from GitHub for deep AI analysis
    const readmeContent = await fetchRepoReadme(author, name);

    // 2. Call Gemini 2.5 Flash API with full README context
    const aiSummary = await summarizeRepoWithAI(
      author,
      name,
      description || '',
      language || 'Unknown',
      stars || 0,
      readmeContent
    );

    // 3. Save/Update in MongoDB Cache if DB is available
    try {
      await connectToDatabase();
      await Repo.findOneAndUpdate(
        { url: targetUrl },
        {
          author,
          name,
          url: targetUrl,
          description,
          language,
          stars,
          aiSummary: {
            ...aiSummary,
            updatedAt: new Date(),
          },
          lastScrapedAt: new Date(),
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (saveErr) {
      console.warn('MongoDB save warning:', saveErr);
    }

    return NextResponse.json({
      success: true,
      summary: aiSummary,
      fromCache: false,
    });
  } catch (error: unknown) {
    console.error('API /api/ai/explain error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI summary' },
      { status: 500 }
    );
  }
}
