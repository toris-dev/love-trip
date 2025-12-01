/**
 * Button Component Tests
 * 
 * UI 패키지의 Button 컴포넌트를 테스트합니다.
 */

import { Button } from "@lovetrip/ui/components/button"

describe("Button Component", () => {
  it("should render button correctly", () => {
    cy.mount(<Button>Click me</Button>)
    cy.contains("Click me").should("be.visible")
  })

  it("should handle click events", () => {
    const onClick = cy.stub()
    cy.mount(<Button onClick={onClick}>Click me</Button>)
    cy.contains("Click me").click()
    cy.wrap(onClick).should("have.been.called")
  })

  it("should render different variants", () => {
    cy.mount(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    )
    
    cy.contains("Default").should("be.visible")
    cy.contains("Destructive").should("be.visible")
    cy.contains("Outline").should("be.visible")
  })

  it("should render different sizes", () => {
    cy.mount(
      <div>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    )
    
    cy.contains("Small").should("be.visible")
    cy.contains("Default").should("be.visible")
    cy.contains("Large").should("be.visible")
  })

  it("should be disabled when disabled prop is true", () => {
    cy.mount(<Button disabled>Disabled</Button>)
    cy.contains("Disabled").should("be.disabled")
  })
})

