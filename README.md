# YouTube Live Archive (YouTube 라이브 다시보기 아카이브)

**[Mondo 공식 유튜브 채널(@Mondo2233)](https://www.youtube.com/@Mondo2233) 전용 라이브 다시보기 아카이브 서비스입니다.**
공개된 라이브 다시보기 영상을 PostgreSQL에 영속화하고, 검색·태그 분류 및 타임스탬프 시점 메모를 제공합니다.

---

## 1. 프로젝트 디렉터리 구조

```text
├── backend/                  # Spring Boot 3.3.5 (Java 21) 백엔드
│   ├── pom.xml               # Spring Data JPA, PostgreSQL Driver, Test
│   ├── mvnw / mvnw.cmd       # Maven Wrapper 실행 스크립트
│   └── src/
│       ├── main/
│       │   ├── java/com/archive/youtube/
│       │   │   ├── channel/
│       │   │   │   ├── entity/Channel.java             # channels 테이블 매핑
│       │   │   │   └── repository/ChannelRepository.java
│       │   │   ├── video/
│       │   │   │   ├── entity/Video.java               # videos 테이블 (UNIQUE youtubeVideoId)
│       │   │   │   ├── repository/VideoRepository.java # Fetch Join 쿼리
│       │   │   │   ├── service/VideoService.java       # DB 조회 및 DTO 변환
│       │   │   │   ├── controller/VideoController.java # GET /api/v1/videos
│       │   │   │   └── dto/VideoResponse.java          # 응답 DTO Record
│       │   │   └── global/
│       │   │       ├── config/DataInitializer.java     # Mondo 초기 데이터 자동 시딩
│       │   │       └── controller/HealthCheckController.java # GET /api/health
│       │   └── resources/
│       │       └── application.yml                     # DB 접속(환경변수 기반) 및 JPA 설정
│       └── test/
│           ├── java/com/archive/youtube/
│           │   ├── video/repository/VideoRepositoryTest.java   # JPA 슬라이스 및 UNIQUE 검증
│           │   ├── video/service/VideoServiceTest.java         # Service 단위 테스트
│           │   ├── video/controller/VideoControllerTest.java   # MockMvc 컨트롤러 테스트
│           │   └── YouTubeArchiveApplicationTests.java         # Spring Context 로딩 테스트
│           └── resources/application.yml                       # H2 PostgreSQL 모드 테스트 설정
│
├── frontend/                 # React 19 + TypeScript + Vite 프론트엔드
│   ├── src/
│   │   ├── api/video.ts      # GET /api/v1/videos 통신
│   │   ├── components/       # VideoArchiveView (Mondo 전용 뷰), EnvironmentCard 등
│   │   ├── pages/HomePage.tsx
│   │   └── App.test.tsx      # Vitest 단위 테스트
│
├── docker-compose.yml        # 로컬 PostgreSQL 16 컨테이너 정의 (Port 5432)
├── docs/system-architecture.md # 상세 DB 스키마 및 아키텍처 문서
├── .env.example              # DB 접속 환경변수 예시 파일
└── README.md                 # 본 가이드 문서
```

---

## 2. 데이터베이스 설정 및 환경변수

### 2.1 Docker Compose로 PostgreSQL 실행
로컬 개발 환경에서 터미널에서 다음 명령어로 PostgreSQL 16 컨테이너를 구동합니다:

```bash
# PostgreSQL 16 컨테이너 백그라운드 실행
docker compose up -d

# 실행 상태 확인
docker compose ps
```

### 2.2 환경변수 설정 (`.env`)
비밀번호나 접속 정보는 코드에 하드코딩하지 않고 환경변수로 주입합니다.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=youtube_archive
DB_USERNAME=postgres
DB_PASSWORD=postgres
JPA_DDL_AUTO=update
```

---

## 3. 실행 및 테스트

### 3.1 백엔드 실행
```bash
cd backend
./mvnw spring-boot:run
```
- 시작 시 `DataInitializer`가 자동으로 `Mondo (@Mondo2233)` 채널과 초기 라이브 영상 3건을 PostgreSQL에 영속화합니다.
- `GET http://localhost:8080/api/v1/videos`로 조회할 수 있습니다.

### 3.2 백엔드 테스트 (6개 케이스)
```bash
cd backend
./mvnw test
```
- `VideoRepositoryTest.saveAndFindAllWithChannel`: 1:N 연관관계 및 Fetch Join 검증
- `VideoRepositoryTest.youtubeVideoIdUniqueConstraintThrowsException`: 중복 videoId에 대한 UNIQUE 제약조건 검증
- `VideoServiceTest`: DTO 매핑 격리 단위 테스트
- `VideoControllerTest`: MockMvc HTTP 응답 검증
- `HealthCheckControllerTest`, `YouTubeArchiveApplicationTests`: 컨텍스트 및 헬스 검증

### 3.3 프론트엔드 실행 및 테스트
```bash
# 실행
npm run dev

# 테스트
npm test
```

---

## 4. 학습 포인트 요약

1. **DB 연결 방식**: 환경변수(`DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`)를 통해 외부 주입받고, 기본값을 제공하여 환경 격리를 구현합니다.
2. **Entity vs DTO 분리**:
   - `Video`(Entity)는 DB 테이블 구조, 연관관계, UNIQUE 제약조건을 관리합니다.
   - `VideoResponse`(DTO)는 클라이언트 화면에 필요한 4개 필드만 안전하게 전달하여 내부 스키마 노출과 순환 참조를 차단합니다.
3. **1:N 연관관계 (`Channel 1 : Video N`)**:
   - Mondo 채널 하나에 다수의 라이브 영상이 귀속되는 도메인 모델을 반영했습니다.
   - `FetchType.LAZY`와 JPQL `JOIN FETCH`를 조합하여 N+1 쿼리 문제를 예방했습니다.
