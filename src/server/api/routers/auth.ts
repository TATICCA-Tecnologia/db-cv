import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import bcrypt from "bcryptjs"
import { TRPCError } from "@trpc/server"

export const authRouter = createTRPCRouter({
  changePassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        newPassword: z.string().min(8, "Mínimo 8 caracteres"),
        confirmPassword: z.string(),
      }).refine((d) => d.newPassword === d.confirmPassword, {
        message: "As palavras-passe não coincidem",
        path: ["confirmPassword"],
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { email: input.email } })
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Utilizador não encontrado" })

      const hashed = await bcrypt.hash(input.newPassword, 12)
      await ctx.db.user.update({
        where: { email: input.email },
        data: { password: hashed, mustChangePassword: false },
      })

      return { success: true }
    }),
})
