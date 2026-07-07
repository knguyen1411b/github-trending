'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { FilterBar } from '@/components/FilterBar';
import { RepoCard } from '@/components/RepoCard';
import { DeveloperCard } from '@/components/DeveloperCard';
import { AiModal, AiSummaryData } from '@/components/AiModal';
import { CompareModal, ComparisonData } from '@/components/CompareModal';
import { ScrapedRepo, ScrapedDeveloper } from '@/lib/scraper';
import { isRichAiSummary } from '@/lib/ai';
import { exportToMarkdown, exportToPdf } from '@/lib/export';
import { Spinner, Button } from '@heroui/react';
import { Sparkles, Bookmark, Flame, ShieldCheck, Code, Star, Swords, X } from 'lucide-react';

export type ScrapedRepoWithAi = ScrapedRepo & { aiSummary?: AiSummaryData };

export default function Home() {
  const [activeTab, setActiveTab] = useState<'repositories' | 'developers'>('repositories');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [searchQuery, setSearchQuery] = useState('');

  const [repos, setRepos] = useState<ScrapedRepoWithAi[]>([]);
  const [developers, setDevelopers] = useState<ScrapedDeveloper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bookmarks State with Lazy Initializer
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('gh_trending_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // AI Summary Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<ScrapedRepoWithAi | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummaryData | null>(null);

  // AI Comparison Modal State
  const [compareRepo1, setCompareRepo1] = useState<ScrapedRepoWithAi | null>(null);
  const [compareRepo2, setCompareRepo2] = useState<ScrapedRepoWithAi | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);

  // AI Semantic Search Mode State
  const [isAiSearchMode, setIsAiSearchMode] = useState(false);
  const [aiMatchedUrls, setAiMatchedUrls] = useState<string[]>([]);
  const [aiSearchExplanation, setAiSearchExplanation] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);

  // Fetch Trending Data on filter changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams({
          type: activeTab,
          language: selectedLanguage,
          since: selectedPeriod,
        }).toString();

        const res = await fetch(`/api/trending?${query}`);
        const result = await res.json();

        if (result.success) {
          if (activeTab === 'repositories') {
            setRepos(result.data || []);
          } else {
            setDevelopers(result.data || []);
          }
        } else {
          setError(result.error || 'Failed to load trending data.');
        }
      } catch {
        setError('Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedLanguage, selectedPeriod]);

  // Handle AI Semantic Search Debounce
  useEffect(() => {
    if (!isAiSearchMode || !searchQuery.trim() || repos.length === 0) {
      return;
    }

    const timer = setTimeout(async () => {
      setAiSearchLoading(true);
      try {
        const res = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            repos: repos.map((r) => ({
              author: r.author,
              name: r.name,
              url: r.url,
              description: r.description,
              language: r.language,
            })),
          }),
        });

        const data = await res.json();
        if (data.success) {
          setAiMatchedUrls(data.matchedUrls || []);
          setAiSearchExplanation(data.aiExplanation || '');
        }
      } catch {
        // Ignore search errors
      } finally {
        setAiSearchLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, isAiSearchMode, repos]);

  // Toggle Bookmark Handler
  const handleToggleBookmark = (repo: ScrapedRepoWithAi) => {
    const nextBookmarks = new Set(bookmarkedUrls);
    if (nextBookmarks.has(repo.url)) {
      nextBookmarks.delete(repo.url);
    } else {
      nextBookmarks.add(repo.url);
    }
    setBookmarkedUrls(nextBookmarks);
    localStorage.setItem('gh_trending_bookmarks', JSON.stringify(Array.from(nextBookmarks)));
  };

  // Open AI Modal & Call API
  const fetchAiSummary = async (repo: ScrapedRepoWithAi, forceRefresh = false) => {
    setSelectedRepo(repo);
    setAiModalOpen(true);

    if (!forceRefresh && repo.aiSummary && isRichAiSummary(repo.aiSummary)) {
      setAiSummary(repo.aiSummary);
      setAiLoading(false);
      return;
    }

    setAiLoading(true);
    setAiSummary(null);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: repo.author,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          url: repo.url,
          forceRefresh,
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
        setRepos((prev) =>
          prev.map((r) => (r.url === repo.url ? { ...r, aiSummary: data.summary } : r))
        );
      } else {
        setAiSummary({
          purpose: `Dự án ${repo.author}/${repo.name} giải quyết các bài toán phát triển phần mềm tiên tiến.`,
          highlights: `Phát triển bằng ngôn ngữ ${repo.language || 'mã nguồn mở'} và có kiến trúc tối ưu.`,
          useCases: 'Thích hợp cho các lập trình viên nghiên cứu và áp dụng vào dự án thực tế.',
        });
      }
    } catch {
      setAiSummary({
        purpose: `Dự án ${repo.author}/${repo.name} giải quyết các bài toán lập trình hiện đại.`,
        highlights: `Phát triển bằng ${repo.language || 'ngôn ngữ chuyên dụng'}.`,
        useCases: 'Dành cho cộng đồng phát triển phần mềm.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Select Repo for Comparison
  const handleSelectForCompare = (repo: ScrapedRepoWithAi) => {
    if (!compareRepo1) {
      setCompareRepo1(repo);
      return;
    }

    if (compareRepo1.url === repo.url) {
      setCompareRepo1(null);
      return;
    }

    setCompareRepo2(repo);
    triggerCompare(compareRepo1, repo);
  };

  const triggerCompare = async (r1: ScrapedRepoWithAi, r2: ScrapedRepoWithAi) => {
    setCompareModalOpen(true);
    setCompareLoading(true);
    setComparisonResult(null);

    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo1: r1, repo2: r2 }),
      });

      const data = await res.json();
      if (data.success && data.comparison) {
        setComparisonResult(data.comparison);
      }
    } catch {
      setComparisonResult({
        repo1Summary: `Dự án ${r1.author}/${r1.name}`,
        repo2Summary: `Dự án ${r2.author}/${r2.name}`,
        architectureDiff: 'Cả 2 dự án đều có cấu trúc mã nguồn mở tiên tiến.',
        performanceDiff: 'Hiệu năng và khả năng mở rộng cao.',
        easeOfUseDiff: 'Tài liệu hướng dẫn cài đặt đầy đủ.',
        verdict: 'Khuyên dùng dựa trên yêu cầu cụ thể của từng dự án.',
      });
    } finally {
      setCompareLoading(false);
    }
  };

  // Filter Repos by Bookmarks, Standard Search & AI Semantic Search
  const filteredRepos = repos.filter((r) => {
    const matchesBookmark = showOnlyBookmarks ? bookmarkedUrls.has(r.url) : true;

    if (isAiSearchMode && searchQuery.trim()) {
      const matchesAi = aiMatchedUrls.includes(r.url);
      return matchesBookmark && matchesAi;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q));

    return matchesBookmark && matchesSearch;
  });

  // Filter Developers by Search Query
  const filteredDevelopers = developers.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.username.toLowerCase().includes(q) ||
      (d.popularRepo && d.popularRepo.name && d.popularRepo.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-mesh-pattern bg-grid-pattern text-[#f0f6fc] relative pb-20">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative border-b border-[#30363d]/80 bg-gradient-to-b from-[#121826]/90 via-[#090d16]/95 to-[#090d16] py-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-500/15 via-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            AI Gemini 2.5 Flash + Topic Subscriptions Telegram Bot
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Khám phá xu hướng mã nguồn <br className="hidden sm:inline" />
            <span className="gradient-text-purple">GitHub Trending Hub</span>
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Hệ thống cào dữ liệu GitHub Trending, đọc file{' '}
            <strong className="text-emerald-400">README.md</strong> và dùng{' '}
            <strong className="text-white">Gemini 2.5 Flash</strong> để phân tích chuyên sâu 3 ý
            Tiếng Việt, hỗ trợ <strong className="text-sky-400">so sánh Repo đối đầu</strong> và{' '}
            <strong className="text-purple-400">đăng ký chủ đề Telegram Bot</strong>.
          </p>

          {/* Quick Stats Widget */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="bg-[#161b22]/80 border border-[#30363d] p-3 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="p-2 bg-sky-500/15 text-sky-400 rounded-xl">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#8b949e]">Repo Xu Hướng</div>
                <div className="text-sm font-bold text-white">{repos.length} repos</div>
              </div>
            </div>

            <div className="bg-[#161b22]/80 border border-[#30363d] p-3 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="p-2 bg-purple-500/15 text-purple-400 rounded-xl">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#8b949e]">Ngôn Ngữ</div>
                <div className="text-sm font-bold text-white">{selectedLanguage || 'Tất cả'}</div>
              </div>
            </div>

            <div className="bg-[#161b22]/80 border border-[#30363d] p-3 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <div className="text-xs text-[#8b949e]">Đã Lưu</div>
                <div className="text-sm font-bold text-white">{bookmarkedUrls.size} items</div>
              </div>
            </div>

            <div className="bg-[#161b22]/80 border border-[#30363d] p-3 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#8b949e]">Trạng Thái Bot</div>
                <div className="text-sm font-bold text-emerald-400">Topic Syncing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <FilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        isAiSearchMode={isAiSearchMode}
        onToggleAiSearchMode={() => {
          setIsAiSearchMode(!isAiSearchMode);
          if (isAiSearchMode) {
            setAiMatchedUrls([]);
            setAiSearchExplanation('');
          }
        }}
        onExportMarkdown={() => exportToMarkdown(filteredRepos, selectedLanguage, selectedPeriod)}
        onExportPdf={exportToPdf}
      />

      {/* AI Search Explanation Notification */}
      {isAiSearchMode && aiSearchExplanation && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-2xl text-xs text-purple-200 flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
            <span>
              <strong>Kết quả AI Search:</strong> {aiSearchExplanation}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bookmarks Toggle Bar */}
        {activeTab === 'repositories' && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#30363d]/80">
            <div className="text-sm font-medium text-[#8b949e]">
              Hiển thị <span className="text-white font-bold">{filteredRepos.length}</span> /{' '}
              {repos.length} repositories
            </div>

            <Button
              size="sm"
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`font-semibold text-xs rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                showOnlyBookmarks
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-900/20'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-white border-[#30363d]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-amber-400' : ''}`} />
              {showOnlyBookmarks ? 'Đang lọc Repo đã lưu' : `Đã lưu (${bookmarkedUrls.size})`}
            </Button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading || aiSearchLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-[#8b949e] font-medium animate-pulse">
              {aiSearchLoading
                ? 'AI Gemini đang phân tích ý định tìm kiếm của bạn...'
                : 'Đang cào dữ liệu GitHub Trending & đồng bộ cache...'}
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
            <p className="font-semibold text-lg mb-1">Đã xảy ra lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : activeTab === 'repositories' ? (
          /* Repositories List */
          filteredRepos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredRepos.map((repo) => (
                <RepoCard
                  key={repo.url}
                  repo={repo}
                  isBookmarked={bookmarkedUrls.has(repo.url)}
                  isCompareSelected={compareRepo1?.url === repo.url}
                  onToggleBookmark={handleToggleBookmark}
                  onOpenAiModal={(r) => fetchAiSummary(r, false)}
                  onSelectForCompare={handleSelectForCompare}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-[#8b949e]">
              Không tìm thấy repository nào phù hợp với bộ lọc và từ khóa hiện tại.
            </div>
          )
        ) : /* Developers List */
        filteredDevelopers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDevelopers.map((dev) => (
              <DeveloperCard key={dev.username} developer={dev} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-[#8b949e]">
            Không tìm thấy developer nào phù hợp với từ khóa hiện tại.
          </div>
        )}
      </main>

      {/* Floating Compare Selection Indicator Bar */}
      {compareRepo1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#121826]/95 backdrop-blur-xl border border-purple-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-purple-400 animate-bounce" />
            <span>
              Đã chọn 1:{' '}
              <strong className="text-white">
                {compareRepo1.author}/{compareRepo1.name}
              </strong>
              . Chọn thêm Repo thứ 2 để so sánh!
            </span>
          </div>

          <button
            onClick={() => setCompareRepo1(null)}
            className="p-1 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-white"
            title="Hủy chọn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Summary Modal */}
      <AiModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onRefresh={() => selectedRepo && fetchAiSummary(selectedRepo, true)}
        repoName={selectedRepo ? `${selectedRepo.author}/${selectedRepo.name}` : ''}
        loading={aiLoading}
        summary={aiSummary}
      />

      {/* AI Compare Modal */}
      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => {
          setCompareModalOpen(false);
          setCompareRepo1(null);
          setCompareRepo2(null);
        }}
        repo1={compareRepo1}
        repo2={compareRepo2}
        loading={compareLoading}
        comparison={comparisonResult}
      />
    </div>
  );
}
