/**
 * 관리자 인증 도메인 타입 정의
 */

export interface AuthStatus {
  authenticated: boolean;
  username: string | null;
  role: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
