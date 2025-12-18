# 🔄 GitHub 워크플로우 가이드

## 📋 목차

- [기본 철학](#기본-철학)
- [Issues 관리](#issues-관리)
- [Projects 관리](#projects-관리)
- [라벨 체계](#라벨-체계)
- [워크플로우 예시](#워크플로우-예시)

## 🎯 기본 철학

### "문서 = GitHub / 일정·업무 = 이슈 트래킹"

1. **문서는 변하지 않는 기록**
   - 설계 문서, 회의록, 기술 정리는 GitHub에 기록
   - `docs/` 폴더에 모든 문서 보관
   - 중요한 결정은 ADR로 기록

2. **이슈는 변하는 업무 상태**
   - 모든 할 일은 GitHub Issue로 관리
   - 진행 상태는 Issue 상태로 추적
   - 담당자, 마감일, 우선순위는 Issue에 기록

## 📝 Issues 관리

### Issue 생성

모든 작업은 Issue로 시작합니다:

1. **기능 개발**: `type:feature` 라벨
2. **버그 수정**: `type:bug` 라벨
3. **문서 작업**: `type:docs` 라벨

### Issue 템플릿 사용

프로젝트에는 다음 템플릿이 제공됩니다:

- **기능 제안** (`.github/ISSUE_TEMPLATE/feature.md`)
- **버그 리포트** (`.github/ISSUE_TEMPLATE/bug.md`)
- **문서 작업** (`.github/ISSUE_TEMPLATE/docs.md`)

### Issue 작성 가이드

#### 좋은 Issue 예시

```markdown
## 작업 내용

여행 계획 생성 API 구현

## 완료 조건

- [ ] API 엔드포인트 구현
- [ ] 입력값 검증
- [ ] 에러 처리
- [ ] 테스트 작성
- [ ] 문서 업데이트

## 관련 문서

- docs/api-spec.md
- docs/architecture.md

## 예상 소요 시간

2일
```

#### 나쁜 Issue 예시

```markdown
여행 계획 만들기
```

### Issue 라이프사이클

```
Open → In Progress → Review → Done
         ↑
      (Blocked)
```

## 📊 Projects 관리

### GitHub Projects 설정

GitHub Projects (칸반)를 사용하여 작업을 추적합니다.

### 컬럼 구조

```
Backlog → Todo → In Progress → Review → Done
```

#### Backlog

- 아직 시작하지 않은 작업
- 우선순위가 낮은 작업
- 향후 계획된 작업

#### Todo

- 곧 시작할 작업
- 우선순위가 높은 작업
- 리소스가 확보된 작업

#### In Progress

- 현재 진행 중인 작업
- 담당자가 할당된 작업

#### Review

- 코드 리뷰 대기 중
- 테스트 대기 중
- 배포 대기 중

#### Done

- 완료된 작업
- 배포된 작업

### 필터링

Projects에서 다음 필터를 사용할 수 있습니다:

- **담당자**: `assignee:@me`
- **라벨**: `label:type:feature`
- **마감일**: `due:2024-01-31`

## 🏷 라벨 체계

### 타입 라벨

- `type:feature` - 신규 기능
- `type:bug` - 버그 수정
- `type:docs` - 문서 작업
- `type:refactor` - 리팩토링
- `type:test` - 테스트

### 우선순위 라벨

- `priority:high` - 높은 우선순위
- `priority:medium` - 중간 우선순위
- `priority:low` - 낮은 우선순위

### 상태 라벨

- `status:blocked` - 차단됨
- `status:needs-review` - 리뷰 필요
- `status:ready-for-merge` - 머지 준비됨

### 도메인 라벨

- `domain:planner` - 여행 계획
- `domain:expense` - 경비 관리
- `domain:recommendation` - 추천 시스템
- `domain:gamification` - 게이미피케이션
- `domain:ui` - UI/UX

## 🔄 워크플로우 예시

### 기능 개발 워크플로우

1. **Issue 생성**

   ```
   - 제목: [Feature] 여행 계획 생성 API
   - 라벨: type:feature, priority:high
   - 담당자: @developer
   - 마감일: 2024-01-31
   ```

2. **브랜치 생성**

   ```bash
   git checkout -b feature/travel-plan-api
   ```

3. **개발 진행**
   - 코드 작성
   - 테스트 작성
   - 문서 업데이트

4. **Pull Request 생성**

   ```
   - 제목: [Feature] 여행 계획 생성 API 구현
   - 설명: Issue #123 해결
   - 리뷰어: @reviewer
   ```

5. **리뷰 및 수정**
   - 코드 리뷰 피드백 반영
   - 테스트 통과 확인

6. **머지 및 완료**
   - PR 머지
   - Issue 닫기
   - Projects에서 Done으로 이동

### 버그 수정 워크플로우

1. **버그 리포트**

   ```
   - 제목: [Bug] 여행 계획 저장 시 에러 발생
   - 라벨: type:bug, priority:high
   - 재현 단계 작성
   ```

2. **버그 확인 및 수정**
   - 버그 재현
   - 원인 분석
   - 수정 코드 작성

3. **테스트 및 검증**
   - 수정 사항 테스트
   - 회귀 테스트

4. **PR 및 머지**
   - 빠른 머지 (버그 수정)
   - Issue 닫기

## 📚 관련 문서

- [프로젝트 기획서](./project-plan.md)
- [개발 가이드](./development-guide.md)
- [GitHub Issues](https://github.com/your-org/love-trip/issues)
- [GitHub Projects](https://github.com/your-org/love-trip/projects)

## 💡 팁

### Issue와 PR 연결

PR 제목에 `Closes #123` 또는 `Fixes #123`을 포함하면 PR 머지 시 Issue가 자동으로 닫힙니다.

### 마일스톤 사용

큰 기능은 마일스톤으로 그룹화하여 관리할 수 있습니다.

### 프로젝트 자동화

GitHub Actions를 사용하여 Issue 상태를 자동으로 업데이트할 수 있습니다.
