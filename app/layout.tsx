// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "./providers";
import { SiteShell } from "@/components/site-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chemical Corporation - Premium Laboratory Chemicals & Equipment",
  description:
    "Leading supplier of high-quality laboratory chemicals, scientific instruments, and laboratory supplies. Trusted by research institutions and industries worldwide.",
  keywords:
    "laboratory chemicals, scientific instruments, chemical supplies, research chemicals, lab equipment",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Do NOT hard-paint background here */}
      <body className={inter.className}>
        <ClientProviders>
          <SiteShell>{children}</SiteShell>
        </ClientProviders>

        {/* Global FX overlay (top-most, non-blocking) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
          <div className="fx-mesh absolute -inset-40 opacity-[0.10] animate-mesh" />
          <div className="fx-grid absolute inset-0 opacity-[0.08] animate-grid" />
        </div>
      </body>
    </html>
  );
}

