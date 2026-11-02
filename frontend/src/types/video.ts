/**
 * YouTube 라이브 다시보기 영상 및 태그 도메인 타입 정의
 */

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Video {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  tags: Tag[];
}

export interface VideoDetail {
  videoId: string;
  title: string;
  description: string;
  channelName: string;
  channelCustomUrl: string;
  channelThumbnailUrl: string;
  thumbnailUrl: string;
  youtubeWatchUrl: string;
  embedUrl: string;
  publishedAt: string;
  tags: Tag[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface VideoSearchParams {
  query?: string;
  channelId?: number;
  tag?: string;
  sort?: 'latest' | 'oldest' | 'title';
  page?: number;
  size?: number;
}
