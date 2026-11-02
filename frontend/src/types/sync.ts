/**
 * YouTube Data API v3 동기화 관련 TypeScript 타입 정의
 */

export type SyncStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

export interface SyncRun {
  id: number;
  channelId: number;
  channelName: string;
  channelCustomUrl: string;
  status: SyncStatus;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  totalItemsFetched: number;
  newItemsInserted: number;
  itemsUpdated: number;
  errorMessage: string | null;
  triggeredBy: string;
}
