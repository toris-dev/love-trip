/**
 * Query Cache
 * 서버 사이드 쿼리 결과 캐싱
 * 향후 Redis로 교체 가능
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
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
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 패턴에 맞는 모든 캐시 삭제
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
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
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
   */
  size(): number {
    return this.cache.size
  }
}

// 싱글톤 인스턴스
export const queryCache = new QueryCache()

// 주기적으로 만료된 캐시 정리 (서버 사이드)
if (typeof window === "undefined") {
  setInterval(
    () => {
      queryCache.cleanup()
    },
    5 * 60 * 1000
  ) // 5분마다
}
