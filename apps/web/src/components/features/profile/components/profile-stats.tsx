"use client"

import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Calendar, Plane } from "lucide-react"

interface ProfileStatsProps {
  planningTrips: number
  totalPlans?: number
}

export function ProfileStats({ planningTrips, totalPlans }: ProfileStatsProps) {
  const stats = [
    {
      label: "계획 중인 여행",
      value: planningTrips,
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    ...(totalPlans !== undefined
      ? [
          {
            label: "전체 여행",
            value: totalPlans,
            icon: Plane,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
          },
        ]
      : []),
  ]

  return (
    <div
      className={`grid ${totalPlans !== undefined ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4 mb-8`}
    >
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 hover:scale-105"
        >
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
