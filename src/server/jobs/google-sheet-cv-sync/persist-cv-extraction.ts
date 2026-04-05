import type { Prisma } from "@prisma/client"
import { db } from "@/server/db"
import type { CvExtractionResult } from "@/server/gemini/cv-extraction-schema"

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

export async function upsertCvExtractionFromGemini(
  cvId: string,
  ex: CvExtractionResult,
): Promise<void> {
  const dp = ex.dados_pessoais
  const ai = ex.analise_ia

  const data = {
    nome: dp.nome,
    email: dp.email,
    telefone: dp.telefone,
    localizacao: dp.localizacao,
    linkedin: dp.linkedin,
    github: dp.github,
    portfolio: dp.portfolio,
    resumoProfissional: ex.resumo_profissional,
    experiencias: asJson(ex.experiencias),
    educacao: asJson(ex.educacao),
    skills: asJson(ex.skills),
    idiomas: asJson(ex.idiomas),
    certificacoes: asJson(ex.certificacoes),
    projetos: asJson(ex.projetos),
    areaProfissional: ai.area_profissional,
    senioridade: ai.senioridade,
    anosExperiencia: ai.anos_experiencia,
    principaisCompetencias: asJson(ai.principais_competencias),
  }

  await db.cvExtraction.upsert({
    where: { cvId },
    create: { cvId, ...data },
    update: data,
  })
}
