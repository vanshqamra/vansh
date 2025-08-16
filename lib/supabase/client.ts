"use client"

import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasSupabaseEnv = !!url && !!anon

  if (!hasSupabaseEnv && process.env.NODE_ENV !== "production") {
    console.warn("[diagnostics] Supabase env not set; skipping Supabase init in dev.")
    return undefined as unknown as SupabaseClient
  }
  if (!hasSupabaseEnv) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local / Vercel."
    )
  }

  _client = createSupabaseClient(url, anon, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  return _client
}
