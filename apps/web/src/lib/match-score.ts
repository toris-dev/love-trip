/**
 * 사용자와 코스의 매칭 점수 계산
 */

export interface UserPreferences {
  preferredCategories?: string[]
  preferredRegions?: string[]
  budgetRange?: {
    min: number
    max: number
  }
  visitedPlaces?: string[] // 방문한 장소 ID 목록
}

export interface CourseData {
  category?: string
  region: string
  estimatedCost?: number
  places?: Array<{ id: string }>
  targetAudience?: string
}

/**
 * 사용자와 코스의 매칭 점수를 계산합니다 (0-100)
 */
export function calculateMatchScore(
  userPreferences: UserPreferences,
  course: CourseData
): number {
  let score = 0
  let maxScore = 0

  // 카테고리 일치 (30점)
  maxScore += 30
  if (userPreferences.preferredCategories && course.category) {
    if (userPreferences.preferredCategories.includes(course.category)) {
      score += 30
    }
  } else {
    // 선호 카테고리가 없으면 기본 점수 부여
    score += 15
  }

  // 지역 선호도 (25점)
  maxScore += 25
  if (userPreferences.preferredRegions && course.region) {
    if (userPreferences.preferredRegions.includes(course.region)) {
      score += 25
    }
  } else {
    // 선호 지역이 없으면 기본 점수 부여
    score += 12.5
  }

  // 예산 범위 (25점)
  maxScore += 25
  if (userPreferences.budgetRange && course.estimatedCost) {
    const { min, max } = userPreferences.budgetRange
    if (course.estimatedCost >= min && course.estimatedCost <= max) {
      score += 25
    } else if (course.estimatedCost < min) {
      // 예산보다 낮으면 부분 점수
      score += 15
    } else {
      // 예산 초과면 낮은 점수
      score += 5
    }
  } else {
    // 예산 정보가 없으면 기본 점수 부여
    score += 12.5
  }

  // 방문 이력 (20점) - 새로운 장소가 많을수록 높은 점수
  maxScore += 20
  if (userPreferences.visitedPlaces && course.places) {
    const newPlaces = course.places.filter(
      (place) => !userPreferences.visitedPlaces?.includes(place.id)
    )
    const newPlaceRatio = newPlaces.length / course.places.length
    score += newPlaceRatio * 20
  } else {
    // 방문 이력이 없으면 기본 점수 부여
    score += 10
  }

  // 최종 점수를 0-100 범위로 정규화
  const normalizedScore = maxScore > 0 ? (score / maxScore) * 100 : 50

  return Math.round(normalizedScore)
}
