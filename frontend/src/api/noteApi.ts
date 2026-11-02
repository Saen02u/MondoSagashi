/**
 * 타임스탬프 시점 메모 API 요청 모듈
 */

import { request } from './client.ts';
import { API_ENDPOINTS } from '../config/api.ts';
import type { TimestampNote, TimestampNoteCreateRequest, TimestampNoteUpdateRequest } from '../types/note.ts';

/**
 * 특정 영상의 시점 메모 목록 조회 (공개 접근)
 */
export async function fetchNotes(videoId: string): Promise<TimestampNote[]> {
  return request<TimestampNote[]>(API_ENDPOINTS.VIDEO_NOTES(videoId));
}

/**
 * 시점 메모 추가 (관리자 전용)
 */
export async function createNote(videoId: string, req: TimestampNoteCreateRequest): Promise<TimestampNote> {
  return request<TimestampNote>(API_ENDPOINTS.VIDEO_NOTES(videoId), {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 시점 메모 수정 (관리자 전용)
 */
export async function updateNote(noteId: number, req: TimestampNoteUpdateRequest): Promise<TimestampNote> {
  return request<TimestampNote>(API_ENDPOINTS.NOTE_DETAIL(noteId), {
    method: 'PUT',
    body: JSON.stringify(req),
  });
}

/**
 * 시점 메모 삭제 (관리자 전용)
 */
export async function deleteNote(noteId: number): Promise<void> {
  await request<{ message: string }>(API_ENDPOINTS.NOTE_DETAIL(noteId), {
    method: 'DELETE',
  });
}
