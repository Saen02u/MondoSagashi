package com.archive.youtube.sync.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

/**
 * YouTube Data API v3 GET /channels 응답 바인딩
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record YouTubeChannelListResponse(
    List<ChannelItem> items
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ChannelItem(
        String id,
        Snippet snippet,
        ContentDetails contentDetails
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Snippet(
        String title,
        String description,
        String customUrl,
        Map<String, ThumbnailInfo> thumbnails
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ContentDetails(
        RelatedPlaylists relatedPlaylists
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RelatedPlaylists(
        String uploads
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ThumbnailInfo(
        String url,
        Integer width,
        Integer height
    ) {}
}
