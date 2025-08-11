"use server"

import { getServerSupabase } from "@/lib/supabase/server-client"
import { createClient } from "@supabase/supabase-js"

type ActionState =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined }
  | undefined

export async function signup(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = getServerSupabase()
  if (!supabase) return { error: "Supabase not configured." }

  const name    = String(formData.get("name") || "").trim()
  const email   = String(formData.get("email") || "").trim().toLowerCase()
  const pass    = String(formData.get("password") || "")
  const company = String(formData.get("company") || "").trim()
  const gstin   = String(formData.get("gstin") || "").trim()
  const phone   = String(formData.get("phone") || "").trim()
  const address = String(formData.get("address") || "").trim()

  if (!name || !email || !pass || !company || !gstin || !phone) {
    return { error: "Please fill all required fields." }
  }

  // 1) Create auth user (anon client)
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: pass })
  if (authError || !authData?.user) {
    return { error: authError?.message || "Signup failed." }
  }
  const user = authData.user

  // 2) Service-role client to bypass RLS for profiles write
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!serviceKey) return { error: "Server missing SUPABASE_SERVICE_ROLE_KEY." }
  const admin = createClient(url, serviceKey)

  // 3) If a row already exists for this id, don't insert again
  const { data: existing } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (existing?.id) {
    // It's already there (from a previous attempt). We're done.
    return {
      success:
        "Registration submitted already. If you just re-signed up, your account is still pending admin approval.",
    }
  }

  // 4) Build payloads for legacy/new schemas
  const base = { id: user.id, email, full_name: name, role: "pending" as const }

  const legacyPayload: Record<string, any> = {
    ...base,
    company_name: company,
    gst_no: gstin,
    contact_number: phone,
  }
  if (address) legacyPayload.address = address

  // Try legacy column names first
  let { error: profileError } = await admin.from("profiles").insert(legacyPayload)

  // If legacy cols don't exist, retry with new names
  if (profileError && /column .* does not exist|schema cache/i.test(profileError.message)) {
    const newPayload: Record<string, any> = {
      ...base,
      company,
      gstin,
      phone,
    }
    if (address) newPayload.address = address

    const { error: profileError2 } = await admin.from("profiles").insert(newPayload)
    if (profileError2) {
      return { error: `Signup succeeded, but profile creation failed: ${profileError2.message}` }
    }
  } else if (profileError) {
    // Not a schema mismatch—bubble up the error
    return { error: `Signup succeeded, but profile creation failed: ${profileError.message}` }
  }

  return {
    success:
      "Registration submitted. Please verify your email if prompted; an admin will approve your account shortly.",
  }
}
