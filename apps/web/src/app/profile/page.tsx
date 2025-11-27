"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Camera,
  Edit2,
  Save,
  X,
  MapPin,
  Trophy,
  Star,
  Wallet,
  Key,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { Separator } from "@/components/ui/separator"
import { XPLevel, Achievements, PointsStats } from "@/components/gamification"
import { CoupleConnection } from "@/components/couple-connection"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState({
    name: "홍길동",
    email: "hong@example.com",
    nickname: "",
    bio: "커플 여행을 좋아하는 여행러입니다. 새로운 곳을 탐험하는 것을 즐깁니다.",
    joinDate: "2024-01-01",
    avatar: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  })

  const stats = [
    { label: "완료한 여행", value: "12", icon: Heart },
    { label: "계획 중인 여행", value: "3", icon: Calendar },
    { label: "방문한 장소", value: "48", icon: Heart },
  ]

  // 게이미피케이션 데이터
  const gamificationData = {
    level: 5,
    currentXP: 2450,
    xpToNextLevel: 3000,
    totalXP: 12450,
    points: 12500,
    streak: 7,
    completedTrips: 12,
    visitedPlaces: 48,
  }

  // 업적 데이터
  const achievements = [
    {
      id: "1",
      name: "첫 여행",
      description: "첫 번째 여행 계획을 완성하세요",
      icon: Heart,
      unlocked: true,
      rarity: "common" as const,
    },
    {
      id: "2",
      name: "탐험가",
      description: "10개의 장소를 방문하세요",
      icon: MapPin,
      unlocked: true,
      rarity: "rare" as const,
    },
    {
      id: "3",
      name: "여행 마스터",
      description: "10개의 여행을 완료하세요",
      icon: Trophy,
      unlocked: true,
      rarity: "epic" as const,
    },
    {
      id: "4",
      name: "연속 기록",
      description: "7일 연속으로 로그인하세요",
      icon: Calendar,
      unlocked: true,
      rarity: "rare" as const,
    },
    {
      id: "5",
      name: "사진 작가",
      description: "50개의 사진을 업로드하세요",
      icon: Camera,
      unlocked: false,
      progress: 32,
      maxProgress: 50,
      rarity: "common" as const,
    },
    {
      id: "6",
      name: "예산 관리자",
      description: "예산을 100% 정확하게 지키세요",
      icon: Wallet,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      rarity: "epic" as const,
    },
    {
      id: "7",
      name: "레벨 10 달성",
      description: "레벨 10에 도달하세요",
      icon: Star,
      unlocked: false,
      progress: 5,
      maxProgress: 10,
      rarity: "legendary" as const,
    },
    {
      id: "8",
      name: "100일 연속",
      description: "100일 연속으로 로그인하세요",
      icon: Calendar,
      unlocked: false,
      progress: 7,
      maxProgress: 100,
      rarity: "legendary" as const,
    },
    {
      id: "9",
      name: "모든 지역 탐험",
      description: "서울, 부산, 제주를 모두 방문하세요",
      icon: MapPin,
      unlocked: false,
      progress: 1,
      maxProgress: 3,
      rarity: "epic" as const,
    },
  ]

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

  const handleCancel = () => {
    setIsEditing(false)
    setShowPasswordChange(false)
    setShowEmailChange(false)
    // 변경사항 취소
  }

  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("모든 필드를 입력해주세요")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다")
      return
    }

    setIsPasswordLoading(true)
    try {
      const supabase = createClient()

      // 현재 비밀번호 확인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        toast.error("현재 비밀번호가 올바르지 않습니다")
        setIsPasswordLoading(false)
        return
      }

      // 비밀번호 변경
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        toast.error(updateError.message)
        setIsPasswordLoading(false)
        return
      }

      // 비밀번호 변경 알림 전송
      try {
        await fetch("/api/auth/notify-password-change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        console.error("Failed to send password change notification:", error)
      }

      toast.success("비밀번호가 변경되었습니다. 이메일로 알림이 전송되었습니다.")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleEmailChange = async () => {
    if (!emailData.newEmail || !emailData.password) {
      toast.error("모든 필드를 입력해주세요")
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailData.newEmail)) {
      toast.error("올바른 이메일 형식을 입력해주세요")
      return
    }

    if (emailData.newEmail === profile.email) {
      toast.error("새 이메일 주소가 현재 이메일과 동일합니다")
      return
    }

    setIsEmailLoading(true)
    try {
      const supabase = createClient()

      // 현재 비밀번호 확인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: emailData.password,
      })

      if (signInError) {
        toast.error("비밀번호가 올바르지 않습니다")
        setIsEmailLoading(false)
        return
      }

      // 이메일 변경 (이메일 확인 필요)
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailData.newEmail,
      })

      if (updateError) {
        toast.error(updateError.message)
        setIsEmailLoading(false)
        return
      }

      // 이메일 변경 알림 전송
      try {
        await fetch("/api/auth/notify-email-change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newEmail: emailData.newEmail,
            oldEmail: profile.email,
          }),
        })
      } catch (error) {
        console.error("Failed to send email change notification:", error)
      }

      toast.success(
        "이메일 변경 요청이 완료되었습니다. 새 이메일 주소로 확인 메일이 전송되었습니다."
      )
      setEmailData({
        newEmail: "",
        password: "",
      })
      setShowEmailChange(false)

      // 사용자 정보 새로고침
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser()
      if (updatedUser) {
        setProfile(prev => ({
          ...prev,
          email: updatedUser.email || prev.email,
        }))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "이메일 변경에 실패했습니다")
    } finally {
      setIsEmailLoading(false)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("로그아웃되었습니다")
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <Card className="mb-8 border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>프로필 정보</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      수정
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        취소
                      </Button>
                      <Button size="sm" onClick={handleSave}>
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
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
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
                              onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                              placeholder="고유한 닉네임을 입력하세요"
                          />
                            {profile.nickname && (
                              <Badge
                                variant="outline"
                                className="flex items-center whitespace-nowrap"
                              >
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
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
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

            {/* 게이미피케이션: XP 레벨 */}
            <div className="mb-8">
              <XPLevel
                currentXP={gamificationData.currentXP}
                level={gamificationData.level}
                xpToNextLevel={gamificationData.xpToNextLevel}
                totalXP={gamificationData.totalXP}
              />
            </div>

            {/* 게이미피케이션: 포인트 통계 */}
            <div className="mb-8">
              <PointsStats
                points={gamificationData.points}
                streak={gamificationData.streak}
                completedTrips={gamificationData.completedTrips}
                visitedPlaces={gamificationData.visitedPlaces}
              />
            </div>

            {/* 게이미피케이션: 업적 */}
            <div className="mb-8">
              <Achievements achievements={achievements} />
            </div>

            {/* 커플 연결 */}
            <div className="mb-8">
              <CoupleConnection />
            </div>

            {/* Stats */}
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

            {/* Settings */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  설정
                </CardTitle>
                <CardDescription>계정 및 알림 설정을 관리하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-semibold">알림 설정</h4>
                    <p className="text-sm text-muted-foreground">
                      여행 일정 알림을 받을 수 있습니다
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    설정
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-semibold">프라이버시</h4>
                    <p className="text-sm text-muted-foreground">프로필 공개 범위를 설정하세요</p>
                  </div>
                  <Button variant="outline" size="sm">
                    설정
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold">비밀번호 변경</h4>
                    <p className="text-sm text-muted-foreground">
                      계정 보안을 위해 비밀번호를 변경하세요
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowPasswordChange(!showPasswordChange)
                      setShowEmailChange(false)
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    변경
                  </Button>
                </div>
                {showPasswordChange && (
                  <Card className="mt-4 border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">비밀번호 변경</CardTitle>
                      <CardDescription>새 비밀번호를 입력해주세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">현재 비밀번호</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={e =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">새 비밀번호</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={e =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={e =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          placeholder="새 비밀번호를 다시 입력하세요"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasswordChange(false)
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            })
                          }}
                        >
                          취소
                        </Button>
                        <Button onClick={handlePasswordChange} disabled={isPasswordLoading}>
                          {isPasswordLoading ? "변경 중..." : "비밀번호 변경"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold">이메일 주소 변경</h4>
                    <p className="text-sm text-muted-foreground">계정 이메일 주소를 변경하세요</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowEmailChange(!showEmailChange)
                      setShowPasswordChange(false)
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    변경
                  </Button>
                </div>
                {showEmailChange && (
                  <Card className="mt-4 border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">이메일 주소 변경</CardTitle>
                      <CardDescription>
                        새 이메일 주소로 변경하면 확인 메일이 전송됩니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentEmail">현재 이메일</Label>
                        <Input id="currentEmail" value={profile.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">새 이메일 주소</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={emailData.newEmail}
                          onChange={e => setEmailData({ ...emailData, newEmail: e.target.value })}
                          placeholder="새 이메일 주소를 입력하세요"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailPassword">비밀번호 확인</Label>
                        <Input
                          id="emailPassword"
                          type="password"
                          value={emailData.password}
                          onChange={e => setEmailData({ ...emailData, password: e.target.value })}
                          placeholder="비밀번호를 입력하세요"
                        />
                        <p className="text-xs text-muted-foreground">
                          보안을 위해 비밀번호를 입력해주세요
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowEmailChange(false)
                            setEmailData({
                              newEmail: "",
                              password: "",
                            })
                          }}
                        >
                          취소
                        </Button>
                        <Button onClick={handleEmailChange} disabled={isEmailLoading}>
                          {isEmailLoading ? "변경 중..." : "이메일 변경"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold">로그아웃</h4>
                    <p className="text-sm text-muted-foreground">현재 계정에서 로그아웃합니다</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold">계정 삭제</h4>
                    <p className="text-sm text-muted-foreground">
                      계정과 모든 데이터를 영구적으로 삭제합니다
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
