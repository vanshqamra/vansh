// lib/supabase/admin.ts
import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _admin: SupabaseClient | null = null

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasSupabaseEnv = !!url && !!serviceRole

  if (!hasSupabaseEnv && process.env.NODE_ENV !== "production") {
    console.warn("[diagnostics] Supabase env not set; skipping Supabase init in dev.")
    return null as unknown as SupabaseClient
  }
  if (!hasSupabaseEnv) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    )
  }

  if (!_admin) {
    _admin = createClient(url, serviceRole, { auth: { persistSession: false } })
  }
  return _admin
}

/** Backward-compatible export (old name) */
export function supabaseAdmin() {
  return getSupabaseAdmin()
}
