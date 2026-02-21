import { createClient } from "@lovetrip/api/supabase/server"
import { getOrCreateUserGamification } from "@lovetrip/gamification"
import { HeaderClient } from "./header-client"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 게이미피케이션 데이터 조회
  let gamificationData = {
    level: 1,
    points: 0,
  }

  // 프로필 닉네임 조회
  let nickname: string | null = null
  if (user) {
    try {
      const gamification = await getOrCreateUserGamification(user.id)
      gamificationData = {
        level: gamification.level ?? 1,
        points: gamification.points ?? 0,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined
      console.error("Failed to load gamification data:", message, code ? `(${code})` : "")
      // 에러가 발생해도 기본값 사용
    }

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle()

      nickname = profileData?.nickname ?? null
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("Failed to load profile data:", message)
      // 에러가 발생해도 기본값 사용
    }
  }

  return <HeaderClient initialUser={user} initialNickname={nickname} gamificationData={gamificationData} />
}
