// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ClientProviders from "./providers";
import { SiteShell } from "@/components/site-shell";
import dynamic from "next/dynamic";

// defer overlay to client only
const GlobalFxOverlay = dynamic(() => import("@/components/GlobalFxOverlay"));

export const metadata: Metadata = {
  title: "Chemical Corporation - Premium Laboratory Chemicals & Equipment",
  description:
    "Leading supplier of high-quality laboratory chemicals, scientific instruments, and laboratory supplies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <SiteShell>{children}</SiteShell>
        </ClientProviders>
        <GlobalFxOverlay />
      </body>
    </html>
  );
}

