package com.archive.youtube.sync.controller;

import com.archive.youtube.sync.dto.SyncRunResponse;
import com.archive.youtube.sync.service.YouTubeSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * YouTube 동기화 컨트롤러
 *
 * [보안 규칙]
 * - 수동 동기화 실행(POST /api/v1/sync/**): 관리자 전용 (@PreAuthorize("hasRole('ADMIN')"))
 * - 실행 이력 및 상태 조회(GET /api/v1/sync/**): 공개 조회 허용
 */
@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    private final YouTubeSyncService syncService;

    public SyncController(YouTubeSyncService syncService) {
        this.syncService = syncService;
    }

    /**
     * 관리자 수동 동기화 실행 (기본 Mondo 채널)
     */
    @PostMapping("/run")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SyncRunResponse> runManualSync(Authentication authentication) {
        String adminUser = authentication != null ? authentication.getName() : "ADMIN";
        SyncRunResponse response = syncService.runSync(null, adminUser);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 채널에 대한 관리자 수동 동기화 실행
     */
    @PostMapping("/channels/{channelId}/run")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SyncRunResponse> runChannelManualSync(
        @PathVariable Long channelId,
        Authentication authentication
    ) {
        String adminUser = authentication != null ? authentication.getName() : "ADMIN";
        SyncRunResponse response = syncService.runSync(channelId, adminUser);
        return ResponseEntity.ok(response);
    }

    /**
     * 전체 동기화 실행 이력 목록 조회
     */
    @GetMapping("/runs")
    public ResponseEntity<List<SyncRunResponse>> getSyncRuns(
        @RequestParam(required = false) Long channelId
    ) {
        if (channelId != null) {
            return ResponseEntity.ok(syncService.getSyncRunsByChannel(channelId));
        }
        return ResponseEntity.ok(syncService.getSyncRuns());
    }

    /**
     * 최신 동기화 실행 상태 단건 조회
     */
    @GetMapping("/latest")
    public ResponseEntity<SyncRunResponse> getLatestSyncRun(
        @RequestParam(required = false) Long channelId
    ) {
        return syncService.getLatestSyncRun(channelId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
