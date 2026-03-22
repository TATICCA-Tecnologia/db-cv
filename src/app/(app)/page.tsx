import { StatsCards } from "./_components/stats-cards"
import { CVList } from "./_components/cv-list"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do processo de recrutamento
        </p>
      </div>
      <StatsCards />
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">
          Candidatos Recentes
        </h2>
        <CVList />
      </div>
    </div>
  )
}
