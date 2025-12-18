"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lovetrip/ui/components/dialog"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import {
  Share2,
  MessageCircle,
  Copy,
  Check,
  Link2,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

// 카카오 SDK 타입 선언
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (options: {
          objectType: "feed"
          content: {
            title: string
            description: string
            imageUrl?: string
            link: {
              mobileWebUrl: string
              webUrl: string
            }
          }
        }) => void
      }
    }
  }
}

interface ShareButtonProps {
  title: string
  description?: string
  url: string
  imageUrl?: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ShareButton({
  title,
  description,
  url,
  imageUrl,
  className,
  variant = "outline",
  size = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [kakaoLoaded, setKakaoLoaded] = useState(false)

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url

  // 카카오 SDK 로드
  useEffect(() => {
    if (typeof window === "undefined") return

    // 이미 로드되어 있는지 확인
    if (window.Kakao && window.Kakao.isInitialized()) {
      setKakaoLoaded(true)
      return
    }

    // 카카오 SDK 스크립트 로드
    const script = document.createElement("script")
    script.src = "https://developers.kakao.com/sdk/js/kakao.js"
    script.async = true
    script.onload = () => {
      // 카카오 SDK 초기화 (실제 앱 키는 환경 변수에서 가져와야 함)
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || ""
      if (kakaoKey && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey)
        }
        setKakaoLoaded(true)
      }
    }
    document.head.appendChild(script)

    return () => {
      // 정리 작업은 하지 않음 (SDK는 전역에서 사용)
    }
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success("링크가 복사되었습니다")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("링크 복사에 실패했습니다")
    }
  }

  const handleKakaoShare = () => {
    if (kakaoLoaded && window.Kakao && window.Kakao.isInitialized()) {
      // 카카오 SDK를 사용한 공유
      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: title,
            description: description || title,
            imageUrl: imageUrl || `${window.location.origin}/og-image.png`,
            link: {
              mobileWebUrl: fullUrl,
              webUrl: fullUrl,
            },
          },
        })
      } catch (err) {
        console.error("카카오톡 공유 실패:", err)
        toast.error("카카오톡 공유에 실패했습니다")
      }
    } else {
      // 카카오 SDK가 로드되지 않은 경우 URL 공유
      const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(fullUrl)}`
      window.open(kakaoUrl, "_blank", "width=600,height=600")
    }
  }

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        })
        toast.success("공유되었습니다")
      } catch (err) {
        // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
        if ((err as Error).name !== "AbortError") {
          toast.error("공유에 실패했습니다")
        }
      }
    } else {
      // Web Share API를 지원하지 않는 경우 링크 복사
      handleCopyLink()
    }
  }

  const shareOptions = [
    {
      id: "kakao",
      label: "카카오톡",
      icon: MessageCircle,
      color: "from-yellow-400 to-yellow-500",
      onClick: handleKakaoShare,
    },
    {
      id: "web",
      label: "공유하기",
      icon: Share2,
      color: "from-blue-500 to-blue-600",
      onClick: handleWebShare,
    },
    {
      id: "copy",
      label: copied ? "복사됨" : "링크 복사",
      icon: copied ? Check : Copy,
      color: "from-primary to-indigo-600",
      onClick: handleCopyLink,
    },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${className} group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          <Share2 className="h-4 w-4 mr-2 relative z-10" />
          <span className="relative z-10">공유하기</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            공유하기
          </DialogTitle>
          <DialogDescription>특별한 순간을 함께 나눠보세요</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 py-4">
          {shareOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                  onClick={option.onClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{option.label}</p>
                        {option.id === "kakao" && (
                          <p className="text-sm text-muted-foreground">친구에게 공유하기</p>
                        )}
                        {option.id === "web" && (
                          <p className="text-sm text-muted-foreground">다른 앱으로 공유</p>
                        )}
                        {option.id === "copy" && (
                          <p className="text-sm text-muted-foreground">링크를 클립보드에 복사</p>
                        )}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={fullUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-muted-foreground outline-none"
              onClick={e => (e.target as HTMLInputElement).select()}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
