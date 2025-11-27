import { createClient } from "@/lib/supabase/server"
import { HeaderClient } from "./header-client"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 게이미피케이션 데이터는 나중에 실제 데이터로 교체
  const gamificationData = {
    level: 5,
    points: 12500,
  }

  return <HeaderClient initialUser={user} gamificationData={gamificationData} />
}
