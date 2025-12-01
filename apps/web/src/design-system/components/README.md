# Design System Components

이 디렉터리는 CDD(Component-Driven Development) 패턴을 따르는 재사용 가능한 컴포넌트들을 포함합니다.

## 구조

```
design-system/
├── tokens/          # Design Tokens (색상, 간격, 타이포그래피 등)
├── primitives/     # 가장 기본적인 컴포넌트 (Button, Input 등)
└── patterns/       # 복합 컴포넌트 (Card, Form 등)
```

## 컴포넌트 설계 원칙

1. **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
2. **Composition**: 작은 컴포넌트를 조합하여 큰 컴포넌트 구성
3. **Design Tokens**: 모든 스타일은 Design Token을 사용
4. **Type Safety**: TypeScript로 완전한 타입 안정성 보장
5. **Accessibility**: WCAG 2.1 AA 기준 준수

## 사용 예시

```tsx
import { Button } from "@/design-system/components/primitives/button"
import { Card } from "@/design-system/components/patterns/card"
import { tokens } from "@/design-system/tokens"

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  )
}
```

