package com.archive.youtube.channel.repository;

import com.archive.youtube.channel.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 채널 데이터 접근을 담당하는 Spring Data JPA 리포지토리
 */
@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {

    /**
     * 커스텀 URL(예: @Mondo2233)로 채널 단건 조회
     */
    Optional<Channel> findByCustomUrl(String customUrl);
}
