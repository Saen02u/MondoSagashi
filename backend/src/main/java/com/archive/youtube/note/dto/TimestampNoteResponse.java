package com.archive.youtube.note.dto;

import com.archive.youtube.note.entity.TimestampNote;

import java.time.LocalDateTime;

/**
 * 타임스탬프 메모 응답 DTO
 */
public record TimestampNoteResponse(
    Long id,
    String videoId,
    Integer positionSeconds,
    String formattedTime,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TimestampNoteResponse from(TimestampNote note) {
        return new TimestampNoteResponse(
            note.getId(),
            note.getVideo().getYoutubeVideoId(),
            note.getPositionSeconds(),
            formatSeconds(note.getPositionSeconds()),
            note.getContent(),
            note.getCreatedAt(),
            note.getUpdatedAt()
        );
    }

    public static String formatSeconds(Integer totalSec) {
        if (totalSec == null || totalSec <= 0) {
            return "00:00";
        }
        int hours = totalSec / 3600;
        int minutes = (totalSec % 3600) / 60;
        int seconds = totalSec % 60;

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        }
        return String.format("%02d:%02d", minutes, seconds);
    }
}
