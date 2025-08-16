"use server"

import { getServerSupabase } from "@/lib/supabase/server-client"
import { createClient } from "@supabase/supabase-js"

type ActionState =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined }
  | undefined

function isSchemaMismatch(msg?: string) {
  return !!msg && /column .* does not exist|schema cache|undefined column/i.test(msg)
}

export async function signup(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = getServerSupabase()
  if (!supabase) return { error: "Supabase not configured." }

  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const pass = String(formData.get("password") || "")
  const company = String(formData.get("company") || "").trim()
  const gstin = String(formData.get("gstin") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const address = String(formData.get("address") || "").trim()

  if (!name || !email || !pass || !company || !gstin || !phone) {
    return { error: "Please fill all required fields." }
  }

  // 1) Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: pass })
  if (authError || !authData?.user) {
    return { error: authError?.message || "Signup failed." }
  }
  const user = authData.user

  // 2) Service-role client to bypass RLS for profiles writes
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return { error: "Server missing Supabase configuration." }
  const admin = createClient(url, serviceKey)

  // 3) Update if profile exists, otherwise insert
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existing?.id) {
    // Try legacy column names
    const legacyUpdate: Record<string, any> = {
      role: "pending",
      full_name: name,
      email,
      company_name: company,
      gst_no: gstin,
      contact_number: phone,
    }
    if (address) legacyUpdate.address = address

    const { error: upd1 } = await admin.from("profiles").update(legacyUpdate).eq("id", user.id)
    if (upd1) {
      if (!isSchemaMismatch(upd1.message)) {
        return { error: `Profile update failed: ${upd1.message}` }
      }
      // Retry with new schema names
      const newUpdate: Record<string, any> = {
        role: "pending",
        full_name: name,
        email,
        company,
        gstin,
        phone,
      }
      if (address) newUpdate.address = address

      const { error: upd2 } = await admin.from("profiles").update(newUpdate).eq("id", user.id)
      if (upd2) {
        return { error: `Profile update failed: ${upd2.message}` }
      }
    }

    return { success: "Kindly check your email for verification." }
  }

  // 4) Insert new profile row
  const base = { id: user.id, email, full_name: name, role: "pending" as const }

  const legacyPayload: Record<string, any> = {
    ...base,
    company_name: company,
    gst_no: gstin,
    contact_number: phone,
  }
  if (address) legacyPayload.address = address

  let { error: ins1 } = await admin.from("profiles").insert(legacyPayload)
  if (ins1) {
    if (!isSchemaMismatch(ins1.message)) {
      return { error: `Signup succeeded, but profile creation failed: ${ins1.message}` }
    }
    // Retry with new schema names
    const newPayload: Record<string, any> = {
      ...base,
      company,
      gstin,
      phone,
    }
    if (address) newPayload.address = address

    const { error: ins2 } = await admin.from("profiles").insert(newPayload)
    if (ins2) {
      return { error: `Signup succeeded, but profile creation failed: ${ins2.message}` }
    }
  }

  return { success: "Registration done. Please verify your email if prompted." }
}
