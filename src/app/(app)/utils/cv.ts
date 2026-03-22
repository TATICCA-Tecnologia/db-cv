export interface CV {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
  experiencia: string
  localizacao: string
  skills: string[]
  status: "novo" | "em_analise" | "aprovado" | "rejeitado"
  dataSubmissao: string
  cvUrl: string
  resumo: string
}

export const mockCVs: CV[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "+351 912 345 678",
    cargo: "Desenvolvedor Full Stack",
    experiencia: "5 anos",
    localizacao: "Lisboa, Portugal",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    status: "novo",
    dataSubmissao: "2024-03-15",
    cvUrl: "/cvs/joao-silva.pdf",
    resumo:
      "Desenvolvedor experiente com foco em aplicações web modernas. Especializado em React e Node.js com forte experiência em arquitetura de microsserviços.",
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    telefone: "+351 923 456 789",
    cargo: "UX/UI Designer",
    experiencia: "3 anos",
    localizacao: "Porto, Portugal",
    skills: ["Figma", "Adobe XD", "CSS", "Design Systems"],
    status: "em_analise",
    dataSubmissao: "2024-03-14",
    cvUrl: "/cvs/maria-santos.pdf",
    resumo:
      "Designer criativa com experiência em design de produtos digitais. Especializada em criar experiências de utilizador intuitivas e acessíveis.",
  },
  {
    id: "3",
    nome: "Pedro Costa",
    email: "pedro.costa@email.com",
    telefone: "+351 934 567 890",
    cargo: "DevOps Engineer",
    experiencia: "4 anos",
    localizacao: "Braga, Portugal",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    status: "aprovado",
    dataSubmissao: "2024-03-13",
    cvUrl: "/cvs/pedro-costa.pdf",
    resumo:
      "Engenheiro DevOps com forte experiência em cloud computing e automação de infraestrutura. Certificado AWS Solutions Architect.",
  },
  {
    id: "4",
    nome: "Ana Ferreira",
    email: "ana.ferreira@email.com",
    telefone: "+351 945 678 901",
    cargo: "Product Manager",
    experiencia: "6 anos",
    localizacao: "Lisboa, Portugal",
    skills: ["Scrum", "Jira", "Analytics", "User Research"],
    status: "em_analise",
    dataSubmissao: "2024-03-12",
    cvUrl: "/cvs/ana-ferreira.pdf",
    resumo:
      "Product Manager com experiência em startups e grandes empresas. Focada em métricas de produto e desenvolvimento ágil.",
  },
  {
    id: "5",
    nome: "Ricardo Oliveira",
    email: "ricardo.oliveira@email.com",
    telefone: "+351 956 789 012",
    cargo: "Backend Developer",
    experiencia: "7 anos",
    localizacao: "Coimbra, Portugal",
    skills: ["Python", "Django", "FastAPI", "MongoDB"],
    status: "novo",
    dataSubmissao: "2024-03-11",
    cvUrl: "/cvs/ricardo-oliveira.pdf",
    resumo:
      "Desenvolvedor backend sénior com vasta experiência em Python. Especializado em APIs de alta performance e sistemas distribuídos.",
  },
  {
    id: "6",
    nome: "Sofia Rodrigues",
    email: "sofia.rodrigues@email.com",
    telefone: "+351 967 890 123",
    cargo: "Data Scientist",
    experiencia: "4 anos",
    localizacao: "Lisboa, Portugal",
    skills: ["Python", "TensorFlow", "SQL", "Machine Learning"],
    status: "rejeitado",
    dataSubmissao: "2024-03-10",
    cvUrl: "/cvs/sofia-rodrigues.pdf",
    resumo:
      "Data Scientist com experiência em machine learning e análise de dados. Mestrado em Ciência de Dados pela Universidade de Lisboa.",
  },
  {
    id: "7",
    nome: "Miguel Almeida",
    email: "miguel.almeida@email.com",
    telefone: "+351 978 901 234",
    cargo: "Frontend Developer",
    experiencia: "3 anos",
    localizacao: "Faro, Portugal",
    skills: ["Vue.js", "Nuxt", "Tailwind CSS", "JavaScript"],
    status: "novo",
    dataSubmissao: "2024-03-09",
    cvUrl: "/cvs/miguel-almeida.pdf",
    resumo:
      "Desenvolvedor frontend apaixonado por criar interfaces responsivas e acessíveis. Experiência com Vue.js e ecossistema JavaScript moderno.",
  },
  {
    id: "8",
    nome: "Catarina Martins",
    email: "catarina.martins@email.com",
    telefone: "+351 989 012 345",
    cargo: "QA Engineer",
    experiencia: "5 anos",
    localizacao: "Aveiro, Portugal",
    skills: ["Selenium", "Cypress", "Jest", "API Testing"],
    status: "aprovado",
    dataSubmissao: "2024-03-08",
    cvUrl: "/cvs/catarina-martins.pdf",
    resumo:
      "Engenheira de QA com experiência em automação de testes. Especializada em testes end-to-end e integração contínua.",
  },
]

export const statusLabels: Record<CV["status"], string> = {
  novo: "Novo",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
}

export const statusColors: Record<CV["status"], string> = {
  novo: "bg-blue-500/20 text-blue-400",
  em_analise: "bg-yellow-500/20 text-yellow-400",
  aprovado: "bg-primary/20 text-primary",
  rejeitado: "bg-destructive/20 text-destructive",
}
