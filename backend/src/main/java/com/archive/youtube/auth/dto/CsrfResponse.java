package com.archive.youtube.auth.dto;

/**
 * CSRF 토큰 응답 DTO
 */
public record CsrfResponse(
    String token,
    String headerName,
    String parameterName
) {
}
