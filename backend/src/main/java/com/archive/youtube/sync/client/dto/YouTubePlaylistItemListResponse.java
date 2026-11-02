package com.archive.youtube.sync.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

/**
 * YouTube Data API v3 GET /playlistItems 응답 바인딩
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record YouTubePlaylistItemListResponse(
    String nextPageToken,
    String prevPageToken,
    PageInfo pageInfo,
    List<PlaylistItem> items
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PageInfo(
        int totalResults,
        int resultsPerPage
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlaylistItem(
        Snippet snippet,
        ContentDetails contentDetails
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Snippet(
        String title,
        String description,
        String publishedAt,
        Map<String, ThumbnailInfo> thumbnails,
        ResourceId resourceId
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ResourceId(
        String videoId
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ContentDetails(
        String videoId,
        String videoPublishedAt
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ThumbnailInfo(
        String url,
        Integer width,
        Integer height
    ) {}
}
