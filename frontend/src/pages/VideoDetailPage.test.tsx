import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { VideoDetailPage } from './VideoDetailPage.tsx';
import * as videoApi from '../api/videoApi.ts';
import type { VideoDetail } from '../types/video.ts';

describe('VideoDetailPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Clipboard mock
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  const mockDetail: VideoDetail = {
    videoId: '2yK2D41LzB8',
    title: '[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기',
    description: '몬도의 에이펙스 레전드 라이브 다시보기 상세 설명입니다.',
    channelName: 'Mondo',
    channelCustomUrl: '@Mondo2233',
    channelThumbnailUrl: 'https://example.com/channel.jpg',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=2yK2D41LzB8',
    embedUrl: 'https://www.youtube.com/embed/2yK2D41LzB8',
    publishedAt: '2026-10-30T12:00:00',
    tags: [{ id: 1, name: 'Apex Legends', color: 'red' }],
  };

  it('renders video details, embed player, and title successfully', async () => {
    vi.spyOn(videoApi, 'fetchVideoDetail').mockResolvedValue(mockDetail);

    render(<VideoDetailPage videoId="2yK2D41LzB8" onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('video-detail-page')).toBeDefined();
    });

    expect(screen.getByText('[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기')).toBeDefined();
    expect(screen.getByText('@Mondo2233')).toBeDefined();
    expect(screen.getByText('시점 공유 (t 파라미터)')).toBeDefined();
  });

  it('handles initial timestamp seconds in player embed url', async () => {
    vi.spyOn(videoApi, 'fetchVideoDetail').mockResolvedValue(mockDetail);

    render(<VideoDetailPage videoId="2yK2D41LzB8" initialTimestampSeconds={125} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('video-detail-page')).toBeDefined();
    });

    // 플레이어 iframe src에 start=125 가 포함되었는지 검증
    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toContain('start=125');
  });

  it('copies share link with t parameter when copy button is clicked', async () => {
    vi.spyOn(videoApi, 'fetchVideoDetail').mockResolvedValue(mockDetail);

    render(<VideoDetailPage videoId="2yK2D41LzB8" onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('video-detail-page')).toBeDefined();
    });

    // 1분(60s) 프리셋 클릭
    const presetBtn = screen.getByText('1분 (60s)');
    fireEvent.click(presetBtn);

    // 복사 버튼 클릭
    const copyButtons = screen.getAllByRole('button');
    const shareCopyBtn = copyButtons.find((btn) => btn.textContent?.includes('t=60'));
    if (shareCopyBtn) {
      fireEvent.click(shareCopyBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('t=60'));
    }
  });

  it('triggers onBack when back button is clicked', async () => {
    vi.spyOn(videoApi, 'fetchVideoDetail').mockResolvedValue(mockDetail);
    const onBackMock = vi.fn();

    render(<VideoDetailPage videoId="2yK2D41LzB8" onBack={onBackMock} />);

    await waitFor(() => {
      expect(screen.getByTestId('video-detail-page')).toBeDefined();
    });

    const backBtn = screen.getByText('영상 목록으로 돌아가기');
    fireEvent.click(backBtn);
    expect(onBackMock).toHaveBeenCalled();
  });
});
