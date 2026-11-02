/**
 * 영상 및 태그 도메인 API 요청 모듈
 */

import { request } from './client.ts';
import { API_ENDPOINTS } from '../config/api.ts';
import type { Video, VideoDetail, Tag, PageResponse, VideoSearchParams } from '../types/video.ts';

/**
 * 영상 목록 검색, 필터링, 정렬, 페이지네이션 조회 (GET /api/v1/videos)
 */
export async function fetchVideos(params: VideoSearchParams = {}): Promise<PageResponse<Video>> {
  const queryParts: string[] = [];

  if (params.query && params.query.trim()) {
    queryParts.push(`query=${encodeURIComponent(params.query.trim())}`);
  }
  if (params.channelId) {
    queryParts.push(`channelId=${params.channelId}`);
  }
  if (params.tag && params.tag.trim()) {
    queryParts.push(`tag=${encodeURIComponent(params.tag.trim())}`);
  }
  if (params.sort) {
    queryParts.push(`sort=${encodeURIComponent(params.sort)}`);
  }
  if (typeof params.page === 'number') {
    queryParts.push(`page=${params.page}`);
  }
  if (typeof params.size === 'number') {
    queryParts.push(`size=${params.size}`);
  }

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return request<PageResponse<Video>>(`${API_ENDPOINTS.VIDEOS}${queryString}`);
}

/**
 * 단일 영상 상세 정보 조회 (GET /api/v1/videos/{videoId})
 */
export async function fetchVideoDetail(videoId: string): Promise<VideoDetail> {
  return request<VideoDetail>(API_ENDPOINTS.VIDEO_DETAIL(videoId));
}

/**
 * 등록된 태그 목록 조회 (GET /api/v1/tags)
 */
export async function fetchTags(): Promise<Tag[]> {
  return request<Tag[]>(API_ENDPOINTS.TAGS);
}
