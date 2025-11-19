# Packages

이 디렉토리는 모노레포 구조를 위한 공통 패키지들을 포함합니다.

## 구조

### `@lovetrip/shared`
공통 타입, 유틸리티 함수, 상수를 포함하는 공유 패키지입니다.

- **types**: 공통 TypeScript 타입 정의
- **utils**: 유틸리티 함수 (formatDate, formatCurrency, cn 등)
- **constants**: 상수 값 (CONTACT_INFO, SOCIAL_LINKS 등)

### `@lovetrip/ui`
공통 UI 컴포넌트 패키지입니다. styled-components와 Radix UI를 활용합니다.

- **components**: styled-components로 작성된 재사용 가능한 컴포넌트
- **styles**: styled-components 테마 정의

## 사용법

```typescript
// 타입 import
import type { Place, TravelPlan } from "@lovetrip/shared/types"

// 유틸리티 import
import { formatDate, formatCurrency } from "@lovetrip/shared/utils"

// 상수 import
import { CONTACT_INFO, SOCIAL_LINKS } from "@lovetrip/shared/constants"

// UI 컴포넌트 import
import { StyledButton, StyledCard } from "@lovetrip/ui/components"
```

## 모노레포 전환

현재는 단일 저장소 구조이지만, 향후 모노레포로 전환할 때:

1. `packages/` 디렉토리를 독립적인 패키지로 분리
2. `pnpm workspaces` 또는 `npm workspaces` 설정
3. 각 패키지의 `package.json`에 적절한 의존성 정의
4. 빌드 및 배포 파이프라인 구성

