// components/ui/tabs.tsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

export function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root className={className} {...props} />
}

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground " +
        (className || "")
      }
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium " +
        "data-[state=active]:bg-background data-[state=active]:text-foreground " +
        "data-[state=inactive]:opacity-70 transition-all " +
        (className || "")
      }
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={"mt-2 outline-none " + (className || "")}
      {...props}
    />
  )
}
