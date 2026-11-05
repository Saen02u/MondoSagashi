package com.archive.youtube.sync.client.model;

import java.time.LocalDateTime;

/**
 * YouTube API로부터 추출한 개별 영상 메타데이터 표준 DTO
 * 라이브 스트리밍(youtube.com/live/{videoId}) 여부와 라이브 URL 정보를 포함합니다.
 */
public record YouTubeVideoItem(
    String videoId,
    String title,
    String description,
    String thumbnailUrl,
    LocalDateTime publishedAt,
    boolean isLiveStream,
    String liveUrl
) {
    public YouTubeVideoItem(
        String videoId,
        String title,
        String description,
        String thumbnailUrl,
        LocalDateTime publishedAt
    ) {
        this(
            videoId,
            title,
            description,
            thumbnailUrl,
            publishedAt,
            true,
            "https://www.youtube.com/live/" + videoId
        );
    }
}
