package com.archive.youtube.video.dto;

import com.archive.youtube.tag.dto.TagResponse;
import com.archive.youtube.video.entity.Video;

import java.util.List;

/**
 * 영상 조회 응답 DTO
 *
 * @param videoId      YouTube 고유 영상 ID
 * @param title        영상 제목
 * @param channelName  채널명
 * @param thumbnailUrl 썸네일 이미지 URL
 * @param tags         연결된 태그 목록
 */
public record VideoResponse(
    String videoId,
    String title,
    String channelName,
    String thumbnailUrl,
    List<TagResponse> tags
) {
    public static VideoResponse from(Video video) {
        List<TagResponse> tagResponses = video.getTags() != null
            ? video.getTags().stream().map(TagResponse::from).toList()
            : List.of();

        return new VideoResponse(
            video.getYoutubeVideoId(),
            video.getTitle(),
            video.getChannel().getChannelName(),
            video.getThumbnailUrl(),
            tagResponses
        );
    }
}
