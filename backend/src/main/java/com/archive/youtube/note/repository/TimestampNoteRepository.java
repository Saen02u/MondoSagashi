package com.archive.youtube.note.repository;

import com.archive.youtube.note.entity.TimestampNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 타임스탬프 메모 데이터 접근을 담당하는 Spring Data JPA 리포지토리
 */
@Repository
public interface TimestampNoteRepository extends JpaRepository<TimestampNote, Long> {

    /**
     * 특정 영상의 YouTube videoId로 메모 목록을 재생 시점(position_seconds) 오름차순으로 조회합니다.
     */
    List<TimestampNote> findByVideo_YoutubeVideoIdOrderByPositionSecondsAsc(String youtubeVideoId);
}
