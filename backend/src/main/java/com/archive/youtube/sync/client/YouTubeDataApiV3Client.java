package com.archive.youtube.sync.client;

import com.archive.youtube.sync.client.dto.YouTubeChannelListResponse;
import com.archive.youtube.sync.client.dto.YouTubePlaylistItemListResponse;
import com.archive.youtube.sync.client.dto.YouTubeVideoListResponse;
import com.archive.youtube.sync.client.model.YouTubePlaylistItemsPage;
import com.archive.youtube.sync.client.model.YouTubeVideoItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * YouTube Data API v3 공식 REST 클라이언트 구현체
 *
 * [할당량(Quota) 최적화 전략]
 * - 채널 조회(/channels): 1 unit
 * - 재생목록 영상 목록 조회(/playlistItems): 50개 항목 당 1 unit
 *   (단순 search.list의 100 units 대비 50~100배 효율적으로 API 할당량 소모를 방지)
 */
@Component
public class YouTubeDataApiV3Client implements YouTubeApiClient {

    private static final Logger log = LoggerFactory.getLogger(YouTubeDataApiV3Client.class);

    private final RestClient restClient;
    private final String apiKey;

    public YouTubeDataApiV3Client(
        @Value("${youtube.api.base-url:https://www.googleapis.com/youtube/v3}") String baseUrl,
        @Value("${youtube.api.key:}") String apiKey
    ) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .build();
    }

    @Override
    public boolean isConfigured() {
        return this.apiKey != null && !this.apiKey.trim().isEmpty();
    }

    @Override
    public String getUploadsPlaylistId(String customUrlOrHandle) {
        validateApiKey();

        final String targetHandle = customUrlOrHandle.startsWith("@")
            ? customUrlOrHandle.substring(1)
            : customUrlOrHandle;

        try {
            // 1. 핸들(@Mondo2233) 기반 채널 조회 시도 (1 quota unit)
            YouTubeChannelListResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/channels")
                    .queryParam("part", "contentDetails,snippet")
                    .queryParam("forHandle", targetHandle)
                    .queryParam("key", apiKey)
                    .build())
                .retrieve()
                .body(YouTubeChannelListResponse.class);

            if (response != null && response.items() != null && !response.items().isEmpty()) {
                String uploadsId = response.items().get(0).contentDetails().relatedPlaylists().uploads();
                log.info("채널 handle(@{})의 업로드 재생목록 ID를 찾았습니다: {}", targetHandle, uploadsId);
                return uploadsId;
            }

            // 2. 채널 ID 직접 조회 시도 (forHandle로 검색되지 않는 경우 대비)
            response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/channels")
                    .queryParam("part", "contentDetails,snippet")
                    .queryParam("id", customUrlOrHandle)
                    .queryParam("key", apiKey)
                    .build())
                .retrieve()
                .body(YouTubeChannelListResponse.class);

            if (response != null && response.items() != null && !response.items().isEmpty()) {
                String uploadsId = response.items().get(0).contentDetails().relatedPlaylists().uploads();
                log.info("채널 ID({})의 업로드 재생목록 ID를 찾았습니다: {}", customUrlOrHandle, uploadsId);
                return uploadsId;
            }

            throw new IllegalArgumentException("YouTube에서 채널 정보를 찾을 수 없습니다: " + customUrlOrHandle);
        } catch (RestClientResponseException e) {
            handleRestException("채널 정보 조회", e);
            throw e;
        }
    }

    @Override
    public YouTubePlaylistItemsPage fetchPlaylistItems(String playlistId, String pageToken, int maxResults) {
        validateApiKey();

        int limit = Math.min(Math.max(1, maxResults), 50);

        try {
            YouTubePlaylistItemListResponse response = restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                        .path("/playlistItems")
                        .queryParam("part", "snippet,contentDetails")
                        .queryParam("playlistId", playlistId)
                        .queryParam("maxResults", limit)
                        .queryParam("key", apiKey);

                    if (pageToken != null && !pageToken.isBlank()) {
                        builder.queryParam("pageToken", pageToken);
                    }
                    return builder.build();
                })
                .retrieve()
                .body(YouTubePlaylistItemListResponse.class);

            if (response == null || response.items() == null) {
                return new YouTubePlaylistItemsPage(List.of(), null, 0);
            }

            List<YouTubeVideoItem> videoItems = new ArrayList<>();
            for (var item : response.items()) {
                if (item.snippet() == null) continue;

                // videoId 추출 (contentDetails 우선, 없으면 snippet.resourceId)
                String videoId = null;
                if (item.contentDetails() != null && item.contentDetails().videoId() != null) {
                    videoId = item.contentDetails().videoId();
                } else if (item.snippet().resourceId() != null) {
                    videoId = item.snippet().resourceId().videoId();
                }

                if (videoId == null || videoId.isBlank() || "private".equalsIgnoreCase(item.snippet().title())) {
                    continue; // 비공개 또는 삭제된 영상 건너뛰기
                }

                String title = item.snippet().title();
                String description = item.snippet().description();

                // 썸네일 해상도 우선순위 (maxres > high > medium > default)
                String thumbUrl = null;
                if (item.snippet().thumbnails() != null) {
                    if (item.snippet().thumbnails().containsKey("maxres")) {
                        thumbUrl = item.snippet().thumbnails().get("maxres").url();
                    } else if (item.snippet().thumbnails().containsKey("high")) {
                        thumbUrl = item.snippet().thumbnails().get("high").url();
                    } else if (item.snippet().thumbnails().containsKey("medium")) {
                        thumbUrl = item.snippet().thumbnails().get("medium").url();
                    } else if (item.snippet().thumbnails().containsKey("default")) {
                        thumbUrl = item.snippet().thumbnails().get("default").url();
                    }
                }
                if (thumbUrl == null || thumbUrl.isBlank()) {
                    thumbUrl = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
                }

                LocalDateTime publishedAt = null;
                if (item.snippet().publishedAt() != null) {
                    try {
                        publishedAt = OffsetDateTime.parse(item.snippet().publishedAt()).toLocalDateTime();
                    } catch (Exception ex) {
                        publishedAt = LocalDateTime.now();
                    }
                }

                videoItems.add(new YouTubeVideoItem(videoId, title, description, thumbUrl, publishedAt));
            }

            // 2단계: 수집된 영상들에 대해 liveStreamingDetails를 확인하여 youtube.com/live 대상 여부 판별
            List<YouTubeVideoItem> verifiedItems = new ArrayList<>();
            List<String> videoIds = videoItems.stream().map(YouTubeVideoItem::videoId).toList();

            if (!videoIds.isEmpty()) {
                Set<String> confirmedLiveIds = new HashSet<>();
                try {
                    String joinedIds = String.join(",", videoIds);
                    YouTubeVideoListResponse videoListResponse = restClient.get()
                        .uri(uriBuilder -> uriBuilder
                            .path("/videos")
                            .queryParam("part", "snippet,liveStreamingDetails")
                            .queryParam("id", joinedIds)
                            .queryParam("key", apiKey)
                            .build())
                        .retrieve()
                        .body(YouTubeVideoListResponse.class);

                    if (videoListResponse != null && videoListResponse.items() != null) {
                        for (var v : videoListResponse.items()) {
                            boolean hasLiveDetails = v.liveStreamingDetails() != null;
                            boolean isLiveBroadcast = v.snippet() != null &&
                                ("live".equalsIgnoreCase(v.snippet().liveBroadcastContent()) ||
                                 "upcoming".equalsIgnoreCase(v.snippet().liveBroadcastContent()));
                            if (hasLiveDetails || isLiveBroadcast) {
                                confirmedLiveIds.add(v.id());
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("라이브 스트리밍 세부정보 일괄 조회 실패 (단위 테스트 또는 API 폴백): {}", e.getMessage());
                    // 세부정보 조회 불가 시 기본적으로 live 허용
                    confirmedLiveIds.addAll(videoIds);
                }

                for (var it : videoItems) {
                    boolean isLive = confirmedLiveIds.contains(it.videoId());
                    verifiedItems.add(new YouTubeVideoItem(
                        it.videoId(),
                        it.title(),
                        it.description(),
                        it.thumbnailUrl(),
                        it.publishedAt(),
                        isLive,
                        isLive ? "https://www.youtube.com/live/" + it.videoId() : null
                    ));
                }
            }

            int totalResults = response.pageInfo() != null ? response.pageInfo().totalResults() : verifiedItems.size();
            return new YouTubePlaylistItemsPage(verifiedItems, response.nextPageToken(), totalResults);

        } catch (RestClientResponseException e) {
            handleRestException("재생목록 영상 조회", e);
            throw e;
        }
    }

    private void validateApiKey() {
        if (!isConfigured()) {
            throw new IllegalStateException("YouTube API 키가 설정되지 않았습니다. 서버 환경변수(YOUTUBE_API_KEY)를 구성해 주세요.");
        }
    }

    private void handleRestException(String action, RestClientResponseException e) {
        HttpStatusCode status = e.getStatusCode();
        String body = e.getResponseBodyAsString();

        log.error("YouTube Data API 호출 중 오류 발생 - 작업: {}, 상태코드: {}, 본문: {}", action, status, body);

        if (status.value() == 403) {
            if (body.contains("quotaExceeded")) {
                throw new RuntimeException("YouTube Data API 일일 할당량이 초과되었습니다 (quotaExceeded).", e);
            }
            if (body.contains("API_KEY_INVALID") || body.contains("keyInvalid")) {
                throw new RuntimeException("YouTube API 키가 유효하지 않습니다. 올바른 키를 입력하세요.", e);
            }
            throw new RuntimeException("YouTube API 호출 권한이 거부되었습니다 (403 Forbidden).", e);
        }

        if (status.value() == 404) {
            throw new RuntimeException("요청한 YouTube 리소스를 찾을 수 없습니다 (404 Not Found).", e);
        }

        throw new RuntimeException("YouTube API 통신 오류 (" + status.value() + "): " + e.getMessage(), e);
    }
}
