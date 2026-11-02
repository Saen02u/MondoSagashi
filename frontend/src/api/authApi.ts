/**
 * 관리자 인증 API 요청 모듈
 */

import { request } from './client.ts';
import { API_ENDPOINTS } from '../config/api.ts';
import type { AuthStatus, LoginCredentials } from '../types/auth.ts';

/**
 * 현재 관리자 로그인 세션 상태 확인 (GET /api/v1/auth/me)
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  return request<AuthStatus>(API_ENDPOINTS.AUTH_ME);
}

/**
 * 관리자 로그인 요청 (POST /api/v1/auth/login)
 */
export async function login(credentials: LoginCredentials): Promise<AuthStatus> {
  return request<AuthStatus>(API_ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * 관리자 로그아웃 요청 (POST /api/v1/auth/logout)
 */
export async function logout(): Promise<void> {
  await request<{ message: string }>(API_ENDPOINTS.AUTH_LOGOUT, {
    method: 'POST',
  });
}

/**
 * CSRF 토큰 초기화 (GET /api/v1/auth/csrf)
 * XSRF-TOKEN 쿠키를 활성화하여 안전한 쿠키 기반 변조 방지를 보장합니다.
 */
export async function initCsrf(): Promise<void> {
  try {
    await request<{ token: string }>(API_ENDPOINTS.AUTH_CSRF);
  } catch {
    // optional fail-safe
  }
}
