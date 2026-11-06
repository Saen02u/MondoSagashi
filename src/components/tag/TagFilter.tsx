import React from 'react';
import { TagWithCount } from '../../types/video';
import { RotateCcw } from 'lucide-react';

interface TagFilterProps {
  tags: TagWithCount[];
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
  onResetTags: () => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onToggleTag,
  onResetTags,
}) => {
  const hasSelected = selectedTags.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            태그 필터
          </span>
          {hasSelected && (
            <span className="text-[11px] text-amber-400 font-mono">
              ({selectedTags.length}개 선택됨)
            </span>
          )}
        </div>
        {hasSelected && (
          <button
            onClick={onResetTags}
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-300 transition-colors py-0.5 px-2 rounded hover:bg-slate-800/80"
          >
            <RotateCcw className="w-3 h-3" />
            <span>선택 초기화</span>
          </button>
        )}
      </div>

      {/* Horizontal scroll on mobile, flex-wrap on desktop */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-800 no-scrollbar sm:flex-wrap">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <button
              key={tag.name}
              type="button"
              onClick={() => onToggleTag(tag.name)}
              className={`group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all whitespace-nowrap shrink-0 border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${
                isSelected
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm font-medium'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>#{tag.name}</span>
              <span
                className={`text-[10px] font-mono tabular-nums px-1 py-0.2 rounded ${
                  isSelected
                    ? 'bg-amber-500/30 text-amber-200'
                    : 'bg-slate-800/90 text-slate-500 group-hover:text-slate-400'
                }`}
              >
                {tag.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
