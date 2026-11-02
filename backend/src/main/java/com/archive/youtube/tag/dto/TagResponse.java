package com.archive.youtube.tag.dto;

import com.archive.youtube.tag.entity.Tag;

/**
 * 태그 응답 DTO
 */
public record TagResponse(
    Long id,
    String name,
    String color
) {
    public static TagResponse from(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor());
    }
}
