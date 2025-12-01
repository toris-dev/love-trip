/**
 * Recommendation Domain Types
 */

export interface RecommendationFilters {
  areaCode?: number
  contentTypeId?: number
  category1?: string
  category2?: string
  minRating?: number
  maxPriceLevel?: number
  limit?: number
}

export interface CoupleRecommendationOptions {
  user1Favorites?: string[] // place IDs
  user2Favorites?: string[] // place IDs
  preferredTypes?: ("CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC")[]
  preferredArea?: number
  limit?: number
}

