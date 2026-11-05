import React from 'react';
import { Database, FolderTree, Key, Youtube, Tag, FileText, RefreshCw, Globe, CheckCircle, Table } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const domains = [
    {
      name: 'channel',
      desc: 'Mondo (@Mondo2233) 전용 채널 엔티티(Channel) 및 Repository',
      badge: 'JPA 구현 완료',
      icon: <Youtube className="w-4 h-4 text-red-400" />,
      color: 'border-red-900/40 bg-red-950/20 text-red-300',
      status: 'Channel Entity & Repository 연동',
    },
    {
      name: 'video',
      desc: '라이브 다시보기 Video 엔티티 (UNIQUE: youtubeVideoId), VideoRepository Fetch Join',
      badge: 'JPA 구현 완료',
      icon: <Database className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-900/40 bg-blue-950/20 text-blue-300',
      status: 'Video Entity & GET /api/v1/videos DB 조회',
    },
    {
      name: 'tag',
      desc: '영상 분류 및 필터링을 위한 Tag 엔티티 및 video_tags N:M 매핑 테이블',
      badge: 'JPA 구현 완료',
      icon: <Tag className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-900/40 bg-emerald-950/20 text-emerald-300',
      status: 'Tag Entity & N:M 연관관계 완성',
    },
    {
      name: 'note',
      desc: '재생 시점(타임스탬프) 메모 CRUD, positionSeconds >= 0 검증, 공개 조회 및 관리자 수정',
      badge: '보안 CRUD 완료',
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-900/40 bg-purple-950/20 text-purple-300',
      status: 'TimestampNote Entity, Service, Controller 완성',
    },
    {
      name: 'auth',
      desc: 'Spring Security 세션 기반 관리자 인증, CSRF 방어 (XSRF-TOKEN), BCrypt 비밀번호 해싱',
      badge: '보안 구현 완료',
      icon: <Key className="w-4 h-4 text-pink-400" />,
      color: 'border-pink-900/40 bg-pink-950/20 text-pink-300',
      status: 'ROLE_ADMIN 인가 & 세션 로그인/로그아웃',
    },
    {
      name: 'sync',
      desc: 'YouTube Data API v3 연동, 멱등 동기화, 관리자 태그/메모 보존, sync_runs 감사 기록, 할당량 50배 최적화',
      badge: 'API 동기화 완료',
      icon: <RefreshCw className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-900/40 bg-amber-950/20 text-amber-300',
      status: 'YouTubeApiClient & SyncRun 완성',
    },
    {
      name: 'global',
      desc: 'DataInitializer (Mondo 초기 영상/태그/메모/관리자 시딩), SecurityConfig, CORS, 예외 핸들러',
      badge: '공통 구현 완료',
      icon: <Globe className="w-4 h-4 text-teal-400" />,
      color: 'border-teal-900/40 bg-teal-950/20 text-teal-300',
      status: 'SecurityConfig & DataInitializer',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Database Schema Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Table className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold text-lg">PostgreSQL 테이블 매핑 및 연관관계 설계</h3>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800/40">
            JPA DDL: update
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">channels (채널 테이블)</span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">1</span>
            </div>
            <div className="font-mono text-xs text-slate-400 space-y-1">
              <p><span className="text-blue-400">id</span> (PK, BIGINT IDENTITY)</p>
              <p><span className="text-slate-300">channel_name</span> VARCHAR(100) NOT NULL</p>
              <p><span className="text-emerald-400">custom_url</span> VARCHAR(100) UNIQUE NOT NULL (@Mondo2233)</p>
              <p><span className="text-slate-300">youtube_channel_url</span> VARCHAR(255) NOT NULL</p>
              <p><span className="text-slate-300">thumbnail_url</span> VARCHAR(500)</p>
              <p><span className="text-slate-300">description</span> TEXT</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">videos (영상 테이블)</span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">N</span>
            </div>
            <div className="font-mono text-xs text-slate-400 space-y-1">
              <p><span className="text-blue-400">id</span> (PK, BIGINT IDENTITY)</p>
              <p><span className="text-emerald-400 font-bold">youtube_video_id</span> VARCHAR(50) UNIQUE NOT NULL</p>
              <p><span className="text-slate-300">title</span> VARCHAR(255) NOT NULL</p>
              <p><span className="text-slate-300">thumbnail_url</span> VARCHAR(500) NOT NULL</p>
              <p><span className="text-amber-400">channel_id</span> (FK → channels.id, NOT NULL)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">timestamp_notes (타임스탬프 메모)</span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/40">Phase 2</span>
            </div>
            <div className="font-mono text-xs text-slate-400 space-y-1">
              <p><span className="text-blue-400">id</span> (PK, BIGINT IDENTITY)</p>
              <p><span className="text-amber-400">video_id</span> (FK → videos.id, NOT NULL)</p>
              <p><span className="text-emerald-400 font-bold">position_seconds</span> INT (CHECK &gt;= 0) NOT NULL</p>
              <p><span className="text-slate-300">content</span> TEXT (1000자 이내) NOT NULL</p>
              <p><span className="text-slate-400">created_at / updated_at</span> TIMESTAMP</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">users (관리자 계정 테이블)</span>
              <span className="text-[10px] font-mono bg-pink-950 text-pink-300 px-2 py-0.5 rounded border border-pink-800/40">Spring Security</span>
            </div>
            <div className="font-mono text-xs text-slate-400 space-y-1">
              <p><span className="text-blue-400">id</span> (PK, BIGINT IDENTITY)</p>
              <p><span className="text-emerald-400 font-bold">username</span> VARCHAR(50) UNIQUE NOT NULL</p>
              <p><span className="text-slate-300">password_hash</span> VARCHAR(100) NOT NULL (BCrypt)</p>
              <p><span className="text-amber-400 font-bold">role</span> VARCHAR(20) NOT NULL (ROLE_ADMIN)</p>
              <p><span className="text-slate-400">created_at</span> TIMESTAMP</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">sync_runs (동기화 실행 감사 이력)</span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">Phase 3</span>
            </div>
            <div className="font-mono text-xs text-slate-400 space-y-1">
              <p><span className="text-blue-400">id</span> (PK, BIGINT IDENTITY)</p>
              <p><span className="text-amber-400">channel_id</span> (FK → channels.id, NOT NULL)</p>
              <p><span className="text-emerald-400 font-bold">status</span> VARCHAR(20) (SUCCESS, FAILED, IN_PROGRESS)</p>
              <p><span className="text-slate-300">total_items_fetched / new_items_inserted / items_updated</span> INT</p>
              <p><span className="text-slate-400">started_at / completed_at</span> TIMESTAMP</p>
              <p><span className="text-slate-400">error_message</span> TEXT (실패 원인 상세)</p>
              <p><span className="text-slate-300">triggered_by</span> VARCHAR(50)</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">연관관계 및 보안·동기화 설계:</strong> <code className="text-blue-300">Channel(1) - Video(N)</code>, <code className="text-purple-300">Video(1) - TimestampNote(N)</code>, <code className="text-amber-300">Channel(1) - SyncRun(N)</code>의 연관관계를 구성합니다. YouTube Data API v3 동기화 시 <code className="text-emerald-300">youtube_video_id UNIQUE</code> 제약으로 중복 저장을 원천 방지하며, 관리자가 부착한 태그와 시점 메모는 절대 덮어쓰지 않고 온전히 보존됩니다.
        </div>
      </div>

      {/* Package Domain View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FolderTree className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold text-lg">모듈형 모놀리식 (Modular Monolith) 백엔드 패키지</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((d) => (
            <div key={d.name} className={`p-4 rounded-xl border ${d.color} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {d.icon}
                    <span className="font-mono font-bold text-sm text-white">com.archive.youtube.{d.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800">
                    {d.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{d.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-800/40">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{d.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
