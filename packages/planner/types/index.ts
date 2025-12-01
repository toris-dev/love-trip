/**
 * Planner Domain Types
 */

// Travel plan related types will be defined here
// Currently using Database types from shared package

type TravelPlan = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  budget: number
  status: "draft" | "published" | "archived"
}

export { type TravelPlan }
