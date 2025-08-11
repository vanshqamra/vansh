"use server"

import { getServerSupabase } from "@/lib/supabase/server-client"

type ActionState =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined }
  | undefined

export async function signup(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = getServerSupabase()
  if (!supabase) return { error: "Supabase not configured." }

  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")
  const company = String(formData.get("company") || "").trim()
  const gstin = String(formData.get("gstin") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const address = String(formData.get("address") || "").trim()

  if (!name || !email || !password || !company || !gstin || !phone) {
    return { error: "Please fill all required fields." }
  }

  // 1) Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })
  if (authError || !authData?.user) {
    return { error: authError?.message || "Signup failed." }
  }

  const user = authData.user

  // 2) Insert profile with the column names your admin pages expect
  //    role must be one of: 'pending' | 'client' | 'admin' | 'rejected'
  const payload: Record<string, any> = {
    id: user.id,
    email,
    full_name: name,
    company,   // ✅ matches admin pages
    gstin,     // ✅ matches admin pages
    phone,     // ✅ matches admin pages
    role: "pending",
  }
  // If your table has an 'address' column, include it; otherwise omit it
  if (address) payload.address = address

  const { error: profileError } = await supabase.from("profiles").insert(payload)

  if (profileError) {
    // Roll back auth user if you want (optional)
    // await supabase.auth.admin.deleteUser(user.id)  <-- requires service role; skip here
    return { error: `Signup succeeded, but profile creation failed: ${profileError.message}` }
  }

  return {
    success:
      "Registration submitted. Please verify your email if prompted; an admin will approve your account shortly.",
  }
}
