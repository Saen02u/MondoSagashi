/**
 * API 환경설정 및 엔드포인트 상수 정의
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '';

export const API_ENDPOINTS = {
  VIDEOS: '/api/v1/videos',
  VIDEO_DETAIL: (videoId: string) => `/api/v1/videos/${videoId}`,
  TAGS: '/api/v1/tags',
  VIDEO_NOTES: (videoId: string) => `/api/v1/videos/${videoId}/notes`,
  NOTE_DETAIL: (noteId: number) => `/api/v1/notes/${noteId}`,
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  AUTH_ME: '/api/v1/auth/me',
  AUTH_CSRF: '/api/v1/auth/csrf',
  SYNC_RUN: '/api/v1/sync/run',
  SYNC_RUNS: '/api/v1/sync/runs',
  SYNC_LATEST: '/api/v1/sync/latest',
  HEALTH: '/api/health',
} as const;

export const DEFAULT_REQUEST_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
