package com.archive.youtube.note.controller;

import com.archive.youtube.note.dto.TimestampNoteCreateRequest;
import com.archive.youtube.note.dto.TimestampNoteResponse;
import com.archive.youtube.note.dto.TimestampNoteUpdateRequest;
import com.archive.youtube.note.service.TimestampNoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 타임스탬프 시점 메모 REST 컨트롤러
 * 조회는 모든 사용자에게 공개되며, 등록·수정·삭제는 ROLE_ADMIN 권한이 필수입니다.
 */
@RestController
@RequestMapping("/api/v1")
public class TimestampNoteController {

    private final TimestampNoteService timestampNoteService;

    public TimestampNoteController(TimestampNoteService timestampNoteService) {
        this.timestampNoteService = timestampNoteService;
    }

    /**
     * 특정 영상의 시점 메모 목록 조회 (공개 접근)
     */
    @GetMapping("/videos/{videoId}/notes")
    public ResponseEntity<List<TimestampNoteResponse>> getNotes(@PathVariable String videoId) {
        List<TimestampNoteResponse> notes = timestampNoteService.getNotesByVideoId(videoId);
        return ResponseEntity.ok(notes);
    }

    /**
     * 시점 메모 등록 (관리자 전용)
     */
    @PostMapping("/videos/{videoId}/notes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimestampNoteResponse> createNote(
        @PathVariable String videoId,
        @Valid @RequestBody TimestampNoteCreateRequest request
    ) {
        TimestampNoteResponse created = timestampNoteService.createNote(videoId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 시점 메모 수정 (관리자 전용)
     */
    @PutMapping("/notes/{noteId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimestampNoteResponse> updateNote(
        @PathVariable Long noteId,
        @Valid @RequestBody TimestampNoteUpdateRequest request
    ) {
        TimestampNoteResponse updated = timestampNoteService.updateNote(noteId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * 시점 메모 삭제 (관리자 전용)
     */
    @DeleteMapping("/notes/{noteId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteNote(@PathVariable Long noteId) {
        timestampNoteService.deleteNote(noteId);
        return ResponseEntity.ok(Map.of("message", "메모가 성공적으로 삭제되었습니다."));
    }
}
