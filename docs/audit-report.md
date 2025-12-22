# LOVETRIP 프로젝트 로직 및 플로우 점검 보고서

**점검 일자**: 2025-01-27  
**점검 범위**: 전체 프로젝트 아키텍처, 로직, 플로우

---

## 📋 실행 요약

이 보고서는 LOVETRIP 프로젝트의 전체적인 로직과 플로우를 체계적으로 점검한 결과입니다. 주요 발견 사항과 개선 권장 사항을 우선순위별로 정리했습니다.

### 주요 발견 사항

- ✅ **양호한 점**: 모노레포 구조가 잘 설계되어 있으며, 레이어 분리가 명확함
- ⚠️ **주의 필요**: `places` 테이블 삭제로 인한 광범위한 기능 제한
- ⚠️ **주의 필요**: 여행 계획 생성 시 트랜잭션 일관성 부족
- ⚠️ **주의 필요**: 일부 API 라우트에서 입력 검증 부족

---

## 1. 아키텍처 구조 점검

### 1.1 모노레포 구조 검증

#### ✅ 패키지 의존성 관계

**현재 구조:**

```
apps/web
  ├── @lovetrip/api
  ├── @lovetrip/shared
  ├── @lovetrip/ui
  ├── @lovetrip/planner
  ├── @lovetrip/couple
  ├── @lovetrip/expense
  ├── @lovetrip/recommendation
  ├── @lovetrip/user
  ├── @lovetrip/gamification
  └── @lovetrip/subscription

packages/api
  └── @lovetrip/shared

packages/planner
  ├── @lovetrip/api
  ├── @lovetrip/shared
  ├── @lovetrip/ui
  └── @lovetrip/gamification

packages/expense
  ├── @lovetrip/api
  ├── @lovetrip/shared
  └── @lovetrip/planner ⚠️

packages/couple
  ├── @lovetrip/api
  ├── @lovetrip/shared
  └── @lovetrip/ui

packages/ui
  └── @lovetrip/utils

packages/shared
  └── (의존성 없음) ✅
```

**발견 사항:**

- ✅ `packages/shared`는 의존성이 없어 순수한 공통 타입/유틸리티 패키지로 잘 설계됨
- ⚠️ `packages/expense`가 `packages/planner`에 의존함 - 이는 아키텍처 원칙에 위배될 수 있음
  - `expense`는 독립적인 도메인이어야 하며, `planner`에 의존하지 않아야 함
  - **권장**: `expense`가 `planner`의 타입만 필요하다면 `shared`로 이동 고려

#### ✅ 순환 의존성 확인

**결과**: 순환 의존성 없음 ✅

모든 패키지 의존성은 단방향이며 순환 구조가 발견되지 않았습니다.

#### ✅ 타입 정의 일관성

**현재 구조:**

- `packages/shared/types/database.ts`: Supabase에서 생성된 타입
- `packages/shared/types/course.ts`: 코스 관련 타입
- `packages/shared/types/user-course.ts`: 사용자 코스 타입
- `packages/shared/types/errors.ts`: 에러 타입

**발견 사항:**

- ✅ 타입 정의가 `shared` 패키지에 중앙화되어 있음
- ✅ 모든 패키지가 `@lovetrip/shared/types`를 통해 타입을 참조
- ⚠️ 일부 도메인 패키지에 중복 타입 정의가 있을 수 있음 (추가 확인 필요)

### 1.2 레이어 분리 검증

#### ✅ 레이어 구조

**현재 구조:**

```
Presentation Layer (apps/web)
  ├── pages (app router)
  ├── components/features
  └── components/layout
         ↓
Domain Layer (packages/*)
  ├── services (비즈니스 로직)
  ├── components (도메인 컴포넌트)
  └── hooks (도메인 훅)
         ↓
Data Layer (packages/api)
  ├── supabase/client.ts
  └── supabase/server.ts
         ↓
Infrastructure (Supabase)
```

**발견 사항:**

