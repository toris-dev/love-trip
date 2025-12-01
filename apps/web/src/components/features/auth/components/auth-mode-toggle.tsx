"use client"

interface AuthModeToggleProps {
  isSignUp: boolean
  onToggle: () => void
}

export function AuthModeToggle({ isSignUp, onToggle }: AuthModeToggleProps) {
  return (
    <div className="mt-6 text-center text-sm">
      <button
        type="button"
        onClick={onToggle}
        className="text-primary hover:underline"
      >
        {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
      </button>
    </div>
  )
}

