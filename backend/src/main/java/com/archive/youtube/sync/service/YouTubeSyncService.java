package com.archive.youtube.sync.service;

import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.channel.repository.ChannelRepository;
import com.archive.youtube.sync.client.YouTubeApiClient;
import com.archive.youtube.sync.client.model.YouTubePlaylistItemsPage;
import com.archive.youtube.sync.client.model.YouTubeVideoItem;
import com.archive.youtube.sync.dto.SyncRunResponse;
import com.archive.youtube.sync.entity.SyncRun;
import com.archive.youtube.sync.entity.SyncStatus;
import com.archive.youtube.sync.repository.SyncRunRepository;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * YouTube Data API v3 기반 채널 영상 수집 및 멱등적(Idempotent) 동기화 서비스
 *
 * [핵심 불변 원칙]
 * 1. 멱등성: youtube_video_id UNIQUE 제약을 활용하여 동일 영상이 중복 등록되지 않으며, 재실행해도 안전합니다.
 * 2. 관리자 데이터 보존: YouTube에서 가져온 메타데이터(제목, 썸네일, 설명)만 갱신하며,
 *    관리자가 부착한 태그(video_tags) 및 타임스탬프 메모(timestamp_notes)는 절대 덮어쓰거나 초기화하지 않습니다.
 * 3. 실행 기록(sync_runs): 성공 여부, 시작/종료 시각, 수집 항목 수, 신규/업데이트 수 및 에러 메시지를 감사 로그로 보관합니다.
 */
@Service
public class YouTubeSyncService {

    private static final Logger log = LoggerFactory.getLogger(YouTubeSyncService.class);

    private final ChannelRepository channelRepository;
    private final VideoRepository videoRepository;
    private final SyncRunRepository syncRunRepository;
    private final YouTubeApiClient youTubeApiClient;
    private final int maxPagesPerSync;

    public YouTubeSyncService(
        ChannelRepository channelRepository,
        VideoRepository videoRepository,
        SyncRunRepository syncRunRepository,
        YouTubeApiClient youTubeApiClient,
        @Value("${youtube.api.max-pages-per-sync:5}") int maxPagesPerSync
    ) {
        this.channelRepository = channelRepository;
        this.videoRepository = videoRepository;
        this.syncRunRepository = syncRunRepository;
        this.youTubeApiClient = youTubeApiClient;
        this.maxPagesPerSync = maxPagesPerSync;
    }

