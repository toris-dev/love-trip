import { notFound } from "next/navigation"
import { createClient } from "@lovetrip/api/supabase/server"
import { FavoritesPageClient } from "@/components/features/favorites/favorites-page-client"
import type { Database } from "@lovetrip/shared/types/database"

type PlaceFavorite = Database["public"]["Tables"]["place_favorites"]["Row"] & {
  places: Database["public"]["Tables"]["places"]["Row"] | null
}

export const dynamic = "force-dynamic"

async function getFavorites(userId: string): Promise<PlaceFavorite[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("place_favorites")
    .select(
      `
      *,
      places (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching favorites:", error)
    return []
  }

  return (data || []) as PlaceFavorite[]
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
