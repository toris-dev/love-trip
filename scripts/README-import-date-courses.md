# 데이트 코스 JSON 임포트 가이드

Claude API로 생성한 JSON 파일의 데이트 코스 데이터를 Supabase DB에 삽입하는 스크립트입니다.

## 사용법

### 1. JSON 파일 준비

Claude API로 생성한 JSON 파일을 준비합니다. 파일 형식은 다음과 같습니다:

```json
{
  "date_courses": [
    {
      "title": "강남 로맨틱 데이트 코스",
      "region": "서울",
      "course_type": "date",
      "description": "강남의 분위기 좋은 카페와 맛집을 돌아보는 로맨틱한 데이트 코스입니다.",
      "duration": "반나절",
      "place_count": 4,
      "area_code": 1,
      "sigungu_code": 11680,
      "sigungu_name": "강남구",
      "total_distance_km": 5.2,
      "max_distance_km": 10,
      "places": [
        {
          "name": "카페 이름",
          "type": "CAFE",
          "order_index": 0,
          "visit_duration_minutes": 60,
          "distance_from_previous_km": 0,
          "notes": "브런치 타임에 방문 추천"
        }
      ]
    }
  ]
}
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정합니다:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 네이버 API 설정 (선택, 장소 자동 생성에 사용)
NEXT_PUBLIC_NAVER_DEV_CLIENT_ID=your_naver_client_id
NEXT_PUBLIC_NAVER_DEV_CLIENT_SECRET=your_naver_client_secret
```

또는 루트 디렉토리의 `.env` 파일에 설정할 수 있습니다.

**참고**: 네이버 API 키가 없어도 스크립트는 실행되지만, DB에 없는 장소는 자동으로 생성할 수 없습니다. 네이버 API 키를 설정하면 장소를 자동으로 검색하여 생성합니다.

### 3. 스크립트 실행

```bash
# 방법 1: pnpm 스크립트 사용
pnpm import:date-courses <json-file-path>

# 방법 2: tsx 직접 사용
pnpm tsx scripts/import-date-courses-from-json.ts <json-file-path>

# 예시
pnpm import:date-courses ./date-courses.json
pnpm import:date-courses ./scripts/date-courses-example.json
```

## 동작 방식

1. **JSON 파일 읽기**: 지정한 JSON 파일을 읽고 파싱합니다.
2. **장소 ID 찾기**: 각 장소의 이름으로 `places` 테이블에서 실제 `place_id`를 찾습니다.
   - 정확히 일치하는 장소를 우선 선택합니다.
   - 없으면 유사한 이름의 장소를 찾습니다.
   - **DB에 없는 경우**: 네이버 API로 장소를 검색하여 좌표를 가져온 후 `places` 테이블에 자동으로 생성합니다.
3. **코스 삽입**: `date_courses` 테이블에 코스 정보를 삽입합니다.
4. **장소 연결**: `date_course_places` 테이블에 장소들을 순서대로 연결합니다.
5. **결과 확인**: 성공/실패 개수를 출력합니다.

## 주의사항

- **장소 자동 생성**: DB에 없는 장소는 네이버 API를 사용하여 자동으로 생성됩니다. 네이버 API 키가 없으면 장소를 찾을 수 없어 건너뜁니다.
- **지역 코드**: `area_code`가 정확해야 장소 검색이 더 정확해집니다.
- **중복 방지**: 같은 제목의 코스가 이미 존재하면 중복 삽입될 수 있습니다.
- **트랜잭션**: 코스 삽입 후 장소 연결에 실패하면 코스가 자동으로 삭제됩니다.
- **API 호출 제한**: 네이버 API 호출 제한을 고려하여 장소 생성 시 200ms 딜레이가 있습니다.

## 예시 출력

```
📂 JSON 파일 읽기: /path/to/date-courses.json

📊 총 5개의 데이트 코스를 발견했습니다.
============================================================

[1/5]
📝 코스 삽입 중: 강남 로맨틱 데이트 코스
   ✓ 코스 생성 완료 (ID: abc-123-def)
   ℹ️  "카페 이름" → "강남 카페" (유사 매칭)
   ✓ 4개 장소 삽입 완료

[2/5]
📝 코스 삽입 중: 홍대 힐링 데이트 코스
   ✓ 코스 생성 완료 (ID: xyz-456-ghi)
   ⚠️  장소를 찾을 수 없습니다: 존재하지 않는 카페
   ⚠️  장소 "존재하지 않는 카페"를 찾을 수 없어 건너뜁니다.
   ✓ 3개 장소 삽입 완료

============================================================

✅ 완료!
   성공: 4개
   실패: 1개
   총: 5개
```

## 문제 해결

### 장소를 찾을 수 없는 경우

- JSON 파일의 장소 이름이 DB에 실제로 존재하는지 확인하세요.
- `area_code`가 올바른지 확인하세요.
- 장소 이름에 오타가 없는지 확인하세요.

### 환경 변수 오류

- `.env.local` 또는 루트 `.env` 파일에 환경 변수가 설정되어 있는지 확인하세요.
- `SUPABASE_SERVICE_ROLE_KEY`는 서비스 롤 키여야 합니다 (anon key가 아님).

### JSON 파싱 오류

- JSON 파일 형식이 올바른지 확인하세요.
- `date_courses` 배열이 존재하는지 확인하세요.