    /**
     * 특정 채널 또는 기본 채널에 대한 수동 동기화 실행
     */
    @Transactional
    public SyncRunResponse runSync(Long channelId, String triggeredBy) {
        Channel channel;
        if (channelId != null) {
            channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채널 ID입니다: " + channelId));
        } else {
            // 기본 채널: Mondo (@Mondo2233)
            channel = channelRepository.findByCustomUrl("@Mondo2233")
                .or(() -> channelRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new IllegalStateException("동기화 대상 채널이 데이터베이스에 등록되어 있지 않습니다."));
        }

        // 1. sync_runs 실행 기록 생성 (IN_PROGRESS)
        SyncRun syncRun = new SyncRun(channel, triggeredBy);
        syncRun = syncRunRepository.save(syncRun);
        log.info("YouTube 동기화 시작 - SyncRun ID: {}, 채널: {} ({})", syncRun.getId(), channel.getChannelName(), channel.getCustomUrl());

        int totalFetched = 0;
        int newInserted = 0;
        int itemsUpdated = 0;

        try {
            // 2. API 키 설정 여부 사전 검증
            if (!youTubeApiClient.isConfigured()) {
                String errMsg = "YouTube API 키(YOUTUBE_API_KEY)가 설정되지 않았습니다. 서버 환경변수를 등록해 주세요.";
                log.warn("동기화 중단: {}", errMsg);
                syncRun.markFailed(errMsg, 0, 0, 0);
                syncRunRepository.save(syncRun);
                return SyncRunResponse.from(syncRun);
            }

            // 3. 채널 핸들/ID로부터 업로드 재생목록 ID(UU...) 획득 (Quota: 1 unit)
            String uploadsPlaylistId = youTubeApiClient.getUploadsPlaylistId(channel.getCustomUrl());

            // 4. 업로드 재생목록 항목 순회 수집 (페이지 당 50개, 1 unit)
            String pageToken = null;
            int pageCount = 0;

            while (pageCount < maxPagesPerSync) {
                pageCount++;
                log.debug("동기화 페이지 {} 호출 중 - pageToken: {}", pageCount, pageToken);

                YouTubePlaylistItemsPage page = youTubeApiClient.fetchPlaylistItems(uploadsPlaylistId, pageToken, 50);
                if (page.items() == null || page.items().isEmpty()) {
                    break;
                }

                for (YouTubeVideoItem item : page.items()) {
                    totalFetched++;

                    // [핵심 필터 규칙]: youtube.com/live로 시작하는 라이브 방송 영상만 아카이브에 수집
                    if (!item.isLiveStream() || item.liveUrl() == null || !item.liveUrl().startsWith("https://www.youtube.com/live/")) {
                        log.info("라이브 방송(youtube.com/live)이 아닌 일반 영상은 아카이브 수집 대상에서 제외합니다: {} ({})", item.title(), item.videoId());
                        continue;
                    }

                    Optional<Video> existingOpt = videoRepository.findByYoutubeVideoId(item.videoId());
                    if (existingOpt.isPresent()) {
                        // 기존 영상 존재: 공개 메타데이터만 갱신 (태그/메모는 불변 보존)
                        Video existing = existingOpt.get();
                        existing.updateYouTubeMetadata(item.title(), item.thumbnailUrl(), item.description());
                        videoRepository.save(existing);
                        itemsUpdated++;
                    } else {
                        // 신규 영상: DB에 삽입 (youtube_video_id UNIQUE 보장)
                        Video newVideo = new Video(
                            item.videoId(),
                            item.title(),
                            item.thumbnailUrl(),
                            item.description(),
                            channel
                        );
                        videoRepository.save(newVideo);
                        newInserted++;
                    }
                }

                pageToken = page.nextPageToken();
                if (pageToken == null || pageToken.isBlank()) {
                    break;
                }
            }

            // 5. 성공 기록 업데이트
            syncRun.markSuccess(totalFetched, newInserted, itemsUpdated);
            log.info("YouTube 동기화 성공 완료 - 총 수집: {}, 신규 등록: {}, 메타데이터 갱신: {}", totalFetched, newInserted, itemsUpdated);

        } catch (Exception ex) {
            log.error("YouTube 동기화 중 오류 발생: {}", ex.getMessage(), ex);
            syncRun.markFailed(ex.getMessage(), totalFetched, newInserted, itemsUpdated);
        }

        syncRun = syncRunRepository.save(syncRun);
        return SyncRunResponse.from(syncRun);
    }

    /**
     * 전체 동기화 실행 이력 목록 조회
     */
    @Transactional(readOnly = true)
    public List<SyncRunResponse> getSyncRuns() {
        return syncRunRepository.findAllWithChannelOrderByStartedAtDesc()
            .stream()
            .map(SyncRunResponse::from)
            .toList();
    }

    /**
     * 특정 채널의 동기화 이력 목록 조회
     */
    @Transactional(readOnly = true)
    public List<SyncRunResponse> getSyncRunsByChannel(Long channelId) {
        return syncRunRepository.findByChannelIdWithChannelOrderByStartedAtDesc(channelId)
            .stream()
            .map(SyncRunResponse::from)
            .toList();
    }

    /**
     * 가장 최근 동기화 실행 상태 조회
     */
    @Transactional(readOnly = true)
    public Optional<SyncRunResponse> getLatestSyncRun(Long channelId) {
        if (channelId != null) {
            return syncRunRepository.findTopByChannel_IdOrderByStartedAtDesc(channelId)
                .map(SyncRunResponse::from);
        }
        return syncRunRepository.findTopByOrderByStartedAtDesc()
            .map(SyncRunResponse::from);
    }
}
