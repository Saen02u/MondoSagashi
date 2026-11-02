package com.archive.youtube.video.controller;

import com.archive.youtube.global.dto.PageResponse;
import com.archive.youtube.video.dto.VideoDetailResponse;
import com.archive.youtube.video.dto.VideoResponse;
import com.archive.youtube.video.service.VideoService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 영상 조회 및 검색을 위한 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/videos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@Validated
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    /**
     * 영상 목록 검색, 필터링, 정렬 및 페이지네이션 API
     *
     * @param query     검색할 영상 제목 (선택)
     * @param channelId 채널 ID 필터 (선택)
     * @param tag       태그명 필터 (선택)
     * @param sort      정렬 기준 (latest, oldest, title - 기본값: latest)
     * @param page      페이지 번호 (0부터 시작 - 기본값: 0, 최소: 0)
     * @param size      페이지 크기 (기본값: 9, 최소: 1, 최대: 50)
     * @return 페이지네이션된 VideoResponse 목록
     */
    @GetMapping
    public ResponseEntity<PageResponse<VideoResponse>> getVideos(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) Long channelId,
        @RequestParam(required = false) String tag,
        @RequestParam(required = false, defaultValue = "latest") String sort,
        @RequestParam(required = false, defaultValue = "0") @Min(value = 0, message = "page는 0 이상이어야 합니다.") int page,
        @RequestParam(required = false, defaultValue = "9") @Min(value = 1, message = "size는 1 이상이어야 합니다.") @Max(value = 50, message = "size는 50 이하이어야 합니다.") int size
    ) {
        PageResponse<VideoResponse> response = videoService.searchVideos(query, channelId, tag, sort, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 영상 상세 정보 조회 API
     *
     * @param videoId YouTube 영상 고유 ID
     * @return 영상 상세 정보 (YouTube Watch URL 및 Embed URL 포함)
     */
    @GetMapping("/{videoId}")
    public ResponseEntity<VideoDetailResponse> getVideoDetail(@PathVariable String videoId) {
        VideoDetailResponse detail = videoService.getVideoDetail(videoId);
        return ResponseEntity.ok(detail);
    }
}
