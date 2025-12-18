#!/usr/bin/env tsx
/**
 * GitHub 라벨 생성 및 Issues를 Projects에 연동하는 스크립트
 *
 * 사용법:
 * 1. 루트 .env 파일에 GITHUB_TOKEN=your_token 추가
 * 2. pnpm setup:github 실행
 *
 * 또는 환경 변수로 직접 전달:
 * GITHUB_TOKEN=your_token tsx scripts/setup-github-labels.ts
 */

import { config } from "dotenv"
import { resolve } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// .env 파일 로드 (루트 디렉토리)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, "..")

// .env 파일 로드 시도
config({ path: resolve(rootDir, ".env") })
config({ path: resolve(rootDir, ".env.local") })

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const OWNER = "toris-dev"
const REPO = "love-trip"
const PROJECT_NUMBER = 5 // https://github.com/users/toris-dev/projects/5

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN 환경 변수가 필요합니다.")
  console.error("\n다음 방법 중 하나를 사용하세요:")
  console.error("1. 루트 .env 또는 .env.local 파일에 GITHUB_TOKEN=your_token 추가")
  console.error("2. 환경 변수로 직접 전달: GITHUB_TOKEN=your_token pnpm setup:github")
  process.exit(1)
}

const API_BASE = "https://api.github.com"

// 필요한 라벨 정의
const LABELS = [
  // 타입 라벨
  { name: "type:bug", color: "d73a4a", description: "버그 수정" },
  { name: "type:refactor", color: "a2eeef", description: "리팩토링" },
  { name: "type:test", color: "bfe5bf", description: "테스트" },

  // 상태 라벨
  { name: "status:blocked", color: "b60205", description: "차단됨" },
  { name: "status:needs-review", color: "fbca04", description: "리뷰 필요" },
  { name: "status:ready-for-merge", color: "0e8a16", description: "머지 준비됨" },

  // 도메인 라벨
  { name: "domain:recommendation", color: "1d76db", description: "추천 시스템" },
  { name: "domain:ui", color: "c5def5", description: "UI/UX" },
  { name: "domain:subscription", color: "5319e7", description: "구독/결제" },
]

async function createLabel(label: { name: string; color: string; description: string }) {
  try {
    const response = await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/labels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: label.name,
        color: label.color,
        description: label.description,
      }),
    })

    if (response.ok) {
      console.log(`✅ 라벨 생성: ${label.name}`)
      return true
    } else if (response.status === 422) {
      const data = await response.json()
      if (data.errors?.some((e: { code?: string }) => e.code === "already_exists")) {
        console.log(`ℹ️  라벨 이미 존재: ${label.name}`)
        return true
      }
    }

    const error = await response.text()
    console.error(`❌ 라벨 생성 실패 (${label.name}):`, error)
    return false
  } catch (error) {
    console.error(`❌ 라벨 생성 중 오류 (${label.name}):`, error)
    return false
  }
}

async function getProjectId(projectNumber: number): Promise<string | null> {
  try {
    // User 프로젝트는 GraphQL API를 사용해야 함
    // 먼저 viewer (현재 인증된 사용자)로 시도
    let query = `
      query {
        viewer {
          projectV2(number: ${projectNumber}) {
            id
            title
          }
        }
      }
    `

    let response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    let data = await response.json()

    // viewer로 실패하면 user(login)으로 시도
    if (data.errors || !data.data?.viewer?.projectV2) {
      console.log("ℹ️  viewer로 프로젝트를 찾지 못했습니다. user(login)으로 시도합니다...")
      query = `
        query {
          user(login: "${OWNER}") {
            projectV2(number: ${projectNumber}) {
              id
              title
            }
          }
        }
      `

      response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      data = await response.json()
    }

    if (data.errors) {
      const error = data.errors[0]
      console.error("❌ GraphQL 오류:", error.message)

      if (error.type === "FORBIDDEN") {
        console.error("\n💡 해결 방법:")
        console.error(
          "1. Personal Access Token이 Classic Token인지 확인하세요 (Fine-grained는 GraphQL 미지원)"
        )
        console.error("2. 토큰에 다음 권한이 있는지 확인하세요:")
        console.error("   - repo (전체 권한)")
        console.error("   - read:org (조직 프로젝트인 경우)")
        console.error("3. 토큰을 재생성하고 'repo' 권한을 포함하여 생성하세요")
        console.error("4. User 프로젝트의 경우, 토큰 소유자가 프로젝트 소유자와 일치해야 합니다")
        console.error("\n📝 토큰 확인 방법:")
        console.error("   GitHub → Settings → Developer settings → Personal access tokens")
        console.error("   → Tokens (classic) → 사용 중인 토큰 확인/수정")
      } else {
        console.error("\n💡 오류 타입:", error.type)
        console.error("   상세 정보:", JSON.stringify(data.errors, null, 2))
      }
      return null
    }

    const projectId = data.data?.viewer?.projectV2?.id || data.data?.user?.projectV2?.id
    const projectTitle = data.data?.viewer?.projectV2?.title || data.data?.user?.projectV2?.title

    if (projectId) {
      console.log(`✅ 프로젝트 찾음: ${projectTitle} (ID: ${projectId})`)
      return projectId
    }

    return null
  } catch (error) {
    console.error("❌ 프로젝트 ID 조회 중 오류:", error)
    return null
  }
}

