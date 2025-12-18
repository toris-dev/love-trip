"use client"

import Link from "next/link"

export function InteractiveLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
          L
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        LOVETRIP
      </span>
    </Link>
  )
}

