// lib/supabase/server-client.ts
import { cookies, headers } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Don't throw during build/prerender — just return null-like client
  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase] Env missing at build/prerender; returning null client")
    }
    return null as unknown as ReturnType<typeof createServerClient>
  }

  // Create a normal server client
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        try {
          return cookies().get(name)?.value
        } catch {
          return undefined
        }
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookies().set({ name, value, ...options })
        } catch {
          /* noop on RSC */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookies().set({ name, value: "", ...options })
        } catch {
          /* noop on RSC */
        }
      },
    },
    headers,
  })
}
