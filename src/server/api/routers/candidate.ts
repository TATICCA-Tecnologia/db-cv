import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { mapCandidateToDto } from "@/server/lib/prisma-mappers"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

const candidateStatusZod = z.enum([
  "novo",
  "triagem",
  "entrevista_rh",
  "entrevista_tecnica",
  "oferta",
  "contratado",
  "rejeitado",
])

const candidateWriteBase = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().min(1),
  cargo: z.string().min(1),
  experiencia: z.string().min(1),
  localizacao: z.string().min(1),
  skills: z.array(z.string()),
  status: candidateStatusZod,
  dataSubmissao: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]),
  cvUrl: z.string().min(1),
  resumo: z.string(),
  favorito: z.boolean().optional(),
  rating: z.number().int().min(0).max(5).optional(),
  fonte: z.string().min(1),
  salarioPretendido: z.string().optional(),
  disponibilidade: z.string().optional(),
})

function parseDateInput(value: string): Date {
  return value.length === 10
    ? new Date(`${value}T12:00:00.000Z`)
    : new Date(value)
}

export const candidateRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.candidate.findMany({
      orderBy: { submittedAt: "desc" },
      include: {
        notes: { orderBy: { recordedAt: "asc" } },
        history: { orderBy: { recordedAt: "asc" } },
      },
    })
    return rows.map(mapCandidateToDto)
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.candidate.findUnique({
        where: { id: input.id },
        include: {
          notes: { orderBy: { recordedAt: "asc" } },
          history: { orderBy: { recordedAt: "asc" } },
        },
      })
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato não encontrado",
        })
      }
      return mapCandidateToDto(row)
    }),

  create: publicProcedure
    .input(candidateWriteBase)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.candidate.create({
        data: {
          name: input.nome,
          email: input.email,
          phone: input.telefone,
          jobTitle: input.cargo,
          experience: input.experiencia,
          location: input.localizacao,
          skills: JSON.stringify(input.skills),
          status: input.status,
          submittedAt: parseDateInput(input.dataSubmissao),
          cvUrl: input.cvUrl,
          summary: input.resumo,
          isFavorite: input.favorito ?? false,
          rating: input.rating ?? 0,
          source: input.fonte,
          expectedSalary: input.salarioPretendido,
          availability: input.disponibilidade,
        },
        include: {
          notes: true,
          history: true,
        },
      })
      return mapCandidateToDto(row)
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        data: candidateWriteBase.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.candidate.findUnique({ where: { id: input.id } })
      if (!exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato não encontrado",
        })
      }
      const patch = input.data
      const nextSubmittedAt =
        patch.dataSubmissao !== undefined
          ? parseDateInput(patch.dataSubmissao)
          : exists.submittedAt
      const nextSkills =
        patch.skills !== undefined
          ? JSON.stringify(patch.skills)
          : exists.skills
      const row = await ctx.db.candidate.update({
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
          isFavorite: patch.favorito ?? exists.isFavorite,
          rating: patch.rating ?? exists.rating,
          source: patch.fonte ?? exists.source,
          expectedSalary:
            patch.salarioPretendido !== undefined
              ? patch.salarioPretendido
              : exists.expectedSalary,
          availability:
            patch.disponibilidade !== undefined
              ? patch.disponibilidade
              : exists.availability,
        },
        include: {
          notes: { orderBy: { recordedAt: "asc" } },
          history: { orderBy: { recordedAt: "asc" } },
        },
      })
      return mapCandidateToDto(row)
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: candidateStatusZod,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.candidate.update({
        where: { id: input.id },
        data: { status: input.status },
        include: {
          notes: { orderBy: { recordedAt: "asc" } },
          history: { orderBy: { recordedAt: "asc" } },
        },
      })
      return mapCandidateToDto(row)
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.candidate.delete({ where: { id: input.id } })
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato não encontrado",
        })
      }
      return { ok: true as const }
    }),

  addNote: publicProcedure
    .input(
      z.object({
        candidateId: z.string().min(1),
        autor: z.string().min(1),
        texto: z.string().min(1),
        data: z
          .union([
            z.string().datetime(),
            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          ])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.candidate.findUnique({
        where: { id: input.candidateId },
      })
      if (!exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato não encontrado",
        })
      }
      const recordedAt = input.data ? parseDateInput(input.data) : new Date()
      await ctx.db.candidateNote.create({
        data: {
          candidateId: input.candidateId,
          author: input.autor,
          text: input.texto,
          recordedAt,
        },
      })
      const row = await ctx.db.candidate.findUniqueOrThrow({
        where: { id: input.candidateId },
        include: {
          notes: { orderBy: { recordedAt: "asc" } },
          history: { orderBy: { recordedAt: "asc" } },
        },
      })
      return mapCandidateToDto(row)
    }),

  addHistory: publicProcedure
    .input(
      z.object({
        candidateId: z.string().min(1),
        acao: z.string().min(1),
        autor: z.string().min(1),
        detalhes: z.string().optional(),
        data: z
          .union([
            z.string().datetime(),
            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          ])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.candidate.findUnique({
        where: { id: input.candidateId },
      })
      if (!exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato não encontrado",
        })
      }
      const recordedAt = input.data ? parseDateInput(input.data) : new Date()
      await ctx.db.candidateHistory.create({
        data: {
          candidateId: input.candidateId,
          action: input.acao,
          author: input.autor,
          details: input.detalhes,
          recordedAt,
        },
      })
      const row = await ctx.db.candidate.findUniqueOrThrow({
        where: { id: input.candidateId },
        include: {
          notes: { orderBy: { recordedAt: "asc" } },
          history: { orderBy: { recordedAt: "asc" } },
        },
      })
      return mapCandidateToDto(row)
    }),
})
