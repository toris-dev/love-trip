export interface AuthFormData {
  email: string
  password: string
  confirmPassword: string
}

export type AuthMode = "login" | "signup"
