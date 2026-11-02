package com.archive.youtube.sync.client;

import com.archive.youtube.sync.client.model.YouTubePlaylistItemsPage;

/**
 * YouTube Data API v3 통신 인터페이스
 */
public interface YouTubeApiClient {

    /**
     * API 키가 설정되어 있는지 여부 확인
     */
    boolean isConfigured();

    /**
     * 채널 핸들 또는 커스텀 URL(@Mondo2233)로부터 업로드 재생목록 ID(UU...)를 조회합니다.
     * Quota: 1 unit
     */
    String getUploadsPlaylistId(String customUrlOrHandle);

    /**
     * 업로드 재생목록으로부터 영상 항목들을 페이지 단위로 수집합니다.
     * Quota: 1 unit per 50 items (search.list 100 units 대비 50~100배 할당량 절약)
     *
     * @param playlistId 업로드 재생목록 ID
     * @param pageToken 다음 페이지 토큰 (첫 페이지는 null)
     * @param maxResults 페이지 당 항목 수 (최대 50)
     */
    YouTubePlaylistItemsPage fetchPlaylistItems(String playlistId, String pageToken, int maxResults);
}