- ✅ 레이어 분리가 명확하게 구현됨
- ✅ 비즈니스 로직이 서비스 레이어에 위치
- ⚠️ 일부 API 라우트에서 비즈니스 로직이 직접 구현됨 (예: `apps/web/src/app/api/travel-plans/route.ts`)
  - **권장**: 복잡한 로직은 서비스 레이어로 이동

---

## 2. 인증 및 인가 플로우 점검

### 2.1 인증 메커니즘

#### ✅ Supabase Auth 사용

**발견 사항:**

- ✅ 모든 API 라우트에서 `createClient()`를 통해 Supabase 클라이언트 생성
- ✅ 클라이언트/서버 클라이언트가 올바르게 분리됨
  - 클라이언트: `@lovetrip/api/supabase/client`
  - 서버: `@lovetrip/api/supabase/server`
- ✅ 세션 관리는 Supabase Auth에 위임

**코드 패턴:**

```typescript
// 서버 사이드
const supabase = await createClient()
const {
  data: { user },
} = await supabase.auth.getUser()

// 클라이언트 사이드
const supabase = createClient()
const {
  data: { user },
} = await supabase.auth.getUser()
```

### 2.2 인가 검증

#### ✅ API 라우트 인증 체크

**점검 결과:**

- ✅ **34개 API 라우트**에서 `supabase.auth.getUser()`를 사용하여 인증 체크
- ✅ 인증되지 않은 사용자에 대해 일관된 401 응답 반환
- ✅ 에러 메시지는 한국어로 통일됨

**패턴:**

```typescript
const {
  data: { user },
} = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
}
```

#### ⚠️ 리소스 소유권 검증

**발견 사항:**

- ✅ 대부분의 API에서 리소스 소유권 검증 수행
- ⚠️ 일부 API에서 소유권 검증이 누락될 수 있음
  - 예: `apps/web/src/app/api/travel-plans/[id]/route.ts`에서 소유권 검증 확인 필요

**권장 패턴:**

```typescript
// 리소스 조회
const { data: resource } = await supabase.from("table").select("*").eq("id", id).single()

// 소유권 검증
if (!resource || resource.user_id !== user.id) {
  return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
}
```

#### ⚠️ RLS 정책 확인

**발견 사항:**

- ⚠️ RLS 정책이 데이터베이스 레벨에서 구현되어 있는지 확인 필요
- ⚠️ 서버 사이드 검증과 RLS 정책의 일관성 확인 필요
- **권장**: RLS 정책 문서화 및 테스트

### 2.3 보호된 라우트

#### ✅ 라우트 보호 로직

**현재 구현:**

- ✅ `apps/web/src/proxy.ts`에서 라우트 보호 구현
- ✅ `protectedRoutes`: `["/profile", "/calendar", "/my-trips"]`
- ✅ `publicRoutes`: `["/", "/login", "/about", "/contact", "/terms", "/privacy", "/date", "/travel"]`
- ✅ 미들웨어 삭제 후 `proxy.ts`로 대체됨

**발견 사항:**

- ✅ 로그인된 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트
- ✅ 인증되지 않은 사용자는 로그인 페이지로 리다이렉트 (redirect 파라미터 포함)
- ⚠️ `/courses` 경로가 보호된 라우트 목록에 없음 - 의도된 것인지 확인 필요

---

## 3. 여행 계획 생성 및 관리 플로우

### 3.1 여행 계획 생성 플로우

#### ⚠️ 트랜잭션 일관성 문제

**현재 플로우** (`apps/web/src/app/api/travel-plans/route.ts`):

1. `travel_plans` 생성 ✅
2. `travel_days` 생성 (날짜별) ✅
3. `travel_day_places` 생성 ✅
4. `budget_items` 생성 ✅
5. 캘린더 이벤트 자동 추가 ⚠️ (실패해도 성공으로 처리)
6. `user_courses` 자동 생성 ⚠️ (실패해도 성공으로 처리)

**문제점:**

