// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "./providers";
import { SiteShell } from "@/components/site-shell";
import GlobalFxOverlay from "@/components/GlobalFxOverlay";

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
      {/* Do NOT add bg-* here; let CSS tokens handle base */}
      <body className={inter.className}>
        <ClientProviders>
          <SiteShell>{children}</SiteShell>
        </ClientProviders>

        {/* Always-on global FX mounted as a portal */}
        <GlobalFxOverlay />
      </body>
    </html>
  );
}

