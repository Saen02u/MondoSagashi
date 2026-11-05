# 관리형 PostgreSQL 백업 및 복구 가이드 (Backup & Disaster Recovery Plan)

본 문서는 **Mondo (@Mondo2233) 라이브 다시보기 아카이브** 시스템의 핵심 자산인 채널, 라이브 영상 메타데이터, 태그 및 관리자 타임스탬프 메모(`timestamp_notes`) 데이터를 안전하게 보호하고 재난 상황 시 신속하게 복구하기 위한 백업·복원 운영 표준입니다.

---

## 1. 백업 전략 개요 (RTO & RPO 목표)

| 지표 | 목표 기준 | 설명 |
| :--- | :--- | :--- |
| **RPO (목표 복구 시점)** | **최대 1시간 이내** (PITR 적용 시 수 분 이내) | 데이터 유실을 허용할 수 있는 최대 시간 간격 |
| **RTO (목표 복구 시간)** | **30분 이내** | 장애 발생 시 백업본으로부터 서비스를 정상화하는 데 걸리는 시간 |
| **백업 보존 주기** | 일일 백업 14일, 주간 백업 8주, 월간 백업 1년 | 규정 준수 및 과거 데이터 회수 지원 |

---

## 2. 논리적 백업 (Logical Backup): `pg_dump` & `pg_restore`

논리적 백업은 특정 테이블(`videos`, `channels`, `tags`, `timestamp_notes`, `sync_runs`) 또는 전체 스키마와 데이터를 SQL 또는 커스텀 바이너리 포맷으로 추출합니다.

### 2.1 커스텀 아카이브 포맷 덤프 실행 (`-Fc`)
커스텀 포맷(`-Fc`)은 압축률이 우수하며, 복원 시 선택적 테이블 복원 및 다중 스레드 병렬 복원(`-j`)이 가능합니다.

```bash
# 1. 일일 정기 백업 스크립트 예시 (dump_backup.sh)
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgres"
BACKUP_FILE="${BACKUP_DIR}/youtube_archive_${BACKUP_DATE}.dump"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL backup for youtube_archive..."

# 커스텀 압축 포맷(-Fc), 데이터 무결성 보장을 위한 트랜잭션 스냅샷
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USERNAME}" \
  -d "${DB_NAME}" \
  -Fc \
  -v \
  -f "${BACKUP_FILE}"

echo "[$(date)] Backup completed: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# 2. S3/GCS 안전한 객체 스토리지 업로드 (AES-256 서버 암호화)
aws s3 cp "${BACKUP_FILE}" "s3://my-archive-backups/postgres/daily/${BACKUP_DATE}.dump" --sse AES256

# 3. 로컬 7일 초과 백업 파일 자동 정리
find "${BACKUP_DIR}" -type f -name "*.dump" -mtime +7 -delete
```

### 2.2 논리적 백업본 복원 (`pg_restore`)

```bash
# 전체 데이터베이스 복원 (기존 스키마 클린 후 재생성)
PGPASSWORD="${DB_PASSWORD}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USERNAME}" \
  -d "${DB_NAME}" \
  -c \
  --if-exists \
  -v \
  "${BACKUP_FILE}"

# 특정 테이블(예: 관리자 타임스탬프 메모만 오작동으로 삭제된 경우)만 선별 복원
pg_restore -h "${DB_HOST}" -U "${DB_USERNAME}" -d "${DB_NAME}" -t timestamp_notes "${BACKUP_FILE}"
```

---

## 3. 물리적 백업 및 PITR (Point-in-Time Recovery)

클라우드 관리형 데이터베이스(AWS RDS, Google Cloud SQL, Supabase, Neon 등)를 운영 환경으로 채택할 경우 제공되는 엔터프라이즈 백업 기능입니다.

### 3.1 자동 스냅샷 (Automated Snapshot)
- **주기**: 매일 1회 사용량이 가장 적은 새벽 시간대(KST 04:00)에 스토리지 볼륨 스냅샷 자동 생성.
- **영향도**: I/O 동결 시간이 거의 없거나 수 초 미만으로 무중단 백업 수행.

### 3.2 WAL(Write-Ahead Log) 아카이빙 및 PITR
- 데이터베이스의 모든 변경 로그(WAL)가 지속적으로 오브젝트 스토리지로 복제됩니다.
- 관리자가 실수로 중요한 라이브 메모 데이터를 삭제하거나 스키마 손상이 발생한 경우:
  - **오류 발생 1분 전(예: 2026-11-05 14:29:50 KST) 시점으로 데이터베이스를 1초 단위로 롤백**하여 신규 인스턴스로 복원 가능.

---

## 4. 재난 복구(Disaster Recovery) 시나리오별 대응 절차

### 시나리오 A: 특정 영상의 타임스탬프 메모가 유실된 경우 (국소 손상)
1. 가장 최근의 S3 일일 덤프 파일 다운로드.
2. 로컬 임시 PostgreSQL 인스턴스에 복원:
   `pg_restore -d temp_archive youtube_archive_latest.dump`
3. 유실된 레코드만 SQL로 추출하여 운영 DB에 INSERT:
   `psql -d temp_archive -c "\copy (SELECT * FROM timestamp_notes WHERE video_id = '2yK2D41LzB8') TO 'notes_recovery.csv' WITH CSV"`
   `psql -h $PROD_HOST -d $PROD_DB -c "\copy timestamp_notes FROM 'notes_recovery.csv' WITH CSV"`

### 시나리오 B: 클라우드 DB 인스턴스 장애 또는 리전 마비 (전체 손상)
1. 타 가용 영역(AZ) 또는 대체 클라우드(Neon/Supabase)에 신규 PostgreSQL 16 인스턴스 프로비저닝.
2. 최신 백업본(`latest.dump`)을 다운로드하여 `pg_restore` 실행.
3. 백엔드 환경변수 `DB_HOST`, `DB_PASSWORD`를 신규 접속 정보로 업데이트 후 백엔드 서비스 재시작.
4. `/api/v1/health` 헬스체크로 DB 연결 풀 정상 동작 확인.

---

## 5. 정기 복원 모의훈련 (Recovery Drill)

- **주기**: 분기별 1회 (3개월 단위)
- **검증 항목**:
  1. 자동 백업 파일이 손상 없이 매일 생성되고 있는가?
  2. S3/GCS에 저장된 덤프 파일 다운로드 및 테스트 DB로의 복원이 30분 이내에 완료되는가?
  3. 복원 후 `SELECT count(*) FROM videos;` 및 `timestamp_notes` 데이터 개수와 해시 정합성이 일치하는가?