- ⚠️ **트랜잭션 부재**: Supabase는 트랜잭션을 지원하지만 현재 코드에서는 사용하지 않음
- ⚠️ **부분 실패 처리**: 5, 6단계가 실패해도 전체 작업이 성공으로 처리됨
- ⚠️ **롤백 전략 없음**: 중간 단계 실패 시 이전 단계 롤백 없음

**예시 코드:**

```typescript
// 5. 캘린더에 자동으로 일정 추가
try {
  // ... 캘린더 이벤트 생성
} catch (calendarError) {
  // 캘린더 추가 실패해도 여행 계획 생성은 성공으로 처리
  console.error("Failed to add to calendar:", calendarError)
}

// 6. 코스인 경우 user_courses에도 자동 저장
try {
  await createUserCourseFromTravelPlan(...)
} catch (courseError) {
  // user_course 생성 실패해도 travel_plan 생성은 성공으로 처리
  console.error("Failed to create user course:", courseError)
}
```

**권장 개선:**

1. **트랜잭션 사용**: Supabase의 트랜잭션 기능 활용 (PostgreSQL 트랜잭션)
2. **롤백 전략**: 실패 시 이전 단계 롤백
3. **에러 처리 개선**: 부분 실패 시 사용자에게 명확한 피드백

### 3.2 장소 관리

#### 🔴 Critical: `places` 테이블 삭제 영향

**발견 사항:**

- 🔴 **51개 파일**에서 `places` 테이블 삭제 관련 주석 발견
- 🔴 주요 기능들이 빈 배열을 반환하거나 에러를 반환함

**영향을 받는 기능:**

1. **장소 검색** (`packages/planner/services/travel-service.ts`)

   ```typescript
   async getPlaces(): Promise<Place[]> {
     return [] // 빈 배열 반환
   }
   ```

2. **추천 시스템** (`packages/recommendation/services/recommendation-service.ts`)

   ```typescript
   async getFavoriteBasedRecommendations(...): Promise<Place[]> {
     return [] // 빈 배열 반환
   }
   ```

3. **API 엔드포인트** (`apps/web/src/app/api/places/find-or-create/route.ts`)
   ```typescript
   return NextResponse.json(
     { error: "places 테이블이 삭제되어 이 기능을 사용할 수 없습니다" },
     { status: 410 }
   )
   ```

**현재 대체 방안:**

- `travel_day_places`에서 `place_id`만 저장
- `user_course_places`에서 장소 정보 저장
- `date_course_places`에서 장소 정보 저장

**권장 해결 방안:**

1. **새로운 데이터 소스 설계**
   - `travel_day_places`, `user_course_places`에서 장소 정보 조회
   - 또는 외부 API (네이버 지도, 한국관광공사) 활용
2. **마이그레이션 계획 수립**
3. **기능 복구 우선순위 결정**

### 3.3 여행 계획 조회 및 수정

#### ✅ 권한 검증

**발견 사항:**

- ✅ 대부분의 API에서 소유권 검증 수행
- ✅ 데이터 조인 최적화 확인 필요

---

## 4. 코스 추천 및 선택 플로우

### 4.1 코스 데이터 소스

#### ✅ 코스 테이블 구조

**현재 구조:**

- `date_courses`: 데이트 코스 (사전 정의)
- `travel_courses`: 여행 코스 (사전 정의)
- `user_courses`: 사용자 생성 코스

**발견 사항:**

- ✅ 코스 타입이 명확하게 분리됨
- ✅ 사용자 생성 코스 지원

### 4.2 추천 시스템

#### ⚠️ 추천 시스템 제한

**현재 구현:**

- `getCoupleRecommendations`: 커플 추천
- `getFavoriteBasedRecommendations`: 즐겨찾기 기반 추천 (현재 비활성화)

**문제점:**

- ⚠️ `places` 테이블 삭제로 인해 추천 기능이 제한됨
- ⚠️ Fallback 메커니즘이 있지만 제한적

**권장 개선:**

1. 새로운 데이터 소스 기반 추천 알고리즘 개발
2. 외부 API 활용 (한국관광공사 Tour API)

