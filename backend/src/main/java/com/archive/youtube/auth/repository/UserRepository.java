package com.archive.youtube.auth.repository;

import com.archive.youtube.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 사용자 데이터 접근을 담당하는 Spring Data JPA 리포지토리
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 사용자명으로 회원 단건 조회
     */
    Optional<User> findByUsername(String username);
}
