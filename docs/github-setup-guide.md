# 🚀 GitHub 설정 가이드

이 가이드는 GitHub Issues와 Projects를 설정하는 방법을 안내합니다.

## ✅ 완료된 작업

다음 Issues가 이미 생성되었습니다:

- [#1 - API 명세서 업데이트](https://github.com/toris-dev/love-trip/issues/1)
- [#2 - 여행 계획 생성 API 구현](https://github.com/toris-dev/love-trip/issues/2)
- [#3 - 예산 관리 기능 개선](https://github.com/toris-dev/love-trip/issues/3)
- [#4 - 커플 연결 기능 구현](https://github.com/toris-dev/love-trip/issues/4)
- [#5 - 게이미피케이션 시스템 구현](https://github.com/toris-dev/love-trip/issues/5)

## 🔧 자동 설정 스크립트

### 1. GitHub Personal Access Token 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)** 클릭
3. 다음 권한 선택:
   - `repo` (전체 권한)
   - `write:org` (조직 프로젝트인 경우)
4. 토큰 생성 후 복사 (한 번만 표시됨)

### 2. 라벨 및 Projects 연동 자동 설정

터미널에서 다음 명령어를 실행하세요:

```bash
# 환경 변수 설정
export GITHUB_TOKEN=your_github_token_here

# 스크립트 실행
pnpm setup:github
```

또는 한 줄로:

```bash
GITHUB_TOKEN=your_github_token_here pnpm setup:github
```

### 스크립트가 수행하는 작업

1. **필요한 라벨 생성**:
   - `type:bug` - 버그 수정
   - `type:refactor` - 리팩토링
   - `type:test` - 테스트
   - `status:blocked` - 차단됨
   - `status:needs-review` - 리뷰 필요
   - `status:ready-for-merge` - 머지 준비됨
   - `domain:recommendation` - 추천 시스템
   - `domain:ui` - UI/UX
   - `domain:subscription` - 구독/결제

2. **Issues를 Projects에 자동 추가**:
   - Issue #1 ~ #5를 Projects에 추가
   - 이미 추가된 경우 자동으로 건너뜀

## 📊 GitHub Projects 설정

### Projects 정보

- **프로젝트 URL**: https://github.com/users/toris-dev/projects/5
- **프로젝트 번호**: 5

### 컬럼 구조

다음 컬럼을 생성하세요:

1. **Backlog** - 아직 시작하지 않은 작업
2. **Todo** - 곧 시작할 작업
3. **In Progress** - 현재 진행 중인 작업
4. **Review** - 코드 리뷰 대기 중
5. **Done** - 완료된 작업

### Issues 수동 추가 (스크립트 사용 불가 시)

1. Projects 페이지로 이동: https://github.com/users/toris-dev/projects/5
2. **Add item** 클릭
3. 생성된 Issues를 선택하여 추가
4. 각 Issue를 적절한 컬럼으로 드래그

## 🏷 라벨 체계

### 타입 라벨

- `type:feature` - 신규 기능 ✅
- `type:bug` - 버그 수정 (스크립트로 생성)
- `type:docs` - 문서 작업 ✅
- `type:refactor` - 리팩토링 (스크립트로 생성)
- `type:test` - 테스트 (스크립트로 생성)

### 우선순위 라벨

- `priority:high` - 높은 우선순위 ✅
- `priority:medium` - 중간 우선순위 ✅
- `priority:low` - 낮은 우선순위 ✅

### 상태 라벨

- `status:blocked` - 차단됨 (스크립트로 생성)
- `status:needs-review` - 리뷰 필요 (스크립트로 생성)
- `status:ready-for-merge` - 머지 준비됨 (스크립트로 생성)

### 도메인 라벨

- `domain:planner` - 여행 계획 ✅
- `domain:expense` - 경비 관리 ✅
- `domain:recommendation` - 추천 시스템 (스크립트로 생성)
- `domain:gamification` - 게이미피케이션 ✅
- `domain:couple` - 커플 기능 ✅
- `domain:ui` - UI/UX (스크립트로 생성)
- `domain:subscription` - 구독/결제 (스크립트로 생성)

## 📝 Issue 템플릿 확인

다음 Issue 템플릿이 이미 생성되어 있습니다:

- `.github/ISSUE_TEMPLATE/feature.md` - 기능 제안
- `.github/ISSUE_TEMPLATE/bug.md` - 버그 리포트
- `.github/ISSUE_TEMPLATE/docs.md` - 문서 작업

새 Issue를 생성할 때 이 템플릿을 사용하세요.

## 🔄 워크플로우

### 일반적인 워크플로우

1. **Issue 생성** → Backlog 컬럼에 추가
2. **작업 시작** → In Progress로 이동
3. **PR 생성** → Review 컬럼으로 이동
4. **머지 완료** → Done 컬럼으로 이동

### 필터링

Projects에서 다음 필터를 사용할 수 있습니다:

- `assignee:@me` - 나에게 할당된 작업
- `label:type:feature` - 기능 작업만 보기
- `label:priority:high` - 높은 우선순위만 보기

## 🔗 관련 링크

- [GitHub Issues](https://github.com/toris-dev/love-trip/issues)
- [GitHub Projects](https://github.com/users/toris-dev/projects/5)
- [저장소](https://github.com/toris-dev/love-trip)

## 📚 관련 문서

- [GitHub 워크플로우 가이드](./github-workflow.md)
- [개발 가이드](./development-guide.md)
- [프로젝트 기획서](./project-plan.md)
