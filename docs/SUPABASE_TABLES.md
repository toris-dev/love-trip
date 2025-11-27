# Supabase 데이터베이스 테이블 구조 설명

## 📊 전체 테이블 요약

| 테이블명                   | 용도                                                  | 데이터 수 | 주요 컬럼                                                                                                                                    | 관계                                                                                                                                                                             | 사용 위치                                                             |
| -------------------------- | ----------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **`places`**               | 전국 관광지, 카페, 맛집, 문화시설 등의 장소 정보 저장 | 42,192개  | `id`, `name`, `lat`, `lng`, `type`, `rating`, `price_level`, `area_code`, `sigungu_code`, `course_type`, `tour_content_id`                   | `travel_course_places.place_id`, `travel_day_places.place_id`, `place_favorites.place_id`, `calendar_events.place_id`                                                            | `/travel`, `/date` 페이지, `recommendation-service.ts`, 캘린더 이벤트 |
| **`travel_courses`**       | 지역별 여행 코스 템플릿 저장 (1박2일 이상)            | 11개      | `id`, `title`, `region`, `course_type`, `duration`, `place_count`, `total_distance_km`, `area_code`                                          | `travel_course_places.travel_course_id`                                                                                                                                          | `/travel` 페이지                                                      |
| **`travel_course_places`** | 여행 코스에 포함된 장소와 순서, 일차 정보 저장        | 80개      | `id`, `travel_course_id`, `place_id`, `day_number`, `order_index`, `distance_from_previous_km`, `visit_duration_minutes`                     | `travel_course_id` → `travel_courses.id`, `place_id` → `places.id`                                                                                                               | `/travel` 페이지 코스 상세                                            |
| **`travel_plans`**         | 사용자가 생성한 여행 계획 저장                        | 0개       | `id`, `user_id`, `title`, `destination`, `start_date`, `end_date`, `status`, `total_budget`                                                  | `user_id` → `auth.users.id`, `travel_days.travel_plan_id`, `budget_items.travel_plan_id`, `expenses.travel_plan_id`                                                              | `travel-service.ts`                                                   |
| **`travel_days`**          | 여행 계획의 각 일차 정보 저장                         | 0개       | `id`, `travel_plan_id`, `day_number`, `title`, `date`, `notes`                                                                               | `travel_plan_id` → `travel_plans.id`, `travel_day_places.travel_day_id`, `budget_items.travel_day_id`, `expenses.travel_day_id`                                                  | `travel-service.ts`                                                   |
| **`travel_day_places`**    | 각 일차에 방문할 장소와 순서 저장                     | 0개       | `id`, `travel_day_id`, `place_id`, `order_index`, `visit_time`, `notes`                                                                      | `travel_day_id` → `travel_days.id`, `place_id` → `places.id`                                                                                                                     | `travel-service.ts`                                                   |
| **`budget_items`**         | 여행 계획의 예산 항목 저장                            | 0개       | `id`, `travel_plan_id`, `travel_day_id`, `category`, `name`, `planned_amount`                                                                | `travel_plan_id` → `travel_plans.id`, `travel_day_id` → `travel_days.id`, `expenses.budget_item_id`                                                                              | `travel-service.ts`                                                   |
| **`expenses`**             | 여행 중 실제 지출 내역 저장                           | 0개       | `id`, `travel_plan_id`, `travel_day_id`, `budget_item_id`, `category`, `name`, `amount`, `expense_date`, `paid_by_user_id`, `receipt_url`    | `travel_plan_id` → `travel_plans.id`, `travel_day_id` → `travel_days.id`, `budget_item_id` → `budget_items.id`, `paid_by_user_id` → `auth.users.id`, `expense_splits.expense_id` | 예산 관리 기능 (향후 구현)                                            |
| **`expense_splits`**       | 커플 간 지출 분할 정보 저장                           | 0개       | `id`, `expense_id`, `user_id`, `amount`, `is_paid`, `paid_at`, `notes`                                                                       | `expense_id` → `expenses.id`, `user_id` → `auth.users.id`                                                                                                                        | 예산 분할 기능 (향후 구현)                                            |
| **`profiles`**             | 사용자 프로필 정보 저장                               | 2개       | `id`, `display_name`, `avatar_url`, `nickname`                                                                                               | `id` → `auth.users.id`                                                                                                                                                           | `/profile` 페이지, `couple-connection.tsx`                            |
| **`couples`**              | 두 사용자를 커플로 연결                               | 1개       | `id`, `user1_id`, `user2_id`, `status`                                                                                                       | `user1_id`, `user2_id` → `auth.users.id`, `shared_calendars.couple_id`                                                                                                           | `calendar-service.ts`                                                 |
| **`shared_calendars`**     | 커플 간 공유 캘린더 저장                              | 1개       | `id`, `couple_id`, `name`, `color`, `created_by`                                                                                             | `couple_id` → `couples.id`, `created_by` → `auth.users.id`, `calendar_events.calendar_id`                                                                                        | `calendar-service.ts`, `/calendar` 페이지                             |
| **`calendar_events`**      | 캘린더에 등록된 이벤트 저장                           | 3개       | `id`, `calendar_id`, `title`, `description`, `start_time`, `end_time`, `location`, `place_id`, `created_by`                                  | `calendar_id` → `shared_calendars.id`, `place_id` → `places.id`, `created_by` → `auth.users.id`                                                                                  | `calendar-service.ts`, `/calendar` 페이지                             |
| **`place_favorites`**      | 사용자가 즐겨찾기한 장소 저장                         | 0개       | `id`, `user_id`, `place_id`, `notes`                                                                                                         | `user_id` → `auth.users.id`, `place_id` → `places.id`                                                                                                                            | `recommendation-service.ts`                                           |
| **`push_subscriptions`**   | 사용자의 푸시 알림 구독 정보 저장                     | 1개       | `id`, `user_id`, `endpoint`, `p256dh`, `auth`                                                                                                | `user_id` → `auth.users.id`                                                                                                                                                      | `use-push-notifications.ts`, `/api/push/send/route.ts`                |
| **`contact_messages`**     | 사용자 문의 메시지 저장                               | 0개       | `id`, `name`, `email`, `subject`, `message`, `created_at`                                                                                    | 없음                                                                                                                                                                             | `/actions/contact.ts`                                                 |
| **`tour_api_sync`**        | 한국관광공사 Tour API 동기화 상태 추적                | 0개       | `id`, `area_code`, `sigungu_code`, `content_type_id`, `last_synced_at`, `total_items`, `synced_items`, `status`, `error_message`             | 없음                                                                                                                                                                             | 크롤러 패키지 (`packages/crawler`)                                    |
| **`crawler_runs`**         | 크롤러 실행 이력 및 통계 저장                         | 0개       | `id`, `started_at`, `completed_at`, `status`, `items_inserted`, `items_updated`, `items_errors`, `duration_seconds`, `error_message`, `logs` | 없음                                                                                                                                                                             | 크롤러 패키지 (`packages/crawler`)                                    |

