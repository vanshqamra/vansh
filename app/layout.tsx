import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chemical Corporation - Premium Laboratory Chemicals & Equipment",
  description:
    "Leading supplier of high-quality laboratory chemicals, scientific instruments, and laboratory supplies. Trusted by research institutions and industries worldwide.",
  keywords: "laboratory chemicals, scientific instruments, chemical supplies, research chemicals, lab equipment",
    generator: 'v0.dev'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* All client-stateful code lives inside ClientProviders */}
        <ClientProviders>
          <main className="min-h-screen">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
