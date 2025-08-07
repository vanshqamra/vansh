// app/providers.tsx
"use client";

import React from "react";
import { AuthProvider } from "@/app/context/auth-context";
import { QuoteProvider } from "@/app/context/quote-context";
import { CartProvider } from "@/app/context/CartContext";
import { SearchProvider } from "@/app/context/search-context";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QuoteProvider>
        <CartProvider>
          <SearchProvider>
            {children}
            <WhatsAppButton />
            <Toaster />
          </SearchProvider>
        </CartProvider>
      </QuoteProvider>
    </AuthProvider>
  );
}
