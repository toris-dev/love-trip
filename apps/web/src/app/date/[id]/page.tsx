import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@lovetrip/api/supabase/server"
import { getUserCourseWithPlaces } from "@lovetrip/planner/services"
import { CourseDetailClient } from "@/components/features/courses/course-detail-client"

export const dynamic = "force-dynamic"

interface CourseDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const course = await getUserCourseWithPlaces(id, undefined)

  if (!course) {
    return {
      title: "코스를 찾을 수 없습니다",
    }
  }

  const isTravel = course.course_type === "travel"
  const description =
    course.description || `${course.region} 지역의 ${isTravel ? "여행" : "데이트"} 코스입니다.`

  return {
    title: course.title,
    description,
    keywords: [
      course.region,
      isTravel ? "여행코스" : "데이트코스",
      "커플여행",
      "여행계획",
      course.region + "여행",
    ],
    openGraph: {
      title: `${course.title} | LOVETRIP`,
      description,
      url: `https://lovetrip.vercel.app/date/${id}`,
      type: "website",
      images: course.image_url
        ? [
            {
              url: course.image_url,
              width: 1200,
              height: 630,
              alt: course.title,
            },
          ]
        : [
            {
              url: "/og-image.png",
              width: 1200,
              height: 630,
              alt: course.title,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      images: course.image_url ? [course.image_url] : ["/og-image.png"],
    },
    alternates: {
      canonical: `/date/${id}`,
    },
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const course = await getUserCourseWithPlaces(id, user?.id)

  if (!course) {
    notFound()
  }

  return <CourseDetailClient course={course} userId={user?.id} />
}
