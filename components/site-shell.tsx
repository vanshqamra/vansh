"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* header */}
      {/* if Header has bg-white, keep it (headers are fine), but main must be transparent */}
      <main className="flex-1 bg-transparent">{children}</main>
      {/* footer */}
    </div>
  );
}
