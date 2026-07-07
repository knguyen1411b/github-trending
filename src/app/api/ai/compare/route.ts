import { NextRequest, NextResponse } from 'next/server';
import { fetchRepoReadme } from '@/lib/scraper';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { repo1, repo2 } = await request.json();

    if (!repo1 || !repo2 || !repo1.author || !repo2.author) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin repository để so sánh.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Thiếu GEMINI_API_KEY.' }, { status: 500 });
    }

    // Fetch READMEs for both repos
    const [readme1, readme2] = await Promise.all([
      fetchRepoReadme(repo1.author, repo1.name),
      fetchRepoReadme(repo2.author, repo2.name),
    ]);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Bạn là chuyên gia kiến trúc phần mềm mã nguồn mở. Hãy so sánh 2 repository GitHub sau dựa trên thông tin và README:

DỰ ÁN 1:
- Tên: ${repo1.author}/${repo1.name}
- Ngôn ngữ: ${repo1.language || 'N/A'} | Stars: ${repo1.stars}
- Mô tả: ${repo1.description}
- README (trích đoạn): ${(readme1 || '').slice(0, 2000)}

DỰ ÁN 2:
- Tên: ${repo2.author}/${repo2.name}
- Ngôn ngữ: ${repo2.language || 'N/A'} | Stars: ${repo2.stars}
- Mô tả: ${repo2.description}
- README (trích đoạn): ${(readme2 || '').slice(0, 2000)}

Hãy so sánh chuyên sâu và trả về kết quả ĐÚNG ĐỊNH DẠNG JSON với các trường bằng Tiếng Việt:
{
  "repo1Summary": "Tóm tắt ngắn gọn 1 câu về mục đích Repo 1",
  "repo2Summary": "Tóm tắt ngắn gọn 1 câu về mục đích Repo 2",
  "architectureDiff": "So sánh sự khác biệt về kiến trúc và cách thiết kế giữa 2 dự án",
  "performanceDiff": "So sánh về hiệu năng, tốc độ xử lý hoặc tài nguyên sử dụng",
  "easeOfUseDiff": "So sánh về mức độ dễ cài đặt, sử dụng và tài liệu hướng dẫn",
  "verdict": "Kết luận khuyên dùng: Trường hợp nào nên chọn Repo 1, trường hợp nào nên chọn Repo 2"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textContent = response.text || '{}';
    const comparisonData = JSON.parse(textContent);

    return NextResponse.json({
      success: true,
      comparison: comparisonData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Không thể thực hiện so sánh AI.';
    console.error('AI Compare API Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
