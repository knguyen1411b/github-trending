'use client';

import React from 'react';
import { Card, CardContent, Button, Chip } from '@heroui/react';
import { Sparkles, Swords, X, Loader2, CheckCircle2, Cpu, Zap, BookOpen } from 'lucide-react';
import { ScrapedRepo } from '@/lib/scraper';

export interface ComparisonData {
  repo1Summary: string;
  repo2Summary: string;
  architectureDiff: string;
  performanceDiff: string;
  easeOfUseDiff: string;
  verdict: string;
}

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo1: ScrapedRepo | null;
  repo2: ScrapedRepo | null;
  loading: boolean;
  comparison: ComparisonData | null;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  repo1,
  repo2,
  loading,
  comparison,
}) => {
  if (!isOpen || !repo1 || !repo2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-sky-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d]/80 pb-4 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 rounded-2xl text-white shadow-lg shadow-purple-500/30 shrink-0">
              <Swords className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white leading-tight">
                So Sánh Chuyên Sâu Gemini AI
              </h3>
              <p className="text-xs text-purple-300 font-semibold mt-0.5">
                {repo1.author}/{repo1.name} <span className="text-pink-400 font-bold">VS</span>{' '}
                {repo2.author}/{repo2.name}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onClose}
            className="bg-transparent text-[#8b949e] hover:text-white hover:bg-[#21262d] min-w-0 p-2 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          {/* Header Repos Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#161c2b] border border-sky-500/30 rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <Chip className="bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-xs rounded-xl">
                  DỰ ÁN 1
                </Chip>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {repo1.author}/{repo1.name}
                  </span>
                </h4>
                <div className="text-xs text-[#8b949e]">
                  🏷️ {repo1.language || 'Mã nguồn mở'} | ⭐ {repo1.stars.toLocaleString()} stars
                </div>
                {comparison?.repo1Summary && (
                  <p className="text-xs text-gray-200 pt-1 leading-relaxed border-t border-white/10 mt-2">
                    {comparison.repo1Summary}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#161c2b] border border-pink-500/30 rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <Chip className="bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold text-xs rounded-xl">
                  DỰ ÁN 2
                </Chip>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {repo2.author}/{repo2.name}
                  </span>
                </h4>
                <div className="text-xs text-[#8b949e]">
                  🏷️ {repo2.language || 'Mã nguồn mở'} | ⭐ {repo2.stars.toLocaleString()} stars
                </div>
                {comparison?.repo2Summary && (
                  <p className="text-xs text-gray-200 pt-1 leading-relaxed border-t border-white/10 mt-2">
                    {comparison.repo2Summary}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              <p className="text-sm text-[#8b949e] font-medium animate-pulse">
                Gemini 2.5 Flash đang đọc 2 README.md và tiến hành so sánh đối đầu...
              </p>
            </div>
          ) : comparison ? (
            <div className="space-y-4 pt-2">
              {/* 1. Architecture Comparison */}
              <Card className="bg-[#161b22]/90 border border-purple-500/30 rounded-2xl shadow-lg">
                <CardContent className="p-4.5 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>1. SO SÁNH KIẾN TRÚC & THIẾT KẾ</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed font-normal pt-1">
                    {comparison.architectureDiff}
                  </p>
                </CardContent>
              </Card>

              {/* 2. Performance Comparison */}
              <Card className="bg-[#161b22]/90 border border-amber-500/30 rounded-2xl shadow-lg">
                <CardContent className="p-4.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>2. HIỆU NĂNG & KHẢ NĂNG MỞ RỘNG</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed font-normal pt-1">
                    {comparison.performanceDiff}
                  </p>
                </CardContent>
              </Card>

              {/* 3. Ease of Use Comparison */}
              <Card className="bg-[#161b22]/90 border border-sky-500/30 rounded-2xl shadow-lg">
                <CardContent className="p-4.5 space-y-2">
                  <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>3. ĐỘ DỄ CÀI ĐẶT & SỬ DỤNG</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed font-normal pt-1">
                    {comparison.easeOfUseDiff}
                  </p>
                </CardContent>
              </Card>

              {/* 4. Verdict */}
              <Card className="bg-gradient-to-r from-emerald-950/50 to-teal-950/40 border border-emerald-500/40 rounded-2xl shadow-lg">
                <CardContent className="p-4.5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>4. KẾT LUẬN & ĐÁNH GIÁ KHUYÊN DÙNG NGAY</span>
                  </div>
                  <p className="text-sm text-gray-100 leading-relaxed font-medium pt-1">
                    {comparison.verdict}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-10 text-center text-rose-400 text-sm">
              Không thể thực hiện so sánh 2 dự án. Vui lòng thử lại.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#30363d]/80 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b949e] shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Compare powered by Gemini 2.5
            Flash
          </span>

          <Button
            size="sm"
            onClick={onClose}
            className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs rounded-xl cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
