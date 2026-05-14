import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { mapCvToDto } from "@/server/lib/prisma-mappers"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { extractCvFromPdf } from "@/server/ai/extract-cv"
import { mapGeminiExtractionToCvFields } from "@/server/jobs/google-sheet-cv-sync/map-gemini-extraction-to-cv"
import { upsertCvExtractionFromGemini } from "@/server/jobs/google-sheet-cv-sync/persist-cv-extraction"
import { getDocumentObjectBuffer } from "@/server/storage/minio"

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
      include: { extraction: true },
    })
    return rows.map(mapCvToDto)
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.cv.findUnique({
        where: { id: input.id },
        include: { extraction: true },
      })
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
      include: { extraction: true },
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
        include: { extraction: true },
      })
      return mapCvToDto(row)
    }),

  reextract: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const cv = await ctx.db.cv.findUnique({ where: { id: input.id } })
      if (!cv) {
        throw new TRPCError({ code: "NOT_FOUND", message: "CV não encontrado" })
      }

      let pdfBuffer: Buffer
      try {
        if (cv.storageKey) {
          pdfBuffer = await getDocumentObjectBuffer(cv.storageKey)
        } else {
          const res = await fetch(cv.cvUrl)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          pdfBuffer = Buffer.from(await res.arrayBuffer())
        }
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível baixar o PDF do CV.",
          cause: e,
        })
      }

      let extraction
      try {
        const { result } = await extractCvFromPdf(pdfBuffer)
        extraction = result
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha na extração por IA. Tente novamente.",
          cause: e,
        })
      }

      const fields = mapGeminiExtractionToCvFields(extraction)

      const row = await ctx.db.cv.update({
        where: { id: input.id },
        data: {
          aiSeen: true,
          ...(fields.name ? { name: fields.name } : {}),
          ...(fields.phone ? { phone: fields.phone } : {}),
          ...(fields.jobTitle ? { jobTitle: fields.jobTitle } : {}),
          ...(fields.experience ? { experience: fields.experience } : {}),
          ...(fields.location ? { location: fields.location } : {}),
          ...(fields.skills ? { skills: fields.skills } : {}),
          ...(fields.summary ? { summary: fields.summary } : {}),
        },
        include: { extraction: true },
      })
      await upsertCvExtractionFromGemini(input.id, extraction)

      const refreshed = await ctx.db.cv.findUnique({
        where: { id: input.id },
        include: { extraction: true },
      })
      return mapCvToDto(refreshed ?? row)
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

  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey?.trim()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Chave da API Gemini não configurada.",
        })
      }

      const rows = await ctx.db.cv.findMany({
        orderBy: { submittedAt: "desc" },
        include: { extraction: true },
        take: 300,
      })

      const cvDtos = rows.map(mapCvToDto)

      const candidateLines = cvDtos.map((cv) => {
        const skills = cv.skills.join(", ")
        const idiomas =
          cv.extracao?.idiomas
            .map((i) => `${i.idioma ?? ""}${i.nivel ? ` (${i.nivel})` : ""}`)
            .filter(Boolean)
            .join(", ") ?? ""
        const senioridade = cv.extracao?.analiseIa?.senioridade ?? ""
        const anos = cv.extracao?.analiseIa?.anosExperiencia

        return [
          `ID:${cv.id}`,
          `Nome:${cv.nome}`,
          `Cargo:${cv.cargo}`,
          `Local:${cv.localizacao}`,
          senioridade ? `Senioridade:${senioridade}` : null,
          anos ? `AnosExp:${anos}` : null,
          skills ? `Skills:${skills}` : null,
          idiomas ? `Idiomas:${idiomas}` : null,
          cv.resumo ? `Resumo:${cv.resumo.slice(0, 200)}` : null,
        ]
          .filter(Boolean)
          .join(" | ")
      })

      const historyText = input.messages
        .map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`)
        .join("\n")

      const prompt = `Você é um assistente de recrutamento especializado em busca de candidatos.
Responda sempre em português, seja direto e útil.
Retorne SOMENTE um JSON válido (sem blocos de código markdown) com este formato exato:
{"message":"sua resposta em texto","candidateIds":["id1","id2"]}

Regras:
- candidateIds deve conter apenas IDs que existam na lista abaixo
- Se não encontrar candidatos compatíveis, use candidateIds como []
- Explique brevemente por que cada candidato foi selecionado

=== BANCO DE CANDIDATOS (${cvDtos.length} candidatos) ===
${candidateLines.join("\n")}
=== FIM DO BANCO ===
${historyText ? `\n=== HISTÓRICO DA CONVERSA ===\n${historyText}\n=== FIM DO HISTÓRICO ===\n` : ""}
Usuário: ${input.message}`

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" },
      })

      let text: string
      try {
        const result = await model.generateContent(prompt)
        text = result.response.text()
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao consultar a IA. Tente novamente.",
          cause: e,
        })
      }

      let parsed: { message: string; candidateIds: string[] }
      try {
        const clean = text
          .trim()
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```$/, "")
          .trim()
        const raw = JSON.parse(clean) as { message?: string; candidateIds?: string[] }
        parsed = {
          message: raw.message ?? text,
          candidateIds: Array.isArray(raw.candidateIds) ? raw.candidateIds : [],
        }
      } catch {
        parsed = { message: text, candidateIds: [] }
      }

      const matchedCvs =
        parsed.candidateIds.length > 0
          ? await ctx.db.cv.findMany({
              where: { id: { in: parsed.candidateIds } },
              include: { extraction: true },
            })
          : []

      return {
        message: parsed.message,
        candidates: matchedCvs.map(mapCvToDto),
      }
    }),
})
