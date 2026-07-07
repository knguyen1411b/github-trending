'use client';

import React from 'react';
import {
  Star,
  GitFork,
  Sparkles,
  Bookmark,
  ExternalLink,
  BookOpen,
  TrendingUp,
  Swords,
} from 'lucide-react';
import { ScrapedRepo } from '@/lib/scraper';
import { AiSummaryData } from '@/components/AiModal';

interface RepoCardProps {
  repo: ScrapedRepo & { aiSummary?: AiSummaryData };
  isBookmarked: boolean;
  isCompareSelected?: boolean;
  onToggleBookmark: (repo: ScrapedRepo) => void;
  onOpenAiModal: (repo: ScrapedRepo) => void;
  onSelectForCompare: (repo: ScrapedRepo) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  isBookmarked,
  isCompareSelected = false,
  onToggleBookmark,
  onOpenAiModal,
  onSelectForCompare,
}) => {
  return (
    <div
      className={`relative group rounded-2xl bg-gradient-to-b from-[#161c2b] to-[#0e131f] border p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20 overflow-hidden ${
        isCompareSelected
          ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-purple-900/30'
          : 'border-white/10 hover:border-purple-500/40'
      }`}
    >
      {/* Top Ambient Glow Effect */}
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{
          background: repo.languageColor
            ? `radial-gradient(circle, ${repo.languageColor} 0%, rgba(168,85,247,0.5) 100%)`
            : 'radial-gradient(circle, #a855f7 0%, #6366f1 100%)',
        }}
      />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Repo Title & Link */}
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[#8b949e] font-medium text-sm sm:text-base">{repo.author}</span>
            <span className="text-[#484f58] font-light">/</span>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base sm:text-lg font-bold text-white hover:text-sky-400 transition-colors flex items-center gap-1.5 truncate group/link"
            >
              <span>{repo.name}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity text-sky-400" />
            </a>
          </div>
        </div>

        {/* Action Buttons: AI Summarize, Compare & Bookmark */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Sparkles AI Button */}
          <button
            onClick={() => onOpenAiModal(repo)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs border border-purple-300/30 shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Phân tích AI</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={() => onSelectForCompare(repo)}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
              isCompareSelected
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                : 'bg-[#1c2333] text-purple-300 hover:text-white border-purple-500/30 hover:border-purple-400'
            }`}
            title="Chọn repo này để so sánh với repo khác"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{isCompareSelected ? 'Đã chọn so sánh' : 'So sánh'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(repo)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-md shadow-amber-900/20'
                : 'bg-[#1c2333] text-[#8b949e] hover:text-white border-white/10 hover:border-white/20'
            }`}
            title={isBookmarked ? 'Bỏ lưu' : 'Lưu repository'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 leading-relaxed font-normal mb-4 line-clamp-2">
        {repo.description || 'Không có mô tả gốc từ tác giả.'}
      </p>

      {/* AI Review Quick View Banner */}
      {repo.aiSummary && repo.aiSummary.purpose && (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900/60 border border-purple-500/30 shadow-inner">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Tóm tắt nhanh từ AI Gemini:</span>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed line-clamp-2">
            {repo.aiSummary.purpose}
          </p>
        </div>
      )}

      {/* Footer Meta Row */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Language Pill */}
          {repo.language && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1c2333] border border-white/10 text-gray-200 font-semibold shadow-sm">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{
                  backgroundColor: repo.languageColor || '#8b949e',
                  boxShadow: `0 0 8px ${repo.languageColor || '#8b949e'}aa`,
                }}
              />
              <span>{repo.language}</span>
            </div>
          )}

          {/* Total Stars */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1c2333] border border-white/10 text-gray-200 font-medium">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{repo.stars.toLocaleString()}</span>
          </div>

          {/* Forks */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1c2333] border border-white/10 text-gray-200 font-medium">
            <GitFork className="w-3.5 h-3.5 text-[#8b949e]" />
            <span>{repo.forks.toLocaleString()}</span>
          </div>

          {/* Today Stars Growth */}
          {repo.currentPeriodStars > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{repo.currentPeriodStars.toLocaleString()} stars hôm nay</span>
            </div>
          )}
        </div>

        {/* Contributors Avatars */}
        {repo.builtBy && repo.builtBy.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b949e]">
              Built by
            </span>
            <div className="flex -space-x-2 overflow-hidden">
              {repo.builtBy.slice(0, 5).map((user) => (
                <img
                  key={user.username}
                  src={user.avatar}
                  alt={user.username}
                  title={user.username}
                  className="w-6 h-6 rounded-full border-2 border-[#121723] hover:scale-125 transition-transform cursor-pointer"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
