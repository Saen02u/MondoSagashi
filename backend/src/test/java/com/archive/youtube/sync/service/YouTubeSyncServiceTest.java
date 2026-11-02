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
import com.archive.youtube.tag.entity.Tag;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class YouTubeSyncServiceTest {

    @Mock
    private ChannelRepository channelRepository;

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private SyncRunRepository syncRunRepository;

    @Mock
    private YouTubeApiClient youTubeApiClient;

    private YouTubeSyncService syncService;

    private Channel testChannel;

    @BeforeEach
    void setUp() {
        syncService = new YouTubeSyncService(
            channelRepository,
            videoRepository,
            syncRunRepository,
            youTubeApiClient,
            5
        );

        testChannel = new Channel(
            "Mondo",
            "@Mondo2233",
            "https://www.youtube.com/@Mondo2233",
            "https://example.com/thumb.jpg",
            "Mondo Live Channel"
        );
    }

    @Test
    @DisplayName("멱등적 동기화: 신규 영상은 추가되고, 기존 영상은 메타데이터만 갱신되며 태그는 보존된다")
    void idempotentSync_insertsNew_and_updatesExisting_preservingTags() {
        // Given
        given(channelRepository.findByCustomUrl("@Mondo2233")).willReturn(Optional.of(testChannel));
        given(syncRunRepository.save(any(SyncRun.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(youTubeApiClient.isConfigured()).willReturn(true);
        given(youTubeApiClient.getUploadsPlaylistId("@Mondo2233")).willReturn("UU_TEST_PLAYLIST");

        // 기존에 등록된 영상 1개 (관리자가 'Apex Legends' 태그를 부착해 둠)
        Video existingVideo = new Video("vid_existing", "이전 제목", "https://old-thumb.jpg", "이전 설명", testChannel);
        Tag adminTag = new Tag("Apex Legends", "red");
        existingVideo.addTag(adminTag);

        given(videoRepository.findByYoutubeVideoId("vid_existing")).willReturn(Optional.of(existingVideo));
        given(videoRepository.findByYoutubeVideoId("vid_new")).willReturn(Optional.empty());

        // YouTube API가 2개 영상(기존 영상 1개 최신화 + 신규 영상 1개)을 반환
        List<YouTubeVideoItem> items = List.of(
            new YouTubeVideoItem("vid_existing", "최신화된 제목 [Mondo]", "최신 설명", "https://new-thumb.jpg", LocalDateTime.now()),
            new YouTubeVideoItem("vid_new", "새로운 라이브 방송", "새 설명", "https://new2-thumb.jpg", LocalDateTime.now())
        );
        given(youTubeApiClient.fetchPlaylistItems(eq("UU_TEST_PLAYLIST"), any(), anyInt()))
            .willReturn(new YouTubePlaylistItemsPage(items, null, 2));

        // When
        SyncRunResponse response = syncService.runSync(null, "admin");

        // Then
        assertThat(response.status()).isEqualTo(SyncStatus.SUCCESS);
        assertThat(response.totalItemsFetched()).isEqualTo(2);
        assertThat(response.newItemsInserted()).isEqualTo(1);
        assertThat(response.itemsUpdated()).isEqualTo(1);

        // 기존 영상 메타데이터 갱신 검증
        assertThat(existingVideo.getTitle()).isEqualTo("최신화된 제목 [Mondo]");
        assertThat(existingVideo.getThumbnailUrl()).isEqualTo("https://new-thumb.jpg");

        // 핵심 보안/불변 원칙: 관리자가 부착한 태그가 덮어써지지 않고 그대로 유지되는지 검증
        assertThat(existingVideo.getTags()).hasSize(1);
        assertThat(existingVideo.getTags().iterator().next().getName()).isEqualTo("Apex Legends");

        // 신규 영상 저장 검증
        ArgumentCaptor<Video> videoCaptor = ArgumentCaptor.forClass(Video.class);
        verify(videoRepository, times(2)).save(videoCaptor.capture());
        List<Video> savedVideos = videoCaptor.getAllValues();
        assertThat(savedVideos).extracting(Video::getYoutubeVideoId)
            .containsExactlyInAnyOrder("vid_existing", "vid_new");
    }

    @Test
    @DisplayName("API 키가 미설정된 경우 FAILED 기록을 남기고 중단한다")
    void handlesMissingApiKey_recordsFailedSync() {
        // Given
        given(channelRepository.findByCustomUrl("@Mondo2233")).willReturn(Optional.of(testChannel));
        given(syncRunRepository.save(any(SyncRun.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(youTubeApiClient.isConfigured()).willReturn(false);

        // When
        SyncRunResponse response = syncService.runSync(null, "admin");

        // Then
        assertThat(response.status()).isEqualTo(SyncStatus.FAILED);
        assertThat(response.errorMessage()).contains("YouTube API 키(YOUTUBE_API_KEY)가 설정되지 않았습니다");
        assertThat(response.totalItemsFetched()).isEqualTo(0);
        verify(youTubeApiClient, never()).fetchPlaylistItems(anyString(), any(), anyInt());
    }

    @Test
    @DisplayName("YouTube API 일일 할당량 초과 시 FAILED 상태와 에러 메시지를 기록한다")
    void handlesQuotaExceeded_recordsFailedSync() {
        // Given
        given(channelRepository.findByCustomUrl("@Mondo2233")).willReturn(Optional.of(testChannel));
        given(syncRunRepository.save(any(SyncRun.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(youTubeApiClient.isConfigured()).willReturn(true);
        given(youTubeApiClient.getUploadsPlaylistId("@Mondo2233"))
            .willThrow(new RuntimeException("YouTube Data API 일일 할당량이 초과되었습니다 (quotaExceeded)."));

        // When
        SyncRunResponse response = syncService.runSync(null, "admin");

        // Then
        assertThat(response.status()).isEqualTo(SyncStatus.FAILED);
        assertThat(response.errorMessage()).contains("할당량이 초과되었습니다");
    }
}
