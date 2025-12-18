/**
 * 코스 생성 결과를 캐싱하는 유틸리티
 * 메모리 기반 간단한 캐시 구현
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CourseCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5분

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // TTL 확인
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * 특정 키의 캐시 삭제
   * @param key - 삭제할 캐시 키
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 패턴에 맞는 모든 캐시 삭제
   * @param pattern - 정규식 패턴 (문자열)
   *
   * @example
   * ```typescript
   * cache.deletePattern("travel-courses-.*")
   * // travel-courses-로 시작하는 모든 키 삭제
   * ```
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 만료된 캐시 정리
   * TTL이 지난 모든 엔트리를 삭제
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl

      if (isExpired) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 캐시 크기 반환
   * @returns 현재 캐시에 저장된 엔트리 수
   */
  size(): number {
    return this.cache.size
  }
}

// 싱글톤 인스턴스
export const courseCache = new CourseCache()

// 주기적으로 만료된 캐시 정리 (5분마다)
if (typeof window !== "undefined") {
  setInterval(
    () => {
      courseCache.cleanup()
    },
    5 * 60 * 1000
  )
}
