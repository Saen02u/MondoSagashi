package com.archive.youtube.note.controller;

import com.archive.youtube.auth.service.CustomUserDetailsService;
import com.archive.youtube.global.config.SecurityConfig;
import com.archive.youtube.note.dto.TimestampNoteCreateRequest;
import com.archive.youtube.note.dto.TimestampNoteResponse;
import com.archive.youtube.note.dto.TimestampNoteUpdateRequest;
import com.archive.youtube.note.service.TimestampNoteService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TimestampNoteController.class)
@Import(SecurityConfig.class)
class TimestampNoteControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TimestampNoteService timestampNoteService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("비로그인 일반 사용자도 시점 메모 목록(GET)을 조회할 수 있다 (200 OK)")
    void getNotesPublicAccessAllowed() throws Exception {
        TimestampNoteResponse note = new TimestampNoteResponse(
            1L, "vid_1", 120, "02:00", "공개 메모 내용", LocalDateTime.now(), LocalDateTime.now()
        );
        given(timestampNoteService.getNotesByVideoId("vid_1")).willReturn(List.of(note));

        mockMvc.perform(get("/api/v1/videos/vid_1/notes")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].positionSeconds").value(120))
                .andExpect(jsonPath("$[0].content").value("공개 메모 내용"));
    }

    @Test
    @DisplayName("비로그인 사용자가 메모 등록(POST)을 시도하면 401 Unauthorized로 거부된다")
    void createNoteUnauthenticatedRejected() throws Exception {
        TimestampNoteCreateRequest request = new TimestampNoteCreateRequest(60, "비인가 등록 시도");

        mockMvc.perform(post("/api/v1/videos/vid_1/notes")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ROLE_ADMIN 권한을 가진 관리자는 메모 등록(POST)이 가능하다 (201 Created)")
    void createNoteAdminAllowed() throws Exception {
        TimestampNoteCreateRequest request = new TimestampNoteCreateRequest(60, "관리자 메모 등록");
        TimestampNoteResponse response = new TimestampNoteResponse(
            10L, "vid_1", 60, "01:00", "관리자 메모 등록", LocalDateTime.now(), LocalDateTime.now()
        );

        given(timestampNoteService.createNote(eq("vid_1"), any(TimestampNoteCreateRequest.class)))
            .willReturn(response);

        mockMvc.perform(post("/api/v1/videos/vid_1/notes")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.content").value("관리자 메모 등록"));
    }

    @Test
    @DisplayName("비로그인 사용자가 메모 수정(PUT)을 시도하면 401 Unauthorized로 거부된다")
    void updateNoteUnauthenticatedRejected() throws Exception {
        TimestampNoteUpdateRequest request = new TimestampNoteUpdateRequest(90, "수정 시도");

        mockMvc.perform(put("/api/v1/notes/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("비로그인 사용자가 메모 삭제(DELETE)를 시도하면 401 Unauthorized로 거부된다")
    void deleteNoteUnauthenticatedRejected() throws Exception {
        mockMvc.perform(delete("/api/v1/notes/1")
                .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ROLE_ADMIN 권한을 가진 관리자는 메모 삭제(DELETE)가 가능하다 (200 OK)")
    void deleteNoteAdminAllowed() throws Exception {
        mockMvc.perform(delete("/api/v1/notes/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("메모가 성공적으로 삭제되었습니다."));
    }
}
