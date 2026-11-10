import React, { useState } from 'react';
import { TagWithCount } from '../../types/video';
import { RotateCcw, ChevronDown, ChevronUp, Tag } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const hasSelected = selectedTags.length > 0;

  return (
    <div className="w-full">
      {/* Header Bar with Title, Active Count, Reset, and Collapse Toggle */}
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="group flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded py-0.5"
          aria-expanded={!isCollapsed}
          title={isCollapsed ? '태그 필터 펼치기' : '태그 필터 접기'}
        >
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 group-hover:text-amber-300 font-mono transition-colors">
              태그 필터
            </span>
          </div>
          
          <span className="text-[11px] text-slate-500 font-mono">
            (총 {tags.length}개)
          </span>

          {hasSelected && (
            <span className="text-[11px] text-amber-400 font-mono font-medium">
              · {selectedTags.length}개 선택됨
            </span>
          )}

          <span className="text-slate-500 group-hover:text-amber-400 transition-colors ml-0.5">
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {hasSelected && (
            <button
              onClick={onResetTags}
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-300 transition-colors py-0.5 px-2 rounded hover:bg-slate-800/80"
              title="선택된 모든 태그 필터 해제"
            >
              <RotateCcw className="w-3 h-3" />
              <span>선택 초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* When Collapsed: show compact view (or selected tags only) */}
      {isCollapsed ? (
        hasSelected ? (
          <div className="pt-1 pb-1">
            <div className="flex items-center flex-wrap gap-1.5 text-xs">
              <span className="text-[11px] font-mono text-slate-500 mr-1">
                적용 중인 태그:
              </span>
              {selectedTags.map((tagName) => (
                <button
                  key={tagName}
                  type="button"
                  onClick={() => onToggleTag(tagName)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors font-medium font-mono"
                  title="클릭하여 태그 선택 해제"
                >
                  <span>#{tagName}</span>
                  <span className="text-[10px] opacity-75">✕</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="text-[11px] font-mono text-slate-400 hover:text-amber-300 hover:underline transition-colors ml-1"
              >
                + 다른 태그 추가하기
              </button>
            </div>
          </div>
        ) : (
          <div className="py-1.5 px-3 rounded bg-slate-900/40 border border-slate-800/60 text-xs text-slate-500 flex items-center justify-between">
            <span>태그 필터 목록이 접혀 있습니다.</span>
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="text-amber-400 hover:text-amber-300 hover:underline font-mono text-[11px]"
            >
              태그 전체 보기 ({tags.length}개)
            </button>
          </div>
        )
      ) : (
        /* When Expanded: Full tag cloud (horizontal scroll on mobile, flex-wrap on desktop) */
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-800 no-scrollbar sm:flex-wrap transition-all">
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
      )}
    </div>
  );
};
