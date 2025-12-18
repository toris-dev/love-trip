import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  toggleCourseLike,
  toggleCourseSave,
  getMyCourses,
  updateCoursePublishStatus,
} from "../user-course-service"

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      order: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
    insert: vi.fn(() => ({
      data: null,
      error: null,
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null,
      })),
    })),
  })),
}

vi.mock("@lovetrip/api/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

vi.mock("@lovetrip/gamification", () => ({
  grantInteractionReward: vi.fn(() => Promise.resolve()),
  grantPublishReward: vi.fn(() => Promise.resolve()),
}))

describe("user-course-service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("toggleCourseLike", () => {
    it("좋아요를 추가할 수 있어야 함", async () => {
      const mockCourse = {
        id: "course-1",
        user_id: "user-2",
        is_public: true,
      }

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockCourse,
                error: null,
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: null,
                  error: { code: "PGRST116" },
                })),
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          insert: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { like_count: 0 },
                error: null,
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })

      const result = await toggleCourseLike("course-1", "user-1")

      expect(result.liked).toBe(true)
    })

    it("자신의 코스는 좋아요할 수 없어야 함", async () => {
      const mockCourse = {
        id: "course-1",
        user_id: "user-1", // 같은 사용자
        is_public: true,
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockCourse,
              error: null,
            })),
          })),
        })),
      })

      await expect(toggleCourseLike("course-1", "user-1")).rejects.toThrow(
        "자신의 코스는 좋아요할 수 없습니다"
      )
    })
  })

  describe("toggleCourseSave", () => {
    it("코스를 저장할 수 있어야 함", async () => {
      const mockCourse = {
        id: "course-1",
        user_id: "user-2",
        is_public: true,
      }

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockCourse,
                error: null,
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: null,
                  error: { code: "PGRST116" },
                })),
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          insert: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { save_count: 0 },
                error: null,
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })

      const result = await toggleCourseSave("course-1", "user-1")

      expect(result.saved).toBe(true)
    })
  })

  describe("getMyCourses", () => {
    it("내 코스 목록을 조회해야 함", async () => {
      const mockCourses = [
        {
          id: "course-1",
          user_id: "user-1",
          title: "내 코스",
          course_type: "date",
        },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockCourses,
              error: null,
            })),
          })),
        })),
      })

      const courses = await getMyCourses("user-1")

      expect(courses).toEqual(mockCourses)
    })
  })
})
