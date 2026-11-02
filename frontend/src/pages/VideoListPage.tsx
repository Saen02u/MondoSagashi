import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Inbox, ExternalLink, Youtube, Database, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Tag as TagIcon } from 'lucide-react';
import { fetchVideos, fetchTags } from '../api/videoApi.ts';
import { VideoCard } from '../components/VideoCard.tsx';
import { VideoSkeleton } from '../components/VideoSkeleton.tsx';
import type { Video, Tag, PageResponse } from '../types/video.ts';

interface VideoListPageProps {
  onSelectVideo?: (videoId: string) => void;
}

/**
 * 영상 목록 및 검색/필터/정렬/페이지네이션 페이지
 */
export const VideoListPage: React.FC<VideoListPageProps> = ({ onSelectVideo }) => {
  // 상태 관리: 데이터, 로딩, 에러
  const [pageData, setPageData] = useState<PageResponse<Video>>({
    content: [],
    page: 0,
    size: 6,
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 검색, 필터, 정렬, 페이지 상태
  const [queryInput, setQueryInput] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'title'>('latest');
  const [currentPage, setCurrentPage] = useState<number>(0);

  // 태그 목록 로드
  useEffect(() => {
    fetchTags()
      .then((data) => setTags(data))
      .catch((err) => console.error('태그 조회 실패:', err));
  }, []);

  // 영상 목록 조회
  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchVideos({
        query: activeQuery,
        tag: selectedTag || undefined,
        sort: sortOrder,
        page: currentPage,
        size: 6,
      });
      setPageData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [activeQuery, selectedTag, sortOrder, currentPage]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // 검색 폼 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setActiveQuery(queryInput);
  };

  // 태그 필터 클릭 핸들러
  const handleTagClick = (tagName: string) => {
    setCurrentPage(0);
    setSelectedTag((prev) => (prev === tagName ? '' : tagName));
  };

  // 정렬 변경 핸들러
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'latest' | 'oldest' | 'title');
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Mondo (@Mondo2233) 전용 채널 헤더 */}
      <section className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/40 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=160&auto=format&fit=crop&q=80"
                  alt="Mondo 프로필"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                <Youtube className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Mondo (@Mondo2233)</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-900/60 text-red-300 border border-red-700/50">
                  공식 채널 전용
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Apex Legends & 종합 게임 스트리머 Mondo의 라이브 방송 다시보기 아카이브입니다.
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <a
                  href="https://www.youtube.com/@Mondo2233"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors font-medium"
                >
                  <span>https://www.youtube.com/@Mondo2233</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              GET /api/v1/videos
            </span>
            <button
              onClick={loadVideos}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>
        </div>
      </section>

      {/* 검색, 필터 및 정렬 바 */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* 검색 입력 폼 */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="영상 제목 검색 (예: 에이펙스, 마스터, 치지직)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              검색
            </button>
            {activeQuery && (
              <button
                type="button"
                onClick={() => {
                  setQueryInput('');
                  setActiveQuery('');
                  setCurrentPage(0);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs transition-colors"
              >
                초기화
              </button>
            )}
          </form>

          {/* 정렬 드롭다운 */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="latest">최신 등록순</option>
              <option value="oldest">오래된순</option>
              <option value="title">제목 가나다순</option>
            </select>
          </div>
        </div>

        {/* 태그 필터 칩 목록 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <button
            type="button"
            onClick={() => handleTagClick('')}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors shrink-0 ${
              selectedTag === ''
                ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            전체 태그
          </button>
          {tags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onClick={() => handleTagClick(tag.name)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-colors shrink-0 ${
                selectedTag === tag.name
                  ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </section>

      {/* 본문 영역: 상태별 조건부 렌더링 */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-bold text-base">라이브 다시보기 영상 아카이브</h3>
          </div>
          {!isLoading && !error && (
            <span className="text-xs text-slate-400">
              총 {pageData.totalElements}개 영상 중 {(currentPage * pageData.size) + 1}-
              {Math.min((currentPage + 1) * pageData.size, pageData.totalElements)}번째
            </span>
          )}
        </div>

        {/* 1. 로딩 상태 */}
        {isLoading && (
          <div
            data-testid="video-loading-state"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <VideoSkeleton />
            <VideoSkeleton />
            <VideoSkeleton />
          </div>
        )}

        {/* 2. 오류 상태 */}
        {!isLoading && error && (
          <div
            data-testid="video-error-state"
            className="p-6 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex flex-col items-center text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-amber-900/40 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-200">영상 목록을 불러올 수 없습니다</h4>
              <p className="text-xs text-slate-300 max-w-md">{error}</p>
            </div>
            <button
              onClick={loadVideos}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md shadow-amber-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>다시 시도하기</span>
            </button>
          </div>
        )}

        {/* 3. 빈 목록 상태 */}
        {!isLoading && !error && pageData.content.length === 0 && (
          <div
            data-testid="video-empty-state"
            className="p-12 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col items-center text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">조건에 일치하는 영상이 없습니다</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                {activeQuery || selectedTag
                  ? '검색어 또는 태그 필터를 변경하여 다시 검색해 보세요.'
                  : '등록된 라이브 다시보기 영상이 없습니다.'}
              </p>
            </div>
            {(activeQuery || selectedTag) && (
              <button
                onClick={() => {
                  setQueryInput('');
                  setActiveQuery('');
                  setSelectedTag('');
                  setCurrentPage(0);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
              >
                검색 및 필터 초기화
              </button>
            )}
          </div>
        )}

        {/* 4. 정상 영상 목록 그리드 */}
        {!isLoading && !error && pageData.content.length > 0 && (
          <>
            <div
              data-testid="video-list-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {pageData.content.map((video) => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  onSelectVideo={onSelectVideo}
                />
              ))}
            </div>

            {/* 페이지네이션 바 */}
            {pageData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={!pageData.hasPrevious}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>이전</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pageData.totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPage(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-mono font-medium transition-colors ${
                        currentPage === idx
                          ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!pageData.hasNext}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>다음</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