### 4.3 코스 선택 및 저장

#### ✅ 플로우 확인

**발견 사항:**

- ✅ 코스 선택 → 여행 계획 변환 플로우 구현됨
- ✅ 즐겨찾기 기능 구현됨 (단, `places` 테이블 삭제로 제한)
- ✅ 공개/비공개 설정 지원

---

## 5. 캘린더 이벤트 관리 플로우

### 5.1 커플 연결

#### ✅ 커플 매칭 플로우

**현재 구현:**

- ✅ 닉네임 기반 사용자 검색
- ✅ 커플 요청 생성 (`status: "pending"`)
- ✅ 요청 수락/거절 처리
- ✅ 기본 캘린더 자동 생성

**발견 사항:**

- ✅ 플로우가 명확하게 구현됨
- ⚠️ 중복 요청 방지 로직 확인 필요

### 5.2 캘린더 및 이벤트

#### ✅ 이벤트 관리

**발견 사항:**

- ✅ 공유 캘린더 생성 및 관리 구현됨
- ✅ 이벤트 CRUD 기능 구현됨
- ✅ 여행 계획 → 캘린더 자동 동기화 구현됨
- ⚠️ 푸시 알림 전송 로직 확인 필요

---

## 6. 예산 및 지출 관리 플로우

### 6.1 예산 계획

#### ✅ 예산 관리

**발견 사항:**

- ✅ 예산 항목 CRUD 기능 구현됨
- ✅ 예산 요약 계산 로직 구현됨
- ✅ 카테고리별 집계 기능 구현됨

### 6.2 지출 추적

#### ✅ 지출 관리

**발견 사항:**

- ✅ 지출 기록 CRUD 기능 구현됨
- ✅ 예산 대비 지출 비교 기능 구현됨
- ✅ 예산 초과 경고 기능 구현됨

### 6.3 정산 기능

#### ✅ 정산 시스템

**발견 사항:**

- ✅ 1/N 정산 계산 로직 구현됨
- ✅ 지출 분할 기능 구현됨
- ✅ 정산 요청/승인 플로우 구현됨
- ✅ 결제 상태 관리 구현됨

---

## 7. 데이터 일관성 및 에러 처리

### 7.1 에러 처리 패턴

#### ✅ 에러 클래스 정의

**현재 구현:**

- ✅ `packages/shared/types/errors.ts`에 에러 클래스 정의
  - `ServiceError`
  - `AuthenticationError`
  - `AuthorizationError`
  - `NotFoundError`
  - `ValidationError`

**발견 사항:**

- ⚠️ 에러 클래스가 정의되어 있지만 실제 사용 빈도가 낮음
- ⚠️ 대부분의 API에서 일반 `Error` 사용
- **권장**: 에러 클래스 활용 증가

#### ✅ API 라우트 에러 응답

**발견 사항:**

- ✅ 대부분의 API에서 일관된 에러 응답 형식
- ✅ 한국어 에러 메시지 사용
- ⚠️ 일부 API에서 에러 응답 형식이 다를 수 있음

### 7.2 트랜잭션 관리

#### ⚠️ 트랜잭션 부재

**발견 사항:**

- ⚠️ 다중 테이블 작업 시 트랜잭션 미사용
- ⚠️ 부분 실패 시 롤백 전략 없음
- **권장**: Supabase 트랜잭션 활용

### 7.3 데이터 검증

#### ⚠️ 입력 검증 부족

**발견 사항:**

- ⚠️ 일부 API에서 입력 검증이 부족함
- ⚠️ 타입 검증만 수행하고 비즈니스 규칙 검증 부족
- **권장**: Zod 또는 유사한 라이브러리 활용

**예시:**

```typescript
// 현재
const body = await request.json()
const { title, destination } = body

// 권장
import { z } from "zod"
const schema = z.object({
  title: z.string().min(1).max(100),
  destination: z.string().min(1),
})
const body = schema.parse(await request.json())
```

