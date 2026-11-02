import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TimestampNoteSection } from './TimestampNoteSection.tsx';
import * as noteApi from '../api/noteApi.ts';
import type { TimestampNote } from '../types/note.ts';

describe('TimestampNoteSection Component', () => {
  const mockNotes: TimestampNote[] = [
    {
      id: 1,
      videoId: '2yK2D41LzB8',
      positionSeconds: 150,
      formattedTime: '02:30',
      content: '1라운드 링 축소 및 몬도 에임 클립',
      createdAt: '2026-11-01T10:00:00',
      updatedAt: '2026-11-01T10:00:00',
    },
    {
      id: 2,
      videoId: '2yK2D41LzB8',
      positionSeconds: 360,
      formattedTime: '06:00',
      content: '챔피언 등극 순간',
      createdAt: '2026-11-01T10:05:00',
      updatedAt: '2026-11-01T10:05:00',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders notes list and seeks player when note timestamp is clicked', async () => {
    vi.spyOn(noteApi, 'fetchNotes').mockResolvedValue(mockNotes);
    const onSeekMock = vi.fn();

    render(
      <TimestampNoteSection
        videoId="2yK2D41LzB8"
        isAdmin={false}
        currentVideoTime={0}
        onSeek={onSeekMock}
        onOpenLoginModal={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('02:30')).toBeDefined();
    });

    expect(screen.getByText('1라운드 링 축소 및 몬도 에임 클립')).toBeDefined();
    expect(screen.getByText('06:00')).toBeDefined();
    expect(screen.getByText('챔피언 등극 순간')).toBeDefined();

    // 타임스탬프 클릭 시 onSeek 호출 검증
    const timeBtn = screen.getByText('02:30');
    fireEvent.click(timeBtn);
    expect(onSeekMock).toHaveBeenCalledWith(150);
  });

  it('shows login button for unauthenticated users instead of add form', async () => {
    vi.spyOn(noteApi, 'fetchNotes').mockResolvedValue(mockNotes);
    const onOpenLoginModalMock = vi.fn();

    render(
      <TimestampNoteSection
        videoId="2yK2D41LzB8"
        isAdmin={false}
        currentVideoTime={0}
        onSeek={vi.fn()}
        onOpenLoginModal={onOpenLoginModalMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('관리자 로그인 후 작성')).toBeDefined();
    });

    const loginBtn = screen.getByText('관리자 로그인 후 작성');
    fireEvent.click(loginBtn);
    expect(onOpenLoginModalMock).toHaveBeenCalled();
  });

  it('shows note creation form and can submit new note when user is admin', async () => {
    vi.spyOn(noteApi, 'fetchNotes').mockResolvedValue(mockNotes);
    const createNoteSpy = vi.spyOn(noteApi, 'createNote').mockResolvedValue({
      id: 3,
      videoId: '2yK2D41LzB8',
      positionSeconds: 600,
      formattedTime: '10:00',
      content: '추가된 메모 내용',
      createdAt: '2026-11-01T10:10:00',
      updatedAt: '2026-11-01T10:10:00',
    });

    render(
      <TimestampNoteSection
        videoId="2yK2D41LzB8"
        isAdmin={true}
        currentVideoTime={600}
        onSeek={vi.fn()}
        onOpenLoginModal={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('메모 추가')).toBeDefined();
    });

    // 메모 추가 버튼 클릭하여 작성 폼 열기
    fireEvent.click(screen.getByText('메모 추가'));

    expect(screen.getByText('신규 시점 메모 작성')).toBeDefined();

    const contentInput = screen.getByPlaceholderText(/예: 윙맨 3연속 헤드샷 클러치 장면/i);
    fireEvent.change(contentInput, { target: { value: '추가된 메모 내용' } });

    const submitBtn = screen.getByRole('button', { name: /메모 저장/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createNoteSpy).toHaveBeenCalledWith('2yK2D41LzB8', {
        positionSeconds: 600,
        content: '추가된 메모 내용',
      });
    });
  });
});
