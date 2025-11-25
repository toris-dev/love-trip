# Love Trip Admin - 관리자 페이지

Express 기반 관리자 페이지로 크롤러를 실행하고 모니터링할 수 있습니다.

## 기능

- 🚀 크롤러 실행 및 관리
- 📊 Prometheus 메트릭 수집
- 📈 실시간 대시보드
- 📝 크롤러 실행 기록 및 로그 조회

## 시작하기

### 환경 변수 설정

루트 디렉토리의 `.env.local` 파일이 자동으로 로드됩니다. 다음 변수들이 필요합니다:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001  # 선택사항, 기본값: 3001
```

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 모드 실행
pnpm admin:dev

# 프로덕션 모드 실행
pnpm admin
```

서버가 시작되면 http://localhost:3001 에서 관리자 페이지에 접근할 수 있습니다.

## API 엔드포인트

### 크롤러 API

- `POST /api/crawler/run` - 크롤러 실행
- `GET /api/crawler/runs?limit=10` - 크롤러 실행 기록 조회

### 대시보드 API

- `GET /api/dashboard/stats` - 대시보드 통계 조회

### 메트릭 API

- `GET /api/metrics` - Prometheus 메트릭 (Prometheus 형식)

### 헬스 체크

- `GET /health` - 서버 상태 확인

## Prometheus 연동

`/api/metrics` 엔드포인트를 Prometheus에 추가하여 메트릭을 수집할 수 있습니다:

```yaml
scrape_configs:
  - job_name: 'love-trip-admin'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/api/metrics'
```

## 수집되는 메트릭

- `crawler_runs_total` - 크롤러 실행 횟수 (status별)
- `crawler_items_processed_total` - 처리된 아이템 수 (action별)
- `crawler_duration_seconds` - 크롤러 실행 시간
- `crawler_last_run_timestamp` - 마지막 실행 시간
- `http_request_duration_seconds` - HTTP 요청 시간
- `http_requests_total` - HTTP 요청 수

## 데이터베이스

크롤러 실행 기록은 Supabase의 `crawler_runs` 테이블에 저장됩니다:

- `id` - 실행 ID
- `started_at` - 시작 시간
- `completed_at` - 완료 시간
- `status` - 상태 (running, completed, failed)
- `items_inserted` - 추가된 아이템 수
- `items_updated` - 업데이트된 아이템 수
- `items_errors` - 에러 수
- `duration_seconds` - 소요 시간
- `error_message` - 에러 메시지
- `logs` - 실행 로그

