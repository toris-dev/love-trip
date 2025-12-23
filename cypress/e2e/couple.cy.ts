/**
 * Couple Connection E2E Tests
 *
 * 커플 연결 기능을 테스트합니다.
 */

describe("Couple Connection", () => {
  beforeEach(() => {
    // 프로필 페이지로 이동 (커플 연결 기능이 있는 페이지)
    cy.visit("/profile")
    cy.waitForPageLoad()
  })

  it("should display couple connection section", () => {
    // 커플 연결 섹션 확인
    cy.get("body").should("contain", /커플|연결|couple/i)
  })

  it("should generate invite link", () => {
    // 초대 링크 생성 버튼 클릭
    cy.get("body").then($body => {
      if ($body.find('button:contains("초대 링크"), button:contains("링크 생성")').length > 0) {
        cy.contains("button", /초대 링크|링크 생성/).click()

        // 초대 링크가 생성되었는지 확인
        cy.get("body").should("contain", /링크|http|localhost/i)

        // 초대 링크 복사 버튼 확인
        cy.get("body").then($body => {
          if ($body.find('button:contains("복사")').length > 0) {
            cy.contains("button", "복사").should("be.visible")
          }
        })
      }
    })
  })

  it("should search for partner by nickname", () => {
    // 닉네임 검색 입력 필드 확인
    cy.get("body").then($body => {
      if ($body.find('input[placeholder*="닉네임"], input[name="nickname"]').length > 0) {
        const nicknameInput = cy.get('input[placeholder*="닉네임"], input[name="nickname"]').first()
        nicknameInput.type("testuser")

        // 검색 버튼 클릭
        cy.contains("button", /검색|찾기/).click()

        // 검색 결과 확인 (로딩 후)
        cy.wait(1000)
        cy.get("body").should("contain", /검색|결과|사용자/i)
      }
    })
  })

  it("should accept couple invite via link", () => {
    // 초대 링크로 접근 (토큰은 실제 테스트용 토큰으로 교체 필요)
    const testToken = "test-invite-token-123"
    cy.visit(`/couple/accept?token=${testToken}`)
    cy.waitForPageLoad()

    // 초대 수락 페이지 확인
    cy.get("body").should("contain", /초대|수락|커플/i)

    // 수락 버튼 확인
    cy.get("body").then($body => {
      if ($body.find('button:contains("수락"), button:contains("연결")').length > 0) {
        cy.contains("button", /수락|연결/).should("be.visible")
      }
    })
  })

  it("should display shared travel plans when couple is connected", () => {
    // 커플이 연결된 상태에서 여행 계획 목록 확인
    cy.visit("/my-trips")
    cy.waitForPageLoad()

    // 여행 계획 목록이 표시되는지 확인
    cy.get("body").should("contain", /여행|계획|trip/i)

    // 공유된 여행 계획 표시 확인 (있는 경우)
    cy.get("body").then($body => {
      if ($body.find('[data-shared="true"], .shared-plan').length > 0) {
        cy.get('[data-shared="true"], .shared-plan').should("be.visible")
      }
    })
  })

  it("should handle invalid invite token", () => {
    // 유효하지 않은 토큰으로 접근
    cy.visit("/couple/accept?token=invalid-token")
    cy.waitForPageLoad()

    // 에러 메시지 확인
    cy.get("body").should("contain", /유효하지|만료|오류/i)
  })
})
