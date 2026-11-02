package com.archive.youtube.sync.client.model;

import java.util.List;

/**
 * YouTube playlistItems 페이지네이션 결과
 */
public record YouTubePlaylistItemsPage(
    List<YouTubeVideoItem> items,
    String nextPageToken,
    int totalResults
) {}
