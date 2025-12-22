import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "여행 코스",
  description: "커플을 위한 여행 코스를 탐색하고 특별한 여행을 계획해보세요.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function TravelPage() {
  redirect("/date?type=travel")
}
