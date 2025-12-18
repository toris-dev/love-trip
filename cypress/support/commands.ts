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

