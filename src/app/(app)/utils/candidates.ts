export interface Note {
  id: string
  autor: string
  texto: string
  data: string
}

export interface HistoryItem {
  id: string
  acao: string
  autor: string
  data: string
  detalhes?: string
}

export interface Candidate {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
  experiencia: string
  localizacao: string
  skills: string[]
  status:
    | "novo"
    | "triagem"
    | "entrevista_rh"
    | "entrevista_tecnica"
    | "oferta"
    | "contratado"
    | "rejeitado"
  dataSubmissao: string
  cvUrl: string
  resumo: string
  favorito: boolean
  rating: number
  fonte: string
  salarioPretendido?: string
  disponibilidade?: string
  notas: Note[]
  historico: HistoryItem[]
}

export const pipelineStages = [
  { id: "novo", label: "Novos", color: "bg-blue-500" },
  { id: "triagem", label: "Triagem", color: "bg-yellow-500" },
  { id: "entrevista_rh", label: "Entrevista RH", color: "bg-orange-500" },
  { id: "entrevista_tecnica", label: "Entrevista Técnica", color: "bg-purple-500" },
  { id: "oferta", label: "Oferta", color: "bg-primary" },
  { id: "contratado", label: "Contratado", color: "bg-green-500" },
] as const

export const candidateStatusColors: Record<Candidate["status"], string> = {
  novo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  triagem: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  entrevista_rh: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  entrevista_tecnica: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  oferta: "bg-primary/20 text-primary border-primary/30",
  contratado: "bg-green-500/20 text-green-400 border-green-500/30",
  rejeitado: "bg-destructive/20 text-destructive border-destructive/30",
}

export const candidateStatusLabels: Record<Candidate["status"], string> = {
  novo: "Novo",
  triagem: "Triagem",
  entrevista_rh: "Entrevista RH",
  entrevista_tecnica: "Entrevista Técnica",
  oferta: "Oferta",
  contratado: "Contratado",
  rejeitado: "Rejeitado",
}
