package com.archive.youtube.global.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 페이지네이션 공통 응답 DTO
 *
 * @param content       현재 페이지 항목 리스트
 * @param page          현재 페이지 번호 (0부터 시작)
 * @param size          페이지당 요청 항목 수
 * @param totalElements 전체 항목 수
 * @param totalPages    전체 페이지 수
 * @param isFirst       첫 페이지 여부
 * @param isLast        마지막 페이지 여부
 * @param hasNext       다음 페이지 존재 여부
 * @param hasPrevious   이전 페이지 존재 여부
 */
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean isFirst,
    boolean isLast,
    boolean hasNext,
    boolean hasPrevious
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            page.hasNext(),
            page.hasPrevious()
        );
    }
}
