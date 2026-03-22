"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./_components/sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isReady) return
    if (!user) router.replace("/login")
  }, [user, isReady, router])

  if (!isReady || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">A carregar…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={user} onLogout={logout} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
