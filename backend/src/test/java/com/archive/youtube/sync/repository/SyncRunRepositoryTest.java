package com.archive.youtube.sync.repository;

import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.channel.repository.ChannelRepository;
import com.archive.youtube.sync.entity.SyncRun;
import com.archive.youtube.sync.entity.SyncStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class SyncRunRepositoryTest {

    @Autowired
    private SyncRunRepository syncRunRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("동기화 실행 이력이 정상 저장되고 최신순으로 정렬 조회된다")
    void saveAndFindLatestSyncRuns() {
        // Given
        Channel channel = new Channel("Mondo", "@Mondo2233", "https://youtube.com/@Mondo2233", "thumb.jpg", "desc");
        channel = channelRepository.save(channel);

        SyncRun run1 = new SyncRun(channel, "admin");
        run1.markSuccess(20, 5, 15);
        syncRunRepository.save(run1);

        SyncRun run2 = new SyncRun(channel, "admin");
        run2.markFailed("API error", 0, 0, 0);
        syncRunRepository.save(run2);

        entityManager.flush();
        entityManager.clear();

        // When
        List<SyncRun> runs = syncRunRepository.findAllWithChannelOrderByStartedAtDesc();
        Optional<SyncRun> latest = syncRunRepository.findTopByChannel_IdOrderByStartedAtDesc(channel.getId());

        // Then
        assertThat(runs).hasSize(2);
        assertThat(latest).isPresent();
        assertThat(latest.get().getStatus()).isEqualTo(SyncStatus.FAILED);
        assertThat(latest.get().getChannel().getCustomUrl()).isEqualTo("@Mondo2233");
    }
}
