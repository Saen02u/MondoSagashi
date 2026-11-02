/**
 * YouTube Data API v3 동기화 API 모듈
 */

import { request } from './client.ts';
import { API_ENDPOINTS } from '../config/api.ts';
import type { SyncRun } from '../types/sync.ts';

/**
 * 관리자 수동 YouTube 영상 동기화 트리거 (POST /api/v1/sync/run)
 */
export async function triggerManualSync(channelId?: number): Promise<SyncRun> {
  const endpoint = channelId
    ? `/api/v1/sync/channels/${channelId}/run`
    : API_ENDPOINTS.SYNC_RUN;

  return request<SyncRun>(endpoint, {
    method: 'POST',
  });
}

/**
 * 동기화 실행 이력 목록 조회 (GET /api/v1/sync/runs)
 */
export async function fetchSyncRuns(channelId?: number): Promise<SyncRun[]> {
  const query = channelId ? `?channelId=${channelId}` : '';
  return request<SyncRun[]>(`${API_ENDPOINTS.SYNC_RUNS}${query}`);
}

/**
 * 최신 동기화 실행 상태 조회 (GET /api/v1/sync/latest)
 */
export async function fetchLatestSyncRun(channelId?: number): Promise<SyncRun | null> {
  const query = channelId ? `?channelId=${channelId}` : '';
  try {
    return await request<SyncRun>(`${API_ENDPOINTS.SYNC_LATEST}${query}`);
  } catch {
    return null;
  }
}
