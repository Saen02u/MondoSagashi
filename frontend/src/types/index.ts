/**
 * YouTube 라이브 다시보기 아카이브 공통 타입 정의
 */

export interface HealthCheckResponse {
  status: string;
  service: string;
  message: string;
  timestamp: string;
}

export interface VideoResponse {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
}

export interface Channel {
  id: string;
  youtubeChannelId: string;
  title: string;
  customUrl?: string;
  description?: string;
  thumbnailUrl: string;
  videoCount: number;
  lastSyncedAt?: string;
}

export interface Video {
  id: string;
  youtubeVideoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
  tags: Tag[];
  noteCount: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface TimestampNote {
  id: string;
  videoId: string;
  timestampSeconds: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SyncHistory {
  id: string;
  channelId: string;
  channelTitle: string;
  syncedVideosCount: number;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  executedAt: string;
}
