import React from 'react';
import { Video, Layers, Terminal, BookOpen, Shield, LogIn, LogOut, RefreshCw } from 'lucide-react';
import type { AuthStatus } from '../types/auth.ts';

interface NavbarProps {
  activeTab: 'overview' | 'videos' | 'architecture' | 'guide';
  onTabChange: (tab: 'overview' | 'videos' | 'architecture' | 'guide') => void;
  authStatus?: AuthStatus;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenSyncModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  authStatus = { authenticated: false, username: null, role: null },
  onOpenLogin,
  onLogout,
  onOpenSyncModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg tracking-tight">YouTube Live Archive</h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-950 text-red-400 border border-red-800/40">
                Phase 2 : 관리자 인증 & 시점 메모
              </span>
            </div>
            <p className="text-xs text-slate-400">Spring Boot (Java 21) & React (TypeScript) 모듈형 아키텍처</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onTabChange('videos')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span>영상 아카이브</span>
            </button>
            <button
              onClick={() => onTabChange('overview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>실행 환경 & 상태</span>
            </button>
            <button
              onClick={() => onTabChange('architecture')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>도메인 아키텍처</span>
            </button>
            <button
              onClick={() => onTabChange('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>학습 & 보안 가이드</span>
            </button>
          </nav>

          {/* 관리자 인증 상태 버튼 */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {authStatus.authenticated ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-medium">
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span>관리자 ({authStatus.username})</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenSyncModal}
                  title="YouTube Data API v3 동기화 관리"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-sm shadow-red-600/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">YouTube 동기화</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  title="로그아웃"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>관리자 로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
