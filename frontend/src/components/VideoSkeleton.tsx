import React from 'react';

/**
 * 로딩 상태를 표시하는 스켈레톤 카드 컴포넌트
 */
export const VideoSkeleton: React.FC = () => {
  return (
    <div
      data-testid="video-skeleton"
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between"
    >
      <div className="aspect-video bg-slate-800/80 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-800 rounded w-5/6" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2" />
        <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center">
          <div className="h-3 bg-slate-800/40 rounded w-16" />
          <div className="h-3 bg-slate-800/40 rounded w-20" />
        </div>
      </div>
    </div>
  );
};
