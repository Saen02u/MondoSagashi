package com.archive.youtube.video.service;

import com.archive.youtube.global.dto.PageResponse;
import com.archive.youtube.global.exception.ResourceNotFoundException;
import com.archive.youtube.video.dto.VideoDetailResponse;
import com.archive.youtube.video.dto.VideoResponse;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 영상 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    /**
     * 영상 검색, 필터링, 정렬, 페이지네이션 조회
     */
    @Transactional(readOnly = true)
    public PageResponse<VideoResponse> searchVideos(
        String query,
        Long channelId,
        String tag,
        String sort,
        int page,
        int size
    ) {
        String trimmedQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String trimmedTag = (tag != null && !tag.trim().isEmpty()) ? tag.trim() : null;

        Sort sortOrder = switch (sort != null ? sort.toLowerCase() : "latest") {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "id");
            case "title" -> Sort.by(Sort.Direction.ASC, "title");
            default -> Sort.by(Sort.Direction.DESC, "id");
        };

        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);
        Page<Video> videoPage = videoRepository.searchVideos(trimmedQuery, channelId, trimmedTag, pageRequest);

        Page<VideoResponse> responsePage = videoPage.map(VideoResponse::from);
        return PageResponse.from(responsePage);
    }

    /**
     * 단일 영상 상세 조회
     *
     * @param videoId YouTube 영상 고유 ID
     * @return VideoDetailResponse
     */
    @Transactional(readOnly = true)
    public VideoDetailResponse getVideoDetail(String videoId) {
        Video video = videoRepository.findByYoutubeVideoIdWithDetails(videoId)
            .orElseThrow(() -> new ResourceNotFoundException("해당 영상을 찾을 수 없습니다: " + videoId));

        return VideoDetailResponse.from(video);
    }

    /**
     * 전체 영상 단순 리스트 조회 (하위 호환)
     */
    @Transactional(readOnly = true)
    public List<VideoResponse> getVideos() {
        return searchVideos(null, null, null, "latest", 0, 50).content();
    }
}
