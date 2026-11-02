package com.archive.youtube.video.repository;

import com.archive.youtube.video.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 영상 데이터 접근을 담당하는 Spring Data JPA 리포지토리
 */
@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    /**
     * YouTube 고유 ID로 영상 및 연관 채널, 태그 조회
     */
    @Query("SELECT v FROM Video v JOIN FETCH v.channel LEFT JOIN FETCH v.tags WHERE v.youtubeVideoId = :youtubeVideoId")
    Optional<Video> findByYoutubeVideoIdWithDetails(@Param("youtubeVideoId") String youtubeVideoId);

    /**
     * 기본 YouTube 고유 ID 조회
     */
    Optional<Video> findByYoutubeVideoId(String youtubeVideoId);

    /**
     * 전체 영상 조회 (Fetch Join)
     */
    @Query("SELECT DISTINCT v FROM Video v JOIN FETCH v.channel ORDER BY v.id DESC")
    List<Video> findAllWithChannel();

    /**
     * 제목 검색어, 채널 ID, 태그명을 조건으로 하는 동적 검색 및 페이지네이션
     */
    @Query(
        value = "SELECT DISTINCT v FROM Video v " +
                "JOIN FETCH v.channel c " +
                "LEFT JOIN v.tags t " +
                "WHERE LOWER(v.title) LIKE LOWER(CONCAT('%', COALESCE(:query, ''), '%')) " +
                "AND (:channelId IS NULL OR c.id = :channelId) " +
                "AND (:tag IS NULL OR t.name = :tag)",
        countQuery = "SELECT COUNT(DISTINCT v) FROM Video v " +
                "LEFT JOIN v.tags t " +
                "WHERE LOWER(v.title) LIKE LOWER(CONCAT('%', COALESCE(:query, ''), '%')) " +
                "AND (:channelId IS NULL OR v.channel.id = :channelId) " +
                "AND (:tag IS NULL OR t.name = :tag)"
    )
    Page<Video> searchVideos(
        @Param("query") String query,
        @Param("channelId") Long channelId,
        @Param("tag") String tag,
        Pageable pageable
    );
}
