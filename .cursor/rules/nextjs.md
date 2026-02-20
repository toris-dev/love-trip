# Next.js 규칙 (App Router, Next 16)

이 프로젝트는 **Next.js 16 App Router**를 사용합니다.

## App Router 구조

- **app/** — 라우트, 레이아웃, 로딩, 에러.
- **동적 라우트**: `app/[segment]/` 또는 `app/[segment]/[id]/`.
- **병렬 라우트**: `app/@modal/` 사용 (인터셉팅/모달 등).

## Server Components vs Client Components

- **기본은 Server Component.** 데이터 페칭, 서버 전용 로직은 RSC에서.
- **클라이언트 상호작용**이 필요할 때만 `"use client"` 사용 (useState, useEffect, 이벤트, 브라우저 API, Context 등).
- **패턴**: 페이지(`page.tsx`)에서 데이터 페칭 후, 클라이언트용 컴포넌트에 props로 전달.

```ts
// app/feature/page.tsx (Server Component)
export default async function FeaturePage() {
  const data = await fetchData()
  return <FeaturePageClient data={data} />
}
```

```ts
// components/features/feature/feature-page-client.tsx
"use client"
export function FeaturePageClient({ data }: { data: Data }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (/* ... */)
}
```

- **네이밍**: 클라이언트 전용 페이지 래퍼는 `*-page-client.tsx` 권장.

## 라우트 핸들러

- **params / searchParams**: Next 16에서는 **Promise**로 전달됨. async에서 await 후 사용.

```ts
// app/[id]/page.tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { id } = await params
  const { q } = await searchParams
  // ...
}
```

```ts
// app/api/.../route.ts
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ...
}
```

## 레이아웃·로딩·에러

- **layout.tsx** — 공통 레이아웃, `{children}` 및 `@modal` 등 슬롯.
- **loading.tsx** — 해당 세그먼트 로딩 UI (Suspense 경계).
- **error.tsx** — 해당 세그먼트 에러 UI (필요 시 "use client").

## API Routes

- **app/api/** 아래에 `route.ts`로 GET/POST 등 export.
- 인증 필요 시 세션/토큰 검사 후 처리.
- 서버 전용이므로 `@lovetrip/api` 등 패키지에서 Supabase 서버 클라이언트 사용.

## 이미지·메타데이터

- `next/image` 사용.
- 메타데이터는 `app/layout.tsx` 또는 각 `page.tsx`의 `export const metadata` / `generateMetadata`.

## 금지·주의

- Server Component에서 `localStorage`, `window`, 이벤트 핸들러 직접 사용 금지.
- Client Component에서 Server Component를 import 하지 않기 (자식으로만 사용 가능).
- Server → Client로 넘기는 props는 **직렬화 가능**해야 함 (함수, 클래스 인스턴스 등 불가).