async function addIssueToProject(issueNumber: number, projectId: string): Promise<boolean> {
  try {
    // Issue의 node_id를 먼저 가져와야 함
    const issueQuery = `
      query {
        repository(owner: "${OWNER}", name: "${REPO}") {
          issue(number: ${issueNumber}) {
            id
            title
          }
        }
      }
    `

    const issueResponse = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: issueQuery }),
    })

    const issueData = await issueResponse.json()

    if (issueData.errors || !issueData.data?.repository?.issue) {
      console.error(`❌ Issue #${issueNumber}를 찾을 수 없습니다`)
      return false
    }

    const issueId = issueData.data.repository.issue.id

    // Project에 Issue 추가
    const addMutation = `
      mutation {
        addProjectV2ItemById(input: {
          projectId: "${projectId}",
          contentId: "${issueId}"
        }) {
          item {
            id
          }
        }
      }
    `

    const addResponse = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: addMutation }),
    })

    const addData = await addResponse.json()

    if (addData.errors) {
      // 이미 추가된 경우 무시
      if (addData.errors.some((e: { message?: string }) => e.message?.includes("already"))) {
        console.log(`ℹ️  Issue #${issueNumber}는 이미 프로젝트에 추가되어 있습니다`)
        return true
      }
      console.error(`❌ Issue #${issueNumber} 추가 실패:`, addData.errors)
      return false
    }

    console.log(`✅ Issue #${issueNumber}를 프로젝트에 추가했습니다`)
    return true
  } catch (error) {
    console.error(`❌ Issue #${issueNumber} 추가 중 오류:`, error)
    return false
  }
}

async function main() {
  console.log("🚀 GitHub 라벨 및 Projects 설정 시작...\n")

  // 1. 라벨 생성
  console.log("📋 라벨 생성 중...")
  for (const label of LABELS) {
    await createLabel(label)
  }
  console.log()

  // 2. 프로젝트 ID 조회
  console.log("🔍 프로젝트 정보 조회 중...")
  const projectId = await getProjectId(PROJECT_NUMBER)

  if (!projectId) {
    console.error("\n⚠️  Projects 자동 연동 실패")
    console.error("\n💡 수동으로 Issues를 Projects에 추가하는 방법:")
    console.error(`1. https://github.com/users/${OWNER}/projects/${PROJECT_NUMBER} 접속`)
    console.error("2. 'Add item' 클릭")
    console.error("3. 다음 Issues를 선택하여 추가:")
    console.error("   - Issue #1: API 명세서 업데이트")
    console.error("   - Issue #2: 여행 계획 생성 API 구현")
    console.error("   - Issue #3: 예산 관리 기능 개선")
    console.error("   - Issue #4: 커플 연결 기능 구현")
    console.error("   - Issue #5: 게이미피케이션 시스템 구현")
    console.error("\n또는 Personal Access Token에 'read:org' 권한을 추가하고 다시 시도하세요.")
    console.log("\n✅ 라벨 설정은 완료되었습니다!")
    process.exit(0)
  }
  console.log()

  // 3. Issues를 프로젝트에 추가
  console.log("📌 Issues를 프로젝트에 추가 중...")
  const issueNumbers = [1, 2, 3, 4, 5] // 생성된 Issues

  for (const issueNumber of issueNumbers) {
    await addIssueToProject(issueNumber, projectId)
    // API rate limit 방지를 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log("\n✅ 설정 완료!")
  console.log(`\n📊 프로젝트 보기: https://github.com/users/${OWNER}/projects/${PROJECT_NUMBER}`)
}

main().catch(console.error)
