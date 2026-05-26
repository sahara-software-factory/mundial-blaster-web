"use client"

import { useState, useCallback } from "react"

interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "success"
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions = {}): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolver?.(true)
    setIsOpen(false)
  }, [resolver])

  const handleCancel = useCallback(() => {
    resolver?.(false)
    setIsOpen(false)
  }, [resolver])

  return {
    isOpen,
    options,
    confirm,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }
}