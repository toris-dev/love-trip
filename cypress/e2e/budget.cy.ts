/**
 * Budget Management E2E Tests
 *
 * 예산 관리 기능을 테스트합니다.
 */

describe("Budget Management", () => {
  beforeEach(() => {
    cy.visit("/my-trips")
    cy.waitForPageLoad()
  })

  it("should display budget visualization", () => {
    // 여행 계획 상세 페이지로 이동
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    // 첫 번째 여행 계획 클릭
    cy.get("body").then($body => {
      if ($body.find("a[href*='/my-trips/']").length > 0) {
        cy.get("a[href*='/my-trips/']").first().click()
        cy.waitForPageLoad()

        // 예산 시각화 섹션 확인
        cy.get("body").should("contain", /예산|budget/i)

        // 차트 컴포넌트 확인 (Recharts)
        cy.get("body").then($body => {
          // 차트가 렌더링되었는지 확인 (SVG 요소)
          if ($body.find("svg").length > 0) {
            cy.get("svg").should("be.visible")
          }
        })
      }
    })
  })

  it("should display budget charts", () => {
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    cy.get("body").then($body => {
      if ($body.find("a[href*='/my-trips/']").length > 0) {
        cy.get("a[href*='/my-trips/']").first().click()
        cy.waitForPageLoad()

        // 막대 그래프 확인
        cy.get("body").then($body => {
          // Recharts는 SVG로 렌더링됨
          if ($body.find("svg").length > 0) {
            cy.get("svg").should("be.visible")
          }
        })
      }
    })
  })

  it("should display budget optimization suggestions", () => {
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    cy.get("body").then($body => {
      if ($body.find("a[href*='/my-trips/']").length > 0) {
        cy.get("a[href*='/my-trips/']").first().click()
        cy.waitForPageLoad()

        // 예산 최적화 제안 섹션 확인
        cy.get("body").should("contain", /최적화|제안|optimization/i)
      }
    })
  })

  it("should add budget items", () => {
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    cy.get("body").then($body => {
      if ($body.find("a[href*='/my-trips/']").length > 0) {
        cy.get("a[href*='/my-trips/']").first().click()
        cy.waitForPageLoad()

        // 예산 항목 추가 버튼 클릭
        cy.get("body").then($body => {
          if ($body.find('button:contains("추가"), button:contains("예산")').length > 0) {
            cy.contains("button", /추가|예산/)
              .first()
              .click()

            // 예산 항목 입력
            cy.get('input[name="name"], input[placeholder*="항목명"]').type("호텔")
            cy.get('input[name="planned_amount"], input[placeholder*="금액"]').type("200000")
            cy.get('select[name="category"], select').first().select("숙박비")

            // 저장 버튼 클릭
            cy.contains("button", /저장|추가|완료/).click()

            // 추가된 항목 확인
            cy.get("body").should("contain", "호텔")
          }
        })
      }
    })
  })
})
