# 📚 LOVETRIP 문서화

이 디렉토리는 LOVETRIP 프로젝트의 모든 문서를 포함합니다.

## 📋 문서 구조

```
docs/
├── README.md                    # 이 파일
├── architecture.md              # 시스템 아키텍처
├── api-spec.md                 # API 명세서
├── project-plan.md             # 프로젝트 기획서
├── development-guide.md        # 개발 가이드
├── meeting-notes/              # 회의록
│   └── README.md
├── decisions/                  # 아키텍처 결정 기록 (ADR)
│   ├── README.md
│   └── ADR-001-monorepo-structure.md
└── database/                   # 데이터베이스 문서
    ├── DATABASE_SCHEMA.md
    └── DATABASE_TABLES_ANALYSIS.md
```

## 🎯 문서화 철학

### 기본 원칙

1. **문서 = GitHub**: 모든 설계 문서, 회의록, 기술 정리는 GitHub에 기록
2. **일정·업무 = 이슈 트래킹**: 할 일, 담당자, 마감일은 GitHub Issues로 관리
3. **변하지 않는 기록**: 문서는 결정 사항과 설계의 정본(Source of Truth)
4. **변하는 업무 상태**: 이슈는 진행 중인 작업의 상태를 추적

### 문서 작성 가이드

- 모든 문서는 **Markdown** 형식으로 작성
- 중요한 결정은 **ADR (Architecture Decision Records)** 패턴으로 기록
- 회의록은 날짜별로 정리하여 `meeting-notes/`에 보관
- API 변경사항은 `api-spec.md`에 반영

## 📖 주요 문서

### 설계 문서

- [아키텍처 문서](./architecture.md) - 시스템 구조 및 설계 원칙
- [프로젝트 기획서](./project-plan.md) - 서비스 기획 및 기능 명세
- [API 명세서](./api-spec.md) - REST API 엔드포인트 문서

### 개발 문서

- [개발 가이드](./development-guide.md) - 개발 환경 설정 및 가이드라인
- [데이터베이스 스키마](./database/DATABASE_SCHEMA.md) - DB 구조 및 관계

### 결정 기록

- [아키텍처 결정 기록](./decisions/README.md) - 중요한 기술 결정 사항

## 🔄 문서 업데이트 규칙

1. **새로운 기능 추가 시**: `project-plan.md`와 `api-spec.md` 업데이트
2. **아키텍처 변경 시**: `architecture.md`와 `decisions/`에 ADR 작성
3. **회의 후**: `meeting-notes/`에 회의록 작성
4. **API 변경 시**: `api-spec.md` 즉시 업데이트

## 📝 GitHub 연동

### Issues 관리

- 모든 작업은 GitHub Issue로 관리
- Issue 템플릿 사용 (`.github/ISSUE_TEMPLATE/`)
- 라벨 체계:
  - `type:feature` - 신규 기능
  - `type:bug` - 버그 수정
  - `type:docs` - 문서 작업
  - `priority:high` - 높은 우선순위
  - `status:blocked` - 차단됨

### Projects 관리

- GitHub Projects (칸반)로 작업 추적
- 컬럼: `Backlog` → `Todo` → `In Progress` → `Review` → `Done`

## 🔗 관련 링크

- [메인 README](../README.md)
- [GitHub Issues](https://github.com/your-org/love-trip/issues)
- [GitHub Projects](https://github.com/your-org/love-trip/projects)
