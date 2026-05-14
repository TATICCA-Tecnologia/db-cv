import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { db } from "@/server/db"
import {
  putDocumentObject,
  getMinioDocumentsBucketName,
  ensureMinioDocumentsBucket,
} from "@/server/storage/minio"
import { extractCvFromPdf } from "@/server/ai/extract-cv"
import { mapGeminiExtractionToCvFields } from "@/server/jobs/google-sheet-cv-sync/map-gemini-extraction-to-cv"
import { upsertCvExtractionFromGemini } from "@/server/jobs/google-sheet-cv-sync/persist-cv-extraction"
import { mapCvToDto } from "@/server/lib/prisma-mappers"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Apenas arquivos PDF são aceitos." }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 413 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const uuid = randomUUID()
  const storageKey = `uploads/manual/${uuid}.pdf`

  const minioUrl = process.env.MINIO_URL?.replace(/\/$/, "") ?? ""
  const bucket = getMinioDocumentsBucketName()
  const cvUrl = `${minioUrl}/${bucket}/${storageKey}`

  try {
    await ensureMinioDocumentsBucket()
    await putDocumentObject(storageKey, buffer, "application/pdf")
  } catch (e) {
    console.error("[upload] MinIO error:", e)
    return NextResponse.json(
      { error: "Falha ao armazenar o arquivo. Verifique o storage." },
      { status: 500 },
    )
  }

  // Create initial record with placeholder data so the CV exists even if AI fails
  const cv = await db.cv.create({
    data: {
      name: file.name.replace(/\.pdf$/i, "").trim() || "Sem nome",
      email: `upload-${uuid}@pendente.local`,
      phone: "—",
      jobTitle: "—",
      experience: "—",
      location: "—",
      skills: "[]",
      status: "novo",
      submittedAt: new Date(),
      cvUrl,
      storageKey,
      summary: "Aguardando extração por IA.",
      aiSeen: false,
    },
  })

  let extractionError: string | null = null

  try {
    const { result: extraction } = await extractCvFromPdf(buffer)
    const fields = mapGeminiExtractionToCvFields(extraction)

    await db.cv.update({
      where: { id: cv.id },
      data: {
        aiSeen: true,
        ...(fields.name ? { name: fields.name } : {}),
        ...(fields.phone ? { phone: fields.phone } : {}),
        ...(fields.jobTitle ? { jobTitle: fields.jobTitle } : {}),
        ...(fields.experience ? { experience: fields.experience } : {}),
        ...(fields.location ? { location: fields.location } : {}),
        ...(fields.skills ? { skills: fields.skills } : {}),
        ...(fields.summary ? { summary: fields.summary } : {}),
        // Use extracted email if available, keep placeholder otherwise
        ...(extraction.dados_pessoais.email
          ? { email: extraction.dados_pessoais.email }
          : {}),
      },
    })

    await upsertCvExtractionFromGemini(cv.id, extraction)
  } catch (e) {
    console.error("[upload] AI extraction error:", e)
    extractionError =
      "Extração por IA falhou. O CV foi salvo e pode ser reprocessado depois."
  }

  const updated = await db.cv.findUnique({
    where: { id: cv.id },
    include: { extraction: true },
  })

  return NextResponse.json({
    cv: mapCvToDto(updated ?? { ...cv, extraction: null }),
    ...(extractionError ? { extractionError } : {}),
  })
}
