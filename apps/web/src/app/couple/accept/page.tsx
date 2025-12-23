"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"

function AcceptCoupleInviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      toast.error("유효하지 않은 초대 링크입니다")
      router.push("/profile")
    }
  }, [token, router])

  const handleAccept = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/couples/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "초대 수락에 실패했습니다")
      }

      setIsSuccess(true)
      toast.success("커플 연결이 완료되었습니다!")

      // 2초 후 프로필 페이지로 이동
      setTimeout(() => {
        router.push("/profile")
      }, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "초대 수락에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return null
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Heart className="h-8 w-8 text-green-600 fill-green-600" />
            </div>
            <CardTitle>커플 연결 완료!</CardTitle>
            <CardDescription>성공적으로 커플로 연결되었습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              잠시 후 프로필 페이지로 이동합니다...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary fill-primary" />
          </div>
          <CardTitle>커플 연결 초대</CardTitle>
          <CardDescription>파트너의 커플 연결 초대를 수락하시겠습니까?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            커플로 연결되면 공동 캘린더와 여행 계획을 공유할 수 있습니다.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/profile")}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button className="flex-1" onClick={handleAccept} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  수락하기
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptCoupleInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AcceptCoupleInviteContent />
    </Suspense>
  )
}
