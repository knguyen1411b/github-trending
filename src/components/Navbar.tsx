'use client';

import React from 'react';
import { Button, Chip } from '@heroui/react';
import { Flame, Send, Sparkles, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#30363d]/80 bg-[#090d16]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Status */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
            <div className="relative p-2 rounded-xl bg-[#0d1117] border border-white/10 text-white flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              GitHub Trending
            </span>

            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                className="bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
                Gemini 2.5 AI
              </Chip>

              <span className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Activity className="w-3 h-3 animate-pulse" /> Live
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <a href="https://t.me/my_gh_trending_ai_bot" target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="font-semibold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 border border-emerald-400/30 flex items-center gap-1.5 cursor-pointer rounded-xl transition-all hover:scale-105"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Bot</span>
            </Button>
          </a>

          <a
            href="https://github.com/knguyen1411b"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile knguyen1411b"
          >
            <Button
              size="sm"
              className="bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d] min-w-0 p-2 cursor-pointer rounded-xl transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};
