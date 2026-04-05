import { coerceNumber } from "@/utils/toNumber"
import { z } from "zod"

const strOrNull = z.union([z.string(), z.null()])
const boolOrNull = z.union([z.boolean(), z.null()])

const dadosPessoaisSchema = z.object({
  nome: strOrNull.optional(),
  email: strOrNull.optional(),
  telefone: strOrNull.optional(),
  localizacao: strOrNull.optional(),
  linkedin: strOrNull.optional(),
  github: strOrNull.optional(),
  portfolio: strOrNull.optional(),
})

const experienciaSchema = z.object({
  empresa: strOrNull.optional(),
  cargo: strOrNull.optional(),
  data_inicio: strOrNull.optional(),
  data_fim: strOrNull.optional(),
  atual: boolOrNull.optional(),
  descricao: strOrNull.optional(),
  skills: z.array(z.string()).optional(),
})

const educacaoSchema = z.object({
  instituicao: strOrNull.optional(),
  curso: strOrNull.optional(),
  grau: strOrNull.optional(),
  data_inicio: strOrNull.optional(),
  data_fim: strOrNull.optional(),
})

const idiomaSchema = z.object({
  idioma: strOrNull.optional(),
  nivel: strOrNull.optional(),
})

const certificacaoSchema = z.object({
  nome: strOrNull.optional(),
  instituicao: strOrNull.optional(),
  data: strOrNull.optional(),
})

const projetoSchema = z.object({
  nome: strOrNull.optional(),
  descricao: strOrNull.optional(),
  tecnologias: z.array(z.string()).optional(),
  link: strOrNull.optional(),
})

const analiseIaSchema = z.object({
  area_profissional: strOrNull.optional(),
  senioridade: strOrNull.optional(),
  anos_experiencia: z.union([z.number(), z.string(), z.null()]).optional(),
  principais_competencias: z.array(z.string()).optional(),
})

export const cvExtractionResultSchema = z
  .object({
    dados_pessoais: dadosPessoaisSchema.optional(),
    resumo_profissional: strOrNull.optional(),
    experiencias: z.array(experienciaSchema).optional(),
    educacao: z.array(educacaoSchema).optional(),
    skills: z.array(z.string()).optional(),
    idiomas: z.array(idiomaSchema).optional(),
    certificacoes: z.array(certificacaoSchema).optional(),
    projetos: z.array(projetoSchema).optional(),
    analise_ia: analiseIaSchema.optional(),
  })
  .transform((data) => {
    const exp = (data.experiencias ?? []).map((e) => ({
      empresa: e.empresa ?? null,
      cargo: e.cargo ?? null,
      data_inicio: e.data_inicio ?? null,
      data_fim: e.data_fim ?? null,
      atual: e.atual ?? null,
      descricao: e.descricao ?? null,
      skills: e.skills ?? [],
    }))
    const edu = (data.educacao ?? []).map((e) => ({
      instituicao: e.instituicao ?? null,
      curso: e.curso ?? null,
      grau: e.grau ?? null,
      data_inicio: e.data_inicio ?? null,
      data_fim: e.data_fim ?? null,
    }))
    const idiomas = (data.idiomas ?? []).map((i) => ({
      idioma: i.idioma ?? null,
      nivel: i.nivel ?? null,
    }))
    const certs = (data.certificacoes ?? []).map((c) => ({
      nome: c.nome ?? null,
      instituicao: c.instituicao ?? null,
      data: c.data ?? null,
    }))
    const projetos = (data.projetos ?? []).map((p) => ({
      nome: p.nome ?? null,
      descricao: p.descricao ?? null,
      tecnologias: p.tecnologias ?? [],
      link: p.link ?? null,
    }))
    const dp = data.dados_pessoais ?? {}
    const ai = data.analise_ia ?? {}
    return {
      dados_pessoais: {
        nome: dp.nome ?? null,
        email: dp.email ?? null,
        telefone: dp.telefone ?? null,
        localizacao: dp.localizacao ?? null,
        linkedin: dp.linkedin ?? null,
        github: dp.github ?? null,
        portfolio: dp.portfolio ?? null,
      },
      resumo_profissional: data.resumo_profissional ?? null,
      experiencias: exp,
      educacao: edu,
      skills: data.skills ?? [],
      idiomas,
      certificacoes: certs,
      projetos,
      analise_ia: {
        area_profissional: ai.area_profissional ?? null,
        senioridade: ai.senioridade ?? null,
        anos_experiencia: coerceNumber(ai.anos_experiencia),
        principais_competencias: ai.principais_competencias ?? [],
      },
    }
  })

export type CvExtractionResult = z.infer<typeof cvExtractionResultSchema>
