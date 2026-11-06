# MondoSagashi (問答探し) — YouTube VOD Archive

> YouTube 라이브 방송 다시보기(VOD)와 상세 마크다운 메모를 체계적으로 정리하고 검색하는 무서버(Serverless) 정적 웹 아카이브입니다.

---

## 1. 프로젝트 특징

- **순수 정적 웹 아카이브**: 백엔드 서버나 외부 데이터베이스 없이 100% 클라이언트 사이드에서 동작합니다.
- **텍스트 중심 미니멀리즘**: 썸네일 이미지나 비디오 임베드로 인한 시각적 피로와 리소스 낭비를 없애고, 방송 기록과 텍스트 정보에 집중합니다.
- **즉각적인 다면 검색**: 영상 제목, 방송 채널명, 설명, 태그를 실시간으로 결합 검색합니다.
- **복수 태그 필터링**: 태그별 영상 편수 집계 및 다중 선택, 1클릭 초기화를 지원합니다.
- **안전한 마크다운 메모 렌더링**: XSS 취약점 없이 제목, 본문, 목록, 체크리스트, 코드 블록, 인용문, 외부 링크를 렌더링합니다.
- **쿼리 파라미터 기반 라우팅**: `/videos?id=영상ID` 구조를 지원하여 GitHub Pages 정적 호스팅 환경에서도 서브 디렉터리 새로고침 이슈 없이 공유 및 탐색이 가능합니다.

---

## 2. 기술 스택

- **Framework & Runtime**: React 19, TypeScript
- **Styling**: Tailwind CSS (Dark Editorial Archive Theme with Brass Accents)
- **Icons**: Lucide React
- **Data Source**: JSON (`src/data/videos.json`)
- **Deployment Target**: GitHub Pages (Static Hosting)

---

## 3. 데이터 구조 및 영상 추가 방법

모든 영상 데이터는 `src/data/videos.json` 파일에서 직접 관리합니다.
새로운 방송을 등록하려면 배열에 객체를 추가합니다.

```json
{
  "videos": [
    {
      "id": "vod-20261104-01",
      "title": "방송 제목",
      "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
      "broadcastDate": "2026-11-04",
      "channelName": "채널명",
      "description": "방송에 대한 간략한 요약 설명입니다.",
      "tags": ["개발", "Rust", "라이브코딩"],
      "memo": "# 방송 상세 메모\n\n- 타임라인\n- [x] 완료 항목\n- [ ] 예정 항목\n\n```rust\nfn main() {}\n```"
    }
  ]
}
```

### 필드 명세

| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `id` | `string` | 고유 식별자 (예: `vod-20261104-01`) |
| `title` | `string` | 방송 영상 제목 |
| `youtubeUrl` | `string` | 원본 YouTube 영상 URL (새 탭 열기 연동) |
| `broadcastDate` | `string` | 방송 일자 (`YYYY-MM-DD` 형식) |
| `channelName` | `string` | 방송 채널명 |
| `description` | `string` | 요약 설명 |
| `tags` | `string[]` | 태그 배열 (검색 및 필터링에 자동 집계됨) |
| `memo` | `string` | 마크다운 포맷의 상세 방송 기록 |

---

## 4. 페이지 구성 및 라우팅

1. **메인 페이지 (`/`)**
   - 상단 헤더 (전체 보관 편수 표시)
   - 실시간 다면 검색창 및 태그 필터 (태그별 개수 표시)
   - 텍스트 중심 영상 카드 목록
   - 검색 결과가 없을 때의 Empty State 및 초기화 버튼

2. **상세 페이지 (`/videos?id=videoId`)**
   - 브레드크럼 (`← 아카이브 전체 목록`)
   - 채널명, 방송일, 태그 정보
   - YouTube 원본 영상 새 탭 열기 버튼 (`rel="noopener noreferrer"`)
   - 마크다운 메모 렌더링 영역
   - 존재하지 않는 ID 전달 시 Not Found UI 안내

---

## 5. GitHub Pages 배포 가이드

`.github/workflows/deploy.yml` 파일이 포함되어 있어 main 브랜치 푸시 시 자동 배포됩니다.

1. 저장소 `Settings` → `Pages` 메뉴로 이동합니다.
2. **Build and deployment** 항목의 **Source**를 `GitHub Actions`로 설정합니다.
3. 코드를 `main` 브랜치에 푸시하면 빌드 및 배포 파이프라인이 자동으로 실행됩니다.

---

## 6. 테스트 및 확인 방법

### PC 환경
- 검색창에 "Rust" 또는 "소울본" 입력 시 즉각적인 필터링 확인
- 상단 태그 중 `#게임` 또는 `#개발` 클릭 시 복수 태그 필터링 확인
- 영상 카드의 제목 또는 "방송 메모 읽기" 클릭 시 URL이 `/videos?id=...`로 변경되며 상세 페이지로 부드럽게 이동하는지 확인
- 브라우저 뒤로가기 / 앞으로가기 버튼 작동 확인
- "YouTube 원본 영상 열기" 클릭 시 안전하게 새 탭에서 원본 링크가 열리는지 확인

### 모바일 환경
- 가로 폭이 좁은 뷰포트에서 태그 바가 부드럽게 가로 스크롤되는지 확인
- 1열 카드 리스트의 터치 영역이 44px 이상 확보되어 쾌적하게 탭되는지 확인
- 상세 페이지의 마크다운 메모가 줄바꿈과 폰트 크기 최적화되어 잘 읽히는지 확인
