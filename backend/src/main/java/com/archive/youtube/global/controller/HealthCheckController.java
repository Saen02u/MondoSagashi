package com.archive.youtube.global.controller;

import com.archive.youtube.global.dto.HealthCheckResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 전역 헬스 체크 및 서버 상태 확인 컨트롤러
 * HTTP 요청/응답 처리를 담당하며 기본 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class HealthCheckController {

    @GetMapping("/health")
    public ResponseEntity<HealthCheckResponse> health() {
        return ResponseEntity.ok(HealthCheckResponse.up());
    }
}
