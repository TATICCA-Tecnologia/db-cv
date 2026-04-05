import { GoogleGenerativeAI } from "@google/generative-ai"
import { CV_PDF_EXTRACTION_PROMPT } from "@/server/gemini/cv-pdf-extraction-prompt"
import {
  cvExtractionResultSchema,
  type CvExtractionResult,
} from "@/server/gemini/cv-extraction-schema"

const DEFAULT_MODEL = "gemini-2.0-flash"
const MAX_PDF_BYTES = 20 * 1024 * 1024

export class GeminiCvExtractionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = "GeminiCvExtractionError"
  }
}

export type ExtractCvFromPdfOptions = {
  apiKey?: string
  model?: string
}

function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim()
  const fenced = /^```(?:json)?\s*\n?([\s\S]*?)```$/m.exec(trimmed)
  if (fenced?.[1]) return fenced[1].trim()
  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

export async function extractCvFromPdfWithGemini(
  pdfBuffer: Buffer,
  options: ExtractCvFromPdfOptions = {},
): Promise<CvExtractionResult> {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY
  if (!apiKey?.trim()) {
    throw new GeminiCvExtractionError(
      "GEMINI_API_KEY não definida. Configure a variável de ambiente.",
    )
  }

  if (pdfBuffer.length === 0) {
    throw new GeminiCvExtractionError("O PDF está vazio.")
  }
  if (pdfBuffer.length > MAX_PDF_BYTES) {
    throw new GeminiCvExtractionError(
      `PDF excede o limite de ${MAX_PDF_BYTES / (1024 * 1024)} MB.`,
    )
  }

  const modelName = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  })

  const base64 = pdfBuffer.toString("base64")

  let text: string
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64,
        },
      },
      { text: CV_PDF_EXTRACTION_PROMPT },
    ])
    text = result.response.text()
  } catch (e) {
    throw new GeminiCvExtractionError("Falha ao chamar a API Gemini.", e)
  }

  if (!text?.trim()) {
    throw new GeminiCvExtractionError("Resposta vazia do Gemini.")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonPayload(text))
  } catch (e) {
    throw new GeminiCvExtractionError(
      "Resposta do Gemini não é JSON válido.",
      e,
    )
  }

  const validated = cvExtractionResultSchema.safeParse(parsed)
  if (!validated.success) {
    throw new GeminiCvExtractionError(
      "JSON retornado não corresponde ao schema esperado.",
      validated.error,
    )
  }

  return validated.data
}
