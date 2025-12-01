# 배포 가이드

LOVETRIP 프로젝트의 배포 전략과 절차를 안내합니다.

## 배포 전략

이 프로젝트는 Next.js 15를 사용하며, 다음과 같은 최적화 기능을 활용합니다:

- **Edge Functions**: 빠른 응답을 위한 Edge Runtime
- **ISR (Incremental Static Regeneration)**: 정적 페이지의 점진적 재생성
- **ISG (Incremental Static Generation)**: 정적 페이지 생성
- **Lazy Loading**: 코드 스플리팅 및 동적 임포트
- **PWA**: Progressive Web App 지원

## 배포 환경

### Vercel (권장)

Vercel은 Next.js의 공식 호스팅 플랫폼으로, 최적의 성능을 제공합니다.

#### 배포 절차

1. **Vercel 프로젝트 생성**
   ```bash
   # Vercel CLI 설치
   npm i -g vercel

   # 배포
   vercel
   ```

2. **환경 변수 설정**
   - Vercel 대시보드에서 환경 변수 설정
   - 필수 환경 변수:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
     - `VAPID_PRIVATE_KEY`
     - `VAPID_SUBJECT`

3. **빌드 설정**
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

#### Vercel 설정 파일

프로젝트 루트에 `vercel.json`을 생성할 수 있습니다:

```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

### 다른 플랫폼

#### Docker 배포

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
```

## 빌드 최적화

### Edge Functions

일부 API 라우트는 Edge Runtime을 사용하여 빠른 응답을 제공합니다:

```typescript
// apps/web/src/app/api/example/route.ts
export const runtime = "edge"
```

### ISR 설정

정적 페이지는 ISR을 사용하여 주기적으로 재생성됩니다:

```typescript
// apps/web/src/app/about/page.tsx
export const revalidate = 3600 // 1시간마다 재생성
export const dynamic = "force-static"
```

### Lazy Loading

무거운 컴포넌트는 동적 임포트를 사용합니다:

```typescript
import dynamic from "next/dynamic"

const HeavyComponent = dynamic(() => import("./heavy-component"), {
  ssr: true,
  loading: () => <Loading />,
})
```

## 환경 변수

### 개발 환경

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:support@lovetrip.app
```

### 프로덕션 환경

배포 플랫폼의 환경 변수 설정에서 위 변수들을 설정합니다.

## PWA 배포

### Manifest

PWA manifest는 `apps/web/src/app/manifest.ts`에서 정의됩니다.

### Service Worker

Service Worker는 `apps/web/public/sw.js`에 정의되어 있으며, 자동으로 등록됩니다.

### 아이콘

다음 크기의 아이콘이 필요합니다:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

아이콘은 `apps/web/public/` 디렉토리에 배치합니다.

## 성능 모니터링

### Vercel Analytics

Vercel을 사용하는 경우, Analytics를 활성화하여 성능을 모니터링할 수 있습니다.

### Lighthouse CI

```bash
# Lighthouse CI 설치
npm install -g @lhci/cli

# 실행
lhci autorun
```

## 롤백 전략

### Vercel

Vercel은 자동으로 이전 배포를 보관하므로, 대시보드에서 이전 버전으로 롤백할 수 있습니다.

### 수동 롤백

```bash
# 특정 배포로 롤백
vercel rollback [deployment-url]
```

## 체크리스트

배포 전 확인사항:

- [ ] 모든 테스트 통과 (`pnpm test`)
- [ ] E2E 테스트 통과 (`pnpm test:e2e`)
- [ ] 빌드 성공 (`pnpm build`)
- [ ] 환경 변수 설정 완료
- [ ] PWA 아이콘 및 manifest 확인
- [ ] 성능 최적화 확인 (Lighthouse)
- [ ] 보안 헤더 설정 확인
- [ ] 에러 로깅 설정 확인

## 문제 해결

### 빌드 실패

```bash
# 의존성 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 캐시 클리어
pnpm store prune
```

### Edge Function 오류

Edge Runtime은 Node.js API를 일부 지원하지 않습니다. 필요한 경우 Node.js Runtime을 사용하세요.

### PWA 설치 실패

- HTTPS 사용 확인
- Manifest 파일 접근 가능 확인
- Service Worker 등록 확인

## 추가 리소스

- [Next.js 배포 문서](https://nextjs.org/docs/deployment)
- [Vercel 문서](https://vercel.com/docs)
- [PWA 가이드](https://web.dev/progressive-web-apps/)

