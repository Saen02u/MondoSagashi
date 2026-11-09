import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with smart ellipsis window
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      aria-label="영상 목록 페이지네이션"
      className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Range Status Info */}
      <div className="text-xs font-mono text-slate-400 order-2 sm:order-1">
        <span>총 </span>
        <strong className="text-amber-400 font-semibold tabular-nums">{totalItems}</strong>
        <span>개 중 </span>
        <span className="text-slate-200 tabular-nums">
          {startItem}–{endItem}
        </span>
        <span>번째 영상 (페이지 </span>
        <span className="text-slate-200 tabular-nums">{currentPage}</span>
        <span> / </span>
        <span className="tabular-nums">{totalPages}</span>
        <span>)</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First Page */}
        <button
          onClick={() => handlePageSelect(1)}
          disabled={currentPage === 1}
          aria-label="첫 페이지로 이동"
          title="첫 페이지"
          className="p-2 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-slate-700/60"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageSelect(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지로 이동"
          title="이전 페이지"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-800"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">이전</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-xs text-slate-600 select-none font-mono"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={item}
                onClick={() => handlePageSelect(item)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`min-w-8 h-8 px-2 text-xs font-mono tabular-nums rounded transition-colors border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${
                  isCurrent
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => handlePageSelect(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지로 이동"
          title="다음 페이지"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-800"
        >
          <span className="hidden sm:inline">다음</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageSelect(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="마지막 페이지로 이동"
          title="마지막 페이지"
          className="p-2 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-slate-700/60"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
