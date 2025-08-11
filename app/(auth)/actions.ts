"use server"

import { getServerSupabase } from "@/lib/supabase/server-client"

type ActionState =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined }
  | undefined

export async function signup(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = getServerSupabase()
  if (!supabase) return { error: "Supabase not configured." }

  const name   = String(formData.get("name") || "").trim()
  const email  = String(formData.get("email") || "").trim().toLowerCase()
  const pass   = String(formData.get("password") || "")
  const company = String(formData.get("company") || "").trim()
  const gstin   = String(formData.get("gstin") || "").trim()
  const phone   = String(formData.get("phone") || "").trim()
  const address = String(formData.get("address") || "").trim()

  if (!name || !email || !pass || !company || !gstin || !phone) {
    return { error: "Please fill all required fields." }
  }

  // 1) Auth signup
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: pass })
  if (authError || !authData?.user) return { error: authError?.message || "Signup failed." }
  const user = authData.user

  // 2) Try insert with legacy column names first (matches prod)
  const base = { id: user.id, email, full_name: name }
  const legacyPayload: Record<string, any> = {
    ...base,
    company_name: company,
    gst_no: gstin,
    contact_number: phone,
    role: "pending",      // keep role if it exists
  }
  if (address) legacyPayload.address = address

  let { error: profileError } = await supabase.from("profiles").insert(legacyPayload)

  // 3) If legacy columns don't exist, retry with new names
  if (profileError && /column .* does not exist|schema cache/i.test(profileError.message)) {
    const newPayload: Record<string, any> = {
      ...base,
      company,
      gstin,
      phone,
      role: "pending",
    }
    if (address) newPayload.address = address

    const { error: profileError2 } = await supabase.from("profiles").insert(newPayload)
    if (profileError2) {
      return { error: `Signup succeeded, but profile creation failed: ${profileError2.message}` }
    }
  } else if (profileError) {
    return { error: `Signup succeeded, but profile creation failed: ${profileError.message}` }
  }

  return {
    success:
      "Registration submitted. Please verify your email if prompted; an admin will approve your account shortly.",
  }
}
