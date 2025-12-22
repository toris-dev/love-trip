import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@lovetrip/api/supabase/server"
import { FavoritesPageClient } from "@/components/features/favorites/favorites-page-client"
import type { Database } from "@lovetrip/shared/types/database"

type PlaceFavorite = Database["public"]["Tables"]["place_favorites"]["Row"] & {
  places: null // places 테이블이 삭제되어 항상 null
}

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "즐겨찾기",
  description: "저장한 장소와 코스를 한눈에 확인하고 관리하세요.",
  robots: {
    index: false,
    follow: false,
  },
}

async function getFavorites(userId: string): Promise<PlaceFavorite[]> {
  const supabase = await createClient()

  // places 테이블이 삭제되어 조인 제거
  const { data, error } = await supabase
    .from("place_favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching favorites:", error)
    return []
  }

  // places는 항상 null로 설정
  return (data || []).map(fav => ({ ...fav, places: null })) as PlaceFavorite[]
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const favorites = await getFavorites(user.id)

  return <FavoritesPageClient initialFavorites={favorites} />
}
