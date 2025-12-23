import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../travel-plans/route"
import { NextRequest } from "next/server"

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: "user-1" } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: {
            id: "plan-1",
            user_id: "user-1",
            title: "부산 여행",
            destination: "부산",
            start_date: "2024-01-01",
            end_date: "2024-01-03",
            total_budget: 500000,
            description: "2박 3일 부산 여행",
            course_type: "travel",
            status: "planning",
            created_at: "2024-01-01T00:00:00Z",
          },
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: "plan-1" },
          error: null,
        })),
      })),
    })),
  })),
  rpc: vi.fn(),
}

// Mock createTravelPlanWithTransaction
const mockCreateTravelPlanWithTransaction = vi.fn()

// Mock withTransaction
const mockWithTransaction = vi.fn()

// Mock createUserCourseFromTravelPlan
const mockCreateUserCourseFromTravelPlan = vi.fn()

// Mock validateRequest
const mockValidateRequest = vi.fn()

// Mock error handler
const mockHandleError = vi.fn((error: unknown) => {
  return {
    json: vi.fn(() => ({
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "서버 오류가 발생했습니다",
      },
    })),
    status: 500,
  }
})

const mockLogError = vi.fn()

// Mock query-cache for dynamic import
const mockQueryCache = {
  get: vi.fn(),
  set: vi.fn(),
}

