"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server-client"

export async function signup(_: any, formData: FormData) {
  const supabase = createSupabaseServerClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const company = formData.get("company") as string
  const gst = formData.get("gst") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string

  // 1. Sign up the user in Supabase Auth
  const {
    data: authData,
    error: authError
  } = await supabase.auth.signUp({
    email,
    password
  })

  if (authError || !authData.user) {
    return { error: authError?.message || "Signup failed." }
  }

  const user = authData.user

  // 2. Insert user profile into "profiles" table
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email,
    full_name: name,
    company_name: company,
    gst_no: gst,
    contact_number: phone,
    address,
    role: "user",
    approved: false
  })

  if (profileError) {
    return { error: "Signup succeeded, but profile creation failed." }
  }

  return {
    success: "Thank you! Please check your email to verify. Your registration will be approved soon."
  }
}
