import React, { useState, useEffect, useMemo, useCallback } from 'react';
import rawData from './data/videos.json';
import { Video, VideoArchiveData } from './types/video';
import { filterVideos, getTagsWithCounts } from './lib/search';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchBar } from './components/common/SearchBar';
import { TagFilter } from './components/tag/TagFilter';
import { VideoList } from './components/video/VideoList';
import { VideoDetail } from './components/video/VideoDetail';
import { NotFound } from './components/common/NotFound';

const archiveData = rawData as VideoArchiveData;
const allVideos: Video[] = archiveData.videos;

/**
 * Extracts current video ID from window.location search parameters
 * Supports both /videos?id=... and ?id=... across static base paths
 */
function getVideoIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('id');
}

/**
 * Formats video detail URL supporting GitHub Pages basePath
 */
function formatVideoUrl(id: string): string {
  const currentPath = window.location.pathname;
  // If already ending with videos or videos.html, retain; else route to /videos
  const basePath = currentPath.endsWith('/')
    ? currentPath.slice(0, -1)
    : currentPath.replace(/\/videos(\.html)?$/, '');
  return `${basePath}/videos?id=${encodeURIComponent(id)}`;
}

function formatHomeUrl(): string {
  const currentPath = window.location.pathname;
  const basePath = currentPath.replace(/\/videos(\.html)?$/, '');
  return basePath || '/';
}

export default function App() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(() => getVideoIdFromUrl());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const id = getVideoIdFromUrl();
      setCurrentVideoId(id);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handlers
  const handleSelectVideo = useCallback((videoId: string) => {
    setCurrentVideoId(videoId);
    const newUrl = formatVideoUrl(videoId);
    window.history.pushState({ videoId }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigateHome = useCallback(() => {
    setCurrentVideoId(null);
    const homeUrl = formatHomeUrl();
    window.history.pushState(null, '', homeUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Tag filter handlers
  const handleToggleTag = useCallback((tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  }, []);

  const handleSelectSingleTag = useCallback((tagName: string) => {
    setSelectedTags([tagName]);
    handleNavigateHome();
  }, [handleNavigateHome]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
  }, []);

  // Filtered video list
  const filteredVideos = useMemo(() => {
    return filterVideos(allVideos, searchQuery, selectedTags);
  }, [searchQuery, selectedTags]);

  // Tag counts computed from all videos
  const tagsWithCounts = useMemo(() => {
    return getTagsWithCounts(allVideos);
  }, []);

  // Find active video if in detail view
  const activeVideo = useMemo(() => {
    if (!currentVideoId) return null;
    return allVideos.find((v) => v.id === currentVideoId) || null;
  }, [currentVideoId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090D12] text-slate-100 selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Bar Contract compliant Header */}
      <Header
        totalCount={allVideos.length}
        currentView={currentVideoId ? 'detail' : 'list'}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
        {currentVideoId ? (
          activeVideo ? (
            <VideoDetail
              video={activeVideo}
              onNavigateHome={handleNavigateHome}
              onSelectTag={handleSelectSingleTag}
            />
          ) : (
            <NotFound
              videoId={currentVideoId}
              onNavigateHome={handleNavigateHome}
            />
          )
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Editorial Lead Section */}
            <div className="border-b border-slate-800/80 pb-6 sm:pb-8 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400/90 mb-2">
                <span>VOD Record Archive</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">다시보기 및 방송 메모</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 mb-3">
                YouTube 방송 다시보기 아카이브
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                라이브 방송 영상과 상세 타임라인, 토론 주제 및 코드 스니펫 메모를 검색하고 분류할 수 있는 정적 텍스트 아카이브입니다.
              </p>
            </div>

            {/* Filter and Search Utility Box */}
            <div className="space-y-4 rounded-xl border border-slate-800/80 bg-[#0d121a] p-4 sm:p-5 shadow-sm">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                resultCount={filteredVideos.length}
                totalCount={allVideos.length}
              />

              <TagFilter
                tags={tagsWithCounts}
                selectedTags={selectedTags}
                onToggleTag={handleToggleTag}
                onResetTags={() => setSelectedTags([])}
              />
            </div>

            {/* Search Results Summary Strip */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
              <span>
                검색 결과{' '}
                <strong className="text-amber-400 font-semibold tabular-nums">
                  {filteredVideos.length}
                </strong>
                편
                {(searchQuery || selectedTags.length > 0) && (
                  <span className="text-slate-500 ml-1.5">
                    (전체 {allVideos.length}편 중 필터링됨)
                  </span>
                )}
              </span>

              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={handleResetFilters}
                  className="text-amber-400/90 hover:text-amber-300 hover:underline transition-colors text-[11px]"
                >
                  필터 모두 해제
                </button>
              )}
            </div>

            {/* Video Cards Grid */}
            <VideoList
              videos={filteredVideos}
              searchQuery={searchQuery}
              selectedTags={selectedTags}
              onSelectVideo={handleSelectVideo}
              onTagClick={handleToggleTag}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
