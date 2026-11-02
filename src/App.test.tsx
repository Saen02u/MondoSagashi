import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App.tsx';
import * as videoApi from '../frontend/src/api/videoApi.ts';

describe('Root App Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(videoApi, 'fetchTags').mockResolvedValue([
      { id: 1, name: 'Apex Legends', color: 'red' },
    ]);
    vi.spyOn(videoApi, 'fetchVideos').mockResolvedValue({
      content: [
        {
          videoId: '2yK2D41LzB8',
          title: '[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기',
          channelName: 'Mondo',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          tags: [{ id: 1, name: 'Apex Legends', color: 'red' }],
        },
      ],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it('renders Mondo video archive cards by default', async () => {
    render(<App />);
    expect(screen.getByText('YouTube Live Archive')).toBeDefined();
    expect(screen.getAllByText(/Mondo/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기')).toBeDefined();
    });
  });

  it('allows navigation between tabs', () => {
    render(<App />);
    const archBtn = screen.getByText('도메인 아키텍처');
    fireEvent.click(archBtn);
    expect(screen.getByText('PostgreSQL 테이블 매핑 및 연관관계 설계')).toBeDefined();
  });
});
