"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Avatar, AvatarFallback, AvatarImage } from "@lovetrip/ui/components/avatar"
import { Badge } from "@lovetrip/ui/components/badge"
import { Mail, Calendar, Camera, Edit2, Save, X } from "lucide-react"
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
  return (
    <Card className="mb-8 border-2">
      <CardHeader>
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
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  variant="secondary"
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

