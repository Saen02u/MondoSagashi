import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminLoginModal } from './AdminLoginModal.tsx';
import * as authApi from '../api/authApi.ts';

describe('AdminLoginModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form and calls login on submit', async () => {
    const loginSpy = vi.spyOn(authApi, 'login').mockResolvedValue({
      authenticated: true,
      username: 'admin',
      role: 'ROLE_ADMIN',
    });
    const onLoginSuccessMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <AdminLoginModal
        isOpen={true}
        onClose={onCloseMock}
        onLoginSuccess={onLoginSuccessMock}
      />
    );

    expect(screen.getByTestId('admin-login-modal')).toBeDefined();
    expect(screen.getByText('관리자 로그인')).toBeDefined();

    const submitBtn = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin1234!',
      });
      expect(onLoginSuccessMock).toHaveBeenCalledWith({
        authenticated: true,
        username: 'admin',
        role: 'ROLE_ADMIN',
      });
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('displays error message when login fails', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new Error('아이디 또는 비밀번호가 올바르지 않습니다.'));
    const onLoginSuccessMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <AdminLoginModal
        isOpen={true}
        onClose={onCloseMock}
        onLoginSuccess={onLoginSuccessMock}
      />
    );

    const submitBtn = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('아이디 또는 비밀번호가 올바르지 않습니다.')).toBeDefined();
    });

    expect(onLoginSuccessMock).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
