"use client"

import { useState, useEffect } from "react"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import type { ProfileData } from "../types"

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "홍길동",
    email: "hong@example.com",
    nickname: "",
    bio: "커플 여행을 좋아하는 여행러입니다. 새로운 곳을 탐험하는 것을 즐깁니다.",
    joinDate: "2024-01-01",
    avatar: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // 프로필 정보 가져오기
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, nickname, avatar_url")
          .eq("id", user.id)
          .single()

        setProfile(prev => ({
          ...prev,
          name: profileData?.display_name || user.user_metadata?.full_name || prev.name,
          email: user.email || prev.email,
          nickname: profileData?.nickname || prev.nickname,
          avatar: profileData?.avatar_url || prev.avatar,
        }))
      }
    }

    loadUser()
  }, [])

  const handleSave = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("로그인이 필요합니다")
      return
    }

    try {
      // 프로필 업데이트
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: profile.name,
        nickname: profile.nickname,
        avatar_url: profile.avatar || null,
      })

      if (error) throw error

      toast.success("프로필이 저장되었습니다")
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error(error instanceof Error ? error.message : "프로필 저장에 실패했습니다")
    }
  }

  return {
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    handleSave,
  }
}

