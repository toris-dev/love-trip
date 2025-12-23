# 📡 LOVETRIP API 명세서

## 📋 목차

- [API 개요](#api-개요)
- [인증](#인증)
- [엔드포인트](#엔드포인트)
- [에러 처리](#에러-처리)
- [데이터 모델](#데이터-모델)

## 🎯 API 개요

LOVETRIP은 Next.js App Router의 API Routes를 사용하여 RESTful API를 제공합니다.

### Base URL

- **개발**: `http://localhost:3000/api`
- **프로덕션**: `https://your-domain.com/api`

### 공통 규칙

- 모든 응답은 JSON 형식
- HTTP 상태 코드 사용
- 에러는 표준 형식으로 반환

## 🔐 인증

### 인증 방식

Supabase Auth를 사용한 JWT 기반 인증

### 인증 헤더

```http
Authorization: Bearer {jwt_token}
```

### 인증이 필요한 엔드포인트

대부분의 엔드포인트는 인증이 필요합니다. 인증되지 않은 요청은 `401 Unauthorized`를 반환합니다.

## 📍 엔드포인트

### 장소 (Places)

#### GET /api/places

장소 목록 조회

**인증**: 불필요

**쿼리 파라미터**:

- `limit` (optional): 조회할 장소 수 (기본값: 50)
- `areaCode` (optional): 지역 코드
- `contentTypeId` (optional): 콘텐츠 타입 ID

**응답**:

```json
{
  "places": [
    {
      "id": "uuid",
      "name": "해운대 해수욕장",
      "address": "부산광역시 해운대구",
      "lat": 35.1587,
      "lng": 129.1604,
      "type": "VIEW",
      "rating": 4.5,
      "price_level": 2
    }
  ]
}
```

#### GET /api/places/search

장소 검색

**인증**: 불필요

**쿼리 파라미터**:

- `query` (required): 검색어 (최소 2자)
- `limit` (optional): 조회할 장소 수 (기본값: 20)
- `preferExternal` (optional): 외부 API 우선 사용 여부 (기본값: true)

**응답**:

```json
{
  "places": [...]
}
```

#### POST /api/places/find-or-create

장소 검색 및 조회 (하이브리드 방식)

**인증**: 불필요

**요청 본문**:

```json
{
  "query": "강남 카페",
  "placeId": "uuid",
  "limit": 20
}
```

**응답**:

```json
{
  "place": {...},
  "places": [...]
}
```

### 여행 계획 (Travel Plans)

#### GET /api/travel-plans

여행 계획 목록 조회

**인증**: 필요

**쿼리 파라미터**:

- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**응답**:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "부산 여행",
      "start_date": "2024-01-01",
      "end_date": "2024-01-03",
      "budget": 500000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "hasMore": true,
  "totalCount": 10
}
```

#### POST /api/travel-plans

새 여행 계획 생성

**인증**: 필요

**요청 본문**:

```json
{
  "title": "부산 여행",
  "destination": "부산",
  "start_date": "2024-01-01",
  "end_date": "2024-01-03",
  "total_budget": 500000,
  "description": "2박 3일 부산 여행",
  "course_type": "travel",
  "places": [
    {
      "place_id": "550e8400-e29b-41d4-a716-446655440000",
      "day_number": 1,
      "order_index": 0
    }
  ],
  "budget_items": [
    {
      "category": "교통비",
      "name": "KTX",
      "planned_amount": 150000
    },
    {
      "category": "숙박비",
      "name": "호텔",
      "planned_amount": 200000
    }
  ]
}
```

**요청 필드**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | string | ✅ | 여행 계획 제목 (1-100자) |
| `destination` | string | ✅ | 목적지 (1-200자) |
| `start_date` | string | ✅ | 시작일 (YYYY-MM-DD 형식) |
| `end_date` | string | ✅ | 종료일 (YYYY-MM-DD 형식, 시작일 이후) |
| `total_budget` | number | ❌ | 총 예산 (0 이상) |
| `description` | string | ❌ | 설명 (최대 1000자) |
| `course_type` | "date" \| "travel" | ❌ | 코스 타입 (기본값: "travel") |
| `places` | array | ❌ | 장소 배열 |
| `places[].place_id` | string (UUID) | ✅ | 장소 ID (places 배열 내) |
| `places[].day_number` | number | ✅ | 일차 (1 이상) |
| `places[].order_index` | number | ❌ | 순서 (0 이상, 기본값: 0) |
| `budget_items` | array | ❌ | 예산 항목 배열 |
| `budget_items[].category` | string | ✅ | 카테고리 (1자 이상) |
| `budget_items[].name` | string | ✅ | 항목명 (1자 이상) |
| `budget_items[].planned_amount` | number | ✅ | 예산 금액 (0 이상) |

**응답**:

성공 시 (200 OK):

```json
{
  "plan": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "부산 여행",
    "destination": "부산",
    "start_date": "2024-01-01",
    "end_date": "2024-01-03",
    "total_budget": 500000,
    "description": "2박 3일 부산 여행",
    "course_type": "travel",
    "status": "planning",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**에러 응답**:

검증 실패 (400 Bad Request):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title: 제목은 필수입니다",
    "details": [
      {
        "path": ["title"],
        "message": "제목은 필수입니다"
      }
    ]
  }
}
```

인증 실패 (401 Unauthorized):

```json
{
  "error": "로그인이 필요합니다"
}
```

서버 오류 (500 Internal Server Error):

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버 오류가 발생했습니다"
  }
}
```

**참고사항**:

- 여행 계획 생성 시 자동으로 `travel_days`가 생성됩니다 (시작일부터 종료일까지)
- `places` 배열의 장소들은 해당 일차에 자동으로 연결됩니다
- `budget_items`는 첫 번째 일차에 연결됩니다
- `course_type`이 "date" 또는 "travel"인 경우, 자동으로 `user_courses`에도 저장됩니다 (비공개)
- 커플이 연결되어 있는 경우, 공동 캘린더에 자동으로 일정이 추가됩니다

#### GET /api/travel-plans/[id]

특정 여행 계획 조회

**인증**: 필요

**응답**:

```json
{
  "data": {
    "id": "uuid",
    "title": "부산 여행",
    "days": [
      {
        "id": "uuid",
        "day_number": 1,
        "places": [...]
      }
    ]
  }
}
```

#### PUT /api/travel-plans/[id]

여행 계획 수정

**인증**: 필요

**요청 본문**:

```json
{
  "title": "수정된 제목",
  "budget": 600000
}
```

#### DELETE /api/travel-plans/[id]

여행 계획 삭제

**인증**: 필요

### 여행 일차 장소 (Travel Day Places)

#### GET /api/travel-plans/[id]/days/[dayId]/places

일차별 장소 목록 조회

**인증**: 필요

**응답**:

```json
{
  "data": [
    {
      "id": "uuid",
      "place_id": "uuid",
      "order_index": 0,
      "places": {
        "id": "uuid",
        "name": "해운대 해수욕장",
        "lat": 35.1587,
        "lng": 129.1604
      }
    }
  ]
}
```

#### POST /api/travel-plans/[id]/days/[dayId]/places

일차에 장소 추가

**인증**: 필요

**요청 본문**:

```json
{
  "place_id": "uuid"
}
```

#### DELETE /api/travel-plans/[id]/days/[dayId]/places/[placeId]

일차에서 장소 제거

**인증**: 필요

#### PUT /api/travel-plans/[id]/days/[dayId]/places/[placeId]

장소 순서 변경

**인증**: 필요

**요청 본문**:

```json
{
  "order_index": 2
}
```

### 사용자 코스 (User Courses)

#### GET /api/user-courses

사용자 생성 코스 목록 조회

**인증**: 필요

**쿼리 파라미터**:

- `type` (optional): `date` | `travel`
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

#### POST /api/user-courses

새 코스 생성

**인증**: 필요

**요청 본문**:

```json
{
  "title": "강남 데이트 코스",
  "type": "date",
  "region": "서울",
  "places": [
    {
      "place_id": "uuid",
      "order_index": 0
    }
  ],
  "is_public": true
}
```

#### GET /api/user-courses/[id]

특정 코스 조회

**인증**: 필요 (공개 코스는 불필요)

#### PUT /api/user-courses/[id]

코스 수정

**인증**: 필요 (작성자만)

#### DELETE /api/user-courses/[id]

코스 삭제

**인증**: 필요 (작성자만)

### 장소 (Places)

#### GET /api/places/find-or-create

장소 찾기 또는 생성

**인증**: 필요

**쿼리 파라미터**:

- `name`: 장소명
- `lat`: 위도
- `lng`: 경도

**응답**:

```json
{
  "data": {
    "id": "uuid",
    "name": "해운대 해수욕장",
    "lat": 35.1587,
    "lng": 129.1604
  }
}
```

#### POST /api/places/[id]/favorite

장소 즐겨찾기 추가

**인증**: 필요

#### DELETE /api/places/[id]/favorite

장소 즐겨찾기 제거

**인증**: 필요

#### GET /api/places/favorites

즐겨찾기 장소 목록

**인증**: 필요

### 지오코딩 (Geocoding)

#### GET /api/geocode

주소 검색

**인증**: 필요

**쿼리 파라미터**:

- `query`: 검색어

**응답**:

```json
{
  "locations": [
    {
      "name": "해운대 해수욕장",
      "address": "부산광역시 해운대구 해운대해변로 264",
      "lat": 35.1587,
      "lng": 129.1604
    }
  ]
}
```

### 인증 (Auth)

#### GET /api/auth/callback

OAuth 콜백 처리

**인증**: 불필요

### 프로필 (Profile)

#### GET /api/profile

사용자 프로필 조회

**인증**: 필요

#### PUT /api/profile

프로필 수정

**인증**: 필요

### 푸시 알림 (Push Notifications)

#### POST /api/push/send

푸시 알림 전송 (관리자용)

**인증**: 필요 (Service Role)

#### GET /api/push/check-vapid

VAPID 키 확인

**인증**: 필요

## ⚠️ 에러 처리

### 에러 응답 형식

```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP 상태 코드

- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

### 에러 코드 예시

- `VALIDATION_ERROR`: 입력값 검증 실패
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `UNAUTHORIZED`: 인증 필요
- `FORBIDDEN`: 권한 없음
- `DATABASE_ERROR`: 데이터베이스 오류

## 📊 데이터 모델

### TravelPlan

```typescript
{
  id: string
  user_id: string
  title: string
  start_date: string
  end_date: string
  budget: number
  destination: string
  created_at: string
  updated_at: string
}
```

### TravelDay

```typescript
{
  id: string
  travel_plan_id: string
  day_number: number
  date: string | null
  title: string | null
  created_at: string
}
```

### Place

```typescript
{
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number
  price_level: number
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}
```

## 🔗 관련 문서

- [프로젝트 기획서](./project-plan.md)
- [아키텍처 문서](./architecture.md)
- [데이터베이스 스키마](./database/DATABASE_SCHEMA.md)
