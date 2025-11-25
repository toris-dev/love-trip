# Love Trip 아키텍처

## 모노레포 구조

이 프로젝트는 pnpm workspace를 사용한 모노레포 구조입니다.

```
love-trip/
├── apps/
│   └── web/              # Next.js 웹 애플리케이션 (현재 루트에 있음)
├── packages/
│   ├── crawler/          # Tour API 크롤러
│   │   ├── src/
│   │   │   ├── config.ts              # 환경 변수 설정
│   │   │   ├── index.ts               # 진입점
│   │   │   ├── sync.ts                # 동기화 스크립트
│   │   │   ├── lib/
│   │   │   │   ├── tour-api-client.ts    # Tour API 클라이언트
│   │   │   │   └── supabase-client.ts    # Supabase 클라이언트
│   │   │   └── types/
│   │   │       └── tour-api.ts           # Tour API 타입 정의
│   │   └── package.json
│   └── shared/           # 공유 타입 및 유틸리티
│       ├── src/
│       │   ├── types/
│       │   │   └── index.ts           # 공통 타입 정의
│       │   └── index.ts
│       └── package.json
└── pnpm-workspace.yaml
```

## 데이터 흐름

### 1. 크롤러 → 데이터베이스

```
Tour API → Crawler → Supabase Database
```

1. 크롤러가 Tour API에서 관광 정보를 가져옵니다
2. 데이터를 변환하여 Supabase `places` 테이블에 저장합니다
3. `tour_content_id`를 사용하여 중복을 방지합니다

### 2. 웹 앱 → 추천 시스템

```
User Request → Recommendation Service → Supabase → Filtered Results
```

1. 사용자가 추천을 요청합니다
2. 추천 서비스가 사용자 선호도, 테마, 지역 등을 기반으로 필터링합니다
3. Supabase에서 적합한 장소를 조회합니다
4. 결과를 사용자에게 반환합니다

## 주요 컴포넌트

### 크롤러 (packages/crawler)

**역할**: Tour API에서 관광 정보를 수집하여 데이터베이스에 저장

**주요 기능**:
- Tour API 클라이언트 (`TourApiClient`)
- 데이터 변환 및 정규화
- 배치 처리로 효율적인 데이터 저장
- 중복 방지 (tour_content_id 기반)

**사용법**:
```bash
pnpm crawler
```

### 추천 서비스 (src/lib/services/recommendation-service.ts)

**역할**: 사용자에게 맞춤형 장소 추천 제공

**주요 기능**:
- `getCoupleRecommendations()`: 커플 맞춤 추천
- `getThemeRecommendations()`: 테마별 추천
- `getAreaRecommendations()`: 지역별 추천
- `getFavoriteBasedRecommendations()`: 즐겨찾기 기반 추천

**사용 예시**:
```typescript
// 커플 맞춤 추천
const recommendations = await getCoupleRecommendations({
  preferredTypes: ["VIEW", "MUSEUM", "CAFE", "FOOD"],
  limit: 20,
})

// 테마별 추천
const romanticPlaces = await getThemeRecommendations("로맨틱", 10)
```

## 데이터베이스 스키마

### places 테이블

Tour API 데이터를 저장하는 주요 테이블입니다.

**주요 필드**:
- `tour_content_id`: Tour API 고유 ID (중복 방지)
- `tour_content_type_id`: 관광지 타입 (12:관광지, 14:문화시설, 39:음식점 등)
- `area_code`, `sigungu_code`: 지역 코드
- `category1`, `category2`, `category3`: 카테고리 분류
- `overview`: 상세 설명

## 환경 변수

### 크롤러용 (.env)

```env
TOUR_API_KEY=your_tour_api_key
TOUR_API_BASE_URL=https://apis.data.go.kr/B551011/KorService2
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BATCH_SIZE=100
DELAY_MS=1000
```

### 웹 앱용 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

## 확장 가능성

### 추가 가능한 기능

1. **실시간 동기화**: 크롤러를 스케줄러로 실행하여 주기적으로 데이터 업데이트
2. **AI 추천**: 사용자 행동 데이터를 기반으로 머신러닝 추천 시스템
3. **커플 매칭**: 두 사용자의 선호도를 분석하여 최적의 데이트 코스 생성
4. **리뷰 시스템**: 사용자가 방문한 장소에 대한 리뷰 및 평점 추가

