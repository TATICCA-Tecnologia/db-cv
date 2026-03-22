"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "./_components/login-form"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { user, login, isReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isReady && user) router.replace("/")
  }, [user, isReady, router])

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">A carregar…</p>
      </div>
    )
  }

  if (user) return null

  return <LoginForm onLogin={(email) => login(email)} />
}
