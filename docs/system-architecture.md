# YouTube 라이브 다시보기 아카이브 시스템 아키텍처

## 1. 개요
본 문서는 **YouTube 라이브 다시보기 아카이브 웹 서비스**의 시스템 설계 및 아키텍처 기준 문서입니다.
본 서비스는 [Mondo 공식 유튜브 채널(@Mondo2233)](https://www.youtube.com/@Mondo2233) 전용으로 설계되었으며, 공개된 라이브 다시보기 영상을 PostgreSQL에 영속화하고, 검색·조회 및 시점 메모를 제공합니다.

---

## 2. 확정 기술 스택

| 분류 | 기술 | 버전 / 비고 |
| :--- | :--- | :--- |
| **Backend Runtime** | Java 21 LTS | 최신 언어 스펙 및 가상 스레드 활용 |
| **Backend Framework** | Spring Boot | 3.3.5 (Spring Web, Test, Validation) |
| **Persistence** | Spring Data JPA, Hibernate, PostgreSQL | 16 (로컬/Docker: 5432) |
| **Security (예정)** | Spring Security | 관리자 RBAC (Role-Based Access Control) |
| **Frontend Runtime** | React 19, TypeScript, Vite | 클라이언트 SPA, Port 3000 |
| **Frontend Style** | Tailwind CSS v4 | 유틸리티 퍼스트 스타일링 |
| **External API (예정)** | YouTube Data API v3 | 채널 메타데이터 및 라이브 다시보기 영상 수집 |
| **Test Tools** | JUnit 5, MockMvc, DataJpaTest, Vitest | 백엔드/JPA 테스트 6개, 프론트 테스트 5개 통과 |

---

## 3. 데이터베이스 및 스키마 관리 전략

### 3.1 개발 환경 vs 운영 환경 스키마 관리
- **개발 환경 (Development)**:
  - `spring.jpa.hibernate.ddl-auto: update`
  - 애플리케이션 시작 시 엔티티 변경 사항을 감지하여 테이블 및 컬럼, 제약조건을 자동으로 반영합니다.
  - `DataInitializer`를 통해 첫 구동 시 `@Mondo2233` 채널과 샘플 라이브 영상 3건을 자동 시딩합니다.
- **운영 환경 (Production)**:
  - `spring.jpa.hibernate.ddl-auto: validate`
  - 자동 DDL 변경을 금지하고 Flyway/Liquibase 같은 스키마 마이그레이션 도구를 통해 안정성을 확보합니다.

### 3.2 환경변수를 통한 DB 접속 정보 격리
비밀정보 하드코딩 방지를 위해 환경변수 기반으로 주입받습니다.
- `DB_HOST`: DB 호스트 (기본값: `localhost`)
- `DB_PORT`: 포트 (기본값: `5432`)
- `DB_NAME`: 데이터베이스명 (기본값: `youtube_archive`)
- `DB_USERNAME`: 데이터베이스 사용자명 (기본값: `postgres`)
- `DB_PASSWORD`: 데이터베이스 패스워드 (기본값: `postgres`)
- `DB_URL`: 전체 JDBC URL (지정 시 우선 적용)

---

## 4. 데이터베이스 엔티티 및 테이블 설계

### 4.1 `channels` (채널 테이블)
Mondo 채널(@Mondo2233) 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AUTO_INCREMENT | 고유 식별자 |
| `channel_name` | VARCHAR(100) | NOT NULL | 채널명 ("Mondo") |
| `custom_url` | VARCHAR(100) | UNIQUE, NOT NULL | 핸들 ("@Mondo2233") |
| `youtube_channel_url` | VARCHAR(255) | NOT NULL | 채널 URL |
| `thumbnail_url` | VARCHAR(500) | NULL | 채널 프로필 이미지 URL |
| `description` | TEXT | NULL | 채널 소개 |
| `created_at` | TIMESTAMP | NOT NULL | 등록일시 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일시 |

### 4.2 `videos` (영상 테이블)
라이브 다시보기 영상을 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AUTO_INCREMENT | 고유 식별자 |
| `youtube_video_id` | VARCHAR(50) | **UNIQUE**, NOT NULL | YouTube 고유 영상 ID (중복 수집 방지) |
| `title` | VARCHAR(255) | NOT NULL | 영상 제목 |
| `thumbnail_url` | VARCHAR(500) | NOT NULL | 영상 썸네일 이미지 URL |
| `channel_id` | BIGINT | FK (channels.id), NOT NULL | 소속 채널 외래키 |
| `created_at` | TIMESTAMP | NOT NULL | 등록일시 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정일시 |

---

## 5. 핵심 설계 결정 및 이유

### 5.1 왜 1:N (Channel 1 : Video N) 관계를 선택했는가?
- YouTube 채널 하나는 수많은 라이브 스트리밍 다시보기 영상을 영구적으로 보유합니다.
- 각 영상은 하나의 채널에만 종속되므로 자연스러운 1:N 부모-자식 관계입니다.
- **성능 최적화**:
  - `Video.channel`을 `FetchType.LAZY`로 지정하여 불필요한 즉시 조인을 방지합니다.
  - 영상 목록 조회 시에는 `JOIN FETCH v.channel` 쿼리를 사용하여 N+1 쿼리 문제 없이 한 번의 SQL로 채널 정보를 조회합니다.

### 5.2 왜 Entity와 DTO를 엄격하게 분리하는가?
1. **관심사 분리 (Separation of Concerns)**:
   - Entity는 DB 테이블 매핑 및 비즈니스 무결성을 책임지며, DTO(`VideoResponse`)는 클라이언트 화면에 필요한 데이터 스펙만 담당합니다.
2. **도메인 은닉 및 보안**:
   - 내부 DB 컬럼(내부 ID, 민감 메타데이터)이 API로 직접 노출되는 것을 방지합니다.
3. **양방향 순환 참조 방지**:
   - Jackson 직렬화 시 `Channel → videos → channel`로 이어지는 무한 순환 직렬화 오류를 원천 차단합니다.
4. **API 변경 유연성**:
   - DB 컬럼 구조를 리팩토링하더라도 API 응답 스펙(DTO)은 기존 클라이언트 호환성을 유지할 수 있습니다.

### 5.3 `youtubeVideoId`의 UNIQUE 제약조건
- 향후 YouTube Data API v3 동기화 작업이 주기적으로 실행될 때, 동일한 영상이 중복 insert되는 것을 데이터베이스 레벨에서 원천 차단하여 데이터 무결성을 보장합니다.
