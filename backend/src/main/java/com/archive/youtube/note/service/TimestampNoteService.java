package com.archive.youtube.note.service;

import com.archive.youtube.global.exception.ResourceNotFoundException;
import com.archive.youtube.note.dto.TimestampNoteCreateRequest;
import com.archive.youtube.note.dto.TimestampNoteResponse;
import com.archive.youtube.note.dto.TimestampNoteUpdateRequest;
import com.archive.youtube.note.entity.TimestampNote;
import com.archive.youtube.note.repository.TimestampNoteRepository;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 타임스탬프 시점 메모 비즈니스 로직 서비스
 */
@Service
public class TimestampNoteService {

    private final TimestampNoteRepository timestampNoteRepository;
    private final VideoRepository videoRepository;

    public TimestampNoteService(
        TimestampNoteRepository timestampNoteRepository,
        VideoRepository videoRepository
    ) {
        this.timestampNoteRepository = timestampNoteRepository;
        this.videoRepository = videoRepository;
    }

    /**
     * 특정 영상에 등록된 시점 메모 목록 조회 (공개 접근)
     */
    @Transactional(readOnly = true)
    public List<TimestampNoteResponse> getNotesByVideoId(String videoId) {
        if (!videoRepository.findByYoutubeVideoId(videoId).isPresent()) {
            throw new ResourceNotFoundException("영상을 찾을 수 없습니다: " + videoId);
        }

        return timestampNoteRepository.findByVideo_YoutubeVideoIdOrderByPositionSecondsAsc(videoId).stream()
            .map(TimestampNoteResponse::from)
            .toList();
    }

    /**
     * 타임스탬프 메모 등록 (관리자 전용)
     */
    @Transactional
    public TimestampNoteResponse createNote(String videoId, TimestampNoteCreateRequest request) {
        if (request.positionSeconds() < 0) {
            throw new IllegalArgumentException("재생 시점은 0초 이상이어야 합니다.");
        }

        Video video = videoRepository.findByYoutubeVideoId(videoId)
            .orElseThrow(() -> new ResourceNotFoundException("영상을 찾을 수 없습니다: " + videoId));

        TimestampNote note = new TimestampNote(video, request.positionSeconds(), request.content().trim());
        TimestampNote saved = timestampNoteRepository.save(note);

        return TimestampNoteResponse.from(saved);
    }

    /**
     * 타임스탬프 메모 수정 (관리자 전용)
     */
    @Transactional
    public TimestampNoteResponse updateNote(Long noteId, TimestampNoteUpdateRequest request) {
        if (request.positionSeconds() < 0) {
            throw new IllegalArgumentException("재생 시점은 0초 이상이어야 합니다.");
        }

        TimestampNote note = timestampNoteRepository.findById(noteId)
            .orElseThrow(() -> new ResourceNotFoundException("메모를 찾을 수 없습니다: " + noteId));

        note.update(request.positionSeconds(), request.content().trim());
        return TimestampNoteResponse.from(note);
    }

    /**
     * 타임스탬프 메모 삭제 (관리자 전용)
     */
    @Transactional
    public void deleteNote(Long noteId) {
        TimestampNote note = timestampNoteRepository.findById(noteId)
            .orElseThrow(() -> new ResourceNotFoundException("메모를 찾을 수 없습니다: " + noteId));

        timestampNoteRepository.delete(note);
    }
}
