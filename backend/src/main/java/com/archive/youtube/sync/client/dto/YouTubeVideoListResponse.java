package com.archive.youtube.sync.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * YouTube Data API v3 GET /videos 응답 바인딩
 * 라이브 스트리밍 정보(liveStreamingDetails) 유무를 판별하는 데 사용됩니다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record YouTubeVideoListResponse(
    List<VideoItem> items
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VideoItem(
        String id,
        Snippet snippet,
        LiveStreamingDetails liveStreamingDetails
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Snippet(
        String title,
        String description,
        String liveBroadcastContent
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LiveStreamingDetails(
        String actualStartTime,
        String actualEndTime,
        String scheduledStartTime
    ) {}
}
