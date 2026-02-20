# packages 구조 점검 보고서

**최종 반영**: `utils` 패키지 제거 후 `shared`로 통합 완료 (패키지 11개).

## 1인 개발 시 원칙

**결제/AI 등 기능이 생길 때마다 packages에 도메인 패키지를 새로 만드는 건 1인 개발에는 부담이 될 수 있습니다.**

- **새 패키지 추가는 최소화**: 새 기능(결제, AI 추천, 알림 등)은 우선 **기존 패키지**나 **apps/web** 안에 두고, 코드가 많아지거나 여러 앱에서 쓸 때만 패키지로 분리하는 편이 좋습니다.
- **현재 구조**: 이미 `subscription`, `recommendation`, `gamification` 등이 패키지로 있는 상태이므로, 당장 통합하지 않고 **앞으로 추가되는 기능**부터 위 원칙을 적용하면 됩니다.
- **선택적 통합**: 부담이 느껴지면 `subscription` + `recommendation` + `gamification` 을 하나의 `@lovetrip/features`(또는 `premium`) 패키지로 묶어서 “부가 기능”을 한 곳에서 관리하는 방식도 가능합니다.

---

## 현재 패키지 현황 (11개)

| 패키지 | 파일 수(ts/tsx) | 의존 패키지 | 용도 |
|--------|-----------------|-------------|------|
| **shared** | 15 | clsx, tailwind-merge, zod | 타입, 스키마, 상수, 유틸(cn, formatDate 등) |
| **api** | 10 | shared | Supabase 클라이언트, 외부 API 래퍼 |
| **ui** | 37 | shared | shadcn 기반 공유 UI 컴포넌트 |
| **gamification** | 2 | api, shared | XP/보상 서비스 (reward-service) |
| **subscription** | 6 | api, shared | 구독·프리미엄 기능 체크 |
| **recommendation** | 5 | api, shared | AI 추천 (getCoupleRecommendations 등) |
| **expense** | 8 | api, shared, **planner** | 예산·경비·정산 서비스 |
| **couple** | 19 | api, shared, ui | 캘린더·기념일·예약 서비스 + 컴포넌트 |
| **planner** | 24 | api, shared, ui, gamification | 여행 계획·장소·메모리·user-course |
| **user** | 22 | api, ui | 인증·프로필 훅/컴포넌트 |
| **admin** | 8 | (없음, Express 앱) | 운영/모니터링 전용 서버 (별도 앱) |

- **apps/web** 는 위 패키지 중 **admin 제외** 전부 의존.

---

## 발견 사항

### 1. utils vs shared/utils 중복

- **packages/utils**: `cn`, `formatDate`, `formatCurrency`, `calculateTotal` 제공.  
  - 실제 사용처: **`cn`만** 사용 (ui 전부 + web 1곳).  
  - `formatDate` / `formatCurrency` / `calculateTotal` 는 **다른 패키지에서 import되지 않음**.
- **packages/shared/utils**: 동일한 이름의 함수들 + `cn` 존재.  
  - 단, **shared/package.json 에 clsx, tailwind-merge 없음** → shared에서 `cn` 사용 시 런타임 에러 가능.  
  - 코드베이스에서는 `@lovetrip/shared`에서 format 유틸을 쓰는 곳이 없고, 문서/README 에만 등장.

**결론**: 유틸이 두 곳에 나뉘어 있고, 실제 사용은 `cn` 위주이므로 **한 곳으로 통합**하는 것이 좋음.

### 2. 패키지가 매우 작은 경우

- **gamification**: ts 파일 2개 (reward-service 등).  
  - 역할이 명확(보상/XP)하고 planner·web 에서 사용 → **유지 권장**. 필요 시 “매우 작은 도메인 패키지”로 문서화.
- **recommendation** (5), **subscription** (6):  
  - 도메인 경계가 다름(추천 vs 구독). **분리 유지**가 적절.

### 3. 의존성 방향

- **expense → planner**: 여행 계획에 예산이 묶이는 구조라 **자연스러움**.  
- **planner → gamification**: 코스 공개/상호작용 보상 등 → **적절**.  
- **couple / user** 가 api, shared, ui 에만 의존 → **순환 없음**.

### 4. admin 패키지

- **이름**: `@love-trip/admin` (하이픈). 나머지는 `@lovetrip/*`.  
- **역할**: Express 기반 별도 서버. web 과 패키지 의존성 없음.  
- **권장**: 네이밍을 `@lovetrip/admin` 으로 통일하거나, “운영용 독립 앱”으로 README 등에 명시.

---

## 권장 조치

### 우선 적용 권장: utils 제거 후 shared 로 통합

1. **shared**  
   - `packages/shared/package.json` 에 `clsx`, `tailwind-merge` 추가.  
   - 이미 있는 `shared/utils` 의 `cn` 시그니처를 **현재 packages/utils 와 동일**하게 맞춤 (필요 시).  
   - `formatDate` / `formatCurrency` / `calculateTotal` 는 shared/utils 에만 두고, 시그니처는 기존 utils 와 호환되도록 정리.

2. **ui**  
   - `@lovetrip/utils` → `@lovetrip/shared` 로 변경.  
   - `cn` (및 필요 시 format 유틸) 은 `@lovetrip/shared` 에서만 import.

3. **apps/web**  
   - `@lovetrip/utils` 의존 제거.  
   - `cn` 사용처가 있다면 `@lovetrip/shared` 로 변경.

4. **packages/utils**  
   - 위 변경 반영 후 **패키지 삭제**.  
   - pnpm-workspace 는 `packages/*` 이므로 자동으로 제외됨.

**효과**: 패키지 수 12 → 11, 유틸 중복 제거, “스타일/포맷 유틸은 shared” 로 일원화.

### 선택 사항

- **gamification**: 그대로 두고, README 또는 `.cursor/rules/monorepo.md` 에 “도메인은 작지만 보상/XP 로 경계가 명확한 패키지” 로 한 줄 설명 추가.
- **admin**:  
  - `package.json` name 을 `@lovetrip/admin` 으로 변경하거나,  
  - docs 에 “운영/모니터링 전용 Express 앱, 웹/패키지와 의존성 없음” 명시.

---

## 통합하지 않는 것이 좋은 것 (팀/대규모 기준)

- **expense + planner**: 서비스 경계가 다르므로 분리 유지가 유리.
- **couple + planner**: 캘린더/기념일 vs 여행 일정으로 역할이 다름 → 분리 유지.

**1인 개발이라 부담되면**: `subscription` + `recommendation` + `gamification` 을 하나의 `features`(또는 `premium`) 패키지로 묶어서 관리해도 됨.

---

## 요약

| 항목 | 권장 |
|------|------|
| **utils** | ✅ 제거 후 **shared** 로 통합 완료 |
| **새 기능(결제/AI 등)** | **패키지 추가 지양** → 기존 패키지 또는 apps/web 에 먼저 구현, 필요 시만 분리 |
| **gamification / recommendation / subscription** | 현재 구조 유지. 부담 시 세 개를 하나로 통합 검토 |
| **expense / planner / couple / user** | 유지 |
| **admin** | 네이밍 통일 또는 문서화 |

1인 개발에서는 “도메인마다 패키지”보다 **필요할 때만 패키지**를 두는 쪽을 권장합니다.
