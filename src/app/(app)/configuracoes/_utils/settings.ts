export interface PipelineStage {
  id: string
  name: string
  color: string
  order: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "recruiter" | "viewer"
  avatar?: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  type: "confirmation" | "interview" | "rejection" | "offer"
}

export const defaultPipeline: PipelineStage[] = [
  { id: "1", name: "Novo", color: "bg-blue-500", order: 1 },
  { id: "2", name: "Triagem", color: "bg-yellow-500", order: 2 },
  { id: "3", name: "Entrevista RH", color: "bg-orange-500", order: 3 },
  { id: "4", name: "Entrevista Técnica", color: "bg-purple-500", order: 4 },
  { id: "5", name: "Oferta", color: "bg-emerald-500", order: 5 },
  { id: "6", name: "Contratado", color: "bg-green-500", order: 6 },
]

export const defaultTeam: TeamMember[] = [
  { id: "1", name: "Ana Costa", email: "ana.costa@tatica.pt", role: "admin" },
  { id: "2", name: "Pedro Santos", email: "pedro.santos@tatica.pt", role: "recruiter" },
  { id: "3", name: "Carla Mendes", email: "carla.mendes@tatica.pt", role: "recruiter" },
  { id: "4", name: "Miguel Ferreira", email: "miguel.ferreira@tatica.pt", role: "viewer" },
]

export const defaultTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Confirmação de Candidatura",
    subject: "Recebemos a sua candidatura - {{cargo}}",
    type: "confirmation",
  },
  {
    id: "2",
    name: "Convite para Entrevista",
    subject: "Convite para Entrevista - {{cargo}}",
    type: "interview",
  },
  {
    id: "3",
    name: "Feedback Negativo",
    subject: "Atualização sobre a sua candidatura",
    type: "rejection",
  },
  {
    id: "4",
    name: "Proposta de Emprego",
    subject: "Proposta de Emprego - {{cargo}}",
    type: "offer",
  },
]

export const colorOptions = [
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-yellow-500", label: "Amarelo" },
  { value: "bg-orange-500", label: "Laranja" },
  { value: "bg-purple-500", label: "Roxo" },
  { value: "bg-emerald-500", label: "Esmeralda" },
  { value: "bg-green-500", label: "Verde" },
  { value: "bg-red-500", label: "Vermelho" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-cyan-500", label: "Ciano" },
]
