import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { mockCVs } from "../src/app/(app)/utils/cv"
import { mockCandidates } from "../src/app/(app)/utils/candidates"
import {
  defaultPipeline,
  defaultTeam,
  defaultTemplates,
} from "../src/app/(app)/configuracoes/_utils/settings"

const db = new PrismaClient()

async function main() {
  await db.$transaction([
    db.candidateNote.deleteMany(),
    db.candidateHistory.deleteMany(),
    db.candidate.deleteMany(),
    db.cv.deleteMany(),
    db.pipelineStage.deleteMany(),
    db.teamMember.deleteMany(),
    db.emailTemplate.deleteMany(),
    db.companySettings.deleteMany(),
    db.notificationSettings.deleteMany(),
  ])

  await db.companySettings.create({
    data: {
      id: "default",
      companyName: "Tática",
      companyEmail: "recrutamento@tatica.pt",
      companyWebsite: "https://tatica.pt",
    },
  })

  await db.notificationSettings.create({
    data: {
      id: "default",
      newCandidate: true,
      statusChange: true,
      interview: true,
      dailyDigest: false,
      weeklyReport: true,
    },
  })

  for (const cv of mockCVs) {
    await db.cv.create({
      data: {
        name: cv.nome,
        email: cv.email,
        phone: cv.telefone,
        jobTitle: cv.cargo,
        experience: cv.experiencia,
        location: cv.localizacao,
        skills: JSON.stringify(cv.skills),
        status: cv.status,
        submittedAt: new Date(`${cv.dataSubmissao}T12:00:00.000Z`),
        cvUrl: cv.cvUrl,
        summary: cv.resumo,
      },
    })
  }

  for (const c of mockCandidates) {
    await db.candidate.create({
      data: {
        name: c.nome,
        email: c.email,
        phone: c.telefone,
        jobTitle: c.cargo,
        experience: c.experiencia,
        location: c.localizacao,
        skills: JSON.stringify(c.skills),
        status: c.status,
        submittedAt: new Date(`${c.dataSubmissao}T12:00:00.000Z`),
        cvUrl: c.cvUrl,
        summary: c.resumo,
        isFavorite: c.favorito,
        rating: c.rating,
        source: c.fonte,
        expectedSalary: c.salarioPretendido,
        availability: c.disponibilidade,
        notes: {
          create: c.notas.map((n) => ({
            author: n.autor,
            text: n.texto,
            recordedAt: new Date(`${n.data}T12:00:00.000Z`),
          })),
        },
        history: {
          create: c.historico.map((h) => ({
            action: h.acao,
            author: h.autor,
            recordedAt: new Date(`${h.data}T12:00:00.000Z`),
            details: h.detalhes,
          })),
        },
      },
    })
  }

  for (const stage of defaultPipeline) {
    await db.pipelineStage.create({
      data: {
        name: stage.name,
        color: stage.color,
        sortOrder: stage.order,
      },
    })
  }

  for (const m of defaultTeam) {
    await db.teamMember.create({
      data: {
        name: m.name,
        email: m.email,
        role: m.role,
        avatar: m.avatar,
      },
    })
  }

  for (const t of defaultTemplates) {
    await db.emailTemplate.create({
      data: {
        name: t.name,
        subject: t.subject,
        type: t.type,
      },
    })
  }
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
