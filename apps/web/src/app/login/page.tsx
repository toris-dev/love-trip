"use client"

import { Card, CardContent } from "@lovetrip/ui/components/card"
import Link from "next/link"
import {
  useAuthForm,
  useAuthActions,
  useOAuth,
  useAuthError,
  LoginHeader,
  AuthForm,
  OAuthButtons,
  AuthModeToggle,
} from "@lovetrip/user/components/auth"

export default function LoginPage() {
  const {
    formData,
    setFormData,
    isSignUp,
    showPassword,
    setShowPassword,
    toggleMode,
    resetPasswordFields,
  } = useAuthForm()

  const { isLoading: isAuthLoading, handleSignUp, handleSignIn } = useAuthActions()
  const { isLoading: isOAuthLoading, handleGoogleSignIn, handleKakaoSignIn } = useOAuth()
  useAuthError()

  const isLoading = isAuthLoading || isOAuthLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSignUp) {
      const result = await handleSignUp(formData)
      if (result.success) {
        // 이메일 확인 후 자동 로그인을 위해 잠시 대기
        setTimeout(() => {
          toggleMode()
          resetPasswordFields()
        }, 2000)
      }
    } else {
      const result = await handleSignIn(formData)
      if (result.success) {
        // 즉시 리다이렉트하고 새로고침
        window.location.href = "/"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <LoginHeader isSignUp={isSignUp} />
        <CardContent>
          <AuthForm
            formData={formData}
            isSignUp={isSignUp}
            showPassword={showPassword}
            isLoading={isLoading}
            onFormDataChange={setFormData}
            onShowPasswordToggle={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
          />

          <OAuthButtons
            isLoading={isLoading}
            onGoogleSignIn={handleGoogleSignIn}
            onKakaoSignIn={handleKakaoSignIn}
          />

          <AuthModeToggle isSignUp={isSignUp} onToggle={toggleMode} />

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
