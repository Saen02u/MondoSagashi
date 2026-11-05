# 운영 배포 및 클라우드 인프라 아키텍처 가이드 (Deployment Guide)

본 문서는 **Mondo (@Mondo2233) 라이브 다시보기 아카이브** 서비스의 프론트엔드(React) 및 백엔드(Spring Boot), 데이터베이스(PostgreSQL) 배포 전략, 보안(HTTPS/CORS/세션 쿠키), DB 커넥션 풀 최적화 및 무료 호스팅 제약 극복 방안을 정리한 가이드입니다.

---

## 1. 배포 아키텍처 및 구성 방식

### 방식 A. 단일 도메인 Nginx 리버스 프록시 (권장 ⭐)
- **구조**: 도메인(예: `archive.example.com`)으로 들어오는 모든 트래픽을 Nginx가 수신.
  - `/` -> 프론트엔드 SPA 정적 번들 (`dist/`)
  - `/api/*` -> 내부 백엔드 컨테이너 (`http://backend:8080/api/`)
- **장점**:
  - **CORS 이슈 원천 차단**: 브라우저 관점에서 동일 오리진(Origin)이므로 복잡한 Preflight(OPTIONS) 요청 및 CORS 헤더 불일치 문제 없음.
  - **세션 쿠키 안정성**: `SameSite=Lax` 기본값으로 크로스 도메인 쿠키 차단 문제 없이 안전하게 동작.
- **적용 환경**: Docker Compose 기반 단일 VPS (AWS Lightsail, Hetzner, DigitalOcean) 또는 단일 ECS 클러스터.

### 방식 B. 프론트엔드 / 백엔드 분리 배포 (클라우드 네이티브)
- **프론트엔드**: Vercel 또는 Cloudflare Pages (글로벌 엣지 CDN 캐싱, 초고속 로딩)
- **백엔드**: Google Cloud Run, Render, Railway, Fly.io (컨테이너 오토스케일링)
- **데이터베이스**: Neon, Supabase, 또는 AWS RDS (관리형 PostgreSQL 16)
- **주의사항**:
  - 프론트엔드 환경변수 `VITE_API_BASE_URL=https://api.yourdomain.com` 지정.
  - 백엔드 CORS 환경변수 `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app` 지정.
  - 관리자 인증 쿠키에 `SameSite=None; Secure=true; HttpOnly;` 적용 필수.

---

## 2. HTTPS 및 세션 쿠키 보안 (Security & SSL/TLS)

### 2.1 HTTPS 필수 적용
- YouTube 임베드 플레이어(`iframe`) 및 브라우저 보안 표준에 따라 프로덕션 환경은 반드시 HTTPS로 서비스되어야 합니다.
- **인증서 발급**:
  - Vercel/Cloudflare/Render: 자동 무료 Let's Encrypt SSL 프로비저닝.
  - 독립 서버(Nginx): `certbot --nginx -d archive.yourdomain.com`로 90일 주기 자동 갱신.

### 2.2 쿠키 및 세션 설정
- `COOKIE_SECURE=true`: HTTPS 프로토콜 상에서만 쿠키가 전송되도록 강제 (`application.yml`의 `server.servlet.session.cookie.secure`).
- `HttpOnly`: JavaScript(`document.cookie`)를 통한 XSS 탈취 차단.
- `SameSite`:
  - 단일 도메인: `Lax` 권장 (CSRF 방어 강화)
  - 분리 도메인: `None` + `Secure=true` 필수.

---

## 3. 데이터베이스 커넥션 풀 (HikariCP) 최적화

Spring Boot 3의 기본 커넥션 풀인 HikariCP의 기본 `maximum-pool-size`는 10입니다. 그러나 클라우드 환경(특히 무료/소형 티어)에서는 세심한 튜닝이 필요합니다.

```yaml
# application-prod.yml 권장 설정
spring:
  datasource:
    hikari:
      maximum-pool-size: 5          # 무료 DB의 최대 접속수(20~50개)를 초과하지 않도록 제한
      minimum-idle: 2               # 유휴 커넥션 유지수
      idle-timeout: 300000          # 5분 동안 미사용 시 반환 (클라우드 DB 절전 지원)
      max-lifetime: 1200000         # 20분 (DB 측의 강제 세션 종료 전 안전 회수)
      connection-timeout: 20000     # 20초 이내 커넥션 획득 실패 시 에러
      leak-detection-threshold: 2000 # 2초 이상 커넥션 미반납 시 누수 경고 로깅
```

---

## 4. 무료 호스팅(Free Tier)의 절전(Cold Start) 및 보존 제한 점검

무료 PaaS 호스팅을 활용하여 아카이브를 운영할 때 발생할 수 있는 주요 제약 사항과 대응 방안입니다.

### 4.1 Render / Koyeb 무료 웹 서비스 (Cold Start)
- **제약**: 인바운드 HTTP 요청이 15분간 없으면 인스턴스가 Sleep(동면) 상태로 전환됩니다. 이후 첫 요청 시 스핀업(Cold Start)으로 40~50초의 응답 지연이 발생합니다.
- **대응 방안**:
  1. 외부 Uptime 모니터링 서비스(예: [UptimeRobot](https://uptimerobot.com) 또는 Better Uptime)에서 **10분 주기로 `/api/v1/health` 엔드포인트로 HEAD/GET 핑** 전송 -> 상시 활성 유지(Keep-Alive).
  2. 프론트엔드에 첫 로딩 지연 시 안내 메시지("서버가 시작되는 중입니다...")를 자연스럽게 표시.

### 4.2 Neon / Supabase 무료 PostgreSQL (DB PaaS)
- **제약**:
  - **Supabase**: 1주일간 프로젝트 쿼리가 없으면 프로젝트가 Pause(일시 중지)되어 수동 재활성화가 필요함.
  - **Neon**: 무활동 시 Scale-to-Zero로 전환되어 첫 쿼리 시 1~2초 지연.
- **대응 방안**:
  - 관리자 정기 영상 동기화 또는 백엔드의 Keep-Alive 헬스체크(`/api/v1/health`에서 `SELECT 1` 실행)를 정기 트리거하여 DB 동면 방지.

### 4.3 YouTube Data API v3 할당량 보존
- 본 프로젝트는 `search.list`(100 units) 대신 **`channels.list` + `playlistItems.list`(1 unit) + `/videos` 배치(1 unit)** 방식으로 설계되어 일일 기본 무료 할당량(10,000 units) 중 **단 3~5 units만 소모**하므로 무료 할당량 내에서 연중 안전하게 운영 가능합니다.
