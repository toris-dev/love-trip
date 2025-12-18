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

  if (user) {
    try {
      const gamification = await getOrCreateUserGamification(user.id)
      gamificationData = {
        level: gamification.level,
        points: gamification.points,
      }
    } catch (error) {
      console.error("Failed to load gamification data:", error)
      // 에러가 발생해도 기본값 사용
    }
  }

  return <HeaderClient initialUser={user} gamificationData={gamificationData} />
}
