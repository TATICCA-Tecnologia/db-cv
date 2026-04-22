import { db } from "@/server/db"
import {
  getDocumentObjectBuffer,
  isMinioConfigured,
} from "@/server/storage/minio"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const row = await db.cv.findUnique({ where: { id } })
  if (!row) {
    return new Response("CV não encontrado", { status: 404 })
  }

  const safeName = (row.name || row.id).replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 48)
  const filename = `cv-${safeName || row.id}.pdf`
  const storageKey = row.storageKey?.trim()
  if (storageKey && isMinioConfigured()) {
    try {
      const buffer = await getDocumentObjectBuffer(storageKey)
      return new Response(Buffer.from(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, no-store, max-age=0",
          Pragma: "no-cache",
        },
      })
    } catch {
      /* fallback para URL original abaixo */
    }
  }

  try {
    const upstream = await fetch(row.cvUrl, {
      redirect: "follow",
      headers: {
        Accept: "application/pdf,application/octet-stream,*/*",
      },
    })
    if (!upstream.ok) {
      return new Response(`Falha ao obter CV original (HTTP ${upstream.status})`, {
        status: 502,
      })
    }
    const arrayBuffer = await upstream.arrayBuffer()
    const contentType = upstream.headers.get("content-type") ?? "application/pdf"
    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
      },
    })
  } catch {
    return new Response("Não foi possível obter o CV original.", { status: 502 })
  }
}
