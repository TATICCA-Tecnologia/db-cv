"use client"

import { createContext, useContext, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export interface AuthUser {
  name: string
  email: string
}

type AuthContextValue = {
  user: AuthUser | null
  logout: () => void
  isReady: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }, [router])

  const user: AuthUser | null =
    session?.user?.email
      ? { name: session.user.name ?? session.user.email, email: session.user.email }
      : null

  const isReady = status !== "loading"

  return (
    <AuthContext.Provider value={{ user, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
