/**
 * 타임스탬프 시점 메모 도메인 타입 정의
 */

export interface TimestampNote {
  id: number;
  videoId: string;
  positionSeconds: number;
  formattedTime: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimestampNoteCreateRequest {
  positionSeconds: number;
  content: string;
}

export interface TimestampNoteUpdateRequest {
  positionSeconds: number;
  content: string;
}
