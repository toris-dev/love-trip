import { describe, it, expect, beforeEach, vi } from "vitest"
import { courseCache } from "../course-cache"

describe("course-cache", () => {
  beforeEach(() => {
    courseCache.clear()
  })

  describe("get and set", () => {
    it("캐시에 데이터를 저장하고 조회할 수 있어야 함", () => {
      const key = "test-key"
      const data = { test: "data" }

      courseCache.set(key, data)
      const result = courseCache.get<typeof data>(key)

      expect(result).toEqual(data)
    })

    it("존재하지 않는 키는 null을 반환해야 함", () => {
      const result = courseCache.get("non-existent-key")

      expect(result).toBeNull()
    })

    it("TTL이 지나면 캐시가 만료되어야 함", () => {
      const key = "test-key"
      const data = { test: "data" }
      const shortTtl = 100 // 100ms

      courseCache.set(key, data, shortTtl)

      // TTL 전에는 데이터가 있어야 함
      expect(courseCache.get(key)).toEqual(data)

      // TTL 후에는 null이어야 함
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(courseCache.get(key)).toBeNull()
          resolve()
        }, shortTtl + 50)
      })
    })
  })

  describe("delete", () => {
    it("특정 키를 삭제할 수 있어야 함", () => {
      const key = "test-key"
      courseCache.set(key, { data: "test" })

      courseCache.delete(key)

      expect(courseCache.get(key)).toBeNull()
    })
  })

  describe("deletePattern", () => {
    it("패턴에 맞는 모든 키를 삭제해야 함", () => {
      courseCache.set("travel-courses-page-1", { data: 1 })
      courseCache.set("travel-courses-page-2", { data: 2 })
      courseCache.set("date-courses-page-1", { data: 3 })

      courseCache.deletePattern("travel-courses-.*")

      expect(courseCache.get("travel-courses-page-1")).toBeNull()
      expect(courseCache.get("travel-courses-page-2")).toBeNull()
      expect(courseCache.get("date-courses-page-1")).not.toBeNull()
    })
  })

  describe("cleanup", () => {
    it("만료된 캐시를 정리해야 함", () => {
      courseCache.set("key1", { data: 1 }, 100)
      courseCache.set("key2", { data: 2 }, 1000)

      return new Promise<void>(resolve => {
        setTimeout(() => {
          courseCache.cleanup()

          expect(courseCache.get("key1")).toBeNull()
          expect(courseCache.get("key2")).not.toBeNull()
          resolve()
        }, 150)
      })
    })
  })

  describe("size", () => {
    it("캐시 크기를 반환해야 함", () => {
      expect(courseCache.size()).toBe(0)

      courseCache.set("key1", { data: 1 })
      expect(courseCache.size()).toBe(1)

      courseCache.set("key2", { data: 2 })
      expect(courseCache.size()).toBe(2)

      courseCache.delete("key1")
      expect(courseCache.size()).toBe(1)
    })
  })

  describe("clear", () => {
    it("모든 캐시를 삭제해야 함", () => {
      courseCache.set("key1", { data: 1 })
      courseCache.set("key2", { data: 2 })

      courseCache.clear()

      expect(courseCache.size()).toBe(0)
      expect(courseCache.get("key1")).toBeNull()
      expect(courseCache.get("key2")).toBeNull()
    })
  })
})
