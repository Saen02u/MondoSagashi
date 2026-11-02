package com.archive.youtube.note.repository;

import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.channel.repository.ChannelRepository;
import com.archive.youtube.note.entity.TimestampNote;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TimestampNoteRepositoryTest {

    @Autowired
    private TimestampNoteRepository timestampNoteRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("영상의 시점 메모들을 positionSeconds 오름차순으로 조회한다")
    void findByVideoOrderByPositionSecondsAsc() {
        // given
        Channel channel = new Channel("Mondo", "@Mondo2233", "https://youtube.com/@Mondo2233", "thumb.jpg", "desc");
        channelRepository.save(channel);

        Video video = new Video("note_vid_1", "메모 테스트 영상", "thumb.jpg", channel);
        videoRepository.save(video);

        TimestampNote note2 = new TimestampNote(video, 300, "후반부 교전");
        TimestampNote note1 = new TimestampNote(video, 60, "초반부 파밍");
        TimestampNote note3 = new TimestampNote(video, 180, "중반부 이동");

        timestampNoteRepository.saveAll(List.of(note2, note1, note3));
        entityManager.flush();
        entityManager.clear();

        // when
        List<TimestampNote> notes = timestampNoteRepository.findByVideo_YoutubeVideoIdOrderByPositionSecondsAsc("note_vid_1");

        // then
        assertThat(notes).hasSize(3);
        assertThat(notes.get(0).getPositionSeconds()).isEqualTo(60);
        assertThat(notes.get(1).getPositionSeconds()).isEqualTo(180);
        assertThat(notes.get(2).getPositionSeconds()).isEqualTo(300);
    }
}
