"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      <main className="flex-1 bg-transparent">{children}</main>
      <Footer />
    </div>
  );
}
