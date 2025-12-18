# 📊 GitHub Projects 수동 설정 가이드

Projects 자동 연동이 실패한 경우, 수동으로 설정하는 방법입니다.

## 🔧 Personal Access Token 권한 확인

Projects 자동 연동을 위해서는 Personal Access Token에 다음 권한이 필요합니다:

- `repo` (전체 권한)
- `read:org` (조직 프로젝트인 경우)

### 토큰 권한 업데이트

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 사용 중인 토큰 선택
3. **Edit** 클릭
4. `read:org` 권한 체크
5. **Update token** 클릭
6. 스크립트 다시 실행: `pnpm setup:github`

## 📌 Issues를 Projects에 수동 추가

### 방법 1: Projects 페이지에서 추가

1. **Projects 페이지로 이동**
   - https://github.com/users/toris-dev/projects/5

2. **Issues 추가**
   - **Add item** 버튼 클릭
   - 검색창에 Issue 번호 입력 (예: `#1`)
   - 또는 Issue 제목으로 검색
   - 선택하여 추가

3. **추가할 Issues 목록**
   - **#1** - [Docs] API 명세서 업데이트
   - **#2** - [Feature] 여행 계획 생성 API 구현
   - **#3** - [Feature] 예산 관리 기능 개선
   - **#4** - [Feature] 커플 연결 기능 구현
   - **#5** - [Feature] 게이미피케이션 시스템 구현

4. **컬럼 배치**
   - 각 Issue를 적절한 컬럼으로 드래그
   - 예: Backlog 또는 Todo 컬럼에 배치

### 방법 2: Issue 페이지에서 추가

1. 각 Issue 페이지로 이동
2. 우측 사이드바에서 **Projects** 섹션 찾기
3. **Add to project** 클릭
4. 프로젝트 선택: `LOVETRIP Development` (프로젝트 #5)
5. 컬럼 선택 (예: Backlog)

## 🏷 라벨 확인

다음 라벨들이 이미 생성되어 있습니다:

### 타입 라벨

- ✅ `type:feature`
- ✅ `type:bug`
- ✅ `type:docs`
- ✅ `type:refactor`
- ✅ `type:test`

### 우선순위 라벨

- ✅ `priority:high`
- ✅ `priority:medium`
- ✅ `priority:low`

### 상태 라벨

- ✅ `status:blocked`
- ✅ `status:needs-review`
- ✅ `status:ready-for-merge`

### 도메인 라벨

- ✅ `domain:planner`
- ✅ `domain:expense`
- ✅ `domain:recommendation`
- ✅ `domain:gamification`
- ✅ `domain:couple`
- ✅ `domain:ui`
- ✅ `domain:subscription`

## 🔗 관련 링크

- [GitHub Issues](https://github.com/toris-dev/love-trip/issues)
- [GitHub Projects](https://github.com/users/toris-dev/projects/5)
- [GitHub 워크플로우 가이드](./github-workflow.md)
