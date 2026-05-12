"use client"

import { useCallback, useState } from "react"

export interface UseModalReturn {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  open: () => void
  close: () => void
  toggle: () => void
}

export function useModal(initial = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initial)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  return { isOpen, setIsOpen, open, close, toggle }
}
