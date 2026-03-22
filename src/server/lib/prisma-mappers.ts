import type {
  Cv as PrismaCv,
  Candidate as PrismaCandidate,
  CandidateNote,
  CandidateHistory,
} from "@prisma/client"
import type { CV } from "@/app/(app)/utils/cv"
import type { Candidate } from "@/app/(app)/utils/candidates"

function parseSkillsJson(value: string): string[] {
  try {
    const v = JSON.parse(value) as unknown
    if (!Array.isArray(v)) return []
    return v.filter((x): x is string => typeof x === "string")
  } catch {
    return []
  }
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function mapCvToDto(row: PrismaCv): CV {
  return {
    id: row.id,
    nome: row.name,
    email: row.email,
    telefone: row.phone,
    cargo: row.jobTitle,
    experiencia: row.experience,
    localizacao: row.location,
    skills: parseSkillsJson(row.skills),
    status: row.status as CV["status"],
    dataSubmissao: formatDate(row.submittedAt),
    cvUrl: row.cvUrl,
    resumo: row.summary,
  }
}

export function mapCandidateToDto(
  row: PrismaCandidate & {
    notes: CandidateNote[]
    history: CandidateHistory[]
  },
): Candidate {
  return {
    id: row.id,
    nome: row.name,
    email: row.email,
    telefone: row.phone,
    cargo: row.jobTitle,
    experiencia: row.experience,
    localizacao: row.location,
    skills: parseSkillsJson(row.skills),
    status: row.status as Candidate["status"],
    dataSubmissao: formatDate(row.submittedAt),
    cvUrl: row.cvUrl,
    resumo: row.summary,
    favorito: row.isFavorite,
    rating: row.rating,
    fonte: row.source,
    salarioPretendido: row.expectedSalary ?? undefined,
    disponibilidade: row.availability ?? undefined,
    notas: row.notes.map((n) => ({
      id: n.id,
      autor: n.author,
      texto: n.text,
      data: formatDate(n.recordedAt),
    })),
    historico: row.history.map((h) => ({
      id: h.id,
      acao: h.action,
      autor: h.author,
      data: formatDate(h.recordedAt),
      detalhes: h.details ?? undefined,
    })),
  }
}
