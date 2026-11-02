package com.archive.youtube.channel.entity;

import com.archive.youtube.video.entity.Video;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * YouTube 채널 엔티티
 * channels 테이블과 매핑되며, 특정 YouTube 채널(예: @Mondo2233)의 메타데이터를 저장합니다.
 */
@Entity
@Table(name = "channels")
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String channelName;

    @Column(nullable = false, unique = true, length = 100)
    private String customUrl; // 예: @Mondo2233

    @Column(nullable = false, length = 255)
    private String youtubeChannelUrl; // 예: https://www.youtube.com/@Mondo2233

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 1:N 연관관계 (Channel 1 : Video N)
     * 한 채널은 여러 개의 라이브 다시보기 영상을 보유합니다.
     */
    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Video> videos = new ArrayList<>();

    protected Channel() {
    }

    public Channel(String channelName, String customUrl, String youtubeChannelUrl, String thumbnailUrl, String description) {
        this.channelName = channelName;
        this.customUrl = customUrl;
        this.youtubeChannelUrl = youtubeChannelUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.description = description;
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

    public void addVideo(Video video) {
        this.videos.add(video);
        video.assignChannel(this);
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getChannelName() {
        return channelName;
    }

    public String getCustomUrl() {
        return customUrl;
    }

    public String getYoutubeChannelUrl() {
        return youtubeChannelUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<Video> getVideos() {
        return videos;
    }
}
