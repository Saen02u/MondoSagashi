package com.archive.youtube.note.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 타임스탬프 메모 수정 요청 DTO
 */
public record TimestampNoteUpdateRequest(
    @NotNull(message = "재생 시점(초)은 필수 항목입니다.")
    @Min(value = 0, message = "재생 시점은 0초 이상의 정수여야 합니다.")
    Integer positionSeconds,

    @NotBlank(message = "메모 내용을 입력해 주세요.")
    @Size(max = 1000, message = "메모 내용은 최대 1000자까지 작성할 수 있습니다.")
    String content
) {
}
