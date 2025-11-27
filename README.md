# 💕 LOVETRIP - 커플 여행 추천 서비스

> 연인과의 여행을 위해 교통편, 숙소, 데이트 장소, 경비를 한 번에 추천해주는 커플 맞춤 여행 서비스

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)

## 📋 목차

- [서비스 개요](#서비스-개요)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [기술 스택](#기술-스택)
- [데이터베이스 구조](#데이터베이스-구조)

## 🎯 서비스 개요

### 핵심 가치

- **공동 여행 설계 툴**: 연인이 함께 사용할 수 있는 협업형 여행 계획 도구
- **맞춤 데이트 코스 제안**: "시간·예산·분위기" 기준에 맞춘 AI 기반 추천 시스템
- **올인원 플랫폼**: 여행 계획부터 추억 저장(앨범, 지출 기록)까지 모든 기능 제공

### 타깃 고객

- 20~30대 커플 (국내 단기 여행, 기념일 여행, 깜짝 여행)
- 장거리 연애 중 정기적으로 여행을 계획하는 연인
- 특별한 날(생일, 기념일, 발렌타인데이) 이벤트 여행을 준비하는 사용자

### 해결하는 문제

1. ❌ **경비 계산·분담의 번거로움** → ✅ 자동 예산 관리 및 1/N 정산 기능
2. ❌ **여러 사이트를 오가며 검색해야 하는 불편** → ✅ 교통편+숙소+데이트 장소 통합 추천
3. ❌ **분위기 좋은 장소 찾기의 어려움** → ✅ 커플 맞춤형 테마 코스 제공

## ✨ 주요 기능

### 1. 여행 추천 & 일정 플래너

- 출발지, 목적지, 예산, 일정 입력 시 → 최적 교통편+숙소+데이트 코스 자동 생성
- Tour API 기반 실시간 관광 정보 제공
- 네이버 지도 통합으로 직관적인 코스 확인

### 2. 데이트 장소 큐레이션

- 지역별 **분위기 좋은 카페, 레스토랑, 야경 명소, 전시회, 드라이브 코스** 추천
- "연인용"으로 필터링된 장소 정보 제공 (포토존, 프라이빗 공간 등)
- 테마별 추천: 로맨틱, 힐링, 액티브, 기념일, 야경, 카페투어

### 3. 예산/경비 관리

- 예상 경비 자동 산출 (교통, 숙소, 식사, 입장료 포함)
- 커플 지출 내역 기록 & 1/N 정산 기능
- 예산 초과 시 대안 코스 제안
- 영수증 촬영으로 자동 지출 기록

### 4. 게이미피케이션

- 레벨 시스템 및 경험치(XP) 획득
- 업적/배지 시스템
- 포인트 및 연속 기록(스트릭) 추적
- 여행 완료 시 보상 제공

### 5. 커플 전용 기능

- 커플 연결 및 공동 캘린더
- 여행 일정 공유
- 비용 분할 및 청산 추적
- 즐겨찾기 장소 공유

## 📁 프로젝트 구조

이 프로젝트는 **pnpm workspace**를 사용한 모노레포 구조입니다.

```
love-trip/
├── apps/
│   └── web/              # Next.js 웹 애플리케이션
│       ├── src/          # 소스 코드
│       │   ├── app/      # App Router 페이지
│       │   ├── components/  # React 컴포넌트
│       │   └── lib/      # 유틸리티 및 서비스
│       ├── public/       # 정적 파일
│       ├── package.json
│       ├── next.config.mjs
│       └── tsconfig.json
├── packages/
│   ├── crawler/          # Tour API 크롤러
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── tour-api-client.ts    # Tour API 클라이언트
│   │   │   │   └── supabase-client.ts    # Supabase 연동
│   │   │   ├── sync.ts                   # 동기화 스크립트
│   │   │   └── index.ts                  # 진입점
│   │   └── package.json
│   └── shared/           # 공유 타입 및 유틸리티
│       └── src/
│           └── types/
│               └── index.ts
├── pnpm-workspace.yaml   # Workspace 설정
└── package.json          # 루트 패키지 설정
```

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase 프로젝트
- Tour API 키 (공공데이터포털에서 발급)
- 네이버 클라우드 플랫폼 지도 API 키

### 1. 저장소 클론

```bash
git clone <repository-url>
cd love-trip
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

#### 환경 변수 파일 위치

이 프로젝트는 **루트 프로젝트의 `.env.local` 파일을 공유**하도록 설정되어 있습니다.

**방법 1: 루트에 `.env.local` 생성 (권장)**

- 루트 디렉토리(`/love-trip/.env.local`)에 환경 변수를 설정하면 `apps/web`에서 자동으로 로드됩니다.

**방법 2: 각 패키지에 개별 설정**

- `apps/web/.env.local`에 설정하면 해당 앱에서만 사용됩니다.
- 루트의 `.env.local`이 있으면 우선적으로 로드됩니다.

#### 웹 앱 환경 변수

루트 디렉토리 또는 `apps/web` 디렉토리에 `.env.local` 파일을 생성하세요:

```env
# Supabase 설정 (필수)
# Supabase 대시보드 > 프로젝트 설정 > API에서 확인
# https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth 설정 (선택사항)
NEXTAUTH_URL=http://localhost:3000
# openssl rand -base64 32 명령어로 생성 가능
NEXTAUTH_SECRET=your_nextauth_secret_key

# 네이버 지도 API (필수)
# 네이버 클라우드 플랫폼에서 발급
# https://www.ncloud.com/product/applicationService/maps
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id

# VAPID 키 (푸시 알림용, 선택사항)
# scripts/generate-vapid-keys.js 실행하여 생성
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com

# MSW (Mock Service Worker) 설정 (개발 환경용, 선택사항)
# 개발 환경에서 MSW 모킹 활성화 여부
# true: MSW 활성화 (모킹 데이터 사용)
# false: MSW 비활성화 (실제 API 사용)
# 설정하지 않으면 MSW 비활성화 (기본값)
NEXT_PUBLIC_ENABLE_MSW=true
```

> ⚠️ **중요**: `.env.local` 파일은 Git에 커밋하지 마세요. 실제 값으로 채워야 앱이 정상 작동합니다.

#### MSW (Mock Service Worker) 설정

개발 환경에서 API 모킹을 사용하려면 `NEXT_PUBLIC_ENABLE_MSW` 환경 변수를 설정하세요:

- **`NEXT_PUBLIC_ENABLE_MSW=true`**: MSW 활성화 (모킹 데이터 사용)
- **`NEXT_PUBLIC_ENABLE_MSW=false`**: MSW 비활성화 (실제 Supabase API 사용)
- **설정하지 않음**: MSW 비활성화 (기본값)

MSW가 활성화되면 `src/mocks/handlers.ts`에 정의된 모킹 데이터가 사용됩니다. 브라우저 콘솔에서 `[MSW] Mock Service Worker가 활성화되었습니다.` 메시지를 확인할 수 있습니다.

> ⚠️ **참고**: 환경 변수 변경 후에는 개발 서버를 재시작해야 합니다.

#### Supabase 커스텀 SMTP 설정 (선택사항)

이메일 인증을 위해 커스텀 SMTP를 설정할 수 있습니다. 자세한 설정 방법은 [SMTP 설정 가이드](./docs/SMTP_SETUP.md)를 참조하세요.

**빠른 설정:**

1. Supabase Dashboard → Settings → Auth → SMTP Settings
2. Enable Custom SMTP 활성화
3. SMTP 정보 입력 (SendGrid, Mailgun, Amazon SES 등)
4. 이메일 템플릿 커스터마이징 (선택사항)

#### 크롤러 환경 변수

`packages/crawler` 디렉토리에 `.env` 파일을 생성하세요:

```env
# Tour API 설정 (필수)
# 공공데이터포털에서 발급: https://www.data.go.kr/
TOUR_API_KEY=your_tour_api_key_here
TOUR_API_BASE_URL=https://apis.data.go.kr/B551011/KorService2

# Supabase 설정 (필수)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 크롤러 설정 (선택사항)
BATCH_SIZE=100
DELAY_MS=1000
```

### 4. 데이터베이스 마이그레이션

Supabase MCP를 사용하여 데이터베이스 스키마를 생성합니다. (이미 완료됨)

### 5. Tour API 데이터 동기화

```bash
# 데이트 장소 및 여행 장소 동기화 (권장)
pnpm --filter crawler sync:date-travel

# 또는 전체 동기화
pnpm crawler
```

> **참고**: `sync:date-travel` 스크립트는 Tour API를 사용하여 데이트 장소와 여행 장소를 구분하여 저장합니다.

### 6. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🛠 기술 스택

### Frontend

- **Next.js 15.2.4** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Radix UI** - 접근성 있는 UI 컴포넌트
- **Framer Motion** - 애니메이션
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### Backend & Database

- **Supabase** - 백엔드 및 데이터베이스
  - PostgreSQL 데이터베이스
  - Row Level Security (RLS)
  - 실시간 구독
  - 인증 시스템

### External APIs

- **Tour API** - 한국관광공사 관광 정보 API
- **네이버 지도 API** - 지도 및 장소 검색

### 개발 도구

- **pnpm** - 패키지 매니저 (모노레포 지원)
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅
- **TypeScript** - 타입 체크

## 🗄 데이터베이스 구조

### 주요 테이블

- **travel_plans** - 여행 계획 메인 테이블
- **travel_days** - 여행 일자별 정보
- **places** - 관광지 정보 (Tour API 데이터)
- **travel_day_places** - 일자별 방문 장소 (다대다 관계)
- **budget_items** - 예산 항목
- **expenses** - 실제 지출 내역
- **expense_splits** - 비용 분할 (커플 간)
- **couples** - 커플 정보
- **place_favorites** - 즐겨찾기 장소

### 보안

- Row Level Security (RLS) 활성화
- 사용자는 자신의 데이터만 접근 가능
- 커플 간 데이터 공유 정책 적용

자세한 내용은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

## 📝 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 크롤러 실행 (Tour API 데이터 수집)
pnpm crawler

# 데이트 장소 및 여행 장소 동기화 (Tour API)
pnpm --filter crawler sync:date-travel

# 린트
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 타입 체크
pnpm type-check

# 테스트 실행
pnpm --filter web test

# 테스트 UI 실행
pnpm --filter web test:ui

# 코드 포맷팅
pnpm format
```

## 🔑 API 키 발급

### Tour API

1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. [Tour API](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15101578) 신청
3. 발급받은 API 키를 환경 변수에 설정

### 네이버 지도 API

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 회원가입
2. AI·NAVER 서비스 > AI·NAVER API > Maps 선택
3. Application 등록 및 Client ID 발급
4. 발급받은 Client ID를 환경 변수에 설정

## 🎨 주요 기능 상세

### 추천 시스템

- **커플 맞춤 추천**: 두 사용자의 선호도를 분석하여 최적의 장소 추천
- **테마별 추천**: 로맨틱, 힐링, 액티브, 기념일, 야경, 카페투어
- **지역별 추천**: 선택한 지역의 인기 장소 추천
- **즐겨찾기 기반 추천**: 사용자가 좋아하는 장소와 유사한 장소 추천

### 비용 관리

- 예산 계획 및 실제 지출 추적
- 카테고리별 지출 분석
- 커플 간 비용 분할 및 청산
- 예산 달성률 시각화

### 게이미피케이션

- 레벨 시스템: 여행 완료 시 경험치 획득
- 업적 시스템: 다양한 목표 달성 시 배지 획득
- 포인트 시스템: 활동에 따른 포인트 적립
- 연속 기록: 매일 로그인 시 스트릭 유지

## 🤝 기여하기

이 프로젝트는 개인 프로젝트입니다. 버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 📄 라이선스

Private - All rights reserved

## 🔗 관련 문서

- [아키텍처 문서](./ARCHITECTURE.md)
- [마이그레이션 요약](./MIGRATION_SUMMARY.md)
- [크롤러 README](./packages/crawler/README.md)

---

**Made with 💕 for couples**