// Mock modules
vi.mock("@lovetrip/api/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

vi.mock("@lovetrip/api/supabase/transaction-manager", () => ({
  createTravelPlanWithTransaction: (...args: unknown[]) =>
    mockCreateTravelPlanWithTransaction(...args),
  withTransaction: (...args: unknown[]) => mockWithTransaction(...args),
  transactionInsert: vi.fn(),
  transactionInsertMany: vi.fn(),
}))

vi.mock("@lovetrip/planner/services", () => ({
  createUserCourseFromTravelPlan: (...args: unknown[]) =>
    mockCreateUserCourseFromTravelPlan(...args),
}))

vi.mock("@lovetrip/planner/services/query-cache", () => ({
  queryCache: mockQueryCache,
}))

vi.mock("@/lib/validation/validate-request", () => ({
  validateRequest: (...args: unknown[]) => mockValidateRequest(...args),
}))

vi.mock("@/lib/errors/error-handler", () => ({
  handleError: mockHandleError,
  logError: mockLogError,
}))

describe("Travel Plans API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockReturnValue({
      data: { user: { id: "user-1" } },
    })
  })

  describe("POST /api/travel-plans", () => {
    it("정상적인 여행 계획을 생성할 수 있어야 함", async () => {
      const requestBody = {
        title: "부산 여행",
        destination: "부산",
        start_date: "2024-01-01",
        end_date: "2024-01-03",
        total_budget: 500000,
        description: "2박 3일 부산 여행",
        course_type: "travel",
        places: [
          {
            place_id: "550e8400-e29b-41d4-a716-446655440000",
            day_number: 1,
            order_index: 0,
          },
        ],
        budget_items: [
          {
            category: "교통비",
            name: "KTX",
            planned_amount: 150000,
          },
        ],
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 성공
      mockValidateRequest.mockResolvedValue({
        success: true,
        data: requestBody,
      })

      // Mock createTravelPlanWithTransaction - 성공
      mockCreateTravelPlanWithTransaction.mockResolvedValue("plan-1")

      // Mock plan 조회
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "plan-1",
                user_id: "user-1",
                title: "부산 여행",
                destination: "부산",
                start_date: "2024-01-01",
                end_date: "2024-01-03",
                total_budget: 500000,
                description: "2박 3일 부산 여행",
                course_type: "travel",
                status: "planning",
                created_at: "2024-01-01T00:00:00Z",
              },
              error: null,
            })),
          })),
        })),
      })

      // Mock couple 조회 (없음)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
      })

      // Mock createUserCourseFromTravelPlan
      mockCreateUserCourseFromTravelPlan.mockResolvedValue(undefined)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.plan).toBeDefined()
      expect(json.plan.title).toBe("부산 여행")
      expect(json.plan.destination).toBe("부산")
      expect(mockCreateTravelPlanWithTransaction).toHaveBeenCalledWith(mockSupabase, {
        user_id: "user-1",
        title: "부산 여행",
        destination: "부산",
        start_date: "2024-01-01",
        end_date: "2024-01-03",
        total_budget: 500000,
        description: "2박 3일 부산 여행",
        course_type: "travel",
        places: [
          {
            place_id: "550e8400-e29b-41d4-a716-446655440000",
            day_number: 1,
            order_index: 0,
          },
        ],
        budget_items: [
          {
            category: "교통비",
            name: "KTX",
            planned_amount: 150000,
          },
        ],
      })
    })

    it("PostgreSQL 함수 실패 시 폴백 로직으로 여행 계획을 생성할 수 있어야 함", async () => {
      const requestBody = {
        title: "제주 여행",
        destination: "제주",
        start_date: "2024-01-01",
        end_date: "2024-01-02",
        course_type: "travel",
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 성공
      mockValidateRequest.mockResolvedValue({
        success: true,
        data: requestBody,
      })

      // Mock createTravelPlanWithTransaction - 실패
      mockCreateTravelPlanWithTransaction.mockRejectedValue(
        new Error("PostgreSQL 함수 실패")
      )

      // Mock withTransaction - 성공
      mockWithTransaction.mockResolvedValue({
        id: "plan-2",
        user_id: "user-1",
        title: "제주 여행",
        destination: "제주",
        start_date: "2024-01-01",
        end_date: "2024-01-02",
        total_budget: 0,
        course_type: "travel",
        status: "planning",
      })

      // Mock plan 조회
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "plan-2",
                user_id: "user-1",
                title: "제주 여행",
                destination: "제주",
                start_date: "2024-01-01",
                end_date: "2024-01-02",
                total_budget: 0,
                course_type: "travel",
                status: "planning",
                created_at: "2024-01-01T00:00:00Z",
              },
              error: null,
            })),
          })),
        })),
      })

      // Mock couple 조회 (없음)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.plan).toBeDefined()
      expect(json.plan.title).toBe("제주 여행")
      expect(mockWithTransaction).toHaveBeenCalled()
    })

    it("필수 필드가 누락되면 400을 반환해야 함", async () => {
      const requestBody = {
        destination: "부산",
        // title 누락
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 실패
      mockValidateRequest.mockResolvedValue({
        success: false,
        error: {
          json: vi.fn(() => ({
            error: {
              code: "VALIDATION_ERROR",
              message: "title: 제목은 필수입니다",
            },
          })),
          status: 400,
        },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error.code).toBe("VALIDATION_ERROR")
      expect(json.error.message).toContain("title")
    })

    it("잘못된 날짜 형식이면 400을 반환해야 함", async () => {
      const requestBody = {
        title: "부산 여행",
        destination: "부산",
        start_date: "2024/01/01", // 잘못된 형식
        end_date: "2024-01-03",
        course_type: "travel",
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 실패
      mockValidateRequest.mockResolvedValue({
        success: false,
        error: {
          json: vi.fn(() => ({
            error: {
              code: "VALIDATION_ERROR",
              message: "start_date: 날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)",
            },
          })),
          status: 400,
        },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error.code).toBe("VALIDATION_ERROR")
      expect(json.error.message).toContain("날짜 형식")
    })

    it("종료일이 시작일보다 이전이면 400을 반환해야 함", async () => {
      const requestBody = {
        title: "부산 여행",
        destination: "부산",
        start_date: "2024-01-03",
        end_date: "2024-01-01", // 시작일보다 이전
        course_type: "travel",
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 실패
      mockValidateRequest.mockResolvedValue({
        success: false,
        error: {
          json: vi.fn(() => ({
            error: {
              code: "VALIDATION_ERROR",
              message: "end_date: 종료일은 시작일 이후여야 합니다",
            },
          })),
          status: 400,
        },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error.code).toBe("VALIDATION_ERROR")
      expect(json.error.message).toContain("종료일은 시작일 이후")
    })

    it("잘못된 UUID 형식의 place_id면 400을 반환해야 함", async () => {
      const requestBody = {
        title: "부산 여행",
        destination: "부산",
        start_date: "2024-01-01",
        end_date: "2024-01-03",
        course_type: "travel",
        places: [
          {
            place_id: "invalid-uuid", // 잘못된 UUID
            day_number: 1,
            order_index: 0,
          },
        ],
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 실패
      mockValidateRequest.mockResolvedValue({
        success: false,
        error: {
          json: vi.fn(() => ({
            error: {
              code: "VALIDATION_ERROR",
              message: "places.0.place_id: place_id는 유효한 UUID 형식이어야 합니다",
            },
          })),
          status: 400,
        },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error.code).toBe("VALIDATION_ERROR")
      expect(json.error.message).toContain("UUID")
    })

    it("로그인하지 않은 사용자는 401을 반환해야 함", async () => {
      const requestBody = {
        title: "부산 여행",
        destination: "부산",
        start_date: "2024-01-01",
        end_date: "2024-01-03",
        course_type: "travel",
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock getUser - 사용자 없음
      mockSupabase.auth.getUser.mockReturnValue({
        data: { user: null },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe("로그인이 필요합니다")
    })

    it("데이터베이스 오류 시 500을 반환해야 함", async () => {
      const requestBody = {
        title: "부산 여행",
        destination: "부산",
        start_date: "2024-01-01",
        end_date: "2024-01-03",
        course_type: "travel",
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 성공
      mockValidateRequest.mockResolvedValue({
        success: true,
        data: requestBody,
      })

      // Mock createTravelPlanWithTransaction - 실패
      mockCreateTravelPlanWithTransaction.mockRejectedValue(
        new Error("데이터베이스 연결 실패")
      )

      // Mock withTransaction - 실패
      mockWithTransaction.mockRejectedValue(new Error("트랜잭션 실패"))

      // Mock handleError
      mockHandleError.mockReturnValue({
        json: vi.fn(() => ({
          error: {
            code: "INTERNAL_ERROR",
            message: "서버 오류가 발생했습니다",
          },
        })),
        status: 500,
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error.code).toBe("INTERNAL_ERROR")
      expect(mockLogError).toHaveBeenCalled()
    })

    it("생성된 여행 계획 조회 실패 시 에러를 반환해야 함", async () => {
      const requestBody = {
        title: "부산 여행",
        destination: "부산",
        start_date: "2024-01-01",
        end_date: "2024-01-03",
        course_type: "travel",
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 성공
      mockValidateRequest.mockResolvedValue({
        success: true,
        data: requestBody,
      })

      // Mock createTravelPlanWithTransaction - 성공
      mockCreateTravelPlanWithTransaction.mockResolvedValue("plan-1")

      // Mock plan 조회 - 실패
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: "조회 실패" },
            })),
          })),
        })),
      })

      // Mock handleError
      mockHandleError.mockReturnValue({
        json: vi.fn(() => ({
          error: {
            code: "INTERNAL_ERROR",
            message: "여행 계획을 조회하는데 실패했습니다",
          },
        })),
        status: 500,
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error.code).toBe("INTERNAL_ERROR")
      expect(mockLogError).toHaveBeenCalled()
    })

    it("course_type이 date일 때 user_course를 생성해야 함", async () => {
      const requestBody = {
        title: "강남 데이트",
        destination: "서울",
        start_date: "2024-01-01",
        end_date: "2024-01-01",
        course_type: "date",
      }

      const request = new NextRequest("http://localhost/api/travel-plans", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      // Mock validateRequest - 성공
      mockValidateRequest.mockResolvedValue({
        success: true,
        data: requestBody,
      })

      // Mock createTravelPlanWithTransaction - 성공
      mockCreateTravelPlanWithTransaction.mockResolvedValue("plan-3")

      // Mock plan 조회
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "plan-3",
                user_id: "user-1",
                title: "강남 데이트",
                destination: "서울",
                start_date: "2024-01-01",
                end_date: "2024-01-01",
                course_type: "date",
                status: "planning",
                created_at: "2024-01-01T00:00:00Z",
              },
              error: null,
            })),
          })),
        })),
      })

      // Mock couple 조회 (없음)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
      })

      // Mock createUserCourseFromTravelPlan
      mockCreateUserCourseFromTravelPlan.mockResolvedValue(undefined)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.plan).toBeDefined()
      expect(mockCreateUserCourseFromTravelPlan).toHaveBeenCalledWith("plan-3", "user-1", {
        isPublic: false,
        title: "강남 데이트",
        description: undefined,
      })
    })
  })
})
