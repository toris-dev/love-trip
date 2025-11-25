# Love Trip Crawler

Tour API 4.0에서 관광 정보를 가져와서 Supabase 데이터베이스에 동기화하는 크롤러입니다.
데이트 장소와 여행 장소를 구분하여 저장할 수 있습니다.

## 설치

```bash
pnpm install
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
TOUR_API_KEY=your_tour_api_key_here
TOUR_API_BASE_URL=https://apis.data.go.kr/B551011/KorService2
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
BATCH_SIZE=100
DELAY_MS=1000
```

> **참고**: Tour API는 `KorService2`를 사용합니다. 기본값이 `KorService2`로 설정되어 있습니다.

## 사용법

### 데이트 장소 및 여행 장소 동기화 (권장)

데이트 장소와 여행 장소를 구분하여 저장하는 스크립트입니다:

```bash
pnpm sync:date-travel
# 또는
pnpm --filter crawler sync:date-travel
```

이 스크립트는 다음을 수행합니다:
- **데이트 장소**: 음식점, 쇼핑, 문화시설 등 (당일 코스에 적합)
- **여행 장소**: 관광지, 레포츠, 숙박, 여행코스 등 (1박 2일 이상 여행에 적합)

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

- **Tour API 지원**: 한국관광공사 Tour API 사용
- **데이트/여행 장소 구분**: `course_type` 필드로 데이트 장소와 여행 장소 자동 분류
- **광범위한 지역 커버리지**: 전국 주요 지역의 관광 정보 수집
- **다양한 장소 타입**: 관광지, 문화시설, 음식점, 쇼핑, 레포츠, 숙박, 여행코스 등
- **중복 데이터 방지**: `tour_content_id` 기반으로 중복 저장 방지
- **배치 처리**: 효율적인 데이터 동기화를 위한 배치 처리
- **API 호출 제한 준수**: 딜레이 설정으로 API 호출 제한 준수

## 장소 분류

### 데이트 장소 (`course_type: ["date"]`)
- 음식점 (contentTypeId: 39)
- 쇼핑 (contentTypeId: 38)
- 문화시설 일부 (contentTypeId: 14)

### 여행 장소 (`course_type: ["travel"]`)
- 관광지 (contentTypeId: 12)
- 레포츠 (contentTypeId: 28)
- 숙박 (contentTypeId: 32)
- 여행코스 (contentTypeId: 25)

### 둘 다 가능 (`course_type: ["date", "travel"]`)
- 문화시설 (contentTypeId: 14)

