import type { CvExtractionResult } from "@/server/gemini/cv-extraction-schema"

export type CvGeminiMergeFields = {
  name?: string
  phone?: string
  jobTitle?: string
  experience?: string
  location?: string
  skills?: string
  summary?: string
}

function dedupeSkills(skills: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of skills) {
    const t = s.trim()
    const k = t.toLowerCase()
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out
}

export function mapGeminiExtractionToCvFields(
  ex: CvExtractionResult,
): CvGeminiMergeFields {
  const allSkills = dedupeSkills([
    ...ex.skills,
    ...ex.experiencias.flatMap((e) => e.skills),
    ...ex.analise_ia.principais_competencias,
  ])

  const experienceLines: string[] = []
  if (ex.analise_ia.anos_experiencia > 0) {
    experienceLines.push(`~${ex.analise_ia.anos_experiencia} anos (estimativa)`)
  }
  if (ex.analise_ia.senioridade) {
    experienceLines.push(`Nível: ${ex.analise_ia.senioridade}`)
  }
  for (const exp of ex.experiencias.slice(0, 12)) {
    const bits: string[] = []
    if (exp.cargo) bits.push(exp.cargo)
    if (exp.empresa) bits.push(exp.empresa)
    const period = [exp.data_inicio, exp.data_fim].filter(Boolean).join(" → ")
    if (period) bits.push(`(${period})`)
    if (bits.length) experienceLines.push(bits.join(" "))
  }

  const jobTitle =
    ex.experiencias[0]?.cargo?.trim() ||
    ex.analise_ia.area_profissional?.trim() ||
    ""

  const summary = ex.resumo_profissional?.trim() || ""
  const location = ex.dados_pessoais.localizacao?.trim() || ""
  const name = ex.dados_pessoais.nome?.trim() || ""
  const phone = ex.dados_pessoais.telefone?.trim() || ""

  const experienceBlock = experienceLines.join("\n").slice(0, 8000)

  return {
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
    ...(jobTitle ? { jobTitle } : {}),
    ...(experienceBlock ? { experience: experienceBlock } : {}),
    ...(location ? { location } : {}),
    ...(allSkills.length ? { skills: JSON.stringify(allSkills) } : {}),
    ...(summary ? { summary } : {}),
  }
}
