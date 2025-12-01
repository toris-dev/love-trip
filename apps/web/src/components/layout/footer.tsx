"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              <h3 className="text-xl font-bold text-primary">LOVETRIP</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              연인과의 여행을 위해 교통편, 숙소, 데이트 장소, 경비를 한 번에 추천해주는 커플 맞춤 여행 서비스
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 LOVETRIP. All rights reserved.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">지원</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  내 프로필
                </Link>
              </li>
              <li>
                <Link href="/my-trips" className="text-muted-foreground hover:text-foreground transition-colors">
                  내 여행
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
