// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands"

// Alternatively you can use CommonJS syntax:
// require('./commands')

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Custom command to wait for page load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>

      /**
       * Create a travel plan via API
       * @example cy.createTravelPlan({ title: '부산 여행', destination: '부산', start_date: '2024-01-01', end_date: '2024-01-03' })
       */
      createTravelPlan(planData: {
        title: string
        destination: string
        start_date: string
        end_date: string
        total_budget?: number
        description?: string
        course_type?: "date" | "travel"
      }): Chainable<Cypress.Response<any>>

      /**
       * Generate couple invite link
       * @example cy.generateCoupleInvite()
       */
      generateCoupleInvite(): Chainable<Cypress.Response<any>>

      /**
       * Get budget optimization suggestions
       * @example cy.getBudgetOptimization('plan-id')
       */
      getBudgetOptimization(travelPlanId: string): Chainable<Cypress.Response<any>>
    }
  }
}
