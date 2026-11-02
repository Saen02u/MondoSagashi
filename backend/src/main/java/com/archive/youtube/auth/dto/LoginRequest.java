package com.archive.youtube.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 관리자 로그인 요청 DTO
 */
public record LoginRequest(
    @NotBlank(message = "아이디를 입력해 주세요.")
    String username,

    @NotBlank(message = "비밀번호를 입력해 주세요.")
    String password
) {
}