---

## 8. 성능 및 최적화

### 8.1 쿼리 최적화

#### ⚠️ N+1 쿼리 가능성

**발견 사항:**

- ⚠️ 일부 코드에서 N+1 쿼리 패턴 가능성
- **권장**: 쿼리 프로파일링 및 최적화

### 8.2 캐싱 전략

#### ✅ 캐싱 구현

**현재 구현:**

- ✅ `packages/planner/services/course-cache.ts`: 메모리 기반 캐시
- ✅ TTL 기반 캐시 만료
- ✅ 패턴 기반 캐시 삭제

**발견 사항:**

- ✅ 클라이언트 사이드 캐싱 구현됨
- ⚠️ 서버 사이드 캐싱 부족
- **권장**: Redis 또는 유사한 솔루션 고려

### 8.3 코드 스플리팅

#### ✅ 동적 임포트

**발견 사항:**

- ✅ Next.js의 자동 코드 스플리팅 활용
- ✅ 동적 임포트 사용 확인 필요

---

## 9. 보안 점검

### 9.1 입력 검증

#### ⚠️ 검증 부족

**발견 사항:**

- ⚠️ 일부 API에서 입력 검증이 부족함
- ⚠️ XSS 방지를 위한 HTML 이스케이프 확인 필요
- ✅ CSRF 방지는 Next.js 기본 제공

**권장:**

- 모든 사용자 입력에 대한 검증 추가
- DOMPurify 또는 유사한 라이브러리 활용

### 9.2 데이터 접근 제어

#### ⚠️ RLS 정책 확인 필요

**발견 사항:**

- ⚠️ RLS 정책이 데이터베이스 레벨에서 구현되어 있는지 확인 필요
- ✅ 서버 사이드 권한 검증 구현됨
- ✅ 민감 정보 노출 방지 확인

### 9.3 환경 변수 관리

#### ✅ 환경 변수 사용

**발견 사항:**

- ✅ 환경 변수를 통한 민감 정보 관리
- ✅ 하드코딩된 민감 정보 없음

---

## 10. 주요 이슈 및 개선 사항

### 10.1 Critical Issues

#### 🔴 1. `places` 테이블 삭제로 인한 기능 제한

**영향 범위:**

- 51개 파일에서 영향 확인
- 주요 기능들이 비활성화됨

**해결 방안:**

1. 새로운 데이터 소스 설계
2. 마이그레이션 계획 수립
3. 기능 복구 우선순위 결정

#### ⚠️ 2. 트랜잭션 일관성 부족

**영향:**

- 여행 계획 생성 시 부분 실패 가능성
- 데이터 일관성 문제

**해결 방안:**

1. Supabase 트랜잭션 활용
2. 롤백 전략 구현
3. 에러 처리 개선

### 10.2 High Priority Issues

#### ⚠️ 1. 입력 검증 부족

**해결 방안:**

- Zod 또는 유사한 라이브러리 도입
- 모든 API 라우트에 검증 추가

#### ⚠️ 2. 에러 처리 표준화

**해결 방안:**

- 에러 클래스 활용 증가
- 일관된 에러 응답 형식

### 10.3 Medium Priority Issues

#### ⚠️ 1. 패키지 의존성 개선

**해결 방안:**

- `packages/expense`의 `packages/planner` 의존성 제거
- 공통 타입을 `shared`로 이동

#### ⚠️ 2. 성능 최적화

**해결 방안:**

- 쿼리 프로파일링
- N+1 쿼리 최적화
- 서버 사이드 캐싱 도입

### 10.4 Low Priority Issues

#### ⚠️ 1. 문서화 개선

**해결 방안:**

- JSDoc 추가
- 아키텍처 문서 업데이트

---

## 11. 우선순위별 개선 계획

### Critical (즉시 조치 필요)

1. **`places` 테이블 대체 방안 수립**
   - 새로운 데이터 소스 설계
   - 마이그레이션 계획
   - 기능 복구 우선순위

