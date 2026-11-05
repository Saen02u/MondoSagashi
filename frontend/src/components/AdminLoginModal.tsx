import React, { useState } from 'react';
import { Shield, X, Lock, User, AlertCircle, KeyRound } from 'lucide-react';
import { login } from '../api/authApi.ts';
import type { AuthStatus } from '../types/auth.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (auth: AuthStatus) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = await login({ username, password });
      onLoginSuccess(auth);
      onClose();
    } catch (err) {
      setError((err as Error).message || '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin1234!');
  };

  return (
    <div
      data-testid="admin-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800/50 flex items-center justify-center text-red-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">관리자 로그인</h3>
              <p className="text-xs text-slate-400">Spring Security 세션 기반 인증</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">관리자 아이디</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디 입력"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">비밀번호 (BCrypt 해시 검증)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* 데모 계정 자동 입력 안내 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
            <span>기본 계정: <code className="text-red-400 font-mono">admin / admin1234!</code></span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium"
            >
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              <span>자동 채우기</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              {loading ? '인증 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
