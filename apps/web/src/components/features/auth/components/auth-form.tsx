"use client"

import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"
import type { AuthFormData } from "../types"

interface AuthFormProps {
  formData: AuthFormData
  isSignUp: boolean
  showPassword: boolean
  isLoading: boolean
  onFormDataChange: (data: AuthFormData) => void
  onShowPasswordToggle: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function AuthForm({
  formData,
  isSignUp,
  showPassword,
  isLoading,
  onFormDataChange,
  onShowPasswordToggle,
  onSubmit,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={e => onFormDataChange({ ...formData, email: e.target.value })}
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={e => onFormDataChange({ ...formData, password: e.target.value })}
            className="pl-10 pr-10"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={e => onFormDataChange({ ...formData, confirmPassword: e.target.value })}
              className="pl-10 pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={onShowPasswordToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            처리 중...
          </>
        ) : isSignUp ? (
          "회원가입"
        ) : (
          "로그인"
        )}
      </Button>
    </form>
  )
}
