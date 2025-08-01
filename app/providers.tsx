// app/providers.tsx
"use client";

import React from "react";
import { AuthProvider } from "@/app/context/auth-context";
import { QuoteProvider } from "@/app/context/quote-context";
import { CartProvider } from "@/app/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QuoteProvider>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <WhatsAppButton />
          <Toaster />
        </CartProvider>
      </QuoteProvider>
    </AuthProvider>
  );
}
