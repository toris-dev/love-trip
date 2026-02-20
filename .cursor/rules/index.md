# LOVETRIP 프로젝트 Cursor 규칙

이 디렉터리의 규칙은 이 저장소(love-trip)에 맞춘 코딩·구조 가이드입니다.  
작성·리팩터·리뷰 시 아래 규칙을 우선 적용하세요.

## 규칙 목록

| 파일 | 내용 |
|------|------|
| [monorepo.md](./monorepo.md) | 모노레포 구조, pnpm workspace, `apps/` vs `packages/`, `@lovetrip/*` 사용 |
| [fsd.md](./fsd.md) | FSD(Feature-Sliced Design), app → features → shared, 기능 슬라이스 구조 |
| [nextjs.md](./nextjs.md) | Next.js 16 App Router, RSC/RCC, params/searchParams Promise, API Routes |
| [supabase.md](./supabase.md) | Supabase 클라이언트/서버 구분, RLS, 마이그레이션, 타입 생성, 보안 |
| [commit-convention.md](./commit-convention.md) | Git 커밋 메시지 형식 (Google 스타일), 타입·범위·제목·본문·푸터 |

## 적용 우선순위

1. **모노레포**: 새 패키지·앱 추가, 패키지 간 의존성은 `monorepo.md` 준수.
2. **FSD**: 웹 앱 내 새 기능·컴포넌트 위치·의존성 방향은 `fsd.md` 준수.
3. **Next.js**: 라우팅, 데이터 페칭, Server/Client 구분, params/searchParams 문법은 `nextjs.md` 준수.
4. **Supabase**: DB 접근, 인증, 마이그레이션, 타입 생성은 `supabase.md` 준수.
5. **커밋**: 모든 커밋 메시지는 `commit-convention.md` 형식(타입(범위): 제목) 준수.

이 규칙과 충돌하는 기존 코드가 있으면, 변경 범위가 작을 때 규칙에 맞게 점진적으로 정리하는 것을 권장합니다.
