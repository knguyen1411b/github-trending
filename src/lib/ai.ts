import { GoogleGenAI } from '@google/genai';
import { AiSummaryData } from '@/components/AiModal';

export interface AISummaryResult {
  purpose: string;
  highlights: string;
  useCases: string;
}

export function isRichAiSummary(summary?: AiSummaryData | Record<string, unknown> | null): boolean {
  if (!summary) return false;
  const purpose = typeof summary.purpose === 'string' ? summary.purpose : '';
  const highlights = typeof summary.highlights === 'string' ? summary.highlights : '';
  const useCases = typeof summary.useCases === 'string' ? summary.useCases : '';

  if (!purpose || !highlights || !useCases) return false;

  // A valid rich summary from Gemini 2.5 Flash must have detailed content (>30 chars per section)
  if (purpose.length < 30 || highlights.length < 30 || useCases.length < 30) {
    return false;
  }

  const p = purpose.toLowerCase();
  const h = highlights.toLowerCase();
  const u = useCases.toLowerCase();

  // Reject fallback template markers & raw untranslated English text
  if (h.includes('vui lòng thử lại') || u.includes('hệ thống đang cập nhật')) return false;
  if (p.includes('không thể tạo bản tóm tắt')) return false;
  if (p.startsWith('extracted system prompts') || p.startsWith('privacy first')) return false;

  return true;
}

export async function summarizeRepoWithAI(
  author: string,
  name: string,
  description: string,
  language: string,
  stars: number,
  readmeContent = ''
): Promise<AISummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing from process.env');
    return getFallbackSummary(author, name, description, language);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const readmeSection = readmeContent
      ? `\n--- NỘI DUNG CHI TIẾT FILE README.MD TỪ KHO MÃ NGUỒN ---\n${readmeContent}\n---------------------------------------------------------`
      : '';

    const prompt = `Bạn là một Chuyên gia Kiến trúc Phần mềm và Biên tập viên Công nghệ cao cấp. 
Hãy đọc thông tin kho mã nguồn GitHub kèm file README bên dưới và viết một bản BÁO CÁO PHÂN TÍCH CHUYÊN SÂU BẰNG TIẾNG VIỆT HOÀN TOÀN:

Tên Repo: ${author}/${name}
Ngôn ngữ chủ đạo: ${language || 'Không rõ'}
Số stars hiện tại: ${stars ? stars.toLocaleString() : 0}
Mô tả gốc từ tác giả: ${description || 'Không có mô tả gốc'}
${readmeSection}

YÊU CẦU BẮT BUỘC KHI PHÂN TÍCH:
1. Viết HOÀN TOÀN BẰNG TIẾNG VIỆT tự nhiên, mượt mà và chuyên nghiệp. TUYỆT ĐỐI KHÔNG giữ nguyên đoạn tiếng Anh gốc.
2. Dựa trên file README, phân tích sâu các tính năng thực tế, kiến trúc, công nghệ ngầm, cách cài đặt/triển khai và giá trị cốt lõi (viết từ 2-4 câu đầy đủ cho mỗi mục).
3. Trả về đúng định dạng JSON chuẩn (không chứa mã markdown hay ký tự thừa):

JSON Schema bắt buộc:
{
  "purpose": "Viết 2-4 câu Tiếng Việt giải thích rõ ràng dự án này là gì, giải quyết bài toán cốt lõi nào cho lập trình viên/doanh nghiệp, tại sao dự án này ra đời.",
  "highlights": "Viết 3-4 câu Tiếng Việt phân tích chi tiết các tính năng độc đáo, kiến trúc phần mềm, công nghệ/thư viện sử dụng, hiệu năng bứt phá hoặc lợi thế cạnh tranh trích xuất từ README.",
  "useCases": "Viết 2-3 câu Tiếng Việt gợi ý cụ thể đối tượng sử dụng (kỹ sư backend, AI engineer, DevOps...), các bài toán thực tế phù hợp và cách thức/môi trường triển khai chính."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';

    // Clean JSON response from potential ```json ``` blocks
    const cleanJsonText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleanJsonText);

    if (parsed.purpose && parsed.highlights && parsed.useCases) {
      return {
        purpose: parsed.purpose,
        highlights: parsed.highlights,
        useCases: parsed.useCases,
      };
    }

    return getFallbackSummary(author, name, description, language);
  } catch (error) {
    console.error('Error generating AI summary with Gemini:', error);
    return getFallbackSummary(author, name, description, language);
  }
}

function getFallbackSummary(
  author: string,
  name: string,
  description: string,
  language: string
): AISummaryResult {
  return {
    purpose: `Dự án mã nguồn mở ${author}/${name} được thiết kế để giải quyết các bài toán lập trình và xử lý hệ thống hiện đại trong hệ sinh thái ${language || 'phần mềm'}.`,
    highlights: `Kho mã nguồn ghi điểm nhờ cấu hình tối ưu, khả năng mở rộng tốt và được viết chủ đạo bằng ngôn ngữ ${language || 'chuyên dụng'}.`,
    useCases: `Thích hợp cho các kỹ sư phần mềm, lập trình viên backend và cộng đồng công nghệ muốn học hỏi hoặc tích hợp trực tiếp vào dự án thực tế.`,
  };
}
