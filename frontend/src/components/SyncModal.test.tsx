import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SyncModal } from './SyncModal.tsx';
import * as syncApi from '../api/syncApi.ts';
import type { SyncRun } from '../types/sync.ts';

describe('SyncModal Component', () => {
  const mockRuns: SyncRun[] = [
    {
      id: 1,
      channelId: 1,
      channelName: 'Mondo',
      channelCustomUrl: '@Mondo2233',
      status: 'SUCCESS',
      startedAt: '2026-11-01T12:00:00',
      completedAt: '2026-11-01T12:00:03',
      durationSeconds: 3,
      totalItemsFetched: 50,
      newItemsInserted: 6,
      itemsUpdated: 44,
      errorMessage: null,
      triggeredBy: 'admin',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders modal with sync history and quota optimization info', async () => {
    vi.spyOn(syncApi, 'fetchSyncRuns').mockResolvedValue(mockRuns);
    vi.spyOn(syncApi, 'fetchLatestSyncRun').mockResolvedValue(mockRuns[0]);

    render(<SyncModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('sync-modal')).toBeDefined();
    expect(screen.getByText('YouTube 영상 동기화 관리')).toBeDefined();
    expect(screen.getByText('@Mondo2233 전용')).toBeDefined();
    expect(screen.getByText('API 할당량 최적화 및 불변 원칙')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeDefined();
    });

    expect(screen.getByText('지금 수동 동기화 실행')).toBeDefined();
    expect(screen.getByText('최근 상태: SUCCESS')).toBeDefined();
  });

  it('triggers manual sync successfully and calls onSyncCompleted', async () => {
    vi.spyOn(syncApi, 'fetchSyncRuns').mockResolvedValue(mockRuns);
    vi.spyOn(syncApi, 'fetchLatestSyncRun').mockResolvedValue(mockRuns[0]);
    const triggerSpy = vi.spyOn(syncApi, 'triggerManualSync').mockResolvedValue({
      id: 2,
      channelId: 1,
      channelName: 'Mondo',
      channelCustomUrl: '@Mondo2233',
      status: 'SUCCESS',
      startedAt: '2026-11-01T13:00:00',
      completedAt: '2026-11-01T13:00:02',
      durationSeconds: 2,
      totalItemsFetched: 20,
      newItemsInserted: 2,
      itemsUpdated: 18,
      errorMessage: null,
      triggeredBy: 'admin',
    });

    const onSyncCompletedMock = vi.fn();

    render(
      <SyncModal
        isOpen={true}
        onClose={vi.fn()}
        onSyncCompleted={onSyncCompletedMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('지금 수동 동기화 실행')).toBeDefined();
    });

    const syncBtn = screen.getByText('지금 수동 동기화 실행');
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(triggerSpy).toHaveBeenCalled();
      expect(screen.getByText(/동기화 완료: 총 20개 항목 수집/i)).toBeDefined();
      expect(onSyncCompletedMock).toHaveBeenCalled();
    });
  });
});
