package com.archive.youtube.video.service;

import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.global.dto.PageResponse;
import com.archive.youtube.global.exception.ResourceNotFoundException;
import com.archive.youtube.tag.entity.Tag;
import com.archive.youtube.video.dto.VideoDetailResponse;
import com.archive.youtube.video.dto.VideoResponse;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @InjectMocks
    private VideoService videoService;

    @Test
    @DisplayName("searchVideos 호출 시 페이지네이션된 결과를 반환한다")
    void searchVideosReturnsPagedResponse() {
        Channel channel = new Channel("Mondo", "@Mondo2233", "https://youtube.com/@Mondo2233", "thumb.jpg", "desc");
        Video video = new Video("2yK2D41LzB8", "[Mondo] 에이펙스 레전드 마스터 랭크 풀버전 다시보기", "video_thumb.jpg", channel);
        Tag tag = new Tag("Apex Legends", "red");
        video.addTag(tag);

        PageImpl<Video> page = new PageImpl<>(List.of(video), PageRequest.of(0, 9), 1);
        given(videoRepository.searchVideos(eq("에이펙스"), eq(null), eq("Apex Legends"), any())).willReturn(page);

        PageResponse<VideoResponse> response = videoService.searchVideos("에이펙스", null, "Apex Legends", "latest", 0, 9);

        assertThat(response.content()).hasSize(1);
        assertThat(response.totalElements()).isEqualTo(1);
        assertThat(response.content().get(0).tags()).hasSize(1);
    }

    @Test
    @DisplayName("getVideoDetail 호출 시 영상 상세 정보를 반환하고 존재하지 않으면 예외를 던진다")
    void getVideoDetailReturnsDetailOrThrows() {
        Channel channel = new Channel("Mondo", "@Mondo2233", "https://youtube.com/@Mondo2233", "thumb.jpg", "desc");
        Video video = new Video("2yK2D41LzB8", "영상 제목", "thumb.jpg", "상세 설명입니다.", channel);

        given(videoRepository.findByYoutubeVideoIdWithDetails("2yK2D41LzB8")).willReturn(Optional.of(video));
        given(videoRepository.findByYoutubeVideoIdWithDetails("not_found")).willReturn(Optional.empty());

        VideoDetailResponse detail = videoService.getVideoDetail("2yK2D41LzB8");
        assertThat(detail.title()).isEqualTo("영상 제목");
        assertThat(detail.youtubeWatchUrl()).isEqualTo("https://www.youtube.com/live/2yK2D41LzB8");
        assertThat(detail.embedUrl()).isEqualTo("https://www.youtube.com/embed/2yK2D41LzB8");

        assertThatThrownBy(() -> videoService.getVideoDetail("not_found"))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
