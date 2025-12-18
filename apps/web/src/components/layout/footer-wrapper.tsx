"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

export function FooterWrapper() {
  const pathname = usePathname()
  
  // 데이트 코스와 여행 코스 페이지에서는 Footer를 표시하지 않음
  const hideFooter = pathname === "/date" || pathname?.startsWith("/date/")
  
  if (hideFooter) {
    return null
  }
  
  return <Footer />
}

