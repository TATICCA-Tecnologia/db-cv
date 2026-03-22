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

export const mockCandidates: Candidate[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "+351 912 345 678",
    cargo: "Desenvolvedor Full Stack",
    experiencia: "5 anos",
    localizacao: "Lisboa, Portugal",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    status: "entrevista_tecnica",
    dataSubmissao: "2024-03-15",
    cvUrl: "/cvs/joao-silva.pdf",
    resumo:
      "Desenvolvedor experiente com foco em aplicações web modernas. Especializado em React e Node.js com forte experiência em arquitetura de microsserviços.",
    favorito: true,
    rating: 4,
    fonte: "LinkedIn",
    salarioPretendido: "45.000€ - 55.000€",
    disponibilidade: "Imediata",
    notas: [
      {
        id: "n1",
        autor: "Ana Costa",
        texto: "Excelente perfil técnico, muito comunicativo na primeira entrevista.",
        data: "2024-03-18",
      },
      {
        id: "n2",
        autor: "Pedro Santos",
        texto: "Passou no teste técnico com nota alta. Recomendo avançar.",
        data: "2024-03-20",
      },
    ],
    historico: [
      {
        id: "h1",
        acao: "Candidatura recebida",
        autor: "Sistema",
        data: "2024-03-15",
        detalhes: "Via LinkedIn",
      },
      { id: "h2", acao: "Movido para Triagem", autor: "Ana Costa", data: "2024-03-16" },
      {
        id: "h3",
        acao: "Entrevista RH agendada",
        autor: "Ana Costa",
        data: "2024-03-17",
        detalhes: "20/03 às 10:00",
      },
      {
        id: "h4",
        acao: "Movido para Entrevista Técnica",
        autor: "Ana Costa",
        data: "2024-03-18",
      },
    ],
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    telefone: "+351 923 456 789",
    cargo: "UX/UI Designer",
    experiencia: "3 anos",
    localizacao: "Porto, Portugal",
    skills: ["Figma", "Adobe XD", "CSS", "Design Systems", "User Research"],
    status: "entrevista_rh",
    dataSubmissao: "2024-03-14",
    cvUrl: "/cvs/maria-santos.pdf",
    resumo:
      "Designer criativa com experiência em design de produtos digitais. Especializada em criar experiências de utilizador intuitivas e acessíveis.",
    favorito: true,
    rating: 5,
    fonte: "Referência Interna",
    salarioPretendido: "35.000€ - 42.000€",
    disponibilidade: "2 semanas",
    notas: [
      {
        id: "n1",
        autor: "Carla Mendes",
        texto: "Portfólio impressionante, muito alinhada com nossa cultura.",
        data: "2024-03-16",
      },
    ],
    historico: [
      {
        id: "h1",
        acao: "Candidatura recebida",
        autor: "Sistema",
        data: "2024-03-14",
        detalhes: "Referência de Pedro Silva",
      },
      { id: "h2", acao: "Movido para Triagem", autor: "Carla Mendes", data: "2024-03-15" },
      {
        id: "h3",
        acao: "Movido para Entrevista RH",
        autor: "Carla Mendes",
        data: "2024-03-16",
      },
    ],
  },
  {
    id: "3",
    nome: "Pedro Costa",
    email: "pedro.costa@email.com",
    telefone: "+351 934 567 890",
    cargo: "DevOps Engineer",
    experiencia: "4 anos",
    localizacao: "Braga, Portugal",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    status: "oferta",
    dataSubmissao: "2024-03-13",
    cvUrl: "/cvs/pedro-costa.pdf",
    resumo:
      "Engenheiro DevOps com forte experiência em cloud computing e automação de infraestrutura. Certificado AWS Solutions Architect.",
    favorito: false,
    rating: 4,
    fonte: "Indeed",
    salarioPretendido: "50.000€ - 60.000€",
    disponibilidade: "1 mês",
    notas: [
      {
        id: "n1",
        autor: "Miguel Ferreira",
        texto: "Conhecimento técnico sólido. Proposta enviada aguardando resposta.",
        data: "2024-03-22",
      },
    ],
    historico: [
      { id: "h1", acao: "Candidatura recebida", autor: "Sistema", data: "2024-03-13" },
      {
        id: "h2",
        acao: "Movido para Oferta",
        autor: "Miguel Ferreira",
        data: "2024-03-22",
        detalhes: "Proposta: 55.000€",
      },
    ],
  },
  {
    id: "4",
    nome: "Ana Ferreira",
    email: "ana.ferreira@email.com",
    telefone: "+351 945 678 901",
    cargo: "Product Manager",
    experiencia: "6 anos",
    localizacao: "Lisboa, Portugal",
    skills: ["Scrum", "Jira", "Analytics", "User Research", "Roadmap"],
    status: "triagem",
    dataSubmissao: "2024-03-12",
    cvUrl: "/cvs/ana-ferreira.pdf",
    resumo:
      "Product Manager com experiência em startups e grandes empresas. Focada em métricas de produto e desenvolvimento ágil.",
    favorito: false,
    rating: 3,
    fonte: "Site Carreiras",
    salarioPretendido: "55.000€ - 65.000€",
    disponibilidade: "Imediata",
    notas: [],
    historico: [
      { id: "h1", acao: "Candidatura recebida", autor: "Sistema", data: "2024-03-12" },
      { id: "h2", acao: "Movido para Triagem", autor: "Sistema", data: "2024-03-12" },
    ],
  },
  {
    id: "5",
    nome: "Ricardo Oliveira",
    email: "ricardo.oliveira@email.com",
    telefone: "+351 956 789 012",
    cargo: "Backend Developer",
    experiencia: "7 anos",
    localizacao: "Coimbra, Portugal",
    skills: ["Python", "Django", "FastAPI", "MongoDB", "Redis"],
    status: "novo",
    dataSubmissao: "2024-03-20",
    cvUrl: "/cvs/ricardo-oliveira.pdf",
    resumo:
      "Desenvolvedor backend sénior com vasta experiência em Python. Especializado em APIs de alta performance e sistemas distribuídos.",
    favorito: false,
    rating: 0,
    fonte: "LinkedIn",
    salarioPretendido: "48.000€ - 58.000€",
    disponibilidade: "2 semanas",
    notas: [],
    historico: [{ id: "h1", acao: "Candidatura recebida", autor: "Sistema", data: "2024-03-20" }],
  },
  {
    id: "6",
    nome: "Sofia Rodrigues",
    email: "sofia.rodrigues@email.com",
    telefone: "+351 967 890 123",
    cargo: "Data Scientist",
    experiencia: "4 anos",
    localizacao: "Lisboa, Portugal",
    skills: ["Python", "TensorFlow", "SQL", "Machine Learning", "Spark"],
    status: "rejeitado",
    dataSubmissao: "2024-03-10",
    cvUrl: "/cvs/sofia-rodrigues.pdf",
    resumo:
      "Data Scientist com experiência em machine learning e análise de dados. Mestrado em Ciência de Dados pela Universidade de Lisboa.",
    favorito: false,
    rating: 2,
    fonte: "Indeed",
    notas: [
      {
        id: "n1",
        autor: "Carlos Lima",
        texto: "Perfil não adequado para a vaga atual. Experiência insuficiente em produção.",
        data: "2024-03-15",
      },
    ],
    historico: [
      { id: "h1", acao: "Candidatura recebida", autor: "Sistema", data: "2024-03-10" },
      {
        id: "h2",
        acao: "Rejeitado",
        autor: "Carlos Lima",
        data: "2024-03-15",
        detalhes: "Email de feedback enviado",
      },
    ],
  },
  {
    id: "7",
    nome: "Miguel Almeida",
    email: "miguel.almeida@email.com",
    telefone: "+351 978 901 234",
    cargo: "Frontend Developer",
    experiencia: "3 anos",
    localizacao: "Faro, Portugal",
    skills: ["Vue.js", "Nuxt", "Tailwind CSS", "JavaScript", "TypeScript"],
    status: "novo",
    dataSubmissao: "2024-03-19",
    cvUrl: "/cvs/miguel-almeida.pdf",
    resumo:
      "Desenvolvedor frontend apaixonado por criar interfaces responsivas e acessíveis. Experiência com Vue.js e ecossistema JavaScript moderno.",
    favorito: false,
    rating: 0,
    fonte: "Referência Interna",
    salarioPretendido: "32.000€ - 40.000€",
    disponibilidade: "1 mês",
    notas: [],
    historico: [{ id: "h1", acao: "Candidatura recebida", autor: "Sistema", data: "2024-03-19" }],
  },
  {
    id: "8",
    nome: "Catarina Martins",
    email: "catarina.martins@email.com",
    telefone: "+351 989 012 345",
    cargo: "QA Engineer",
    experiencia: "5 anos",
    localizacao: "Aveiro, Portugal",
    skills: ["Selenium", "Cypress", "Jest", "API Testing", "Performance Testing"],
    status: "contratado",
    dataSubmissao: "2024-02-28",
    cvUrl: "/cvs/catarina-martins.pdf",
    resumo:
      "Engenheira de QA com experiência em automação de testes. Especializada em testes end-to-end e integração contínua.",
    favorito: true,
    rating: 5,
    fonte: "LinkedIn",
    salarioPretendido: "38.000€ - 45.000€",
    disponibilidade: "Imediata",
    notas: [
      {
        id: "n1",
        autor: "Ana Costa",
        texto: "Excelente candidata! Início: 01/04/2024",
        data: "2024-03-25",
      },
    ],
    historico: [
      { id: "h1", acao: "Candidatura recebida", autor: "Sistema", data: "2024-02-28" },
      {
        id: "h2",
        acao: "Contratada",
        autor: "Ana Costa",
        data: "2024-03-25",
        detalhes: "Salário: 42.000€",
      },
    ],
  },
]

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
