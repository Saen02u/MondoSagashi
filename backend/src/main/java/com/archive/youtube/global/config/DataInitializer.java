package com.archive.youtube.global.config;

import com.archive.youtube.auth.entity.User;
import com.archive.youtube.auth.repository.UserRepository;
import com.archive.youtube.channel.entity.Channel;
import com.archive.youtube.channel.repository.ChannelRepository;
import com.archive.youtube.note.entity.TimestampNote;
import com.archive.youtube.note.repository.TimestampNoteRepository;
import com.archive.youtube.tag.entity.Tag;
import com.archive.youtube.tag.repository.TagRepository;
import com.archive.youtube.video.entity.Video;
import com.archive.youtube.video.repository.VideoRepository;
import com.archive.youtube.sync.entity.SyncRun;
import com.archive.youtube.sync.repository.SyncRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 초기 데이터베이스 시딩 컴포넌트
 * 관리자 계정(BCrypt), 채널, 태그, 영상 및 타임스탬프 시점 메모를 초기화합니다.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ChannelRepository channelRepository;
    private final VideoRepository videoRepository;
    private final TagRepository tagRepository;
    private final TimestampNoteRepository timestampNoteRepository;
    private final SyncRunRepository syncRunRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:${ADMIN_USERNAME:admin}}")
    private String adminUsername;

    @Value("${app.admin.password:${ADMIN_PASSWORD:admin1234!}}")
    private String adminPassword;

    public DataInitializer(
        ChannelRepository channelRepository,
        VideoRepository videoRepository,
        TagRepository tagRepository,
        TimestampNoteRepository timestampNoteRepository,
        SyncRunRepository syncRunRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.channelRepository = channelRepository;
        this.videoRepository = videoRepository;
        this.tagRepository = tagRepository;
        this.timestampNoteRepository = timestampNoteRepository;
        this.syncRunRepository = syncRunRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. 관리자 계정 초기화 (비밀번호는 안전하게 BCrypt 해시 저장)
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            User admin = new User(
                adminUsername,
                passwordEncoder.encode(adminPassword),
                "ROLE_ADMIN"
            );
            userRepository.save(admin);
            log.info("관리자 계정 생성 완료: username={}", adminUsername);
        }

        // 2. 채널 및 영상, 태그 초기화
        if (channelRepository.count() > 0) {
            log.info("이미 데이터베이스에 채널 데이터가 존재하므로 채널/영상 초기화를 건너뜁니다.");
            return;
        }

        log.info("Mondo(@Mondo2233) 전용 채널, 태그, 영상 및 타임스탬프 메모를 시딩합니다.");

        // 태그 생성
        Tag tagApex = new Tag("Apex Legends", "red");
        Tag tagMaster = new Tag("마스터랭크", "purple");
        Tag tagChzzk = new Tag("치지직동시송출", "emerald");
        Tag tagTalk = new Tag("토크/수다", "blue");
        Tag tagCustom = new Tag("커스텀매치", "amber");
        Tag tagSolo = new Tag("솔로큐", "cyan");

        tagRepository.saveAll(List.of(tagApex, tagMaster, tagChzzk, tagTalk, tagCustom, tagSolo));

        // Mondo 전용 채널 생성
        Channel mondoChannel = new Channel(
            "Mondo",
            "@Mondo2233",
            "https://www.youtube.com/@Mondo2233",
            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=160&auto=format&fit=crop&q=80",
            "Mondo 공식 유튜브 채널의 라이브 스트리밍 다시보기 아카이브입니다."
        );
        channelRepository.save(mondoChannel);

        // 라이브 영상 생성
        Video v1 = new Video(
            "2yK2D41LzB8",
            "[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&auto=format&fit=crop&q=80",
            "몬도의 에이펙스 레전드 솔로 마스터 랭크 승격전 하이라이트 및 풀 라이브 다시보기입니다. 명중률 높은 에임과 포지셔닝을 확인할 수 있습니다.",
            mondoChannel
        );
        v1.addTag(tagApex);
        v1.addTag(tagMaster);
        v1.addTag(tagSolo);

        Video v2 = new Video(
            "8jTqN31pW9k",
            "[Mondo] 치지직 & 유튜브 동시 송출 라이브 다시보기 - 토크 및 게임 플레이",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&auto=format&fit=crop&q=80",
            "플랫폼 동시 송출 기념 시청자 Q&A 소통 및 랭크 게임 방송 풀버전입니다.",
            mondoChannel
        );
        v2.addTag(tagChzzk);
        v2.addTag(tagTalk);
        v2.addTag(tagApex);

        Video v3 = new Video(
            "6zVpM91kL3q",
            "[Mondo] 시청자 참여 커스텀 매치 & 심야 수다 라이브 스트리밍 다시보기",
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&auto=format&fit=crop&q=80",
            "시청자 분들과 함께하는 에이펙스 챔피언 매치 및 심야 라디오 토크 방송입니다.",
            mondoChannel
        );
        v3.addTag(tagCustom);
        v3.addTag(tagTalk);

        Video v4 = new Video(
            "9bZkp7q19f0",
            "[Mondo] 에이펙스 신규 시즌 메타 총기 분석 & 솔로 랭크 달리기",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&auto=format&fit=crop&q=80",
            "신규 총기 반동 제어 팁과 패치 노트 분석 라이브 스트리밍입니다.",
            mondoChannel
        );
        v4.addTag(tagApex);
        v4.addTag(tagMaster);

        Video v5 = new Video(
            "3xY8a12Lp90",
            "[Mondo] 주말 힐링 게임 & 일상 잡담 소통 라이브 다시보기",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&auto=format&fit=crop&q=80",
            "주말 저녁 팬들과 소소한 일상을 나누고 팬아트 감상하는 힐링 방송입니다.",
            mondoChannel
        );
        v5.addTag(tagTalk);

        Video v6 = new Video(
            "7kM9p01LzX4",
            "[Mondo] 대회 대비 스크림 연습 경기 1일차 풀 라이브 영상",
            "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=640&auto=format&fit=crop&q=80",
            "대회 대비 팀 스크림 1일차 치열한 교전과 브리핑 풀 영상입니다.",
            mondoChannel
        );
        v6.addTag(tagApex);
        v6.addTag(tagCustom);

        videoRepository.saveAll(List.of(v1, v2, v3, v4, v5, v6));

        // 3. 타임스탬프 시점 메모 초기화
        TimestampNote n1 = new TimestampNote(v1, 45, "인게임 세팅 및 마우스 감도 설명");
        TimestampNote n2 = new TimestampNote(v1, 180, "1라운드 첫 교전 및 윙맨 클러치 플레이");
        TimestampNote n3 = new TimestampNote(v1, 420, "최종 링 1:1 챔피언 결정전");
        TimestampNote n4 = new TimestampNote(v1, 600, "마스터 랭크 승격 확정의 순간!");

        TimestampNote n5 = new TimestampNote(v2, 60, "동시 송출 기념 시청자 인사 및 채팅 읽기");
        TimestampNote n6 = new TimestampNote(v2, 300, "시청자 질문 Q&A: 다음 시즌 메타 전망");

        timestampNoteRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6));

        // 4. 초기 동기화 기준 이력 시딩
        if (syncRunRepository.count() == 0) {
            SyncRun initialRun = new SyncRun(mondoChannel, "SYSTEM_SEED");
            initialRun.markSuccess(6, 6, 0);
            syncRunRepository.save(initialRun);
        }

        log.info("Mondo 채널 데이터, 태그, 영상, 타임스탬프 메모 및 초기 동기화 이력 시딩 완료!");
    }
}
