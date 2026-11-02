import React, { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle2, AlertCircle, Clock, Zap, Database, Shield, Layers } from 'lucide-react';
import { triggerManualSync, fetchSyncRuns, fetchLatestSyncRun } from '../api/syncApi.ts';
import type { SyncRun } from '../types/sync.ts';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted?: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted,
}) => {
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [latestRun, setLatestRun] = useState<SyncRun | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoadingHistory(true);
      const [history, latest] = await Promise.all([
        fetchSyncRuns(),
        fetchLatestSyncRun(),
      ]);
      setRuns(history);
      setLatestRun(latest);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await triggerManualSync();
      setLatestRun(result);
      if (result.status === 'SUCCESS') {
        setSuccessMsg(
          `동기화 완료: 총 ${result.totalItemsFetched}개 항목 수집 (신규: ${result.newItemsInserted}건, 갱신: ${result.itemsUpdated}건)`
        );
        if (onSyncCompleted) {
          onSyncCompleted();
        }
      } else if (result.status === 'FAILED') {
        setError(`동기화 실패: ${result.errorMessage || '알 수 없는 오류'}`);
      }
      await loadData();
    } catch (err) {
      setError((err as Error).message || '동기화 요청에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      data-testid="sync-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base sm:text-lg">YouTube 영상 동기화 관리</h3>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-red-950 text-red-400 border border-red-800/40">
                  @Mondo2233 전용
                </span>
              </div>
              <p className="text-xs text-slate-400">공식 YouTube Data API v3 연동 및 멱등적 메타데이터 수집</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-5 py-5 pr-1 text-xs">
          {/* Quota & Architecture Callout */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                API 할당량 최적화 및 불변 원칙
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Quota: 1 unit / 50 items
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>할당량 50~100배 절약:</strong> <code className="text-slate-300">search.list(100 units)</code> 대신 <code className="text-slate-300">playlistItems.list(1 unit/50개)</code> 적용
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>관리자 데이터 보존:</strong> 태그 및 타임스탬프 메모는 절대 덮어쓰지 않고 공개 메타데이터만 갱신
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>멱등성 보장:</strong> <code className="text-slate-300">youtube_video_id UNIQUE</code> 제약으로 재실행 안전
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>보안 격리:</strong> API 키는 클라이언트에 노출되지 않고 서버 환경변수로만 안전하게 관리
                </span>
              </div>
            </div>
          </div>

          {/* Action Button & Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>채널 영상 수집 실행</span>
                {latestRun && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      latestRun.status === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : latestRun.status === 'FAILED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        : 'bg-blue-950 text-blue-400 border border-blue-800/50'
                    }`}
                  >
                    최근 상태: {latestRun.status}
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400">
                {latestRun?.completedAt
                  ? `마지막 동기화: ${formatDate(latestRun.completedAt)} (${latestRun.totalItemsFetched}개 항목)`
                  : '아직 실행된 동기화 기록이 없습니다.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunSync}
              disabled={syncing}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? '수집 및 동기화 중...' : '지금 수동 동기화 실행'}</span>
            </button>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{error}</p>
                <p className="text-[11px] text-amber-400/80">
                  서버 환경변수 <code className="bg-slate-950 px-1 py-0.5 rounded font-mono">YOUTUBE_API_KEY</code> 설정을 확인하세요.
                </p>
              </div>
            </div>
          )}

          {/* Sync History Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>동기화 실행 감사 이력 (sync_runs)</span>
              <span className="text-[10px] text-slate-500 font-mono">({runs.length}건)</span>
            </h4>

            {loadingHistory ? (
              <div className="p-6 text-center text-slate-500 font-mono">이력 불러오는 중...</div>
            ) : runs.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-500">
                기록된 동기화 이력이 없습니다.
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">상태</th>
                      <th className="py-2 px-3">시작 시각</th>
                      <th className="py-2 px-3">소요</th>
                      <th className="py-2 px-3 text-right">수집/신규/갱신</th>
                      <th className="py-2 px-3">실행자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-mono">
                    {runs.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-3 text-slate-400">#{r.id}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'SUCCESS'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : r.status === 'FAILED'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                                : 'bg-blue-950 text-blue-400 border border-blue-800/40'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">{formatDate(r.startedAt)}</td>
                        <td className="py-2 px-3 text-slate-400">
                          {r.durationSeconds != null ? `${r.durationSeconds}s` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          <span className="text-white font-semibold">{r.totalItemsFetched}</span> (
                          <span className="text-emerald-400">+{r.newItemsInserted}</span> /{' '}
                          <span className="text-cyan-400">~{r.itemsUpdated}</span>)
                        </td>
                        <td className="py-2 px-3 text-slate-400">{r.triggeredBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-mono">
            YouTube Data API v3 · Quota Protection Mode
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
