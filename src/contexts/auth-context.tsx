"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useRouter } from "next/navigation"

const STORAGE_KEY = "banco-cv-session"

export interface AuthUser {
  name: string
  email: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string) => void
  logout: () => void
  isReady: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw) as AuthUser)
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [user, isReady])

  const login = useCallback(
    (email: string) => {
      setUser({ name: "Administrador Tática", email })
      router.push("/")
    },
    [router],
  )

  const logout = useCallback(() => {
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
