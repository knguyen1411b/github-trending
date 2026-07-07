'use client';

import React from 'react';
import { Card, CardContent, Button, Chip } from '@heroui/react';
import { Sparkles, RefreshCw, X, Loader2 } from 'lucide-react';

export interface AiSummaryData {
  [key: string]: unknown;
  purpose?: string;
  highlights?: string;
  useCases?: string;
}

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  repoName: string;
  loading: boolean;
  summary: AiSummaryData | null;
}

export const AiModal: React.FC<AiModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  repoName,
  loading,
  summary,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background Accent glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d]/80 pb-4 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg shadow-purple-500/30 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white leading-tight">
                Phân Tích Gemini 2.5 Flash
              </h3>
              <p className="text-xs text-sky-400 font-semibold mt-0.5">{repoName}</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onClose}
            className="bg-transparent text-[#8b949e] hover:text-white hover:bg-[#21262d] min-w-0 p-2 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              <p className="text-sm text-[#8b949e] font-medium animate-pulse">
                Gemini 2.5 Flash đang đọc file RAW README.md & phân tích chuyên sâu...
              </p>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              {/* 1. Purpose */}
              {summary.purpose && (
                <Card className="bg-[#161b22]/90 border border-emerald-500/30 rounded-2xl shadow-lg">
                  <CardContent className="p-4.5 space-y-2">
                    <Chip className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl">
                      🎯 1. MỤC ĐÍCH CỐT LÕI & BÀI TOÁN GIẢI QUYẾT
                    </Chip>
                    <p className="text-sm text-gray-200 leading-relaxed font-normal pt-1">
                      {summary.purpose}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 2. Highlights */}
              {summary.highlights && (
                <Card className="bg-[#161b22]/90 border border-amber-500/30 rounded-2xl shadow-lg">
                  <CardContent className="p-4.5 space-y-2">
                    <Chip className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl">
                      🚀 2. ĐIỂM NỔI BẬT KỸ THUẬT & KIẾN TRÚC
                    </Chip>
                    <p className="text-sm text-gray-200 leading-relaxed font-normal pt-1">
                      {summary.highlights}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 3. Use Cases */}
              {summary.useCases && (
                <Card className="bg-[#161b22]/90 border border-sky-500/30 rounded-2xl shadow-lg">
                  <CardContent className="p-4.5 space-y-2">
                    <Chip className="bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-xs rounded-xl">
                      💡 3. GỢI Ý ĐỐI TƯỢNG & TRƯỜNG HỢP SỬ DỤNG
                    </Chip>
                    <p className="text-sm text-gray-200 leading-relaxed font-normal pt-1">
                      {summary.useCases}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-rose-400 text-sm">
              Không thể tải bản phân tích từ AI. Vui lòng thử lại.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#30363d]/80 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b949e] shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Powered by Google Gemini 2.5 Flash
          </span>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                size="sm"
                isDisabled={loading}
                onClick={onRefresh}
                className="bg-[#21262d] hover:bg-[#30363d] text-sky-400 hover:text-sky-300 font-semibold text-xs border border-[#484f58] rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Tạo lại tóm tắt
              </Button>
            )}

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
    </div>
  );
};
