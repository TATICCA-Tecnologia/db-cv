import { candidateRouter } from "@/server/api/routers/candidate"
import { cvRouter } from "@/server/api/routers/cv"
import { settingsRouter } from "@/server/api/routers/settings"
import { authRouter } from "@/server/api/routers/auth"
import { createTRPCRouter } from "@/server/api/trpc"

export const appRouter = createTRPCRouter({
  cv: cvRouter,
  candidate: candidateRouter,
  settings: settingsRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
