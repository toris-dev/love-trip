"use client"

import { User } from "lucide-react"

export function ProfileHeader() {
  return (
    <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            프로필
          </h1>
          <p className="text-lg text-muted-foreground">
            프로필 정보를 관리하고 여행 통계를 확인하세요
          </p>
        </div>
      </div>
    </section>
  )
}

