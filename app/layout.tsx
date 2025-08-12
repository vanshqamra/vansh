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
      <body className={`${inter.className} bg-white`}>
        <ClientProviders>
          <SiteShell>{children}</SiteShell>
        </ClientProviders>

        {/* Global animated FX overlay (site-wide) */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] mix-blend-normal"
        >
          {/* Subtle animated mesh */}
          <div className="fx-mesh absolute -inset-40 opacity-[0.09] animate-mesh" />
          {/* Sliding grid */}
          <div className="fx-grid absolute inset-0 opacity-[0.06] animate-grid" />
        </div>
      </body>
    </html>
  );
}
