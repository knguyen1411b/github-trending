'use client';

import React from 'react';
import { ExternalLink, Flame, Heart, Trophy, User } from 'lucide-react';
import { ScrapedDeveloper } from '@/lib/scraper';

interface DeveloperCardProps {
  developer: ScrapedDeveloper;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({ developer }) => {
  // Rank badge styling helper
  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1)
      return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20';
    if (rank === 2)
      return 'bg-gradient-to-r from-slate-400/20 to-slate-200/20 text-slate-200 border-slate-400/40 shadow-slate-400/20';
    if (rank === 3)
      return 'bg-gradient-to-r from-amber-700/20 to-amber-600/20 text-amber-400 border-amber-700/40 shadow-amber-700/20';
    return 'bg-[#1c2333] text-[#8b949e] border-white/10';
  };

  return (
    <div className="relative group rounded-2xl bg-gradient-to-b from-[#161c2b] to-[#0e131f] border border-white/10 hover:border-purple-500/40 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Rank Badge */}
          <div
            className={`font-bold text-xs border rounded-xl px-3 py-1.5 flex items-center gap-1 shadow-md ${getRankBadgeStyle(developer.rank)}`}
          >
            {developer.rank <= 3 ? (
              <Trophy className="w-3.5 h-3.5" />
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
            <span>#{developer.rank}</span>
          </div>

          {/* Avatar with Ring Glow */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300" />
            <img
              src={developer.avatar}
              alt={developer.name}
              className="relative w-12 h-12 rounded-full border-2 border-[#121723] shadow-md object-cover"
            />
          </div>

          {/* Developer Info */}
          <div className="space-y-1">
            <a
              href={developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-white hover:text-purple-400 flex items-center gap-2 transition-colors"
            >
              <span>{developer.name}</span>
              <span className="text-xs text-[#8b949e] font-normal">({developer.username})</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8b949e]" />
            </a>

            {/* Popular Repo Highlight */}
            {developer.popularRepo && developer.popularRepo.name && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 w-fit">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-[10px] uppercase tracking-wider text-amber-400">
                  Popular:
                </span>
                <a
                  href={developer.popularRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-amber-200"
                >
                  {developer.popularRepo.name}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sponsor Button */}
        {developer.sponsorUrl && (
          <a
            href={developer.sponsorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-end sm:self-auto shrink-0"
          >
            <button className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500 animate-pulse" />
              <span>Sponsor</span>
            </button>
          </a>
        )}
      </div>
    </div>
  );
};
