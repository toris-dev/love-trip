# 테이블 사용 현황 분석

## 📊 테이블별 사용 현황

### ✅ 실제 사용 중인 테이블

| 테이블명 | 데이터 수 | 사용 위치 | 상태 |
|---------|---------|---------|------|
| `places` | 42,199 | `travel-service.ts`, `recommendation-service.ts`, `calendar-service.ts` | ✅ 활발히 사용 중 |
| `profiles` | 2 | `profile/page.tsx`, `couple-connection.tsx` | ✅ 사용 중 |
| `couples` | 1 | `calendar-service.ts` | ✅ 사용 중 |
| `shared_calendars` | 1 | `calendar-service.ts` | ✅ 사용 중 |
| `calendar_events` | 3 | `calendar-service.ts`, `calendar/page.tsx` | ✅ 사용 중 |
| `push_subscriptions` | 1 | `use-push-notifications.ts`, `api/push/send/route.ts` | ✅ 사용 중 |
| `place_favorites` | 0 | `recommendation-service.ts` | ✅ 사용 중 (데이터 없음) |
| `travel_plans` | 0 | `travel-service.ts` | ✅ 사용 중 (데이터 없음) |
| `travel_days` | 0 | `travel-service.ts` | ✅ 사용 중 (데이터 없음) |
| `travel_day_places` | 0 | `travel-service.ts` | ✅ 사용 중 (데이터 없음) |
| `budget_items` | 0 | `travel-service.ts` | ✅ 사용 중 (데이터 없음) |
| `expenses` | 0 | - | ✅ 사용 예정 (데이터 없음) |
| `expense_splits` | 0 | - | ✅ 사용 예정 (데이터 없음) |

### ❌ 사용하지 않는 테이블 (삭제 권장)

| 테이블명 | 데이터 수 | 문제점 |
|---------|---------|--------|
| `courses` | 189 | 코드에서 사용하지 않음. 클라이언트에서 동적으로 생성 |
| `course_places` | 1,880 | 코드에서 사용하지 않음. 클라이언트에서 동적으로 생성 |

### ⚠️ 확인 필요한 테이블

| 테이블명 | 상태 |
|---------|------|
| `contact_messages` | 코드에서 사용하지만 테이블이 없을 수 있음 |
| `travel_plan_places` | 코드에서 사용하지만 실제로는 `travel_day_places`를 사용해야 함 |
| `tour_api_sync` | 크롤러에서만 사용 (유지) |
| `crawler_runs` | 크롤러에서만 사용 (유지) |

## 🔍 주요 발견 사항

### 1. courses/course_places 테이블 미사용

**현재 동작:**
- `/travel`와 `/date` 페이지는 `getCoupleRecommendations()`를 호출
- `places` 테이블에서 직접 데이터를 가져옴
- 클라이언트 사이드에서 `groupTravelCoursesByRegion()` 또는 `groupDateCoursesByRegion()`으로 코스를 동적으로 생성

**문제:**
- DB에 `courses` (189개)와 `course_places` (1,880개) 데이터가 있지만 사용하지 않음
- 불필요한 데이터 저장

**해결 방안:**
1. `courses`와 `course_places` 테이블 삭제
2. 또는 코드를 수정하여 실제 DB의 courses를 사용하도록 변경

### 2. MSW가 places API를 가로채고 있음

**현재 동작:**
- `getCoupleRecommendations()` → `supabase.from("places").select("*")`
- MSW handlers.ts에서 `/rest/v1/places` 경로를 가로채서 모킹 데이터 반환
- 실제 DB의 places 데이터가 아닌 MSW 모킹 데이터가 사용됨

**해결 방안:**
- `NEXT_PUBLIC_ENABLE_MSW=false`로 설정하면 해결됨
- 또는 MSW handlers에서 places API 가로채기를 제거

## 🛠️ 권장 조치 사항

1. **즉시 조치:**
   - `courses`와 `course_places` 테이블 삭제 (코드에서 사용하지 않음)
   - MSW 비활성화 확인 (`NEXT_PUBLIC_ENABLE_MSW=false`)

2. **코드 정리:**
   - `travel_plan_places` 참조를 `travel_day_places`로 수정
   - `contact_messages` 테이블 생성 또는 코드 수정

3. **향후 개선:**
   - 실제 DB의 `courses` 테이블을 사용하도록 코드 수정 고려
   - 서버 사이드에서 코스 생성하여 성능 개선

