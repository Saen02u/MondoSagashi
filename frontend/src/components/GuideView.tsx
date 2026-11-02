import React from 'react';
import { BookOpen, CheckCircle2, ShieldCheck, Code2, Cpu, Database } from 'lucide-react';

export const GuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Learning Principles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-semibold text-lg">초기 환경 구성 학습 포인트</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>1. Java 21 & Spring Boot 3.3.5 환경 분리</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Java 21의 가상 스레드(Virtual Threads) 지원과 최신 LTS 생태계를 활용합니다. 초기 단계에서는 과도한 설정(JPA, DB, Security) 없이 Spring Web과 테스트 의존성만 배치하여 빌드 검증을 단순화했습니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>2. 프론트엔드-백엔드 포트 분리와 프록시</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              프론트엔드(Vite, Port 3000)와 백엔드(Spring Boot, Port 8080)가 서로 다른 포트에서 실행되므로, Vite 개발 서버의 Reverse Proxy 설정(<code className="text-cyan-300">/api → 8080</code>)과 Spring Boot의 CORS 설정을 적용했습니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>3. 테스트 주도 환경 (JUnit 5 + Vitest)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              백엔드는 MockMvc 슬라이스 테스트로 HTTP 계층을 단위 검증하고, 프론트엔드는 Vitest와 React Testing Library를 구성하여 컴포넌트 렌더링을 사전에 검증합니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Database className="w-4 h-4 text-amber-400" />
              <span>4. 점진적 구현 원칙 준수</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              지침에 명시된 원칙에 따라 현재 단계에서 불필요한 복잡성(PostgreSQL, Spring Security, 외부 API 키)을 배제하고, 확실하게 실행 및 테스트 가능한 베이스라인을 구축했습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Completed & Next Milestones Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-base mb-4">구현 완료 내역 및 향후 로드맵</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-emerald-900/40">
            <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-xs font-bold mt-0.5">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-medium text-emerald-300">Phase 1: PostgreSQL & Spring Data JPA + 검색·필터·페이징</h4>
              <p className="text-xs text-slate-400">
                Channel, Video, Tag, video_tags N:M 매핑, 제목 검색, 채널 필터, 다중 태그 필터, 정렬, 시점 공유(?videoId=&t=)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-emerald-900/40">
            <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-xs font-bold mt-0.5">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-medium text-emerald-300">Phase 2: Spring Security 관리자 인증 & 타임스탬프 메모 CRUD</h4>
              <p className="text-xs text-slate-400">
                세션 기반 인증, CSRF 방어 (CookieCsrfTokenRepository), BCrypt 단방향 해싱, 공개 조회 + 관리자 권한 검사(@PreAuthorize), positionSeconds &gt;= 0 정수 검증
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-emerald-900/40">
            <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-xs font-bold mt-0.5">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-medium text-emerald-300">Phase 3: YouTube Data API v3 연동 및 멱등 동기화</h4>
              <p className="text-xs text-slate-400">
                공식 API 기반 업로드 재생목록 순회 (할당량 50~100배 절약: 1 unit/50 items), youtube_video_id UNIQUE 멱등성, 관리자 태그/메모 보존, sync_runs 감사 기록 및 수동 동기화 관리
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">
              4
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Phase 4: 자동 스케줄링 및 주기적 백그라운드 동기화</h4>
              <p className="text-xs text-slate-400">
                Spring @Scheduled 또는 분산 스케줄러를 통한 주기적 자동 동기화 배치 파이프라인 구축 (별도 단계)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
