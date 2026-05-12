"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Filter,
  Eye,
  FileText,
  MapPin,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { statusLabels, statusColors, type CV } from "@/app/(app)/utils/cv"
import { CVModal } from "./cv-modal"
import { CvPdfViewerModal } from "./cv-pdf-viewer-modal"
import { trpc } from "@/trpc/react"
import { Skeleton } from "@/components/ui/skeleton"

const SORT_FIELDS = [
  "nome",
  "cargo",
  "localizacao",
  "status",
  "dataSubmissao",
] as const
const SORT_DIRECTIONS = ["asc", "desc"] as const
type SortField = (typeof SORT_FIELDS)[number]

const STATUS_ORDER: Record<CV["status"], number> = {
  novo: 0,
  em_analise: 1,
  aprovado: 2,
  rejeitado: 3,
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
const TABLE_COLUMN_COUNT = 11

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", total]
  }
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}

function getIdiomasDisplay(cv: CV): string {
  const idiomas = cv.extracao?.idiomas ?? []
  if (idiomas.length === 0) return "Não Identificado"
  const labels = idiomas
    .map((i) => {
      if (!i.idioma) return null
      if (!i.nivel) return i.idioma
      return `${i.idioma} (${i.nivel})`
    })
    .filter((v): v is string => Boolean(v))
  if (labels.length === 0) return "Não Identificado"
  return labels.join(", ")
}

function getEducacaoDisplay(cv: CV): string {
  const educacao = cv.extracao?.educacao ?? []
  if (educacao.length === 0) return "Não informado"
  const first = educacao[0]
  if (!first) return "Não informado"
  const curso = first.curso?.trim()
  const instituicao = first.instituicao?.trim()
  const grau = first.grau?.trim()
  return [grau, curso, instituicao].filter(Boolean).join(" - ") || "Não informado"
}

function CVListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-9 w-full max-w-md" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-35" />
          <Skeleton className="h-9 w-45" />
          <Skeleton className="h-9 w-55" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              {Array.from({ length: TABLE_COLUMN_COUNT }).map((_, i) => (
                <TableHead key={i} className="h-10">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, r) => (
              <TableRow key={r}>
                {Array.from({ length: TABLE_COLUMN_COUNT }).map((_, c) => (
                  <TableCell key={c}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function CVList() {
  const [
    {
      q: searchQuery,
      status: statusFilter,
      cargo: cargoFilter,
      origem: sourceFilter,
      page,
      per: pageSize,
      sort: sortField,
      dir: sortDirection,
    },
    setFilters,
  ] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      status: parseAsString.withDefault("todos"),
      cargo: parseAsString.withDefault("todos"),
      origem: parseAsString.withDefault("todos"),
      page: parseAsInteger.withDefault(1),
      per: parseAsInteger.withDefault(10),
      sort: parseAsStringLiteral(SORT_FIELDS).withDefault("dataSubmissao"),
      dir: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("desc"),
    },
    { clearOnDefault: true, history: "replace" },
  )

  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const [pdfCvId, setPdfCvId] = useState<string | null>(null)
  const [pdfCvTitle, setPdfCvTitle] = useState<string | undefined>(undefined)

  const { data: cvs = [] as CV[], isLoading, isError } = trpc.cv.list.useQuery()
  const utils = trpc.useUtils()
  const updateCvStatus = trpc.cv.update.useMutation({
    onSuccess: async (updatedCv) => {
      setSelectedCV((prev) => (prev?.id === updatedCv.id ? updatedCv : prev))
      await utils.cv.list.invalidate()
    },
  })

  const reextractCv = trpc.cv.reextract.useMutation({
    onSuccess: async (updatedCv) => {
      setSelectedCV((prev) => (prev?.id === updatedCv.id ? updatedCv : prev))
      await utils.cv.list.invalidate()
      toast.success("CV reprocessado com IA")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const handleMarkAsInAnalysis = (cvId: string) => {
    updateCvStatus.mutate({ id: cvId, data: { status: "em_analise" } })
  }

  const handleReextract = (cvId: string) => {
    reextractCv.mutate({ id: cvId })
  }

  const cargos = useMemo(
    () => [...new Set(cvs.map((cv: CV) => cv.cargo) as string[])],
    [cvs],
  )
  const sources = useMemo(
    () => [
      ...new Set(
        cvs.map((cv: CV) => cv.sourceSheet ?? "Não informado") as string[],
      ),
    ],
    [cvs],
  )

  const filteredCVs = useMemo(() => {
    const needle = searchQuery.toLowerCase()
    return cvs.filter((cv: CV) => {
      const idiomasText = (cv.extracao?.idiomas ?? [])
        .map((i) => [i.idioma, i.nivel].filter(Boolean).join(" "))
        .join(" ")
        .toLowerCase()
      const educacaoText = (cv.extracao?.educacao ?? [])
        .map((e) => [e.grau, e.curso, e.instituicao].filter(Boolean).join(" "))
        .join(" ")
        .toLowerCase()
      const resumoText = (cv.extracao?.resumoProfissional ?? "").toLowerCase()

      const matchesSearch =
        needle === "" ||
        cv.nome.toLowerCase().includes(needle) ||
        cv.email.toLowerCase().includes(needle) ||
        cv.skills.some((skill) => skill.toLowerCase().includes(needle)) ||
        cv.cargo.toLowerCase().includes(needle) ||
        idiomasText.includes(needle) ||
        educacaoText.includes(needle) ||
        resumoText.includes(needle)

      const matchesStatus =
        statusFilter === "todos" || cv.status === statusFilter
      const matchesCargo = cargoFilter === "todos" || cv.cargo === cargoFilter
      const cvSource = cv.sourceSheet ?? "Não informado"
      const matchesSource =
        sourceFilter === "todos" || cvSource === sourceFilter

      return matchesSearch && matchesStatus && matchesCargo && matchesSource
    })
  }, [cvs, searchQuery, statusFilter, cargoFilter, sourceFilter])

  const sortedCVs = useMemo(() => {
    const arr = [...filteredCVs]
    arr.sort((a, b) => {
      const compare = (() => {
        switch (sortField) {
          case "nome":
            return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" })
          case "cargo":
            return a.cargo.localeCompare(b.cargo, "pt", { sensitivity: "base" })
          case "localizacao":
            return (a.localizacao ?? "").localeCompare(
              b.localizacao ?? "",
              "pt",
              { sensitivity: "base" },
            )
          case "status":
            return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          case "dataSubmissao":
            return (
              new Date(a.dataSubmissao).getTime() -
              new Date(b.dataSubmissao).getTime()
            )
        }
      })()
      return sortDirection === "asc" ? compare : -compare
    })
    return arr
  }, [filteredCVs, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedCVs.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const pageCvs = sortedCVs.slice(startIndex, startIndex + pageSize)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const goToPage = (n: number) => {
    void setFilters({ page: Math.min(Math.max(1, n), totalPages) })
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      void setFilters({
        dir: sortDirection === "asc" ? "desc" : "asc",
        page: 1,
      })
    } else {
      void setFilters({
        sort: field,
        dir: field === "dataSubmissao" ? "desc" : "asc",
        page: 1,
      })
    }
  }

  const SortableHeader = ({
    field,
    children,
    className,
    align,
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
    align?: "left" | "right"
  }) => {
    const active = sortField === field
    const Icon = active
      ? sortDirection === "asc"
        ? ArrowUp
        : ArrowDown
      : ArrowUpDown
    return (
      <TableHead
        className={cn(
          "text-foreground font-semibold whitespace-normal p-0",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => toggleSort(field)}
          className={cn(
            "group flex items-center gap-1.5 px-2 h-10 w-full hover:text-primary transition-colors",
            align === "right" && "justify-end",
            active && "text-primary",
          )}
        >
          <span>{children}</span>
          <Icon
            className={cn(
              "h-3.5 w-3.5 transition-opacity",
              active ? "opacity-100" : "opacity-40 group-hover:opacity-70",
            )}
          />
        </button>
      </TableHead>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar a lista de CVs.
      </p>
    )
  }

  if (isLoading) {
    return <CVListSkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, email, cargo ou skills..."
            value={searchQuery}
            onChange={(e) => {
              void setFilters({ q: e.target.value, page: 1 })
            }}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                void setFilters({ status: v, page: 1 })
              }}
            >
              <SelectTrigger className="w-35 bg-secondary border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select
            value={cargoFilter}
            onValueChange={(v) => {
              void setFilters({ cargo: v, page: 1 })
            }}
          >
            <SelectTrigger className="w-45 bg-secondary border-border">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os cargos</SelectItem>
              {cargos.map((cargo) => (
                <SelectItem key={cargo} value={cargo}>
                  {cargo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sourceFilter}
            onValueChange={(v) => {
              void setFilters({ origem: v, page: 1 })
            }}
          >
            <SelectTrigger className="w-55 bg-secondary border-border">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as origens</SelectItem>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredCVs.length} CV{filteredCVs.length !== 1 ? "s" : ""} encontrado
          {filteredCVs.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Por página</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              void setFilters({ per: Number(v), page: 1 })
            }}
          >
            <SelectTrigger className="w-22 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-clip">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-secondary hover:bg-secondary border-b border-border">
              <SortableHeader field="nome">Candidato</SortableHeader>
              <SortableHeader field="cargo">Último cargo</SortableHeader>
              <SortableHeader
                field="localizacao"
                className="hidden md:table-cell"
              >
                Localização
              </SortableHeader>
              <TableHead className="text-foreground font-semibold whitespace-normal hidden lg:table-cell">
                Experiência
              </TableHead>
              <TableHead className="text-foreground font-semibold whitespace-normal hidden xl:table-cell">
                Origem
              </TableHead>
              <TableHead className="text-foreground font-semibold whitespace-normal hidden xl:table-cell">
                Idiomas
              </TableHead>
              <TableHead className="text-foreground font-semibold whitespace-normal hidden xl:table-cell">
                Educação
              </TableHead>
              <TableHead className="text-foreground font-semibold whitespace-normal">
                Visto por IA?
              </TableHead>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader
                field="dataSubmissao"
                className="hidden sm:table-cell"
              >
                Data
              </SortableHeader>
              <TableHead className="text-foreground font-semibold whitespace-normal text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageCvs.map((cv: CV) => (
              <TableRow
                key={cv.id}
                className="hover:bg-secondary/30 cursor-pointer transition-colors"
                onClick={() => setSelectedCV(cv)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {cv.nome}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {cv.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{cv.cargo}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {cv.localizacao}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-40 truncate">
                  <span className="text-muted-foreground">{cv.experiencia}</span>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <span className="text-muted-foreground">
                    {cv.sourceSheet ?? "Não informado"}
                  </span>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <span className="text-muted-foreground">
                    {getIdiomasDisplay(cv)}
                  </span>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <span className="text-muted-foreground">
                    {getEducacaoDisplay(cv)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      cv.aiSeen
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }
                    variant="secondary"
                  >
                    {cv.aiSeen ? "Sim" : "Não"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[cv.status]}
                    variant="secondary"
                  >
                    {statusLabels[cv.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">
                      {new Date(cv.dataSubmissao).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCV(cv)
                      }}
                      className="hover:bg-secondary"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPdfCvId(cv.id)
                        setPdfCvTitle(cv.nome)
                      }}
                      className="hover:bg-secondary"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Ver CV em PDF</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCVs.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            A mostrar {startIndex + 1}–{startIndex + pageCvs.length} de{" "}
            {filteredCVs.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(1)}
              disabled={currentPage <= 1}
              aria-label="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((n, i) =>
              n === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={n}
                  variant={n === currentPage ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => goToPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                >
                  {n}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage >= totalPages}
              aria-label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {filteredCVs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            Nenhum CV encontrado
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou a pesquisa
          </p>
        </div>
      )}

      <CVModal
        cv={selectedCV}
        onClose={() => setSelectedCV(null)}
        onMarkAsInAnalysis={handleMarkAsInAnalysis}
        isUpdatingStatus={updateCvStatus.isPending}
        onReextract={handleReextract}
        isReextracting={reextractCv.isPending}
      />
      <CvPdfViewerModal
        cvId={pdfCvId}
        title={pdfCvTitle ? `CV — ${pdfCvTitle}` : undefined}
        open={pdfCvId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPdfCvId(null)
            setPdfCvTitle(undefined)
          }
        }}
      />
    </div>
  )
}
