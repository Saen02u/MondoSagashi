import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar.tsx';
import { EnvironmentCard } from '../components/EnvironmentCard.tsx';
import { ArchitectureView } from '../components/ArchitectureView.tsx';
import { GuideView } from '../components/GuideView.tsx';
import { VideoListPage } from './VideoListPage.tsx';
import { VideoDetailPage } from './VideoDetailPage.tsx';
import { AdminLoginModal } from '../components/AdminLoginModal.tsx';
import { SyncModal } from '../components/SyncModal.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { GitBranch, Terminal } from 'lucide-react';
import { getAuthStatus, logout, initCsrf } from '../api/authApi.ts';
import type { AuthStatus } from '../types/auth.ts';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'architecture' | 'guide'>('videos');

  // 영상 상세 및 시점 공유(t 파라미터) 상태
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [initialTimestamp, setInitialTimestamp] = useState<number>(0);

  // 관리자 인증 상태 및 모달
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    username: null,
    role: null,
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncRefreshCount, setSyncRefreshCount] = useState(0);

  // URL 쿼리 파라미터(?videoId=...&t=...) 감지하여 상세 페이지로 바로 진입
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vid = params.get('videoId');
    const t = params.get('t');

    if (vid) {
      setSelectedVideoId(vid);
      setActiveTab('videos');
      if (t) {
        setInitialTimestamp(parseInt(t, 10) || 0);
      }
    }
  }, []);

  // 인증 상태 및 CSRF 토큰 초기 로드
  useEffect(() => {
    initCsrf().catch(() => {});
    getAuthStatus()
      .then(setAuthStatus)
      .catch(() => setAuthStatus({ authenticated: false, username: null, role: null }));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      setAuthStatus({ authenticated: false, username: null, role: null });
    }
  };

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    setInitialTimestamp(0);
    // URL 업데이트 (히스토리 유지)
    const url = new URL(window.location.href);
    url.searchParams.set('videoId', videoId);
    url.searchParams.delete('t');
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToList = () => {
    setSelectedVideoId(null);
    setInitialTimestamp(0);
    const url = new URL(window.location.href);
    url.searchParams.delete('videoId');
    url.searchParams.delete('t');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'videos') {
            setSelectedVideoId(null);
          }
        }}
        authStatus={authStatus}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Project Header Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="ready" text="YouTube Data API v3 수집·동기화 (할당량 50배 절약)" />
                <StatusBadge status="ready" text="관리자 인증 (세션 + CSRF + BCrypt)" />
                <StatusBadge status="ready" text="타임스탬프 메모 CRUD (0초 이상 검증)" />
                <StatusBadge status="ready" text="영상 상세 & 시점 공유(t)" />
                <StatusBadge status="info" text="video_tags N:M 매핑" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Mondo (@Mondo2233) 라이브 다시보기 아카이브
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                공식 채널의 라이브 방송을 검색, 태그 필터링, 정렬 및 페이지네이션으로 편리하게 탐색하고,
                특정 재생 시점(초 단위 t 파라미터) 공유 및 관리자 타임스탬프 메모를 작성할 수 있습니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[11px] text-slate-400 font-mono">Backend API</p>
                  <p className="text-xs font-semibold text-white font-mono">http://localhost:8080</p>
                </div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-[11px] text-slate-400 font-mono">Frontend Web</p>
                  <p className="text-xs font-semibold text-white font-mono">http://localhost:3000</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Content Display */}
        {activeTab === 'videos' && (
          <section className="space-y-6">
            {selectedVideoId ? (
              <VideoDetailPage
                videoId={selectedVideoId}
                initialTimestampSeconds={initialTimestamp}
                isAdmin={authStatus.authenticated}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onBack={handleBackToList}
              />
            ) : (
              <VideoListPage key={syncRefreshCount} onSelectVideo={handleSelectVideo} />
            )}
          </section>
        )}

        {activeTab === 'overview' && (
          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">실행 환경 구성 및 검증</h3>
              <p className="text-xs text-slate-400">
                백엔드와 프론트엔드의 실행 상태, 통신 경로, 독립 테스트 도구를 확인합니다.
              </p>
            </div>
            <EnvironmentCard />
          </section>
        )}

        {activeTab === 'architecture' && (
          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">전체 시스템 및 도메인 아키텍처</h3>
              <p className="text-xs text-slate-400">
                7개 핵심 패키지 구조와 video_tags 다대다 매핑, REST API 규격입니다.
              </p>
            </div>
            <ArchitectureView />
          </section>
        )}

        {activeTab === 'guide' && (
          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">개발 및 학습 가이드</h3>
              <p className="text-xs text-slate-400">
                학습 목표, 설계 결정의 이유, 그리고 향후 구현 단계에 대한 로드맵입니다.
              </p>
            </div>
            <GuideView />
          </section>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <p>Mondo Live Archive · Spring Boot 3.3.5 & React 19 / TypeScript · 2026</p>
      </footer>

      {/* 관리자 로그인 모달 */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(newAuth) => {
          setAuthStatus(newAuth);
        }}
      />

      {/* YouTube Data API v3 동기화 관리 모달 */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncCompleted={() => setSyncRefreshCount((c) => c + 1)}
      />
    </div>
  );
};
