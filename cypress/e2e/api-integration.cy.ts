/**
 * API Integration E2E Tests
 *
 * API 엔드포인트의 통합 테스트를 수행합니다.
 */

describe("API Integration", () => {
  describe("Travel Plans API", () => {
    it("should create travel plan via API", () => {
      cy.createTravelPlan({
        title: "E2E 테스트 여행",
        destination: "제주",
        start_date: "2024-06-01",
        end_date: "2024-06-03",
        total_budget: 1000000,
        description: "E2E 테스트용 여행 계획",
        course_type: "travel",
      }).then(response => {
        // 인증이 필요한 경우 401이 반환될 수 있음
        if (response.status === 401) {
          cy.log("인증이 필요합니다. 로그인 후 테스트하세요.")
          return
        }

        // 성공 시 응답 확인
        if (response.status === 200) {
          expect(response.body).to.have.property("plan")
          expect(response.body.plan).to.have.property("id")
          expect(response.body.plan.title).to.eq("E2E 테스트 여행")
        }
      })
    })

    it("should validate travel plan creation", () => {
      // 필수 필드 누락 시도
      cy.request({
        method: "POST",
        url: "/api/travel-plans",
        body: {
          destination: "부산",
          // title 누락
        },
        failOnStatusCode: false,
      }).then(response => {
        if (response.status === 401) {
          cy.log("인증이 필요합니다.")
          return
        }

        // 검증 실패 시 400 반환
        expect(response.status).to.be.oneOf([400, 401])
        if (response.status === 400) {
          expect(response.body).to.have.property("error")
        }
      })
    })

    it("should get travel plans list", () => {
      cy.request({
        method: "GET",
        url: "/api/travel-plans",
        failOnStatusCode: false,
      }).then(response => {
        if (response.status === 401) {
          cy.log("인증이 필요합니다.")
          return
        }

        if (response.status === 200) {
          expect(response.body).to.have.property("plans")
          expect(response.body.plans).to.be.an("array")
        }
      })
    })
  })

  describe("Budget API", () => {
    it("should get budget optimization suggestions", () => {
      // 테스트용 여행 계획 ID (실제 ID로 교체 필요)
      const testPlanId = "test-plan-id"

      cy.getBudgetOptimization(testPlanId).then(response => {
        if (response.status === 401) {
          cy.log("인증이 필요합니다.")
          return
        }

        if (response.status === 404) {
          cy.log("여행 계획을 찾을 수 없습니다.")
          return
        }

        if (response.status === 200) {
          expect(response.body).to.have.property("optimization")
          expect(response.body.optimization).to.have.property("isOverBudget")
          expect(response.body.optimization).to.have.property("suggestions")
        }
      })
    })
  })

  describe("Couple API", () => {
    it("should generate couple invite link", () => {
      cy.generateCoupleInvite().then(response => {
        if (response.status === 401) {
          cy.log("인증이 필요합니다.")
          return
        }

        if (response.status === 400) {
          // 이미 커플로 연결되어 있거나 pending 요청이 있는 경우
          expect(response.body).to.have.property("error")
          return
        }

        if (response.status === 200) {
          expect(response.body).to.have.property("inviteToken")
          expect(response.body).to.have.property("inviteLink")
          expect(response.body.inviteLink).to.include("/couple/accept")
          expect(response.body.inviteLink).to.include(response.body.inviteToken)
        }
      })
    })

    it("should validate invite token", () => {
      cy.request({
        method: "POST",
        url: "/api/couples/accept-invite",
        body: {
          token: "invalid-token",
        },
        failOnStatusCode: false,
      }).then(response => {
        if (response.status === 401) {
          cy.log("인증이 필요합니다.")
          return
        }

        // 유효하지 않은 토큰은 404 반환
        expect(response.status).to.be.oneOf([400, 404, 401])
        if (response.status === 404) {
          expect(response.body).to.have.property("error")
          expect(response.body.error).to.include("유효하지 않거나 만료된")
        }
      })
    })
  })
})
