package com.archive.youtube.sync.controller;

import com.archive.youtube.auth.service.CustomUserDetailsService;
import com.archive.youtube.global.config.SecurityConfig;
import com.archive.youtube.sync.dto.SyncRunResponse;
import com.archive.youtube.sync.entity.SyncStatus;
import com.archive.youtube.sync.service.YouTubeSyncService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SyncController.class)
@Import(SecurityConfig.class)
class SyncControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private YouTubeSyncService syncService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("동기화 이력 조회(GET /api/v1/sync/runs)는 비로그인 일반 사용자도 접근 가능하다 (200 OK)")
    void getSyncRuns_publicAccessAllowed() throws Exception {
        SyncRunResponse response = new SyncRunResponse(
            1L, 1L, "Mondo", "@Mondo2233", SyncStatus.SUCCESS,
            LocalDateTime.now().minusMinutes(5), LocalDateTime.now(), 5L,
            10, 2, 8, null, "admin"
        );
        given(syncService.getSyncRuns()).willReturn(List.of(response));

        mockMvc.perform(get("/api/v1/sync/runs")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].channelName").value("Mondo"))
            .andExpect(jsonPath("$[0].status").value("SUCCESS"));
    }

    @Test
    @DisplayName("최신 동기화 상태 조회(GET /api/v1/sync/latest)는 공개 접근 가능하다")
    void getLatestSyncRun_publicAccessAllowed() throws Exception {
        SyncRunResponse response = new SyncRunResponse(
            2L, 1L, "Mondo", "@Mondo2233", SyncStatus.SUCCESS,
            LocalDateTime.now().minusMinutes(1), LocalDateTime.now(), 2L,
            50, 5, 45, null, "admin"
        );
        given(syncService.getLatestSyncRun(null)).willReturn(Optional.of(response));

        mockMvc.perform(get("/api/v1/sync/latest")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2L))
            .andExpect(jsonPath("$.totalItemsFetched").value(50));
    }

    @Test
    @DisplayName("인증되지 않은 사용자가 동기화 실행(POST /api/v1/sync/run)을 호출하면 401 Unauthorized를 반환한다")
    void runManualSync_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/sync/run")
                .with(csrf()))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("일반 사용자(ROLE_USER)가 동기화 실행(POST /api/v1/sync/run)을 호출하면 403 Forbidden을 반환한다")
    @WithMockUser(username = "user", roles = {"USER"})
    void runManualSync_withUserRole_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/sync/run")
                .with(csrf()))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("관리자(ROLE_ADMIN)가 동기화 실행(POST /api/v1/sync/run)을 호출하면 200 OK와 결과를 반환한다")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void runManualSync_withAdminRole_returns200() throws Exception {
        SyncRunResponse response = new SyncRunResponse(
            3L, 1L, "Mondo", "@Mondo2233", SyncStatus.SUCCESS,
            LocalDateTime.now().minusSeconds(10), LocalDateTime.now(), 10L,
            25, 3, 22, null, "admin"
        );
        given(syncService.runSync(isNull(), any())).willReturn(response);

        mockMvc.perform(post("/api/v1/sync/run")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(3L))
            .andExpect(jsonPath("$.status").value("SUCCESS"))
            .andExpect(jsonPath("$.newItemsInserted").value(3))
            .andExpect(jsonPath("$.itemsUpdated").value(22));
    }
}
