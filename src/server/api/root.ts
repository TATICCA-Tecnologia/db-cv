import { candidateRouter } from "@/server/api/routers/candidate"
import { cvRouter } from "@/server/api/routers/cv"
import { settingsRouter } from "@/server/api/routers/settings"
import { createTRPCRouter } from "@/server/api/trpc"

export const appRouter = createTRPCRouter({
  cv: cvRouter,
  candidate: candidateRouter,
  settings: settingsRouter,
})

export type AppRouter = typeof appRouter
