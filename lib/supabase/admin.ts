// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js"

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
  return createClient(url, serviceRole)
}
