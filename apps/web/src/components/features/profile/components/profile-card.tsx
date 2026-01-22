"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Avatar, AvatarFallback, AvatarImage } from "@lovetrip/ui/components/avatar"
import { Badge } from "@lovetrip/ui/components/badge"
import { Mail, Calendar, Camera, Edit2, Save, X, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { validateImageFile } from "@/lib/security/file-validation"
import type { ProfileData } from "../types"

interface ProfileCardProps {
  profile: ProfileData
  isEditing: boolean
  onProfileChange: (profile: ProfileData) => void
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function ProfileCard({
  profile,
  isEditing,
  onProfileChange,
  onEdit,
  onCancel,
  onSave,
}: ProfileCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 클라이언트 사이드 파일 검증 (보안 강화)
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || "파일 검증에 실패했습니다", {
        icon: <AlertTriangle className="h-4 w-4" />,
      })
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "이미지 업로드에 실패했습니다")
      }

      const { avatarUrl } = await response.json()
      onProfileChange({ ...profile, avatar: avatarUrl })
      toast.success("프로필 이미지가 업로드되었습니다")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다")
    } finally {
      setIsUploading(false)
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Card className="mb-8 border-2">
      <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="flex items-center justify-between">
          <CardTitle>프로필 정보</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              수정
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative inline-block">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Avatar
                className={`h-24 w-24 border-4 border-primary/20 ${
                  isUploading ? "opacity-50 cursor-wait" : "cursor-pointer hover:border-primary/40"
                } transition-all duration-200`}
                onClick={handleAvatarClick}
              >
                <AvatarImage
                  src={profile.avatar || "/placeholder-user.jpg"}
                  alt={profile.name}
                />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              {!isUploading && (
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md"
                  variant="secondary"
                  onClick={e => {
                    e.stopPropagation()
                    handleAvatarClick()
                  }}
                  title="프로필 이미지 변경"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={e => onProfileChange({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">
                    닉네임{" "}
                    <span className="text-xs text-muted-foreground">
                      (커플 연결용 고유 닉네임)
                    </span>
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="nickname"
                      value={profile.nickname}
                      onChange={e => onProfileChange({ ...profile, nickname: e.target.value })}
                      placeholder="고유한 닉네임을 입력하세요"
                    />
                    {profile.nickname && (
                      <Badge variant="outline" className="flex items-center whitespace-nowrap">
                        @{profile.nickname}
                      </Badge>
                    )}
                  </div>
                  {profile.nickname && (
                    <p className="text-xs text-muted-foreground">
                      이 닉네임으로 다른 사용자가 당신을 찾을 수 있습니다
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">소개</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={e => onProfileChange({ ...profile, bio: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
                  {profile.nickname && (
                    <Badge variant="secondary" className="mt-1">
                      @{profile.nickname}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {profile.email}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  가입일: {new Date(profile.joinDate).toLocaleDateString("ko-KR")}
                </div>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

