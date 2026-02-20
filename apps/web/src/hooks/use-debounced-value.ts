import { useState, useEffect, useRef } from "react"

/**
 * 입력값을 delay ms 만큼 지연시킨 후 반환.
 * 검색 입력 등에서 API/상태 업데이트 빈도를 줄일 때 사용.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
      timeoutRef.current = null
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}