---

## 📋 테이블별 상세 설명

### 1. `places` (장소 정보)

**용도**: 전국 관광지, 카페, 맛집, 문화시설 등의 장소 정보 저장

**데이터 수**: 42,192개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `name` (TEXT): 장소명
- `lat`, `lng` (NUMERIC): 위도/경도 좌표
- `type` (TEXT): 장소 유형 (`CAFE`, `FOOD`, `VIEW`, `MUSEUM`, `ETC`)
- `rating` (NUMERIC): 평점 (0-5)
- `price_level` (INTEGER): 가격대 (0-4)
- `description` (TEXT): 설명
- `image_url`, `image_url2` (TEXT): 이미지 URL
- `address` (TEXT): 주소
- `phone` (TEXT): 전화번호
- `area_code` (INTEGER): 지역 코드 (1:서울, 31:경기, 32:강원 등)
- `sigungu_code` (INTEGER): 시군구 코드
- `course_type` (ARRAY): 코스 타입 (`travel`, `date`)
- `tour_content_id` (TEXT): Tour API contentid (중복 방지용)
- `tour_content_type_id` (INTEGER): Tour API contenttypeid
- `category1`, `category2`, `category3` (TEXT): 카테고리 분류
- `overview` (TEXT): 상세 설명

**관계**:

- `travel_course_places.place_id` → `places.id`
- `travel_day_places.place_id` → `places.id`
- `place_favorites.place_id` → `places.id`
- `calendar_events.place_id` → `places.id`

**사용 위치**:

- `/travel`, `/date` 페이지에서 코스 생성
- 추천 시스템 (`recommendation-service.ts`)
- 캘린더 이벤트 연결

---

### 2. `travel_courses` (여행 코스 템플릿)

**용도**: 지역별 여행 코스 템플릿 저장 (1박2일 이상)

