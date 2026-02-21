"use client"

import Link from "next/link"
import { Button } from "@lovetrip/ui/components/button"
import { MapPin } from "lucide-react"

/**
 * @header 슬롯 에러 시 폴백 (게이미피케이션/프로필 로드 실패 등).
 * 최소 네비게이션만 제공하고 재시도 가능.
 */
export default function HeaderError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-semibold text-foreground">
            <MapPin className="h-5 w-5 text-primary" aria-hidden />
            LOVETRIP
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              다시 시도
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
