package com.archive.youtube.auth.dto;

/**
 * 관리자 인증 상태 응답 DTO
 */
public record AuthStatusResponse(
    boolean authenticated,
    String username,
    String role
) {
    public static AuthStatusResponse unauthenticated() {
        return new AuthStatusResponse(false, null, null);
    }

    public static AuthStatusResponse authenticated(String username, String role) {
        return new AuthStatusResponse(true, username, role);
    }
}
