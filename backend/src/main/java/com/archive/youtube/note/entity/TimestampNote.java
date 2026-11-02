package com.archive.youtube.note.entity;

import com.archive.youtube.video.entity.Video;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * 타임스탬프 시점 메모 엔티티
 * timestamp_notes 테이블과 매핑되며, 영상의 특정 재생 시점(초)과 메모 내용을 보관합니다.
 */
@Entity
@Table(
    name = "timestamp_notes",
    indexes = {
        @Index(name = "idx_timestamp_notes_video_position", columnList = "video_id, position_seconds")
    }
)
public class TimestampNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    /**
     * 영상 내 재생 시점 (초 단위, 0 이상의 정수)
     */
    @NotNull(message = "시점(초)은 필수입니다.")
    @Min(value = 0, message = "재생 시점은 0초 이상이어야 합니다.")
    @Column(name = "position_seconds", nullable = false)
    private Integer positionSeconds;

    /**
     * 메모 내용 (최대 1000자)
     */
    @NotBlank(message = "메모 내용은 필수입니다.")
    @Size(max = 1000, message = "메모 내용은 최대 1000자까지 작성할 수 있습니다.")
    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected TimestampNote() {
    }

    public TimestampNote(Video video, Integer positionSeconds, String content) {
        this.video = video;
        this.positionSeconds = positionSeconds;
        this.content = content;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void update(Integer positionSeconds, String content) {
        this.positionSeconds = positionSeconds;
        this.content = content;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Video getVideo() {
        return video;
    }

    public Integer getPositionSeconds() {
        return positionSeconds;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
