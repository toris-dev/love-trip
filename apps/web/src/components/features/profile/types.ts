export interface ProfileData {
  name: string
  email: string
  nickname: string
  bio: string
  joinDate: string
  avatar: string
}

export interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface EmailData {
  newEmail: string
  password: string
}

export interface GamificationData {
  level: number
  currentXP: number
  xpToNextLevel: number
  totalXP: number
  points: number
  streak: number
  completedTrips: number
  visitedPlaces: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

