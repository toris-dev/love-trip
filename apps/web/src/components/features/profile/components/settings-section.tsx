"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Separator } from "@lovetrip/ui/components/separator"
import { Settings, Key, Mail, LogOut } from "lucide-react"
import { usePasswordChange } from "../hooks/use-password-change"
import { useEmailChange } from "../hooks/use-email-change"
import type { ProfileData } from "../types"

interface SettingsSectionProps {
  profile: ProfileData
  onProfileChange: (profile: ProfileData) => void
  onLogout: () => void
}

export function SettingsSection({
  profile,
  onProfileChange,
  onLogout,
}: SettingsSectionProps) {
  const {
    passwordData,
    setPasswordData,
    isLoading: isPasswordLoading,
    showPasswordChange,
    setShowPasswordChange,
    handlePasswordChange,
  } = usePasswordChange(profile.email)

  const {
    emailData,
    setEmailData,
    isLoading: isEmailLoading,
    showEmailChange,
    setShowEmailChange,
    handleEmailChange,
  } = useEmailChange(profile, onProfileChange)

  return (
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
            <p className="text-sm text-muted-foreground">여행 일정 알림을 받을 수 있습니다</p>
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
              <CardDescription>새 이메일 주소로 변경하면 확인 메일이 전송됩니다</CardDescription>
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
                <p className="text-xs text-muted-foreground">보안을 위해 비밀번호를 입력해주세요</p>
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
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          <div>
            <h4 className="font-semibold">계정 삭제</h4>
            <p className="text-sm text-muted-foreground">계정과 모든 데이터를 영구적으로 삭제합니다</p>
          </div>
          <Button variant="destructive" size="sm">
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

