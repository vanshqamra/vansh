"use client"

import React, { createContext, useContext, useMemo, useState, useId } from "react"

type TabsContextValue = {
  value: string
  setValue: (v: string) => void
  baseId: string
}
const TabsCtx = createContext<TabsContextValue | null>(null)
const useTabs = () => {
  const ctx = useContext(TabsCtx)
  if (!ctx) throw new Error("Tabs components must be used inside <Tabs>")
  return ctx
}

type TabsProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
  className?: string
}
export function Tabs({ value, defaultValue, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? "")
  const controlled = typeof value === "string"
  const current = controlled ? value! : internal
  const setValue = (v: string) => {
    if (!controlled) setInternal(v)
    onValueChange?.(v)
  }
  const baseId = useId()

  const ctx = useMemo(() => ({ value: current, setValue, baseId }), [current, baseId])
  return (
    <div className={className}>
      <TabsCtx.Provider value={ctx}>{children}</TabsCtx.Provider>
    </div>
  )
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>
export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex h-10 items-center rounded-lg bg-muted p-1 text-muted-foreground ${className ?? ""}`}
      {...props}
    />
  )
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: current, setValue, baseId } = useTabs()
  const selected = current === value
  const id = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  return (
    <button
      id={id}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      onClick={() => setValue(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all
        ${selected ? "bg-background text-foreground shadow" : "opacity-70 hover:opacity-100"} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  )
}

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & { value: string }
export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: current, baseId } = useTabs()
  const hidden = current !== value
  const id = `${baseId}-panel-${value}`
  const tabId = `${baseId}-tab-${value}`

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={hidden}
      className={`mt-2 outline-none ${className ?? ""}`}
      {...props}
    >
      {!hidden && children}
    </div>
  )
}