**데이터 수**: 11개 (지역별 1개씩)

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `title` (TEXT): 코스 제목 (예: "제주 여행 코스")
- `region` (TEXT): 지역명 (예: "제주", "서울")
- `course_type` (TEXT): 코스 타입 (`travel` 고정)
- `description` (TEXT): 코스 설명
- `image_url` (TEXT): 대표 이미지
- `place_count` (INTEGER): 포함된 장소 개수
- `duration` (TEXT): 여행 기간 (예: "1박2일", "5박6일")
- `area_code` (INTEGER): 지역 코드
- `total_distance_km` (NUMERIC): 총 이동 거리 (km)

**관계**:

- `travel_course_places.travel_course_id` → `travel_courses.id`

**사용 위치**:

- `/travel` 페이지에서 여행 코스 표시

---

### 3. `travel_course_places` (여행 코스별 장소)

**용도**: 여행 코스에 포함된 장소와 순서, 일차 정보 저장

**데이터 수**: 80개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `travel_course_id` (UUID): 여행 코스 ID
- `place_id` (UUID): 장소 ID
- `day_number` (INTEGER): 몇 일차인지 (1일차, 2일차 등)
- `order_index` (INTEGER): 하루 중 방문 순서
- `distance_from_previous_km` (NUMERIC): 이전 장소로부터의 거리 (km)
- `visit_duration_minutes` (INTEGER): 예상 체류 시간 (분)
- `notes` (TEXT): 메모

**관계**:

- `travel_course_id` → `travel_courses.id`
- `place_id` → `places.id`

**사용 위치**:

- `/travel` 페이지에서 코스 상세 정보 표시

---

### 4. `travel_plans` (여행 계획)

**용도**: 사용자가 생성한 여행 계획 저장

**데이터 수**: 0개 (현재 사용자 데이터 없음)

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `user_id` (UUID): 사용자 ID
- `title` (TEXT): 계획 제목
- `destination` (TEXT): 목적지
- `start_date`, `end_date` (DATE): 여행 시작일/종료일
- `status` (TEXT): 상태 (`planning`, `ongoing`, `completed`, `cancelled`)
- `total_budget` (NUMERIC): 총 예산
- `description` (TEXT): 설명

**관계**:

- `user_id` → `auth.users.id`
- `travel_days.travel_plan_id` → `travel_plans.id`
- `budget_items.travel_plan_id` → `travel_plans.id`
- `expenses.travel_plan_id` → `travel_plans.id`

**사용 위치**:

- `travel-service.ts`에서 여행 계획 관리

---

### 5. `travel_days` (여행 일차)

**용도**: 여행 계획의 각 일차 정보 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `travel_plan_id` (UUID): 여행 계획 ID
- `day_number` (INTEGER): 일차 (1일차, 2일차 등)
- `title` (TEXT): 일차 제목
- `date` (DATE): 날짜
- `notes` (TEXT): 메모

**관계**:

- `travel_plan_id` → `travel_plans.id`
- `travel_day_places.travel_day_id` → `travel_days.id`
- `budget_items.travel_day_id` → `travel_days.id`
- `expenses.travel_day_id` → `travel_days.id`

**사용 위치**:

- `travel-service.ts`에서 일차별 장소 관리

---

### 6. `travel_day_places` (일차별 장소)

**용도**: 각 일차에 방문할 장소와 순서 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `travel_day_id` (UUID): 여행 일차 ID
- `place_id` (UUID): 장소 ID
- `order_index` (INTEGER): 방문 순서
- `visit_time` (TIME): 방문 시간
- `notes` (TEXT): 메모

**관계**:

- `travel_day_id` → `travel_days.id`
- `place_id` → `places.id`

**사용 위치**:

- `travel-service.ts`에서 일차별 장소 추가/삭제

---

### 7. `budget_items` (예산 항목)

**용도**: 여행 계획의 예산 항목 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `travel_plan_id` (UUID): 여행 계획 ID
- `travel_day_id` (UUID): 여행 일차 ID (선택)
- `category` (TEXT): 카테고리 (`교통비`, `숙박비`, `식비`, `액티비티`, `쇼핑`, `기타`)
- `name` (TEXT): 항목명
- `planned_amount` (NUMERIC): 계획 금액

**관계**:

- `travel_plan_id` → `travel_plans.id`
- `travel_day_id` → `travel_days.id`
- `expenses.budget_item_id` → `budget_items.id`

**사용 위치**:

- `travel-service.ts`에서 예산 관리

---

### 8. `expenses` (실제 지출)

