"use client"

import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Heart, Calendar } from "lucide-react"

const stats = [
  { label: "완료한 여행", value: "12", icon: Heart },
  { label: "계획 중인 여행", value: "3", icon: Calendar },
  { label: "방문한 장소", value: "48", icon: Heart },
]

export function ProfileStats() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
        >
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

