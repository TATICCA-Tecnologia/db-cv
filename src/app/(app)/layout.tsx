import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AppShell } from "./_components/app-shell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) redirect("/login")

  return <AppShell>{children}</AppShell>
}
