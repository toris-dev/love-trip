/// <reference types="cypress" />

/**
 * Custom Cypress commands
 *
 * 이 파일에 프로젝트 전반에서 사용할 커스텀 명령어를 정의합니다.
 */

/**
 * 사용자 로그인 커스텀 명령어
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 */
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login")
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  // 로그인 후 리다이렉트 대기
  cy.url().should("not.include", "/login")
})

/**
 * 페이지 로드 완료 대기 커스텀 명령어
 */
Cypress.Commands.add("waitForPageLoad", () => {
  // Next.js의 로딩 상태 확인
  cy.get("body").should("be.visible")
  // 네비게이션 완료 대기
  cy.window().its("__NEXT_DATA__").should("exist")
})

/**
 * API 요청을 통한 여행 계획 생성
 */
Cypress.Commands.add(
  "createTravelPlan",
  (planData: {
    title: string
    destination: string
    start_date: string
    end_date: string
    total_budget?: number
    description?: string
    course_type?: "date" | "travel"
  }) => {
    cy.request({
      method: "POST",
      url: "/api/travel-plans",
      body: {
        title: planData.title,
        destination: planData.destination,
        start_date: planData.start_date,
        end_date: planData.end_date,
        total_budget: planData.total_budget || 0,
        description: planData.description,
        course_type: planData.course_type || "travel",
      },
      failOnStatusCode: false,
    }).then(response => {
      return response
    })
  }
)

/**
 * 커플 초대 링크 생성
 */
Cypress.Commands.add("generateCoupleInvite", () => {
  cy.request({
    method: "POST",
    url: "/api/couples/invite",
    failOnStatusCode: false,
  }).then(response => {
    return response
  })
})

/**
 * 예산 최적화 제안 조회
 */
Cypress.Commands.add("getBudgetOptimization", (travelPlanId: string) => {
  cy.request({
    method: "GET",
    url: `/api/travel-plans/${travelPlanId}/budget/optimize`,
    failOnStatusCode: false,
  }).then(response => {
    return response
  })
})
