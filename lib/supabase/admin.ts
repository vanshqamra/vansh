// lib/supabase/admin.ts
import "server-only"                      // ensures this file never ships to the client
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _admin: SupabaseClient | null = null

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY // server-only key

  // Don't throw during build/prerender — return null-like client and log in dev
  if (!url || !serviceRole) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase-admin] Missing env (URL or SERVICE_ROLE) at build/prerender; returning null client")
    }
    return null as unknown as SupabaseClient
  }

  if (!_admin) {
    _admin = createClient(url, serviceRole, {
      auth: { persistSession: false },     // server-side client
    })
  }
  return _admin
}
