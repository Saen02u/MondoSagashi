package com.archive.youtube.video.entity;

import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.tag.entity.Tag;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * YouTube 라이브 다시보기 영상 엔티티
 * videos 테이블과 매핑되며, youtubeVideoId에 UNIQUE 제약조건이 적용되어 중복 수집을 방지합니다.
 * Tag와는 video_tags 연결 테이블을 통해 다대다(N:M) 연관관계를 가집니다.
 */
@Entity
@Table(
    name = "videos",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_videos_youtube_video_id", columnNames = {"youtube_video_id"})
    }
)
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * YouTube 고유 영상 ID (예: hU8Y_lW8b_0)
     * UNIQUE 제약조건을 부여하여 동일한 영상이 중복 저장되는 것을 DB 수준에서 차단합니다.
     */
    @Column(name = "youtube_video_id", nullable = false, unique = true, length = 50)
    private String youtubeVideoId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 500)
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * N:1 연관관계 (Video N : Channel 1)
     * 지연 로딩(LAZY)을 적용하여 불필요한 즉시 조회 쿼리를 방지합니다.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    /**
     * N:M 연관관계 (Video N : Tag M)
     * video_tags 연결 테이블(Join Table)을 통해 매핑합니다.
     */
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "video_tags",
        joinColumns = @JoinColumn(name = "video_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected Video() {
    }

    public Video(String youtubeVideoId, String title, String thumbnailUrl, Channel channel) {
        this(youtubeVideoId, title, thumbnailUrl, null, channel);
    }

    public Video(String youtubeVideoId, String title, String thumbnailUrl, String description, Channel channel) {
        this.youtubeVideoId = youtubeVideoId;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.description = description;
        this.channel = channel;
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

    public void assignChannel(Channel channel) {
        this.channel = channel;
    }

    public void addTag(Tag tag) {
        this.tags.add(tag);
        tag.getVideos().add(this);
    }

    /**
     * YouTube API 동기화 시 공개 메타데이터만 갱신합니다.
     * 관리자가 수동으로 부착한 태그(tags)와 타임스탬프 메모(notes)는 일체 건드리지 않고 온전히 보존합니다.
     */
    public void updateYouTubeMetadata(String title, String thumbnailUrl, String description) {
        if (title != null && !title.isBlank()) {
            this.title = title;
        }
        if (thumbnailUrl != null && !thumbnailUrl.isBlank()) {
            this.thumbnailUrl = thumbnailUrl;
        }
        if (description != null) {
            this.description = description;
        }
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getYoutubeVideoId() {
        return youtubeVideoId;
    }

    public String getTitle() {
        return title;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getDescription() {
        return description;
    }

    public Channel getChannel() {
        return channel;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
