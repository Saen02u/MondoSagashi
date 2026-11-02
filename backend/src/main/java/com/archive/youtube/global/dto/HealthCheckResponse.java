package com.archive.youtube.global.dto;

import java.time.LocalDateTime;

/**
 * 헬스 체크 응답 DTO
 * API 요청·응답 분리 원칙에 따라 DTO를 정의합니다.
 */
public record HealthCheckResponse(
    String status,
    String service,
    String message,
    LocalDateTime timestamp
) {
    public static HealthCheckResponse up() {
        return new HealthCheckResponse(
            "UP",
            "YouTube Live Archive API",
            "YouTube 라이브 아카이브 백엔드 서버가 정상 동작 중입니다.",
            LocalDateTime.now()
        );
    }
}
