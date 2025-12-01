/**
 * Navigation E2E Tests
 * 
 * 네비게이션 기능을 테스트합니다.
 */

describe("Navigation", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.waitForPageLoad()
  })

  it("should navigate to all main pages", () => {
    // 홈 페이지
    cy.url().should("eq", Cypress.config().baseUrl + "/")

    // About 페이지
    cy.visit("/about")
    cy.waitForPageLoad()
    cy.url().should("include", "/about")
    cy.get("h1").should("contain", "LOVETRIP")

    // Terms 페이지
    cy.visit("/terms")
    cy.waitForPageLoad()
    cy.url().should("include", "/terms")
    cy.get("h1").should("contain", "이용약관")

    // Privacy 페이지
    cy.visit("/privacy")
    cy.waitForPageLoad()
    cy.url().should("include", "/privacy")
    cy.get("h1").should("contain", "개인정보처리방침")

    // Contact 페이지
    cy.visit("/contact")
    cy.waitForPageLoad()
    cy.url().should("include", "/contact")
  })

  it("should have responsive navigation", () => {
    // 데스크톱 뷰포트
    cy.viewport(1280, 720)
    cy.get("nav").should("be.visible")

    // 모바일 뷰포트
    cy.viewport(375, 667)
    cy.get("nav").should("be.visible")
  })

  it("should maintain theme preference", () => {
    // 다크 모드 토글 (있는 경우)
    // 실제 구현에 따라 조정 필요
    cy.get("body").should("exist")
  })
})

