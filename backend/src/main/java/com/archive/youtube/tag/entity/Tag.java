package com.archive.youtube.tag.entity;

import com.archive.youtube.video.entity.Video;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 영상 분류를 위한 태그 엔티티
 * tags 테이블과 매핑되며, video_tags 연결 테이블을 통해 Video와 N:M 관계를 가집니다.
 */
@Entity
@Table(name = "tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 30)
    private String color; // UI 배지 색상 (예: red, blue, emerald, purple)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany(mappedBy = "tags")
    private Set<Video> videos = new HashSet<>();

    protected Tag() {
    }

    public Tag(String name, String color) {
        this.name = name;
        this.color = color;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<Video> getVideos() {
        return videos;
    }
}
