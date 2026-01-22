"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Separator } from "@lovetrip/ui/components/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lovetrip/ui/components/dialog"
import { Switch } from "@lovetrip/ui/components/switch"
import { Settings, Key, LogOut, AlertTriangle } from "lucide-react"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import { usePasswordChange } from "../hooks/use-password-change"
import type { ProfileData } from "../types"

interface SettingsSectionProps {
  profile: ProfileData
  onProfileChange: (profile: ProfileData) => void
  onLogout: () => void
}

export const SettingsSection = memo(function SettingsSection({
  profile,
  onLogout,
}: SettingsSectionProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)
  const [privacyEnabled, setPrivacyEnabled] = useState(false)
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    passwordData,
    setPasswordData,
    isLoading: isPasswordLoading,
    showPasswordChange,
    setShowPasswordChange,
    handlePasswordChange,
  } = usePasswordChange(profile.email)

  // 초기 설정 로드 (알림 설정 + 프라이버시 설정)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("notifications_enabled, is_public")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error loading settings:", error)
          return
        }

        if (profileData?.notifications_enabled !== undefined) {
          setNotificationsEnabled(profileData.notifications_enabled)
        }
        if (profileData?.is_public !== undefined) {
          setPrivacyEnabled(profileData.is_public)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [])

  // 알림 설정 토글 변경 핸들러
  const handleNotificationsChange = useCallback(
    async (checked: boolean) => {
      setIsUpdatingNotifications(true)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error("로그인이 필요합니다")
          return
        }

        const { error } = await supabase
          .from("profiles")
          .update({ notifications_enabled: checked })
          .eq("id", user.id)

        if (error) throw error

        setNotificationsEnabled(checked)
        toast.success(
          checked ? "알림이 활성화되었습니다" : "알림이 비활성화되었습니다"
        )
      } catch (error) {
        console.error("Error updating notifications setting:", error)
        toast.error(
          error instanceof Error
            ? error.message
            : "알림 설정 변경에 실패했습니다"
        )
        // 실패 시 이전 상태로 되돌리기
        setNotificationsEnabled(!checked)
      } finally {
        setIsUpdatingNotifications(false)
      }
    },
    []
  )

  // 프라이버시 토글 변경 핸들러
  const handlePrivacyChange = useCallback(
    async (checked: boolean) => {
      setIsUpdatingPrivacy(true)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error("로그인이 필요합니다")
          return
        }

        const { error } = await supabase
          .from("profiles")
          .update({ is_public: checked })
          .eq("id", user.id)

        if (error) throw error

        setPrivacyEnabled(checked)
        toast.success(
          checked ? "프로필이 공개로 설정되었습니다" : "프로필이 비공개로 설정되었습니다"
        )
      } catch (error) {
        console.error("Error updating privacy setting:", error)
        toast.error(
          error instanceof Error
            ? error.message
            : "프로필 공개 설정 변경에 실패했습니다"
        )
        // 실패 시 이전 상태로 되돌리기
        setPrivacyEnabled(!checked)
      } finally {
        setIsUpdatingPrivacy(false)
      }
    },
    []
  )

  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "계정 삭제에 실패했습니다")
      }

      const data = await response.json()
      toast.success(data.message || "계정 삭제가 요청되었습니다. 90일 후 영구적으로 삭제됩니다.")

      // 로그아웃 처리
      setTimeout(() => {
        onLogout()
      }, 2000) // 2초 후 로그아웃하여 메시지를 볼 수 있도록
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error(error instanceof Error ? error.message : "계정 삭제에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }, [onLogout])

  const handleTogglePasswordChange = useCallback(() => {
    setShowPasswordChange((prev) => !prev)
  }, [setShowPasswordChange])

  const handleCancelPasswordChange = useCallback(() => {
    setShowPasswordChange(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }, [setShowPasswordChange, setPasswordData])

  const handleOpenDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleCloseDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  const handleCurrentPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData({ ...passwordData, currentPassword: e.target.value })
    },
    [passwordData, setPasswordData]
  )

  const handleNewPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData({ ...passwordData, newPassword: e.target.value })
    },
    [passwordData, setPasswordData]
  )

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
    },
    [passwordData, setPasswordData]
  )

  return (
    <Card className="border-2">
      <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          설정
        </CardTitle>
        <CardDescription>계정 및 알림 설정을 관리하세요</CardDescription>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          <div className="flex-1">
            <h4 className="font-semibold">알림 설정</h4>
            <p className="text-sm text-muted-foreground">여행 일정 알림을 받을 수 있습니다</p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationsChange}
            disabled={isUpdatingNotifications}
            className="ml-4"
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          <div className="flex-1">
            <h4 className="font-semibold">프라이버시</h4>
            <p className="text-sm text-muted-foreground">프로필 공개 범위를 설정하세요</p>
          </div>
          <Switch
            checked={privacyEnabled}
            onCheckedChange={handlePrivacyChange}
            disabled={isUpdatingPrivacy}
            className="ml-4"
          />
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
            onClick={handleTogglePasswordChange}
          >
            <Key className="h-4 w-4 mr-2" />
            변경
          </Button>
        </div>
        {showPasswordChange && (
          <Card className="mt-4 border-2">
            <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
              <CardTitle className="text-lg">비밀번호 변경</CardTitle>
              <CardDescription>새 비밀번호를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handleCurrentPasswordChange}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handleNewPasswordChange}
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelPasswordChange}
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
            <h4 className="font-semibold">로그아웃</h4>
            <p className="text-sm text-muted-foreground">현재 계정에서 로그아웃합니다</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 hover:bg-destructive/5 transition-colors">
          <div>
            <h4 className="font-semibold text-destructive">계정 삭제</h4>
            <p className="text-sm text-muted-foreground">계정과 모든 데이터를 영구적으로 삭제합니다</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleOpenDeleteConfirm}>
            삭제
          </Button>
        </div>
      </CardContent>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              계정 삭제 확인
            </DialogTitle>
            <DialogDescription className="pt-2">
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 다음 데이터가 영구적으로 삭제됩니다:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>프로필 정보 및 설정</li>
              <li>모든 여행 계획 및 코스</li>
              <li>업로드한 사진 및 메모리</li>
              <li>업적 및 경험치</li>
              <li>커플 연결 정보</li>
            </ul>
            <p className="pt-4 text-sm font-semibold text-destructive">
              이 작업은 취소할 수 없습니다.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDeleteConfirm}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "계정 삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
})

