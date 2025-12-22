import type { MetadataRoute } from "next"
import { createServiceClient } from "@lovetrip/api/supabase/server"

const BASE_URL = "https://lovetrip.vercel.app"

/**
 * 공개된 코스 ID 목록 조회
 * sitemap은 정적으로 생성되어야 하므로 서비스 역할 키를 사용하는 클라이언트 사용
 */
async function getPublicCourseIds(): Promise<Array<{ id: string; updated_at: string | null }>> {
  try {
    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn(
        "Supabase environment variables not set, skipping dynamic course pages in sitemap"
      )
      return []
    }

    // 서비스 역할 키를 사용하여 cookies 없이 데이터 조회
    const supabase = createServiceClient()
    const { data: courses, error } = await supabase
      .from("user_courses")
      .select("id, updated_at")
      .eq("is_public", true)
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1000) // 최대 1000개로 제한

    if (error) {
      console.error("Failed to fetch public courses for sitemap:", error)
      return []
    }

    if (!courses) {
      return []
    }

    return courses
  } catch (error) {
    // 빌드 타임 에러를 방지하기 위해 에러를 무시하고 빈 배열 반환
    console.warn("Error fetching public courses for sitemap:", error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/date`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/date?type=travel`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ]

  // 동적 코스 페이지들
  const publicCourses = await getPublicCourseIds()
  const coursePages: MetadataRoute.Sitemap = publicCourses.map(course => ({
    url: `${BASE_URL}/date/${course.id}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...coursePages]
}
