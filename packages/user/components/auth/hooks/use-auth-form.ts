"use client"

import { useState } from "react"
import type { AuthFormData } from "../types"

export function useAuthForm() {
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setFormData({ email: formData.email, password: "", confirmPassword: "" })
  }

  const resetPasswordFields = () => {
    setFormData({ ...formData, password: "", confirmPassword: "" })
  }

  return {
    formData,
    setFormData,
    isSignUp,
    setIsSignUp,
    showPassword,
    setShowPassword,
    toggleMode,
    resetPasswordFields,
  }
}

