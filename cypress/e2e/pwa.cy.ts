/**
 * PWA E2E Tests
 * 
 * PWA 기능을 테스트합니다.
 */

describe("PWA Features", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.waitForPageLoad()
  })

  it("should have manifest.json", () => {
    cy.request("/manifest").then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property("name")
      expect(response.body).to.have.property("short_name")
      expect(response.body).to.have.property("icons")
    })
  })

  it("should have service worker registered", () => {
    cy.window().then((win) => {
      // Service Worker 등록 확인
      if ("serviceWorker" in navigator) {
        cy.wrap(win.navigator.serviceWorker).should("exist")
      }
    })
  })

  it("should have proper meta tags for PWA", () => {
    cy.get('meta[name="theme-color"]').should("exist")
    cy.get('link[rel="manifest"]').should("exist")
    cy.get('link[rel="icon"]').should("exist")
  })

  it("should have app icons", () => {
    // 아이콘 파일들이 존재하는지 확인
    cy.request("/icon-192.png").then((response) => {
      expect(response.status).to.eq(200)
    })
    
    cy.request("/icon-512.png").then((response) => {
      expect(response.status).to.eq(200)
    })
  })
})