**용도**: 여행 중 실제 지출 내역 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `travel_plan_id` (UUID): 여행 계획 ID
- `travel_day_id` (UUID): 여행 일차 ID (선택)
- `budget_item_id` (UUID): 예산 항목 ID (선택)
- `category` (TEXT): 카테고리
- `name` (TEXT): 지출 항목명
- `amount` (NUMERIC): 금액
- `expense_date` (DATE): 지출 날짜
- `paid_by_user_id` (UUID): 결제한 사용자 ID
- `receipt_url` (TEXT): 영수증 이미지 URL
- `notes` (TEXT): 메모

**관계**:

- `travel_plan_id` → `travel_plans.id`
- `travel_day_id` → `travel_days.id`
- `budget_item_id` → `budget_items.id`
- `paid_by_user_id` → `auth.users.id`
- `expense_splits.expense_id` → `expenses.id`

**사용 위치**:

- 예산 관리 기능 (향후 구현 예정)

---

### 9. `expense_splits` (지출 분할)

**용도**: 커플 간 지출 분할 정보 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `expense_id` (UUID): 지출 ID
- `user_id` (UUID): 사용자 ID
- `amount` (NUMERIC): 분담 금액
- `is_paid` (BOOLEAN): 결제 여부
- `paid_at` (TIMESTAMPTZ): 결제 시각
- `notes` (TEXT): 메모

**관계**:

- `expense_id` → `expenses.id`
- `user_id` → `auth.users.id`

**사용 위치**:

- 예산 분할 기능 (향후 구현 예정)

---

### 10. `profiles` (사용자 프로필)

**용도**: 사용자 프로필 정보 저장

**데이터 수**: 2개

**주요 컬럼**:

- `id` (UUID): 사용자 ID (auth.users.id와 동일)
- `display_name` (TEXT): 표시 이름
- `avatar_url` (TEXT): 프로필 이미지 URL
- `nickname` (TEXT): 닉네임 (고유)

**관계**:

- `id` → `auth.users.id`

**사용 위치**:

- `/profile` 페이지
- `couple-connection.tsx`

---

### 11. `couples` (커플 연결)

**용도**: 두 사용자를 커플로 연결

**데이터 수**: 1개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `user1_id` (UUID): 첫 번째 사용자 ID
- `user2_id` (UUID): 두 번째 사용자 ID
- `status` (TEXT): 상태 (`active`, `inactive`, `pending`)

**관계**:

- `user1_id` → `auth.users.id`
- `user2_id` → `auth.users.id`
- `shared_calendars.couple_id` → `couples.id`

**사용 위치**:

- `calendar-service.ts`에서 커플 캘린더 관리

---

### 12. `shared_calendars` (공유 캘린더)

**용도**: 커플 간 공유 캘린더 저장

**데이터 수**: 1개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `couple_id` (UUID): 커플 ID
- `name` (TEXT): 캘린더 이름 (기본값: "우리 캘린더")
- `color` (TEXT): 캘린더 색상 (기본값: "#ff8fab")
- `created_by` (UUID): 생성자 ID

**관계**:

- `couple_id` → `couples.id`
- `created_by` → `auth.users.id`
- `calendar_events.calendar_id` → `shared_calendars.id`

**사용 위치**:

- `calendar-service.ts`
- `/calendar` 페이지

---

### 13. `calendar_events` (캘린더 이벤트)

**용도**: 캘린더에 등록된 이벤트 저장

**데이터 수**: 3개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `calendar_id` (UUID): 캘린더 ID
- `title` (TEXT): 이벤트 제목
- `description` (TEXT): 설명
- `start_time`, `end_time` (TIMESTAMPTZ): 시작/종료 시각
- `location` (TEXT): 장소
- `place_id` (UUID): 장소 ID (선택)
- `created_by` (UUID): 생성자 ID

**관계**:

- `calendar_id` → `shared_calendars.id`
- `place_id` → `places.id`
- `created_by` → `auth.users.id`

**사용 위치**:

- `calendar-service.ts`
- `/calendar` 페이지

---

### 14. `place_favorites` (장소 즐겨찾기)

**용도**: 사용자가 즐겨찾기한 장소 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `user_id` (UUID): 사용자 ID
- `place_id` (UUID): 장소 ID
- `notes` (TEXT): 메모

**관계**:

- `user_id` → `auth.users.id`
- `place_id` → `places.id`

**사용 위치**:

- `recommendation-service.ts`에서 즐겨찾기 기반 추천

---

### 15. `push_subscriptions` (푸시 알림 구독)

**용도**: 사용자의 푸시 알림 구독 정보 저장

**데이터 수**: 1개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `user_id` (UUID): 사용자 ID
- `endpoint` (TEXT): 푸시 서비스 엔드포인트
- `p256dh` (TEXT): 공개 키
- `auth` (TEXT): 인증 키

**관계**:

