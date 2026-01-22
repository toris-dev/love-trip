# 성능 최적화 및 아키텍처 개선 계획

## 현재 상태 분석

### 1. FSD 디자인 패턴
- ✅ 기본 구조는 적용됨 (features/, shared/, layout/)
- ⚠️ 일부 개선 필요: 레이어 분리 명확화, 공통 컴포넌트 분류

### 2. 서버/클라이언트 컴포넌트 분리
- ✅ 대부분 적절하게 분리됨
- ⚠️ 개선 필요:
  - 불필요한 "use client" 제거 가능한 컴포넌트 확인
  - 서버 컴포넌트에서 데이터 페칭 최적화

### 3. 번들 최적화
- ✅ 일부 dynamic import 사용 중 (NaverMapView)
- ⚠️ 개선 필요:
  - Barrel imports 직접 import로 변경
  - 무거운 라이브러리 dynamic import
  - 조건부 로딩

### 4. 성능 개선
- ✅ 일부 Promise.all 사용 중
- ⚠️ 개선 필요:
  - 메모이제이션 적용
  - 리렌더링 최적화
  - 병렬 데이터 페칭 확대

## 개선 작업 계획

### Phase 1: Barrel Imports 최적화
- [ ] `@lovetrip/ui/components` 직접 import로 변경
- [ ] Tree-shaking 최적화

### Phase 2: 서버/클라이언트 컴포넌트 최적화
- [ ] 불필요한 "use client" 제거
- [ ] 서버 컴포넌트에서 데이터 페칭 최적화
- [ ] React.cache() 적용

### Phase 3: 번들 최적화
- [ ] 무거운 라이브러리 dynamic import
- [ ] 조건부 모듈 로딩
- [ ] 코드 스플리팅

### Phase 4: 성능 개선
- [ ] 메모이제이션 적용 (React.memo, useMemo, useCallback)
- [ ] 병렬 데이터 페칭 확대
- [ ] 리렌더링 최적화
