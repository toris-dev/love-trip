"use client"

import { CardDescription, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Heart } from "lucide-react"

interface LoginHeaderProps {
  isSignUp: boolean
}

export function LoginHeader({ isSignUp }: LoginHeaderProps) {
  return (
    <CardHeader className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="p-3 rounded-full bg-primary/10">
          <Heart className="h-8 w-8 text-primary fill-primary" />
        </div>
      </div>
      <div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          LOVETRIP
        </CardTitle>
        <CardDescription className="mt-2 text-base">
          {isSignUp ? "새로운 계정 만들기" : "로그인하여 여행을 시작하세요"}
        </CardDescription>
      </div>
    </CardHeader>
  )
}

