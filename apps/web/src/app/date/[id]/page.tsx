import { notFound } from "next/navigation"
import { createClient } from "@lovetrip/api/supabase/server"
import { getUserCourseWithPlaces } from "@lovetrip/planner/services"
import { CourseDetailClient } from "@/components/features/courses/course-detail-client"

export const dynamic = "force-dynamic"

interface CourseDetailPageProps {
  params: Promise<{ id: string }>
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

