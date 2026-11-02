package com.archive.youtube.video.repository;

import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.channel.repository.ChannelRepository;
import com.archive.youtube.tag.entity.Tag;
import com.archive.youtube.tag.repository.TagRepository;
import com.archive.youtube.video.entity.Video;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * VideoRepository 및 Tag와의 다대다(N:M) 연관관계, 검색 쿼리 테스트
 */
@DataJpaTest
class VideoRepositoryTest {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Video와 Tag의 ManyToMany 연관관계가 video_tags 연결 테이블에 정상 저장되고 검색된다")
    void saveAndSearchWithTags() {
        // given
        Channel channel = new Channel("Mondo", "@Mondo2233", "https://youtube.com/@Mondo2233", "thumb.jpg", "desc");
        channelRepository.save(channel);

        Tag tag1 = new Tag("Apex Legends", "red");
        Tag tag2 = new Tag("마스터랭크", "purple");
        tagRepository.saveAll(List.of(tag1, tag2));

        Video video = new Video("test_apex_1", "에이펙스 랭크전 1일차", "thumb1.jpg", "설명", channel);
        video.addTag(tag1);
        video.addTag(tag2);
        videoRepository.save(video);

        entityManager.flush();
        entityManager.clear();

        // when: 태그 필터로 검색
        Page<Video> page = videoRepository.searchVideos("에이펙스", null, "Apex Legends", PageRequest.of(0, 10));

        // then
        assertThat(page.getTotalElements()).isEqualTo(1);
        Video found = page.getContent().get(0);
        assertThat(found.getYoutubeVideoId()).isEqualTo("test_apex_1");
        assertThat(found.getTags()).hasSize(2);
    }

    @Test
    @DisplayName("동일한 youtubeVideoId를 가진 영상을 중복 저장하면 UNIQUE 제약조건 위반으로 예외가 발생한다")
    void youtubeVideoIdUniqueConstraintThrowsException() {
        // given
        Channel channel = new Channel("Mondo", "@Mondo2233_dup", "https://youtube.com/@Mondo2233", "thumb.jpg", "desc");
        channelRepository.save(channel);

        Video video1 = new Video("unique_vid_999", "첫 번째 영상", "https://example.com/thumb1.jpg", channel);
        videoRepository.save(video1);
        entityManager.flush();

        // when & then: 동일한 youtubeVideoId를 가진 두 번째 영상 삽입 시 예외 발생 검증
        Video video2 = new Video("unique_vid_999", "두 번째 영상 (중복 ID)", "https://example.com/thumb2.jpg", channel);
        assertThatThrownBy(() -> videoRepository.saveAndFlush(video2))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("findByYoutubeVideoIdWithDetails 호출 시 채널과 태그가 즉시 함께 로딩된다")
    void findByYoutubeVideoIdWithDetails() {
        Channel channel = new Channel("Mondo", "@Mondo2233_detail", "https://youtube.com/@Mondo2233", "thumb.jpg", "desc");
        channelRepository.save(channel);

        Tag tag = new Tag("치지직", "emerald");
        tagRepository.save(tag);

        Video video = new Video("detail_test_vid", "상세 테스트 영상", "thumb.jpg", "상세 설명", channel);
        video.addTag(tag);
        videoRepository.save(video);

        entityManager.flush();
        entityManager.clear();

        Optional<Video> detail = videoRepository.findByYoutubeVideoIdWithDetails("detail_test_vid");
        assertThat(detail).isPresent();
        assertThat(detail.get().getChannel().getChannelName()).isEqualTo("Mondo");
        assertThat(detail.get().getTags()).hasSize(1);
    }
}
