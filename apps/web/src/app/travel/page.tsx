import { redirect } from "next/navigation"

export default function TravelPage() {
  redirect("/date?type=travel")
}
