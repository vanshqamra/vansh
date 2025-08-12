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
      {/* IMPORTANT: body must be relative so the background layer can sit behind it */}
      <body className={`relative min-h-screen ${inter.className}`}>
        {/* 🔵 Global animated blue background for the entire site */}
        <div id="fx-bg" className="fixed inset-0 z-0 pointer-events-none">
          <div className="site-bg absolute inset-0" />
          <div className="fx-mesh absolute inset-0 animate-mesh opacity-60" />
          <div className="fx-grid absolute inset-0 animate-grid opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_85%,transparent)]" />
        </div>

        {/* App content ABOVE the background */}
        <div className="relative z-10">
          <ClientProviders>
            <SiteShell>{children}</SiteShell>
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}
