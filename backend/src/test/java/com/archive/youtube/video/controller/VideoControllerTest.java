package com.archive.youtube.video.controller;

import com.archive.youtube.global.dto.PageResponse;
import com.archive.youtube.global.exception.GlobalExceptionHandler;
import com.archive.youtube.global.exception.ResourceNotFoundException;
import com.archive.youtube.tag.dto.TagResponse;
import com.archive.youtube.video.dto.VideoDetailResponse;
import com.archive.youtube.video.dto.VideoResponse;
import com.archive.youtube.video.service.VideoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.archive.youtube.auth.service.CustomUserDetailsService;
import com.archive.youtube.global.config.SecurityConfig;

@WebMvcTest(VideoController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class VideoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VideoService videoService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/v1/videos 검색 파라미터 요청 시 페이지네이션 응답을 반환한다")
    void getVideosReturnsPagedResponse() throws Exception {
        TagResponse tag = new TagResponse(1L, "Apex Legends", "red");
        VideoResponse video = new VideoResponse("2yK2D41LzB8", "에이펙스 랭크 다시보기", "Mondo", "thumb.jpg", List.of(tag));
        PageResponse<VideoResponse> pageResponse = new PageResponse<>(
            List.of(video), 0, 9, 1L, 1, true, true, false, false
        );

        given(videoService.searchVideos(anyString(), isNull(), anyString(), anyString(), anyInt(), anyInt()))
            .willReturn(pageResponse);

        mockMvc.perform(get("/api/v1/videos")
                .param("query", "에이펙스")
                .param("tag", "Apex Legends")
                .param("sort", "latest")
                .param("page", "0")
                .param("size", "9")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].videoId").value("2yK2D41LzB8"))
                .andExpect(jsonPath("$.content[0].tags[0].name").value("Apex Legends"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/videos/{videoId} 요청 시 영상 상세 정보를 반환한다")
    void getVideoDetailReturnsOk() throws Exception {
        TagResponse tag = new TagResponse(1L, "Apex Legends", "red");
        VideoDetailResponse detail = new VideoDetailResponse(
            "2yK2D41LzB8",
            "에이펙스 랭크 다시보기",
            "상세 설명 내용입니다.",
            "Mondo",
            "@Mondo2233",
            "channel_thumb.jpg",
            "thumb.jpg",
            "https://www.youtube.com/watch?v=2yK2D41LzB8",
            "https://www.youtube.com/embed/2yK2D41LzB8",
            LocalDateTime.now(),
            List.of(tag)
        );

        given(videoService.getVideoDetail("2yK2D41LzB8")).willReturn(detail);

        mockMvc.perform(get("/api/v1/videos/2yK2D41LzB8")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videoId").value("2yK2D41LzB8"))
                .andExpect(jsonPath("$.youtubeWatchUrl").value("https://www.youtube.com/watch?v=2yK2D41LzB8"))
                .andExpect(jsonPath("$.embedUrl").value("https://www.youtube.com/embed/2yK2D41LzB8"))
                .andExpect(jsonPath("$.channelCustomUrl").value("@Mondo2233"));
    }

    @Test
    @DisplayName("존재하지 않는 videoId 조회 시 404 NOT_FOUND를 반환한다")
    void getVideoDetailReturns404WhenNotFound() throws Exception {
        given(videoService.getVideoDetail("invalid_id"))
            .willThrow(new ResourceNotFoundException("해당 영상을 찾을 수 없습니다: invalid_id"));

        mockMvc.perform(get("/api/v1/videos/invalid_id")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("해당 영상을 찾을 수 없습니다: invalid_id"));
    }
}
