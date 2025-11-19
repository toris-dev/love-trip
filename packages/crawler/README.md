# Love Trip Crawler

Tour API에서 관광 정보를 가져와서 Supabase 데이터베이스에 동기화하는 크롤러입니다.

## 설치

```bash
pnpm install
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
TOUR_API_KEY=your_tour_api_key_here
TOUR_API_BASE_URL=https://apis.data.go.kr/B551011/KorService1
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
BATCH_SIZE=100
DELAY_MS=1000
```

## 사용법

### 전체 동기화

```bash
pnpm start
# 또는
pnpm crawler
```

### 특정 지역/타입 동기화

`src/sync.ts` 파일에서 `syncTasks` 배열을 수정하여 동기화할 지역과 타입을 지정할 수 있습니다.

## Tour API 키 발급

1. [공공데이터포털](https://www.data.go.kr/)에 회원가입
2. [Tour API](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15101578) 신청
3. 발급받은 API 키를 `.env` 파일에 설정

## 주요 기능

- Tour API에서 관광지, 문화시설, 음식점 등 정보 수집
- Supabase 데이터베이스에 자동 저장
- 중복 데이터 방지 (tour_content_id 기반)
- 배치 처리로 효율적인 데이터 동기화
- API 호출 제한 준수 (딜레이 설정)