- `user_id` → `auth.users.id`

**사용 위치**:

- `use-push-notifications.ts`
- `/api/push/send/route.ts`

---

### 16. `contact_messages` (문의 메시지)

**용도**: 사용자 문의 메시지 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `name` (TEXT): 이름
- `email` (TEXT): 이메일
- `subject` (TEXT): 제목
- `message` (TEXT): 메시지 내용

**사용 위치**:

- `/actions/contact.ts`에서 문의 폼 처리

---

### 17. `tour_api_sync` (Tour API 동기화)

**용도**: 한국관광공사 Tour API 동기화 상태 추적

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `area_code` (INTEGER): 지역 코드
- `sigungu_code` (INTEGER): 시군구 코드
- `content_type_id` (INTEGER): 콘텐츠 타입 ID
- `last_synced_at` (TIMESTAMPTZ): 마지막 동기화 시각
- `total_items` (INTEGER): 전체 아이템 수
- `synced_items` (INTEGER): 동기화된 아이템 수
- `status` (TEXT): 상태 (`pending`, `syncing`, `completed`, `failed`)
- `error_message` (TEXT): 에러 메시지

**사용 위치**:

- 크롤러 패키지 (`packages/crawler`)

---

### 18. `crawler_runs` (크롤러 실행 기록)

**용도**: 크롤러 실행 이력 및 통계 저장

**데이터 수**: 0개

**주요 컬럼**:

- `id` (UUID): 고유 식별자
- `started_at` (TIMESTAMPTZ): 시작 시각
- `completed_at` (TIMESTAMPTZ): 완료 시각
- `status` (TEXT): 상태 (`running`, `completed`, `failed`)
- `items_inserted` (INTEGER): 삽입된 아이템 수
- `items_updated` (INTEGER): 업데이트된 아이템 수
- `items_errors` (INTEGER): 에러 발생 아이템 수
- `duration_seconds` (NUMERIC): 실행 시간 (초)
- `error_message` (TEXT): 에러 메시지
- `logs` (ARRAY): 로그 배열

**사용 위치**:

- 크롤러 패키지 (`packages/crawler`)

---

## 테이블 관계도

```
auth.users
  ├── profiles (1:1)
  ├── couples (user1_id, user2_id)
  ├── travel_plans
  │   ├── travel_days
  │   │   └── travel_day_places → places
  │   ├── budget_items
  │   └── expenses
  │       └── expense_splits → auth.users
  ├── place_favorites → places
  └── push_subscriptions

couples
  └── shared_calendars
      └── calendar_events → places

travel_courses
  └── travel_course_places → places
```

---

## 주요 인덱스

### `places` 테이블

- `area_code`, `sigungu_code`: 지역별 조회 최적화
- `type`: 장소 유형별 필터링
- `rating`: 평점 순 정렬

### `travel_courses` 테이블

- `region`: 지역별 조회
- `area_code`: 지역 코드별 조회

### `travel_course_places` 테이블

- `travel_course_id`, `day_number`, `order_index`: 코스별 일차 순서 조회

---

## RLS (Row Level Security) 정책

모든 테이블에 RLS가 활성화되어 있으며, 기본 정책은 다음과 같습니다:

- **읽기**: 대부분의 테이블은 모든 사용자가 읽기 가능
- **쓰기**: 인증된 사용자만 자신의 데이터를 생성/수정 가능
- **삭제**: 소유자만 삭제 가능

---

## 참고 사항

1. **삭제된 테이블**: `courses`, `course_places` 테이블은 이전에 삭제되었습니다. 현재는 `travel_courses`와 `travel_course_places`를 사용합니다.

2. **데이트 코스**: 데이트 코스는 현재 클라이언트 사이드에서 동적으로 생성됩니다. DB에 별도 테이블이 없습니다. `places` 테이블의 42,192개 장소를 활용하여 각 지역별로 최대 10개의 코스를 생성할 수 있습니다 (예: 서울 632개 코스, 경기 1,172개 코스 가능).

3. **여행 코스**: 여행 코스는 `travel_courses` 테이블에 저장되어 있으며, 거리 기반 최적 경로 알고리즘으로 생성되었습니다. 현재는 각 지역별로 1개씩 총 11개가 저장되어 있지만, `places` 테이블의 데이터를 활용하면 각 지역별로 수백 개의 코스를 생성할 수 있습니다 (예: 경기 1,172개, 강원 796개, 서울 632개 코스 가능).

4. **Tour API 연동**: `places` 테이블의 대부분 데이터는 한국관광공사 Tour API에서 크롤링되었습니다.
