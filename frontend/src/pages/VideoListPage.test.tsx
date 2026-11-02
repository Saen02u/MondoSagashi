import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { VideoListPage } from './VideoListPage.tsx';
import * as videoApi from '../api/videoApi.ts';
import type { Video, PageResponse, Tag } from '../types/video.ts';

describe('VideoListPage Component Search and Filter States', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockTags: Tag[] = [
    { id: 1, name: 'Apex Legends', color: 'red' },
    { id: 2, name: '마스터랭크', color: 'purple' },
  ];

  const mockVideos: Video[] = [
    {
      videoId: '2yK2D41LzB8',
      title: '[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기',
      channelName: 'Mondo',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      tags: [{ id: 1, name: 'Apex Legends', color: 'red' }],
    },
    {
      videoId: '8jTqN31pW9k',
      title: '[Mondo] 치지직 & 유튜브 동시 송출 라이브 다시보기',
      channelName: 'Mondo',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      tags: [],
    },
  ];

  const mockPageResponse: PageResponse<Video> = {
    content: mockVideos,
    page: 0,
    size: 6,
    totalElements: 2,
    totalPages: 1,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  };

  it('renders loading skeletons while API request is in progress', () => {
    vi.spyOn(videoApi, 'fetchTags').mockResolvedValue(mockTags);
    vi.spyOn(videoApi, 'fetchVideos').mockReturnValue(new Promise(() => {}));

    render(<VideoListPage />);

    expect(screen.getByTestId('video-loading-state')).toBeDefined();
    expect(screen.getAllByTestId('video-skeleton')).toHaveLength(3);
  });

  it('renders video cards with title and tag badges on successful API response', async () => {
    vi.spyOn(videoApi, 'fetchTags').mockResolvedValue(mockTags);
    vi.spyOn(videoApi, 'fetchVideos').mockResolvedValue(mockPageResponse);

    render(<VideoListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('video-list-grid')).toBeDefined();
    });

    expect(screen.getByText('[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기')).toBeDefined();
    expect(screen.getAllByText('#Apex Legends').length).toBeGreaterThan(0);
  });

  it('triggers search with query when search form is submitted', async () => {
    vi.spyOn(videoApi, 'fetchTags').mockResolvedValue(mockTags);
    const fetchSpy = vi.spyOn(videoApi, 'fetchVideos').mockResolvedValue(mockPageResponse);

    render(<VideoListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('video-list-grid')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/영상 제목 검색/);
    fireEvent.change(searchInput, { target: { value: '마스터' } });

    const searchBtn = screen.getByText('검색');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({ query: '마스터' }));
    });
  });

  it('renders error state and allows retry when API fails', async () => {
    vi.spyOn(videoApi, 'fetchTags').mockResolvedValue(mockTags);
    const fetchSpy = vi.spyOn(videoApi, 'fetchVideos')
      .mockRejectedValueOnce(new Error('네트워크 연결 오류'))
      .mockResolvedValueOnce(mockPageResponse);

    render(<VideoListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('video-error-state')).toBeDefined();
    });

    expect(screen.getByText('영상 목록을 불러올 수 없습니다')).toBeDefined();

    const retryBtn = screen.getByText('다시 시도하기');
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId('video-list-grid')).toBeDefined();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when API returns empty content array', async () => {
    vi.spyOn(videoApi, 'fetchTags').mockResolvedValue(mockTags);
    vi.spyOn(videoApi, 'fetchVideos').mockResolvedValue({
      ...mockPageResponse,
      content: [],
      totalElements: 0,
      totalPages: 0,
    });

    render(<VideoListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('video-empty-state')).toBeDefined();
    });

    expect(screen.getByText('조건에 일치하는 영상이 없습니다')).toBeDefined();
  });
});
