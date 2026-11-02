/**
 * API 요청 기본 클라이언트 모듈
 * 세션 쿠키(JSESSIONID)를 위한 credentials: 'include' 및 CSRF 방어(X-XSRF-TOKEN 헤더)를 지원합니다.
 */

import { API_BASE_URL, DEFAULT_REQUEST_HEADERS } from '../config/api.ts';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 브라우저 쿠키에서 XSRF-TOKEN 값을 파싱합니다.
 */
export function getXsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    ...(DEFAULT_REQUEST_HEADERS as Record<string, string>),
    ...((options.headers as Record<string, string>) || {}),
  };

  // 상태를 변경하는 요청(POST, PUT, DELETE)에 CSRF 방어를 위한 X-XSRF-TOKEN 헤더 주입
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const xsrfToken = getXsrfCookie();
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // 세션 쿠키(JSESSIONID) 전송 보장
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedMessage = json.message || errorText;
      } catch {
        // use raw errorText
      }
      throw new ApiError(response.status, parsedMessage || `HTTP ${response.status} 요청 실패`);
    }

    // 204 No Content인 경우 처리
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(
      `서버에 연결할 수 없습니다. 백엔드(Port 8080)가 실행 중인지 확인하세요. (${(error as Error).message})`
    );
  }
}
