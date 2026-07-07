'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@heroui/react';
import {
  BookOpen,
  Users,
  Calendar,
  Code2,
  Search,
  ChevronDown,
  Check,
  Sparkles,
  Download,
  Printer,
} from 'lucide-react';

interface FilterBarProps {
  activeTab: 'repositories' | 'developers';
  onTabChange: (tab: 'repositories' | 'developers') => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isAiSearchMode: boolean;
  onToggleAiSearchMode: () => void;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
}

const LANGUAGES = [
  { label: 'All Languages', value: '', color: '#8b949e' },
  { label: 'JavaScript', value: 'javascript', color: '#f1e05a' },
  { label: 'TypeScript', value: 'typescript', color: '#3178c6' },
  { label: 'Python', value: 'python', color: '#3572A5' },
  { label: 'Rust', value: 'rust', color: '#deb887' },
  { label: 'Go', value: 'go', color: '#00ADD8' },
  { label: 'C++', value: 'c++', color: '#f34b7d' },
  { label: 'PHP', value: 'php', color: '#4F5D95' },
  { label: 'Java', value: 'java', color: '#b07219' },
  { label: 'HTML', value: 'html', color: '#e34c26' },
  { label: 'CSS', value: 'css', color: '#563d7c' },
  { label: 'Vue', value: 'vue', color: '#41b883' },
  { label: 'C#', value: 'c#', color: '#178600' },
];

const PERIODS = [
  { label: 'Today', value: 'daily' },
  { label: 'This week', value: 'weekly' },
  { label: 'This month', value: 'monthly' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  onTabChange,
  selectedLanguage,
  onLanguageChange,
  selectedPeriod,
  onPeriodChange,
  searchQuery,
  onSearchQueryChange,
  isAiSearchMode,
  onToggleAiSearchMode,
  onExportMarkdown,
  onExportPdf,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangLabel =
    LANGUAGES.find((l) => l.value === selectedLanguage)?.label || 'All Languages';

  const currentPeriodLabel = PERIODS.find((p) => p.value === selectedPeriod)?.label || 'Today';

  return (
    <div className="bg-[#090d16]/90 border-b border-[#30363d]/80 py-4 px-4 sm:px-6 lg:px-8 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Tab Switches */}
        <div className="flex bg-[#161c2b] p-1.5 rounded-2xl border border-white/10 self-start md:self-auto gap-1 shadow-inner">
          <Button
            size="sm"
            onClick={() => onTabChange('repositories')}
            className={`text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 px-4 py-2 cursor-pointer ${
              activeTab === 'repositories'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-900/30 border border-sky-400/30'
                : 'bg-transparent text-[#8b949e] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Repositories
          </Button>

          <Button
            size="sm"
            onClick={() => onTabChange('developers')}
            className={`text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 px-4 py-2 cursor-pointer ${
              activeTab === 'developers'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/30 border border-purple-400/30'
                : 'bg-transparent text-[#8b949e] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Developers
          </Button>
        </div>

        {/* Center/Right: Search Bar, Export & Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Mode Toggle & Input */}
          <div className="relative flex-1 sm:w-80 min-w-[240px] flex items-center">
            {isAiSearchMode ? (
              <Sparkles className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none animate-pulse" />
            ) : (
              <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
            <input
              type="text"
              placeholder={
                isAiSearchMode
                  ? 'Hỏi AI tiếng Việt (VD: AI assistant Python)...'
                  : 'Lọc theo từ khóa...'
              }
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className={`w-full text-white text-xs sm:text-sm pl-9 pr-24 py-2.5 rounded-xl border shadow-sm transition-all placeholder:text-[#6e7681] focus:outline-none ${
                isAiSearchMode
                  ? 'bg-purple-950/30 border-purple-500/50 hover:border-purple-400 focus:border-purple-400'
                  : 'bg-[#161c2b] border-white/10 hover:border-purple-500/60 focus:border-purple-500'
              }`}
            />

            {/* AI Mode Toggle Badge inside Input */}
            <button
              onClick={onToggleAiSearchMode}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                isAiSearchMode
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/40'
                  : 'bg-[#21262d] text-[#8b949e] hover:text-white border border-white/10'
              }`}
              title="Chuyển đổi chế độ Tìm kiếm AI Semantic"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>{isAiSearchMode ? 'AI Search' : 'Chế độ AI'}</span>
            </button>
          </div>

          {/* Custom Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setPeriodOpen(false);
              }}
              className="flex items-center gap-2 bg-[#161c2b] hover:bg-[#1f273b] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-sky-500/60 focus:outline-none transition-all shadow-md cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-sky-400" />
              <span className="font-semibold">{currentLangLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8b949e] transition-transform ${langOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#121826]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn max-h-72 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      onLanguageChange(lang.value);
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                      selectedLanguage === lang.value
                        ? 'bg-purple-600/30 text-white font-bold border border-purple-500/40'
                        : 'text-gray-300 hover:bg-[#1f273b] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span>{lang.label}</span>
                    </div>
                    {selectedLanguage === lang.value && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Time Period Selector */}
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => {
                setPeriodOpen(!periodOpen);
                setLangOpen(false);
              }}
              className="flex items-center gap-2 bg-[#161c2b] hover:bg-[#1f273b] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-purple-500/60 focus:outline-none transition-all shadow-md cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">{currentPeriodLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8b949e] transition-transform ${periodOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {periodOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#121826]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn">
                {PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => {
                      onPeriodChange(period.value);
                      setPeriodOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                      selectedPeriod === period.value
                        ? 'bg-purple-600/30 text-white font-bold border border-purple-500/40'
                        : 'text-gray-300 hover:bg-[#1f273b] hover:text-white'
                    }`}
                  >
                    <span>{period.label}</span>
                    {selectedPeriod === period.value && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExportMarkdown}
              className="p-2.5 bg-[#161c2b] hover:bg-[#21262d] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Tải bản tin dạng Markdown (.md)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export .md</span>
            </button>

            <button
              onClick={onExportPdf}
              className="p-2.5 bg-[#161c2b] hover:bg-[#21262d] text-sky-400 hover:text-sky-300 border border-sky-500/30 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="In / Xuất bản tin dạng PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
