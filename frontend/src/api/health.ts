import { request } from './client.ts';
import type { HealthCheckResponse } from '../types/index.ts';

/**
 * 백엔드 서버 헬스체크 API 호출
 */
export async function getBackendHealth(): Promise<HealthCheckResponse> {
  return request<HealthCheckResponse>('/api/health');
}
