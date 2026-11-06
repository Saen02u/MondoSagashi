import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  selectedTags: string[];
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  selectedTags,
  onReset,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 bg-[#0d121a]/60 p-8 sm:p-12 text-center my-6">
      <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <SearchX className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">
        조건에 맞는 영상을 찾을 수 없습니다
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
        {searchQuery && (
          <span className="block">
            검색어 <strong className="text-amber-400">"{searchQuery}"</strong>
          </span>
        )}
        {selectedTags.length > 0 && (
          <span className="block mt-0.5">
            선택된 태그: {selectedTags.map((t) => `#${t}`).join(', ')}
          </span>
        )}
        다른 검색어를 입력하거나 태그 필터를 변경해 보세요.
      </p>
      <button
        onClick={onReset}
        type="button"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md hover:bg-amber-500/20 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>필터 및 검색어 초기화</span>
      </button>
    </div>
  );
};
