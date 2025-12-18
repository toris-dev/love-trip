/**
 * Home Page E2E Tests
 * 
 * 홈페이지의 주요 기능을 테스트합니다.
 */

describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.waitForPageLoad()
  })

  it("should display the home page correctly", () => {
    // 페이지 제목 확인
    cy.get("h1").should("be.visible")
    
    // 주요 섹션이 표시되는지 확인
    cy.get("body").should("contain", "LOVETRIP")
  })

  it("should navigate to travel page when clicking travel course card", () => {
    // 여행 코스 카드 클릭
    cy.contains("여행 코스").click()
    
    // URL이 변경되었는지 확인
    cy.url().should("include", "/travel")
  })

  it("should navigate to calendar page when clicking calendar card", () => {
    // 캘린더 카드 클릭
    cy.contains("캘린더").click()
    
    // URL이 변경되었는지 확인
    cy.url().should("include", "/calendar")
  })

  it("should navigate to date course page when clicking date course card", () => {
    // 데이트 코스 카드 클릭
    cy.contains("데이트 코스").click()
    
    // URL이 변경되었는지 확인
    cy.url().should("include", "/date")
  })

  it("should have working navigation links", () => {
    // 헤더의 네비게이션 링크 확인
    cy.get("nav").should("be.visible")
    
    // About 페이지로 이동
    cy.contains("소개").click()
    cy.url().should("include", "/about")
    
    // 홈으로 돌아가기
    cy.visit("/")
    cy.waitForPageLoad()
  })
})

