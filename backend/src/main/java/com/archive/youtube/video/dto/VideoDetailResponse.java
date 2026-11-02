package com.archive.youtube.video.dto;

import com.archive.youtube.tag.dto.TagResponse;
import com.archive.youtube.video.entity.Video;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 영상 상세 조회 응답 DTO
 */
public record VideoDetailResponse(
    String videoId,
    String title,
    String description,
    String channelName,
    String channelCustomUrl,
    String channelThumbnailUrl,
    String thumbnailUrl,
    String youtubeWatchUrl,
    String embedUrl,
    LocalDateTime publishedAt,
    List<TagResponse> tags
) {
    public static VideoDetailResponse from(Video video) {
        String watchUrl = "https://www.youtube.com/watch?v=" + video.getYoutubeVideoId();
        String embedUrl = "https://www.youtube.com/embed/" + video.getYoutubeVideoId();

        List<TagResponse> tagResponses = video.getTags() != null
            ? video.getTags().stream().map(TagResponse::from).toList()
            : List.of();

        return new VideoDetailResponse(
            video.getYoutubeVideoId(),
            video.getTitle(),
            video.getDescription(),
            video.getChannel().getChannelName(),
            video.getChannel().getCustomUrl(),
            video.getChannel().getThumbnailUrl(),
            video.getThumbnailUrl(),
            watchUrl,
            embedUrl,
            video.getCreatedAt(),
            tagResponses
        );
    }
}
