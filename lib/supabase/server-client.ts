// lib/supabase/server-client.ts
import { cookies, headers } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasSupabaseEnv = !!url && !!key

  if (!hasSupabaseEnv && process.env.NODE_ENV !== "production") {
    console.warn("[diagnostics] Supabase env not set; skipping Supabase init in dev.")
    return null as unknown as ReturnType<typeof createServerClient>
  }
  if (!hasSupabaseEnv) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
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
