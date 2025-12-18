# Love Trip Admin - 관리자 페이지

Express 기반 관리자 페이지입니다.

## 기능

- 📊 Prometheus 메트릭 수집
- 📈 실시간 대시보드

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
  - job_name: "love-trip-admin"
    static_configs:
      - targets: ["localhost:3001"]
    metrics_path: "/api/metrics"
```

## 수집되는 메트릭

- `http_request_duration_seconds` - HTTP 요청 시간
- `http_requests_total` - HTTP 요청 수
