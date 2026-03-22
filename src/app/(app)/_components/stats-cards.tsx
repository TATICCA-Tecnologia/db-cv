"use client"

import { Users, FileCheck, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/react"

export function StatsCards() {
  const { data, isLoading, isError } = trpc.cv.dashboardStats.useQuery()

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as estatísticas.
      </p>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { totalCVs, novosCVs, emAnalise, aprovados } = data

  const stats = [
    {
      title: "Total de CVs",
      value: totalCVs,
      icon: Users,
      description: "Candidatos no banco",
      color: "text-foreground",
      bgColor: "bg-secondary",
    },
    {
      title: "Novos",
      value: novosCVs,
      icon: FileCheck,
      description: "Aguardando análise",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Em Análise",
      value: emAnalise,
      icon: Clock,
      description: "Em processo",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Aprovados",
      value: aprovados,
      icon: FileCheck,
      description: "Prontos para entrevista",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-card border-border hover:border-primary/50 transition-colors"
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stat.title}
                </p>
                <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {stat.description}
                </p>
              </div>
              <div
                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
