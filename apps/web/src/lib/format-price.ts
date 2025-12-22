/**
 * 가격을 한국어 형식으로 포맷팅
 * @param minPrice 최소 가격 (원)
 * @param maxPrice 최대 가격 (원)
 * @returns 포맷된 가격 문자열 (예: "3만원~5만원")
 */
export function formatPriceRange(
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined
): string | null {
  if (minPrice === null || minPrice === undefined || maxPrice === null || maxPrice === undefined) {
    return null
  }

  const formatPrice = (price: number): string => {
    if (price >= 10000) {
      const man = Math.floor(price / 10000)
      const remainder = price % 10000
      if (remainder === 0) {
        return `${man}만원`
      } else {
        const cheon = Math.floor(remainder / 1000)
        if (cheon === 0) {
          return `${man}만원`
        } else {
          return `${man}만${cheon}천원`
        }
      }
    } else if (price >= 1000) {
      const cheon = Math.floor(price / 1000)
      return `${cheon}천원`
    } else {
      return `${price.toLocaleString()}원`
    }
  }

  if (minPrice === maxPrice) {
    return formatPrice(minPrice)
  }

  return `${formatPrice(minPrice)}~${formatPrice(maxPrice)}`
}
