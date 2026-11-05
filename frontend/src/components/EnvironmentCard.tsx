import React, { useState } from 'react';
import { Server, Monitor, Check, RefreshCw, Copy, Terminal, Database } from 'lucide-react';
import { getBackendHealth } from '../api/health.ts';
import type { HealthCheckResponse } from '../types/index.ts';

export const EnvironmentCard: React.FC = () => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCheckHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBackendHealth();
      setHealth(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Database Setup Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Database (PostgreSQL 16 & JPA)</h3>
              <p className="text-xs text-slate-400">Spring Data JPA · Hibernate ddl-auto: update · Docker Compose</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-950 text-blue-400 border border-blue-800/40">
            Port 5432
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span>Docker Compose로 PostgreSQL 컨테이너 실행</span>
              <button
                onClick={() => copyToClipboard('docker compose up -d')}
                className="hover:text-white transition-colors"
                title="명령어 복사"
              >
                {copiedCmd === 'docker compose up -d' ? (
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-blue-400 select-all">$ docker compose up -d</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span>환경변수 설정 (.env.example 기반)</span>
              <span className="text-slate-500 text-[10px]">보안 관리</span>
            </div>
            <p className="text-slate-300 truncate">DB_HOST=localhost, DB_NAME=youtube_archive, DB_USER=postgres</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Environment Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Backend (Spring Boot)</h3>
                  <p className="text-xs text-slate-400">Java 21 · Spring Boot 3.3.5 · Spring Data JPA</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Port 8080
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span>실행 명령어 (개발 서버)</span>
                  <button
                    onClick={() => copyToClipboard('cd backend && ./mvnw spring-boot:run')}
                    className="hover:text-white transition-colors"
                    title="명령어 복사"
                  >
                    {copiedCmd === 'cd backend && ./mvnw spring-boot:run' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-emerald-400 select-all">$ cd backend && ./mvnw spring-boot:run</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span>JPA 및 웹 슬라이스 테스트 실행</span>
                  <button
                    onClick={() => copyToClipboard('cd backend && ./mvnw test')}
                    className="hover:text-white transition-colors"
                    title="명령어 복사"
                  >
                    {copiedCmd === 'cd backend && ./mvnw test' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-cyan-400 select-all">$ cd backend && ./mvnw test (6 tests passed)</p>
              </div>
            </div>
          </div>

          {/* Live Health Check Trigger */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-300">엔드포인트 실시간 통신 확인</span>
              <button
                onClick={handleCheckHealth}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>GET /api/health 호출</span>
              </button>
            </div>

            {health && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Status: {health.status}</span>
                </div>
                <p className="text-slate-300">{health.message}</p>
                <p className="text-slate-500 text-[10px]">응답 시각: {health.timestamp}</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs space-y-1">
                <p className="text-amber-400 font-medium">연결 안내:</p>
                <p className="text-slate-300 text-xs">
                  백엔드가 8080 포트에서 실행 중인지 확인하세요. 로컬 터미널에서 <code className="text-amber-300 font-mono">cd backend && ./mvnw spring-boot:run</code>을 실행하면 활성화됩니다.
                </p>
                <p className="text-slate-500 text-[11px] font-mono mt-1">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Frontend Environment Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Frontend (React + Vite)</h3>
                  <p className="text-xs text-slate-400">TypeScript · Tailwind CSS v4 · Vitest</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                Port 3000
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span>프론트엔드 개발 서버 실행</span>
                  <button
                    onClick={() => copyToClipboard('npm run dev')}
                    className="hover:text-white transition-colors"
                    title="명령어 복사"
                  >
                    {copiedCmd === 'npm run dev' ? (
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-cyan-400 select-all">$ npm run dev (or cd frontend && npm run dev)</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span>프론트엔드 단위 테스트 실행 (Vitest)</span>
                  <button
                    onClick={() => copyToClipboard('npm test')}
                    className="hover:text-white transition-colors"
                    title="명령어 복사"
                  >
                    {copiedCmd === 'npm test' ? (
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-emerald-400 select-all">$ npm test (5 tests passed)</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Vite 프록시 구성:</span>
              <code className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                /api → http://localhost:8080
              </code>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              프론트엔드와 백엔드가 분리된 포트(3000, 8080)에서 실행되며 CORS 및 Vite Reverse Proxy로 연동됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
