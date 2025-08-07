"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hide = pathname.startsWith("/admin")
  return (
    <div className="flex min-h-screen flex-col">
      {!hide && <Header />}
      <main className="flex-1">{children}</main>
      {!hide && <Footer />}
    </div>
  )
}
