package com.archive.youtube.sync.entity;

import com.archive.youtube.channel.entity.Channel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * YouTube 동기화 이력 엔티티
 * sync_runs 테이블과 매핑되며, 동기화 실행 상태, 시작/종료 시각, 수집 항목 수 및 오류 내역을 기록합니다.
 */
@Entity
@Table(
    name = "sync_runs",
    indexes = {
        @Index(name = "idx_sync_runs_channel_id", columnList = "channel_id"),
        @Index(name = "idx_sync_runs_started_at", columnList = "started_at")
    }
)
public class SyncRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SyncStatus status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "total_items_fetched", nullable = false)
    private int totalItemsFetched = 0;

    @Column(name = "new_items_inserted", nullable = false)
    private int newItemsInserted = 0;

    @Column(name = "items_updated", nullable = false)
    private int itemsUpdated = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "triggered_by", nullable = false, length = 50)
    private String triggeredBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected SyncRun() {
    }

    public SyncRun(Channel channel, String triggeredBy) {
        this.channel = channel;
        this.status = SyncStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
        this.triggeredBy = (triggeredBy != null && !triggeredBy.isBlank()) ? triggeredBy : "MANUAL_ADMIN";
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.startedAt == null) {
            this.startedAt = now;
        }
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 동기화 성공 완료 처리
     */
    public void markSuccess(int totalFetched, int newInserted, int updated) {
        this.status = SyncStatus.SUCCESS;
        this.completedAt = LocalDateTime.now();
        this.totalItemsFetched = totalFetched;
        this.newItemsInserted = newInserted;
        this.itemsUpdated = updated;
        this.errorMessage = null;
    }

    /**
     * 동기화 실패 처리
     */
    public void markFailed(String errorMessage, int totalFetched, int newInserted, int updated) {
        this.status = SyncStatus.FAILED;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = errorMessage;
        this.totalItemsFetched = totalFetched;
        this.newItemsInserted = newInserted;
        this.itemsUpdated = updated;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Channel getChannel() {
        return channel;
    }

    public SyncStatus getStatus() {
        return status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public int getTotalItemsFetched() {
        return totalItemsFetched;
    }

    public int getNewItemsInserted() {
        return newItemsInserted;
    }

    public int getItemsUpdated() {
        return itemsUpdated;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getTriggeredBy() {
        return triggeredBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
