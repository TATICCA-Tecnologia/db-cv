import "dotenv/config"
import { PrismaClient } from "@prisma/client"

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
