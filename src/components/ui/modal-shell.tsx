"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type ModalSize = "sm" | "md" | "lg" | "xl"

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export interface ModalShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon?: LucideIcon
  iconClassName?: string
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  className?: string
  contentClassName?: string
}

export function ModalShell({
  open,
  onOpenChange,
  icon: Icon,
  iconClassName,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  contentClassName,
}: ModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 flex flex-col max-h-[90dvh] overflow-hidden",
          sizeMap[size],
          className,
        )}
      >
        <div className="flex items-start gap-3 px-6 pt-6 pb-4 pr-12">
          {Icon ? (
            <div
              className={cn(
                "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-primary/10 text-primary",
                iconClassName,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div className="flex flex-col gap-1 min-w-0">
            <DialogTitle className="text-lg font-semibold leading-tight">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm text-muted-foreground leading-snug">
                {description}
              </DialogDescription>
            ) : null}
          </div>
        </div>

        <Separator />

        <div
          className={cn(
            "flex-1 overflow-y-auto px-6 py-5",
            contentClassName,
          )}
        >
          {children}
        </div>

        {footer ? (
          <>
            <Separator />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end px-6 py-4">
              {footer}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
