"use client"

import { useCallback, useRef, useState } from "react"
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Briefcase,
  MapPin,
  AlertTriangle,
  LayoutDashboard,
  X,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type CV, statusLabels, statusColors } from "@/app/(app)/utils/cv"

type FileStatus = "pending" | "processing" | "done" | "error"

interface UploadFile {
  id: string
  file: File
  status: FileStatus
  cv?: CV
  error?: string
  extractionError?: string
}

export function UploadInterface() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const processingRef = useRef(false)

  function addFiles(incoming: FileList | File[]) {
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf")
    if (!pdfs.length) return

    const newItems: UploadFile[] = pdfs.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      status: "pending",
    }))

    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.file.name + f.file.size))
      const unique = newItems.filter(
        (f) => !existingNames.has(f.file.name + f.file.size),
      )
      return [...prev, ...unique]
    })
  }

  const processQueue = useCallback(async () => {
    if (processingRef.current) return
    processingRef.current = true

    try {
      while (true) {
        let pendingId: string | null = null

        setFiles((prev) => {
          const pending = prev.find((f) => f.status === "pending")
          if (pending) pendingId = pending.id
          return prev
        })

        if (!pendingId) break

        const id = pendingId

        // Mark as processing
        let currentFile: File | null = null
        setFiles((prev) => {
          const item = prev.find((f) => f.id === id)
          if (item) currentFile = item.file
          return prev.map((f) =>
            f.id === id ? { ...f, status: "processing" as FileStatus } : f,
          )
        })

        if (!currentFile) break

        try {
          const form = new FormData()
          form.append("file", currentFile)

          const res = await fetch("/api/cv/upload", {
            method: "POST",
            body: form,
          })

          const data = (await res.json()) as {
            cv?: CV
            error?: string
            extractionError?: string
          }

          if (!res.ok || data.error) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      status: "error" as FileStatus,
                      error: data.error ?? `Erro HTTP ${res.status}`,
                    }
                  : f,
              ),
            )
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      status: "done" as FileStatus,
                      cv: data.cv,
                      extractionError: data.extractionError,
                    }
                  : f,
              ),
            )
          }
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Falha na conexão. Tente novamente."
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, status: "error" as FileStatus, error: msg } : f,
            ),
          )
        }
      }
    } finally {
      processingRef.current = false
    }
  }, [])

  function handleStart() {
    void processQueue()
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function retryFile(id: string) {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "pending", error: undefined } : f,
      ),
    )
    void processQueue()
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(e.dataTransfer.files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const pendingCount = files.filter((f) => f.status === "pending").length
  const processingCount = files.filter((f) => f.status === "processing").length
  const doneCount = files.filter((f) => f.status === "done").length
  const errorCount = files.filter((f) => f.status === "error").length
  const isRunning = processingCount > 0

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Upload de CVs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Faça o upload de PDFs — cada CV é processado pela IA automaticamente ao
          entrar no banco.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
          "py-12 px-6 cursor-pointer transition-colors duration-150 select-none",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/30",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
            isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          <Upload className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Solte os arquivos aqui" : "Arraste PDFs ou clique para selecionar"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Apenas arquivos PDF · Máximo 20 MB por arquivo
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{files.length} arquivo{files.length !== 1 ? "s" : ""}</span>
              {doneCount > 0 && (
                <span className="text-emerald-500 font-medium">
                  {doneCount} concluído{doneCount !== 1 ? "s" : ""}
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-destructive font-medium">
                  {errorCount} com erro
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {pendingCount > 0 && !isRunning && (
                <Button size="sm" onClick={handleStart}>
                  Processar {pendingCount} arquivo{pendingCount !== 1 ? "s" : ""}
                </Button>
              )}
              {isRunning && (
                <Button size="sm" disabled>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Processando…
                </Button>
              )}
              {doneCount > 0 && !isRunning && pendingCount === 0 && (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/">
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                    Ver no Dashboard
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {files.map((item) => (
              <FileCard
                key={item.id}
                item={item}
                onRemove={() => removeFile(item.id)}
                onRetry={() => retryFile(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FileCard({
  item,
  onRemove,
  onRetry,
}: {
  item: UploadFile
  onRemove: () => void
  onRetry: () => void
}) {
  const { status, cv, error, extractionError } = item
  const canRemove = status === "pending" || status === "done" || status === "error"

  return (
    <div
      className={cn(
        "rounded-xl border bg-card px-4 py-3 transition-colors",
        status === "done" && "border-emerald-500/30",
        status === "error" && "border-destructive/30",
        status === "processing" && "border-primary/20",
        status === "pending" && "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5",
            status === "done" && "bg-emerald-500/10 text-emerald-500",
            status === "error" && "bg-destructive/10 text-destructive",
            status === "processing" && "bg-primary/10 text-primary",
            status === "pending" && "bg-muted text-muted-foreground",
          )}
        >
          {status === "done" && <CheckCircle2 className="h-4.5 w-4.5" />}
          {status === "error" && <XCircle className="h-4.5 w-4.5" />}
          {status === "processing" && (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          )}
          {status === "pending" && <FileText className="h-4.5 w-4.5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {status === "done" && cv ? cv.nome : item.file.name}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <StatusBadge status={status} />
              {canRemove && (
                <button
                  onClick={onRemove}
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded p-0.5"
                  title="Remover"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-info by state */}
          {status === "pending" && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {(item.file.size / 1024).toFixed(0)} KB · Aguardando processamento
            </p>
          )}

          {status === "processing" && (
            <p className="text-xs text-primary/70 mt-0.5 animate-pulse">
              Enviando e extraindo dados com IA…
            </p>
          )}

          {status === "done" && cv && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {cv.cargo && cv.cargo !== "—" && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {cv.cargo}
                </span>
              )}
              {cv.localizacao && cv.localizacao !== "—" && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {cv.localizacao}
                </span>
              )}
              <Badge className={cn("text-[10px] h-4 py-0", statusColors[cv.status])}>
                {statusLabels[cv.status]}
              </Badge>
              {cv.skills.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {cv.skills.slice(0, 3).join(", ")}
                  {cv.skills.length > 3 && ` +${cv.skills.length - 3}`}
                </span>
              )}
            </div>
          )}

          {status === "done" && extractionError && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-500">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              {extractionError}
            </div>
          )}

          {status === "error" && (
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs text-destructive">{error}</p>
              <button
                onClick={onRetry}
                className="text-xs text-primary hover:underline shrink-0"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: FileStatus }) {
  if (status === "pending")
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
        Na fila
      </span>
    )
  if (status === "processing")
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
        Processando
      </span>
    )
  if (status === "done")
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
        Concluído
      </span>
    )
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
      Erro
    </span>
  )
}
