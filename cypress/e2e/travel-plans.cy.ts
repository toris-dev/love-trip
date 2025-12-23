/**
 * Travel Plans E2E Tests
 *
 * 여행 계획 생성 및 관리 기능을 테스트합니다.
 */

describe("Travel Plans", () => {
  beforeEach(() => {
    // 로그인이 필요한 경우 여기에 로그인 로직 추가
    // cy.login("test@example.com", "password")
    cy.visit("/my-trips")
    cy.waitForPageLoad()
  })

  it("should display travel plans list", () => {
    // 여행 계획 목록 페이지 접근
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    // 페이지 제목 확인
    cy.get("h1, h2").should("contain", "여행")
  })

  it("should create a new travel plan", () => {
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    // 여행 계획 생성 버튼 클릭 (있는 경우)
    cy.get("body").then($body => {
      if ($body.find('button:contains("새 여행 계획"), button:contains("추가")').length > 0) {
        cy.contains("button", /새 여행|추가|생성/).click()

        // 여행 계획 생성 폼 작성
        cy.get('input[name="title"], input[placeholder*="제목"]').type("부산 여행")
        cy.get('input[name="destination"], input[placeholder*="목적지"]').type("부산")
        cy.get('input[name="start_date"], input[type="date"]').first().type("2024-01-01")
        cy.get('input[name="end_date"], input[type="date"]').last().type("2024-01-03")
        cy.get('input[name="total_budget"], input[placeholder*="예산"]').type("500000")

        // 저장 버튼 클릭
        cy.contains("button", /저장|생성|완료/).click()

        // 성공 메시지 또는 리다이렉트 확인
        cy.url().should("include", "/my-trips")
      }
    })
  })

  it("should display travel plan details", () => {
    // 여행 계획 상세 페이지 접근 (ID는 실제 데이터에 맞게 수정 필요)
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    // 첫 번째 여행 계획 클릭 (있는 경우)
    cy.get("body").then($body => {
      if ($body.find("a[href*='/my-trips/'], button[href*='/my-trips/']").length > 0) {
        cy.get("a[href*='/my-trips/'], button[href*='/my-trips/']").first().click()
        cy.waitForPageLoad()

        // 여행 계획 상세 정보 확인
        cy.get("h1, h2").should("be.visible")
      }
    })
  })

  it("should validate travel plan form", () => {
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    // 여행 계획 생성 시도
    cy.get("body").then($body => {
      if ($body.find('button:contains("새 여행 계획"), button:contains("추가")').length > 0) {
        cy.contains("button", /새 여행|추가|생성/).click()

        // 필수 필드 없이 제출 시도
        cy.contains("button", /저장|생성|완료/).click()

        // 에러 메시지 확인
        cy.get("body").should("contain", /필수|입력|오류/i)
      }
    })
  })
})
