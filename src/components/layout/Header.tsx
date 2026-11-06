import React from 'react';
import { Film, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  currentView: 'list' | 'detail';
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  currentView,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D12]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateHome}
            className="group flex items-center gap-2.5 text-left text-slate-100 hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded-sm"
          >
            <div className="w-8 h-8 rounded border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:border-amber-400/50 transition-colors">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight block leading-tight">
                MondoSagashi
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 block font-mono">
                YouTube VOD Archive
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Status & Quick Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>아카이브 기록</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-400 font-medium tabular-nums">{totalCount}</span>
          <span>편 보관 중</span>
        </div>

        {/* Zone 3: Primary Action / Back Button */}
        <div className="flex items-center gap-3 shrink-0">
          {currentView === 'detail' ? (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 rounded hover:bg-slate-800 hover:text-amber-300 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>목록으로 돌아가기</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 sm:hidden font-mono">
              <span className="text-amber-400 font-semibold tabular-nums">{totalCount}</span> 편
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
