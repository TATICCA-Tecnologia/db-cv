"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Bot,
  User,
  Loader2,
  MapPin,
  Briefcase,
  Star,
  Eye,
  Sparkles,
} from "lucide-react"
import { trpc } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type CV, statusLabels, statusColors } from "@/app/(app)/utils/cv"
import { CVModal } from "../../_components/cv-modal"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  candidates?: CV[]
}

const SUGGESTIONS = [
  "Desenvolvedores React Pleno em São Paulo",
  "Candidatos com inglês avançado e mais de 5 anos de experiência",
  "Designers UX/UI sênior disponíveis",
  "Engenheiros de dados com Python e AWS",
]

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [selectedCv, setSelectedCv] = useState<CV | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const chat = trpc.cv.chat.useMutation({
    onSuccess(data) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          candidates: data.candidates,
        },
      ])
    },
    onError(err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ocorreu um erro: ${err.message}. Tente novamente.`,
          candidates: [],
        },
      ])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chat.isPending])

  function handleSubmit(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || chat.isPending) return

    const userMessage: ChatMessage = { role: "user", content: msg }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    chat.mutate({
      message: msg,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-tight">
            Chat com a IA
          </h1>
          <p className="text-sm text-muted-foreground">
            Descreva o candidato ideal e a IA busca no banco de CVs
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/30 p-4 space-y-6 min-h-0">
        {messages.length === 0 ? (
          <EmptyState onSuggestion={handleSubmit} disabled={chat.isPending} />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              onViewCv={setSelectedCv}
            />
          ))
        )}

        {chat.isPending && <ThinkingBubble />}

        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Descreva o perfil que você busca… (Enter para enviar, Shift+Enter para nova linha)"
          className="resize-none min-h-[52px] max-h-[140px]"
          rows={2}
          disabled={chat.isPending}
        />
        <Button
          onClick={() => handleSubmit()}
          disabled={!input.trim() || chat.isPending}
          size="icon"
          className="h-[52px] w-[52px] shrink-0"
        >
          {chat.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <CVModal
        cv={selectedCv}
        onClose={() => setSelectedCv(null)}
        onMarkAsInAnalysis={() => {}}
      />
    </div>
  )
}

function EmptyState({
  onSuggestion,
  disabled,
}: {
  onSuggestion: (text: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Como posso ajudar?</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Diga o que você procura e varro o banco de CVs para encontrar os
            melhores candidatos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            disabled={disabled}
            className={cn(
              "text-left text-sm px-4 py-3 rounded-lg border border-border",
              "bg-card hover:bg-accent/50 hover:border-primary/30",
              "text-muted-foreground hover:text-foreground",
              "transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  onViewCv,
}: {
  message: ChatMessage
  onViewCv: (cv: CV) => void
}) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className={cn("flex flex-col gap-3 max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm",
          )}
        >
          {message.content}
        </div>

        {!isUser && message.candidates && message.candidates.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground px-1">
              {message.candidates.length} candidato
              {message.candidates.length !== 1 ? "s" : ""} encontrado
              {message.candidates.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-2">
              {message.candidates.map((cv) => (
                <CandidateCard key={cv.id} cv={cv} onView={() => onViewCv(cv)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function CandidateCard({ cv, onView }: { cv: CV; onView: () => void }) {
  const senioridade = cv.extracao?.analiseIa?.senioridade
  const topSkills = cv.skills.slice(0, 4)

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/30 hover:bg-accent/20 transition-colors group">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm select-none">
        {cv.nome.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{cv.nome}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3 shrink-0" />
                {cv.cargo}
              </span>
              {cv.localizacao && (
                <>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {cv.localizacao}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {senioridade && (
              <Badge variant="outline" className="text-[11px] py-0 h-5 hidden sm:flex">
                <Star className="h-2.5 w-2.5 mr-1" />
                {senioridade}
              </Badge>
            )}
            <Badge className={cn("text-[11px] py-0 h-5", statusColors[cv.status])}>
              {statusLabels[cv.status]}
            </Badge>
          </div>
        </div>

        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {topSkills.map((s) => (
              <span
                key={s}
                className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {s}
              </span>
            ))}
            {cv.skills.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                +{cv.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onView}
        title="Ver CV completo"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  )
}
