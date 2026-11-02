package com.archive.youtube.sync.repository;

import com.archive.youtube.sync.entity.SyncRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * sync_runs 테이블 데이터 접근 리포지토리
 */
@Repository
public interface SyncRunRepository extends JpaRepository<SyncRun, Long> {

    /**
     * 전체 동기화 이력을 최신 시작일시 순으로 조회
     */
    @Query("SELECT s FROM SyncRun s JOIN FETCH s.channel ORDER BY s.startedAt DESC")
    List<SyncRun> findAllWithChannelOrderByStartedAtDesc();

    /**
     * 특정 채널의 동기화 이력을 최신순으로 조회
     */
    @Query("SELECT s FROM SyncRun s JOIN FETCH s.channel WHERE s.channel.id = :channelId ORDER BY s.startedAt DESC")
    List<SyncRun> findByChannelIdWithChannelOrderByStartedAtDesc(Long channelId);

    /**
     * 특정 채널의 가장 최근 동기화 실행 단건 조회
     */
    Optional<SyncRun> findTopByChannel_IdOrderByStartedAtDesc(Long channelId);

    /**
     * 가장 최근 실행된 동기화 단건 조회
     */
    Optional<SyncRun> findTopByOrderByStartedAtDesc();
}
