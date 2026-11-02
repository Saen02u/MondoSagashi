package com.archive.youtube.sync.entity;

/**
 * YouTube 영상 동기화 작업 상태
 */
public enum SyncStatus {
    IN_PROGRESS, // 동기화 진행 중
    SUCCESS,     // 동기화 정상 완료
    FAILED       // 동기화 실패 (할당량 초과, 네트워크 오류, 키 미설정 등)
}
