import { createClient } from "@lovetrip/api/supabase/server"
import { CalendarPageClient } from "@/components/features/calendar/calendar-page-client"
import { calendarService } from "@lovetrip/couple/services"
import type { Couple, SharedCalendar } from "@lovetrip/couple/services"
import type { PartnerInfo, CurrentUserInfo } from "@/components/features/calendar/types"

async function getCalendarData(userId: string) {
  const supabase = await createClient()

  // 커플 정보 가져오기
  const { data: coupleData } = await supabase
    .from("couples")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .single()

  if (!coupleData) {
    return {
      couple: null,
      calendars: [],
      partnerInfo: null,
      currentUserInfo: null,
    }
  }

  // 캘린더 정보 가져오기
  const { data: calendarsData } = await supabase
    .from("shared_calendars")
    .select("*")
    .eq("couple_id", coupleData.id)
    .order("created_at", { ascending: true })

  let calendars: SharedCalendar[] = calendarsData || []

  // 캘린더가 없으면 기본 캘린더 생성 (서버 사이드에서는 생성하지 않고 클라이언트에서 처리)
  if (calendars.length === 0) {
    calendars = []
  }

  // 현재 사용자 정보
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .single()

  const currentUserInfo: CurrentUserInfo = {
    id: userId,
    nickname: currentUserProfile?.nickname || undefined,
  }

  // 파트너 정보
  const partnerId = coupleData.user1_id === userId ? coupleData.user2_id : coupleData.user1_id

  const { data: partnerUser } = await supabase.auth.admin.getUserById(partnerId).catch(() => ({
    data: { user: null },
  }))

  const { data: partnerProfile } = await supabase
    .from("profiles")
    .select("nickname, display_name")
    .eq("id", partnerId)
    .single()

  const partnerInfo: PartnerInfo | null = partnerId
    ? {
        id: partnerId,
        email: partnerUser?.user?.email || "",
        name: partnerProfile?.display_name || undefined,
        nickname: partnerProfile?.nickname || undefined,
      }
    : null

  return {
    couple: coupleData as Couple,
    calendars: calendars as SharedCalendar[],
    partnerInfo,
    currentUserInfo,
  }
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
      return null
    }

  const { couple, calendars, partnerInfo, currentUserInfo } = await getCalendarData(user.id)

  return (
    <CalendarPageClient
      initialCouple={couple}
      initialCalendars={calendars}
      initialPartnerInfo={partnerInfo}
      initialCurrentUserInfo={currentUserInfo}
      user={user ? { id: user.id, email: user.email } : null}
      />
  )
}
