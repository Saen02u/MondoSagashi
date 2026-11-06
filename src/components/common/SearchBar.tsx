import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  resultCount,
  totalCount,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-500 flex items-center">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="제목, 채널명, 내용, 태그로 검색..."
          className="w-full h-11 pl-10 pr-24 bg-[#111722] border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm rounded-lg focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-colors shadow-sm"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {value && (
            <button
              onClick={onClear}
              type="button"
              aria-label="검색어 지우기"
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
            {resultCount}/{totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};
