package com.archive.youtube.sync.dto;

import com.archive.youtube.sync.entity.SyncRun;
import com.archive.youtube.sync.entity.SyncStatus;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 동기화 실행 이력 응답 DTO
 */
public record SyncRunResponse(
    Long id,
    Long channelId,
    String channelName,
    String channelCustomUrl,
    SyncStatus status,
    LocalDateTime startedAt,
    LocalDateTime completedAt,
    Long durationSeconds,
    int totalItemsFetched,
    int newItemsInserted,
    int itemsUpdated,
    String errorMessage,
    String triggeredBy
) {
    public static SyncRunResponse from(SyncRun run) {
        Long duration = null;
        if (run.getStartedAt() != null && run.getCompletedAt() != null) {
            duration = Duration.between(run.getStartedAt(), run.getCompletedAt()).toSeconds();
        }

        return new SyncRunResponse(
            run.getId(),
            run.getChannel() != null ? run.getChannel().getId() : null,
            run.getChannel() != null ? run.getChannel().getChannelName() : null,
            run.getChannel() != null ? run.getChannel().getCustomUrl() : null,
            run.getStatus(),
            run.getStartedAt(),
            run.getCompletedAt(),
            duration,
            run.getTotalItemsFetched(),
            run.getNewItemsInserted(),
            run.getItemsUpdated(),
            run.getErrorMessage(),
            run.getTriggeredBy()
        );
    }
}
