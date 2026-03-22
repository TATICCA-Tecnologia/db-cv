import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { mapCvToDto } from "@/server/lib/prisma-mappers"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

const cvStatusZod = z.enum(["novo", "em_analise", "aprovado", "rejeitado"])

const cvWriteBase = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().min(1),
  cargo: z.string().min(1),
  experiencia: z.string().min(1),
  localizacao: z.string().min(1),
  skills: z.array(z.string()),
  status: cvStatusZod,
  dataSubmissao: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]),
  cvUrl: z.string().min(1),
  resumo: z.string(),
})

export const cvRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.cv.findMany({
      orderBy: { submittedAt: "desc" },
    })
    return rows.map(mapCvToDto)
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.cv.findUnique({ where: { id: input.id } })
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "CV não encontrado" })
      }
      return mapCvToDto(row)
    }),

  dashboardStats: publicProcedure.query(async ({ ctx }) => {
    const [totalCVs, novosCVs, emAnalise, aprovados] = await Promise.all([
      ctx.db.cv.count(),
      ctx.db.cv.count({ where: { status: "novo" } }),
      ctx.db.cv.count({ where: { status: "em_analise" } }),
      ctx.db.cv.count({ where: { status: "aprovado" } }),
    ])
    return { totalCVs, novosCVs, emAnalise, aprovados }
  }),

  create: publicProcedure.input(cvWriteBase).mutation(async ({ ctx, input }) => {
    const submittedAt =
      input.dataSubmissao.length === 10
        ? new Date(`${input.dataSubmissao}T12:00:00.000Z`)
        : new Date(input.dataSubmissao)
    const row = await ctx.db.cv.create({
      data: {
        name: input.nome,
        email: input.email,
        phone: input.telefone,
        jobTitle: input.cargo,
        experience: input.experiencia,
        location: input.localizacao,
        skills: JSON.stringify(input.skills),
        status: input.status,
        submittedAt,
        cvUrl: input.cvUrl,
        summary: input.resumo,
      },
    })
    return mapCvToDto(row)
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        data: cvWriteBase.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.cv.findUnique({ where: { id: input.id } })
      if (!exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "CV não encontrado" })
      }
      const patch = input.data
      const nextSubmittedAt =
        patch.dataSubmissao !== undefined
          ? patch.dataSubmissao.length === 10
            ? new Date(`${patch.dataSubmissao}T12:00:00.000Z`)
            : new Date(patch.dataSubmissao)
          : exists.submittedAt
      const nextSkills =
        patch.skills !== undefined
          ? JSON.stringify(patch.skills)
          : exists.skills
      const row = await ctx.db.cv.update({
        where: { id: input.id },
        data: {
          name: patch.nome ?? exists.name,
          email: patch.email ?? exists.email,
          phone: patch.telefone ?? exists.phone,
          jobTitle: patch.cargo ?? exists.jobTitle,
          experience: patch.experiencia ?? exists.experience,
          location: patch.localizacao ?? exists.location,
          skills: nextSkills,
          status: patch.status ?? exists.status,
          submittedAt: nextSubmittedAt,
          cvUrl: patch.cvUrl ?? exists.cvUrl,
          summary: patch.resumo ?? exists.summary,
        },
      })
      return mapCvToDto(row)
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.cv.delete({ where: { id: input.id } })
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "CV não encontrado" })
      }
      return { ok: true as const }
    }),
})
