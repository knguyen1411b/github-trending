import { ScrapedRepo } from './scraper';

export function exportToMarkdown(
  repos: (ScrapedRepo & { aiSummary?: Record<string, unknown> })[],
  language: string,
  period: string
) {
  const dateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# GitHub Trending Hub & AI Digest\n\n`;
  md += `> **Thời gian:** ${dateStr}  \n`;
  md += `> **Bộ lọc:** Ngôn ngữ: \`${language || 'Tất cả'}\` | Khung thời gian: \`${period}\`  \n\n`;
  md += `---\n\n`;

  repos.forEach((repo, i) => {
    md += `## ${i + 1}. [${repo.author}/${repo.name}](${repo.url})\n\n`;
    if (repo.language) {
      md += `- **Ngôn ngữ:** \`${repo.language}\`\n`;
    }
    md += `- **Stars:** ⭐ ${repo.stars.toLocaleString()} | **Forks:** 🍴 ${repo.forks.toLocaleString()}\n`;
    if (repo.currentPeriodStars > 0) {
      md += `- **Tăng trưởng:** +${repo.currentPeriodStars.toLocaleString()} stars hôm nay\n`;
    }
    md += `- **Mô tả:** ${repo.description || 'Không có mô tả gốc.'}\n\n`;

    if (repo.aiSummary) {
      md += `### 🤖 Phân Tích Chuyên Sâu Gemini 2.5 Flash\n`;
      md += `- 🎯 **Mục đích cốt lõi:** ${String(repo.aiSummary.purpose || 'N/A')}\n`;
      md += `- 🚀 **Điểm nổi bật kỹ thuật:** ${String(repo.aiSummary.highlights || 'N/A')}\n`;
      md += `- 💡 **Gợi ý sử dụng:** ${String(repo.aiSummary.useCases || 'N/A')}\n\n`;
    }

    md += `---\n\n`;
  });

  md += `*Báo cáo được khởi tạo tự động bởi GitHub Trending Hub & Gemini 2.5 Flash.*\n`;

  // Trigger file download in browser
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `github-trending-digest-${Date.now()}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPdf() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
