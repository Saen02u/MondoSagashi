package com.archive.youtube.note.service;

import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.global.exception.ResourceNotFoundException;
import com.archive.youtube.note.dto.TimestampNoteCreateRequest;
import com.archive.youtube.note.dto.TimestampNoteResponse;
import com.archive.youtube.note.dto.TimestampNoteUpdateRequest;
import com.archive.youtube.note.entity.TimestampNote;
import com.archive.youtube.note.repository.TimestampNoteRepository;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TimestampNoteServiceTest {

    @Mock
    private TimestampNoteRepository timestampNoteRepository;

    @Mock
    private VideoRepository videoRepository;

    @InjectMocks
    private TimestampNoteService timestampNoteService;

    @Test
    @DisplayName("유효한 요청으로 타임스탬프 메모를 생성한다")
    void createNoteSuccess() {
        Channel channel = new Channel("Mondo", "@Mondo2233", "url", "thumb", "desc");
        Video video = new Video("vid_1", "title", "thumb", channel);
        TimestampNote note = new TimestampNote(video, 125, "125초 시점 하이라이트");

        given(videoRepository.findByYoutubeVideoId("vid_1")).willReturn(Optional.of(video));
        given(timestampNoteRepository.save(any(TimestampNote.class))).willReturn(note);

        TimestampNoteCreateRequest request = new TimestampNoteCreateRequest(125, "125초 시점 하이라이트");
        TimestampNoteResponse response = timestampNoteService.createNote("vid_1", request);

        assertThat(response.positionSeconds()).isEqualTo(125);
        assertThat(response.formattedTime()).isEqualTo("02:05");
        assertThat(response.content()).isEqualTo("125초 시점 하이라이트");
    }

    @Test
    @DisplayName("positionSeconds가 음수이면 IllegalArgumentException을 던진다")
    void createNoteNegativePositionThrowsException() {
        TimestampNoteCreateRequest request = new TimestampNoteCreateRequest(-10, "음수 시점");

        assertThatThrownBy(() -> timestampNoteService.createNote("vid_1", request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("재생 시점은 0초 이상이어야 합니다.");
    }

    @Test
    @DisplayName("메모 수정 시 positionSeconds와 content가 변경된다")
    void updateNoteSuccess() {
        Channel channel = new Channel("Mondo", "@Mondo2233", "url", "thumb", "desc");
        Video video = new Video("vid_1", "title", "thumb", channel);
        TimestampNote note = new TimestampNote(video, 100, "기존 내용");

        given(timestampNoteRepository.findById(1L)).willReturn(Optional.of(note));

        TimestampNoteUpdateRequest request = new TimestampNoteUpdateRequest(150, "수정된 내용");
        TimestampNoteResponse response = timestampNoteService.updateNote(1L, request);

        assertThat(response.positionSeconds()).isEqualTo(150);
        assertThat(response.content()).isEqualTo("수정된 내용");
    }

    @Test
    @DisplayName("메모 삭제 시 repository delete가 호출된다")
    void deleteNoteSuccess() {
        Channel channel = new Channel("Mondo", "@Mondo2233", "url", "thumb", "desc");
        Video video = new Video("vid_1", "title", "thumb", channel);
        TimestampNote note = new TimestampNote(video, 100, "삭제 대상");

        given(timestampNoteRepository.findById(1L)).willReturn(Optional.of(note));

        timestampNoteService.deleteNote(1L);

        verify(timestampNoteRepository).delete(note);
    }
}
