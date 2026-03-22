import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { db } from "@/server/db"

export async function createTRPCContext(_opts: { headers: Headers }) {
  return { db }
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