2. **트랜잭션 일관성 개선**
   - Supabase 트랜잭션 도입
   - 롤백 전략 구현

### High (단기 개선)

1. **입력 검증 강화**
   - Zod 도입
   - 모든 API 라우트에 검증 추가

2. **에러 처리 표준화**
   - 에러 클래스 활용
   - 일관된 에러 응답

### Medium (중기 개선)

1. **패키지 의존성 개선**
   - `expense` 패키지 의존성 제거

2. **성능 최적화**
   - 쿼리 최적화
   - 캐싱 전략 개선

### Low (장기 개선)

1. **문서화 개선**
   - 코드 문서화
   - 아키텍처 문서 업데이트

---

## 12. 결론

LOVETRIP 프로젝트는 전반적으로 잘 설계된 모노레포 구조를 가지고 있으며, 레이어 분리와 도메인 설계가 명확합니다. 그러나 몇 가지 중요한 이슈가 발견되었습니다:

1. **`places` 테이블 삭제**: 가장 시급한 문제로, 광범위한 기능 제한을 초래하고 있습니다.
2. **트랜잭션 일관성**: 데이터 일관성을 보장하기 위해 트랜잭션 도입이 필요합니다.
3. **입력 검증**: 보안과 데이터 무결성을 위해 검증 강화가 필요합니다.

이러한 이슈들을 우선순위에 따라 해결하면 프로젝트의 안정성과 신뢰성이 크게 향상될 것입니다.

---

## 13. 사용자 플로우 분석 요약

### 13.1 주요 사용자 여정

**온보딩 → 탐색 → 계획 → 실행 → 공유**의 5단계 여정이 확인되었습니다.

#### 발견된 주요 문제점

1. **온보딩 가이드 부재**
   - 신규 사용자에게 서비스 사용법 안내 없음
   - 첫 여행 계획 생성 시 도움말 부족
   - **영향**: 이탈률 증가, 기능 활용도 저하

2. **코스 탐색 플로우 제한**
   - `places` 테이블 삭제로 인한 장소 정보 부족
   - 필터링 기능 제한
   - 추천 알고리즘 부재
   - **영향**: 사용자 만족도 저하, 코스 선택 어려움

3. **여행 계획 생성 플로우의 트랜잭션 문제**
   - 부분 실패 시 데이터 불일치
   - 진행 상황 표시 부족
   - **영향**: 데이터 무결성 문제, 사용자 신뢰도 저하

### 13.2 서비스 설계 개선 방안

#### 아키텍처 개선

1. **Transaction Manager 도입**
   - 모든 다중 테이블 작업에 트랜잭션 적용
   - 롤백 전략 구현

2. **Cache Layer 강화**
   - Redis 또는 유사한 솔루션 도입
   - 장소 정보 캐싱

3. **External Services 통합**
   - 네이버 지도 API 통합
   - 한국관광공사 Tour API 통합
   - 결제 게이트웨이 통합

#### UX/UI 개선

1. **온보딩 개선**
   - 인터랙티브 온보딩 퍼널
   - 컨텍스트 기반 도움말

2. **코스 탐색 개선**
   - 향상된 필터링 (다중 필터 조합)
   - 시각적 개선 (지도 기반 탐색 강화)

3. **여행 계획 생성 개선**
   - 드래그 앤 드롭 인터페이스
   - 스마트 제안 (AI 기반 장소 추천)

4. **예산 관리 개선**
   - 시각화 강화 (차트 및 그래프)
   - 자동화 기능 (OCR, 카드 내역 연동)

### 13.3 실행 계획

상세한 사용자 플로우 분석 및 서비스 설계 개선 방안은 별도 문서를 참조하세요:

- **[사용자 플로우 분석 문서](./user-flow-analysis.md)**: 전체 사용자 여정, 플로우별 문제점, 개선 방안 상세 분석

---

**작성자**: AI Assistant  
**검토 필요**: 프로젝트 팀 리더  
**관련 문서**: [사용자 플로우 분석](./user-flow-analysis.md)
