// lib/supabase/admin.ts
import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _admin: SupabaseClient | null = null

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase-admin] Missing URL or SERVICE_ROLE; returning null client")
    }
    return null as unknown as SupabaseClient
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
