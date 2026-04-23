"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
  Calendar,
  FolderKanban,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export type ActivePage = "dashboard" | "candidatos" | "vagas" | "pipeline" | "relatorios" | "configuracoes"

interface SidebarProps {
  user: {
    name: string
    email: string
  }
  onLogout: () => void
}

interface NavItem {
  id: ActivePage | string
  label: string
  icon: React.ElementType
  comingSoon?: boolean
  href?: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    ],
  },
  {
    title: "RECRUTAMENTO",
    items: [
      { id: "candidatos", label: "Candidatos", icon: Users, href: "/candidatos" },
      { id: "vagas", label: "Vagas", icon: Briefcase, comingSoon: true },
      { id: "pipeline", label: "Pipeline", icon: FolderKanban, comingSoon: true },
    ],
  },
  {
    title: "GESTÃO",
    items: [
      { id: "relatorios", label: "Relatórios", icon: BarChart3, comingSoon: true },
      { id: "entrevistas", label: "Entrevistas", icon: Calendar, comingSoon: true },
      { id: "emails", label: "Templates Email", icon: Mail, comingSoon: true },
    ],
  },
]

const footerItems: NavItem[] = [
  { id: "notificacoes", label: "Notificações", icon: Bell, comingSoon: true },
  // {
  //   id: "configuracoes",
  //   label: "Configurações",
  //   icon: Settings,
  //   href: "/configuracoes",
  // },
]

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const isActive =
      item.href === "/"
        ? pathname === "/"
        : item.href
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : false

    const className = cn(
      "w-full justify-start gap-3 h-11 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all",
      isActive && "bg-primary/15 text-primary border-l-2 border-primary rounded-l-none",
      collapsed && "justify-center px-2"
    )

    if (item.comingSoon || !item.href) {
      return (
        <Button variant="ghost" className={className} disabled={item.comingSoon}>
          <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              {item.comingSoon && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground"
                >
                  Em breve
                </Badge>
              )}
            </>
          )}
        </Button>
      )
    }

    return (
      <Button variant="ghost" className={className} asChild>
        <Link href={item.href}>
          <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
          {!collapsed && (
            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
          )}
        </Link>
      </Button>
    )
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">Banco CV</span>
              <span className="text-[10px] text-muted-foreground">by taticca</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 text-muted-foreground hover:text-foreground",
            collapsed && "absolute right-2"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="flex flex-col gap-6">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-1">
              {section.title && !collapsed && (
                <span className="text-[10px] font-semibold text-muted-foreground px-3 mb-1 tracking-wider">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => (
                <NavButton key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-sidebar-border">
        <div className="py-3 px-2 flex flex-col gap-1">
          {footerItems.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-11 px-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all",
              collapsed && "justify-center px-2"
            )}
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* User Profile */}
        <div className={cn(
          "p-4 flex items-center gap-3",
          collapsed && "justify-center p-3"
        )}>
          <Avatar className="h-9 w-9 bg-primary/20 border border-primary/30">
            <AvatarFallback className="bg-transparent text-primary text-xs font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
