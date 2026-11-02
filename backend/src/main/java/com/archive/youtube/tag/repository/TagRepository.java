package com.archive.youtube.tag.repository;

import com.archive.youtube.tag.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 태그 데이터 접근을 담당하는 Spring Data JPA 리포지토리
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    /**
     * 태그명(name)으로 단건 조회
     */
    Optional<Tag> findByName(String name);
}
