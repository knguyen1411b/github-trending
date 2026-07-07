import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ScrapedRepo } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    const { query, repos } = await request.json();

    if (!query || !repos || !Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Thiếu câu hỏi tìm kiếm hoặc danh sách repositories.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Thiếu GEMINI_API_KEY.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format mini list of repos for AI
    const repoListSummary = repos.map((r: ScrapedRepo, index: number) => ({
      id: index,
      name: `${r.author}/${r.name}`,
      url: r.url,
      description: r.description,
      language: r.language,
    }));

    const prompt = `Bạn là trợ lý tìm kiếm mã nguồn mã nguồn mở thông minh. 
Người dùng hỏi câu tìm kiếm bằng ngôn ngữ tự nhiên: "${query}"

Dưới đây là danh sách các repository hiện có:
${JSON.stringify(repoListSummary, null, 2)}

Hãy phân tích ý định người dùng và chọn ra các repository PHÙ HỢP NHẤT với câu hỏi.
Trả về đúng định dạng JSON danh sách các URL được chọn xếp theo thứ tự phù hợp giảm dần:
{
  "matchedUrls": ["https://github.com/author/name1", "https://github.com/author/name2"],
  "aiExplanation": "1 câu ngắn giải thích lý do lọc các dự án này"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textContent = response.text || '{}';
    const searchResult = JSON.parse(textContent);

    return NextResponse.json({
      success: true,
      matchedUrls: searchResult.matchedUrls || [],
      aiExplanation: searchResult.aiExplanation || '',
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Không thể thực hiện tìm kiếm AI.';
    console.error('AI Semantic Search API Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
