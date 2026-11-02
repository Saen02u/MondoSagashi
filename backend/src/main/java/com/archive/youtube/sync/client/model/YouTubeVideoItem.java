package com.archive.youtube.sync.client.model;

import java.time.LocalDateTime;

/**
 * YouTube API로부터 추출한 개별 영상 메타데이터 표준 DTO
 */
public record YouTubeVideoItem(
    String videoId,
    String title,
    String description,
    String thumbnailUrl,
    LocalDateTime publishedAt
) {}
